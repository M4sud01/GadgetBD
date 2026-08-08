// lib/models.js — query helpers built on lib/db.js
const db = require('./db');
const { nanoid } = require('nanoid');

function row(stmt, params = []) {
  return stmt.get(...params) || null;
}
function all(stmt, params = []) {
  return stmt.all(...params);
}

// ---------- Users ----------
const Users = {
  create({ name, email, phone, passwordHash, role = 'CUSTOMER', address, city }) {
    const id = nanoid();
    db.prepare(
      `INSERT INTO users (id,name,email,phone,passwordHash,role,address,city) VALUES (?,?,?,?,?,?,?,?)`
    ).run(id, name, email, phone || null, passwordHash, role, address || null, city || null);
    return Users.byId(id);
  },
  byEmail(email) {
    return row(db.prepare(`SELECT * FROM users WHERE email = ?`), [email]);
  },
  byId(id) {
    return row(db.prepare(`SELECT * FROM users WHERE id = ?`), [id]);
  },
};

// ---------- Categories ----------
const Categories = {
  all() {
    return all(db.prepare(`SELECT * FROM categories ORDER BY name`));
  },
  create({ name, slug }) {
    const id = nanoid();
    db.prepare(`INSERT INTO categories (id,name,slug) VALUES (?,?,?)`).run(id, name, slug);
    return id;
  },
  bySlug(slug) {
    return row(db.prepare(`SELECT * FROM categories WHERE slug = ?`), [slug]);
  },
};

// ---------- Products ----------
function parseProduct(p) {
  if (!p) return p;
  return {
    ...p,
    featured: !!p.featured,
    images: JSON.parse(p.images || '[]'),
    specs: JSON.parse(p.specs || '{}'),
  };
}

