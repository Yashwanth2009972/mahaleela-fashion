import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, Heart, ChevronDown, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Category } from '../types';
import { storeService } from '../services/storeService';

interface ShopProps {
  title?: string;
  defaultFilter?: {
    category?: string;
    is_clothing?: boolean;
    is_accessories?: boolean;
    is_new?: boolean;
    is_sale?: boolean;
  };
}

export const Shop: React.FC<ShopProps> = ({ title = "SHOP MEN", defaultFilter }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isWishlisted, toggleWishlist, addToCart } = useApp();

  const [products, setProducts] = useState<Product[]>(() => storeService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => storeService.getCategories());
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const selectedCategory = searchParams.get('category') || defaultFilter?.category || '';
  const selectedColour = searchParams.get('colour') || '';
  const sortBy = searchParams.get('sort') || 'newest';

  const loadShopData = () => {
    try {
      setProducts(storeService.getProducts());
      setCategories(storeService.getCategories());
    } catch (e) {
      console.error('Shop fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShopData();

    const unsubscribe = storeService.subscribe((event) => {
      if (event.type === 'products' || event.type === 'categories') {
        loadShopData();
      }
    });
    return unsubscribe;
  }, []);

  // Filter and sort products
  const filteredProducts = products.filter(p => {
    if (p.status !== 'published') return false;

    // Scope check based on props
    if (defaultFilter?.is_clothing) {
      const clothingCats = ['t-shirts', 'shirts', 'hoodies', 'sweatshirts'];
      if (!clothingCats.includes(p.category_id) && !clothingCats.includes(p.category.toLowerCase())) return false;
    }
    if (defaultFilter?.is_accessories) {
      const accCats = ['watches', 'sunglasses', 'photo-frames', 'headcaps', 'mugs', 'keychains', 'wallets'];
      if (!accCats.includes(p.category_id) && !accCats.includes(p.category.toLowerCase().replace(/\s+/g, '-'))) return false;
    }
    if (defaultFilter?.is_new) {
      if (!p.badges?.includes('NEW') && !p.collections?.includes('col-new-arrivals')) return false;
    }
    if (defaultFilter?.is_sale) {
      if (p.discount < 30 && !p.collections?.includes('col-sale')) return false;
    }

    if (selectedCategory) {
      const catMatch = p.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory.toLowerCase() || p.category_id === selectedCategory;
      if (!catMatch) return false;
    }

    if (selectedSize && p.sizes && !p.sizes.includes(selectedSize)) {
      return false;
    }

    if (selectedColour && p.colours && !p.colours.some(c => c.toLowerCase().includes(selectedColour.toLowerCase()))) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'discount') return b.discount - a.discount;
    return 0; // default newest
  });

  const updateFilter = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const colours = ['Black', 'Ivory', 'Cream', 'Charcoal'];

  return (
    <div className="bg-luxury-black text-neutral-100 min-h-screen pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block mb-2">
            MAHALEELA EDITORIAL
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl tracking-widest uppercase font-light text-white">
            {title}
          </h1>
          <p className="text-neutral-400 text-xs tracking-wider uppercase font-light mt-3 max-w-md mx-auto">
            Architectural silhouettes, heavyweight organic textiles, and refined accessories designed for everyday distinction.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-10 pb-4 border-b border-neutral-800">
          <button
            onClick={() => updateFilter('category', '')}
            className={`px-4 py-1.5 text-xs tracking-wider uppercase transition-colors ${
              !selectedCategory
                ? 'bg-luxury-gold text-black font-semibold'
                : 'border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            All Pieces
          </button>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => updateFilter('category', isActive ? '' : cat.slug)}
                className={`px-4 py-1.5 text-xs tracking-wider uppercase transition-colors ${
                  isActive
                    ? 'bg-luxury-gold text-black font-semibold'
                    : 'border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Controls Bar: Filter Toggle & Sort Dropdown */}
        <div className="flex items-center justify-between py-4 border-b border-neutral-800 mb-10 text-xs tracking-wider uppercase">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center space-x-2 text-neutral-300 hover:text-luxury-gold transition-colors py-1"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
            {(selectedCategory || selectedSize || selectedColour) && (
              <span className="w-2 h-2 rounded-full bg-luxury-gold inline-block" />
            )}
          </button>

          <div className="flex items-center space-x-4">
            <span className="text-neutral-500 hidden sm:inline-block">
              {filteredProducts.length} Piece{filteredProducts.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-neutral-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => updateFilter('sort', e.target.value)}
                aria-label="Sort products"
                className="bg-neutral-900 border border-neutral-700 text-neutral-200 px-3 py-1.5 focus:outline-none focus:border-luxury-gold text-xs uppercase tracking-wider"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount">Highest Privilege Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Layout: Filter Panel (Left) + Products Grid (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Desktop Filter Panel / Mobile Bottom Sheet */}
          {isFilterOpen && (
            <div className="lg:col-span-3 bg-neutral-950 p-6 border border-neutral-800 space-y-8 animate-fade-in h-fit">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <span className="font-serif text-sm tracking-luxury uppercase text-white">Refine</span>
                <button
                  onClick={clearAllFilters}
                  className="text-[10px] uppercase tracking-wider text-neutral-400 hover:text-luxury-gold underline"
                >
                  Clear All
                </button>
              </div>

              {/* Sizes Filter */}
              <div>
                <span className="text-[10px] uppercase tracking-luxury text-neutral-400 block mb-3">
                  Clothing Size
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateFilter('size', selectedSize === s ? '' : s)}
                      className={`py-1.5 text-xs font-mono uppercase border transition-colors ${
                        selectedSize === s
                          ? 'border-luxury-gold bg-luxury-gold/15 text-luxury-gold font-bold'
                          : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colours Filter */}
              <div>
                <span className="text-[10px] uppercase tracking-luxury text-neutral-400 block mb-3">
                  Colour Palette
                </span>
                <div className="space-y-2">
                  {colours.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateFilter('colour', selectedColour === c ? '' : c)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 border text-xs tracking-wider uppercase transition-colors ${
                        selectedColour === c
                          ? 'border-luxury-gold bg-luxury-gold/15 text-luxury-gold'
                          : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span>{c}</span>
                      {selectedColour === c && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className={isFilterOpen ? "lg:col-span-9" : "lg:col-span-12"}>
            {loading ? (
              <div className="text-center py-24 text-sm uppercase tracking-widest text-neutral-400">
                Loading atelier archives...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-neutral-950 border border-neutral-800/80 p-8">
                <p className="font-serif text-lg tracking-wider text-neutral-300 uppercase mb-3">
                  No matching pieces found
                </p>
                <p className="text-xs text-neutral-500 mb-6 max-w-sm mx-auto">
                  Try adjusting your filter selection or clear all filters to view our complete collection.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 border border-luxury-gold text-luxury-gold text-xs uppercase tracking-luxury hover:bg-luxury-gold hover:text-black transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={`grid grid-cols-2 ${isFilterOpen ? 'lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-6 sm:gap-8`}>
                {filteredProducts.map((product) => {
                  const isSaved = isWishlisted(product.id);
                  return (
                    <div key={product.id} className="group flex flex-col">
                      {/* Image Container with Smooth 2nd-image Hover */}
                      <div className="relative aspect-[9/16] overflow-hidden bg-neutral-900 cursor-pointer mb-3">
                        <Link to={`/product/${product.slug}`}>
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
                              product.images[1] ? 'group-hover:opacity-0' : ''
                            }`}
                          />
                          {product.images[1] && (
                            <img
                              src={product.images[1]}
                              alt={`${product.name} secondary`}
                              className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            />
                          )}
                        </Link>

                        {/* Badges */}
                        {product.badges && product.badges.length > 0 && (
                          <div className="absolute top-2.5 left-2.5 flex flex-col space-y-1">
                            {product.badges.map(b => (
                              <span key={b} className="px-2 py-0.5 bg-black/75 backdrop-blur-sm border border-luxury-gold/40 text-luxury-gold text-[8px] sm:text-[9px] tracking-widest uppercase font-medium">
                                {b}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Heart Wishlist */}
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-2.5 right-2.5 p-1.5 sm:p-2 bg-black/50 backdrop-blur-sm text-neutral-300 hover:text-luxury-gold transition-colors rounded-full"
                          aria-label="Save for later"
                        >
                          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-luxury-gold text-luxury-gold' : ''}`} />
                        </button>

                        {/* Quick Add Overlay on Desktop */}
                        <button
                          onClick={() => addToCart(product, product.colours[0], product.sizes[0] || 'M')}
                          className="hidden sm:block absolute bottom-0 inset-x-0 bg-neutral-950/95 py-2.5 text-center text-[10px] tracking-luxury uppercase text-white hover:bg-luxury-gold hover:text-black transition-all translate-y-full group-hover:translate-y-0"
                        >
                          Quick Add to Bag
                        </button>
                      </div>

                      {/* Details */}
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-widest text-neutral-500">
                          {product.category}
                        </span>
                        <Link to={`/product/${product.slug}`}>
                          <h3 className="font-serif text-xs sm:text-sm text-neutral-200 hover:text-luxury-gold transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center space-x-2 text-xs pt-0.5">
                          <span className="text-white font-medium">₹{product.price.toLocaleString()}</span>
                          {product.mrp > product.price && (
                            <>
                              <span className="text-neutral-500 line-through text-[10px] sm:text-[11px]">
                                ₹{product.mrp.toLocaleString()}
                              </span>
                              <span className="text-luxury-gold text-[9px] sm:text-[10px] font-semibold">
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
          </div>
        </div>
      </div>
    </div>
  );
};
