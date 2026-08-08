const db = require('./db');
const { Users, Categories, Products, Reviews } = require('./models');
const { hashPassword } = require('./auth');

function already() {
  const c = db.prepare(`SELECT COUNT(*) as n FROM products`).get();
  return c.n > 0;
}

if (already()) {
  console.log('Already seeded. Skipping. (Delete data/gadgetbd.db to reseed.)');
  process.exit(0);
}

console.log('Seeding GadgetBD...');

// Admin + demo customer
const admin = Users.create({
  name: 'Admin',
  email: 'admin@gadgetbd.com',
  passwordHash: hashPassword('admin123'),
  role: 'ADMIN',
  city: 'Dhaka',
});
const customer = Users.create({
  name: 'Rahim Uddin',
  email: 'customer@gadgetbd.com',
  passwordHash: hashPassword('customer123'),
  role: 'CUSTOMER',
  phone: '01711000000',
  address: 'House 12, Road 5, Dhanmondi',
  city: 'Dhaka',
});

const cats = [
  ['Smartphones', 'smartphones'],
  ['Laptops', 'laptops'],
  ['Audio', 'audio'],
  ['Smartwatches', 'smartwatches'],
  ['Accessories', 'accessories'],
  ['Gaming', 'gaming'],
];
const catIds = {};
for (const [name, slug] of cats) catIds[slug] = Categories.create({ name, slug });

