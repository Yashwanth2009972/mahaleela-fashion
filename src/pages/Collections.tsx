import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Collection } from '../types';
import { storeService } from '../services/storeService';

export const Collections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>(() => 
    storeService.getCollections().filter(c => c.is_published)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCols = () => {
      try {
        const data = storeService.getCollections();
        setCollections(data.filter((c: Collection) => c.is_published));
      } catch (e) {
        console.error('Collections error:', e);
      }
    };
    loadCols();

    const unsubscribe = storeService.subscribe((event) => {
      if (event.type === 'collections') {
        loadCols();
      }
    });
    return unsubscribe;
  }, []);

  return (
    <div className="bg-luxury-black text-neutral-100 min-h-screen pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block mb-2">
            ATELIER RELEASES
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-widest uppercase font-light text-white">
            THE COLLECTIONS
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm tracking-wider uppercase font-light mt-3 max-w-lg mx-auto">
            Thematic edits that explore silhouette, texture, and everyday luxury across discrete menswear moods.
          </p>
          <div className="w-12 h-[1px] bg-luxury-gold/50 mx-auto mt-6" />
        </div>

        {/* Collections Grid */}
        {loading ? (
          <div className="text-center py-24 text-sm uppercase tracking-widest text-neutral-400">
            Curating collections...
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-24 bg-neutral-950 border border-neutral-850 p-12 max-w-2xl mx-auto">
            <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block mb-2">
              Atelier Vault
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl tracking-wider uppercase text-white font-light mb-3">
              New Collections Coming Soon
            </h2>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed mb-6">
              Our design studio is currently assembling bespoke seasonal edits. Check back shortly to explore our latest thematic narratives.
            </p>
            <Link
              to="/clothing"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors"
            >
              <span>Explore All Garments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {collections.map((col) => (
              <Link
                key={col.id}
                to={`/collection/${col.slug}`}
                className="group flex flex-col bg-neutral-950 border border-neutral-850 hover:border-luxury-gold/60 transition-all overflow-hidden"
              >
                {/* 9:16 Vertical Portrait Photo Container */}
                <div className="aspect-[9/16] overflow-hidden bg-neutral-900 relative">
                  <img
                    src={col.desktop_banner || col.thumbnail}
                    alt={col.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-90 contrast-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />
                  
                  {col.is_exclusive && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-md border border-luxury-gold text-luxury-gold text-[9px] tracking-luxury uppercase font-semibold flex items-center space-x-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>Private Edition</span>
                    </div>
                  )}

                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] tracking-widest text-luxury-gold uppercase block mb-1">
                        {col.product_count || 0} Curated Piece{col.product_count !== 1 ? 's' : ''}
                      </span>
                      <h2 className="font-serif text-xl sm:text-2xl tracking-widest uppercase text-white group-hover:text-luxury-gold transition-colors font-light">
                        {col.name}
                      </h2>
                    </div>
                    <div className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center text-white group-hover:bg-luxury-gold group-hover:border-luxury-gold group-hover:text-black transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                {col.description && (
                  <div className="p-4 bg-neutral-950">
                    <p className="text-xs text-neutral-400 font-light leading-relaxed line-clamp-2">
                      {col.description}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
