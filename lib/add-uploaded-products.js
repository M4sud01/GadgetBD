// Adds the batch of uploaded product photos as real catalog entries.
// Safe to re-run — skips any slug that already exists.
const db = require('./db');
const { Products, Categories } = require('./models');

const catBySlug = {};
for (const c of Categories.all()) catBySlug[c.slug] = c.id;

function exists(slug) {
  return !!db.prepare('SELECT id FROM products WHERE slug = ?').get(slug);
}

const newProducts = [
  {
    name: 'Sony PlayStation VR Headset',
    slug: 'sony-playstation-vr-headset',
    brand: 'Sony',
    category: 'gaming',
    price: 34999,
    compareAtPrice: 42999,
    stock: 8,
    featured: true,
    imageUrl: '/images/uploaded/ps-vr-headset.jpg',
    description: 'Immersive virtual reality gaming with a 5.7" OLED display, 360° tracking, and 3D audio — compatible with PS4/PS5.',
    specs: { Display: '5.7" OLED', Resolution: '1920x1080', FOV: '100 degrees', Tracking: '360° head tracking' },
  },
  {
    name: '7-in-1 USB-C Multiport Hub',
    slug: '7-in-1-usbc-multiport-hub',
    brand: 'Generic',
    category: 'accessories',
    price: 1890,
    stock: 60,
    imageUrl: '/images/uploaded/usbc-hub.jpg',
    description: 'Expand a single USB-C port into HDMI, USB 3.0, SD/TF card slots, and more — perfect for laptops with limited ports.',
    specs: { Ports: 'HDMI, 2x USB 3.0, SD/TF, USB-C PD', Output: '4K HDMI @30Hz', 'PD Charging': 'Up to 100W passthrough' },
  },
  {
    name: 'Master & Dynamic MW75 Wireless ANC Headphones',
    slug: 'master-dynamic-mw75-anc-headphones',
    brand: 'Master & Dynamic',
    category: 'audio',
    price: 48999,
    compareAtPrice: 54999,
    stock: 5,
    featured: true,
    imageUrl: '/images/uploaded/md-mw75-headphones.png',
    description: 'Premium leather and stainless steel construction with studio-grade active noise cancellation and 28-hour battery life.',
    specs: { ANC: 'Adaptive Hybrid ANC', Battery: 'Up to 28 hrs', Driver: '40mm Beryllium', Bluetooth: '5.3' },
  },
  {
    name: 'Choetech ANC TWS Earbuds with Rotating Case',
    slug: 'choetech-anc-tws-earbuds',
    brand: 'Choetech',
    category: 'audio',
    price: 3490,
    compareAtPrice: 3990,
    stock: 40,
    imageUrl: '/images/uploaded/choetech-tws.webp',
    description: '4-mic ENC calling, touch controls, and a unique rotating charging case that doubles as a wrist lanyard.',
    specs: { ANC: 'Active Noise Cancelling', Mic: '4-Mic ENC', Battery: '6hrs (Buds), 24hrs (Case)', Bluetooth: '5.3' },
  },
  {
    name: 'GadgetBD Wireless Earbuds Lite',
    slug: 'gadgetbd-wireless-earbuds-lite',
    brand: 'GadgetBD',
    category: 'audio',
    price: 1290,
    stock: 70,
    imageUrl: '/images/uploaded/wireless-earbuds-generic.jpg',
    description: 'Budget-friendly true wireless earbuds with punchy sound and a pocket-sized charging case — great daily driver.',
    specs: { Battery: '5hrs (Buds), 20hrs (Case)', Bluetooth: '5.1', Weight: '4g per bud' },
  },
  {
    name: 'LARQ Bottle PureVis Self-Cleaning Water Bottle',
    slug: 'larq-bottle-purevis',
    brand: 'LARQ',
    category: 'accessories',
    price: 8999,
    stock: 15,
    featured: true,
    imageUrl: '/images/uploaded/larq-bottle.jpg',
    description: 'UV-C LED technology self-cleans the bottle and purifies water on the go — a genuine smart-gadget upgrade to your daily bottle.',
    specs: { Capacity: '500ml', Tech: 'UV-C LED PureVis', Battery: 'USB-C rechargeable, 1 month per charge' },
  },
  {
    name: 'Amazfit Bip 5 Unity Smartwatch',
    slug: 'amazfit-bip-5-unity-smartwatch',
    brand: 'Amazfit',
    category: 'smartwatches',
    price: 4990,
    compareAtPrice: 5990,
    stock: 30,
    imageUrl: '/images/uploaded/smartwatch-black.jpg',
    description: 'Large square AMOLED-style display with heart rate, SpO2, and step tracking — built for everyday fitness in Bangladesh weather.',
    specs: { Display: '1.83" HD', Battery: 'Up to 10 days', 'Water resistance': '5 ATM', Sensors: 'HR, SpO2' },
  },
  {
    name: 'ZTE Blade V50 Smartphone (8/128GB)',
    slug: 'zte-blade-v50-8-128',
    brand: 'ZTE',
    category: 'smartphones',
    price: 16999,
    compareAtPrice: 19999,
    stock: 20,
    featured: true,
    imageUrl: '/images/uploaded/zte-smartphone.webp',
    description: 'Triple camera setup, big battery, and a clean display — an affordable, reliable daily smartphone.',
    specs: { Display: '6.6" HD+', RAM: '8GB', Storage: '128GB', Camera: 'Triple rear camera', Battery: '5000mAh' },
  },
  {
    name: 'boAt Airdopes 141 TWS Earbuds',
    slug: 'boat-airdopes-141',
    brand: 'boAt',
    category: 'audio',
    price: 1999,
    compareAtPrice: 2499,
    stock: 55,
    featured: true,
    imageUrl: '/images/uploaded/boat-airdopes.webp',
    description: 'Up to 42 hours of total playback, ENx environmental noise cancellation for calls, and IPX4 sweat resistance.',
    specs: { Battery: '42hrs total playback', Mic: 'ENx Noise Cancellation', 'Water resistance': 'IPX4', Bluetooth: '5.3' },
  },
  {
    name: 'Wireless Optical Mouse',
    slug: 'wireless-optical-mouse',
    brand: 'Generic',
    category: 'accessories',
    price: 890,
    stock: 90,
    imageUrl: '/images/uploaded/wireless-mouse.jpg',
    description: 'Reliable 2.4GHz wireless mouse with a comfortable ergonomic shape — a no-fuss essential for any desk setup.',
    specs: { Connectivity: '2.4GHz Wireless', DPI: 'Up to 1600', Battery: 'AA (up to 12 months)' },
  },
];

let added = 0;
for (const p of newProducts) {
  if (exists(p.slug)) {
    console.log('Skip (exists):', p.name);
    continue;
  }
  Products.create({ ...p, categoryId: catBySlug[p.category] });
  added++;
  console.log('Added:', p.name, '— ৳' + p.price.toLocaleString());
}
console.log(`\nDone. ${added} new products added.`);
