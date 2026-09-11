import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, ArrowDown, Heart, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Category } from '../types';
import { storeService } from '../services/storeService';
import { ProductCatalogueModal } from '../components/ui/ProductCatalogueModal';

export const Exclusive: React.FC = () => {
  const { isWishlisted, toggleWishlist, settings } = useApp();
  const [categories, setCategories] = useState<Category[]>(() => storeService.getCategories());
  const [exclusiveProducts, setExclusiveProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  const loadAll = () => {
    try {
      setCategories(storeService.getCategories());
      const data = storeService.getProducts({ is_exclusive: true });
      setExclusiveProducts(data);
    } catch (e) {
      console.error('Exclusive fetch error:', e);
    }
  };

  useEffect(() => {
    loadAll();

    const unsubscribe = storeService.subscribe((event) => {
      if (event.type === 'products' || event.type === 'settings') {
        loadAll();
      }
    });
    return unsubscribe;
  }, []);

  // Filter exclusive products by horizontal category
  const filteredProducts = exclusiveProducts.filter(p => {
    if (p.status !== 'published') return false;
    if (selectedCategory === 'all') return true;
    return p.category_id === selectedCategory ||
           p.category.toLowerCase() === selectedCategory.toLowerCase() ||
           p.slug.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const scrollToProducts = () => {
    const el = document.getElementById('exclusive-products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const exclusiveSettings = settings.exclusive_settings || {
    title: "MAHALEELA EXCLUSIVE",
    subtitle: "A PRIVATE EDITION OF SELECTED PIECES. DIRECT ATELIER SHOPPING.",
    banner_image: "",
    direct_shopping_enabled: true
  };

  return (
    <div className="bg-black text-neutral-100 min-h-screen">
      {/* 1. EXCLUSIVE HERO BANNER - EXPLORE EXCLUSIVE PRODUCTS BUTTON */}
      <section className="relative h-[80vh] min-h-[550px] flex items-end justify-center pb-16 overflow-hidden border-b border-luxury-gold/30 bg-neutral-950">
        {exclusiveSettings.banner_image ? (
          <img
            src={exclusiveSettings.banner_image}
            alt="MAHALEELA EXCLUSIVE"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.55] contrast-125 transition-all duration-700 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-neutral-950 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <div className="relative z-10 text-center animate-bounce-subtle">
          <button
            onClick={scrollToProducts}
            className="group px-8 sm:px-12 py-4 bg-luxury-gold hover:bg-luxury-goldLight text-black text-xs sm:text-sm font-extrabold uppercase tracking-luxury rounded-sm transition-all duration-300 shadow-[0_0_30px_rgba(197,160,89,0.5)] flex items-center space-x-3 cursor-pointer mx-auto"
          >
            <span>EXPLORE EXCLUSIVE PRODUCTS</span>
            <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-1" />
          </button>
        </div>
      </section>

      {/* 2. HORIZONTAL CATEGORIES BAR & PRODUCTS */}
      <section id="exclusive-products-section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HORIZONTAL CATEGORIES BAR */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-luxury text-luxury-gold font-bold flex items-center space-x-1.5">
              <Crown className="w-4 h-4 text-luxury-gold" />
              <span>Exclusive Private Categories</span>
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              {filteredProducts.length} Piece{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div
            ref={categoriesScrollRef}
            className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs uppercase tracking-luxury font-bold transition-all duration-200 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-luxury-gold text-black shadow-[0_0_15px_rgba(197,160,89,0.4)] scale-105'
                  : 'bg-neutral-900/90 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600'
              }`}
            >
              All Exclusive
            </button>

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

        {/* 3. TWO-COLUMN PRODUCT GRID */}
        {filteredProducts.length === 0 ? (
          <div className="border border-luxury-gold/30 p-12 sm:p-16 text-center max-w-xl mx-auto rounded-lg bg-neutral-950/80 my-10 shadow-2xl">
            <Crown className="w-10 h-10 text-luxury-gold mx-auto mb-3" />
            <span className="text-luxury-gold uppercase text-[10px] tracking-luxury block mb-2 font-mono">PRIVATE ATELIER</span>
            <h3 className="font-serif text-2xl text-white uppercase tracking-wider mb-2">No Exclusive Pieces Currently Listed</h3>
            <p className="text-neutral-400 text-xs font-light leading-relaxed mb-6">
              Exclusive limited editions will appear here once tagged as "Exclusive" in the Admin Panel.
            </p>
            <Link
              to="/admin/products"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-bold rounded"
            >
              <span>+ Tag Products as Exclusive in Admin</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => {
              const isSaved = isWishlisted(product.id);
              const mrp = product.mrp || product.price;
              const price = product.price;
              const discount = product.discount || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);

              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-neutral-950 border border-luxury-gold/30 rounded-sm overflow-hidden hover:border-luxury-gold transition-all duration-300 cursor-pointer shadow-xl"
                  onClick={() => setSelectedProductForModal(product)}
                >
                  {/* Photo Container (9:16 Vertical Fashion Ratio) */}
                  <div className="relative aspect-[9/16] w-full overflow-hidden bg-neutral-900">
                    <img
                      src={product.images[0] || '/logo.png'}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* GOLDEN LUXURY DISCOUNT BADGE (Top-Left) */}
                    {discount > 0 && (
                      <div className="absolute top-2.5 left-2.5 z-10 bg-gradient-to-r from-luxury-gold to-yellow-600 text-black text-[10px] sm:text-[11px] font-black px-2.5 py-1 uppercase tracking-wider rounded-none shadow-md">
                        {discount}% OFF
                      </div>
                    )}

                    {/* Exclusive Tag */}
                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center space-x-1 px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-luxury-gold/60 text-luxury-gold text-[9px] font-bold tracking-luxury uppercase">
                      <Crown className="w-2.5 h-2.5" />
                      <span>Exclusive</span>
                    </div>

                    {/* Wishlist Heart Icon */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className="absolute bottom-10 right-2.5 p-2 bg-black/60 backdrop-blur-sm text-neutral-300 hover:text-luxury-gold transition-colors rounded-full"
                      aria-label="Save for later"
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-luxury-gold text-luxury-gold' : ''}`} />
                    </button>

                    {/* Quick View Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-sm py-2 px-3 text-center text-[10px] tracking-luxury uppercase text-luxury-gold font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Catalogue & Buy</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 sm:p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-luxury-gold font-mono block">
                        {product.category}
                      </span>
                      {/* BOLD MODERN PRODUCT TITLE */}
                      <h3 className="font-sans font-bold text-xs sm:text-sm text-white tracking-tight uppercase line-clamp-1 group-hover:text-luxury-gold transition-colors mt-0.5">
                        {product.name}
                      </h3>
                    </div>

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

      {/* PRODUCT CATALOGUE MODAL */}
      <ProductCatalogueModal
        product={selectedProductForModal}
        isOpen={!!selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
      />
    </div>
  );
};
