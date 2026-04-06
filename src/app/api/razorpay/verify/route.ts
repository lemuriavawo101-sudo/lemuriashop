import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

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
        razorpay_signature: formData.get('razorpay_signature'),
        // No metadata in form post, callback handled this
      };
    } else {
      data = await request.json();
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, metadata } = data;
    
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

    const signatureMatch = expectedSignature === razorpay_signature;

    console.log('--- Razorpay Global Handshake [Absolute Forge] ---');
    console.log('Order ID:', razorpay_order_id);
    console.log('Verification Success:', signatureMatch);

    // PERSISTENCE FALLBACK: If signature matches and we have metadata, save to DB
    if (signatureMatch && metadata) {
      console.log('[Acquisition Verify] Triggering Persistence Fallback...');
      try {
        const existing = await db.execute({
          sql: 'SELECT id FROM orders WHERE id = ?',
          args: [razorpay_payment_id]
        });

        if (existing.rows.length === 0) {
          await db.execute({
            sql: 'INSERT INTO orders (id, customer, total, status, date, items, delivery, userId, subtotal, tax, protectFee, shipping) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            args: [
              razorpay_payment_id,
              metadata.customer || 'Payer',
              metadata.total || 0,
              'Paid',
              new Date().toISOString(),
              metadata.items || '[]',
              metadata.delivery || '{}',
              metadata.uid || null,
              metadata.subtotal || 0,
              metadata.tax || 0,
              metadata.protectFee || 0,
              metadata.shipping || 0
            ]
          });
          console.log('[Acquisition Verify] Sanctuary Persistence SUCCESS.');
        } else {
          console.log('[Acquisition Verify] Order already logged. Skipping.');
        }
      } catch (dbErr) {
        console.error('[Acquisition Verify] Sanctuary DB Error:', dbErr);
        // We don't fail the verification if DB fails, as the payment is still verified
      }
    }

    if (signatureMatch) {
      // If it's a form post (redirect from Razorpay), we must redirect to success page
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const host = request.headers.get('host') || 'shop.lemuriavawo.org';
        const protocol = (host.includes('localhost') || host.includes('127.0.0.1')) ? 'http' : 'https';
        const finalHost = (host.includes('localhost') || host.includes('127.0.0.1')) ? host : 'shop.lemuriavawo.org';
        
        const successURL = new URL('/checkout/success', `${protocol}://${finalHost}`);
        successURL.searchParams.set('razorpay_payment_id', razorpay_payment_id as string);
        successURL.searchParams.set('razorpay_order_id', razorpay_order_id as string);
        successURL.searchParams.set('razorpay_signature', razorpay_signature as string);
        return NextResponse.redirect(successURL.toString(), { status: 302 });
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
