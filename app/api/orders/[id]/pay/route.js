import { NextResponse } from 'next/server';
const { Orders } = require('@/lib/models');
const { getUserFromRequest } = require('@/lib/auth');

// -----------------------------------------------------------------------
// STUB PAYMENT CONFIRMATION
// This simulates a successful bKash/Nagad payment callback so the checkout
// flow works end-to-end in development. To go live:
//   1. Register as a merchant with bKash (developer.bkash.com) or Nagad.
//   2. Replace the block below with a real call to their Tokenized
//      Checkout / Create Payment API, then verify the callback signature
//      they send to your webhook before marking the order paid.
//   3. Never trust a client-supplied "success" flag for a real integration —
//      always verify server-to-server with the gateway.
// -----------------------------------------------------------------------
export async function POST(req, { params }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const order = Orders.byId(params.id);
  if (!order || order.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const simulatedTxnId = 'SIM' + Math.random().toString(36).slice(2, 10).toUpperCase();
  const updated = Orders.markPaid(params.id, simulatedTxnId);

  return NextResponse.json({ order: updated, txnId: simulatedTxnId });
}
