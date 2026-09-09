import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Tag, Check, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    codFee,
    total,
    coupon,
    couponDiscount,
    couponError,
    applyCoupon,
    removeCoupon,
    settings
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings.free_shipping_threshold || 2000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponInput.trim());
    setIsApplying(false);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleViewBag = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Drawer Panel */}
      <div className="relative w-full max-w-md bg-luxury-black border-l border-neutral-800 text-neutral-100 flex flex-col justify-between z-10 animate-fade-in shadow-2xl h-full">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-luxury-gold" />
            <h3 className="font-serif text-lg tracking-widest uppercase text-white">
              Your Bag ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close bag"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-neutral-900/90 px-6 py-3 border-b border-neutral-800/80">
          <div className="flex items-center space-x-2 text-xs text-neutral-300 mb-2">
            <Truck className="w-4 h-4 text-luxury-gold flex-shrink-0" />
            <span>
              {amountNeeded > 0 ? (
                <>Add <span className="text-luxury-gold font-medium">₹{amountNeeded.toLocaleString()}</span> more for complimentary express delivery</>
              ) : (
                <span className="text-luxury-gold font-medium">Complimentary Express Shipping Unlocked!</span>
              )}
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-luxury-gold h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 divide-y divide-neutral-850">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 py-12">
              <ShoppingBag className="w-12 h-12 stroke-1 text-neutral-600 mb-4" />
              <p className="font-serif text-lg tracking-wider text-neutral-300 uppercase">Your bag is empty</p>
              <p className="text-xs text-neutral-500 mt-2 max-w-xs">
                Explore our editorial pieces and new seasonal arrivals.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/collections');
                }}
                className="mt-6 px-6 py-2.5 border border-luxury-gold text-luxury-gold text-xs uppercase tracking-luxury hover:bg-luxury-gold hover:text-black transition-all"
              >
                Discover Collections
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item, idx) => (
                <div key={`${item.product.id}-${item.colour}-${item.size}-${idx}`} className="flex space-x-4 pt-4 first:pt-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover flex-shrink-0 bg-neutral-900"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm text-neutral-100 leading-snug">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.colour, item.size)}
                          className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-neutral-400 mt-1 uppercase tracking-wider">
                        <span>Colour: {item.colour}</span>
                        <span>•</span>
                        <span>Size: {item.size}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-neutral-700 bg-neutral-900/80">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.colour, item.size, -1)}
                          className="px-2 py-1 text-neutral-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-xs font-medium text-neutral-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.colour, item.size, 1)}
                          className="px-2 py-1 text-neutral-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-sm font-medium text-white">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-neutral-800 bg-neutral-950 space-y-4">
            {/* Coupon Code Input */}
            <div>
              {coupon ? (
                <div className="flex items-center justify-between bg-luxury-gold/10 border border-luxury-gold/30 px-3 py-2 text-xs">
                  <div className="flex items-center space-x-2 text-luxury-gold">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="font-semibold tracking-wider uppercase">{coupon.code}</span>
                    <span className="text-neutral-400">(-₹{couponDiscount.toLocaleString()})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-neutral-400 hover:text-red-400 text-[10px] uppercase tracking-wider"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="PROMO CODE (e.g. WELCOME10)"
                    className="flex-1 bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs text-white placeholder-neutral-500 uppercase tracking-wider focus:outline-none focus:border-luxury-gold"
                  />
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="px-4 py-2 border border-neutral-700 hover:border-luxury-gold hover:text-luxury-gold text-neutral-300 text-xs uppercase tracking-wider transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-red-400 mt-1">{couponError}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-neutral-400 pt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-neutral-200">₹{subtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-luxury-gold">
                  <span>Privilege Discount</span>
                  <span>-₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping across India</span>
                <span className={shippingFee === 0 ? "text-luxury-gold" : "text-neutral-200"}>
                  {shippingFee === 0 ? "COMPLIMENTARY" : `₹${shippingFee}`}
                </span>
              </div>
              <div className="border-t border-neutral-800 pt-2 flex justify-between text-sm font-medium text-white">
                <span className="font-serif tracking-wider uppercase">Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleViewBag}
                className="w-full py-3 border border-neutral-700 text-neutral-200 text-xs tracking-luxury uppercase font-medium hover:border-neutral-500 transition-colors text-center"
              >
                View Bag
              </button>
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-luxury-gold text-black text-xs tracking-luxury uppercase font-semibold hover:bg-luxury-goldLight transition-all flex items-center justify-center space-x-2"
              >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
