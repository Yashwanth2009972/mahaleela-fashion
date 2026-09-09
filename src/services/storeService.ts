import {
  Product,
  Category,
  Collection,
  HomepageSection,
  Banner,
  SiteSettings,
  Order,
  Coupon
} from '../types';
import { INITIAL_STORE_DATA } from '../data/initialStoreData';
import { idbManager } from '../utils/indexedDBStorage';

const STORAGE_KEYS = {
  SETTINGS: 'ml_store_settings',
  BANNERS: 'ml_store_banners',
  HOMEPAGE: 'ml_store_homepage',
  PRODUCTS: 'ml_store_products',
  CATEGORIES: 'ml_store_categories',
  COLLECTIONS: 'ml_store_collections',
  ORDERS: 'ml_store_orders',
  COUPONS: 'ml_store_coupons',
  MEDIA: 'ml_store_media'
};

class StoreService {
  private listeners: Array<(event: { type: string; data?: any }) => void> = [];
  private channel: BroadcastChannel | null = null;
  private memoryCache = new Map<string, any>();

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Clean out all old demo products, collections, and unsplash cache on first load
      try {
        const clearedKey = 'ml_store_clean_v7';
        if (localStorage.getItem(clearedKey) !== 'true') {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
          localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify([]));
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));

          // Purge legacy demo entries containing unsplash
          const b = localStorage.getItem(STORAGE_KEYS.BANNERS);
          if (b && b.includes('unsplash')) localStorage.removeItem(STORAGE_KEYS.BANNERS);

          const h = localStorage.getItem(STORAGE_KEYS.HOMEPAGE);
          if (h && h.includes('unsplash')) localStorage.removeItem(STORAGE_KEYS.HOMEPAGE);

          const c = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
          if (c && c.includes('unsplash')) localStorage.removeItem(STORAGE_KEYS.CATEGORIES);

          const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
          if (s && s.includes('unsplash')) {
            try {
              const parsed = JSON.parse(s);
              if (parsed.exclusive_settings?.banner_image?.includes('unsplash')) {
                parsed.exclusive_settings.banner_image = '';
                localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
              }
            } catch {}
          }

          localStorage.setItem(clearedKey, 'true');
        }
      } catch (e) {
        console.warn('Initial demo cleanup check:', e);
      }

      // 2. Cross-tab Broadcast Channel synchronization
      try {
        if ('BroadcastChannel' in window) {
          this.channel = new BroadcastChannel('ml_store_channel');
          this.channel.onmessage = (event) => {
            if (event.data && event.data.type) {
              this.memoryCache.clear();
              this.notifyLocalListeners(event.data);
            }
          };
        }
      } catch (e) {
        console.warn('BroadcastChannel not available:', e);
      }

      // 3. Storage event listener for other tabs
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('ml_store_')) {
          this.memoryCache.delete(e.key);
          const type = e.key.replace('ml_store_', '');
          this.notifyLocalListeners({ type });
        }
      });

      // 4. Asynchronous IndexedDB hydration for 4K Ultra-HD media
      try {
        setTimeout(async () => {
          for (const [name, key] of Object.entries(STORAGE_KEYS)) {
            const idbData = await idbManager.getBackup(key);
            if (idbData) {
              const currentLocal = localStorage.getItem(key);
              if (!currentLocal || JSON.stringify(idbData).length >= (currentLocal?.length || 0)) {
                this.memoryCache.set(key, idbData);
                try {
                  localStorage.setItem(key, JSON.stringify(idbData));
                } catch {}
                try {
                  sessionStorage.setItem(key, JSON.stringify(idbData));
                } catch {}
                this.notifyLocalListeners({ type: name.toLowerCase() });
              }
            }
          }
        }, 100);
      } catch {}

      // 5. Automatic Cloud Sync on boot (ensures father & customers see latest photos and products)
      setTimeout(() => {
        this.syncFromCloud().catch(() => {});
      }, 50);

      // 6. Periodic Background Cloud Sync (every 30 seconds) for live multi-device synchronization
      setInterval(() => {
        this.syncFromCloud().catch(() => {});
      }, 30000);
    }
  }

  // Event subscription for real-time reactivity across all components
  public subscribe(listener: (event: { type: string; data?: any }) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyLocalListeners(event: { type: string; data?: any }) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error('Store listener error:', err);
      }
    });
  }

  private notify(event: { type: string; data?: any }) {
    this.notifyLocalListeners(event);

    if (typeof window !== 'undefined') {
      // Notify current tab listeners
      window.dispatchEvent(new CustomEvent('ml_store_updated', { detail: event }));

      // Notify other open tabs via BroadcastChannel
      try {
        if (this.channel) {
          this.channel.postMessage(event);
        }
      } catch {}
    }
  }

  // Helper to read localStorage safely with memory cache and sessionStorage fallback
  private getLocal<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key) as T;
    }
    try {
      const saved = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);
      this.memoryCache.set(key, parsed);
      return parsed;
    } catch {
      return fallback;
    }
  }

  // Helper to write localStorage safely with quota protection & IndexedDB 4K backup
  private setLocal<T>(key: string, data: T) {
    if (typeof window === 'undefined') return;

    // 1. Fast in-memory cache update
    this.memoryCache.set(key, data);

    // 2. High-capacity IndexedDB backup (stores unlimited 4K photos safely)
    try {
      idbManager.setBackup(key, data);
    } catch {}

    // 3. Fast sessionStorage mirror
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch {}

    // 4. LocalStorage sync with quota safety
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e: any) {
      console.warn('LocalStorage quota reached, 4K data preserved in IndexedDB, memory & sessionStorage:', e);
    }
  }

  // -------------------------------------------------------------
  // UNIVERSAL MULTI-DEVICE CLOUD SYNC & EXPORT ENGINE
  // -------------------------------------------------------------

  public applyStoreData(data: any) {
    if (!data || typeof data !== 'object') return;
    if (Array.isArray(data.products)) this.setLocal(STORAGE_KEYS.PRODUCTS, data.products);
    if (Array.isArray(data.collections)) this.setLocal(STORAGE_KEYS.COLLECTIONS, data.collections);
    if (Array.isArray(data.banners)) this.setLocal(STORAGE_KEYS.BANNERS, data.banners);
    if (Array.isArray(data.homepage_sections)) this.setLocal(STORAGE_KEYS.HOMEPAGE, data.homepage_sections);
    if (Array.isArray(data.categories)) this.setLocal(STORAGE_KEYS.CATEGORIES, data.categories);
    if (data.settings && typeof data.settings === 'object') {
      const current = this.getSettings();
      this.setLocal(STORAGE_KEYS.SETTINGS, {
        ...current,
        ...data.settings,
        exclusive_settings: {
          ...(current.exclusive_settings || {}),
          ...(data.settings.exclusive_settings || {})
        },
        cloud_sync: {
          ...(current.cloud_sync || {}),
          ...(data.settings.cloud_sync || {})
        }
      });
    }
    this.notify({ type: 'all', data });
  }

  // Hydrate store from Cloud (Firebase, Backend, or static store_data.json)
  public async syncFromCloud(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const settings = this.getSettings();
    const firebaseUrl = settings.cloud_sync?.firebase_url?.trim().replace(/\/$/, '');
    const backendUrl = settings.cloud_sync?.backend_url?.trim().replace(/\/$/, '');

    // 1. Firebase Realtime Database (Instant, free, cross-device)
    if (firebaseUrl) {
      try {
        const res = await fetch(`${firebaseUrl}/store.json`);
        if (res.ok) {
          const cloudData = await res.json();
          if (cloudData && typeof cloudData === 'object') {
            this.applyStoreData(cloudData);
            return true;
          }
        }
      } catch (e) {
        console.warn('Firebase cloud sync fetch error:', e);
      }
    }

    // 2. Live Backend Server Check (Render / Railway / Localhost / Custom Server)
    try {
      const serverOrigin = backendUrl || '';
      const testRes = await fetch(`${serverOrigin}/api/settings`);
      if (testRes.ok) {
        const contentType = testRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const [pRes, cRes, bRes, sRes, hRes, catRes] = await Promise.all([
            fetch(`${serverOrigin}/api/products`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`${serverOrigin}/api/collections`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`${serverOrigin}/api/banners`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`${serverOrigin}/api/settings`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`${serverOrigin}/api/homepage`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`${serverOrigin}/api/categories`).then(r => r.ok ? r.json() : null).catch(() => null),
          ]);
          if (pRes !== null || cRes !== null || bRes !== null) {
            this.applyStoreData({
              products: pRes || [],
              collections: cRes || [],
              banners: bRes || [],
              settings: sRes || {},
              homepage_sections: hRes || [],
              categories: catRes || []
            });
            return true;
          }
        }
      }
    } catch (e) {
      // Backend not accessible (e.g. running on static-only hosting)
    }

    // 3. Static store_data.json (Netlify Drop fallback for all customers worldwide)
    try {
      const res = await fetch('/store_data.json', { cache: 'no-cache' });
      if (res.ok) {
        const staticData = await res.json();
        if (staticData && typeof staticData === 'object') {
          const localProducts = this.getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []);
          // Hydrate if local storage is blank or static data contains products/banners/collections
          if (localProducts.length === 0 && (staticData.products?.length || staticData.collections?.length || staticData.banners?.length)) {
            this.applyStoreData(staticData);
            return true;
          }
        }
      }
    } catch {}

    return false;
  }

  // Push latest store state to Cloud so all customers immediately see changes
  public async syncToCloud(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const settings = this.getSettings();
    const firebaseUrl = settings.cloud_sync?.firebase_url?.trim().replace(/\/$/, '');
    const backendUrl = settings.cloud_sync?.backend_url?.trim().replace(/\/$/, '');

    const fullPayload = {
      settings: this.getSettings(),
      categories: this.getCategories(),
      collections: this.getCollections(),
      products: this.getProducts(),
      homepage_sections: this.getHomepageSections(),
      banners: this.getBanners(),
      coupons: this.getCoupons(),
      updated_at: new Date().toISOString()
    };

    let synced = false;

    // 1. Push to Firebase Realtime Database
    if (firebaseUrl) {
      try {
        const res = await fetch(`${firebaseUrl}/store.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullPayload)
        });
        if (res.ok) {
          synced = true;
        }
      } catch (e) {
        console.error('Firebase syncToCloud error:', e);
      }
    }

    // 2. Push to Custom Backend API
    if (backendUrl) {
      try {
        await Promise.all([
          fetch(`${backendUrl}/api/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fullPayload.products) }).catch(() => null),
          fetch(`${backendUrl}/api/collections`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fullPayload.collections) }).catch(() => null),
          fetch(`${backendUrl}/api/banners`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fullPayload.banners) }).catch(() => null),
          fetch(`${backendUrl}/api/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fullPayload.settings) }).catch(() => null)
        ]);
        synced = true;
      } catch (e) {
        console.warn('Backend syncToCloud error:', e);
      }
    }

    if (synced) {
      const updatedSettings = {
        ...settings,
        cloud_sync: {
          ...settings.cloud_sync,
          last_synced_at: new Date().toISOString()
        }
      };
      this.setLocal(STORAGE_KEYS.SETTINGS, updatedSettings);
    }

    return synced;
  }

  // 1-Click Export of all store data to a downloadable JSON file
  public exportStoreData(): string {
    return JSON.stringify({
      settings: this.getSettings(),
      categories: this.getCategories(),
      collections: this.getCollections(),
      products: this.getProducts(),
      homepage_sections: this.getHomepageSections(),
      banners: this.getBanners(),
      coupons: this.getCoupons(),
      exported_at: new Date().toISOString()
    }, null, 2);
  }

  // Import store data from an uploaded JSON file
  public importStoreData(jsonData: any) {
    this.applyStoreData(jsonData);
    this.syncToCloud().catch(() => {});
  }

  // -------------------------------------------------------------
  // SITE SETTINGS & EXCLUSIVE STOREFRONT
  // -------------------------------------------------------------
  public getSettings(): SiteSettings {
    return this.getLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_STORE_DATA.settings);
  }

  public async saveSettings(newSettings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = this.getSettings();
    const updated: SiteSettings = {
      ...current,
      ...newSettings,
      exclusive_settings: {
        title: newSettings.exclusive_settings?.title || current.exclusive_settings?.title || "MAHALEELA EXCLUSIVE",
        subtitle: newSettings.exclusive_settings?.subtitle || current.exclusive_settings?.subtitle || "A PRIVATE EDITION OF SELECTED PIECES. DIRECT ATELIER SHOPPING.",
        banner_image: newSettings.exclusive_settings?.banner_image ?? current.exclusive_settings?.banner_image ?? "",
        direct_shopping_enabled: newSettings.exclusive_settings?.direct_shopping_enabled ?? current.exclusive_settings?.direct_shopping_enabled ?? true
      },
      social: {
        ...(current.social || {}),
        ...(newSettings.social || {})
      },
      policies: {
        ...(current.policies || {}),
        ...(newSettings.policies || {})
      },
      cloud_sync: {
        ...(current.cloud_sync || {}),
        ...(newSettings.cloud_sync || {})
      }
    };

    this.setLocal(STORAGE_KEYS.SETTINGS, updated);
    this.notify({ type: 'settings', data: updated });
    this.syncToCloud().catch(() => {});

    // Background server sync if available
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {}

    return updated;
  }

  // -------------------------------------------------------------
  // BANNERS (HOMEPAGE, ANNOUNCEMENTS, COLLECTIONS)
  // -------------------------------------------------------------
  public getBanners(): Banner[] {
    return this.getLocal<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_STORE_DATA.banners || []);
  }

  public async saveBanner(bannerData: Partial<Banner>): Promise<Banner> {
    const banners = this.getBanners();
    let savedBanner: Banner;

    if (bannerData.id) {
      savedBanner = {
        ...banners.find(b => b.id === bannerData.id),
        ...bannerData
      } as Banner;
      const updated = banners.map(b => b.id === bannerData.id ? savedBanner : b);
      this.setLocal(STORAGE_KEYS.BANNERS, updated);
    } else {
      savedBanner = {
        id: `ban-${Date.now()}`,
        title: bannerData.title || 'MAHALEELA EDITORIAL BANNER',
        subtitle: bannerData.subtitle || '',
        desktop_image: bannerData.desktop_image || '',
        mobile_image: bannerData.mobile_image || bannerData.desktop_image || '',
        cta_text: bannerData.cta_text || 'EXPLORE NOW',
        cta_url: bannerData.cta_url || '/collections',
        position: bannerData.position || 'homepage_hero_top',
        is_active: bannerData.is_active ?? true
      };
      const updated = [savedBanner, ...banners];
      this.setLocal(STORAGE_KEYS.BANNERS, updated);
    }

    // Two-Way Sync: If hero banner is updated, also synchronize the hero homepage section
    if (savedBanner.position === 'homepage_hero_top' && savedBanner.is_active) {
      try {
        const sections = this.getHomepageSections();
        const heroIdx = sections.findIndex(s => s.section_type === 'hero');
        if (heroIdx !== -1) {
          sections[heroIdx] = {
            ...sections[heroIdx],
            title: savedBanner.title || sections[heroIdx].title,
            subtitle: savedBanner.subtitle || sections[heroIdx].subtitle,
            image_url: savedBanner.desktop_image || sections[heroIdx].image_url,
            mobile_image_url: savedBanner.mobile_image || sections[heroIdx].mobile_image_url,
            cta_text: savedBanner.cta_text || sections[heroIdx].cta_text,
            cta_url: savedBanner.cta_url || sections[heroIdx].cta_url
          };
          this.setLocal(STORAGE_KEYS.HOMEPAGE, sections);
        }
      } catch {}
    }

    this.notify({ type: 'banners', data: savedBanner });
    this.notify({ type: 'homepage', data: savedBanner });
    this.syncToCloud().catch(() => {});

    try {
      if (bannerData.id) {
        await fetch(`/api/banners/${bannerData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savedBanner)
        });
      } else {
        await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savedBanner)
        });
      }
    } catch {}

    return savedBanner;
  }

  public async deleteBanner(id: string): Promise<boolean> {
    const banners = this.getBanners().filter(b => b.id !== id);
    this.setLocal(STORAGE_KEYS.BANNERS, banners);
    this.notify({ type: 'banners', data: { deleted: id } });
    this.syncToCloud().catch(() => {});

    try {
      await fetch(`/api/banners/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  }

  // -------------------------------------------------------------
  // HOMEPAGE SECTIONS
  // -------------------------------------------------------------
  public getHomepageSections(): HomepageSection[] {
    return this.getLocal<HomepageSection[]>(STORAGE_KEYS.HOMEPAGE, INITIAL_STORE_DATA.homepage_sections || []);
  }

  public async saveHomepageSection(section: HomepageSection): Promise<HomepageSection> {
    const sections = this.getHomepageSections();
    const updated = sections.map(s => s.id === section.id ? section : s);
    this.setLocal(STORAGE_KEYS.HOMEPAGE, updated);

    // Two-Way Sync: If hero section is edited in Section Manager, update homepage_hero_top banner
    if (section.section_type === 'hero') {
      try {
        const banners = this.getBanners();
        let heroBan = banners.find(b => b.position === 'homepage_hero_top');
        if (heroBan) {
          heroBan.title = section.title || heroBan.title;
          heroBan.subtitle = section.subtitle || heroBan.subtitle;
          heroBan.desktop_image = section.image_url || heroBan.desktop_image;
          heroBan.mobile_image = section.mobile_image_url || section.image_url || heroBan.mobile_image;
          this.setLocal(STORAGE_KEYS.BANNERS, banners);
        } else if (section.image_url) {
          const newHeroBan: Banner = {
            id: `ban-${Date.now()}`,
            title: section.title || 'MAHALEELA CAMPAIGN',
            subtitle: section.subtitle || '',
            desktop_image: section.image_url,
            mobile_image: section.mobile_image_url || section.image_url,
            cta_text: section.cta_text || 'EXPLORE NOW',
            cta_url: section.cta_url || '/collections',
            position: 'homepage_hero_top',
            is_active: true
          };
          this.setLocal(STORAGE_KEYS.BANNERS, [newHeroBan, ...banners]);
        }
      } catch {}
    }

    this.notify({ type: 'homepage', data: section });
    this.notify({ type: 'banners', data: section });
    this.syncToCloud().catch(() => {});

    try {
      await fetch(`/api/homepage/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section)
      });
    } catch {}

    return section;
  }

  public async reorderHomepageSections(reordered: HomepageSection[]): Promise<HomepageSection[]> {
    this.setLocal(STORAGE_KEYS.HOMEPAGE, reordered);
    this.notify({ type: 'homepage', data: reordered });
    this.syncToCloud().catch(() => {});

    try {
      await fetch('/api/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reordered)
      });
    } catch {}

    return reordered;
  }

  // -------------------------------------------------------------
  // COLLECTIONS (WITH 9:16 VERTICAL PHOTO SUPPORT)
  // -------------------------------------------------------------
  public getCollections(): Collection[] {
    return this.getLocal<Collection[]>(STORAGE_KEYS.COLLECTIONS, []);
  }

  public getCollectionBySlug(slug: string): Collection | null {
    const cols = this.getCollections();
    return cols.find(c => c.slug.toLowerCase() === slug.toLowerCase() || c.id === slug) || null;
  }

  public async saveCollection(colData: Partial<Collection>): Promise<Collection> {
    const cols = this.getCollections();
    let savedCol: Collection;

    const slug = colData.slug || (colData.name ? colData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `col-${Date.now()}`);

    if (colData.id) {
      savedCol = {
        ...cols.find(c => c.id === colData.id),
        ...colData,
        slug
      } as Collection;
      const updated = cols.map(c => c.id === colData.id ? savedCol : c);
      this.setLocal(STORAGE_KEYS.COLLECTIONS, updated);
    } else {
      savedCol = {
        id: `col-${Date.now()}`,
        name: colData.name || 'New Atelier Collection',
        slug,
        description: colData.description || '',
        desktop_banner: colData.desktop_banner || '',
        mobile_banner: colData.mobile_banner || colData.desktop_banner || '',
        thumbnail: colData.thumbnail || colData.desktop_banner || '',
        is_published: colData.is_published ?? true,
        is_exclusive: colData.is_exclusive ?? false,
        sort_order: colData.sort_order || cols.length + 1,
        product_count: 0
      };
      const updated = [savedCol, ...cols];
      this.setLocal(STORAGE_KEYS.COLLECTIONS, updated);
    }

    this.notify({ type: 'collections', data: savedCol });
    this.syncToCloud().catch(() => {});

    try {
      const url = colData.id ? `/api/collections/${colData.id}` : '/api/collections';
      const method = colData.id ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedCol)
      });
    } catch {}

    return savedCol;
  }

  public async deleteCollection(id: string): Promise<boolean> {
    const cols = this.getCollections().filter(c => c.id !== id);
    this.setLocal(STORAGE_KEYS.COLLECTIONS, cols);
    this.notify({ type: 'collections', data: { deleted: id } });
    this.syncToCloud().catch(() => {});

    try {
      await fetch(`/api/collections/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  }

  // -------------------------------------------------------------
  // PRODUCTS (USER-ONLY PRODUCTS, ZERO DEMO PRODUCTS)
  // -------------------------------------------------------------
  public getProducts(filters?: { category?: string; collection?: string; is_exclusive?: boolean }): Product[] {
    let prods = this.getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []);

    if (filters?.is_exclusive !== undefined) {
      prods = prods.filter(p => Boolean(p.is_exclusive) === filters.is_exclusive);
    }
    if (filters?.category) {
      prods = prods.filter(p => p.category_id === filters.category || p.category.toLowerCase() === filters.category?.toLowerCase());
    }
    if (filters?.collection) {
      prods = prods.filter(p => p.collections && p.collections.includes(filters.collection!));
    }
    return prods;
  }

  public getProductBySlug(slug: string): Product | null {
    const prods = this.getProducts();
    return prods.find(p => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug) || null;
  }

  public async saveProduct(productData: Partial<Product>): Promise<Product> {
    const prods = this.getProducts();
    let savedProduct: Product;

    const slug = productData.slug || (productData.name ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `item-${Date.now()}`);

    if (productData.id) {
      savedProduct = {
        ...prods.find(p => p.id === productData.id),
        ...productData,
        slug
      } as Product;
      const updated = prods.map(p => p.id === productData.id ? savedProduct : p);
      this.setLocal(STORAGE_KEYS.PRODUCTS, updated);
    } else {
      savedProduct = {
        id: `prod-${Date.now()}`,
        name: productData.name || 'Atelier Garment',
        slug,
        sku: productData.sku || `ML-${Math.floor(1000 + Math.random() * 9000)}`,
        category_id: productData.category_id || 'cat-1',
        category: productData.category || 'T-Shirts',
        price: productData.price || 999,
        mrp: productData.mrp || (productData.price ? productData.price + 500 : 1499),
        discount: productData.discount || 0,
        description: productData.description || '',
        colours: productData.colours && productData.colours.length > 0 ? productData.colours : ['Deep Black'],
        sizes: productData.sizes && productData.sizes.length > 0 ? productData.sizes : ['S', 'M', 'L', 'XL'],
        stock: productData.stock || 20,
        images: productData.images && productData.images.length > 0 ? productData.images : [],
        collections: productData.collections || [],
        badges: productData.badges || ['NEW'],
        is_signature: productData.is_signature || false,
        is_exclusive: productData.is_exclusive || false,
        status: productData.status || 'published'
      };
      const updated = [savedProduct, ...prods];
      this.setLocal(STORAGE_KEYS.PRODUCTS, updated);
    }

    this.notify({ type: 'products', data: savedProduct });
    this.syncToCloud().catch(() => {});

    try {
      const url = productData.id ? `/api/products/${productData.id}` : '/api/products';
      const method = productData.id ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedProduct)
      });
    } catch {}

    return savedProduct;
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const prods = this.getProducts().filter(p => p.id !== id);
    this.setLocal(STORAGE_KEYS.PRODUCTS, prods);
    this.notify({ type: 'products', data: { deleted: id } });
    this.syncToCloud().catch(() => {});

    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  }

  // -------------------------------------------------------------
  // CATEGORIES
  // -------------------------------------------------------------
  public getCategories(): Category[] {
    return this.getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_STORE_DATA.categories || []);
  }

  public async saveCategory(catData: Partial<Category>): Promise<Category> {
    const cats = this.getCategories();
    let updatedCat: Category;

    if (catData.id) {
      updatedCat = {
        ...cats.find(c => c.id === catData.id),
        ...catData
      } as Category;
      const updated = cats.map(c => c.id === catData.id ? updatedCat : c);
      this.setLocal(STORAGE_KEYS.CATEGORIES, updated);
    } else {
      updatedCat = {
        id: `cat-${Date.now()}`,
        name: catData.name || 'Category',
        slug: catData.slug || 'category',
        description: catData.description || '',
        image: catData.image || '',
        count: 0,
        sort_order: cats.length + 1
      };
      const updated = [...cats, updatedCat];
      this.setLocal(STORAGE_KEYS.CATEGORIES, updated);
    }

    this.notify({ type: 'categories', data: updatedCat });
    this.syncToCloud().catch(() => {});

    try {
      await fetch(`/api/categories/${updatedCat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCat)
      });
    } catch {}

    return updatedCat;
  }

  // -------------------------------------------------------------
  // REAL ORDERS ONLY (ZERO FAKE ORDERS)
  // -------------------------------------------------------------
  public getOrders(): Order[] {
    return this.getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
  }

  public async createOrder(orderPayload: Partial<Order>): Promise<Order> {
    const orders = this.getOrders();
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: `ML-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      user_id: orderPayload.user_id || 'guest',
      customer_name: orderPayload.customer_name || 'Valued Patron',
      customer_email: orderPayload.customer_email || '',
      customer_phone: orderPayload.customer_phone || '',
      shipping_address: orderPayload.shipping_address || {
        address_line: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      items: orderPayload.items || [],
      subtotal: orderPayload.subtotal || 0,
      shipping_fee: orderPayload.shipping_fee ?? 0,
      cod_fee: orderPayload.cod_fee ?? 0,
      discount: orderPayload.discount ?? 0,
      coupon_code: orderPayload.coupon_code || '',
      total: orderPayload.total || 0,
      payment_method: orderPayload.payment_method || 'UPI',
      payment_status: orderPayload.payment_status || (orderPayload.payment_method === 'COD' ? 'pending' : 'completed'),
      order_status: 'placed',
      tracking_timeline: [
        {
          status: 'placed',
          label: 'Order Placed & Registered',
          time: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
          completed: true
        },
        {
          status: 'confirmed',
          label: 'Atelier Processing & Verification',
          time: 'Estimated within 24h',
          completed: false
        },
        {
          status: 'packed',
          label: 'Hand-Packed in Luxury Box',
          time: 'Pending',
          completed: false
        },
        {
          status: 'shipped',
          label: 'Dispatched via Express Courier',
          time: 'Pending',
          completed: false
        },
        {
          status: 'delivered',
          label: 'Delivered to Patron',
          time: 'Pending',
          completed: false
        }
      ],
      created_at: new Date().toISOString()
    };

    const updated = [newOrder, ...orders];
    this.setLocal(STORAGE_KEYS.ORDERS, updated);
    this.notify({ type: 'orders', data: newOrder });

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch {}

    return newOrder;
  }

  public async updateOrderStatus(id: string, status: string): Promise<Order | null> {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === id);
    if (!order) return null;

    const timeline = order.tracking_timeline.map(step => {
      if (step.status === status) {
        return {
          ...step,
          time: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
          completed: true
        };
      }
      return step;
    });

    const updatedOrder: Order = {
      ...order,
      order_status: status as any,
      tracking_timeline: timeline
    };

    const updated = orders.map(o => o.id === id ? updatedOrder : o);
    this.setLocal(STORAGE_KEYS.ORDERS, updated);
    this.notify({ type: 'orders', data: updatedOrder });

    try {
      await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch {}

    return updatedOrder;
  }

  // -------------------------------------------------------------
  // COUPONS
  // -------------------------------------------------------------
  public getCoupons(): Coupon[] {
    return this.getLocal<Coupon[]>(STORAGE_KEYS.COUPONS, (INITIAL_STORE_DATA.coupons as unknown as Coupon[]) || []);
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: Coupon; discount: number; error?: string } {
    const coupons = this.getCoupons();
    const found = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.is_active);

    if (!found) {
      return { valid: false, discount: 0, error: 'Invalid or expired promotional code' };
    }

    if (subtotal < found.min_order_value) {
      return { valid: false, discount: 0, error: `Minimum order value of ₹${found.min_order_value.toLocaleString('en-IN')} required.` };
    }

    let discount = 0;
    if (found.discount_type === 'percentage') {
      discount = (subtotal * found.discount_value) / 100;
      if (found.max_discount && discount > found.max_discount) {
        discount = found.max_discount;
      }
    } else {
      discount = found.discount_value;
    }

    return { valid: true, coupon: found, discount: Math.min(discount, subtotal) };
  }
}

export const storeService = new StoreService();
