import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const runtime = 'nodejs';

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_secret) {
  console.error('CRITICAL: Razorpay environment variables (KEY_ID or KEY_SECRET) are missing. Acquisition Sanctuary is offline.');
}

const instance = new Razorpay({
  key_id: key_id || '',
  key_secret: key_secret || '',
});

export async function POST(request: Request) {
  try {
    const { amount, notes } = await request.json();
    
    // DEEP SCRUB: Final Server-Side check for localhost leaks
    const sanitizedNotes = JSON.parse(JSON.stringify(notes || {}));
    Object.keys(sanitizedNotes).forEach(key => {
      if (typeof sanitizedNotes[key] === 'string') {
        sanitizedNotes[key] = sanitizedNotes[key].replace(/http:\/\/localhost:\d+/g, '');
      }
    });

    const options = {
      amount: Math.round(amount * 100), // in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: sanitizedNotes
    };

    const order = await instance.orders.create(options);
    console.log('--- Razorpay Order CREATED with Sanctuary Notes ---');
    console.log('ID:', order.id);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
  }
}
