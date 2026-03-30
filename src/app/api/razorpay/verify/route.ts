import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
    
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

    console.log('--- Razorpay Verification ---');
    console.log('Order ID:', razorpay_order_id);
    console.log('Payment ID:', razorpay_payment_id);
    console.log('Received Signature:', razorpay_signature);
    console.log('Expected Signature:', expectedSignature);
    console.log('-----------------------------');

    if (expectedSignature === razorpay_signature) {
      console.log('Verification SUCCESS');
      return NextResponse.json({ status: 'verified' });
    } else {
      console.warn('Verification FAILED: Signature mismatch');
      return NextResponse.json({ status: 'unverified' }, { status: 400 });
    }
  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