const products = [
  {
    name: 'Samsung Galaxy A55 5G (8/128GB)', slug: 'samsung-galaxy-a55-5g-8-128', brand: 'Samsung',
    category: 'smartphones', price: 42999, compareAtPrice: 46999, stock: 24, featured: true,
    imageUrl: 'https://images.samsung.com/is/image/samsung/p6pim/bd/sm-a556elvdxsa/gallery/bd-galaxy-a55-5g-sm-a556-sm-a556elvdxsa-539977049',
    description: 'Vision Booster display, Nightography camera, and 5000mAh battery built for all-day use across Dhaka traffic and beyond.',
    specs: { Display: '6.6" Super AMOLED', RAM: '8GB', Storage: '128GB', Battery: '5000mAh', Camera: '50MP OIS' },
  },
  {
    name: 'Xiaomi Redmi Note 13 Pro (8/256GB)', slug: 'xiaomi-redmi-note-13-pro-8-256', brand: 'Xiaomi',
    category: 'smartphones', price: 27999, compareAtPrice: 31999, stock: 40, featured: true,
    imageUrl: 'https://i02.appmifile.com/912_operator_bd/redmi-note-13-pro.jpg',
    description: 'A 200MP flagship camera and curved AMOLED display at a mid-range price — Bangladesh best-seller.',
    specs: { Display: '6.67" AMOLED 120Hz', RAM: '8GB', Storage: '256GB', Battery: '5100mAh', Camera: '200MP' },
  },
  {
    name: 'Apple iPhone 15 (128GB)', slug: 'apple-iphone-15-128gb', brand: 'Apple',
    category: 'smartphones', price: 99999, compareAtPrice: 109999, stock: 12, featured: true,
    imageUrl: 'https://store.storeimages.cdn-apple.com/iphone-15-pink.jpg',
    description: 'Dynamic Island, A16 Bionic chip, and a 48MP main camera — official warranty available in Bangladesh.',
    specs: { Display: '6.1" Super Retina XDR', Storage: '128GB', Battery: 'Up to 20 hrs video', Camera: '48MP' },
  },
  {
    name: 'Realme 12 Pro+ (8/256GB)', slug: 'realme-12-pro-plus-8-256', brand: 'Realme',
    category: 'smartphones', price: 34999, stock: 18,
    imageUrl: 'https://image.realme.net/general/20240116/realme12proplus.png',
    description: 'Periscope telephoto camera and premium leather-textured back, tuned for Bangladeshi photography lovers.',
    specs: { Display: '6.7" AMOLED', RAM: '8GB', Storage: '256GB', Camera: '50MP Periscope' },
  },
  {
    name: 'ASUS Vivobook 15 (i5, 16GB/512GB)', slug: 'asus-vivobook-15-i5-16-512', brand: 'ASUS',
    category: 'laptops', price: 68999, compareAtPrice: 74999, stock: 15, featured: true,
    imageUrl: 'https://dlcdnwebimgs.asus.com/gain/vivobook15.png',
    description: '13th Gen Intel Core i5, fast NVMe SSD, and all-day battery — ideal for students and office work.',
    specs: { CPU: 'Intel Core i5-1334U', RAM: '16GB', Storage: '512GB SSD', Display: '15.6" FHD' },
  },
  {
    name: 'Lenovo IdeaPad Slim 3 (Ryzen 5, 8/512GB)', slug: 'lenovo-ideapad-slim-3-ryzen5', brand: 'Lenovo',
    category: 'laptops', price: 54999, stock: 22,
    imageUrl: 'https://p1-ofp.static.pub/fes/cms/2023/lenovo-ideapad-slim-3.png',
    description: 'AMD Ryzen 5 power in a slim, lightweight chassis — great value for everyday computing.',
    specs: { CPU: 'AMD Ryzen 5 7530U', RAM: '8GB', Storage: '512GB SSD', Display: '15.6" FHD' },
  },
  {
    name: 'MacBook Air M2 (8/256GB)', slug: 'macbook-air-m2-8-256', brand: 'Apple',
    category: 'laptops', price: 134999, stock: 6, featured: true,
    imageUrl: 'https://store.storeimages.cdn-apple.com/macbook-air-m2.jpg',
    description: 'Fanless M2 chip, stunning Liquid Retina display, and up to 18 hours of battery life.',
    specs: { CPU: 'Apple M2', RAM: '8GB', Storage: '256GB SSD', Display: '13.6" Liquid Retina' },
  },
  {
    name: 'boAt Rockerz 550 Wireless Headphones', slug: 'boat-rockerz-550', brand: 'boAt',
    category: 'audio', price: 3299, compareAtPrice: 4990, stock: 60, featured: true,
    imageUrl: 'https://www.boat-lifestyle.com/rockerz550.jpg',
    description: '20-hour battery life, punchy bass, and a foldable design — a favorite among Bangladeshi commuters.',
    specs: { Battery: '20 hrs', Driver: '50mm', Bluetooth: '5.0', Weight: '240g' },
  },
  {
    name: 'JBL Tune 510BT Wireless Headphones', slug: 'jbl-tune-510bt', brand: 'JBL',
    category: 'audio', price: 3990, stock: 45,
    imageUrl: 'https://www.jbl.com/tune510bt.png',
    description: 'JBL Pure Bass sound with up to 40 hours of battery in a lightweight, foldable design.',
    specs: { Battery: '40 hrs', Bluetooth: '5.0', Driver: '32mm' },
  },
  {
    name: 'Xiaomi Redmi Buds 5', slug: 'xiaomi-redmi-buds-5', brand: 'Xiaomi',
    category: 'audio', price: 2499, compareAtPrice: 2999, stock: 80,
    imageUrl: 'https://i02.appmifile.com/redmi-buds-5.jpg',
    description: 'Active Noise Cancellation and a compact charging case — everyday earbuds at an unbeatable price.',
    specs: { ANC: 'Up to 35dB', Battery: '9hrs (Buds), 28hrs (Case)', Bluetooth: '5.3' },
  },
  {
    name: 'Amazfit Bip 5 Smartwatch', slug: 'amazfit-bip-5', brand: 'Amazfit',
    category: 'smartwatches', price: 5999, compareAtPrice: 7499, stock: 35, featured: true,
    imageUrl: 'https://cdn.amazfit.com/bip5.png',
    description: 'Large 1.91" display, 120+ sports modes, and 2-week battery life for active lifestyles.',
    specs: { Display: '1.91" HD', Battery: 'Up to 14 days', GPS: 'Built-in', 'Water resistance': '5 ATM' },
  },
  {
    name: 'Noise ColorFit Pulse 2 Smartwatch', slug: 'noise-colorfit-pulse-2', brand: 'Noise',
    category: 'smartwatches', price: 2799, stock: 50,
    imageUrl: 'https://www.gonoise.com/colorfit-pulse2.png',
    description: 'Affordable fitness tracking with heart-rate and SpO2 monitoring, built for everyday wear.',
    specs: { Display: '1.69" HD', Battery: '7 days', 'Water resistance': 'IP68' },
  },
  {
    name: '20000mAh Fast Charging Power Bank', slug: '20000mah-power-bank', brand: 'Xiaomi',
    category: 'accessories', price: 2299, compareAtPrice: 2799, stock: 100, featured: true,
    imageUrl: 'https://i02.appmifile.com/powerbank-20000.jpg',
    description: '22.5W fast charging keeps your phone and laptop topped up through long days and load-shedding.',
    specs: { Capacity: '20000mAh', Output: '22.5W Fast Charge', Ports: '2x USB-A, 1x USB-C' },
  },
  {
    name: '65W GaN Fast Charger (3-Port)', slug: '65w-gan-charger', brand: 'UGREEN',
    category: 'accessories', price: 2199, stock: 70,
    imageUrl: 'https://images.ugreen.com/65w-gan.jpg',
    description: 'Compact GaN charger that fast-charges laptops, tablets, and phones simultaneously.',
    specs: { Output: '65W Max', Ports: '2x USB-C, 1x USB-A', Tech: 'GaN' },
  },
  {
    name: 'Logitech G102 Lightsync Gaming Mouse', slug: 'logitech-g102-lightsync', brand: 'Logitech',
    category: 'gaming', price: 1690, compareAtPrice: 1990, stock: 55, featured: true,
    imageUrl: 'https://resource.logitech.com/g102-lightsync.png',
    description: 'Customizable RGB, 8000 DPI sensor, and reliable mechanical switches for competitive gaming.',
    specs: { DPI: 'Up to 8000', Buttons: '6 programmable', Weight: '85g' },
  },
  {
    name: 'Redragon K552 Mechanical Keyboard', slug: 'redragon-k552-mechanical', brand: 'Redragon',
    category: 'gaming', price: 3490, stock: 30,
    imageUrl: 'https://www.redragonzone.com/k552.png',
    description: 'Compact 87-key mechanical keyboard with red switches and per-key RGB backlighting.',
    specs: { Switches: 'Outemu Red', Layout: 'TKL 87-key', Backlight: 'RGB' },
  },
];

for (const p of products) {
  Products.create({ ...p, categoryId: catIds[p.category] });
}

// Add a few reviews
const all = db.prepare('SELECT id, name FROM products').all();
const sampleComments = [
  { rating: 5, comment: 'Excellent product, fast delivery within Dhaka!' },
  { rating: 4, comment: 'Good value for money, battery life is great.' },
  { rating: 5, comment: 'Authentic product with official warranty. Very happy.' },
];
all.slice(0, 6).forEach((p, i) => {
  const c = sampleComments[i % sampleComments.length];
  Reviews.create({ productId: p.id, userId: customer.id, rating: c.rating, comment: c.comment });
});

console.log('Seed complete.');
console.log('Admin login: admin@gadgetbd.com / admin123');
console.log('Customer login: customer@gadgetbd.com / customer123');
