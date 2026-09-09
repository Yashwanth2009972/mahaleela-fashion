import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const ExclusiveJoin: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-luxury-black text-neutral-100 min-h-screen pt-32 pb-28 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 animate-fade-in">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-luxury-gold/15 border border-luxury-gold text-luxury-gold text-xs tracking-luxury uppercase">
          <Crown className="w-4 h-4" />
          <span>DIRECT ATELIER ACCESS GRANTED</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl tracking-widest uppercase font-light text-white leading-tight">
          WELCOME TO MAHALEELA EXCLUSIVE
        </h1>

        <div className="w-12 h-[1px] bg-luxury-gold mx-auto" />

        <p className="text-sm text-neutral-300 font-light leading-relaxed max-w-lg mx-auto">
          Membership gating has been removed. All patrons now enjoy immediate, direct viewing and purchasing privileges across our entire private atelier collection.
        </p>

        <div className="p-6 bg-neutral-950 border border-luxury-gold/30 rounded-lg text-xs text-neutral-400 space-y-3 text-left">
          <div className="flex items-center space-x-2 text-white font-medium">
            <ShieldCheck className="w-4 h-4 text-luxury-gold" />
            <span>Patron Privilege Clearance Active</span>
          </div>
          <p className="text-neutral-400 font-light leading-relaxed">
            • Immediate checkout on limited-run pieces<br />
            • Direct colour and size availability<br />
            • Complimentary express courier across India
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/exclusive"
            className="w-full sm:w-auto px-8 py-4 bg-luxury-gold text-black text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors shadow-[0_0_25px_rgba(197,160,89,0.3)] flex items-center justify-center space-x-2"
          >
            <span>Enter Exclusive Storefront</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-4 border border-neutral-700 hover:border-luxury-gold text-neutral-300 hover:text-white text-xs uppercase tracking-luxury font-medium transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
