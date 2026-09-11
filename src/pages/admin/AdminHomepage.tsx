import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sliders, Sparkles, Image, CheckCircle, Upload, ArrowDown, Package, FolderTree, Trash2, Eye, ExternalLink, Plus } from 'lucide-react';
import { Category, Product, Banner } from '../../types';
import { storeService } from '../../services/storeService';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { useApp } from '../../context/AppContext';

export const AdminHomepage: React.FC = () => {
  const { settings, refreshSettings } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [heroBanner, setHeroBanner] = useState<Banner | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Bottom gallery photos from settings
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const fetchAll = () => {
    try {
      const cats = storeService.getCategories();
      const prods = storeService.getProducts();
      const bans = storeService.getBanners();
      setCategories(cats);
      setProducts(prods.filter(p => p.status === 'published'));
      setBanners(bans);

      const hero = bans.find(b => b.is_active && b.position === 'homepage_hero_top') || bans[0] || null;
      setHeroBanner(hero);

      const curSettings = storeService.getSettings();
      if (curSettings.bottom_gallery) {
        setGalleryImages(curSettings.bottom_gallery.map(g => g.image_url));
      }
    } catch (e) {
      console.error('Error fetching homepage data:', e);
    }
  };

  useEffect(() => {
    fetchAll();

    const unsubscribe = storeService.subscribe((event) => {
      if (event.type === 'banners' || event.type === 'categories' || event.type === 'products' || event.type === 'settings') {
        fetchAll();
      }
    });
    return unsubscribe;
  }, []);

  // Save Banner Photo
  const handleSaveHeroBannerImage = async (newImages: string[]) => {
    if (!newImages || newImages.length === 0) return;
    const imgUrl = newImages[newImages.length - 1]; // take latest uploaded

    setIsSaving(true);
    try {
      if (heroBanner) {
        await storeService.saveBanner({
          ...heroBanner,
          desktop_image: imgUrl,
          mobile_image: imgUrl,
          position: 'homepage_hero_top',
          is_active: true
        });
      } else {
        await storeService.saveBanner({
          title: 'MAHALEELA EDITORIAL',
          subtitle: '',
          desktop_image: imgUrl,
          mobile_image: imgUrl,
          cta_text: 'EXPLORE PRODUCTS',
          cta_url: '#products-section',
          position: 'homepage_hero_top',
          is_active: true
        });
      }
      showNotification();
      fetchAll();
    } catch (e) {
      console.error('Failed to save banner:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Save Bottom 9:16 Photo Gallery
  const handleSaveBottomGallery = async (newImages: string[]) => {
    setGalleryImages(newImages);
    setIsSaving(true);
    try {
      const curSettings = storeService.getSettings();
      const updatedGallery = newImages.map((url, idx) => ({
        id: `gal-${idx}-${Date.now()}`,
        image_url: url,
        title: `Lookbook 0${idx + 1}`
      }));

      await storeService.saveSettings({
        ...curSettings,
        bottom_gallery: updatedGallery
      });
      await refreshSettings();
      showNotification();
    } catch (e) {
      console.error('Failed to save bottom gallery:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
        <div>
          <div className="flex items-center space-x-2 text-luxury-gold text-xs uppercase tracking-luxury font-medium mb-1">
            <Sliders className="w-4 h-4" />
            <span>HOMEPAGE ARCHITECTURE CMS</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wider font-light">
            Homepage Layout Manager
          </h1>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Manage the 4 active homepage components: <strong>Hero Banner (Photo Only)</strong>, <strong>Horizontal Categories Bar</strong>, <strong>2-Column Products</strong>, and <strong>Bottom 9:16 Gallery</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {saveSuccess && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-950/80 border border-green-700 text-green-400 rounded text-xs animate-fade-in font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Saved & Live on Storefront</span>
            </div>
          )}
          <Link
            to="/"
            target="_blank"
            className="flex items-center space-x-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-luxury-gold border border-neutral-700 rounded text-xs uppercase tracking-wider font-semibold transition-colors"
          >
            <span>View Live Home</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Clean Layout Notice */}
      <div className="p-4 bg-neutral-950 border border-luxury-gold/30 rounded-lg flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3 text-neutral-300">
          <Sparkles className="w-4 h-4 text-luxury-gold flex-shrink-0" />
          <span>
            <strong>Storefront Cleaned:</strong> Editorial intro, new arrivals, editorial split, signature feature, stories, and premium edit have been permanently removed. Your homepage strictly features the 4 components below.
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. TOP HERO BANNER (Photo Only, No Text Overlay)     */}
      {/* ---------------------------------------------------- */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center space-x-2">
            <Image className="w-4 h-4 text-luxury-gold" />
            <h3 className="font-serif text-base uppercase tracking-wider text-white">
              1. Top Hero Banner (4K Photo Only — No Text Overlay)
            </h3>
          </div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-mono font-semibold">
            Status: Active
          </span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Upload a high-resolution 4K banner photo (Recommended: <strong>16:9</strong> or <strong>21:9 Ultra-Wide</strong>). On the storefront, all text overlays are removed and replaced by the smooth-scrolling <strong>"EXPLORE PRODUCTS"</strong> button.
        </p>

        {/* Current Banner Live Preview */}
        {heroBanner?.desktop_image ? (
          <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full rounded overflow-hidden border border-neutral-800 bg-black">
            <img
              src={heroBanner.desktop_image}
              alt="Homepage Banner"
              className="w-full h-full object-cover object-center filter brightness-90"
            />
            {/* Auto-scroll button preview */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center">
              <div className="px-6 py-2 bg-luxury-gold text-black text-[10px] font-extrabold uppercase tracking-luxury rounded-sm flex items-center space-x-2 shadow-lg">
                <span>EXPLORE PRODUCTS</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 text-[10px] font-mono text-luxury-gold border border-luxury-gold/40">
              Live Storefront Preview (No Text)
            </span>
          </div>
        ) : (
          <div className="aspect-[16/7] w-full rounded border border-dashed border-neutral-800 flex flex-col items-center justify-center text-neutral-500 text-xs">
            <Image className="w-8 h-8 mb-2 opacity-40" />
            <span>No Hero Banner photo uploaded yet</span>
          </div>
        )}

        {/* Direct Device 4K Uploader */}
        <div className="bg-neutral-950 p-4 rounded border border-neutral-800">
          <ImageUploader
            images={heroBanner?.desktop_image ? [heroBanner.desktop_image] : []}
            onChange={handleSaveHeroBannerImage}
            multiple={false}
            label="Upload / Change 4K Banner Photo Directly From Device"
            helperText="Select a 4K photo from your phone or computer. The live homepage banner updates instantly upon selection."
          />
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. HORIZONTAL CATEGORIES BAR                        */}
      {/* ---------------------------------------------------- */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center space-x-2">
            <FolderTree className="w-4 h-4 text-luxury-gold" />
            <h3 className="font-serif text-base uppercase tracking-wider text-white">
              2. Horizontal Categories Bar (Swipeable Chips)
            </h3>
          </div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-mono">
            {categories.length} Categories Live
          </span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          These categories scroll horizontally in a sleek line directly above the products. Patrons click any category pill to filter and view items on the home screen immediately.
        </p>

        {/* Horizontal Category Pill Preview */}
        <div className="p-4 bg-neutral-950 rounded border border-neutral-800 space-y-3">
          <span className="text-[10px] uppercase tracking-luxury text-neutral-500 font-mono block">
            Horizontal Line Preview:
          </span>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="px-4 py-1.5 bg-luxury-gold text-black rounded-full text-xs font-bold uppercase tracking-luxury shadow-md flex-shrink-0">
              All Products
            </span>
            {categories.map((c) => (
              <span
                key={c.id}
                className="px-4 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-full text-xs font-medium uppercase tracking-luxury flex-shrink-0"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-neutral-400">
            Need to add new categories (e.g. Mobile Covers, Caps, Mugs)?
          </span>
          <Link
            to="/admin/categories"
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-luxury-gold border border-neutral-700 rounded text-xs uppercase tracking-wider font-semibold transition-colors"
          >
            Manage Categories
          </Link>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. 2-COLUMN PRODUCTS CATALOG OVERVIEW               */}
      {/* ---------------------------------------------------- */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-luxury-gold" />
            <h3 className="font-serif text-base uppercase tracking-wider text-white">
              3. Homepage Products Display (2-Column Grid)
            </h3>
          </div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-mono font-semibold">
            {products.length} Products Published
          </span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Products are displayed in a clean <strong>2-column vertical scrolling grid</strong> (left & right, down left & right) with <strong>golden discount badges</strong> on the top-left of each photo. Clicking any product opens the circular color picker and ordering dialogue.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-950 p-4 rounded border border-neutral-800">
          {products.slice(0, 4).map((p) => {
            const mrp = p.mrp || p.price;
            const discount = p.discount || (mrp > p.price ? Math.round(((mrp - p.price) / mrp) * 100) : 0);
            return (
              <div key={p.id} className="relative aspect-[9/16] rounded overflow-hidden border border-neutral-800 bg-neutral-900">
                <img src={p.images[0] || '/logo.png'} alt={p.name} className="w-full h-full object-cover" />
                {discount > 0 && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-luxury-gold to-yellow-600 text-black text-[9px] font-black px-1.5 py-0.5 uppercase">
                    {discount}% OFF
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-black/80 p-2 text-[10px]">
                  <span className="text-white font-bold block truncate uppercase">{p.name}</span>
                  <span className="text-luxury-gold font-mono font-semibold">₹{p.price.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-neutral-400">
            Upload new products with auto-generated discounts and circular colors:
          </span>
          <Link
            to="/admin/products"
            className="flex items-center space-x-1.5 px-4 py-2 bg-luxury-gold hover:bg-luxury-goldLight text-black rounded text-xs uppercase tracking-luxury font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Edit Products</span>
          </Link>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 4. BOTTOM 9:16 PHOTO GALLERY (4K Direct Upload)     */}
      {/* ---------------------------------------------------- */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-luxury-gold" />
            <h3 className="font-serif text-base uppercase tracking-wider text-white">
              4. Bottom Homepage Photo Gallery (9:16 Vertical, 4K)
            </h3>
          </div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-mono font-semibold">
            {galleryImages.length} Photos Live
          </span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Upload 4K photos in strict <strong>9:16 vertical ratio</strong> directly from your phone or computer. These photos scroll horizontally at the bottom of the home screen right above the footer.
        </p>

        {/* Live Horizontal Preview */}
        {galleryImages.length > 0 ? (
          <div className="p-4 bg-neutral-950 rounded border border-neutral-800 space-y-2">
            <span className="text-[10px] uppercase tracking-luxury text-neutral-500 font-mono block">
              Live Horizontal Scrolling Gallery:
            </span>
            <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-28 sm:w-36 aspect-[9/16] rounded overflow-hidden border border-neutral-800 bg-neutral-900 group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => {
                      const updated = galleryImages.filter((_, i) => i !== idx);
                      handleSaveBottomGallery(updated);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-red-900 text-red-400 rounded-full transition-colors"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 left-1.5 text-[9px] font-mono text-luxury-gold bg-black/70 px-1">
                    0{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 border border-dashed border-neutral-800 rounded bg-neutral-950 text-center text-xs text-neutral-500">
            No bottom gallery photos uploaded yet. Use the uploader below to add photos in 9:16 vertical ratio.
          </div>
        )}

        {/* Direct Device 4K Uploader for Bottom Gallery */}
        <div className="bg-neutral-950 p-4 rounded border border-neutral-800">
          <ImageUploader
            images={galleryImages}
            onChange={handleSaveBottomGallery}
            multiple={true}
            label="Upload 4K Photos Directly From Device (9:16 Vertical Ratio)"
            helperText="Upload vertical photos directly from your phone or computer in full 4K clarity. They appear in the horizontal bottom gallery instantly."
          />
        </div>
      </div>
    </div>
  );
};
