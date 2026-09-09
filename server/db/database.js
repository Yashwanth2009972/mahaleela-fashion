import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_CATEGORIES } from './categories.js';
import { INITIAL_COLLECTIONS } from './collections.js';
import { INITIAL_PRODUCTS } from './products.js';
import { INITIAL_HOMEPAGE_SECTIONS } from './homepage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'store.json');

const INITIAL_DATA = {
  settings: {
    google_client_id: "",
    exclusive_settings: {
      title: "MAHALEELA EXCLUSIVE",
      subtitle: "A PRIVATE EDITION OF SELECTED PIECES. DIRECT ATELIER SHOPPING.",
      banner_image: "",
      direct_shopping_enabled: true
    },
    brand_name: "MAHALEELA FASHION",
    tagline: "A New Standard of Everyday Luxury",
    logo_url: "/logo.png",
    phone: "8892919723",
    email: "contact@mahaleelafashion.com",
    address: "2ACROSS MARUTI NAGAR\nCHIKKABANAVARA\nBENGALURU\n560090\nINDIA",
    free_shipping_threshold: 2000,
    cod_fee: 10,
    social: {
      instagram: "https://www.instagram.com/mahaleelafashion?stkn=MTUwMXZoemU1aDVrZg==",
      facebook: "https://www.facebook.com/share/19WYAmRggi/",
      youtube: "https://youtube.com/@mahaleelafashion?si=VNvR9rG1nVfsujnn"
    },
    policies: {
      shipping: "Orders across India are dispatched within 24-48 hours. Express delivery takes 2-4 business days. Free shipping on all orders exceeding ₹2,000.",
      returns: "We offer a discreet 7-day complimentary return and exchange policy for unworn items in pristine condition with original tags intact.",
      privacy: "Your private details and transactions are secured with military-grade encryption. We never share customer data.",
      terms: "All designs, editorial photography, and trademarks are the exclusive property of MAHALEELA FASHION."
    }
  },
  categories: INITIAL_CATEGORIES,
  collections: INITIAL_COLLECTIONS,
  products: INITIAL_PRODUCTS,
  homepage_sections: INITIAL_HOMEPAGE_SECTIONS,
  banners: [],
  coupons: [
    {
      id: "c-1",
      code: "WELCOME10",
      discount_type: "percentage",
      discount_value: 10,
      min_order_value: 1000,
      max_discount: 500,
      usage_limit: 1000,
      used_count: 42,
      is_active: true
    },
    {
      id: "c-2",
      code: "MAHALEELA",
      discount_type: "percentage",
      discount_value: 15,
      min_order_value: 2500,
      max_discount: 1000,
      usage_limit: 500,
      used_count: 18,
      is_active: true
    },
    {
      id: "c-3",
      code: "LUXURY500",
      discount_type: "fixed",
      discount_value: 500,
      min_order_value: 3000,
      max_discount: 500,
      usage_limit: 200,
      used_count: 12,
      is_active: true
    }
  ],
  orders: [],
  users: [
    {
      id: "usr-admin",
      name: "Mahaleela Administrator",
      email: "admin@mahaleela.com",
      role: "SUPER_ADMIN",
      is_exclusive_member: true,
      created_at: "2026-01-01T00:00:00Z"
    },
    {
      id: "usr-customer",
      name: "Arjun Verma",
      email: "customer@mahaleela.com",
      role: "CUSTOMER",
      is_exclusive_member: true,
      created_at: "2026-03-12T00:00:00Z"
    }
  ],
  exclusive_applications: [
    {
      id: "ex-1",
      name: "Karan Malhotra",
      email: "karan.malhotra@gmail.com",
      phone: "+91 98450 11223",
      city: "Mumbai",
      interest: "Private Timepieces & Silk Outerwear",
      status: "approved",
      applied_at: "2026-09-05T14:30:00Z"
    }
  ]
};

