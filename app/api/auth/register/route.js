import { NextResponse } from 'next/server';
const { Users } = require('@/lib/models');
const { hashPassword, signToken, COOKIE_NAME } = require('@/lib/auth');

export async function POST(req) {
  const body = await req.json();
  const { name, email, password, phone, address, city } = body;
  if (!name || !email || !password || password.length < 6) {
    return NextResponse.json({ error: 'Please provide name, email, and a password of at least 6 characters.' }, { status: 400 });
  }
  if (Users.byEmail(email)) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
  }
  const user = Users.create({ name, email, phone, address, city, passwordHash: hashPassword(password) });
  const token = signToken(user);
  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 30 });
  return res;
}
