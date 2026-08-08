// lib/db.js
// Lightweight data layer using Node's built-in `node:sqlite`.
// NOTE: For production at scale, swap this for Postgres + an ORM (Prisma/Drizzle) —
// the query functions below are already isolated in one file, so that swap only
// touches this module, not the rest of the app.
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(process.cwd(), 'data', 'gadgetbd.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CUSTOMER',
  address TEXT,
  city TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  compareAtPrice INTEGER,
  stock INTEGER NOT NULL DEFAULT 0,
  imageUrl TEXT NOT NULL,
  images TEXT NOT NULL DEFAULT '[]',
  specs TEXT NOT NULL DEFAULT '{}',
  featured INTEGER NOT NULL DEFAULT 0,
  categoryId TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(categoryId);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  productId TEXT NOT NULL,
  userId TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (productId) REFERENCES products(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(productId);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  orderNumber TEXT UNIQUE NOT NULL,
  userId TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  deliveryFee INTEGER NOT NULL DEFAULT 60,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  paymentMethod TEXT NOT NULL DEFAULT 'COD',
  paymentStatus TEXT NOT NULL DEFAULT 'UNPAID',
  paymentTxnId TEXT,
  shippingName TEXT NOT NULL,
  shippingPhone TEXT NOT NULL,
  shippingAddress TEXT NOT NULL,
  shippingCity TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  productId TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (productId) REFERENCES products(id)
);
CREATE INDEX IF NOT EXISTS idx_orderitems_order ON order_items(orderId);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  roomId TEXT NOT NULL,
  userId TEXT,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_chat_room ON chat_messages(roomId);
`);

module.exports = db;
