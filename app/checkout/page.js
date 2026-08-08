'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartStore';

const PAY_METHODS = [
  { id: 'COD', label: '💵 Cash on Delivery' },
  { id: 'BKASH', label: '📱 bKash' },
  { id: 'NAGAD', label: '🟠 Nagad' },
  { id: 'CARD', label: '💳 Card' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ shippingName: '', shippingPhone: '', shippingAddress: '', shippingCity: '' });
  const [method, setMethod] = useState('COD');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [payingModal, setPayingModal] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      setUser(d.user);
      if (d.user) setForm((f) => ({ ...f, shippingName: d.user.name }));
    });
  }, []);

  const deliveryFee = form.shippingCity.toLowerCase().includes('dhaka') ? 60 : 120;
  const total = subtotal() + (form.shippingCity ? deliveryFee : 0);

  async function placeOrder(e) {
    e.preventDefault();
    setError('');
    if (!user) {
      setError('Please log in first to place an order.');
      return;
    }
    setPlacing(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        ...form,
        paymentMethod: method,
      }),
    });
    const data = await res.json();
    setPlacing(false);
    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      return;
    }

    if (method === 'BKASH' || method === 'NAGAD') {
      setPayingModal({ orderId: data.order.id, method });
    } else {
      clear();
      router.push(`/orders/${data.order.id}`);
    }
  }

  async function confirmSimulatedPayment() {
    const { orderId } = payingModal;
    await fetch(`/api/orders/${orderId}/pay`, { method: 'POST' });
    setPayingModal(false);
    clear();
    router.push(`/orders/${orderId}`);
  }

  if (items.length === 0 && !payingModal) {
    return <main className="container section"><div className="empty-state">Your cart is empty. <a href="/products" className="btn btn-primary" style={{ marginTop: 12 }}>Shop Now</a></div></main>;
  }

  return (
    <main className="container section">
      <h2>Checkout</h2>
      <form onSubmit={placeOrder} className="checkout-grid" style={{ marginTop: 20 }}>
        <div>
          <h3 style={{ fontSize: 16 }}>Shipping Details</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input required value={form.shippingName} onChange={(e) => setForm({ ...form, shippingName: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input required placeholder="01XXXXXXXXX" value={form.shippingPhone} onChange={(e) => setForm({ ...form, shippingPhone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>City</label>
            <input required placeholder="e.g. Dhaka, Chattogram, Sylhet" value={form.shippingCity} onChange={(e) => setForm({ ...form, shippingCity: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Full Address</label>
            <textarea required rows={3} value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} placeholder="House, Road, Area, Thana" />
          </div>

          <h3 style={{ fontSize: 16, marginTop: 20 }}>Payment Method</h3>
          <div className="pay-options">
            {PAY_METHODS.map((m) => (
              <div key={m.id} className={`pay-option ${method === m.id ? 'active' : ''}`} onClick={() => setMethod(m.id)}>
                {m.label}
              </div>
            ))}
          </div>
          {(method === 'BKASH' || method === 'NAGAD') && (
            <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              You'll be redirected to a {method === 'BKASH' ? 'bKash' : 'Nagad'} payment confirmation step after placing your order.
            </p>
          )}

          {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}
          {!user && <p style={{ color: 'var(--accent)', fontSize: 13 }}>You need to <a href="/account" style={{ textDecoration: 'underline' }}>log in</a> before placing an order.</p>}
        </div>

        <div className="cart-summary">
          <div className="summary-line"><span>Subtotal</span><span>৳{subtotal().toLocaleString()}</span></div>
          <div className="summary-line"><span>Delivery</span><span>{form.shippingCity ? `৳${deliveryFee}` : '—'}</span></div>
          <div className="summary-total"><span>Total</span><span>৳{total.toLocaleString()}</span></div>
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={placing}>
            {placing ? 'Placing Order…' : 'Place Order'}
          </button>
        </div>
      </form>

      {payingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 30, maxWidth: 360, textAlign: 'center' }}>
            <h3>{payingModal.method === 'BKASH' ? '📱 bKash Payment' : '🟠 Nagad Payment'}</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
              This is a simulated gateway for demo purposes. In production this screen is replaced by {payingModal.method === 'BKASH' ? "bKash's" : "Nagad's"} real Tokenized Checkout flow.
            </p>
            <div style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 10, margin: '16px 0', fontSize: 20, fontWeight: 800 }}>
              ৳{total.toLocaleString()}
            </div>
            <button className="btn btn-primary btn-block" onClick={confirmSimulatedPayment}>Confirm Payment</button>
          </div>
        </div>
      )}
    </main>
  );
}
