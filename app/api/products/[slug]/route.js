import { NextResponse } from 'next/server';
const { Products, Reviews } = require('@/lib/models');

export async function GET(req, { params }) {
  const product = Products.bySlug(params.slug);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const reviews = Reviews.forProduct(product.id);
  return NextResponse.json({ product, reviews });
}
