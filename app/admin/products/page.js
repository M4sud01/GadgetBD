'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

const empty = { name: '', brand: '', description: '', price: '', compareAtPrice: '', stock: '', imageUrl: '', categoryId: '', featured: false };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [err, setErr] = useState('');

  function load() {
    fetch('/api/admin/products').then((r) => r.json()).then((d) => {
      if (d.error) { setErr(d.error); return; }
      setProducts(d.products);
      setCategories(d.categories);
      if (!form.categoryId && d.categories.length) setForm((f) => ({ ...f, categoryId: d.categories[0].id }));
    });
  }
  useEffect(load, []);

  function edit(p) {
    setForm({
      name: p.name, brand: p.brand, description: p.description, price: p.price,
      compareAtPrice: p.compareAtPrice || '', stock: p.stock, imageUrl: p.imageUrl,
      categoryId: p.categoryId, featured: p.featured,
    });
    setEditingId(p.id);
    setShowForm(true);
  }

  async function save(e) {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      stock: Number(form.stock),
    };
    const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
    const method = editingId ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      setForm({ ...empty, categoryId: categories[0]?.id || '' });
      setEditingId(null);
      setShowForm(false);
      load();
    }
  }

  async function del(id) {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <AdminLayout active="products">
      <div className="section-title">
        <h2>Products</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm((v) => !v); setEditingId(null); setForm({ ...empty, categoryId: categories[0]?.id || '' }); }}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>
      {err && <p style={{ color: 'var(--danger)' }}>{err}</p>}

      {showForm && (
        <form onSubmit={save} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label>Brand</label><input required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
            <div className="form-group"><label>Price (৳)</label><input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div className="form-group"><label>Compare-at Price (optional)</label><input type="number" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} /></div>
            <div className="form-group"><label>Stock</label><input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
            <div className="form-group">
              <label>Category</label>
              <select className="status-select" style={{ width: '100%' }} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Image URL</label><input required value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Description</label><textarea rows={2} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, margin: '10px 0' }}>
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured on homepage
          </label>
          <button className="btn btn-primary" type="submit">{editingId ? 'Update Product' : 'Create Product'}</button>
        </form>
      )}

      <table className="admin-table">
        <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.categoryName}</td>
              <td>৳{p.price.toLocaleString()}</td>
              <td>{p.stock}</td>
              <td style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ padding: '4px 10px' }} onClick={() => edit(p)}>Edit</button>
                <button className="btn btn-danger" style={{ padding: '4px 10px' }} onClick={() => del(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
