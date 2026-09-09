import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, Sparkles, ArrowRight, ShieldCheck, ShoppingBag, Eye, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { storeService } from '../services/storeService';

export const Exclusive: React.FC = () => {
  const { addToCart, setIsCartOpen } = useApp();
  const [exclusiveSettings, setExclusiveSettings] = useState(() => {
    return storeService.getSettings().exclusive_settings || {
      title: "MAHALEELA EXCLUSIVE",
      subtitle: "A PRIVATE EDITION OF SELECTED PIECES. DIRECT ATELIER SHOPPING.",
      banner_image: "",
      direct_shopping_enabled: true
    };
  });
  const [exclusiveProducts, setExclusiveProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, { size: string; colour: string }>>({});
  const navigate = useNavigate();

  const loadAll = () => {
    try {
      const s = storeService.getSettings();
      if (s && s.exclusive_settings) {
        setExclusiveSettings(s.exclusive_settings);
      }
      const data = storeService.getProducts({ is_exclusive: true });
      setExclusiveProducts(data);
      const variants: Record<string, { size: string; colour: string }> = {};
      data.forEach(p => {
        variants[p.id] = {
          size: p.sizes?.[0] || 'M',
          colour: p.colours?.[0] || 'Standard'
        };
      });
      setSelectedVariants(variants);
    } catch (e) {
      console.error('Exclusive fetch error:', e);
    } finally {
      setLoading(false);
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

  const handleVariantChange = (productId: string, type: 'size' | 'colour', value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [type]: value
      }
    }));
  };

  const handleDirectAdd = (product: Product) => {
    const variant = selectedVariants[product.id] || {
      size: product.sizes?.[0] || 'M',
      colour: product.colours?.[0] || 'Standard'
    };
    addToCart(product, variant.colour, variant.size);
    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product) => {
    const variant = selectedVariants[product.id] || {
      size: product.sizes?.[0] || 'M',
      colour: product.colours?.[0] || 'Standard'
    };
    addToCart(product, variant.colour, variant.size);
    navigate('/checkout');
  };

  return (
    <div className="bg-black text-neutral-100 min-h-screen">
      {/* 1. EXCLUSIVE HERO (Dynamic from Admin Settings) */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden border-b border-luxury-gold/30 bg-neutral-950">
        {exclusiveSettings.banner_image ? (
          <img
            src={exclusiveSettings.banner_image}
            alt={exclusiveSettings.title || "MAHALEELA Private Lounge"}
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.45] contrast-125 transition-all duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-neutral-950 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-luxury-gold/10 border border-luxury-gold/50 text-luxury-gold text-xs tracking-luxury uppercase mb-6 shadow-[0_0_20px_rgba(197,160,89,0.2)]">
            <Crown className="w-4 h-4" />
            <span>PRIVATE EDITION • DIRECT SHOPPING OPEN</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl tracking-widest uppercase font-light text-white leading-none mb-6">
            {exclusiveSettings.title || "MAHALEELA EXCLUSIVE"}
          </h1>

          <p className="text-xs sm:text-sm tracking-luxury uppercase text-neutral-300 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            {exclusiveSettings.subtitle || "A PRIVATE EDITION OF SELECTED PIECES. DIRECT ATELIER SHOPPING."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <a
              href="#exclusive-catalog"
              className="px-8 py-3.5 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors shadow-[0_0_25px_rgba(197,160,89,0.3)] flex items-center space-x-2"
            >
              <span>Shop Exclusive Collection</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/collections"
              className="px-8 py-3.5 border border-luxury-gold/50 text-luxury-gold text-xs uppercase tracking-luxury font-medium hover:bg-luxury-gold hover:text-black transition-colors"
            >
              Browse All Collections
            </Link>
          </div>
        </div>
      </section>

      {/* 2. LUXURY ATELIER STATUS BAR (Seamless Direct Access) */}
      <section className="bg-neutral-950 py-5 border-b border-neutral-850 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-luxury-gold" />
            <span>
              Storefront Status:{' '}
              <strong className="text-luxury-gold uppercase tracking-wider font-semibold">
                Direct Shopping Active — Instant Checkout Open to All Patrons
              </strong>
            </span>
          </div>
          <div className="text-neutral-400 uppercase tracking-wider text-[11px] flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
            <span>Complimentary Insured Courier on All Exclusive Orders</span>
          </div>
        </div>
      </section>

      {/* 3. EXCLUSIVE PRODUCTS CATALOG (Strict 9:16 Ratio & Direct Shopping) */}
      <section id="exclusive-catalog" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block mb-2 font-medium">
            Atelier Curated Edition
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl tracking-widest uppercase font-light text-white">
            EXCLUSIVE PIECES
          </h2>
          <div className="w-12 h-[1px] bg-luxury-gold mx-auto mt-4" />
          <p className="text-xs text-neutral-400 uppercase tracking-wider mt-3 font-light">
            Select size, choose colour, and acquire directly without waitlist.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xs uppercase tracking-widest text-neutral-400 animate-pulse">
            Presenting private pieces...
          </div>
        ) : exclusiveProducts.length === 0 ? (
          <div className="text-center py-20 text-neutral-400 text-sm">
            Exclusive releases are currently being prepared in the atelier.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {exclusiveProducts.map((product) => {
              const currentVariant = selectedVariants[product.id] || {
                size: product.sizes?.[0] || 'M',
                colour: product.colours?.[0] || 'Standard'
              };

              return (
                <div
                  key={product.id}
                  className="group bg-neutral-950 border border-luxury-gold/30 hover:border-luxury-gold p-5 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(197,160,89,0.15)]"
                >
                  <div>
                    {/* 9:16 Vertical Catalog Photo */}
                    <div className="aspect-[9/16] overflow-hidden bg-neutral-900 relative mb-4">
                      <Link to={`/product/${product.slug}`}>
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover object-center filter contrast-110 group-hover:scale-105 transition-transform duration-700"
                        />
                      </Link>
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/85 border border-luxury-gold text-luxury-gold text-[9px] tracking-luxury uppercase font-semibold">
                        Exclusive Edition
                      </div>
                      <Link
                        to={`/product/${product.slug}`}
                        className="absolute bottom-3 right-3 p-2 bg-black/80 hover:bg-luxury-gold hover:text-black text-neutral-300 rounded transition-colors"
                        title="View Full Editorial"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-2">
                      <span className="text-[9px] tracking-luxury uppercase text-neutral-500 block">
                        {product.category}
                      </span>
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="font-serif text-lg text-white group-hover:text-luxury-gold transition-colors font-light">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Direct Variant Selectors */}
                    <div className="mt-4 pt-4 border-t border-neutral-850 space-y-3">
                      {/* Colours */}
                      {product.colours && product.colours.length > 0 && (
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-neutral-500 mb-1">
                            Colour: <span className="text-white">{currentVariant.colour}</span>
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {product.colours.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => handleVariantChange(product.id, 'colour', c)}
                                className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border transition-colors ${
                                  currentVariant.colour === c
                                    ? 'border-luxury-gold text-luxury-gold bg-luxury-gold/15 font-semibold'
                                    : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sizes */}
                      {product.sizes && product.sizes.length > 0 && (
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-neutral-500 mb-1">
                            Size: <span className="text-white">{currentVariant.size}</span>
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {product.sizes.map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleVariantChange(product.id, 'size', s)}
                                className={`px-2.5 py-0.5 text-[10px] uppercase font-mono border transition-colors ${
                                  currentVariant.size === s
                                    ? 'border-luxury-gold text-luxury-gold bg-luxury-gold/15 font-bold'
                                    : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="pt-5 mt-5 border-t border-neutral-850">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="text-xs text-neutral-500 uppercase tracking-wider block text-[9px]">Atelier Price</span>
                        <span className="text-lg font-serif text-luxury-gold font-medium">₹{product.price.toLocaleString()}</span>
                      </div>
                      {product.mrp > product.price && (
                        <span className="text-xs text-neutral-500 line-through">₹{product.mrp.toLocaleString()}</span>
                      )}
                    </div>

                    {/* Direct Shopping Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleDirectAdd(product)}
                        className="py-2.5 px-2 border border-luxury-gold/60 text-luxury-gold hover:bg-luxury-gold hover:text-black text-[11px] uppercase tracking-luxury font-semibold transition-colors flex items-center justify-center space-x-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </button>
                      <button
                        onClick={() => handleBuyNow(product)}
                        className="py-2.5 px-2 bg-luxury-gold text-black hover:bg-luxury-goldLight text-[11px] uppercase tracking-luxury font-semibold transition-colors flex items-center justify-center space-x-1 shadow-[0_0_15px_rgba(197,160,89,0.25)]"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. ATELIER BRAND ETHOS */}
      <section className="py-20 bg-neutral-950 border-t border-luxury-gold/25">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <Crown className="w-8 h-8 text-luxury-gold mx-auto" />
          <h2 className="font-serif text-2xl sm:text-4xl tracking-widest uppercase font-light text-white">
            THE MAHALEELA ATELIER PROMISE
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed max-w-xl mx-auto">
            Every piece crafted for MAHALEELA EXCLUSIVE undergoes individualized inspection in our Bengaluru atelier. Sealed in signature luxury packaging with archival authentication tags.
          </p>
          <div className="pt-2">
            <Link
              to="/clothing"
              className="inline-block px-8 py-3.5 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black uppercase text-xs tracking-luxury font-semibold transition-all duration-300"
            >
              Explore Ready-To-Wear Menswear
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
