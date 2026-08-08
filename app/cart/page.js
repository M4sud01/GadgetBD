'use client';
import { useCart } from '@/lib/cartStore';

export default function CartPage() {
  const { items, updateQty, remove, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <main className="container section">
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p>Browse our gadgets and add something you love.</p>
          <a href="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Start Shopping</a>
        </div>
      </main>
    );
  }

  return (
    <main className="container section">
      <h2>Your Cart ({items.length} items)</h2>
      <div className="checkout-grid" style={{ marginTop: 20 }}>
        <div>
          {items.map((i) => (
            <div key={i.productId} className="cart-row">
              <img src={i.imageUrl} alt={i.name} onError={(e) => { e.currentTarget.src = 'https://placehold.co/70x70/1a2233/eef1f8?text=Item'; }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{i.name}</div>
                <div style={{ color: 'var(--brand)', fontWeight: 700, marginTop: 4 }}>৳{i.price.toLocaleString()}</div>
              </div>
              <div className="qty-stepper">
                <button onClick={() => updateQty(i.productId, i.quantity - 1)}>−</button>
                <span>{i.quantity}</span>
                <button onClick={() => updateQty(i.productId, i.quantity + 1)}>+</button>
              </div>
              <button className="btn btn-secondary" onClick={() => remove(i.productId)}>Remove</button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <div className="summary-line"><span>Subtotal</span><span>৳{subtotal().toLocaleString()}</span></div>
          <div className="summary-line"><span>Delivery</span><span>Calculated at checkout</span></div>
          <div className="summary-total"><span>Total</span><span>৳{subtotal().toLocaleString()}+</span></div>
          <a href="/checkout" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>Proceed to Checkout</a>
        </div>
      </div>
    </main>
  );
}
