import { NextResponse } from 'next/server';
const { Reviews } = require('@/lib/models');
const { getUserFromRequest } = require('@/lib/auth');

export async function POST(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Please log in to leave a review.' }, { status: 401 });
  const { productId, rating, comment } = await req.json();
  if (!productId || !rating || !comment) {
    return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
  }
  Reviews.create({ productId, userId: user.id, rating: Number(rating), comment });
  return NextResponse.json({ ok: true });
}
