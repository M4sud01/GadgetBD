'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io } from 'socket.io-client';

const STEPS = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const LABELS = {
  PENDING: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
};

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`).then((r) => r.json()).then((d) => {
      if (d.order) {
        setOrder(d.order);
        setStatus(d.order.status);
      }
    });
  }, [id]);

  useEffect(() => {
    const socket = io('/orders', { path: '/socket.io' });
    socket.emit('track', { orderId: id });
    socket.on('status', (s) => {
      setStatus(s.status);
      setLive(true);
      setTimeout(() => setLive(false), 2000);
    });
    return () => socket.disconnect();
  }, [id]);

  if (!order) return <main className="container section"><p style={{ color: 'var(--text-dim)' }}>Loading order…</p></main>;

  const isCancelled = status === 'CANCELLED';
  const currentIdx = STEPS.indexOf(status);

  return (
    <main className="container section" style={{ maxWidth: 800 }}>
      <div className="section-title">
        <h2>Order #{order.orderNumber}</h2>
        {live && <span className="pill" style={{ color: 'var(--success)', borderColor: 'var(--success)' }}>● Live update received</span>}
      </div>

      {isCancelled ? (
        <p style={{ color: 'var(--danger)', fontWeight: 700 }}>This order has been cancelled.</p>
      ) : (
        <div className="status-track">
          {STEPS.map((s, i) => (
            <div key={s} className={`status-step ${i < currentIdx ? 'done' : i === currentIdx ? 'current' : ''}`}>
              <div className="status-dot">{i < currentIdx ? '✓' : i + 1}</div>
              <div className="status-label">{LABELS[s]}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginTop: 20 }}>
        <h3 style={{ fontSize: 15, marginTop: 0 }}>Shipping To</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: 0 }}>
          {order.shippingName} · {order.shippingPhone}<br />
          {order.shippingAddress}, {order.shippingCity}
        </p>

        <h3 style={{ fontSize: 15, marginTop: 20 }}>Items</h3>
        {order.items.map((it) => (
          <div key={it.id} className="cart-row">
            <img src={it.imageUrl} alt={it.productName} onError={(e) => { e.currentTarget.src = 'https://placehold.co/70x70/1a2233/eef1f8?text=Item'; }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{it.productName}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>Qty {it.quantity} × ৳{it.price.toLocaleString()}</div>
            </div>
          </div>
        ))}

        <div className="summary-line" style={{ marginTop: 12 }}><span>Subtotal</span><span>৳{order.subtotal.toLocaleString()}</span></div>
        <div className="summary-line"><span>Delivery</span><span>৳{order.deliveryFee.toLocaleString()}</span></div>
        <div className="summary-total"><span>Total</span><span>৳{order.total.toLocaleString()}</span></div>
        <div className="summary-line"><span>Payment</span><span>{order.paymentMethod} · {order.paymentStatus}</span></div>
      </div>
    </main>
  );
}
