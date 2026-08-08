import { NextResponse } from 'next/server';
const { Products } = require('@/lib/models');
const { getUserFromRequest } = require('@/lib/auth');

function requireAdmin(req) {
  const user = getUserFromRequest(req);
  return user && user.role === 'ADMIN' ? user : null;
}

export async function PATCH(req, { params }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const product = Products.update(params.id, body);
  return NextResponse.json({ product });
}

export async function DELETE(req, { params }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  Products.remove(params.id);
  return NextResponse.json({ ok: true });
}