const Products = {
  create(p) {
    const id = nanoid();
    db.prepare(
      `INSERT INTO products (id,name,slug,brand,description,price,compareAtPrice,stock,imageUrl,images,specs,featured,categoryId)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(
      id, p.name, p.slug, p.brand, p.description, p.price,
      p.compareAtPrice || null, p.stock || 0, p.imageUrl,
      JSON.stringify(p.images || []), JSON.stringify(p.specs || {}),
      p.featured ? 1 : 0, p.categoryId
    );
    return id;
  },
  list({ q, categorySlug, sort, deals, limit = 60, offset = 0 } = {}) {
    let sql = `SELECT p.*, c.name as categoryName, c.slug as categorySlug,
                (SELECT AVG(rating) FROM reviews r WHERE r.productId = p.id) as avgRating,
                (SELECT COUNT(*) FROM reviews r WHERE r.productId = p.id) as reviewCount
                FROM products p JOIN categories c ON c.id = p.categoryId WHERE 1=1`;
    const params = [];
    if (q) {
      sql += ` AND (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)`;
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    if (categorySlug) {
      sql += ` AND c.slug = ?`;
      params.push(categorySlug);
    }
    if (deals) {
      sql += ` AND p.compareAtPrice IS NOT NULL AND p.compareAtPrice > p.price`;
    }
    if (sort === 'price_asc') sql += ` ORDER BY p.price ASC`;
    else if (sort === 'price_desc') sql += ` ORDER BY p.price DESC`;
    else if (sort === 'newest') sql += ` ORDER BY p.createdAt DESC`;
    else sql += ` ORDER BY p.featured DESC, p.createdAt DESC`;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    return all(db.prepare(sql), params).map(parseProduct);
  },
  bySlug(slug) {
    const p = row(
      db.prepare(`SELECT p.*, c.name as categoryName, c.slug as categorySlug
                  FROM products p JOIN categories c ON c.id = p.categoryId WHERE p.slug = ?`),
      [slug]
    );
    return parseProduct(p);
  },
  byId(id) {
    return parseProduct(row(db.prepare(`SELECT * FROM products WHERE id = ?`), [id]));
  },
  decrementStock(id, qty) {
    db.prepare(`UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?`).run(qty, id);
  },
  update(id, p) {
    db.prepare(
      `UPDATE products SET name=?,brand=?,description=?,price=?,compareAtPrice=?,stock=?,imageUrl=?,featured=?,categoryId=?
       WHERE id=?`
    ).run(
      p.name, p.brand, p.description, p.price, p.compareAtPrice || null, p.stock,
      p.imageUrl, p.featured ? 1 : 0, p.categoryId, id
    );
    return Products.byId(id);
  },
  remove(id) {
    db.prepare(`DELETE FROM products WHERE id = ?`).run(id);
  },
  featured(limit = 8) {
    return all(
      db.prepare(`SELECT p.*, c.slug as categorySlug FROM products p JOIN categories c ON c.id=p.categoryId
                  WHERE p.featured = 1 ORDER BY p.createdAt DESC LIMIT ?`),
      [limit]
    ).map(parseProduct);
  },
};

// ---------- Reviews ----------
const Reviews = {
  create({ productId, userId, rating, comment }) {
    const id = nanoid();
    db.prepare(`INSERT INTO reviews (id,productId,userId,rating,comment) VALUES (?,?,?,?,?)`).run(
      id, productId, userId, rating, comment
    );
    return id;
  },
  forProduct(productId) {
    return all(
      db.prepare(
        `SELECT r.*, u.name as userName FROM reviews r JOIN users u ON u.id = r.userId
         WHERE r.productId = ? ORDER BY r.createdAt DESC`
      ),
      [productId]
    );
  },
};

// ---------- Orders ----------
const Orders = {
  create({ userId, items, shippingName, shippingPhone, shippingAddress, shippingCity, paymentMethod }) {
    const id = nanoid();
    const orderNumber = 'GB' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10);
    let subtotal = 0;
    for (const it of items) subtotal += it.price * it.quantity;
    const deliveryFee = shippingCity && shippingCity.toLowerCase().includes('dhaka') ? 60 : 120;
    const total = subtotal + deliveryFee;

    db.prepare(
      `INSERT INTO orders (id,orderNumber,userId,subtotal,deliveryFee,total,paymentMethod,shippingName,shippingPhone,shippingAddress,shippingCity)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`
    ).run(id, orderNumber, userId, subtotal, deliveryFee, total, paymentMethod, shippingName, shippingPhone, shippingAddress, shippingCity);

    for (const it of items) {
      db.prepare(`INSERT INTO order_items (id,orderId,productId,quantity,price) VALUES (?,?,?,?,?)`).run(
        nanoid(), id, it.productId, it.quantity, it.price
      );
      Products.decrementStock(it.productId, it.quantity);
    }
    return Orders.byId(id);
  },
  byId(id) {
    const order = row(db.prepare(`SELECT * FROM orders WHERE id = ?`), [id]);
    if (!order) return null;
    order.items = all(
      db.prepare(
        `SELECT oi.*, p.name as productName, p.imageUrl FROM order_items oi
         JOIN products p ON p.id = oi.productId WHERE oi.orderId = ?`
      ),
      [id]
    );
    return order;
  },
  byUser(userId) {
    return all(db.prepare(`SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC`), [userId]);
  },
  all(limit = 100) {
    return all(
      db.prepare(
        `SELECT o.*, u.name as customerName FROM orders o JOIN users u ON u.id = o.userId
         ORDER BY o.createdAt DESC LIMIT ?`
      ),
      [limit]
    );
  },
  updateStatus(id, status) {
    db.prepare(`UPDATE orders SET status = ?, updatedAt = datetime('now') WHERE id = ?`).run(status, id);
    return Orders.byId(id);
  },
  markPaid(id, txnId) {
    db.prepare(
      `UPDATE orders SET paymentStatus = 'PAID', paymentTxnId = ?, updatedAt = datetime('now') WHERE id = ?`
    ).run(txnId, id);
    return Orders.byId(id);
  },
};

// ---------- Chat ----------
const Chat = {
  save({ roomId, userId, sender, message }) {
    const id = nanoid();
    db.prepare(`INSERT INTO chat_messages (id,roomId,userId,sender,message) VALUES (?,?,?,?,?)`).run(
      id, roomId, userId || null, sender, message
    );
    return { id, roomId, userId, sender, message, createdAt: new Date().toISOString() };
  },
  history(roomId, limit = 50) {
    return all(
      db.prepare(`SELECT * FROM chat_messages WHERE roomId = ? ORDER BY createdAt ASC LIMIT ?`),
      [roomId, limit]
    );
  },
};

module.exports = { Users, Categories, Products, Reviews, Orders, Chat };
