import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShieldCheck, Truck, RefreshCw, ChevronDown, ChevronUp, Check, Ruler, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

import { storeService } from '../services/storeService';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart, isWishlisted, toggleWishlist, settings } = useApp();
  const [product, setProduct] = useState<Product | null>(() => {
    return storeService.getProducts().find(p => p.slug === slug || p.id === slug) || null;
  });
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [selectedColour, setSelectedColour] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeAccordion, setActiveAccordion] = useState<string | null>('description');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProductData = () => {
      const allProds = storeService.getProducts();
      const data = allProds.find(p => p.slug === slug || p.id === slug);
      if (data) {
        setProduct(data);
        setSelectedColour(data.colours?.[0] || 'Deep Black');
        setSelectedSize(data.sizes?.[0] || 'M');
        setSelectedImage(data.images?.[0] || '');
        setRecommendations(
          allProds
            .filter(p => p.id !== data.id && (p.category_id === data.category_id || p.category === data.category))
            .slice(0, 4)
        );
      }
      setLoading(false);
    };

    loadProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-luxury-black text-neutral-100 min-h-screen pt-40 text-center text-sm uppercase tracking-widest text-neutral-400">
        Preparing garment details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-luxury-black text-neutral-100 min-h-screen pt-40 text-center px-4">
        <h2 className="font-serif text-2xl uppercase tracking-widest text-white mb-4">Garment Not Found</h2>
        <Link to="/men" className="text-xs uppercase tracking-luxury text-luxury-gold hover:underline">
          Return to Atelier
        </Link>
      </div>
    );
  }

  const isSaved = isWishlisted(product.id);

  const handleBuyNow = () => {
    addToCart(product, selectedColour, selectedSize, 1);
    navigate('/checkout');
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(prev => prev === id ? null : id);
  };

  return (
    <div className="bg-luxury-black text-neutral-100 min-h-screen pt-24 pb-28">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-[10px] uppercase tracking-luxury text-neutral-500 flex items-center space-x-2">
        <Link to="/" className="hover:text-neutral-300 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/clothing" className="hover:text-neutral-300 transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-luxury-gold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Layout: 65% Gallery (Left) & 35% Details (Right) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT 65%: Large Product Gallery (7-8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Main Primary View */}
            <div className="aspect-[9/16] w-full overflow-hidden bg-neutral-900 border border-neutral-850 relative group">
              <img
                src={selectedImage || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              {product.badges && product.badges.length > 0 && (
                <div className="absolute top-4 left-4 flex flex-col space-y-1">
                  {product.badges.map(b => (
                    <span key={b} className="px-3 py-1 bg-black/75 backdrop-blur-sm border border-luxury-gold/40 text-luxury-gold text-[9px] tracking-widest uppercase font-semibold">
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Gallery Grid of Additional Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-[9/16] overflow-hidden bg-neutral-900 border transition-all ${
                      selectedImage === img ? 'border-luxury-gold ring-1 ring-luxury-gold' : 'border-neutral-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT 35%: Product Information Sticky Panel (4-5 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 space-y-8">
            {/* Brand & Name */}
            <div>
              <span className="text-[10px] tracking-luxury uppercase text-luxury-gold font-medium block mb-2">
                MAHALEELA FASHION
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl tracking-wider uppercase text-white font-light leading-snug">
                {product.name}
              </h1>
              <p className="text-[11px] text-neutral-500 font-mono tracking-widest mt-1">
                SKU: {product.sku}
              </p>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline space-x-3 pb-6 border-b border-neutral-800">
              <span className="text-2xl font-serif text-white">
                ₹{product.price.toLocaleString()}
              </span>
              {product.mrp > product.price && (
                <>
                  <span className="text-sm text-neutral-500 line-through">
                    MRP ₹{product.mrp.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 bg-luxury-gold/15 border border-luxury-gold/30 text-luxury-gold text-[10px] font-bold tracking-widest uppercase">
                    {product.discount}% OFF
                  </span>
                </>
              )}
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                Inclusive of all taxes
              </span>
            </div>

            {/* Colour Selector */}
            {product.colours && product.colours.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs tracking-wider uppercase mb-3">
                  <span className="text-neutral-400">Colour: <span className="text-white font-medium">{selectedColour}</span></span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colours.map((col) => (
                    <button
                      key={col}
                      onClick={() => setSelectedColour(col)}
                      className={`px-3 py-1.5 border text-xs tracking-wider uppercase transition-colors ${
                        selectedColour === col
                          ? 'border-luxury-gold bg-luxury-gold/15 text-luxury-gold font-medium'
                          : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector & Size Guide */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs tracking-wider uppercase mb-3">
                  <span className="text-neutral-400">Select Size</span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="flex items-center space-x-1 text-[11px] text-luxury-gold hover:underline uppercase tracking-wider"
                  >
                    <Ruler className="w-3 h-3" />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`py-2 text-xs font-mono uppercase border transition-all ${
                        selectedSize === s
                          ? 'border-luxury-gold bg-luxury-gold text-black font-bold'
                          : 'border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => addToCart(product, selectedColour, selectedSize, 1)}
                className="w-full py-4 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-all duration-300 shadow-[0_0_20px_rgba(197,160,89,0.25)] text-center"
              >
                Add to Bag
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full py-4 border border-white/60 text-white text-xs uppercase tracking-luxury font-medium hover:bg-white hover:text-black transition-all duration-300 text-center"
              >
                Buy Now
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-full py-3 border border-neutral-800 text-neutral-300 hover:text-luxury-gold hover:border-luxury-gold/50 text-xs uppercase tracking-luxury flex items-center justify-center space-x-2 transition-colors"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-luxury-gold text-luxury-gold' : ''}`} />
                <span>{isSaved ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>

            {/* Complimentary Guarantees */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-800 text-[11px] text-neutral-400">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                <span>Free Express Shipping over ₹{settings.free_shipping_threshold}</span>
              </div>
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                <span>Discreet 7-Day Compliant Exchange</span>
              </div>
            </div>

            {/* Accordion Sections: Description, Details, Size & Fit, Material & Care, Shipping, Returns */}
            <div className="divide-y divide-neutral-800 border-t border-b border-neutral-800 pt-2">
              {[
                { id: 'description', title: 'Description', content: product.description },
                { id: 'details', title: 'Details', list: product.details || ['Reinforced internal seams', 'Architectural relaxed drape', 'Signature gold finishings'] },
                { id: 'size_fit', title: 'Size & Fit', content: product.size_fit || 'Tailored to fall with effortless grace. Conforms accurately to size.' },
                { id: 'material_care', title: 'Material & Care', content: product.material_care || 'Dry clean or cold wash inside out. Store on sculpted hanger.' },
                { id: 'shipping', title: 'Shipping', content: settings.policies.shipping },
                { id: 'returns', title: 'Returns & Exchange', content: settings.policies.returns }
              ].map((acc) => (
                <div key={acc.id} className="py-4">
                  <button
                    onClick={() => toggleAccordion(acc.id)}
                    className="w-full flex items-center justify-between text-xs tracking-luxury uppercase text-neutral-300 hover:text-luxury-gold transition-colors text-left"
                  >
                    <span>{acc.title}</span>
                    {activeAccordion === acc.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {activeAccordion === acc.id && (
                    <div className="pt-3 text-xs text-neutral-400 font-light leading-relaxed animate-fade-in">
                      {acc.content && <p>{acc.content}</p>}
                      {acc.list && (
                        <ul className="list-disc list-inside space-y-1">
                          {acc.list.map((li, i) => <li key={i}>{li}</li>)}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section: Complete the Edit */}
      {recommendations.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block mb-1">
              Curated Accompaniments
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl tracking-widest uppercase font-light text-white">
              COMPLETE THE EDIT
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {recommendations.map((rec) => (
              <Link key={rec.id} to={`/product/${rec.slug}`} className="group flex flex-col">
                <div className="aspect-[9/16] overflow-hidden bg-neutral-900 mb-3 relative">
                  <img
                    src={rec.images[0]}
                    alt={rec.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="text-[9px] uppercase tracking-widest text-neutral-500">
                  {rec.category}
                </span>
                <h4 className="font-serif text-xs sm:text-sm text-neutral-200 group-hover:text-luxury-gold transition-colors truncate">
                  {rec.name}
                </h4>
                <div className="text-xs text-white pt-1">
                  ₹{rec.price.toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-neutral-950 border border-neutral-800 p-8 max-w-lg w-full text-neutral-200 animate-fade-in relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
              <div>
                <span className="text-[9px] uppercase tracking-luxury text-luxury-gold block">Precision Fit</span>
                <h3 className="font-serif text-xl uppercase tracking-wider text-white">Garment Size Chart</h3>
              </div>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400 font-light mb-6">
              Measurements are provided in inches for the actual laid-flat garment. Compare these with your favorite tailored piece for ideal silhouette drape.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-700 text-neutral-400 uppercase tracking-wider">
                    <th className="py-2.5">Size</th>
                    <th className="py-2.5">Chest (Inches)</th>
                    <th className="py-2.5">Length (Inches)</th>
                    <th className="py-2.5">Shoulder (Inches)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 font-mono">
                  <tr><td className="py-2 font-bold text-luxury-gold">S</td><td>40"</td><td>28"</td><td>18.5"</td></tr>
                  <tr><td className="py-2 font-bold text-luxury-gold">M</td><td>42"</td><td>29"</td><td>19.5"</td></tr>
                  <tr><td className="py-2 font-bold text-luxury-gold">L</td><td>44"</td><td>30"</td><td>20.5"</td></tr>
                  <tr><td className="py-2 font-bold text-luxury-gold">XL</td><td>46"</td><td>31"</td><td>21.5"</td></tr>
                  <tr><td className="py-2 font-bold text-luxury-gold">XXL</td><td>48"</td><td>32"</td><td>22.5"</td></tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="px-6 py-2 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-semibold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
