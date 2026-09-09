import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SearchOverlay } from './components/ui/SearchOverlay';
import { CartDrawer } from './components/ui/CartDrawer';

// Storefront Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Collections } from './pages/Collections';
import { CollectionDetail } from './pages/CollectionDetail';
import { ProductDetail } from './pages/ProductDetail';
import { Wishlist } from './pages/Wishlist';
import { CartPage } from './pages/CartPage';
import { Checkout } from './pages/Checkout';
import { Account } from './pages/Account';
import { Exclusive } from './pages/Exclusive';
import { ExclusiveJoin } from './pages/ExclusiveJoin';

// Admin CMS Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCollections } from './pages/admin/AdminCollections';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminHomepage } from './pages/admin/AdminHomepage';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminExclusive } from './pages/admin/AdminExclusive';
import { AdminMedia } from './pages/admin/AdminMedia';
import { AdminSettings } from './pages/admin/AdminSettings';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen bg-luxury-black text-neutral-100">
        <Header />
        <SearchOverlay />
        <CartDrawer />

        <div className="flex-1">
          <Routes>
            {/* Storefront Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/men" element={<Shop title="SHOP MEN" />} />
            <Route path="/new-arrivals" element={<Shop title="NEW ARRIVALS" defaultFilter={{ is_new: true }} />} />
            <Route path="/clothing" element={<Shop title="MENSWEAR CLOTHING" defaultFilter={{ is_clothing: true }} />} />
            <Route path="/accessories" element={<Shop title="MEN'S ACCESSORIES" defaultFilter={{ is_accessories: true }} />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collection/:slug" element={<CollectionDetail />} />
            <Route path="/sale" element={<Shop title="THE SALE EDIT" defaultFilter={{ is_sale: true }} />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<Navigate to="/account" replace />} />
            
            {/* Exclusive Storefront Routes */}
            <Route path="/exclusive" element={<Exclusive />} />
            <Route path="/exclusive/join" element={<ExclusiveJoin />} />

            {/* Integrated Admin CMS Routes (Authenticated Role-Guarded) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="collections" element={<AdminCollections />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="homepage" element={<AdminHomepage />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="exclusive" element={<AdminExclusive />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </AppProvider>
  );
};
