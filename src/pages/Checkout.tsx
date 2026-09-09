import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, QrCode, Banknote, ArrowRight, Truck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storeService } from '../services/storeService';

export const Checkout: React.FC = () => {
  const {
    cart,
    clearCart,
    subtotal,
    shippingFee,
    codFee,
    total,
    paymentMethod,
    setPaymentMethod,
    coupon,
    couponDiscount,
    settings,
    user
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState({
    name: user?.name || 'Yashwanth Kumar',
    email: user?.email || 'admin@mahaleela.com',
    phone: '8892919723',
    address_line: '2ACROSS MARUTI NAGAR, CHIKKABANAVARA',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560090'
  });
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  if (cart.length === 0 && step !== 4) {
    return (
      <div className="bg-luxury-black text-neutral-100 min-h-screen pt-40 text-center px-4">
        <h2 className="font-serif text-2xl uppercase tracking-widest text-white mb-4">Your bag is empty</h2>
        <Link to="/collections" className="text-xs uppercase tracking-luxury text-luxury-gold hover:underline">
          Explore Collections
        </Link>
      </div>
    );
  }

  const handleNextStep = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        user_id: user?.id || 'guest-patron',
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: {
          address_line: formData.address_line,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India'
        },
        items: cart.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          colour: item.colour,
          size: item.size,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0]
        })),
        subtotal,
        shipping_fee: shippingFee,
        cod_fee: paymentMethod === 'COD' ? (settings.cod_fee || 10) : 0,
        discount: couponDiscount,
        coupon_code: coupon?.code,
        total: total + (paymentMethod === 'COD' ? (settings.cod_fee || 10) : 0),
        payment_method: paymentMethod
      };

      const createdOrder = await storeService.createOrder(orderPayload);
      setPlacedOrder(createdOrder);
      clearCart();
      setStep(4);
    } catch (e) {
      console.error('Failed to place order:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-luxury-black text-neutral-100 min-h-screen pt-28 pb-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-8 mb-12">
          {[
            { num: 1, label: '01 ADDRESS' },
            { num: 2, label: '02 DELIVERY' },
            { num: 3, label: '03 PAYMENT' },
            { num: 4, label: '04 CONFIRM' }
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center space-x-2 text-xs font-mono uppercase tracking-widest ${
                step === s.num
                  ? 'text-luxury-gold font-bold'
                  : step > s.num
                  ? 'text-neutral-400'
                  : 'text-neutral-600'
              }`}
            >
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* STEP 4: ORDER CONFIRMED */}
        {step === 4 && placedOrder && (
          <div className="bg-neutral-950 border border-luxury-gold/40 p-10 sm:p-16 text-center space-y-6 animate-fade-in max-w-2xl mx-auto">
            <CheckCircle2 className="w-14 h-14 text-luxury-gold mx-auto" />
            <span className="text-[10px] tracking-luxury uppercase text-luxury-gold font-medium block">
              MAHALEELA ATELIER
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl tracking-widest uppercase text-white font-light">
              ORDER CONFIRMED
            </h1>
            <p className="text-xs text-neutral-400 tracking-widest uppercase font-mono">
              Reference: <span className="text-white font-bold">{placedOrder.order_number}</span>
            </p>
            <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-md mx-auto">
              Your garments have been commissioned into preparation. You can observe each stage of transit live via your account timeline.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                to="/account"
                className="w-full sm:w-auto px-8 py-3.5 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors"
              >
                Track Order Live
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto px-8 py-3.5 border border-neutral-700 text-neutral-300 text-xs uppercase tracking-luxury hover:border-neutral-500 transition-colors"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        )}

        {/* STEPS 1, 2, 3 LAYOUT */}
        {step < 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Steps Form (7 cols) */}
            <div className="lg:col-span-7 bg-neutral-950 border border-neutral-850 p-8 space-y-8">
              {/* STEP 1: ADDRESS */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-neutral-800 pb-4">
                    <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block">Step 01</span>
                    <h2 className="font-serif text-xl uppercase tracking-wider text-white">Shipping Details</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] tracking-luxury uppercase text-neutral-400 mb-2">Recipient Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 p-3 text-xs text-white focus:outline-none focus:border-luxury-gold uppercase tracking-wider"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-luxury uppercase text-neutral-400 mb-2">Telephone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 p-3 text-xs text-white focus:outline-none focus:border-luxury-gold tracking-wider"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-luxury uppercase text-neutral-400 mb-2">Email for Dispatch Tracking</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 p-3 text-xs text-white focus:outline-none focus:border-luxury-gold tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-luxury uppercase text-neutral-400 mb-2">Delivery Address</label>
                    <textarea
                      rows={2}
                      value={formData.address_line}
                      onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 p-3 text-xs text-white focus:outline-none focus:border-luxury-gold tracking-wider"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] tracking-luxury uppercase text-neutral-400 mb-2">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 p-3 text-xs text-white focus:outline-none focus:border-luxury-gold tracking-wider"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-luxury uppercase text-neutral-400 mb-2">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 p-3 text-xs text-white focus:outline-none focus:border-luxury-gold tracking-wider"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-luxury uppercase text-neutral-400 mb-2">PIN Code</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-700 p-3 text-xs text-white focus:outline-none focus:border-luxury-gold tracking-wider"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="w-full py-3.5 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors mt-4"
                  >
                    Continue to Delivery
                  </button>
                </div>
              )}

              {/* STEP 2: DELIVERY */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-neutral-800 pb-4">
                    <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block">Step 02</span>
                    <h2 className="font-serif text-xl uppercase tracking-wider text-white">Select Delivery Mode</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start space-x-4 p-4 border border-luxury-gold bg-luxury-gold/10 cursor-pointer">
                      <input type="radio" checked readOnly className="mt-1 accent-luxury-gold" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-serif text-sm uppercase text-white tracking-wider">
                            Express Atelier Dispatch
                          </span>
                          <span className="text-xs text-luxury-gold font-medium">
                            {shippingFee === 0 ? 'COMPLIMENTARY' : `₹${shippingFee}`}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 font-light mt-1">
                          Delivery in 2-4 business days across India in bespoke tamper-evident archival presentation box.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="w-1/3 py-3.5 border border-neutral-700 text-neutral-300 text-xs uppercase tracking-wider hover:border-neutral-500"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="w-2/3 py-3.5 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-neutral-800 pb-4">
                    <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block">Step 03</span>
                    <h2 className="font-serif text-xl uppercase tracking-wider text-white">Payment Selection</h2>
                  </div>

                  <div className="space-y-4">
                    {/* UPI Option */}
                    <div
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-4 border cursor-pointer transition-all ${
                        paymentMethod === 'UPI' ? 'border-luxury-gold bg-luxury-gold/10' : 'border-neutral-800 bg-neutral-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <QrCode className="w-5 h-5 text-luxury-gold" />
                          <span className="font-serif text-sm uppercase tracking-wider text-white">
                            UPI / Instant Scan & Pay
                          </span>
                        </div>
                        <span className="text-[10px] text-green-400 uppercase font-mono">Instant Verification</span>
                      </div>
                      <p className="text-xs text-neutral-400 font-light mt-2">
                        Scan with Google Pay, PhonePe, Paytm, or enter your VPA. Zero gateway surcharge.
                      </p>
                      {paymentMethod === 'UPI' && (
                        <div className="mt-4 p-4 bg-black/60 border border-luxury-gold/30 flex items-center space-x-4">
                          <div className="w-16 h-16 bg-white p-1 rounded flex items-center justify-center">
                            <QrCode className="w-14 h-14 text-black" />
                          </div>
                          <div className="text-xs text-neutral-300 space-y-1">
                            <div className="font-mono text-luxury-gold">UPI ID: mahaleelafashion@icici</div>
                            <div className="text-[10px] text-neutral-500">Scan QR or authorize via your preferred UPI app</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* COD Option */}
                    <div
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-4 border cursor-pointer transition-all ${
                        paymentMethod === 'COD' ? 'border-luxury-gold bg-luxury-gold/10' : 'border-neutral-800 bg-neutral-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Banknote className="w-5 h-5 text-luxury-gold" />
                          <span className="font-serif text-sm uppercase tracking-wider text-white">
                            Cash on Delivery (COD)
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono">+₹{settings.cod_fee} Convenience Fee</span>
                      </div>
                      <p className="text-xs text-neutral-400 font-light mt-2">
                        Pay upon doorstep arrival. Verified contact number required for automated dispatch confirmation.
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={() => setStep(2)}
                      className="w-1/3 py-3.5 border border-neutral-700 text-neutral-300 text-xs uppercase tracking-wider hover:border-neutral-500"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="w-2/3 py-3.5 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>{isSubmitting ? 'Authorizing Order...' : 'Confirm Order'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Order Review (5 cols) */}
            <div className="lg:col-span-5 bg-neutral-950 border border-neutral-850 p-6 space-y-6">
              <h3 className="font-serif text-base uppercase tracking-widest text-white border-b border-neutral-800 pb-3">
                Order Review ({cart.reduce((a, b) => a + b.quantity, 0)} Pieces)
              </h3>

              <div className="space-y-4 divide-y divide-neutral-850 max-h-80 overflow-y-auto pr-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center space-x-3">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-16 object-cover bg-neutral-900" />
                    <div className="flex-1 min-w-0 text-xs">
                      <h4 className="text-white font-serif truncate">{item.product.name}</h4>
                      <p className="text-neutral-500 text-[10px] uppercase">{item.colour} • {item.size} • Qty {item.quantity}</p>
                    </div>
                    <span className="text-xs text-white font-mono">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-800 pt-4 space-y-2 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="text-white">₹{subtotal.toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-luxury-gold">
                    <span>Privilege Discount ({coupon?.code})</span>
                    <span>-₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={shippingFee === 0 ? "text-luxury-gold" : "text-white"}>
                    {shippingFee === 0 ? "COMPLIMENTARY" : `₹${shippingFee}`}
                  </span>
                </div>
                {paymentMethod === 'COD' && (
                  <div className="flex justify-between text-neutral-300">
                    <span>COD Convenience Fee</span>
                    <span>₹{settings.cod_fee || 10}</span>
                  </div>
                )}
                <div className="border-t border-neutral-800 pt-3 flex justify-between text-base font-serif text-white">
                  <span>Payable Amount</span>
                  <span className="text-luxury-gold font-semibold">
                    ₹{(total + (paymentMethod === 'COD' ? (settings.cod_fee || 10) : 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
