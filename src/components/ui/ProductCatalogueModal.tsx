import React, { useState } from 'react';
import { X, Check, ShoppingBag, MessageSquare, Tag, Truck } from 'lucide-react';
import { Product, STANDARD_COLORS } from '../../types';
import { storeService } from '../../services/storeService';
import { useApp } from '../../context/AppContext';

interface ProductCatalogueModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductCatalogueModal: React.FC<ProductCatalogueModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const { settings, addToCart, setIsCartOpen } = useApp();

  if (!isOpen || !product) return null;

  // Selected state
  const [selectedImage, setSelectedImage] = useState<string>(product.images[0] || '/logo.png');
  const [selectedColour, setSelectedColour] = useState<string>(
    product.colours && product.colours.length > 0 ? product.colours[0] : 'Black'
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M'
  );
  const [quantity, setQuantity] = useState<number>(1);

  // Coupon state
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState<string>('');

  // Customer order form state for instant ordering
  const [showOrderForm, setShowOrderForm] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [addressLine, setAddressLine] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderConfirmed, setOrderConfirmed] = useState<{ orderNumber: string; total: number } | null>(null);

  // Pricing calculations
  const mrp = product.mrp || product.price;
  const price = product.price;
  const discountPercent = product.discount || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
  const savings = Math.max(0, mrp - price);

  // Shipping calculation
  const storeShipping = settings?.standard_shipping_fee ?? 60;
  const shippingFee = product.shipping_fee ?? storeShipping;
  const subtotal = price * quantity;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalPayable = Math.max(0, subtotal + shippingFee - discountAmount);

  // Owner contact
  const ownerPhone = settings?.phone?.replace(/[^0-9]/g, '') || '8892919723';

  // Apply coupon handler
  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponInput.trim()) return;
    const code = couponInput.trim().toUpperCase();
    const coupons = storeService.getCoupons();
    const found = coupons.find(c => c.is_active && c.code.toUpperCase() === code);

    if (!found) {
      setCouponError('Invalid coupon code.');
      return;
    }

    if (subtotal < found.min_order_value) {
      setCouponError(`Min order value of ₹${found.min_order_value.toLocaleString()} required for ${found.code}.`);
      return;
    }

    let calculatedDiscount = 0;
    if (found.discount_type === 'percentage') {
      calculatedDiscount = Math.round((subtotal * found.discount_value) / 100);
      if (found.max_discount && calculatedDiscount > found.max_discount) {
        calculatedDiscount = found.max_discount;
      }
    } else {
      calculatedDiscount = found.discount_value;
    }

    setAppliedCoupon({ code: found.code, discountAmount: calculatedDiscount });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  // Construct WhatsApp order message
  const buildWhatsAppMessage = (orderNumber: string) => {
    return encodeURIComponent(
`🛍️ *NEW ORDER - MAHALEELA FASHION*
Order ID: #${orderNumber}
----------------------------------------
*Product:* ${product.name}
*SKU:* ${product.sku}
*Color:* ${selectedColour}
*Size:* ${selectedSize}
*Quantity:* ${quantity}

*PRICE BREAKDOWN:*
• Product Price: ₹${subtotal.toLocaleString()} (MRP: ₹${(mrp * quantity).toLocaleString()})
• Shipping Charges: ₹${shippingFee.toLocaleString()}
${appliedCoupon ? `• Coupon Discount (${appliedCoupon.code}): -₹${appliedCoupon.discountAmount.toLocaleString()}\n` : ''}• *Total Payable Amount:* ₹${totalPayable.toLocaleString()}

*CUSTOMER DETAILS:*
• Name: ${customerName.trim() || 'Customer'}
• Phone: ${customerPhone.trim() || 'Provided on WhatsApp'}
• Address: ${addressLine.trim() || 'N/A'}, ${city.trim() || ''} - ${pincode.trim() || ''}
• Payment Method: ${paymentMethod}
----------------------------------------
Please confirm my order and share dispatch details!`
    );
  };

  // Place order handler (Dual website + WhatsApp)
  const handlePlaceOrder = async (target: 'whatsapp' | 'website') => {
    if (!customerPhone.trim()) {
      alert('Please enter your WhatsApp/Mobile phone number to place the order.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderNumber = `ML-${Math.floor(100000 + Math.random() * 900000)}`;

      // Save directly into the website's central order database
      await storeService.createOrder({
        order_number: orderNumber,
        user_id: 'guest',
        customer_name: customerName.trim() || 'Valued Customer',
        customer_email: 'order@mahaleelafashion.com',
        customer_phone: customerPhone.trim(),
        shipping_address: {
          address_line: addressLine.trim() || 'Direct WhatsApp Order',
          city: city.trim() || 'Direct',
          state: 'Karnataka',
          pincode: pincode.trim() || '560090',
          country: 'India'
        },
        items: [
          {
            product_id: product.id,
            name: product.name,
            colour: selectedColour,
            size: selectedSize,
            price: product.price,
            quantity: quantity,
            image: selectedImage
          }
        ],
        subtotal: subtotal,
        shipping_fee: shippingFee,
        cod_fee: 0,
        discount: discountAmount,
        coupon_code: appliedCoupon?.code,
        total: totalPayable,
        payment_method: paymentMethod,
        payment_status: 'pending',
        order_status: 'placed',
        tracking_timeline: [
          {
            status: 'placed',
            label: 'Order Placed',
            time: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            completed: true
          }
        ],
        created_at: new Date().toISOString()
      });

      setOrderConfirmed({ orderNumber, total: totalPayable });

      // Open WhatsApp automatically
      const waUrl = `https://wa.me/91${ownerPhone}?text=${buildWhatsAppMessage(orderNumber)}`;
      window.open(waUrl, '_blank');
    } catch (e) {
      console.error('Order creation error:', e);
      alert('Could not place order. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to find hex code for a color name
  const getColorHex = (cName: string) => {
    const found = STANDARD_COLORS.find(c => c.name.toLowerCase() === cName.toLowerCase());
    if (found) return found.hex;
    const lower = cName.toLowerCase();
    if (lower.includes('white') || lower.includes('ivory')) return '#FFFFFF';
    if (lower.includes('black') || lower.includes('obsidian')) return '#000000';
    if (lower.includes('red') || lower.includes('maroon')) return '#DC2626';
    if (lower.includes('blue')) return '#2563EB';
    if (lower.includes('green')) return '#166534';
    if (lower.includes('grey') || lower.includes('gray')) return '#4B5563';
    if (lower.includes('gold') || lower.includes('yellow')) return '#EAB308';
    return '#333333';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative bg-neutral-950 border border-neutral-800 rounded-lg max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl text-neutral-100 my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-full transition-colors"
          aria-label="Close Catalogue"
        >
          <X className="w-5 h-5" />
        </button>

        {orderConfirmed ? (
          /* Order Confirmation Screen */
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-luxury-gold/20 border border-luxury-gold flex items-center justify-center mx-auto text-luxury-gold">
              <Check className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-luxury text-luxury-gold font-mono">ORDER CONFIRMED</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-white uppercase font-light">
                Thank You For Your Order!
              </h2>
              <p className="text-sm text-neutral-300 font-mono">
                Order ID: <span className="text-luxury-gold font-bold">#{orderConfirmed.orderNumber}</span>
              </p>
              <p className="text-xs text-neutral-400 max-w-md mx-auto pt-2">
                Your order is confirmed and registered in our atelier system. The owner has been notified on WhatsApp for priority dispatch!
              </p>
            </div>

            <div className="p-4 bg-neutral-900 rounded border border-neutral-800 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">Item:</span>
                <span className="text-white font-medium">{product.name} ({selectedColour}, {selectedSize})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Payable:</span>
                <span className="text-luxury-gold font-bold">₹{orderConfirmed.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Payment:</span>
                <span className="text-white">{paymentMethod}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href={`https://wa.me/91${ownerPhone}?text=${buildWhatsAppMessage(orderConfirmed.orderNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs uppercase tracking-luxury flex items-center justify-center space-x-2 rounded transition-colors shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat with Owner on WhatsApp</span>
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 border border-neutral-700 text-neutral-300 hover:text-white text-xs uppercase tracking-luxury rounded transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          /* Main Catalogue Modal Content */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 sm:p-8">
            
            {/* LEFT: 4K Product Gallery (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              <div className="relative aspect-[9/16] w-full overflow-hidden bg-neutral-900 rounded-sm border border-neutral-800">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />

                {/* GOLDEN LUXURY DISCOUNT BADGE (Top-Left of Product Photo) */}
                {discountPercent > 0 && (
                  <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-luxury-gold to-yellow-600 text-black text-[11px] sm:text-xs font-black px-3 py-1 uppercase tracking-wider rounded-none shadow-[0_2px_10px_rgba(197,160,89,0.5)]">
                    {discountPercent}% OFF
                  </div>
                )}

                {savings > 0 && (
                  <div className="absolute bottom-3 left-3 z-10 bg-black/75 backdrop-blur-sm border border-luxury-gold/40 text-luxury-gold text-[10px] font-medium px-2 py-0.5 uppercase tracking-luxury">
                    Save ₹{savings.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {product.images && product.images.length > 1 && (
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative flex-shrink-0 w-14 h-20 rounded overflow-hidden border-2 transition-all ${
                        selectedImage === img ? 'border-luxury-gold scale-105' : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product Details & Fast Purchase (7 cols) */}
            <div className="md:col-span-7 space-y-5">
              
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-[10px] uppercase tracking-luxury text-neutral-400">
                <span>{product.category}</span>
                <span className="font-mono text-neutral-500">SKU: {product.sku}</span>
              </div>

              {/* BOLD MODERN PRODUCT TITLE */}
              <div>
                <h2 className="font-sans font-bold text-xl sm:text-2xl text-white tracking-tight uppercase leading-snug">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="text-xs text-neutral-400 font-light mt-1.5 line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* PRICE & DISCOUNT SECTION */}
              <div className="p-3 bg-neutral-900/90 rounded border border-neutral-800 flex items-baseline space-x-3">
                <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
                  ₹{price.toLocaleString()}
                </span>
                {mrp > price && (
                  <>
                    <span className="text-sm sm:text-base text-neutral-500 line-through font-mono">
                      ₹{mrp.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-luxury-gold font-mono uppercase tracking-wider">
                      ({discountPercent}% OFF)
                    </span>
                  </>
                )}
              </div>

              {/* CIRCULAR COLOUR OPTIONS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-luxury text-neutral-400 font-medium">
                    Choose Colour:
                  </span>
                  <span className="text-luxury-gold font-semibold uppercase text-[11px]">
                    {selectedColour}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {(product.colours && product.colours.length > 0
                    ? product.colours
                    : ['White', 'Black', 'Red', 'Royal Blue', 'Dark Green']
                  ).map((colName) => {
                    const hex = getColorHex(colName);
                    const isSelected = selectedColour.toLowerCase() === colName.toLowerCase();
                    const isWhite = hex.toLowerCase() === '#ffffff';

                    return (
                      <button
                        key={colName}
                        type="button"
                        onClick={() => setSelectedColour(colName)}
                        title={colName}
                        className={`group relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${
                          isSelected
                            ? 'ring-2 ring-luxury-gold ring-offset-2 ring-offset-black scale-110 shadow-lg'
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                        } ${isWhite ? 'border border-neutral-400' : 'border border-neutral-700'}`}
                        style={{ backgroundColor: hex }}
                      >
                        {isSelected && (
                          <Check className={`w-4 h-4 ${isWhite ? 'text-black' : 'text-white'} stroke-[3]`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SIZES */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="uppercase tracking-luxury text-neutral-400 font-medium">Select Size:</span>
                    <span className="text-neutral-300 font-semibold">{selectedSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded uppercase transition-colors ${
                          selectedSize === s
                            ? 'bg-luxury-gold text-black font-bold shadow-md'
                            : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-600'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* QUANTITY */}
              <div className="flex items-center space-x-3 text-xs">
                <span className="uppercase tracking-luxury text-neutral-400 font-medium">Quantity:</span>
                <div className="inline-flex items-center border border-neutral-800 rounded bg-neutral-900">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-neutral-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 font-mono font-bold text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-neutral-400 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* COUPON CODE INPUT */}
              <div className="p-3 bg-neutral-900/60 rounded border border-neutral-800 space-y-2">
                <div className="flex items-center space-x-2 text-[11px] uppercase tracking-luxury text-luxury-gold font-medium">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Apply Atelier Coupon Code</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 bg-luxury-gold/15 border border-luxury-gold/40 rounded text-xs">
                    <div className="flex items-center space-x-2 text-luxury-gold font-mono font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>{appliedCoupon.code} Applied (-₹{appliedCoupon.discountAmount.toLocaleString()})</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-neutral-400 hover:text-white text-[11px] underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="e.g. WELCOME10, MAHALEELA"
                      className="flex-1 bg-neutral-950 border border-neutral-700 px-3 py-1.5 text-xs rounded text-white focus:outline-none focus:border-luxury-gold uppercase font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-luxury-gold text-xs uppercase font-semibold tracking-wider rounded transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[11px] text-red-400">{couponError}</p>}
              </div>

              {/* TRANSPARENT PRICING BREAKDOWN (Product + Shipping = Total) */}
              <div className="p-3 bg-neutral-900 rounded border border-neutral-800 text-xs space-y-1.5">
                <div className="flex justify-between text-neutral-400">
                  <span>Product Price ({quantity} item{quantity > 1 ? 's' : ''}):</span>
                  <span className="font-mono text-neutral-200">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span className="flex items-center space-x-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Shipping Charges:</span>
                  </span>
                  <span className="font-mono text-neutral-200">
                    {shippingFee === 0 ? 'FREE' : `+₹${shippingFee.toLocaleString()}`}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-luxury-gold">
                    <span>Coupon Discount ({appliedCoupon.code}):</span>
                    <span className="font-mono">-₹{appliedCoupon.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-neutral-800 pt-2 flex justify-between items-baseline">
                  <span className="font-semibold text-white uppercase tracking-luxury text-[11px]">
                    Total Payable Amount:
                  </span>
                  <span className="font-mono text-lg font-bold text-luxury-gold">
                    ₹{totalPayable.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* CUSTOMER DETAILS FORM (Shown when ready to order) */}
              {showOrderForm ? (
                <div className="space-y-3 p-3 bg-neutral-900 rounded border border-luxury-gold/30">
                  <h4 className="text-[11px] uppercase tracking-luxury font-bold text-luxury-gold">
                    Enter Delivery Details:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Your Full Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="bg-neutral-950 border border-neutral-700 p-2 rounded text-white focus:outline-none focus:border-luxury-gold"
                    />
                    <input
                      type="tel"
                      placeholder="WhatsApp Phone Number *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="bg-neutral-950 border border-neutral-700 p-2 rounded text-white focus:outline-none focus:border-luxury-gold"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Delivery Address (House/Street/Area) *"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 p-2 rounded text-xs text-white focus:outline-none focus:border-luxury-gold"
                  />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="City *"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-neutral-950 border border-neutral-700 p-2 rounded text-white focus:outline-none focus:border-luxury-gold"
                    />
                    <input
                      type="text"
                      placeholder="Pincode *"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="bg-neutral-950 border border-neutral-700 p-2 rounded text-white focus:outline-none focus:border-luxury-gold"
                    />
                  </div>

                  <div className="flex items-center space-x-4 text-xs pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="payMethod"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="accent-luxury-gold"
                      />
                      <span>Cash on Delivery (COD)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="payMethod"
                        value="UPI"
                        checked={paymentMethod === 'UPI'}
                        onChange={() => setPaymentMethod('UPI')}
                        className="accent-luxury-gold"
                      />
                      <span>UPI / Online</span>
                    </label>
                  </div>

                  {/* Dual Ordering Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handlePlaceOrder('whatsapp')}
                      className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs uppercase tracking-luxury rounded flex items-center justify-center space-x-2 transition-all shadow-lg"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{isSubmitting ? 'Placing...' : 'Direct WhatsApp Order'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handlePlaceOrder('website')}
                      className="w-full py-3 bg-luxury-gold hover:bg-luxury-goldLight text-black font-bold text-xs uppercase tracking-luxury rounded flex items-center justify-center space-x-2 transition-all shadow-lg"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSubmitting ? 'Placing...' : 'Confirm Website Order'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Primary Call-to-Actions */
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOrderForm(true)}
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-xs uppercase tracking-luxury rounded flex items-center justify-center space-x-2 transition-all shadow-[0_4px_20px_rgba(37,211,102,0.3)]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Order Directly on WhatsApp / Website</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      addToCart(product, selectedColour, selectedSize);
                      setIsCartOpen(true);
                      onClose();
                    }}
                    className="w-full py-3 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black font-semibold text-xs uppercase tracking-luxury rounded flex items-center justify-center space-x-2 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Bag</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
