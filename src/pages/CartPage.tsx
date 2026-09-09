import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CartPage: React.FC = () => {
  const {
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

  const [couponCode, setCouponCode] = useState('');
  const navigate = useNavigate();

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    await applyCoupon(couponCode.trim());
  };

  return (
    <div className="bg-luxury-black text-neutral-100 min-h-screen pt-28 pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block mb-2">
            Order Review
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl tracking-widest uppercase font-light text-white">
            YOUR BAG
          </h1>
          <div className="w-12 h-[1px] bg-luxury-gold/50 mx-auto mt-6" />
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-24 bg-neutral-950 border border-neutral-850 p-12 max-w-lg mx-auto">
            <ShoppingBag className="w-12 h-12 stroke-1 text-neutral-600 mx-auto mb-4" />
            <p className="font-serif text-xl uppercase tracking-wider text-neutral-300 mb-2">
              Your bag is currently empty
            </p>
            <p className="text-xs text-neutral-500 mb-8 max-w-xs mx-auto">
              Select items from our seasonal collections and menswear signatures.
            </p>
            <Link
              to="/collections"
              className="px-8 py-3.5 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors inline-block"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Items List (8 cols) */}
            <div className="lg:col-span-8 bg-neutral-950 border border-neutral-850 p-6 divide-y divide-neutral-850">
              {cart.map((item, idx) => (
                <div key={idx} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-24 object-cover flex-shrink-0 bg-neutral-900"
                    />
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-luxury-gold block">
                        {item.product.category}
                      </span>
                      <h3 className="font-serif text-base text-white">
                        {item.product.name}
                      </h3>
                      <div className="text-xs text-neutral-400 mt-1 uppercase tracking-wider">
                        Colour: {item.colour} • Size: {item.size}
                      </div>
                      <div className="text-xs font-medium text-neutral-300 mt-1">
                        ₹{item.product.price.toLocaleString()} each
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8">
                    {/* Quantity */}
                    <div className="flex items-center border border-neutral-700 bg-neutral-900">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.colour, item.size, -1)}
                        className="px-2.5 py-1 text-neutral-400 hover:text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-1 text-xs font-mono text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.colour, item.size, 1)}
                        className="px-2.5 py-1 text-neutral-400 hover:text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <span className="text-sm font-serif font-medium text-white block">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.product.id, item.colour, item.size)}
                      className="text-neutral-500 hover:text-red-400 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Panel (4 cols) */}
            <div className="lg:col-span-4 bg-neutral-950 border border-neutral-850 p-6 space-y-6">
              <h3 className="font-serif text-lg uppercase tracking-widest text-white border-b border-neutral-800 pb-4">
                Summary
              </h3>

              {/* Promo input */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between bg-luxury-gold/10 border border-luxury-gold/40 p-3 text-xs">
                    <span className="text-luxury-gold uppercase font-semibold">{coupon.code} Applied</span>
                    <button onClick={removeCoupon} className="text-neutral-400 hover:text-red-400 text-[10px] uppercase">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="PROMO CODE"
                      className="flex-1 bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs uppercase text-white tracking-wider focus:outline-none focus:border-luxury-gold"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 border border-neutral-700 hover:border-luxury-gold hover:text-luxury-gold text-xs uppercase tracking-wider transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-400 mt-1">{couponError}</p>}
              </div>

              <div className="space-y-2 text-xs text-neutral-400 border-t border-neutral-800 pt-4">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="text-white">₹{subtotal.toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-luxury-gold">
                    <span>Privilege Discount</span>
                    <span>-₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping across India</span>
                  <span className={shippingFee === 0 ? "text-luxury-gold" : "text-white"}>
                    {shippingFee === 0 ? "COMPLIMENTARY" : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="border-t border-neutral-800 pt-3 flex justify-between text-base font-serif text-white">
                  <span>Total</span>
                  <span className="text-luxury-gold font-medium">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 flex items-center justify-center space-x-2 text-[10px] text-neutral-400 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-luxury-gold" />
                <span>Protected by Encrypted Atelier Checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
