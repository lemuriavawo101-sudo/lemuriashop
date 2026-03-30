import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    let data;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      data = {
        razorpay_order_id: formData.get('razorpay_order_id'),
        razorpay_payment_id: formData.get('razorpay_payment_id'),
        razorpay_signature: formData.get('razorpay_signature')
      };
    } else {
      data = await request.json();
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
    
    // Create Hmac
    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!secret) {
      console.error('CRITICAL: RAZORPAY_KEY_SECRET is missing from environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    console.log('--- Razorpay Global Handshake [Absolute Forge] ---');
    console.log('Format Received:', contentType.includes('form') ? 'Form' : 'JSON');
    console.log('Order ID:', razorpay_order_id);
    console.log('Verification SUCCESS:', expectedSignature === razorpay_signature);
    console.log('------------------------------------------------');

    if (expectedSignature === razorpay_signature) {
      // If it's a form post (redirect from Razorpay), we must redirect to success page
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const successURL = new URL('/checkout/success', request.url);
        successURL.searchParams.set('razorpay_payment_id', razorpay_payment_id as string);
        successURL.searchParams.set('razorpay_order_id', razorpay_order_id as string);
        successURL.searchParams.set('razorpay_signature', razorpay_signature as string);
        return NextResponse.redirect(successURL);
      }
      return NextResponse.json({ status: 'verified' });
    } else {
      return NextResponse.json({ status: 'unverified' }, { status: 400 });
    }
  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
