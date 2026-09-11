import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, Heart, Sparkles, ChevronRight, ChevronLeft, ShoppingBag, Eye, Megaphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Category, Banner } from '../types';
import { storeService } from '../services/storeService';
import { ProductCatalogueModal } from '../components/ui/ProductCatalogueModal';

export const Home: React.FC = () => {
  const { isWishlisted, toggleWishlist, addToCart, setIsCartOpen, settings } = useApp();
  const [categories, setCategories] = useState<Category[]>(() => storeService.getCategories());
  const [products, setProducts] = useState<Product[]>(() => storeService.getProducts());
  const [banners, setBanners] = useState<Banner[]>(() => storeService.getBanners());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  // Bottom gallery scrolling ref
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  const loadAllData = () => {
    try {
      setCategories(storeService.getCategories());
      setProducts(storeService.getProducts());
      setBanners(storeService.getBanners());
    } catch (e) {
      console.error('Home load error:', e);
    }
  };

  useEffect(() => {
    loadAllData();

    // Subscribe to store updates so any changes made in Admin update immediately
    const unsubscribe = storeService.subscribe(() => {
      loadAllData();
    });
    return unsubscribe;
  }, []);

  // Live active banners from Admin Banners
  const heroBanner = banners.find(b => b.is_active && b.position === 'homepage_hero_top');
  const announcementBanner = banners.find(b => b.is_active && b.position === 'top_announcement');

  // Filter products based on selected horizontal category
  const filteredProducts = products.filter(p => {
    if (p.status !== 'published') return false;
    if (selectedCategory === 'all') return true;
    return p.category_id === selectedCategory || 
           p.category.toLowerCase() === selectedCategory.toLowerCase() ||
           p.slug.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  // Scroll to products section smoothly
  const scrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll bottom gallery horizontally
  const scrollGallery = (direction: 'left' | 'right') => {
    if (galleryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      galleryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Bottom gallery photos from settings or fallback
  const galleryPhotos = settings.bottom_gallery && settings.bottom_gallery.length > 0
    ? settings.bottom_gallery
    : [];

  return (
    <div className="bg-luxury-black text-neutral-100 min-h-screen">
      
      {/* Top Announcement Strip (from Admin Banners) */}
      {announcementBanner && (
        <div className="bg-luxury-gold text-black py-2 px-4 text-center text-xs font-semibold uppercase tracking-luxury flex items-center justify-center space-x-2 z-20 relative shadow-md">
          <Megaphone className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{announcementBanner.subtitle || announcementBanner.title}</span>
          {announcementBanner.cta_url && (
            <Link to={announcementBanner.cta_url} className="underline hover:opacity-80 ml-2 font-bold inline-flex items-center">
              <span>{announcementBanner.cta_text || 'Explore'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* 1. HERO BANNER - NO TEXT OVERLAY, ONLY "EXPLORE PRODUCTS" BUTTON */}
      <section className="relative h-[85vh] min-h-[600px] w-full flex items-end justify-center pb-16 overflow-hidden">
        {/* Banner Background Image */}
        <div className="absolute inset-0 z-0">
          {heroBanner?.desktop_image ? (
            <img
              src={heroBanner.desktop_image}
              alt="MAHALEELA FASHION"
              className="w-full h-full object-cover object-center filter brightness-[0.85] contrast-[1.05] transition-transform duration-1000 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-neutral-950 via-neutral-900 to-luxury-black flex items-center justify-center">
              <div className="w-64 h-64 rounded-full border border-luxury-gold/20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <img src="/logo.png" alt="MAHALEELA FASHION" className="w-44 h-auto opacity-40 filter grayscale" />
              </div>
            </div>
          )}
          {/* Subtle Bottom Fade Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-black/20 to-transparent" />
        </div>

        {/* ONLY ONE ACTION BUTTON: EXPLORE PRODUCTS (Smoothly Scrolls Down) */}
        <div className="relative z-10 text-center animate-bounce-subtle">
          <button
            onClick={scrollToProducts}
            className="group px-8 sm:px-12 py-4 bg-luxury-gold hover:bg-luxury-goldLight text-black text-xs sm:text-sm font-extrabold uppercase tracking-luxury rounded-sm transition-all duration-300 shadow-[0_0_30px_rgba(197,160,89,0.5)] flex items-center space-x-3 cursor-pointer"
          >
            <span>EXPLORE PRODUCTS</span>
            <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-1" />
          </button>
        </div>
      </section>

      {/* 2. HORIZONTAL CATEGORIES BAR & PRODUCTS SECTION */}
      <section id="products-section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HORIZONTAL CATEGORIES BAR (Scrolling Horizontally in a Line) */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-luxury text-luxury-gold font-bold flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
              <span>Browse By Category</span>
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              {filteredProducts.length} Piece{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Horizontally scrolling category chips */}
          <div
            ref={categoriesScrollRef}
            className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* "All" Category Pill */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs uppercase tracking-luxury font-bold transition-all duration-200 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-luxury-gold text-black shadow-[0_0_15px_rgba(197,160,89,0.4)] scale-105'
                  : 'bg-neutral-900/90 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600'
              }`}
            >
              All Products
            </button>

            {/* Dynamic Category Pills (T-Shirts, Shirts, Hoodies, Keychains, Caps, Mugs, etc.) */}
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id || selectedCategory.toLowerCase() === cat.slug.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug || cat.id)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs uppercase tracking-luxury font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-luxury-gold text-black shadow-[0_0_15px_rgba(197,160,89,0.4)] scale-105'
                      : 'bg-neutral-900/90 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. TWO-COLUMN PRODUCT GRID (Vertical Scrolling) */}
        {filteredProducts.length === 0 ? (
          <div className="border border-neutral-800/80 p-12 sm:p-16 text-center max-w-xl mx-auto rounded-lg bg-neutral-950/60 my-10">
            <span className="text-luxury-gold uppercase text-[10px] tracking-luxury block mb-2 font-mono">MAHALEELA ATELIER</span>
            <h3 className="font-serif text-2xl text-white uppercase tracking-wider mb-2">No Products Added Yet</h3>
            <p className="text-neutral-400 text-xs font-light leading-relaxed mb-6">
              You haven't uploaded products in this category yet. Log into the Admin Panel to upload pieces with 4K photos.
            </p>
            <Link
              to="/admin/products"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-bold rounded"
            >
              <span>+ Upload Products in Admin</span>
            </Link>
          </div>
        ) : (
          /* TWO ROWS / TWO COLUMNS (Grid of 2 on Mobile & Desktop responsive) */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => {
              const isSaved = isWishlisted(product.id);
              const mrp = product.mrp || product.price;
              const price = product.price;
              const discount = product.discount || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);

              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-neutral-950 border border-neutral-800/80 rounded-sm overflow-hidden hover:border-luxury-gold/50 transition-all duration-300 cursor-pointer shadow-lg"
                  onClick={() => setSelectedProductForModal(product)}
                >
                  {/* Photo Container (Strict 9:16 / 3:4 Vertical Fashion Ratio) */}
                  <div className="relative aspect-[9/16] w-full overflow-hidden bg-neutral-900">
                    <img
                      src={product.images[0] || '/logo.png'}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* GOLDEN LUXURY DISCOUNT BADGE (Top-Left of Product Photo) */}
                    {discount > 0 && (
                      <div className="absolute top-2.5 left-2.5 z-10 bg-gradient-to-r from-luxury-gold to-yellow-600 text-black text-[10px] sm:text-[11px] font-black px-2.5 py-1 uppercase tracking-wider rounded-none shadow-md">
                        {discount}% OFF
                      </div>
                    )}

                    {/* Wishlist Heart Icon */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 bg-black/60 backdrop-blur-sm text-neutral-300 hover:text-luxury-gold transition-colors rounded-full"
                      aria-label="Save for later"
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-luxury-gold text-luxury-gold' : ''}`} />
                    </button>

                    {/* Available Colours Pill Preview */}
                    {product.colours && product.colours.length > 0 && (
                      <div className="absolute bottom-2.5 left-2.5 z-10 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] uppercase tracking-luxury text-neutral-300 font-mono">
                        {product.colours.length} Colour{product.colours.length !== 1 ? 's' : ''}
                      </div>
                    )}

                    {/* Quick View Overlay on Desktop */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-sm py-2 px-3 text-center text-[10px] tracking-luxury uppercase text-luxury-gold font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Catalogue & Buy</span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-neutral-500 font-mono block">
                        {product.category}
                      </span>
                      {/* BOLD MODERN PRODUCT TITLE */}
                      <h3 className="font-sans font-bold text-xs sm:text-sm text-white tracking-tight uppercase line-clamp-1 group-hover:text-luxury-gold transition-colors mt-0.5">
                        {product.name}
                      </h3>
                    </div>

                    {/* Price & MRP Strike-through */}
                    <div className="flex items-baseline space-x-2 pt-1">
                      <span className="text-white font-bold text-sm sm:text-base font-mono">
                        ₹{price.toLocaleString()}
                      </span>
                      {mrp > price && (
                        <span className="text-neutral-500 line-through text-[11px] font-mono">
                          ₹{mrp.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. BOTTOM HORIZONTAL PHOTO GALLERY (9:16 VERTICAL RATIO) */}
      <section className="py-16 border-t border-neutral-900 bg-neutral-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-bold block mb-1">
                Atelier Visuals
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-white uppercase font-light tracking-wider">
                Photo Gallery (9:16)
              </h2>
            </div>

            {/* Scroll Navigation Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => scrollGallery('left')}
                className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded-full transition-colors"
                aria-label="Previous Photos"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollGallery('right')}
                className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded-full transition-colors"
                aria-label="Next Photos"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontally Scrolling 9:16 Photo Strip */}
          <div
            ref={galleryScrollRef}
            className="flex items-center space-x-4 sm:space-x-6 overflow-x-auto pb-4 scroll-smooth scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {galleryPhotos.length > 0 ? (
              galleryPhotos.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex-shrink-0 w-56 sm:w-64 aspect-[9/16] rounded-sm overflow-hidden bg-neutral-900 border border-neutral-800 group relative shadow-xl"
                >
                  <img
                    src={item.image_url}
                    alt={item.title || `Gallery ${idx + 1}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  {item.title && (
                    <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 border border-luxury-gold/30">
                      <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
                        {item.title}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              /* If no gallery uploaded yet in settings, show placeholder inviting owner to upload */
              <div className="w-full py-12 border border-neutral-800/80 rounded bg-neutral-900/40 text-center p-8">
                <span className="text-luxury-gold text-xs uppercase tracking-luxury font-semibold block mb-2">
                  Atelier Lookbook
                </span>
                <p className="text-xs text-neutral-400 max-w-md mx-auto mb-4">
                  Upload high-resolution 4K photos in 9:16 vertical ratio in <strong>Admin Panel → Site Settings</strong> to feature them in this horizontal gallery.
                </p>
                <Link
                  to="/admin/settings"
                  className="inline-flex items-center space-x-2 px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-luxury-gold border border-neutral-700 text-xs uppercase tracking-luxury rounded transition-colors"
                >
                  <span>+ Upload Gallery Photos in Admin</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. PRODUCT CATALOGUE MODAL (Circular colours, coupon, shipping, dual WhatsApp + Website order) */}
      <ProductCatalogueModal
        product={selectedProductForModal}
        isOpen={!!selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
      />

    </div>
  );
};
