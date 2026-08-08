const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET = process.env.JWT_SECRET || 'dev_secret';
const COOKIE_NAME = 'gb_token';

function hashPassword(pw) {
  return bcrypt.hashSync(pw, 10);
}
function verifyPassword(pw, hash) {
  return bcrypt.compareSync(pw, hash);
}
function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, SECRET, {
    expiresIn: '30d',
  });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
function getUserFromRequest(req) {
  const cookie = req.headers.get ? req.headers.get('cookie') : req.headers.cookie;
  if (!cookie) return null;
  const match = cookie.split(';').map((s) => s.trim()).find((s) => s.startsWith(COOKIE_NAME + '='));
  if (!match) return null;
  const token = match.split('=')[1];
  return verifyToken(token);
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, getUserFromRequest, COOKIE_NAME };
