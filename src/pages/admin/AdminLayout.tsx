import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  FolderTree,
  ShoppingBag,
  Users,
  Image,
  Sliders,
  Tag,
  Percent,
  Sparkles,
  Settings,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Lock,
  Unlock,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ADMIN_MASTER_PIN = '182009';

export const AdminLayout: React.FC = () => {
  const { user, login, logout, settings } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // PIN security lock state (locked by default unless master PIN is provided)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return (
      sessionStorage.getItem('ml_admin_pin') === ADMIN_MASTER_PIN ||
      localStorage.getItem('ml_admin_pin') === ADMIN_MASTER_PIN
    );
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_MASTER_PIN) {
      sessionStorage.setItem('ml_admin_pin', ADMIN_MASTER_PIN);
      localStorage.setItem('ml_admin_pin', ADMIN_MASTER_PIN);
      setIsUnlocked(true);
      setPinError(false);
      // Auto-authenticate as Super Admin
      login('SUPER_ADMIN');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleLockAdmin = () => {
    sessionStorage.removeItem('ml_admin_pin');
    localStorage.removeItem('ml_admin_pin');
    setIsUnlocked(false);
    logout();
  };

  // If locked, show luxury PIN verification screen
  if (!isUnlocked) {
    return (
      <div className="bg-luxury-black text-neutral-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-neutral-950 border border-luxury-gold/50 p-8 sm:p-12 max-w-md w-full text-center space-y-6 shadow-[0_0_50px_rgba(197,160,89,0.15)] animate-fade-in">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-luxury-gold/10 border border-luxury-gold flex items-center justify-center text-luxury-gold">
              <Lock className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-luxury text-luxury-gold block font-mono">
              SECURITY ACCESS REQUIRED
            </span>
            <h1 className="font-serif text-2xl uppercase tracking-widest text-white font-light">
              ADMIN CMS LOCKED
            </h1>
            <p className="text-xs text-neutral-400 font-light leading-relaxed pt-1">
              Enter your master 6-digit authorization PIN to unlock the administrative dashboard and storefront controls.
            </p>
          </div>

          <form onSubmit={handleUnlockWithPin} className="space-y-4 pt-2">
            <div>
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Enter PIN"
                className="w-full bg-neutral-900 border border-neutral-700 focus:border-luxury-gold p-3.5 rounded text-white text-center text-2xl tracking-[0.5em] font-mono focus:outline-none placeholder-neutral-600"
              />
            </div>

            {pinError && (
              <div className="flex items-center justify-center space-x-1.5 text-red-400 text-xs animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Incorrect Security PIN. Please try again.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-luxury-gold hover:bg-luxury-goldLight text-black text-xs uppercase tracking-luxury font-semibold transition-colors shadow-[0_0_20px_rgba(197,160,89,0.3)] flex items-center justify-center space-x-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-850">
            <Link
              to="/"
              className="text-xs text-neutral-500 hover:text-luxury-gold transition-colors uppercase tracking-wider"
            >
              &larr; Return to Public Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin Navigation Sidebar Items - COLLECTIONS IS CLEARLY VISIBLE AND PROMINENT
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Collections', path: '/admin/collections', icon: Layers },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Homepage Builder', path: '/admin/homepage', icon: Sliders },
    { name: 'Banners', path: '/admin/banners', icon: Image },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Exclusive Edition', path: '/admin/exclusive', icon: Sparkles },
    { name: 'Media Library', path: '/admin/media', icon: Image },
    { name: 'Site Settings', path: '/admin/settings', icon: Settings },
  ];

  // Breadcrumbs calculation
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, idx) => {
    const url = '/' + pathParts.slice(0, idx + 1).join('/');
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    return { label, url };
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-neutral-400 hover:text-white"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/admin" className="flex items-center space-x-3">
            <img src={settings.logo_url || '/logo.png'} alt="MAHALEELA" className="h-8 w-auto" />
            <div className="border-l border-neutral-700 pl-3">
              <span className="text-xs font-serif tracking-widest uppercase text-white font-semibold block">
                MAHALEELA FASHION
              </span>
              <span className="text-[9px] uppercase tracking-luxury text-luxury-gold block">
                ADMIN CMS PORTAL
              </span>
            </div>
          </Link>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center space-x-3">
          {/* Cloud Sync Status Indicator */}
          <Link
            to="/admin/settings"
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider border transition-colors ${
              settings.cloud_sync?.firebase_url || settings.cloud_sync?.backend_url
                ? 'bg-green-950/60 border-green-700 text-green-400 hover:bg-green-900/60'
                : 'bg-amber-950/60 border-amber-700 text-amber-400 hover:bg-amber-900/60'
            }`}
            title="Click to manage Live Cloud Sync & Customer Sharing"
          >
            <span className={`w-2 h-2 rounded-full ${settings.cloud_sync?.firebase_url || settings.cloud_sync?.backend_url ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{settings.cloud_sync?.firebase_url || settings.cloud_sync?.backend_url ? 'Cloud Sync: Active' : 'Cloud Sync: Local Only'}</span>
          </Link>

          <Link
            to="/"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs uppercase tracking-wider transition-colors"
          >
            <span>Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-luxury-gold" />
          </Link>

          <button
            onClick={handleLockAdmin}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-950/40 border border-red-800/60 hover:bg-red-900/60 text-red-300 rounded text-xs uppercase tracking-wider transition-colors"
            title="Lock Admin Panel"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Admin</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-20 w-64 bg-neutral-900 border-r border-neutral-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
            sidebarOpen ? 'translate-x-0 pt-16 lg:pt-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col justify-between py-6 px-4 overflow-y-auto">
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold px-3 mb-2">
                Management Modules
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded text-xs uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'bg-luxury-gold/20 text-luxury-gold border-r-2 border-luxury-gold font-medium'
                        : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                    {item.name === 'Collections' && (
                      <span className="ml-auto bg-luxury-gold/20 text-luxury-gold text-[9px] px-1.5 py-0.5 rounded font-mono">
                        Direct
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Atelier Info footer */}
            <div className="pt-6 border-t border-neutral-800 text-[10px] text-neutral-500 px-3">
              <div>MAHALEELA CMS v2.0</div>
              <div>Master Security Active</div>
            </div>
          </div>
        </aside>

        {/* Right Workspace Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-neutral-950">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs text-neutral-500 mb-6 font-mono">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={b.url}>
                {i > 0 && <ChevronRight className="w-3 h-3 text-neutral-600" />}
                <Link
                  to={b.url}
                  className={`hover:text-luxury-gold transition-colors ${
                    i === breadcrumbs.length - 1 ? 'text-luxury-gold font-semibold' : ''
                  }`}
                >
                  {b.label}
                </Link>
              </React.Fragment>
            ))}
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
};
