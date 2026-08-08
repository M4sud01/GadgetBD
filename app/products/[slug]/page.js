'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartStore';

export default function ProductDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const add = useCart((s) => s.add);

  function load() {
    fetch(`/api/products/${slug}`).then((r) => r.json()).then((d) => {
      if (d.product) {
        setProduct(d.product);
        setReviews(d.reviews);
      }
    });
  }
  useEffect(load, [slug]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }

  function addToCart() {
    add(product, qty);
    showToast(`Added ${qty} × ${product.name} to cart`);
  }

  function buyNow() {
    add(product, qty);
    router.push('/cart');
  }

  async function submitReview(e) {
    e.preventDefault();
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, ...reviewForm }),
    });
    if (res.ok) {
      setReviewForm({ rating: 5, comment: '' });
      load();
      showToast('Review submitted!');
    } else {
      const d = await res.json();
      showToast(d.error || 'Failed to submit review');
    }
  }

  if (!product) return <main className="container section"><p style={{ color: 'var(--text-dim)' }}>Loading…</p></main>;

  const hasDeal = product.compareAtPrice && product.compareAtPrice > product.price;
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <main className="container">
      <div className="pd-wrap">
        <div className="pd-img">
          <img src={product.imageUrl} alt={product.name} onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/1a2233/eef1f8?text=' + encodeURIComponent(product.brand); }} />
        </div>
        <div>
          <div className="card-brand">{product.brand} · {product.categoryName}</div>
          <h1 className="pd-title">{product.name}</h1>
          {avgRating && (
            <div className="rating-row">
              <span className="stars">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
              <span>{avgRating} ({reviews.length} reviews)</span>
            </div>
          )}
          <div className="pd-price-row">
            <span className="pd-price">৳{product.price.toLocaleString()}</span>
            {hasDeal && <span className="price-old">৳{product.compareAtPrice.toLocaleString()}</span>}
          </div>
          <p style={{ color: 'var(--text-dim)', lineHeight: 1.6 }}>{product.description}</p>

          {product.stock > 0 ? (
            <p style={{ color: 'var(--success)', fontSize: 13, fontWeight: 600 }}>✓ In Stock ({product.stock} available)</p>
          ) : (
            <p className="stock-warn">Out of stock</p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0' }}>
            <div className="qty-stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" disabled={product.stock === 0} onClick={addToCart}>Add to Cart</button>
            <button className="btn btn-primary" disabled={product.stock === 0} onClick={buyNow}>Buy Now</button>
          </div>

          {Object.keys(product.specs || {}).length > 0 && (
            <table className="spec-table">
              <tbody>
                {Object.entries(product.specs).map(([k, v]) => (
                  <tr key={k}><td>{k}</td><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <section className="section" style={{ maxWidth: 700 }}>
        <h2 style={{ fontSize: 20 }}>Customer Reviews</h2>
        {reviews.length === 0 && <p style={{ color: 'var(--text-dim)' }}>No reviews yet. Be the first!</p>}
        {reviews.map((r) => (
          <div key={r.id} className="review-item">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{r.userName}</strong>
              <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </div>
            <p style={{ color: 'var(--text-dim)', margin: '6px 0 0' }}>{r.comment}</p>
          </div>
        ))}

        <form onSubmit={submitReview} style={{ marginTop: 20 }}>
          <div className="form-group">
            <label>Your Rating</label>
            <select className="status-select" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Star{n > 1 && 's'}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Your Review</label>
            <textarea rows={3} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Share your experience with this product..." required />
          </div>
          <button className="btn btn-primary" type="submit">Submit Review</button>
        </form>
      </section>

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
