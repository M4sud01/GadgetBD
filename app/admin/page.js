'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminHome() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/admin/stats').then((r) => r.json()).then(setStats);
  }, []);

  return (
    <AdminLayout active="dashboard">
      <h2>Dashboard</h2>
      {stats && !stats.error ? (
        <div className="stat-cards">
          <div className="stat-card"><div className="val">৳{stats.revenue.toLocaleString()}</div><div className="lbl">Total Revenue</div></div>
          <div className="stat-card"><div className="val">{stats.orderCount}</div><div className="lbl">Total Orders</div></div>
          <div className="stat-card"><div className="val">{stats.productCount}</div><div className="lbl">Products</div></div>
          <div className="stat-card"><div className="val">{stats.pending}</div><div className="lbl">Pending Orders</div></div>
        </div>
      ) : (
        <p style={{ color: 'var(--danger)' }}>{stats?.error || 'Loading…'}</p>
      )}
      <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
        Manage your catalog under <a href="/admin/products" style={{ color: 'var(--brand)' }}>Products</a> and fulfil orders under <a href="/admin/orders" style={{ color: 'var(--brand)' }}>Orders</a>.
      </p>
    </AdminLayout>
  );
}