export class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.saveData(INITIAL_DATA);
    }
  }

  getData() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        this.saveData(INITIAL_DATA);
        return INITIAL_DATA;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('Database read error, returning initial data:', e);
      return INITIAL_DATA;
    }
  }

  saveData(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('Database write error:', e);
      return false;
    }
  }

  getSettings() {
    return this.getData().settings;
  }

  updateSettings(newSettings) {
    const data = this.getData();
    data.settings = { ...data.settings, ...newSettings };
    this.saveData(data);
    return data.settings;
  }

  getCategories() {
    return this.getData().categories || [];
  }

  updateCategory(id, updates) {
    const data = this.getData();
    const idx = data.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      data.categories[idx] = { ...data.categories[idx], ...updates };
      this.saveData(data);
      return data.categories[idx];
    }
    return null;
  }

  getCollections() {
    const data = this.getData();
    const products = data.products || [];
    return (data.collections || []).map(col => {
      const assigned = products.filter(p => p.collections && p.collections.includes(col.id));
      return {
        ...col,
        product_count: assigned.length
      };
    }).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  getCollectionBySlug(slug) {
    const data = this.getData();
    const col = (data.collections || []).find(c => c.slug === slug || c.id === slug);
    if (!col) return null;
    const products = (data.products || []).filter(p => p.collections && p.collections.includes(col.id) && p.status === 'published');
    return { ...col, products };
  }

  createCollection(colData) {
    const data = this.getData();
    const newCol = {
      id: `col-${Date.now()}`,
      slug: colData.slug || colData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      is_published: true,
      sort_order: (data.collections?.length || 0) + 1,
      ...colData
    };
    data.collections = data.collections || [];
    data.collections.push(newCol);

    if (Array.isArray(colData.product_ids)) {
      data.products.forEach(p => {
        if (colData.product_ids.includes(p.id)) {
          p.collections = p.collections || [];
          if (!p.collections.includes(newCol.id)) {
            p.collections.push(newCol.id);
          }
        }
      });
    }

    this.saveData(data);
    return newCol;
  }

  updateCollection(id, updates) {
    const data = this.getData();
    const idx = data.collections.findIndex(c => c.id === id);
    if (idx === -1) return null;

    data.collections[idx] = { ...data.collections[idx], ...updates, updated_at: new Date().toISOString() };

    if (Array.isArray(updates.product_ids)) {
      data.products.forEach(p => {
        p.collections = p.collections || [];
        const isAssigned = updates.product_ids.includes(p.id);
        const hasCol = p.collections.includes(id);

        if (isAssigned && !hasCol) {
          p.collections.push(id);
        } else if (!isAssigned && hasCol) {
          p.collections = p.collections.filter(cid => cid !== id);
        }
      });
    }

    this.saveData(data);
    return data.collections[idx];
  }

  deleteCollection(id) {
    const data = this.getData();
    data.collections = (data.collections || []).filter(c => c.id !== id);
    (data.products || []).forEach(p => {
      if (p.collections) {
        p.collections = p.collections.filter(cid => cid !== id);
      }
    });
    this.saveData(data);
    return true;
  }

  getProducts(filters = {}) {
    const data = this.getData();
    let prods = [...(data.products || [])];

    if (filters.category) {
      prods = prods.filter(p => p.category_id === filters.category || p.category?.toLowerCase() === filters.category.toLowerCase() || p.slug === filters.category);
    }
    if (filters.collection) {
      prods = prods.filter(p => p.collections && p.collections.includes(filters.collection));
    }
    if (filters.is_exclusive !== undefined) {
      prods = prods.filter(p => Boolean(p.is_exclusive) === Boolean(filters.is_exclusive));
    }
    if (filters.status) {
      prods = prods.filter(p => p.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      prods = prods.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    return prods;
  }

  getProductBySlug(slug) {
    const data = this.getData();
    return (data.products || []).find(p => p.slug === slug || p.id === slug);
  }

  createProduct(productData) {
    const data = this.getData();
    const newProduct = {
      id: `prod-${Date.now()}`,
      slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      discount: productData.mrp && productData.price ? Math.round(((productData.mrp - productData.price) / productData.mrp) * 100) : 0,
      stock: productData.stock || 20,
      status: productData.status || "published",
      colours: productData.colours || ["Deep Black"],
      sizes: productData.sizes || ["S", "M", "L", "XL", "XXL"],
      images: productData.images?.length ? productData.images : [],
      badges: productData.badges || [],
      collections: productData.collections || [],
      created_at: new Date().toISOString(),
      ...productData
    };
    data.products = data.products || [];
    data.products.unshift(newProduct);
    this.saveData(data);
    return newProduct;
  }

  updateProduct(id, updates) {
    const data = this.getData();
    const idx = data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    if (updates.mrp && updates.price) {
      updates.discount = Math.round(((updates.mrp - updates.price) / updates.mrp) * 100);
    }

    data.products[idx] = { ...data.products[idx], ...updates, updated_at: new Date().toISOString() };
    this.saveData(data);
    return data.products[idx];
  }

  deleteProduct(id) {
    const data = this.getData();
    data.products = (data.products || []).filter(p => p.id !== id);
    this.saveData(data);
    return true;
  }

  getHomepageSections() {
    const data = this.getData();
    return (data.homepage_sections || []).sort((a, b) => a.display_order - b.display_order);
  }

  updateHomepageSections(sections) {
    const data = this.getData();
    data.homepage_sections = sections;
    this.saveData(data);
    return data.homepage_sections;
  }

  updateHomepageSection(id, updates) {
    const data = this.getData();
    const idx = data.homepage_sections.findIndex(s => s.id === id);
    if (idx !== -1) {
      data.homepage_sections[idx] = { ...data.homepage_sections[idx], ...updates };
      this.saveData(data);
      return data.homepage_sections[idx];
    }
    return null;
  }

  getBanners() {
    return this.getData().banners || [];
  }

  updateBanners(banners) {
    const data = this.getData();
    data.banners = banners;
    this.saveData(data);
    return data.banners;
  }

  getCoupons() {
    return this.getData().coupons || [];
  }

  validateCoupon(code, subtotal) {
    const coupons = this.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.is_active);
    if (!coupon) return { valid: false, message: "Invalid promotional code" };
    if (subtotal < coupon.min_order_value) {
      return { valid: false, message: `Minimum cart value of ₹${coupon.min_order_value} required for code ${coupon.code}` };
    }
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.min((subtotal * coupon.discount_value) / 100, coupon.max_discount || Infinity);
    } else {
      discount = coupon.discount_value;
    }
    return { valid: true, coupon, discount };
  }

  createCoupon(coupon) {
    const data = this.getData();
    const newCoupon = { id: `c-${Date.now()}`, is_active: true, used_count: 0, ...coupon };
    data.coupons = data.coupons || [];
    data.coupons.push(newCoupon);
    this.saveData(data);
    return newCoupon;
  }

  updateCoupon(id, updates) {
    const data = this.getData();
    const idx = data.coupons.findIndex(c => c.id === id);
    if (idx !== -1) {
      data.coupons[idx] = { ...data.coupons[idx], ...updates };
      this.saveData(data);
      return data.coupons[idx];
    }
    return null;
  }

  deleteCoupon(id) {
    const data = this.getData();
    data.coupons = (data.coupons || []).filter(c => c.id !== id);
    this.saveData(data);
    return true;
  }

  getOrders() {
    const data = this.getData();
    return (data.orders || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getOrderById(id) {
    const data = this.getData();
    return (data.orders || []).find(o => o.id === id || o.order_number === id);
  }

  createOrder(orderData) {
    const data = this.getData();
    const orderNumber = `ML-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      order_status: "placed",
      payment_status: orderData.payment_method === 'COD' ? 'pending' : 'completed',
      created_at: new Date().toISOString(),
      tracking_timeline: [
        { status: "placed", label: "Order Placed", time: new Date().toLocaleString(), completed: true },
        { status: "confirmed", label: "Order Confirmed", time: "Awaiting Processing", completed: false },
        { status: "packed", label: "Packed in Luxury Box", time: "Pending", completed: false },
        { status: "shipped", label: "Dispatched", time: "Pending", completed: false },
        { status: "out_for_delivery", label: "Out for Delivery", time: "Pending", completed: false },
        { status: "delivered", label: "Delivered", time: "Pending", completed: false }
      ],
      ...orderData
    };
    data.orders = data.orders || [];
    data.orders.unshift(newOrder);
    this.saveData(data);
    return newOrder;
  }

  updateOrderStatus(orderId, status) {
    const data = this.getData();
    const idx = data.orders.findIndex(o => o.id === orderId || o.order_number === orderId);
    if (idx === -1) return null;

    const order = data.orders[idx];
    order.order_status = status;

    const stages = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"];
    const currStageIdx = stages.indexOf(status);

    if (currStageIdx !== -1) {
      order.tracking_timeline = order.tracking_timeline.map((stage, i) => {
        if (i <= currStageIdx) {
          return {
            ...stage,
            completed: true,
            time: stage.time === "Pending" || stage.time === "Awaiting Processing" ? new Date().toLocaleString() : stage.time
          };
        }
        return { ...stage, completed: false };
      });
    }

    this.saveData(data);
    return order;
  }

  getUsers() {
    return this.getData().users || [];
  }

  getExclusiveApplications() {
    return this.getData().exclusive_applications || [];
  }

  submitExclusiveApplication(app) {
    const data = this.getData();
    const newApp = {
      id: `ex-${Date.now()}`,
      status: "pending",
      applied_at: new Date().toISOString(),
      ...app
    };
    data.exclusive_applications = data.exclusive_applications || [];
    data.exclusive_applications.unshift(newApp);
    this.saveData(data);
    return newApp;
  }

  updateExclusiveApplication(id, status) {
    const data = this.getData();
    const idx = data.exclusive_applications.findIndex(a => a.id === id);
    if (idx !== -1) {
      data.exclusive_applications[idx].status = status;
      this.saveData(data);
      return data.exclusive_applications[idx];
    }
    return null;
  }
}

export const db = new Database();
