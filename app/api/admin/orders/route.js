import { NextResponse } from 'next/server';
const { Orders } = require('@/lib/models');
const { getUserFromRequest } = require('@/lib/auth');

export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ orders: Orders.all() });
}
