import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Collection, Product } from '../types';
import { storeService } from '../services/storeService';

export const CollectionDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isWishlisted, toggleWishlist, addToCart } = useApp();
  const [collection, setCollection] = useState<Collection | null>(() => {
    return slug ? storeService.getCollectionBySlug(slug) : null;
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      let col = storeService.getCollectionBySlug(slug);
      if (!col) {
        try {
          const res = await fetch(`/api/collections/${slug}`);
          if (res.ok) col = await res.json();
        } catch {}
      }

      setCollection(col);
      if (col) {
        const allProds = storeService.getProducts();
        const colProds = allProds.filter(p => p.collections && p.collections.includes(col!.id));
        setProducts(colProds);
      }
    } catch (e) {
      console.error('Collection detail fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubscribe = storeService.subscribe((event) => {
      if (event.type === 'collections' || event.type === 'products') {
        loadData();
      }
    });
    return unsubscribe;
  }, [slug]);

  if (loading && !collection) {
    return (
      <div className="bg-luxury-black text-neutral-100 min-h-screen pt-40 text-center text-sm uppercase tracking-widest text-neutral-400">
        Loading collection narrative...
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="bg-luxury-black text-neutral-100 min-h-screen pt-40 text-center px-4">
        <h2 className="font-serif text-2xl uppercase tracking-widest text-white mb-4">Collection Not Found</h2>
        <Link to="/collections" className="text-xs uppercase tracking-luxury text-luxury-gold hover:underline">
          Return to All Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-luxury-black text-neutral-100 min-h-screen">
      {/* Editorial Collection Hero Banner */}
      <div className="relative h-[65vh] min-h-[450px] w-full flex items-end pb-16 overflow-hidden bg-neutral-950">
        {collection.desktop_banner || collection.thumbnail ? (
          <img
            src={collection.desktop_banner || collection.thumbnail}
            alt={collection.name}
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.65] contrast-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-neutral-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-black/30 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Link
            to="/collections"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-luxury text-neutral-300 hover:text-luxury-gold transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Collections</span>
          </Link>

          <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block mb-2 font-medium">
            MAHALEELA EDITORIAL RELEASE
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-widest uppercase font-light text-white">
            {collection.name}
          </h1>
          <p className="text-neutral-300 text-xs sm:text-sm tracking-wider uppercase font-light mt-3 max-w-xl">
            {collection.description}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between pb-6 border-b border-neutral-800 mb-12">
          <span className="text-xs uppercase tracking-luxury text-neutral-400">
            {products.length} Piece{products.length !== 1 ? 's' : ''} in Collection
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-neutral-950 border border-neutral-850 p-8">
            <p className="font-serif text-lg tracking-wider text-neutral-300 uppercase mb-2">
              Pieces being curated
            </p>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Our atelier is actively assembling items for this edit. Check back shortly or explore other collections.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => {
              const isSaved = isWishlisted(product.id);
              return (
                <div key={product.id} className="group flex flex-col">
                  {/* Image with 2nd-hover */}
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
                          alt={`${product.name} secondary view`}
                          className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        />
                      )}
                    </Link>

                    {/* Badge */}
                    {product.badges && product.badges.length > 0 && (
                      <div className="absolute top-2.5 left-2.5 flex flex-col space-y-1">
                        {product.badges.map(b => (
                          <span key={b} className="px-2 py-0.5 bg-black/75 backdrop-blur-sm border border-luxury-gold/40 text-luxury-gold text-[8px] sm:text-[9px] tracking-widest uppercase font-medium">
                            {b}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Heart */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-2.5 right-2.5 p-1.5 sm:p-2 bg-black/50 backdrop-blur-sm text-neutral-300 hover:text-luxury-gold transition-colors rounded-full"
                      aria-label="Save for later"
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-luxury-gold text-luxury-gold' : ''}`} />
                    </button>

                    {/* Quick Add on Desktop */}
                    <button
                      onClick={() => addToCart(product, product.colours[0], product.sizes[0] || 'M')}
                      className="hidden sm:block absolute bottom-0 inset-x-0 bg-neutral-950/95 py-2.5 text-center text-[10px] tracking-luxury uppercase text-white hover:bg-luxury-gold hover:text-black transition-all translate-y-full group-hover:translate-y-0"
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
  );
};
