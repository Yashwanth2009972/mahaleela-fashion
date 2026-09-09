import React, { useState, useEffect, useRef } from 'react';
import { Crown, CheckCircle2, XCircle, Clock, ShieldCheck, Upload, Image as ImageIcon, Save, CheckCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { Link } from 'react-router-dom';
import { storeService } from '../../services/storeService';
import { processImageFile } from '../../utils/imageOptimizer';

export const AdminExclusive: React.FC = () => {
  const { settings, refreshSettings } = useApp();
  const [exclusiveSettings, setExclusiveSettings] = useState(settings.exclusive_settings || {
    title: "MAHALEELA EXCLUSIVE",
    subtitle: "A PRIVATE EDITION OF SELECTED PIECES. DIRECT ATELIER SHOPPING.",
    banner_image: "",
    direct_shopping_enabled: true
  });
  const [exclusiveProducts, setExclusiveProducts] = useState<Product[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings.exclusive_settings) {
      setExclusiveSettings(settings.exclusive_settings);
    }
  }, [settings]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const prods = storeService.getProducts({ is_exclusive: true });
      setExclusiveProducts(prods);

      try {
        const resApps = await fetch('/api/exclusive/applications');
        if (resApps.ok) setApplications(await resApps.json());
      } catch {}
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const unsubscribe = storeService.subscribe((event) => {
      if (event.type === 'products') {
        setExclusiveProducts(storeService.getProducts({ is_exclusive: true }));
      }
      if (event.type === 'settings') {
        const s = storeService.getSettings();
        if (s.exclusive_settings) setExclusiveSettings(s.exclusive_settings);
      }
    });
    return unsubscribe;
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await storeService.saveSettings({
        exclusive_settings: exclusiveSettings
      });
      await refreshSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    try {
      const url = await processImageFile(file);
      if (url) {
        setExclusiveSettings(prev => ({
          ...prev,
          banner_image: url
        }));
      }
    } catch (err) {
      console.error('Direct device upload failed:', err);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-luxury-gold text-xs uppercase tracking-luxury font-medium mb-1">
            <Crown className="w-4 h-4" />
            <span>PRIVATE ATELIER EDITION</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wider font-light">
            MAHALEELA EXCLUSIVE Settings & Collection
          </h1>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Configure direct viewing, shopping parameters, custom banner uploads from device, and manage exclusive archive editions.
          </p>
        </div>

        <Link
          to="/exclusive"
          target="_blank"
          className="px-4 py-2 bg-luxury-gold/15 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black rounded text-xs uppercase tracking-wider font-semibold transition-colors flex items-center space-x-2 self-start sm:self-auto"
        >
          <span>View Live Exclusive Storefront</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 1. EDITABLE EXCLUSIVE STOREFRONT SETTINGS */}
      <form onSubmit={handleSaveSettings} className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-6 text-xs text-neutral-300">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-luxury-gold" />
            <h2 className="font-serif text-base uppercase tracking-wider text-white">
              Editable Storefront Header & Direct Shopping
            </h2>
          </div>
          {saveSuccess && (
            <div className="flex items-center space-x-1.5 text-green-400 text-xs">
              <CheckCircle className="w-4 h-4" />
              <span>Saved Live</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1 font-medium">
              Exclusive Storefront Title
            </label>
            <input
              type="text"
              value={exclusiveSettings.title}
              onChange={(e) => setExclusiveSettings({ ...exclusiveSettings, title: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold uppercase tracking-wider text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1 font-medium">
              Exclusive Manifesto / Subtitle
            </label>
            <textarea
              rows={2}
              value={exclusiveSettings.subtitle}
              onChange={(e) => setExclusiveSettings({ ...exclusiveSettings, subtitle: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold text-xs"
            />
          </div>

          {/* Banner with Direct Device Upload */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1 font-medium">
              Exclusive Hero Banner Photo
            </label>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-full sm:w-56 h-32 bg-neutral-950 border border-neutral-700 rounded overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                {exclusiveSettings.banner_image ? (
                  <img
                    src={exclusiveSettings.banner_image}
                    alt="Exclusive Banner Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-neutral-600 flex flex-col items-center">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-[9px]">No Photo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={isUploadingBanner}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-luxury-gold border border-neutral-700 rounded text-xs uppercase tracking-wider font-semibold transition-colors flex items-center space-x-2"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingBanner ? 'Uploading 4K Banner...' : 'Upload 4K Banner Direct from Device'}</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleDeviceUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <input
                  type="text"
                  value={exclusiveSettings.banner_image}
                  onChange={(e) => setExclusiveSettings({ ...exclusiveSettings, banner_image: e.target.value })}
                  placeholder="Or enter image URL: /uploads/... or https://..."
                  className="w-full bg-neutral-950 border border-neutral-700 p-2 rounded text-white font-mono text-[11px] focus:outline-none focus:border-luxury-gold"
                />
                <span className="text-[10px] text-neutral-500 block">
                  Click 'Upload 4K Banner Direct from Device' to select a 4K Ultra-HD image directly from your computer or phone (up to 3840px).
                </span>
              </div>
            </div>
          </div>

          {/* Direct Shopping Toggle */}
          <div className="pt-2">
            <label className="flex items-center space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={exclusiveSettings.direct_shopping_enabled ?? true}
                onChange={(e) => setExclusiveSettings({ ...exclusiveSettings, direct_shopping_enabled: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-700 text-luxury-gold focus:ring-0 focus:ring-offset-0 bg-neutral-950"
              />
              <div>
                <span className="text-white font-medium block">
                  Direct Viewing & Shopping Active (No Member Gating)
                </span>
                <span className="text-[10px] text-neutral-400">
                  Allows all customers to view exclusive pieces and click 'Add to Bag' / 'Buy Now' without application barriers.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-luxury-gold text-black rounded text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors flex items-center space-x-2 shadow-[0_0_15px_rgba(197,160,89,0.2)]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating Storefront...' : 'Save Exclusive Settings'}</span>
          </button>
        </div>
      </form>

      {/* 2. CURRENT EXCLUSIVE PIECES CATALOG (9:16 VERTICAL ASPECT RATIO) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between text-xs font-serif uppercase tracking-wider text-white">
          <span>Active Exclusive Pieces ({exclusiveProducts.length})</span>
          <Link to="/admin/products" className="text-luxury-gold hover:underline font-sans text-[11px]">
            Manage All Products
          </Link>
        </div>

        {exclusiveProducts.length === 0 ? (
          <div className="p-12 text-center text-xs uppercase tracking-widest text-neutral-500">
            No products tagged as exclusive yet. Edit products in Admin Products and check "Exclusive Edition".
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
            {exclusiveProducts.map((p) => (
              <div key={p.id} className="bg-neutral-950 border border-neutral-800 p-3 rounded space-y-2">
                <div className="aspect-[9/16] overflow-hidden bg-neutral-900 relative rounded">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/80 border border-luxury-gold/60 text-luxury-gold text-[8px] font-mono uppercase">
                    9:16
                  </div>
                </div>
                <div>
                  <h4 className="font-serif text-white text-xs truncate">{p.name}</h4>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-luxury-gold font-serif">₹{p.price.toLocaleString()}</span>
                    <span className="text-[9px] text-green-400 uppercase font-mono">Published</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. HISTORICAL PATRON APPLICATIONS */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-neutral-800 text-xs font-serif uppercase tracking-wider text-white flex items-center justify-between">
          <span>Patron Inquiries ({applications.length})</span>
          <span className="text-[10px] text-luxury-gold font-mono uppercase">Direct Access Enabled For All</span>
        </div>

        {applications.length === 0 ? (
          <div className="p-8 text-center text-xs uppercase tracking-widest text-neutral-500">
            No inquiry records
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {applications.map((app) => (
              <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-serif text-white font-medium text-sm">{app.name}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] uppercase font-mono bg-green-950 text-green-400 border border-green-800">
                      Direct Access Active
                    </span>
                  </div>
                  <div className="text-neutral-400">{app.email} • {app.phone} • {app.city}</div>
                  <div className="text-[11px] text-luxury-gold font-light">Interest: {app.interest}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
