import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  CheckCircle,
  Truck,
  Package,
  Clock,
  XCircle,
  Search,
  User,
  Printer,
  FileText,
  QrCode,
  Check,
  X
} from 'lucide-react';
import { storeService } from '../../services/storeService';
import { Order, OrderItem } from '../../types';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState('');
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = storeService.getOrders();
      setOrders(data);
      if (data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
      } else if (data.length === 0) {
        setSelectedOrder(null);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const unsubscribe = storeService.subscribe((event) => {
      if (event.type === 'orders') {
        const data = storeService.getOrders();
        setOrders(data);
        if (data.length > 0 && (!selectedOrder || !data.some(o => o.id === selectedOrder.id))) {
          setSelectedOrder(data[0]);
        }
      }
    });
    return unsubscribe;
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const updated = await storeService.updateOrderStatus(orderId, newStatus);
      if (updated) {
        setSelectedOrder(updated);
        await fetchOrders();
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredOrders = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone.includes(search)
  );

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
        <div>
          <div className="flex items-center space-x-2 text-luxury-gold text-xs uppercase tracking-luxury font-medium mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>FULFILLMENT PIPELINE & DISPATCH LABELS</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wider font-light">
            Customer Orders & Shipping Generator
          </h1>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Accept customer commissions, trigger live transit updates, and generate official printable courier shipping labels.
          </p>
        </div>
      </div>

      {/* Orders View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Orders List (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order # or patron..."
              className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs rounded text-white focus:outline-none focus:border-luxury-gold"
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-neutral-500" />
          </div>

          <div className="divide-y divide-neutral-800 max-h-[600px] overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <div className="py-12 px-4 text-center text-neutral-500 space-y-2">
                <ShoppingBag className="w-8 h-8 mx-auto text-neutral-600" />
                <p className="text-xs uppercase tracking-wider text-neutral-400">No Customer Orders Yet</p>
                <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
                  Real orders placed by customers at checkout will appear here automatically with live tracking and shipping labels.
                </p>
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-3 cursor-pointer rounded transition-colors text-xs space-y-1 ${
                      isSelected ? 'bg-luxury-gold/15 border-l-2 border-luxury-gold' : 'hover:bg-neutral-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white">{ord.order_number}</span>
                      <span className="text-luxury-gold font-serif">₹{ord.total.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>{ord.customer_name}</span>
                      <span className="uppercase font-mono text-[10px] px-1.5 py-0.5 bg-neutral-800 rounded">
                        {ord.order_status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Selected Order Details (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-6">
          {selectedOrder ? (
            <div className="space-y-6">
              {/* Order Header & Label Generator Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-4 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-mono text-luxury-gold">ORDER DETAILS</span>
                  <h2 className="font-serif text-2xl text-white font-mono">{selectedOrder.order_number}</h2>
                  <div className="text-xs text-neutral-400">
                    Commissioned: {new Date(selectedOrder.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {/* GENERATE SHIPPING LABEL BUTTON */}
                  <button
                    onClick={() => setIsLabelModalOpen(true)}
                    className="flex items-center space-x-2 px-3.5 py-2 bg-neutral-800 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black rounded text-xs uppercase tracking-wider font-semibold transition-all shadow-[0_0_15px_rgba(197,160,89,0.2)]"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Generate Shipping Label</span>
                  </button>
                </div>
              </div>

              {/* Status Progression Controls */}
              <div className="bg-neutral-950 p-4 rounded border border-neutral-800 space-y-3">
                <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium block">
                  Update Live Transit Status
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'confirmed', label: 'Accept Order' },
                    { id: 'packed', label: 'Pack in Luxury Box' },
                    { id: 'shipped', label: 'Dispatch / Ship' },
                    { id: 'out_for_delivery', label: 'Out for Delivery' },
                    { id: 'delivered', label: 'Mark Delivered' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => updateStatus(selectedOrder.id, btn.id)}
                      className={`px-3 py-1.5 text-xs uppercase font-mono tracking-wider rounded transition-colors ${
                        selectedOrder.order_status === btn.id
                          ? 'bg-luxury-gold text-black font-bold ring-2 ring-luxury-gold/50'
                          : 'bg-neutral-850 text-neutral-300 hover:bg-neutral-750'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patron and Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-neutral-950 p-4 rounded border border-neutral-800">
                <div>
                  <div className="text-luxury-gold uppercase text-[10px] font-semibold mb-1">Patron Details</div>
                  <div className="text-white font-medium">{selectedOrder.customer_name}</div>
                  <div className="text-neutral-400">{selectedOrder.customer_email}</div>
                  <div className="text-neutral-400 font-mono">Tel: {selectedOrder.customer_phone}</div>
                </div>

                <div>
                  <div className="text-luxury-gold uppercase text-[10px] font-semibold mb-1">Delivery Destination</div>
                  <div className="text-neutral-300 leading-relaxed">
                    {selectedOrder.shipping_address?.address_line}<br />
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.pincode}<br />
                    {selectedOrder.shipping_address?.country}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  Garments Commissioned ({selectedOrder.items.length})
                </h3>
                <div className="divide-y divide-neutral-800 bg-neutral-950 rounded border border-neutral-800">
                  {selectedOrder.items.map((it: OrderItem, idx: number) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <img src={it.image} alt={it.name} className="w-10 h-14 object-cover rounded bg-neutral-800" />
                        <div>
                          <div className="font-serif text-white">{it.name}</div>
                          <div className="text-[10px] text-neutral-500 uppercase">{it.colour} • {it.size} • Qty {it.quantity}</div>
                        </div>
                      </div>
                      <span className="font-mono text-white">₹{(it.price * it.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="bg-neutral-950 p-4 rounded border border-neutral-800 text-xs space-y-1.5 text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-white">₹{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-luxury-gold">
                    <span>Privilege Discount:</span>
                    <span>-₹{selectedOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="text-white font-mono uppercase font-bold">{selectedOrder.payment_method} ({selectedOrder.payment_status})</span>
                </div>
                <div className="border-t border-neutral-800 pt-2 flex justify-between text-sm text-white font-serif">
                  <span>Total Settled:</span>
                  <span className="text-luxury-gold font-bold">₹{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 px-6 text-center text-neutral-500 space-y-4">
              <div className="w-14 h-14 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                <Package className="w-6 h-6 text-luxury-gold" />
              </div>
              <div>
                <h3 className="font-serif text-lg uppercase text-white font-light">Order Fulfillment Pipeline</h3>
                <p className="text-xs text-neutral-400 font-light mt-1 max-w-sm mx-auto leading-relaxed">
                  Real patron orders placed on the storefront will appear here. You can inspect customer items, advance tracking milestones, and generate courier shipping labels.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRINTABLE OFFICIAL SHIPPING LABEL MODAL */}
      {isLabelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 text-neutral-200 animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block">
                  Logistics Dispatch
                </span>
                <h3 className="font-serif text-xl uppercase tracking-wider text-white">
                  Official Shipping Label
                </h3>
              </div>
              <button
                onClick={() => setIsLabelModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* PRINTABLE LABEL CONTAINER (Formatted for 4x6 / thermal / standard paper) */}
            <div className="bg-white text-black p-6 rounded-lg border-2 border-dashed border-neutral-400 space-y-4 font-sans text-xs shadow-2xl">
              {/* Label Top Bar */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div className="flex items-center space-x-3">
                  <img src="/logo.png" alt="MAHALEELA FASHION" className="h-10 w-auto filter invert" />
                  <div>
                    <h2 className="font-serif font-black text-sm uppercase tracking-widest">MAHALEELA FASHION</h2>
                    <p className="text-[9px] uppercase tracking-wider text-neutral-600 font-mono">Atelier Express Courier Logistics</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-black text-white font-mono font-bold text-xs uppercase">
                    {selectedOrder.payment_method === 'COD' ? `COD: ₹${selectedOrder.total}` : 'PREPAID'}
                  </span>
                  <div className="text-[9px] font-mono text-neutral-600 mt-0.5">HUB: BLR-SOUTH-EXP</div>
                </div>
              </div>

              {/* Barcode / Airway Bill Simulation */}
              <div className="py-2 border-b-2 border-black flex flex-col items-center">
                {/* Visual Barcode bars */}
                <div className="h-12 w-full max-w-sm flex justify-between items-stretch">
                  {[4,2,6,1,3,5,2,4,1,3,6,2,5,1,4,2,3,5,1,6,2,4,3,1,5,2,4,6,1,3,2,5,4,1,6,2,3,5].map((w, i) => (
                    <div key={i} className="bg-black" style={{ width: `${w}px` }} />
                  ))}
                </div>
                <span className="font-mono text-sm tracking-widest font-bold mt-1">
                  AWB-{selectedOrder.order_number}-IN
                </span>
              </div>

              {/* Consignee (Deliver To) */}
              <div className="grid grid-cols-2 gap-4 border-b-2 border-black pb-3">
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase text-neutral-500 block mb-0.5">
                    DELIVER TO (RECIPIENT):
                  </span>
                  <div className="font-bold text-sm uppercase">{selectedOrder.customer_name}</div>
                  <div className="text-xs leading-relaxed text-neutral-800">
                    {selectedOrder.shipping_address?.address_line}<br />
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}<br />
                    <span className="font-mono font-black text-sm">{selectedOrder.shipping_address?.pincode}</span><br />
                    INDIA
                  </div>
                  <div className="font-mono font-bold text-xs mt-1">TEL: {selectedOrder.customer_phone}</div>
                </div>

                <div className="border-l-2 border-black pl-4">
                  <span className="text-[9px] font-mono font-bold uppercase text-neutral-500 block mb-0.5">
                    DISPATCH ATELIER (FROM):
                  </span>
                  <div className="font-bold text-xs uppercase">MAHALEELA FASHION ATELIER</div>
                  <div className="text-[11px] leading-relaxed text-neutral-700">
                    2ACROSS MARUTI NAGAR, CHIKKABANAVARA<br />
                    BENGALURU, KARNATAKA 560090<br />
                    INDIA
                  </div>
                  <div className="font-mono text-xs mt-1">TEL: 8892919723</div>
                  <div className="mt-2 text-[10px] text-neutral-500 font-mono">
                    Weight: 0.85 KG • Pcs: {selectedOrder.items.reduce((a: number, b: OrderItem) => a + b.quantity, 0)}
                  </div>
                </div>
              </div>

              {/* Itemized Manifest Table */}
              <div className="border-b border-black pb-2">
                <span className="text-[9px] font-mono font-bold uppercase text-neutral-500 block mb-1">
                  PACKAGE CONTENTS:
                </span>
                <table className="w-full text-[10px] text-left">
                  <thead>
                    <tr className="border-b border-neutral-300 font-mono">
                      <th className="py-1">Item Description</th>
                      <th className="py-1">Size</th>
                      <th className="py-1">Colour</th>
                      <th className="py-1 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {selectedOrder.items.map((it: OrderItem, i: number) => (
                      <tr key={i}>
                        <td className="py-1 font-medium truncate max-w-[200px]">{it.name}</td>
                        <td className="py-1 font-mono">{it.size}</td>
                        <td className="py-1 uppercase">{it.colour}</td>
                        <td className="py-1 text-right font-mono font-bold">{it.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Instructions */}
              <div className="flex justify-between items-center text-[9px] text-neutral-600 font-mono">
                <span>Carefully packed in tamper-evident presentation packaging.</span>
                <span>MAHALEELA OFFICIAL LOGISTICS</span>
              </div>
            </div>

            {/* Print & Close Actions */}
            <div className="flex justify-end space-x-3 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setIsLabelModalOpen(false)}
                className="px-4 py-2 border border-neutral-700 text-neutral-300 rounded text-xs uppercase"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-6 py-2 bg-luxury-gold text-black rounded text-xs uppercase font-semibold hover:bg-luxury-goldLight transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Shipping Label</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
