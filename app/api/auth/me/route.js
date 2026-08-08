import { NextResponse } from 'next/server';
const { getUserFromRequest } = require('@/lib/auth');

export async function GET(req) {
  const user = getUserFromRequest(req);
  return NextResponse.json({ user });
}
