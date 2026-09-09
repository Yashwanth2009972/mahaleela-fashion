import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

export const Wishlist: React.FC = () => {
  const { wishlist, toggleWishlist, addToCart } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data: Product[] = await res.json();
        setProducts(data.filter(p => wishlist.includes(p.id)));
      } catch (e) {
        console.error('Wishlist load error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistProducts();
  }, [wishlist]);

  const handleMoveToBag = (product: Product) => {
    addToCart(product, product.colours[0] || 'Deep Black', product.sizes[0] || 'M', 1);
    toggleWishlist(product.id);
  };

  return (
    <div className="bg-luxury-black text-neutral-100 min-h-screen pt-28 pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block mb-2">
            PRIVATE ARCHIVE
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl tracking-widest uppercase font-light text-white">
            SAVED FOR LATER
          </h1>
          <p className="text-xs text-neutral-400 uppercase tracking-wider font-light mt-3">
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved in your private consideration edit.
          </p>
          <div className="w-12 h-[1px] bg-luxury-gold/50 mx-auto mt-6" />
        </div>

        {loading ? (
          <div className="text-center py-20 text-xs uppercase tracking-widest text-neutral-400">
            Accessing saved pieces...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-neutral-950 border border-neutral-850 p-12 max-w-lg mx-auto">
            <Heart className="w-12 h-12 stroke-1 text-neutral-600 mx-auto mb-4" />
            <p className="font-serif text-xl uppercase tracking-wider text-neutral-300 mb-2">
              Your wishlist is empty
            </p>
            <p className="text-xs text-neutral-500 mb-8 max-w-xs mx-auto">
              Save your favourite architectural pieces and seasonal signatures to revisit anytime.
            </p>
            <Link
              to="/collections"
              className="px-8 py-3.5 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors inline-block"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group bg-neutral-950 border border-neutral-850 p-4 flex flex-col justify-between">
                <div>
                  <div className="aspect-[9/16] overflow-hidden bg-neutral-900 relative mb-4">
                    <Link to={`/product/${product.slug}`}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-2.5 right-2.5 p-2 bg-black/60 backdrop-blur-sm text-neutral-400 hover:text-red-400 transition-colors rounded-full"
                      aria-label="Remove item from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-500">
                      {product.category}
                    </span>
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="font-serif text-sm text-neutral-200 group-hover:text-luxury-gold transition-colors truncate">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center space-x-2 text-xs pt-1">
                      <span className="text-white font-medium">₹{product.price.toLocaleString()}</span>
                      {product.mrp > product.price && (
                        <span className="text-neutral-500 line-through text-[11px]">
                          ₹{product.mrp.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-800">
                  <button
                    onClick={() => handleMoveToBag(product)}
                    className="w-full py-2.5 border border-luxury-gold text-luxury-gold text-xs uppercase tracking-luxury font-medium hover:bg-luxury-gold hover:text-black transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
