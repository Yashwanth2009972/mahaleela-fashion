import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, User, SiteSettings, Coupon } from '../types';

interface AppContextType {
  user: User | null;
  isAdmin: boolean;
  login: (role?: 'SUPER_ADMIN' | 'CUSTOMER', email?: string) => Promise<void>;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: Product, colour: string, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, colour: string, size: string) => void;
  updateQuantity: (productId: string, colour: string, size: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  coupon: Coupon | null;
  couponDiscount: number;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  subtotal: number;
  shippingFee: number;
  codFee: number;
  total: number;
  paymentMethod: 'UPI' | 'COD';
  setPaymentMethod: (method: 'UPI' | 'COD') => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  refreshSettings: () => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const DEFAULT_SETTINGS: SiteSettings = {
  brand_name: "MAHALEELA FASHION",
  tagline: "A New Standard of Everyday Luxury",
  logo_url: "/logo.png",
  phone: "8892919723",
  email: "contact@mahaleelafashion.com",
  address: "2ACROSS MARUTI NAGAR\nCHIKKABANAVARA\nBENGALURU\n560090\nINDIA",
  free_shipping_threshold: 2000,
  cod_fee: 10,
  social: {
    instagram: "https://www.instagram.com/mahaleelafashion?stkn=MTUwMXZoemU1aDVrZg==",
    facebook: "https://www.facebook.com/share/19WYAmRggi/",
    youtube: "https://youtube.com/@mahaleelafashion?si=VNvR9rG1nVfsujnn"
  },
  policies: {
    shipping: "Orders across India are dispatched within 24-48 hours. Express delivery takes 2-4 business days. Free shipping on all orders exceeding ₹2,000.",
    returns: "We offer a discreet 7-day complimentary return and exchange policy for unworn items in pristine condition with original tags intact.",
    privacy: "Your private details and transactions are secured with military-grade encryption.",
    terms: "All designs, editorial photography, and trademarks are the exclusive property of MAHALEELA FASHION."
  },
  google_client_id: "",
  exclusive_settings: {
    title: "MAHALEELA EXCLUSIVE",
    subtitle: "A PRIVATE EDITION OF SELECTED PIECES. DIRECT ATELIER SHOPPING.",
    banner_image: "",
    direct_shopping_enabled: true
  }
};

import { storeService } from '../services/storeService';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ml_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ml_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('ml_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(() => {
    return storeService.getSettings();
  });
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');

  const isAdmin = Boolean(user && user.role && user.role.includes('ADMIN'));

  const refreshSettings = async () => {
    try {
      const current = storeService.getSettings();
      setSettings(current);
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  };

  useEffect(() => {
    refreshSettings();

    // Subscribe to real-time store updates across tabs / admin saves
    const unsubscribe = storeService.subscribe((event) => {
      if (event.type === 'settings') {
        setSettings(storeService.getSettings());
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('ml_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ml_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ml_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ml_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const login = async (role: 'SUPER_ADMIN' | 'CUSTOMER' = 'SUPER_ADMIN', email?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email })
      });
      const data = await res.json();
      setUser(data.user);
    } catch (e) {
      console.error('Login error:', e);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ml_user');
    localStorage.removeItem('ml_token');
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google login failed');
      }
      setUser(data.user);
      if (data.token) {
        localStorage.setItem('ml_token', data.token);
      }
      return { success: true, user: data.user };
    } catch (err: any) {
      console.error('Google auth error:', err);
      return { success: false, error: err.message || 'Google authentication failed' };
    }
  };

  const addToCart = (product: Product, colour: string, size: string, quantity = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id && item.colour === colour && item.size === size);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, colour, size, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, colour: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.colour === colour && item.size === size)));
  };

  const updateQuantity = (productId: string, colour: string, size: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.colour === colour && item.size === size) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
    setCouponDiscount(0);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const freeShippingThreshold = settings.free_shipping_threshold || 2000;
  const shippingFee = (subtotal >= freeShippingThreshold || subtotal === 0) ? 0 : 150;
  const codFee = paymentMethod === 'COD' && subtotal > 0 ? (settings.cod_fee || 10) : 0;
  const total = Math.max(0, subtotal - couponDiscount + shippingFee + codFee);

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    try {
      const val = storeService.validateCoupon(code, subtotal);
      if (val.valid && val.coupon) {
        setCoupon(val.coupon);
        setCouponDiscount(val.discount);
        return true;
      } else {
        setCouponError(val.error || 'Invalid promotional code');
        return false;
      }
    } catch (e) {
      setCouponError('Error validating coupon');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponDiscount(0);
    setCouponError(null);
  };

  return (
    <AppContext.Provider value={{
      user,
      isAdmin,
      login,
      logout,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      wishlist,
      toggleWishlist,
      isWishlisted,
      coupon,
      couponDiscount,
      couponError,
      applyCoupon,
      removeCoupon,
      subtotal,
      shippingFee,
      codFee,
      total,
      paymentMethod,
      setPaymentMethod,
      isSearchOpen,
      setIsSearchOpen,
      settings,
      setSettings,
      refreshSettings,
      loginWithGoogle,
      setUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
