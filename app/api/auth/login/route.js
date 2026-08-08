import { NextResponse } from 'next/server';
const { Users } = require('@/lib/models');
const { verifyPassword, signToken, COOKIE_NAME } = require('@/lib/auth');

export async function POST(req) {
  const { email, password } = await req.json();
  const user = Users.byEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }
  const token = signToken(user);
  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 30 });
  return res;
}
