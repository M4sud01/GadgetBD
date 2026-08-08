'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCart = create(
  persist(
    (set, get) => ({
      items: [], // { productId, name, price, imageUrl, quantity, stock }
      add(product, qty = 1) {
        const items = [...get().items];
        const idx = items.findIndex((i) => i.productId === product.id);
        if (idx >= 0) {
          items[idx] = { ...items[idx], quantity: Math.min(items[idx].quantity + qty, product.stock) };
        } else {
          items.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            stock: product.stock,
            quantity: Math.min(qty, product.stock),
          });
        }
        set({ items });
      },
      updateQty(productId, qty) {
        const items = get().items
          .map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) } : i))
          .filter((i) => i.quantity > 0);
        set({ items });
      },
      remove(productId) {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      clear() {
        set({ items: [] });
      },
      subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
      count() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    { name: 'gadgetbd-cart' }
  )
);
