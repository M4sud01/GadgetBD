import { NextResponse } from 'next/server';
const { Products, Categories } = require('@/lib/models');

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const categorySlug = searchParams.get('category') || undefined;
  const sort = searchParams.get('sort') || undefined;
  const deals = searchParams.get('deals') === '1';
  const products = Products.list({ q, categorySlug, sort, deals });
  return NextResponse.json({ products, categories: Categories.all() });
}
