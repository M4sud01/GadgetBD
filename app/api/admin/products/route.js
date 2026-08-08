import { NextResponse } from 'next/server';
const { Products, Categories } = require('@/lib/models');
const { getUserFromRequest } = require('@/lib/auth');

function requireAdmin(req) {
  const user = getUserFromRequest(req);
  return user && user.role === 'ADMIN' ? user : null;
}

export async function GET(req) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ products: Products.list({ limit: 500 }), categories: Categories.all() });
}

export async function POST(req) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = Products.create({ ...body, slug });
  return NextResponse.json({ id });
}
