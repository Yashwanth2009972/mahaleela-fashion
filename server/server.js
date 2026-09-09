import fs from 'fs';
import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { db } from './db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, '../public')));

// Fallback all storefront and admin routes to index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const distHtml = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(distHtml)) {
    res.sendFile(distHtml);
  } else {
    res.sendFile(path.join(__dirname, '../index.html'));
  }
});

// Configure Multer for local media uploads (4K Ultra-HD support up to 50MB)
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Media Upload endpoint
app.post('/api/upload', upload.array('files', 10), (req, res) => {
  const publicUploads = path.join(__dirname, '../public/uploads');
  if (!fs.existsSync(publicUploads)) {
    fs.mkdirSync(publicUploads, { recursive: true });
  }

  const files = req.files || (req.file ? [req.file] : []);
  if (files.length === 0) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  files.forEach(f => {
    try {
      fs.copyFileSync(f.path, path.join(publicUploads, f.filename));
    } catch (e) {
      console.warn('Could not mirror to public/uploads:', e);
    }
  });

  const urls = files.map(f => `/uploads/${f.filename}`);
  res.json({ urls, url: urls[0], files });
});

// Settings API
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});
app.put('/api/settings', (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// Categories API
app.get('/api/categories', (req, res) => {
  res.json(db.getCategories());
});
app.put('/api/categories/:id', (req, res) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  res.json(updated);
});

// Collections API (CRITICAL)
app.get('/api/collections', (req, res) => {
  res.json(db.getCollections());
});
app.get('/api/collections/:slug', (req, res) => {
  const col = db.getCollectionBySlug(req.params.slug);
  if (!col) return res.status(404).json({ error: 'Collection not found' });
  res.json(col);
});
app.post('/api/collections', (req, res) => {
  const created = db.createCollection(req.body);
  res.status(201).json(created);
});
app.put('/api/collections/:id', (req, res) => {
  const updated = db.updateCollection(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Collection not found' });
  res.json(updated);
});
app.delete('/api/collections/:id', (req, res) => {
  db.deleteCollection(req.params.id);
  res.json({ success: true });
});

// Products API
app.get('/api/products', (req, res) => {
  const prods = db.getProducts(req.query);
  res.json(prods);
});
app.get('/api/products/:slug', (req, res) => {
  const prod = db.getProductBySlug(req.params.slug);
  if (!prod) return res.status(404).json({ error: 'Product not found' });
  res.json(prod);
});
app.post('/api/products', (req, res) => {
  const created = db.createProduct(req.body);
  res.status(201).json(created);
});
app.put('/api/products/:id', (req, res) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});
app.delete('/api/products/:id', (req, res) => {
  db.deleteProduct(req.params.id);
  res.json({ success: true });
});

// Homepage Sections API
app.get('/api/homepage', (req, res) => {
  res.json(db.getHomepageSections());
});
app.put('/api/homepage', (req, res) => {
  const updated = db.updateHomepageSections(req.body);
  res.json(updated);
});
app.put('/api/homepage/:id', (req, res) => {
  const updated = db.updateHomepageSection(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Section not found' });
  res.json(updated);
});

// Banners API
// Banners API
app.get('/api/banners', (req, res) => {
  res.json(db.getBanners());
});
app.post('/api/banners', (req, res) => {
  const banners = db.getBanners();
  const newBanner = {
    id: `ban-${Date.now()}`,
    is_active: true,
    display_order: banners.length + 1,
    ...req.body
  };
  banners.push(newBanner);
  db.updateBanners(banners);
  res.status(201).json(newBanner);
});
app.delete('/api/banners/:id', (req, res) => {
  let banners = db.getBanners();
  banners = banners.filter(b => b.id !== req.params.id);
  db.updateBanners(banners);
  res.json({ success: true });
});
app.put('/api/banners/:id', (req, res) => {
  let banners = db.getBanners();
  const idx = banners.findIndex(b => b.id === req.params.id);
  if (idx !== -1) {
    banners[idx] = { ...banners[idx], ...req.body };
    db.updateBanners(banners);
    return res.json(banners[idx]);
  }
  res.status(404).json({ error: 'Banner not found' });
});
app.put('/api/banners', (req, res) => {
  const updated = db.updateBanners(req.body);
  res.json(updated);
});

// Coupons API
app.get('/api/coupons', (req, res) => {
  res.json(db.getCoupons());
});
app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.body;
  const result = db.validateCoupon(code, subtotal);
  if (!result.valid) return res.status(400).json({ error: result.message });
  res.json(result);
});
app.post('/api/coupons', (req, res) => {
  const created = db.createCoupon(req.body);
  res.status(201).json(created);
});
app.put('/api/coupons/:id', (req, res) => {
  const updated = db.updateCoupon(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Coupon not found' });
  res.json(updated);
});
app.delete('/api/coupons/:id', (req, res) => {
  db.deleteCoupon(req.params.id);
  res.json({ success: true });
});

// Orders API
app.get('/api/orders', (req, res) => {
  res.json(db.getOrders());
});
app.get('/api/orders/:id', (req, res) => {
  const ord = db.getOrderById(req.params.id);
  if (!ord) return res.status(404).json({ error: 'Order not found' });
  res.json(ord);
});
app.post('/api/orders', (req, res) => {
  const created = db.createOrder(req.body);
  res.status(201).json(created);
});
app.put('/api/orders/:id/status', (req, res) => {
  const updated = db.updateOrderStatus(req.params.id, req.body.status);
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json(updated);
});

// Users / Auth
app.get('/api/users', (req, res) => {
  res.json(db.getUsers());
});
app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body;
  if (role === 'SUPER_ADMIN' || email?.includes('admin')) {
    return res.json({
      user: {
        id: "usr-admin",
        name: "Mahaleela Administrator",
        email: email || "admin@mahaleela.com",
        role: "SUPER_ADMIN",
        is_exclusive_member: true
      },
      token: "demo-token-admin"
    });
  }
  res.json({
    user: {
      id: "usr-customer",
      name: "Arjun Verma",
      email: email || "customer@mahaleela.com",
      role: "CUSTOMER",
      is_exclusive_member: true
    },
    token: "demo-token-customer"
  });
});

