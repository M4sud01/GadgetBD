'use client';

export default function ProductCard({ p }) {
  const hasDeal = p.compareAtPrice && p.compareAtPrice > p.price;
  const discount = hasDeal ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) : 0;

  return (
    <a href={`/products/${p.slug}`} className="card">
      <div className="card-img">
        {hasDeal && <span className="deal-tag">-{discount}%</span>}
        <img src={p.imageUrl} alt={p.name} onError={(e) => { e.currentTarget.src = 'https://placehold.co/300x300/1a2233/eef1f8?text=' + encodeURIComponent(p.brand || 'Product'); }} />
      </div>
      <div className="card-body">
        <div className="card-brand">{p.brand}</div>
        <div className="card-name">{p.name}</div>
        {p.avgRating != null && (
          <div className="rating-row">
            <span className="stars">{'★'.repeat(Math.round(p.avgRating))}{'☆'.repeat(5 - Math.round(p.avgRating))}</span>
            <span>({p.reviewCount})</span>
          </div>
        )}
        <div className="price-row">
          <span className="price">৳{p.price.toLocaleString()}</span>
          {hasDeal && <span className="price-old">৳{p.compareAtPrice.toLocaleString()}</span>}
        </div>
        {p.stock <= 5 && p.stock > 0 && <span className="stock-warn">Only {p.stock} left</span>}
        {p.stock === 0 && <span className="stock-warn">Out of stock</span>}
      </div>
    </a>
  );
}
