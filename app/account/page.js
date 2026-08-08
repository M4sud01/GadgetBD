'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(undefined);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '', city: '' });
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);

  function loadUser() {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.user));
  }
  useEffect(loadUser, []);

  useEffect(() => {
    if (user) fetch('/api/orders').then((r) => r.json()).then((d) => setOrders(d.orders || []));
  }, [user]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    loadUser();
    router.refresh();
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.refresh();
  }

  if (user === undefined) return null;

  if (!user) {
    return (
      <main className="container">
        <div className="auth-card">
          <h2>{mode === 'login' ? 'Log In' : 'Create Account'}</h2>
          <form onSubmit={submit}>
            {mode === 'register' && (
              <div className="form-group">
                <label>Full Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Dhaka" />
                </div>
              </>
            )}
            {error && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}
            <button className="btn btn-primary btn-block" type="submit">{mode === 'login' ? 'Log In' : 'Sign Up'}</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-dim)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} style={{ color: 'var(--brand)' }}>
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </a>
          </p>
          {mode === 'login' && (
            <p style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'var(--text-dim)' }}>
              Demo admin: admin@gadgetbd.com / admin123<br />Demo customer: customer@gadgetbd.com / customer123
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="container section">
      <div className="section-title">
        <h2>My Account</h2>
        <button className="btn btn-secondary" onClick={logout}>Logout</button>
      </div>
      <p style={{ color: 'var(--text-dim)' }}>{user.name} · {user.email}</p>

      <h3 style={{ marginTop: 30 }}>Order History</h3>
      {orders.length === 0 ? (
        <p style={{ color: 'var(--text-dim)' }}>No orders yet.</p>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Order #</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.orderNumber}</td>
                <td>৳{o.total.toLocaleString()}</td>
                <td>{o.status}</td>
                <td>{o.paymentMethod} · {o.paymentStatus}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td><a href={`/orders/${o.id}`} className="btn btn-secondary" style={{ padding: '6px 12px' }}>Track</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
