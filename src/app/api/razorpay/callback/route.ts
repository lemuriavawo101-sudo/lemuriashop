import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from '@/lib/db';

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const razorpay_order_id = formData.get('razorpay_order_id') as string;
    const razorpay_payment_id = formData.get('razorpay_payment_id') as string;
    const razorpay_signature = formData.get('razorpay_signature') as string;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      const host = request.headers.get('host') || 'shop.lemuriavawo.org';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      return NextResponse.redirect(new URL('/?error=invalid_callback', `${protocol}://${host}`), { status: 302 });
    }

    // 1. Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      const host = request.headers.get('host') || 'shop.lemuriavawo.org';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      return NextResponse.redirect(new URL('/?error=signature_mismatch', `${protocol}://${host}`), { status: 302 });
    }

    // 2. Fetch Order Details (Notes) to get products/delivery info
    const razorpayOrder = await instance.orders.fetch(razorpay_order_id);
    const notes = razorpayOrder.notes as any;

    if (notes) {
      // 3. Save Order to Database (Idempotent)
      const existing = await db.execute({
        sql: 'SELECT id FROM orders WHERE id = ?',
        args: [razorpay_payment_id]
      });

      if (existing.rows.length === 0) {
        // Parse metadata safely
        const items = notes.items || '[]';
        const delivery = notes.delivery || '{}';
        const customer = notes.customer || 'Anonymous';
        const total = parseFloat(notes.total) || 0;
        const subtotal = parseFloat(notes.subtotal) || 0;
        const tax = parseFloat(notes.tax) || 0;
        const protectFee = parseFloat(notes.protectFee) || 0;
        const shipping = parseFloat(notes.shipping) || 0;
        const uid = notes.uid || null;

        await db.execute({
          sql: 'INSERT INTO orders (id, customer, total, status, date, items, delivery, userId, subtotal, tax, protectFee, shipping) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          args: [
            razorpay_payment_id,
            customer,
            total,
            'Paid',
            new Date().toISOString(),
            typeof items === 'string' ? items : JSON.stringify(items),
            typeof delivery === 'string' ? delivery : JSON.stringify(delivery),
            uid,
            subtotal,
            tax,
            protectFee,
            shipping
          ]
        });
      }
    }

    // 4. Redirect to Success Page
    const host = request.headers.get('host') || 'shop.lemuriavawo.org';
    const protocol = (host.includes('localhost') || host.includes('127.0.0.1')) ? 'http' : 'https';
    
    // ENSURE PRODUCTION DOMAIN for Razorpay handshakes if not local
    const finalHost = (host.includes('localhost') || host.includes('127.0.0.1')) ? host : 'shop.lemuriavawo.org';
    
    const successUrl = new URL('/checkout/success', `${protocol}://${finalHost}`);
    successUrl.searchParams.set('razorpay_payment_id', razorpay_payment_id);
    successUrl.searchParams.set('razorpay_order_id', razorpay_order_id);
    successUrl.searchParams.set('razorpay_signature', razorpay_signature);
    
    console.log('[Acquisition Callback] Final Redirect to:', successUrl.toString());
    return NextResponse.redirect(successUrl, { status: 302 });
  } catch (error: any) {
    console.error('Callback Error:', error);
    const host = request.headers.get('host') || 'shop.lemuriavawo.org';
    const protocol = (host.includes('localhost') || host.includes('127.0.0.1')) ? 'http' : 'https';
    const finalHost = (host.includes('localhost') || host.includes('127.0.0.1')) ? host : 'shop.lemuriavawo.org';
    return NextResponse.redirect(new URL('/?error=callback_failed', `${protocol}://${finalHost}`), { status: 302 });
  }
}
