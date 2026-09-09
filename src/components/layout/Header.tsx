import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, Heart, User, ShieldCheck, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { user, isAdmin, cart, wishlist, setIsCartOpen, setIsSearchOpen, login, logout, settings } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isExclusivePage = location.pathname.startsWith('/exclusive');
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // If inside Admin CMS, header is managed separately in AdminLayout
  if (isAdminPage) {
    return null;
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-luxury-black/90 backdrop-blur-md border-b border-neutral-800/80 py-3 shadow-2xl'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* LEFT: Editorial Menu Trigger */}
          <div className="flex items-center space-x-6 flex-1">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="group flex items-center space-x-2 text-neutral-300 hover:text-luxury-gold transition-colors focus:outline-none"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 transition-transform group-hover:scale-105" />
              <span className="hidden sm:inline-block text-xs uppercase tracking-luxury font-medium">
                Menu
              </span>
            </button>

            {/* Subtle Quick Links on Desktop */}
            <nav className="hidden lg:flex items-center space-x-6 text-[11px] uppercase tracking-luxury text-neutral-400 font-light">
              <Link to="/new-arrivals" className="hover:text-white transition-colors">New Arrivals</Link>
              <Link to="/clothing" className="hover:text-white transition-colors">Clothing</Link>
              <Link to="/accessories" className="hover:text-white transition-colors">Accessories</Link>
              <Link to="/collections" className="hover:text-luxury-gold transition-colors">Collections</Link>
              <Link to="/exclusive" className="text-luxury-gold hover:text-white transition-colors font-medium">Exclusive</Link>
            </nav>
          </div>

          {/* CENTER: Visually Dominant MAHALEELA FASHION Logo */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <Link to="/" className="group flex flex-col items-center">
              <img
                src={settings.logo_url || '/logo.png'}
                alt="MAHALEELA FASHION"
                className="h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(197,160,89,0.3)]"
              />
            </Link>
          </div>

          {/* RIGHT: Search, Account, Wishlist, Cart, Join Exclusive, Admin (Role-Guarded) */}
          <div className="flex items-center justify-end space-x-4 sm:space-x-5 flex-1">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-neutral-300 hover:text-luxury-gold transition-colors p-1"
              aria-label="Search"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account */}
            <Link
              to="/account"
              className="text-neutral-300 hover:text-luxury-gold transition-colors p-1"
              aria-label="Account"
              title={user ? `${user.name} (${user.role})` : 'Sign In'}
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative text-neutral-300 hover:text-luxury-gold transition-colors p-1"
              aria-label="Wishlist"
              title="Saved for Later"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-luxury-gold text-black text-[9px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Drawer Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-neutral-300 hover:text-luxury-gold transition-colors p-1"
              aria-label="View Cart"
              title="Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-luxury-gold text-black text-[9px] font-bold flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* EXCLUSIVE Text Link (Direct Shopping) */}
            <Link
              to="/exclusive"
              className="hidden xl:inline-block text-[10px] tracking-luxury uppercase px-3 py-1.5 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black transition-all duration-300 font-semibold shadow-[0_0_12px_rgba(197,160,89,0.2)]"
            >
              Exclusive
            </Link>

            {/* ADMIN PORTAL LINK */}
            <Link
              to="/admin"
              className="flex items-center space-x-1.5 px-3 py-1 bg-luxury-gold/15 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black rounded text-[10px] tracking-widest font-semibold uppercase transition-all duration-300 shadow-[0_0_15px_rgba(197,160,89,0.25)]"
              title="Enter Admin CMS"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMIN</span>
            </Link>
            {user && (
              <button
                onClick={logout}
                className="hidden lg:inline-block text-[9px] text-neutral-400 hover:text-red-400 tracking-wider uppercase ml-1"
                title="Log out"
              >
                Exit
              </button>
            )}
          </div>
        </div>
      </header>

      {/* LUXURY EDITORIAL SLIDE-OVER NAVIGATION DRAWER */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-luxury-black border-r border-neutral-800 text-neutral-100 flex flex-col justify-between p-8 z-10 overflow-y-auto animate-fade-in">
            {/* Top Bar */}
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
                <img
                  src={settings.logo_url || '/logo.png'}
                  alt="MAHALEELA FASHION"
                  className="h-9 w-auto object-contain"
                />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white transition-colors"
                  aria-label="Close navigation"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Main Links */}
              <nav className="mt-8 space-y-5">
                {[
                  { name: "MEN", path: "/men" },
                  { name: "NEW ARRIVALS", path: "/new-arrivals" },
                  { name: "CLOTHING", path: "/clothing" },
                  { name: "ACCESSORIES", path: "/accessories" },
                  { name: "COLLECTIONS", path: "/collections" },
                  { name: "THE SALE EDIT", path: "/sale" },
                  { name: "MAHALEELA EXCLUSIVE", path: "/exclusive" }
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="group flex items-center justify-between text-lg tracking-widest uppercase font-serif py-1.5 hover:text-luxury-gold transition-colors"
                  >
                    <span>{item.name}</span>
                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-luxury-gold transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}

                {/* Categories Accordion/Direct links */}
                <div className="pt-6 border-t border-neutral-800">
                  <div className="text-[10px] tracking-luxury uppercase text-neutral-400 mb-3">
                    Approved Categories
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs tracking-wider uppercase text-neutral-300">
                    <Link to="/clothing?category=t-shirts" className="hover:text-luxury-gold py-1">T-Shirts</Link>
                    <Link to="/clothing?category=shirts" className="hover:text-luxury-gold py-1">Shirts</Link>
                    <Link to="/clothing?category=hoodies" className="hover:text-luxury-gold py-1">Hoodies</Link>
                    <Link to="/clothing?category=sweatshirts" className="hover:text-luxury-gold py-1">Sweatshirts</Link>
                    <Link to="/accessories?category=watches" className="hover:text-luxury-gold py-1">Watches</Link>
                    <Link to="/accessories?category=sunglasses" className="hover:text-luxury-gold py-1">Sunglasses</Link>
                    <Link to="/accessories?category=photo-frames" className="hover:text-luxury-gold py-1">Photo Frames</Link>
                    <Link to="/accessories?category=headcaps" className="hover:text-luxury-gold py-1">Headcaps</Link>
                    <Link to="/accessories?category=mugs" className="hover:text-luxury-gold py-1">Mugs</Link>
                    <Link to="/accessories?category=keychains" className="hover:text-luxury-gold py-1">Keychains</Link>
                    <Link to="/accessories?category=wallets" className="hover:text-luxury-gold py-1">Wallets</Link>
                  </div>
                </div>

                {/* Admin link in drawer */}
                <div className="pt-6 border-t border-luxury-gold/30">
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between bg-luxury-gold/10 border border-luxury-gold text-luxury-gold p-3 rounded tracking-widest text-xs uppercase font-semibold hover:bg-luxury-gold hover:text-black transition-colors"
                  >
                    <span className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>ADMIN CMS</span>
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </nav>
            </div>

            {/* Bottom Details & Quick User Switch */}
            <div className="pt-6 border-t border-neutral-800 text-xs text-neutral-400 space-y-4">
              <div className="flex items-center justify-between">
                <span>{user ? `Logged in: ${user.name}` : 'Not logged in'}</span>
                {user ? (
                  <button onClick={logout} className="text-red-400 hover:underline">Log Out</button>
                ) : (
                  <div className="space-x-2">
                    <button onClick={() => login('CUSTOMER')} className="text-luxury-gold hover:underline">Customer</button>
                    <span>|</span>
                    <button onClick={() => login('SUPER_ADMIN')} className="text-luxury-gold hover:underline">Admin</button>
                  </div>
                )}
              </div>
              <div className="text-[11px] text-neutral-400">
                Phone: {settings.phone}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
