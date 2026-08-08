'use client';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';

export default function DealsPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('/api/products?deals=1').then((r) => r.json()).then((d) => setProducts(d.products));
  }, []);

  return (
    <main className="container section">
      <div className="section-title">
        <h2>🔥 Today's Deals</h2>
      </div>
      <p style={{ color: 'var(--text-dim)', marginBottom: 20 }}>
        Compare original vs. discounted prices at a glance — save more with GadgetBD deals.
      </p>
      {products.length === 0 ? (
        <div className="empty-state">No active deals right now. Check back soon!</div>
      ) : (
        <div className="grid">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </main>
  );
}
