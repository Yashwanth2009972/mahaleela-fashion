import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Instagram, Facebook, Youtube, ArrowUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { settings } = useApp();
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-luxury-black text-neutral-300 border-t border-neutral-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-neutral-800">
          {/* Brand & Address Column */}
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="inline-block">
              <img
                src={settings.logo_url || '/logo.png'}
                alt="MAHALEELA FASHION"
                className="h-16 w-auto object-contain drop-shadow-[0_2px_12px_rgba(197,160,89,0.3)]"
              />
            </Link>
            <p className="text-neutral-400 text-sm max-w-md font-light leading-relaxed">
              A new standard of everyday luxury. Dedicated to high-end independent menswear defined by architectural cuts, heavyweight textiles, and gold micro-precision.
            </p>

            <div className="text-xs text-neutral-400 space-y-1">
              <div className="font-semibold text-neutral-200 uppercase tracking-widest text-[10px] mb-2">
                Atelier & Studio
              </div>
              <p className="whitespace-pre-line leading-relaxed font-light">{settings.address}</p>
              <p className="pt-2 text-luxury-gold font-medium">Telephone: +91 {settings.phone}</p>
            </div>
          </div>

          {/* Editorial Navigation */}
          <div>
            <h4 className="font-serif text-sm tracking-luxury uppercase text-neutral-100 mb-6">
              Navigation
            </h4>
            <ul className="space-y-3 text-xs tracking-wider uppercase text-neutral-400 font-light">
              <li><Link to="/men" className="hover:text-luxury-gold transition-colors">Shop Men</Link></li>
              <li><Link to="/new-arrivals" className="hover:text-luxury-gold transition-colors">New Arrivals</Link></li>
              <li><Link to="/clothing" className="hover:text-luxury-gold transition-colors">Clothing</Link></li>
              <li><Link to="/accessories" className="hover:text-luxury-gold transition-colors">Accessories</Link></li>
              <li><Link to="/collections" className="hover:text-luxury-gold transition-colors">Collections</Link></li>
              <li><Link to="/sale" className="hover:text-luxury-gold transition-colors">The Sale Edit</Link></li>
              <li><Link to="/exclusive" className="hover:text-luxury-gold transition-colors">Private Edition</Link></li>
              <li><Link to="/exclusive/join" className="text-luxury-gold hover:underline transition-colors">Join Exclusive</Link></li>
            </ul>
          </div>

          {/* Client Privilege & Policies */}
          <div>
            <h4 className="font-serif text-sm tracking-luxury uppercase text-neutral-100 mb-6">
              Client Privilege
            </h4>
            <ul className="space-y-3 text-xs tracking-wider uppercase text-neutral-400 font-light">
              <li><Link to="/account" className="hover:text-luxury-gold transition-colors">Client Account</Link></li>
              <li><Link to="/account" className="hover:text-luxury-gold transition-colors">Order Tracking</Link></li>
              <li><Link to="/wishlist" className="hover:text-luxury-gold transition-colors">Saved Items</Link></li>
              <li><span className="text-neutral-500">Free Delivery Over ₹{settings.free_shipping_threshold}</span></li>
              <li><span className="text-neutral-500">COD Convenience Fee ₹{settings.cod_fee}</span></li>
              <li><span className="text-neutral-500">Discreet 7-Day Returns</span></li>
              <li><span className="text-neutral-500">100% Secure Checkout</span></li>
            </ul>

            {/* Social Icons */}
            <div className="mt-8">
              <div className="text-[10px] tracking-widest uppercase text-neutral-400 mb-3">
                Follow MAHALEELA
              </div>
              <div className="flex items-center space-x-4">
                {settings.social.instagram && (
                  <a
                    href={settings.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-luxury-gold hover:border-luxury-gold transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings.social.facebook && (
                  <a
                    href={settings.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-luxury-gold hover:border-luxury-gold transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings.social.youtube && (
                  <a
                    href={settings.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-300 hover:text-luxury-gold hover:border-luxury-gold transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Micro Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 font-light">
          <p>© {new Date().getFullYear()} MAHALEELA FASHION. All Rights Reserved. Crafted for the Modern Man.</p>
          <button
            onClick={scrollToTop}
            className="mt-4 sm:mt-0 flex items-center space-x-2 text-neutral-400 hover:text-luxury-gold transition-colors uppercase tracking-widest text-[10px]"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
