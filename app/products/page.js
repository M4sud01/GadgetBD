'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
  return (
    <Suspense fallback={<main className="container section"><p style={{ color: 'var(--text-dim)' }}>Loading…</p></main>}>
      <ProductsInner />
    </Suspense>
  );
}

function ProductsInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || '';

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    if (category) qs.set('category', category);
    if (sort) qs.set('sort', sort);
    fetch(`/api/products?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products);
        setCategories(d.categories);
        setLoading(false);
      });
  }, [q, category, sort]);

  function setParam(key, value) {
    const qs = new URLSearchParams(params.toString());
    if (value) qs.set(key, value);
    else qs.delete(key);
    router.push(`/products?${qs.toString()}`);
  }

  return (
    <main className="container section">
      <div className="section-title">
        <h2>{q ? `Results for "${q}"` : category ? categories.find((c) => c.slug === category)?.name || 'Products' : 'All Products'}</h2>
        <select className="status-select" value={sort} onChange={(e) => setParam('sort', e.target.value)}>
          <option value="">Sort: Featured</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <div className="cat-row">
        <button className={`cat-chip ${!category ? 'active' : ''}`} onClick={() => setParam('category', '')}>All</button>
        {categories.map((c) => (
          <button key={c.id} className={`cat-chip ${category === c.slug ? 'active' : ''}`} onClick={() => setParam('category', c.slug)}>
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-dim)' }}>Loading…</p>
      ) : products.length === 0 ? (
        <div className="empty-state">No products found. Try a different search or category.</div>
      ) : (
        <div className="grid" style={{ marginTop: 20 }}>
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </main>
  );
}
