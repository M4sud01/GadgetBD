'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

const STATUSES = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState('');

  function load() {
    fetch('/api/admin/orders').then((r) => r.json()).then((d) => {
      if (d.error) { setErr(d.error); return; }
      setOrders(d.orders);
    });
  }
  useEffect(load, []);

  async function updateStatus(id, status) {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
  }

  return (
    <AdminLayout active="orders">
      <h2>Orders</h2>
      {err && <p style={{ color: 'var(--danger)' }}>{err}</p>}
      <table className="admin-table">
        <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.orderNumber}</td>
              <td>{o.customerName}</td>
              <td>৳{o.total.toLocaleString()}</td>
              <td>{o.paymentMethod} · {o.paymentStatus}</td>
              <td>
                <select className="status-select" value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && !err && <p style={{ color: 'var(--text-dim)' }}>No orders yet.</p>}
      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 16 }}>
        Changing a status pushes a live update instantly to the customer's order tracking page via WebSocket.
      </p>
    </AdminLayout>
  );
}
