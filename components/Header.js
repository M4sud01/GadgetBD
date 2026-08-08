'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartStore';

export default function Header() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [user, setUser] = useState(null);
  const count = useCart((s) => s.count());

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.user)).catch(() => {});
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    router.push(`/products?q=${encodeURIComponent(q)}`);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  }

  return (
    <header className="header">
      <div className="header-inner">
        <a href="/" className="logo">
          <span className="flag" /> GadgetBD
        </a>
        <form className="search-bar" onSubmit={submitSearch}>
          <input
            placeholder="Search phones, laptops, earbuds..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <nav className="nav-links">
          <a href="/products">Shop</a>
          <a href="/deals">Deals</a>
          {user?.role === 'ADMIN' && <a href="/admin">Admin</a>}
          {user ? (
            <>
              <a href="/account">Hi, {user.name.split(' ')[0]}</a>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <a href="/account">Login</a>
          )}
          <a href="/cart" className="cart-badge">
            🛒 Cart {count > 0 && <span className="cart-count">{count}</span>}
          </a>
        </nav>
      </div>
    </header>
  );
}
