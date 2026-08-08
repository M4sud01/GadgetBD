import { NextResponse } from 'next/server';
const { Orders } = require('@/lib/models');
const { getUserFromRequest } = require('@/lib/auth');

export async function POST(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Please log in to place an order.' }, { status: 401 });

  const body = await req.json();
  const { items, shippingName, shippingPhone, shippingAddress, shippingCity, paymentMethod } = body;

  if (!items || !items.length) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  }
  if (!shippingName || !shippingPhone || !shippingAddress || !shippingCity) {
    return NextResponse.json({ error: 'Please fill in all shipping details.' }, { status: 400 });
  }

  const order = Orders.create({
    userId: user.id,
    items,
    shippingName,
    shippingPhone,
    shippingAddress,
    shippingCity,
    paymentMethod: paymentMethod || 'COD',
  });

  return NextResponse.json({ order });
}

export async function GET(req) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ orders: Orders.byUser(user.id) });
}