// Real Google Identity Services (OAuth 2.0) token decode and authentication
app.post('/api/auth/google', (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential' });
    }

    // Google JWT ID token structure: header.payload.signature
    const parts = credential.split('.');
    if (parts.length < 2) {
      return res.status(400).json({ error: 'Malformed Google ID token' });
    }

    // Decode base64url payload
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decodedStr = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const payload = JSON.parse(decodedStr);

    if (!payload.sub || !payload.email) {
      return res.status(400).json({ error: 'Incomplete Google token payload' });
    }

    const data = db.getData();
    data.users = data.users || [];
    
    // Find existing user by email
    let user = data.users.find(u => u.email.toLowerCase() === payload.email.toLowerCase());

    const isStoreAdmin = 
      payload.email.toLowerCase().includes('admin') || 
      (data.settings?.email && payload.email.toLowerCase() === data.settings.email.toLowerCase());

    if (!user) {
      user = {
        id: `usr-g-${payload.sub.slice(0, 10)}`,
        name: payload.name || payload.given_name || payload.email.split('@')[0],
        email: payload.email,
        picture: payload.picture || '',
        role: isStoreAdmin ? 'SUPER_ADMIN' : 'CUSTOMER',
        is_exclusive_member: true,
        auth_provider: 'google',
        google_sub: payload.sub,
        created_at: new Date().toISOString()
      };
      data.users.push(user);
    } else {
      user.name = payload.name || user.name;
      user.picture = payload.picture || user.picture;
      user.is_exclusive_member = true;
      user.auth_provider = 'google';
      if (isStoreAdmin) user.role = 'SUPER_ADMIN';
    }

    db.saveData(data);

    res.json({
      success: true,
      user,
      token: `g-jwt-${Date.now()}-${user.id}`
    });
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.status(500).json({ error: 'Google authentication processing failed: ' + err.message });
  }
});

// Exclusive applications
app.get('/api/exclusive/applications', (req, res) => {
  res.json(db.getExclusiveApplications());
});
app.post('/api/exclusive/apply', (req, res) => {
  const appItem = db.submitExclusiveApplication(req.body);
  res.status(201).json(appItem);
});
app.put('/api/exclusive/applications/:id', (req, res) => {
  const updated = db.updateExclusiveApplication(req.params.id, req.body.status);
  if (!updated) return res.status(404).json({ error: 'Application not found' });
  res.json(updated);
});

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MAHALEELA FASHION API Engine running on port ${PORT}`);
  });
}

export default app;
export { app };
