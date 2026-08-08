import { NextResponse } from 'next/server';
const { Orders } = require('@/lib/models');
const { getUserFromRequest } = require('@/lib/auth');

export async function GET(req, { params }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const order = Orders.byId(params.id);
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (order.userId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json({ order });
}

export async function PATCH(req, { params }) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { status } = await req.json();
  const order = Orders.updateStatus(params.id, status);

  // Broadcast the update to anyone tracking this order in real time.
  if (global.__io) {
    global.__io.of('/orders').to(`order:${params.id}`).emit('status', {
      status: order.status,
      updatedAt: order.updatedAt,
    });
  }
  return NextResponse.json({ order });
}
