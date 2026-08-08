'use client';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then((d) => {
      setCategories(d.categories);
      setFeatured(d.products.filter((p) => p.featured).slice(0, 8));
    });
    fetch('/api/products?deals=1').then((r) => r.json()).then((d) => setDeals(d.products.slice(0, 4)));
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <h1>Bangladesh's gadget store,<br />reimagined for speed.</h1>
            <p>Genuine smartphones, laptops, and accessories — real-time order tracking, live chat support, and bKash/Nagad/COD payments.</p>
            <div className="badge-row">
              <span className="pill">🚚 Delivery all over Bangladesh</span>
              <span className="pill">✅ 100% Authentic Products</span>
              <span className="pill">💬 Live Support</span>
            </div>
            <div style={{ marginTop: 22, display: 'flex', gap: 12 }}>
              <a href="/products" className="btn btn-primary">Shop Now</a>
              <a href="/deals" className="btn btn-secondary">🔥 Today's Deals</a>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="section">
          <div className="cat-row">
            {categories.map((c) => (
              <a key={c.id} href={`/products?category=${c.slug}`} className="cat-chip">{c.name}</a>
            ))}
          </div>
        </section>

        {deals.length > 0 && (
          <section className="section">
            <div className="section-title">
              <h2>🔥 Today's Deals</h2>
              <a href="/deals">See all deals →</a>
            </div>
            <div className="grid">
              {deals.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </section>
        )}

        <section className="section">
          <div className="section-title">
            <h2>Featured Gadgets</h2>
            <a href="/products">View all →</a>
          </div>
          <div className="grid">
            {featured.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
          {featured.length === 0 && <p style={{ color: 'var(--text-dim)' }}>Loading products…</p>}
        </section>
      </div>
    </main>
  );
}
