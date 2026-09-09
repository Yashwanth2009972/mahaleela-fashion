import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search as SearchIcon, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

export const SearchOverlay: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const handleSelectProduct = (slug: string) => {
    setIsSearchOpen(false);
    navigate(`/product/${slug}`);
  };

  const handleSelectTag = (tag: string) => {
    setQuery(tag);
  };

  return (
    <div className="fixed inset-0 z-50 bg-luxury-black/95 backdrop-blur-xl flex flex-col p-6 sm:p-12 overflow-y-auto animate-fade-in">
      {/* Close button */}
      <div className="flex justify-between items-center max-w-5xl mx-auto w-full pb-8 border-b border-neutral-800">
        <span className="text-xs uppercase tracking-luxury text-luxury-gold font-medium">
          Editorial Search
        </span>
        <button
          onClick={() => setIsSearchOpen(false)}
          className="p-2 text-neutral-400 hover:text-white transition-colors"
          aria-label="Close search"
        >
          <X className="w-7 h-7" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full pt-12">
        {/* Large Search Input */}
        <div className="relative border-b-2 border-neutral-700 focus-within:border-luxury-gold transition-colors pb-3">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH MAHALEELA..."
            className="w-full bg-transparent text-2xl sm:text-4xl font-serif tracking-widest uppercase text-white placeholder-neutral-600 focus:outline-none pr-12"
          />
          <SearchIcon className="absolute right-2 top-3 w-8 h-8 text-neutral-500" />
        </div>

        {/* Popular searches suggestions */}
        {!query && (
          <div className="mt-8">
            <span className="text-[10px] tracking-luxury uppercase text-neutral-500 block mb-3">
              Popular Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {['OVERSIZED T-SHIRT', 'CAMP COLLAR SHIRT', 'OBSIDIAN WATCH', '480GSM HOODIE', 'LEATHER WALLET', 'SUNGLASSES'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleSelectTag(tag)}
                  className="px-3 py-1.5 border border-neutral-800 text-neutral-400 hover:text-luxury-gold hover:border-luxury-gold text-xs tracking-wider uppercase transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mt-12">
          {loading && (
            <div className="text-center py-12 text-sm uppercase tracking-widest text-neutral-400">
              Searching atelier archives...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-12 text-neutral-400 text-sm">
              No pieces found matching "{query}". Try searching for T-Shirts, Shirts, Watches, or Hoodies.
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-luxury text-neutral-400 mb-6">
                Found {results.length} Piece{results.length > 1 ? 's' : ''}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.slug)}
                    className="group cursor-pointer bg-neutral-900/50 border border-neutral-800/80 p-4 hover:border-luxury-gold/60 transition-all flex items-center space-x-4"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-20 h-24 object-cover object-center flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] uppercase tracking-widest text-luxury-gold block mb-1">
                        {product.category}
                      </span>
                      <h4 className="text-sm font-serif text-neutral-200 group-hover:text-white truncate">
                        {product.name}
                      </h4>
                      <div className="mt-2 flex items-center space-x-2 text-xs">
                        <span className="text-white font-medium">₹{product.price.toLocaleString()}</span>
                        <span className="text-neutral-500 line-through">₹{product.mrp.toLocaleString()}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-luxury-gold transition-transform group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
