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
      return NextResponse.redirect(new URL('/?error=invalid_callback', request.url), { status: 302 });
    }

    // 1. Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.redirect(new URL('/?error=signature_mismatch', request.url), { status: 302 });
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
        await db.execute({
          sql: 'INSERT INTO orders (id, customer, total, status, date, items, delivery) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: [
            razorpay_payment_id,
            notes.customer || 'Anonymous',
            notes.total || 0,
            'Paid',
            new Date().toISOString(),
            notes.items || '[]',
            notes.delivery || '{}'
          ]
        });
      }
    }

    // 4. Redirect to Success Page
    const successUrl = new URL('/checkout/success', request.url);
    successUrl.searchParams.set('razorpay_payment_id', razorpay_payment_id);
    successUrl.searchParams.set('razorpay_order_id', razorpay_order_id);
    successUrl.searchParams.set('razorpay_signature', razorpay_signature);
    
    return NextResponse.redirect(successUrl, { status: 302 });
  } catch (error: any) {
    console.error('Callback Error:', error);
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url), { status: 302 });
  }
}
