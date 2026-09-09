import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Layers,
  AlertTriangle,
  Users,
  Plus,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { Product, Order, Collection } from '../../types';

import { storeService } from '../../services/storeService';

export const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    try {
      setProducts(storeService.getProducts());
      setOrders(storeService.getOrders());
      setCollections(storeService.getCollections());
    } catch (e) {
      console.error('Dashboard data error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubscribe = storeService.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  const totalRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 15);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const exclusiveProducts = products.filter(p => p.is_exclusive);

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
        <div>
          <span className="text-[10px] tracking-luxury uppercase text-luxury-gold font-medium block mb-1">
            EXECUTIVE TELEMETRY
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wider font-light">
            Atelier Command Center
          </h1>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Realtime synchronisation between customer storefront and administrative database.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/products"
            className="flex items-center space-x-1.5 px-3 py-2 bg-luxury-gold text-black rounded text-xs uppercase tracking-wider font-semibold hover:bg-luxury-goldLight transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            to="/admin/collections"
            className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 border border-luxury-gold/50 text-luxury-gold rounded text-xs uppercase tracking-wider font-medium hover:bg-neutral-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Collection</span>
          </Link>
          <Link
            to="/admin/homepage"
            className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-800 text-neutral-200 rounded text-xs uppercase tracking-wider hover:bg-neutral-700 transition-colors"
          >
            <span>Homepage Builder</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs uppercase tracking-wider">Gross Revenue</span>
            <TrendingUp className="w-4 h-4 text-luxury-gold" />
          </div>
          <div className="text-2xl font-serif text-white font-medium">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-green-400 font-mono">
            +14.8% vs last campaign
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-luxury-gold" />
          </div>
          <div className="text-2xl font-serif text-white font-medium">
            {orders.length}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Active pipeline
          </div>
        </div>

        {/* Total Collections (CRITICAL) */}
        <div className="bg-neutral-900 border border-luxury-gold/40 p-5 rounded-lg space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs uppercase tracking-wider text-luxury-gold">Active Collections</span>
            <Layers className="w-4 h-4 text-luxury-gold" />
          </div>
          <div className="text-2xl font-serif text-white font-medium">
            {collections.length}
          </div>
          <Link to="/admin/collections" className="text-[11px] text-luxury-gold hover:underline flex items-center space-x-1">
            <span>Manage Collections</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Catalog Items */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs uppercase tracking-wider">Active Products</span>
            <Package className="w-4 h-4 text-luxury-gold" />
          </div>
          <div className="text-2xl font-serif text-white font-medium">
            {products.length}
          </div>
          <div className="text-[11px] text-neutral-400">
            Strict 11 menswear categories
          </div>
        </div>
      </div>

      {/* Secondary Monitor Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg">
          <span className="text-xs uppercase tracking-wider text-neutral-400 block mb-2">
            Low Stock Alerts (&le;15 units)
          </span>
          <div className="text-xl font-mono text-amber-400 font-bold">
            {lowStockProducts.length} Product{lowStockProducts.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg">
          <span className="text-xs uppercase tracking-wider text-neutral-400 block mb-2">
            Out of Stock (0 units)
          </span>
          <div className="text-xl font-mono text-neutral-300 font-bold">
            {outOfStockProducts.length} Products
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg">
          <span className="text-xs uppercase tracking-wider text-neutral-400 block mb-2">
            Exclusive Edition Pieces
          </span>
          <div className="text-xl font-mono text-luxury-gold font-bold">
            {exclusiveProducts.length} Pieces
          </div>
        </div>
      </div>

      {/* Tables: Recent Orders & Collections Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="font-serif text-base uppercase tracking-wider text-white">
              Recent Customer Orders
            </h3>
            <Link to="/admin/orders" className="text-xs uppercase text-luxury-gold hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-neutral-800">
            {orders.slice(0, 5).map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-mono text-white font-bold">{ord.order_number}</div>
                  <div className="text-neutral-400">{ord.customer_name} • {ord.items.length} item(s)</div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-white">₹{ord.total.toLocaleString()}</div>
                  <span className="inline-block px-2 py-0.5 bg-neutral-800 text-luxury-gold uppercase text-[9px] font-mono rounded">
                    {ord.order_status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collections Quick Glance */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="font-serif text-base uppercase tracking-wider text-white">
              Collections Status
            </h3>
            <Link to="/admin/collections" className="text-xs uppercase text-luxury-gold hover:underline">
              Manage Collections
            </Link>
          </div>

          <div className="divide-y divide-neutral-800">
            {collections.slice(0, 5).map((col) => (
              <div key={col.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <img src={col.thumbnail || col.desktop_banner} alt={col.name} className="w-10 h-10 object-cover rounded bg-neutral-800" />
                  <div>
                    <div className="font-serif text-white font-medium">{col.name}</div>
                    <div className="text-neutral-500">{col.product_count || 0} product(s) attached</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-green-950/60 text-green-400 border border-green-800/60 rounded text-[9px] uppercase font-mono">
                  {col.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
