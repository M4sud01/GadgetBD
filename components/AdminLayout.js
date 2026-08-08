'use client';
export default function AdminLayout({ active, children }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <a href="/admin" className={active === 'dashboard' ? 'active' : ''}>📊 Dashboard</a>
        <a href="/admin/products" className={active === 'products' ? 'active' : ''}>📦 Products</a>
        <a href="/admin/orders" className={active === 'orders' ? 'active' : ''}>🧾 Orders</a>
        <a href="/" style={{ marginTop: 20 }}>← Back to Store</a>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
