import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();
    
    const options = {
      amount: Math.round(amount * 100), // in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    console.log('--- Razorpay Order CREATED ---');
    console.log('ID:', order.id);
    console.log('Amount:', order.amount);
    console.log('------------------------------');
    return NextResponse.json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
  }
}
