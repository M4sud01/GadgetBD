# GadgetBD — Real-Time Tech Gadget E-Commerce Platform (Bangladesh)

A full-stack e-commerce platform built with **Next.js 14 (App Router)**, a built-in
**SQLite** database (Node's native `node:sqlite` — zero external DB server needed to
run locally), and **Socket.io** for real-time features.

## LIVE
- **[SITE](https://gadget-bd.vercel.app/)**

## Features implemented
- 🛍️ Product catalog with search, category filters, and sorting
- 🏷️ Deals page with automatic discount badges (compare-at pricing)
- ⭐ Product reviews & ratings
- 🛒 Persistent cart (client-side, survives refresh)
- 💳 Checkout with **Cash on Delivery, bKash, Nagad, and Card** — bKash/Nagad
  use a clearly-marked simulated gateway screen (see "Going live" below)
- 📦 **Real-time order tracking** — when an admin updates an order's status, the
  customer's tracking page updates instantly via WebSocket, no refresh needed
- 💬 **Live chat widget** — real-time customer support chat via Socket.io
- 🔐 Authentication (JWT in httpOnly cookies), customer accounts & order history
- 🛠️ Admin dashboard — stats, product CRUD, order management with live status push
- 🇧🇩 Bangladesh-specific touches: BDT (৳) currency, Dhaka vs. outside-Dhaka delivery
  fees, bKash/Nagad payment options, realistic BD gadget catalog

## Getting started

```bash
npm install
npm run seed     # populates the database with categories, products, and demo users
node lib/add-uploaded-products.js   # adds 10 extra real-world products (VR headset, headphones, smartwatch, etc.)
npm run dev      # starts the app (custom server.js, includes Socket.io) on :3000
```

Visit http://localhost:3000

**Demo accounts** (created by the seed script):
- Admin: `admin@gadgetbd.com` / `admin123` → visit `/admin`
- Customer: `customer@gadgetbd.com` / `customer123`

To wipe and reseed: delete `data/gadgetbd.db*` and run `npm run seed` again.

## Project structure
```
app/                  Next.js App Router pages + API routes
  api/                 REST endpoints (auth, products, orders, reviews, admin)
  products/, cart/, checkout/, orders/[id]/, account/, admin/
components/           Header, ProductCard, ChatWidget, AdminLayout
lib/
  db.js                Database connection + schema (node:sqlite)
  models.js            All queries, grouped by entity (Users, Products, Orders, ...)
  auth.js              JWT + bcrypt helpers
  cartStore.js          Zustand cart store (persisted to localStorage)
  seed.js              Demo data seed script
server.js              Custom server wiring Socket.io onto Next.js (chat + order tracking)
```

## Going to production — what you need to change

This is a **fully functional, working codebase**, but three things are stubbed
because they require real credentials only you can obtain:

1. **Database**: currently SQLite via `node:sqlite` (great for development, fine for
   low-medium traffic). For production at scale, swap to Postgres/MySQL. Because all
   queries live in `lib/models.js`, this is the only file you'd need to rewrite —
   nothing else in the app touches the database directly.
2. **bKash / Nagad payments**: `app/api/orders/[id]/pay/route.js` currently
   simulates a successful payment so checkout works end-to-end in the demo. To go
   live: register as a merchant at developer.bkash.com (or Nagad's merchant portal),
   then replace that route with their real Tokenized Checkout / Create Payment API
   call, and verify their webhook callback server-side before marking an order paid.
3. **Hosting & domain**: deploy `server.js` (not just `next build`) to a Node host
   that supports long-lived WebSocket connections (e.g. a VPS, Render, Railway, or
   Fly.io — not a serverless-only platform, since Socket.io needs a persistent
   process). Point your domain at it and set `JWT_SECRET` to a strong random value
   in production.

Everything else — catalog, cart, checkout flow, real-time tracking, live chat,
reviews, and the admin dashboard — works today, no extra setup required.
