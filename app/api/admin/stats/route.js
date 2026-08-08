import { NextResponse } from 'next/server';
const db = require('@/lib/db');
const { getUserFromRequest } = require('@/lib/auth');

export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const revenue = db.prepare(`SELECT COALESCE(SUM(total),0) as v FROM orders WHERE paymentStatus='PAID' OR paymentMethod='COD'`).get().v;
  const orderCount = db.prepare(`SELECT COUNT(*) as v FROM orders`).get().v;
  const productCount = db.prepare(`SELECT COUNT(*) as v FROM products`).get().v;
  const userCount = db.prepare(`SELECT COUNT(*) as v FROM users`).get().v;
  const pending = db.prepare(`SELECT COUNT(*) as v FROM orders WHERE status='PENDING'`).get().v;

  return NextResponse.json({ revenue, orderCount, productCount, userCount, pending });
}
