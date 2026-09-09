import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, MapPin, Heart, Crown, Settings, LogOut, CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { GoogleAuth } from '../components/ui/GoogleAuth';

export const Account: React.FC = () => {
  const { user, login, logout, isAdmin } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'track' | 'addresses' | 'exclusive'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/orders');
        const data: Order[] = await res.json();
        setOrders(data);
        if (data.length > 0) {
          setSelectedOrder(data[0]);
        }
      } catch (e) {
        console.error('Account orders error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="bg-luxury-black text-neutral-100 min-h-screen pt-28 pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-8 mb-12">
          <div>
            <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block mb-1">
              PATRON ARCHIVE
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl tracking-widest uppercase font-light text-white">
              CLIENT DASHBOARD
            </h1>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 bg-luxury-gold/15 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black text-xs uppercase tracking-widest font-semibold transition-colors flex items-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Open Admin CMS</span>
              </Link>
            )}

            {user && (
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-xs uppercase tracking-wider text-neutral-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {!user ? (
          /* Dedicated Patron Authentication Gateway */
          <div className="max-w-lg mx-auto bg-neutral-950 border border-neutral-800 p-8 sm:p-10 shadow-2xl space-y-8 text-center animate-fade-in">
            <div className="space-y-2">
              <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block">
                Patron Authentication
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl tracking-wider uppercase text-white font-light">
                Sign In to Atelier
              </h2>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                Authenticate with your official Google account to review orders, observe transit timelines, and access private editions.
              </p>
            </div>

            {/* Official Google Identity Services Auth */}
            <div className="pt-2">
              <GoogleAuth />
            </div>

            {/* 2. Patron Email Login */}
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-neutral-800 w-full" />
              <span className="bg-neutral-950 px-3 text-[10px] uppercase tracking-wider text-neutral-500 font-mono">
                Or Sign In with Email
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                login('CUSTOMER', emailInput || undefined);
              }}
              className="space-y-3 text-left"
            >
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                  Patron Email Address
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 rounded text-white text-xs font-mono focus:outline-none focus:border-luxury-gold"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-neutral-900 border border-neutral-700 hover:border-luxury-gold hover:text-luxury-gold text-white text-xs uppercase tracking-wider font-semibold rounded transition-colors"
              >
                Continue to Account
              </button>
            </form>

            <div className="pt-4 border-t border-neutral-850 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => login('SUPER_ADMIN')}
                className="text-luxury-gold hover:underline text-[11px] uppercase tracking-wider font-medium"
              >
                Admin CMS Access &rarr;
              </button>
              <Link
                to="/admin/settings"
                className="text-neutral-500 hover:text-white text-[10px] uppercase tracking-wider"
              >
                Store Owner Settings
              </Link>
            </div>
          </div>
        ) : (
          /* Dashboard Content */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Navigation Tabs (3 cols) */}
            <div className="lg:col-span-3 bg-neutral-950 border border-neutral-850 p-6 space-y-2 h-fit">
              <div className="pb-4 mb-4 border-b border-neutral-800 flex items-center space-x-3">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border border-luxury-gold object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full border border-neutral-700 bg-neutral-900 flex items-center justify-center text-luxury-gold font-serif text-lg">
                    {user.name ? user.name.charAt(0) : 'P'}
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Patron</div>
                  <div className="font-serif text-base text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-luxury-gold uppercase tracking-wider font-mono">
                    {user.role}
                  </div>
                </div>
              </div>

              {[
                { id: 'orders', label: 'Orders & Archives', icon: Package },
                { id: 'track', label: 'Live Tracking Timeline', icon: Clock },
                { id: 'profile', label: 'Patron Profile', icon: User },
                { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
                { id: 'exclusive', label: 'Exclusive Status', icon: Crown }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 text-xs uppercase tracking-wider transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-luxury-gold/15 text-luxury-gold border-l-2 border-luxury-gold font-medium'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Tab Content (9 cols) */}
            <div className="lg:col-span-9 bg-neutral-950 border border-neutral-850 p-8">
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <h2 className="font-serif text-xl uppercase tracking-wider text-white">Your Orders</h2>
                  <span className="text-xs text-neutral-500">{orders.length} Order{orders.length !== 1 ? 's' : ''}</span>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-xs uppercase tracking-widest text-neutral-400">Accessing archives...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 text-neutral-400 text-sm">
                    No orders on record. Explore our collections to commission your first piece.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((ord) => (
                      <div key={ord.id} className="border border-neutral-800 p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-400 pb-3 border-b border-neutral-850 gap-2">
                          <div className="space-y-1">
                            <span className="text-white font-mono font-bold text-sm block">{ord.order_number}</span>
                            <span>Placed: {new Date(ord.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="sm:text-right space-y-1">
                            <span className="inline-block px-2.5 py-1 bg-neutral-900 border border-luxury-gold/40 text-luxury-gold font-mono uppercase text-[10px]">
                              Status: {ord.order_status.replace('_', ' ')}
                            </span>
                            <div className="text-white font-serif text-sm">Total: ₹{ord.total.toLocaleString()}</div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="divide-y divide-neutral-850">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="py-3 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <img src={item.image} alt={item.name} className="w-12 h-14 object-cover bg-neutral-900" />
                                <div>
                                  <h4 className="font-serif text-sm text-white">{item.name}</h4>
                                  <p className="text-[10px] text-neutral-400 uppercase">{item.colour} • {item.size} • Qty {item.quantity}</p>
                                </div>
                              </div>
                              <span className="text-xs text-white font-mono">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setActiveTab('track');
                            }}
                            className="px-4 py-2 border border-luxury-gold text-luxury-gold text-xs uppercase tracking-wider hover:bg-luxury-gold hover:text-black transition-colors"
                          >
                            View Live Timeline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TRACK ORDER TIMELINE TAB */}
            {activeTab === 'track' && (
              <div className="space-y-8">
                <div className="border-b border-neutral-800 pb-4">
                  <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block">Realtime Logistics</span>
                  <h2 className="font-serif text-xl uppercase tracking-wider text-white">
                    Order Tracking Timeline
                  </h2>
                </div>

                {selectedOrder ? (
                  <div className="space-y-8">
                    <div className="bg-neutral-900 p-4 border border-neutral-800 flex flex-col sm:flex-row justify-between text-xs">
                      <div>
                        <div className="text-neutral-400">Order Reference:</div>
                        <div className="text-white font-mono font-bold text-sm">{selectedOrder.order_number}</div>
                      </div>
                      <div className="mt-2 sm:mt-0 sm:text-right">
                        <div className="text-neutral-400">Current Stage:</div>
                        <div className="text-luxury-gold uppercase font-mono font-bold text-sm">
                          {selectedOrder.order_status.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Stages */}
                    <div className="relative pl-6 border-l-2 border-neutral-800 space-y-8 my-8 ml-2">
                      {selectedOrder.tracking_timeline?.map((stage, idx) => (
                        <div key={idx} className="relative">
                          {/* Dot indicator */}
                          <div
                            className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 transition-colors ${
                              stage.completed
                                ? 'bg-luxury-gold border-luxury-gold'
                                : 'bg-neutral-900 border-neutral-700'
                            }`}
                          />
                          <div className="space-y-1">
                            <h4 className={`text-sm uppercase tracking-wider font-serif ${
                              stage.completed ? 'text-white' : 'text-neutral-500'
                            }`}>
                              {stage.label}
                            </h4>
                            <p className="text-xs text-neutral-400 font-mono">
                              {stage.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-neutral-400 text-sm">
                    Select an order from the Orders tab to observe its transit timeline.
                  </div>
                )}
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl uppercase tracking-wider text-white border-b border-neutral-800 pb-4">
                  Patron Profile
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div>
                    <label className="block text-neutral-400 uppercase tracking-wider mb-1">Name</label>
                    <div className="p-3 bg-neutral-900 border border-neutral-800 text-white flex items-center space-x-2">
                      {user?.picture && (
                        <img src={user.picture} alt="" className="w-5 h-5 rounded-full" />
                      )}
                      <span>{user?.name || 'Yashwanth Kumar'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-neutral-400 uppercase tracking-wider mb-1">Email</label>
                    <div className="p-3 bg-neutral-900 border border-neutral-800 text-white font-mono">{user?.email || 'admin@mahaleela.com'}</div>
                  </div>
                  <div>
                    <label className="block text-neutral-400 uppercase tracking-wider mb-1">Role Privilege</label>
                    <div className="p-3 bg-neutral-900 border border-neutral-800 text-luxury-gold font-mono font-semibold">{user?.role || 'SUPER_ADMIN'}</div>
                  </div>
                  <div>
                    <label className="block text-neutral-400 uppercase tracking-wider mb-1">Exclusive Status</label>
                    <div className="p-3 bg-neutral-900 border border-neutral-800 text-luxury-gold font-semibold flex items-center justify-between">
                      <span>Direct Atelier Access Active</span>
                      <span className="text-[10px] px-2 py-0.5 bg-luxury-gold/15 border border-luxury-gold/50 rounded font-mono">UNRESTRICTED</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl uppercase tracking-wider text-white border-b border-neutral-800 pb-4">
                  Primary Delivery Address
                </h2>
                <div className="p-6 border border-neutral-800 bg-neutral-900 space-y-2 text-xs">
                  <div className="text-luxury-gold uppercase tracking-wider font-semibold text-[10px]">Default Address</div>
                  <div className="text-white font-medium text-sm">Yashwanth Kumar</div>
                  <div className="text-neutral-400 leading-relaxed">
                    2ACROSS MARUTI NAGAR, CHIKKABANAVARA<br />
                    BENGALURU, KARNATAKA 560090<br />
                    INDIA
                  </div>
                  <div className="text-neutral-500 pt-1 font-mono">Telephone: 8892919723</div>
                </div>
              </div>
            )}

            {/* EXCLUSIVE TAB */}
            {activeTab === 'exclusive' && (
              <div className="space-y-6">
                <h2 className="font-serif text-xl uppercase tracking-wider text-white border-b border-neutral-800 pb-4">
                  Mahaleela Exclusive Access
                </h2>
                <div className="p-6 border border-luxury-gold/40 bg-luxury-gold/5 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Crown className="w-6 h-6 text-luxury-gold" />
                    <div>
                      <h3 className="font-serif text-lg text-white">Direct Atelier Access Active</h3>
                      <p className="text-xs text-luxury-gold">Open to all patrons — No membership gating</p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-300 font-light leading-relaxed">
                    You have unrestricted clearance for our private edition releases, archival timepieces, and exclusive atelier collections with direct shopping and checkout.
                  </p>
                  <Link
                    to="/exclusive"
                    className="inline-block px-6 py-2.5 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors"
                  >
                    Shop Exclusive Edition
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
