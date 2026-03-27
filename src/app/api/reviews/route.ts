import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const reviewsPath = path.join(process.cwd(), 'src/data/reviews.json');

async function getReviews() {
  const data = await fs.readFile(reviewsPath, 'utf8');
  return JSON.parse(data);
}

async function saveReviews(reviews: any[]) {
  await fs.writeFile(reviewsPath, JSON.stringify(reviews, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  
  try {
    const reviews = await getReviews();
    if (productId) {
      const filtered = reviews.filter((r: any) => r.productId === parseInt(productId));
      return NextResponse.json(filtered);
    }
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, userName, userEmail, rating, comment } = body;

    if (!productId || !userName || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reviews = await getReviews();
    const newReview = {
      id: Date.now(),
      productId,
      userName,
      userEmail,
      rating,
      comment,
      date: new Date().toISOString()
    };

    reviews.push(newReview);
    await saveReviews(reviews);

    return NextResponse.json(newReview);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
