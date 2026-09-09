import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowRight, Heart, Sparkles, ChevronRight, Crown, Megaphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, HomepageSection, Category, Banner, Collection } from '../types';
import { storeService } from '../services/storeService';

export const Home: React.FC = () => {
  const { isWishlisted, toggleWishlist, addToCart, settings } = useApp();
  const [sections, setSections] = useState<HomepageSection[]>(() => storeService.getHomepageSections().filter(s => s.is_visible));
  const [categories, setCategories] = useState<Category[]>(() => storeService.getCategories());
  const [products, setProducts] = useState<Product[]>(() => storeService.getProducts());
  const [banners, setBanners] = useState<Banner[]>(() => storeService.getBanners());
  const [collections, setCollections] = useState<Collection[]>(() => storeService.getCollections().filter(c => c.is_published));
  const [hoveredCategoryImg, setHoveredCategoryImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadAllData = () => {
    try {
      const sec = storeService.getHomepageSections();
      const cat = storeService.getCategories();
      const prod = storeService.getProducts();
      const ban = storeService.getBanners();
      const col = storeService.getCollections().filter(c => c.is_published);

      setSections(sec.filter(s => s.is_visible));
      setCategories(cat);
      setProducts(prod);
      setBanners(ban);
      setCollections(col);

      if (cat.length > 0 && !hoveredCategoryImg && cat[0].image) {
        setHoveredCategoryImg(cat[0].image);
      }
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

  const heroSection = sections.find(s => s.section_type === 'hero');
  const introSection = sections.find(s => s.section_type === 'editorial_intro');
  const splitSection = sections.find(s => s.section_type === 'editorial_split');
  const premiumSection = sections.find(s => s.section_type === 'premium_edit');
  const newArrivalsProducts = products.filter(p => p.status === 'published').slice(0, 4);
  const signatureProduct = products.find(p => p.is_signature) || products[0];

  // Live active banners from Admin Banners
  const heroBanner = banners.find(b => b.is_active && b.position === 'homepage_hero_top');
  const announcementBanner = banners.find(b => b.is_active && b.position === 'top_announcement');
  const campaignBanners = banners.filter(b => b.is_active && b.position !== 'top_announcement');

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

      {/* 1. FULLSCREEN HERO CAMPAIGN (Dynamic from Admin Banners or Homepage Builder) */}
      <section className="relative h-screen min-h-[700px] w-full flex items-center justify-center overflow-hidden">
        {/* Fullscreen Hero Background Image with Subtle Reveal */}
        <div className="absolute inset-0 z-0">
          {(heroBanner?.desktop_image || heroSection?.image_url) ? (
            <img
              src={heroBanner?.desktop_image || heroSection?.image_url}
              alt={heroBanner?.title || heroSection?.title || "MAHALEELA Editorial Campaign"}
              className="w-full h-full object-cover object-center filter brightness-[0.7] contrast-[1.05] transition-transform duration-1000 scale-100 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-neutral-950 via-neutral-900 to-luxury-black flex items-center justify-center">
              <div className="w-56 h-56 rounded-full border border-luxury-gold/15 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <img src="/logo.png" alt="MAHALEELA" className="w-36 h-auto opacity-35 filter grayscale" />
              </div>
            </div>
          )}
          {/* Subtle Editorial Gradient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-black/30 to-black/60" />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center pt-16">
          {/* Small Brand Label */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-black/40 backdrop-blur-md border border-luxury-gold/30 text-luxury-gold text-[10px] tracking-widest uppercase font-medium mb-6 animate-fade-in">
            <Sparkles className="w-3 h-3 text-luxury-gold" />
            <span>{heroBanner?.subtitle || heroSection?.subtitle || "MAHALEELA FASHION"}</span>
          </div>

          {/* Large Heading */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-widest uppercase font-light text-white leading-none mb-6 animate-reveal-up max-w-4xl">
            {heroBanner?.title || heroSection?.title || "THE NEW MAHALEELA EDIT"}
          </h1>

          {/* Small Supporting Text */}
          <p className="text-xs sm:text-sm tracking-luxury uppercase text-neutral-300 font-light max-w-xl mb-10 leading-relaxed">
            {heroSection?.content || "A NEW STANDARD OF EVERYDAY LUXURY."}
          </p>

          {/* Editorial CTAs */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to={heroBanner?.cta_url || heroSection?.cta_url || "/collections"}
              className="px-8 py-3.5 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-all duration-300 shadow-[0_0_20px_rgba(197,160,89,0.35)] w-full sm:w-auto text-center"
            >
              {heroBanner?.cta_text || heroSection?.cta_text || "EXPLORE COLLECTION"}
            </Link>
            <Link
              to={heroSection?.secondary_cta_url || "/new-arrivals"}
              className="px-8 py-3.5 border border-white/40 text-white text-xs uppercase tracking-luxury font-light hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm w-full sm:w-auto text-center"
            >
              {heroSection?.secondary_cta_text || "SHOP NEW ARRIVALS"}
            </Link>
          </div>
        </div>

        {/* Scroll to Explore Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center text-neutral-400">
          <span className="text-[9px] uppercase tracking-luxury mb-2">Scroll To Explore</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-luxury-gold via-luxury-gold/50 to-transparent animate-pulse-subtle" />
        </div>
      </section>

      {/* 2. EDITORIAL INTRO SECTION (Cream / Warm Ivory Section) */}
      <section className="bg-luxury-cream text-luxury-black py-28 px-4 sm:px-6 lg:px-8 border-y border-neutral-300">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[11px] tracking-luxury uppercase text-neutral-500 font-medium block mb-4">
            MAHALEELA FASHION
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-widest uppercase font-light text-luxury-black leading-tight mb-8">
            {introSection?.title || "DESIGNED FOR THE MODERN MAN."}
          </h2>
          <div className="w-16 h-[1px] bg-luxury-gold mx-auto mb-8" />
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto font-light leading-relaxed">
            {introSection?.content || "Quiet confidence expressed through architectural tailoring, heavyweight textiles, and uncompromising attention to micro-details."}
          </p>
        </div>
      </section>

      {/* 3. EDITORIAL IMAGE SPLIT (Asymmetrical 2-Image Layout) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* LEFT: Large Vertical Image (7 Columns) */}
          <div className="lg:col-span-7 relative group overflow-hidden">
            <div className="aspect-[9/16] w-full overflow-hidden bg-neutral-900">
              {splitSection?.image_url ? (
                <img
                  src={splitSection.image_url}
                  alt={splitSection.title || "Editorial Essentials"}
                  className="w-full h-full object-cover object-center filter grayscale contrast-110 group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-neutral-900 to-neutral-950 flex items-center justify-center">
                  <img src="/logo.png" alt="MAHALEELA" className="w-24 h-auto opacity-20 filter grayscale" />
                </div>
              )}
            </div>
            <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-md px-4 py-2 border border-luxury-gold/30">
              <span className="text-[10px] tracking-luxury uppercase text-luxury-gold">
                {splitSection?.subtitle || "Chapter 01 • The Essentials"}
              </span>
            </div>
          </div>

          {/* RIGHT: Smaller Image + Narrative (5 Columns) */}
          <div className="lg:col-span-5 space-y-8 lg:pl-6">
            <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-900">
              {splitSection?.secondary_image_url ? (
                <img
                  src={splitSection.secondary_image_url}
                  alt={splitSection?.subtitle || "Refined Silhouettes"}
                  className="w-full h-full object-cover object-center filter contrast-105 hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-neutral-900 to-neutral-950 flex items-center justify-center">
                  <img src="/logo.png" alt="MAHALEELA" className="w-20 h-auto opacity-20 filter grayscale" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block">
                Foundations
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl tracking-wider uppercase text-white font-light">
                {splitSection?.title || "THE ESSENTIALS"}
              </h3>
              <p className="text-neutral-400 text-sm font-light leading-relaxed italic">
                "{splitSection?.subtitle || "Refined silhouettes. Everyday confidence."}"
              </p>
              <p className="text-neutral-500 text-xs leading-relaxed font-light">
                {splitSection?.content || "Foundational garments designed to move seamlessly from daylight clarity to evening poise."}
              </p>
              <div className="pt-2">
                <Link
                  to={splitSection?.cta_url || "/collection/essentials"}
                  className="inline-flex items-center space-x-2 text-xs uppercase tracking-luxury text-luxury-gold hover:text-white border-b border-luxury-gold/40 pb-1 group transition-colors"
                >
                  <span>{splitSection?.cta_text || "DISCOVER ESSENTIALS"}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CATEGORY EXPERIENCE: LUXURY CATEGORY MENU */}
      <section className="relative py-28 bg-neutral-950 border-t border-neutral-800 overflow-hidden">
        {/* Dynamic Background Image on Hover */}
        {hoveredCategoryImg && (
          <div className="absolute inset-0 pointer-events-none opacity-20 transition-opacity duration-700">
            <img
              src={hoveredCategoryImg}
              alt="Category Preview"
              className="w-full h-full object-cover filter blur-sm scale-105"
            />
            <div className="absolute inset-0 bg-luxury-black/70" />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block mb-2">
              Curated Selection
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl tracking-widest uppercase font-light text-white">
              EXPLORE THE COLLECTION
            </h2>
            <div className="w-12 h-[1px] bg-luxury-gold/50 mx-auto mt-4" />
          </div>

          {/* Category Editorial Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 max-w-5xl mx-auto">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id}
                to={`/clothing?category=${cat.slug}`}
                onMouseEnter={() => setHoveredCategoryImg(cat.image)}
                className="group flex items-center justify-between py-4 border-b border-neutral-800/80 hover:border-luxury-gold/60 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-[10px] text-neutral-600 font-mono">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="font-serif text-lg sm:text-xl tracking-widest uppercase text-neutral-300 group-hover:text-luxury-gold group-hover:translate-x-2 transition-all duration-300">
                    {cat.name}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-luxury-gold transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS: MINIMAL 4-PRODUCT EDITORIAL SECTION */}
      <section className="py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-16 border-b border-neutral-800 pb-6">
          <div>
            <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block mb-2">
              Seasonal Release
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl tracking-widest uppercase font-light text-white">
              NEW ARRIVALS
            </h2>
            <p className="text-neutral-400 text-xs tracking-wider uppercase font-light mt-1">
              THE LATEST FROM MAHALEELA.
            </p>
          </div>
          <Link
            to="/new-arrivals"
            className="mt-4 sm:mt-0 text-xs uppercase tracking-luxury text-neutral-400 hover:text-luxury-gold transition-colors inline-flex items-center space-x-2"
          >
            <span>View All Pieces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Minimal Product Cards */}
        {newArrivalsProducts.length === 0 ? (
          <div className="border border-neutral-800/80 p-12 text-center max-w-xl mx-auto">
            <span className="text-luxury-gold uppercase text-[10px] tracking-luxury block mb-2">Seasonal Release</span>
            <h3 className="font-serif text-2xl text-white uppercase tracking-wider mb-2">New Drops Coming Soon</h3>
            <p className="text-neutral-400 text-xs font-light">The atelier is currently cataloging new seasonal apparel. Check back shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivalsProducts.map((product) => {
              const isSaved = isWishlisted(product.id);
              return (
                <div key={product.id} className="group flex flex-col">
                  {/* Image Container with Smooth 2nd-image Hover */}
                  <div className="relative aspect-[9/16] overflow-hidden bg-neutral-900 cursor-pointer mb-4">
                    <Link to={`/product/${product.slug}`}>
                      {/* Primary Image */}
                      <img
                        src={product.images[0] || '/logo.png'}
                        alt={product.name}
                        className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
                          product.images[1] ? 'group-hover:opacity-0' : ''
                        }`}
                      />
                      {/* Secondary Image for smooth reveal */}
                      {product.images[1] && (
                        <img
                          src={product.images[1]}
                          alt={`${product.name} alternate view`}
                          className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        />
                      )}
                    </Link>

                    {/* Badges */}
                    {product.badges && product.badges.length > 0 && (
                      <div className="absolute top-3 left-3 flex flex-col space-y-1">
                        {product.badges.map(b => (
                          <span key={b} className="px-2 py-0.5 bg-black/70 backdrop-blur-sm border border-luxury-gold/40 text-luxury-gold text-[9px] tracking-widest uppercase font-medium">
                            {b}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Heart Icon */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-sm text-neutral-300 hover:text-luxury-gold transition-colors rounded-full"
                      aria-label="Save for later"
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-luxury-gold text-luxury-gold' : ''}`} />
                    </button>

                    {/* Quick Add Overlay on Desktop */}
                    <button
                      onClick={() => addToCart(product, product.colours[0], product.sizes[0] || 'M')}
                      className="absolute bottom-0 inset-x-0 bg-neutral-950/90 py-2.5 text-center text-[10px] tracking-luxury uppercase text-white hover:bg-luxury-gold hover:text-black transition-all translate-y-full group-hover:translate-y-0"
                    >
                      Quick Add to Bag
                    </button>
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-500">
                      {product.category}
                    </span>
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="font-serif text-sm text-neutral-200 hover:text-luxury-gold transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center space-x-2 text-xs pt-1">
                      <span className="text-white font-medium">₹{product.price.toLocaleString()}</span>
                      {product.mrp > product.price && (
                        <>
                          <span className="text-neutral-500 line-through text-[11px]">
                            ₹{product.mrp.toLocaleString()}
                          </span>
                          <span className="text-luxury-gold text-[10px] font-semibold">
                            {product.discount}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. EDITORIAL PRODUCT FEATURE (Full-width Black Section) */}
      {signatureProduct && (
        <section className="bg-neutral-950 py-24 border-y border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Image (7 cols) */}
              <div className="lg:col-span-7 overflow-hidden aspect-[16/10] bg-neutral-900 relative">
                <img
                  src={signatureProduct.images[0]}
                  alt={signatureProduct.name}
                  className="w-full h-full object-cover object-center filter contrast-105 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 px-3 py-1 bg-black/60 backdrop-blur-sm border border-luxury-gold/40 text-luxury-gold text-[9px] tracking-luxury uppercase">
                  Spotlight Piece
                </div>
              </div>

              {/* Editorial Text (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block">
                  THE MAHALEELA SIGNATURE
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-widest uppercase font-light text-white leading-tight">
                  {signatureProduct.name}
                </h2>
                <p className="text-sm text-neutral-400 font-light leading-relaxed">
                  {signatureProduct.description}
                </p>
                <div className="text-2xl font-serif text-white pt-2">
                  ₹{signatureProduct.price.toLocaleString()}
                </div>
                <div className="pt-4">
                  <Link
                    to={`/product/${signatureProduct.slug}`}
                    className="inline-flex items-center space-x-3 px-8 py-3.5 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black uppercase text-xs tracking-luxury transition-all duration-300 font-semibold"
                  >
                    <span>EXPLORE PRODUCT</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. COLLECTION STORIES (Dynamic Atelier Collections - Strict 9:16 Vertical Ratio) */}
      <section className="py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block mb-2">
            Narratives
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl tracking-widest uppercase font-light text-white">
            COLLECTION STORIES
          </h2>
          <div className="w-12 h-[1px] bg-luxury-gold/50 mx-auto mt-4" />
        </div>

        {collections.length === 0 ? (
          <div className="border border-neutral-800/80 p-12 text-center max-w-xl mx-auto">
            <span className="text-luxury-gold uppercase text-[10px] tracking-luxury block mb-2">Private Atelier</span>
            <h3 className="font-serif text-2xl text-white uppercase tracking-wider mb-2">Collections Arriving Soon</h3>
            <p className="text-neutral-400 text-xs font-light">The atelier is curating new seasonal releases. Collections will appear here once published.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {collections.map((col, idx) => (
              <Link
                key={col.id}
                to={`/collection/${col.slug}`}
                className="group flex flex-col space-y-4"
              >
                {/* STRICT 9:16 VERTICAL RATIO */}
                <div className="aspect-[9/16] overflow-hidden bg-neutral-900 relative rounded-sm">
                  {col.desktop_banner || col.thumbnail ? (
                    <img
                      src={col.desktop_banner || col.thumbnail}
                      alt={col.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter contrast-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-neutral-900 to-neutral-950 flex flex-col items-center justify-center p-6 text-center">
                      <img src="/logo.png" alt="MAHALEELA" className="w-20 h-auto opacity-25 filter grayscale mb-4" />
                      <span className="text-[10px] uppercase tracking-widest text-luxury-gold">MAHALEELA ATELIER</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 text-xs font-mono font-bold text-luxury-gold bg-black/60 px-2 py-1">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl tracking-wider uppercase text-white group-hover:text-luxury-gold transition-colors">
                    {col.name}
                  </h3>
                  {col.description && (
                    <p className="text-xs text-neutral-400 font-light leading-relaxed line-clamp-2">
                      {col.description}
                    </p>
                  )}
                  <div className="pt-2 text-[11px] uppercase tracking-luxury text-luxury-gold inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 7.5. MAHALEELA EXCLUSIVE SHOWCASE (Direct Storefront Connection) */}
      <section className="relative py-32 overflow-hidden border-y border-luxury-gold/30 bg-black">
        {settings.exclusive_settings?.banner_image ? (
          <img
            src={settings.exclusive_settings.banner_image}
            alt="MAHALEELA EXCLUSIVE"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.35] contrast-125 transition-transform duration-1000 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-black via-neutral-950 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-luxury-gold/15 border border-luxury-gold/60 text-luxury-gold text-xs tracking-luxury uppercase">
              <Crown className="w-3.5 h-3.5" />
              <span>PRIVATE EDITION • DIRECT SHOPPING UNLOCKED</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-widest uppercase font-light text-white leading-tight">
              {settings.exclusive_settings?.title || "MAHALEELA EXCLUSIVE"}
            </h2>

            <div className="w-16 h-[1px] bg-luxury-gold" />

            <p className="text-xs sm:text-sm text-neutral-300 font-light uppercase tracking-wider leading-relaxed">
              {settings.exclusive_settings?.subtitle || "A PRIVATE EDITION OF SELECTED PIECES. DIRECT ATELIER SHOPPING."}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                to="/exclusive"
                className="inline-flex items-center justify-center space-x-3 px-8 py-4 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors shadow-[0_0_25px_rgba(197,160,89,0.3)]"
              >
                <span>Shop Exclusive Edition</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/collections"
                className="inline-flex items-center justify-center px-8 py-4 border border-neutral-600 text-neutral-300 hover:text-white hover:border-luxury-gold text-xs uppercase tracking-luxury font-medium transition-colors"
              >
                All Collections
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7.6. EDITORIAL CAMPAIGN BANNERS (Custom Banners from Admin Banners) */}
      {campaignBanners.length > 0 && (
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block mb-2 font-mono">
              CURATED CAMPAIGNS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl tracking-widest uppercase font-light text-white">
              EDITORIAL SPOTLIGHT
            </h2>
            <div className="w-12 h-[1px] bg-luxury-gold/50 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {campaignBanners.map((b) => (
              <Link
                key={b.id}
                to={b.cta_url || '/collections'}
                className="group relative overflow-hidden bg-neutral-900 border border-neutral-800 rounded-lg aspect-[16/9] block shadow-lg hover:border-luxury-gold/50 transition-all duration-500"
              >
                <img
                  src={b.desktop_image}
                  alt={b.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 space-y-2">
                  {b.subtitle && (
                    <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-medium block">
                      {b.subtitle}
                    </span>
                  )}
                  <h3 className="font-serif text-2xl uppercase tracking-wider text-white font-light group-hover:text-luxury-gold transition-colors">
                    {b.title}
                  </h3>
                  <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-luxury text-luxury-gold pt-1 group-hover:translate-x-1 transition-transform">
                    <span>{b.cta_text || 'Explore'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 8. THE PREMIUM EDIT (Luxury Cream & Black Section) */}
      <section className="bg-luxury-cream text-luxury-black py-28 px-4 sm:px-6 lg:px-8 border-t border-neutral-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] tracking-luxury uppercase text-neutral-600 font-semibold block">
              High Precision Tailoring
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl tracking-widest uppercase font-light text-luxury-black leading-tight">
              THE PREMIUM EDIT
            </h2>
            <div className="w-12 h-[1px] bg-luxury-gold" />
            <p className="text-base sm:text-lg text-neutral-800 font-light italic">
              "CRAFTED FOR THOSE WHO NOTICE THE DETAILS."
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed max-w-md">
              From brushed metallic gold horology to handcrafted Italian acetate and vegetable-tanned leathers, explore items that celebrate subtle distinction.
            </p>
            <div className="pt-4">
              <Link
                to="/collection/premium"
                className="px-8 py-3.5 bg-luxury-black text-white text-xs uppercase tracking-luxury font-semibold hover:bg-neutral-800 transition-colors inline-block"
              >
                EXPLORE PREMIUM
              </Link>
            </div>
          </div>

          <div className="aspect-[4/3] overflow-hidden bg-neutral-900 flex items-center justify-center">
            {premiumSection?.image_url ? (
              <img
                src={premiumSection.image_url}
                alt="The Premium Edit"
                className="w-full h-full object-cover object-center filter contrast-105 hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-neutral-900 to-neutral-950 flex items-center justify-center">
                <img src="/logo.png" alt="MAHALEELA" className="w-28 h-auto opacity-20 filter grayscale" />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
