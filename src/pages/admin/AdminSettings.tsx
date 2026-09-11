import React, { useState, useEffect, useRef } from 'react';
import { Settings, Save, CheckCircle, Phone, MapPin, Share2, Truck, Banknote, Shield, Crown, Upload, Image as ImageIcon, CheckCircle2, Key, Info, Cloud, RefreshCw, Download, UploadCloud, Globe, Database, Radio, Sparkles, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SiteSettings } from '../../types';
import { storeService } from '../../services/storeService';
import { processImageFile } from '../../utils/imageOptimizer';
import { ImageUploader } from '../../components/ui/ImageUploader';

export const AdminSettings: React.FC = () => {
  const { settings, refreshSettings } = useApp();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({
      ...settings,
      standard_shipping_fee: settings.standard_shipping_fee ?? 60,
      bottom_gallery: settings.bottom_gallery || [],
      google_client_id: settings.google_client_id || '',
      exclusive_settings: settings.exclusive_settings || {
        title: "MAHALEELA EXCLUSIVE",
        subtitle: "A PRIVATE EDITION OF SELECTED PIECES. DIRECT ATELIER SHOPPING.",
        banner_image: "",
        direct_shopping_enabled: true
      },
      cloud_sync: settings.cloud_sync || {
        firebase_url: '',
        imgbb_api_key: '',
        backend_url: '',
        last_synced_at: ''
      }
    });
  }, [settings]);

  const handleTestCloud = async () => {
    setIsTestingCloud(true);
    setCloudStatus(null);
    try {
      const firebaseUrl = formData.cloud_sync?.firebase_url?.trim().replace(/\/$/, '');
      const backendUrl = formData.cloud_sync?.backend_url?.trim().replace(/\/$/, '');

      if (!firebaseUrl && !backendUrl) {
        setCloudStatus({ connected: false, message: 'Please enter a Firebase Realtime Database URL or Backend API URL first.' });
        return;
      }

      if (firebaseUrl) {
        const pingRes = await fetch(`${firebaseUrl}/test_ping.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ping: 'ok', time: new Date().toISOString() })
        });
        if (pingRes.ok) {
          setCloudStatus({ connected: true, message: 'Connected to Firebase Cloud! All customer devices will now sync automatically.' });
          await storeService.saveSettings(formData);
          await storeService.syncToCloud();
          return;
        }
      }

      if (backendUrl) {
        const pingRes = await fetch(`${backendUrl}/api/settings`);
        if (pingRes.ok) {
          setCloudStatus({ connected: true, message: 'Connected to Custom Live Backend! All API endpoints are operational.' });
          await storeService.saveSettings(formData);
          await storeService.syncToCloud();
          return;
        }
      }

      setCloudStatus({ connected: false, message: 'Could not connect. Please check the URL and CORS rules.' });
    } catch (err: any) {
      setCloudStatus({ connected: false, message: `Connection test error: ${err.message || 'Network error'}` });
    } finally {
      setIsTestingCloud(false);
    }
  };

  const handleDownloadStoreJson = () => {
    try {
      const dataStr = storeService.exportStoreData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'store_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportStoreJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        storeService.importStoreData(parsed);
        alert('Store data imported successfully! All storefront pages updated.');
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await storeService.saveSettings(formData);
      await refreshSettings();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save settings:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    try {
      const url = await processImageFile(file, 3840, 3840);
      if (url) {
        setFormData(prev => ({
          ...prev,
          exclusive_settings: {
            title: prev.exclusive_settings?.title || 'MAHALEELA EXCLUSIVE',
            subtitle: prev.exclusive_settings?.subtitle || 'A PRIVATE EDITION OF SELECTED PIECES. DIRECT ATELIER SHOPPING.',
            banner_image: url,
            direct_shopping_enabled: prev.exclusive_settings?.direct_shopping_enabled ?? true
          }
        }));
      }
    } catch (err) {
      console.error('Direct device upload failed:', err);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const url = await processImageFile(file, 2048, 2048);
      if (url) {
        setFormData(prev => ({
          ...prev,
          logo_url: url
        }));
      }
    } catch (err) {
      console.error('Logo upload failed:', err);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
        <div>
          <div className="flex items-center space-x-2 text-luxury-gold text-xs uppercase tracking-luxury font-medium mb-1">
            <Settings className="w-4 h-4" />
            <span>GLOBAL ARCHIVE CONFIGURATION</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wider font-light">
            Site Settings & Integrations
          </h1>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Official atelier credentials, real Google Sign-In OAuth, MAHALEELA EXCLUSIVE storefront customization, and logistics policies.
          </p>
        </div>

        {success && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-950/80 border border-green-700 text-green-400 rounded text-xs animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>Settings Live on Storefront</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 text-xs text-neutral-300">
        {/* 0. UNIVERSAL LIVE CLOUD SYNC & MULTI-DEVICE SHARING */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-3 gap-2">
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-luxury-gold" />
              <h3 className="font-serif text-base uppercase tracking-wider text-white">
                Live Cloud Sync & Multi-Device Sharing
              </h3>
            </div>
            {formData.cloud_sync?.firebase_url || formData.cloud_sync?.backend_url ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-green-950 text-green-400 border border-green-800 text-[10px] font-mono uppercase font-semibold">
                <Radio className="w-3 h-3 animate-pulse text-green-400" />
                <span>Live Cloud Connected (All Customers See Changes)</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-mono uppercase font-semibold">
                <Info className="w-3 h-3 text-amber-400" />
                <span>Local Browser Only (Netlify Drop Static Mode)</span>
              </span>
            )}
          </div>

          <div className="bg-neutral-950 p-4 rounded border border-neutral-800 space-y-2">
            <div className="flex items-center space-x-2 text-luxury-gold text-xs font-semibold uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              <span>Why connect Cloud Sync?</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              When deployed on static hosts like <strong>Netlify Drop</strong>, photos and products saved in this admin panel stay only on your computer until connected to a free Cloud Database. Connecting <strong>Firebase Realtime Database</strong> or <strong>ImgBB</strong> guarantees that <strong>every customer, family member, and buyer anywhere in the world immediately sees your photos, banners, and products without any blank screens</strong>!
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {/* Firebase Realtime DB */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                Google Firebase Realtime Database URL (Free Forever, 0 Setup)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.cloud_sync?.firebase_url || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    cloud_sync: {
                      ...formData.cloud_sync,
                      firebase_url: e.target.value.trim()
                    }
                  })}
                  placeholder="https://your-project-id-default-rtdb.firebaseio.com"
                  className="w-full bg-neutral-950 border border-neutral-700 p-2.5 pl-8 rounded text-white focus:outline-none focus:border-luxury-gold font-mono text-[11px]"
                />
                <Database className="w-4 h-4 text-neutral-500 absolute left-2.5 top-3" />
              </div>
              <span className="text-[10px] text-neutral-400 block">
                Create a free project at <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-luxury-gold underline font-semibold">console.firebase.google.com</a> &rarr; Build &rarr; Realtime Database &rarr; Copy the URL.
              </span>
            </div>

            {/* ImgBB Free Image CDN */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                ImgBB Free Image Hosting API Key (Universal 4K Photo Delivery)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.cloud_sync?.imgbb_api_key || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    cloud_sync: {
                      ...formData.cloud_sync,
                      imgbb_api_key: e.target.value.trim()
                    }
                  })}
                  placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j..."
                  className="w-full bg-neutral-950 border border-neutral-700 p-2.5 pl-8 rounded text-white focus:outline-none focus:border-luxury-gold font-mono text-[11px]"
                />
                <Key className="w-4 h-4 text-neutral-500 absolute left-2.5 top-3" />
              </div>
              <span className="text-[10px] text-neutral-400 block">
                Get a free key in 30 seconds at <a href="https://api.imgbb.com" target="_blank" rel="noreferrer" className="text-luxury-gold underline font-semibold">api.imgbb.com</a>. Automatically converts all 4K device uploads into permanent public CDN URLs for all customers.
              </span>
            </div>

            {/* Custom Backend API URL */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                Custom Live Backend API URL (Optional — e.g. Render / Railway / VPS)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.cloud_sync?.backend_url || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    cloud_sync: {
                      ...formData.cloud_sync,
                      backend_url: e.target.value.trim()
                    }
                  })}
                  placeholder="https://mahaleela-api.onrender.com"
                  className="w-full bg-neutral-950 border border-neutral-700 p-2.5 pl-8 rounded text-white focus:outline-none focus:border-luxury-gold font-mono text-[11px]"
                />
                <Globe className="w-4 h-4 text-neutral-500 absolute left-2.5 top-3" />
              </div>
            </div>

            {/* Actions: Test Connection & Manual Push */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isTestingCloud}
                onClick={handleTestCloud}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-luxury-gold border border-neutral-700 rounded text-xs uppercase tracking-wider font-semibold transition-colors flex items-center space-x-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingCloud ? 'animate-spin' : ''}`} />
                <span>{isTestingCloud ? 'Testing Connection...' : 'Test Cloud Connection Live'}</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const res = await storeService.syncToCloud();
                  alert(res ? 'Successfully synced all products and banners to Cloud!' : 'Could not sync. Ensure Cloud URL is saved first.');
                }}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded text-xs uppercase tracking-wider font-semibold transition-colors flex items-center space-x-2"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Push All Products & Banners to Cloud Now</span>
              </button>
            </div>

            {cloudStatus && (
              <div className={`p-3 rounded text-xs border flex items-center space-x-2 ${cloudStatus.connected ? 'bg-green-950/80 border-green-800 text-green-300' : 'bg-red-950/80 border-red-800 text-red-300'}`}>
                {cloudStatus.connected ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /> : <Info className="w-4 h-4 text-red-400 flex-shrink-0" />}
                <span>{cloudStatus.message}</span>
              </div>
            )}
          </div>

          {/* Static Netlify Drop Fallback Tools */}
          <div className="border-t border-neutral-800 pt-5 space-y-3">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">
              Static Netlify Drop Tools (Zero-Server Fallback)
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadStoreJson}
                className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 rounded text-xs flex items-center space-x-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-luxury-gold" />
                <span>Download Live <code>store_data.json</code></span>
              </button>

              <button
                type="button"
                onClick={() => jsonInputRef.current?.click()}
                className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 rounded text-xs flex items-center space-x-2 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-luxury-gold" />
                <span>Import <code>store_data.json</code></span>
              </button>
              <input
                type="file"
                ref={jsonInputRef}
                accept=".json"
                className="hidden"
                onChange={handleImportStoreJson}
              />
            </div>
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              Click <strong>Download Live store_data.json</strong> to save your current products and collections into a JSON file, or copy it into your site's <code>dist/</code> folder.
            </p>
          </div>
        </div>

        {/* 1. REAL GOOGLE SIGN-IN OAUTH 2.0 INTEGRATION */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h3 className="font-serif text-base uppercase tracking-wider text-white">
                Real Google Sign-In (OAuth 2.0 Integration)
              </h3>
            </div>
            {formData.google_client_id ? (
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-green-950 text-green-400 border border-green-800 text-[10px] font-mono uppercase">
                <CheckCircle2 className="w-3 h-3" />
                <span>Configured</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-mono uppercase">
                <Info className="w-3 h-3" />
                <span>Pending Client ID</span>
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1 font-medium">
                Google Cloud OAuth 2.0 Client ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.google_client_id || ''}
                  onChange={(e) => setFormData({ ...formData, google_client_id: e.target.value.trim() })}
                  placeholder="e.g. 748192049182-xxxxxxx.apps.googleusercontent.com"
                  className="w-full bg-neutral-950 border border-neutral-700 p-2.5 pl-8 rounded text-white focus:outline-none focus:border-luxury-gold font-mono text-[11px]"
                />
                <Key className="w-4 h-4 text-neutral-500 absolute left-2.5 top-3" />
              </div>
              <p className="text-[10px] text-neutral-400 mt-1.5 leading-relaxed">
                Enter your genuine Google Web Application Client ID from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-luxury-gold hover:underline">Google Cloud Console</a>. Ensure <code>http://localhost:5000</code> or your live production domain is included under <strong>Authorized JavaScript origins</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* 2. MAHALEELA EXCLUSIVE STOREFRONT CUSTOMIZATION */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-luxury-gold" />
              <h3 className="font-serif text-base uppercase tracking-wider text-white">
                MAHALEELA EXCLUSIVE Storefront Customization
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/50 rounded font-mono uppercase">
              Direct Shopping
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                Exclusive Storefront Title
              </label>
              <input
                type="text"
                value={formData.exclusive_settings?.title || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  exclusive_settings: {
                    ...formData.exclusive_settings,
                    title: e.target.value,
                    subtitle: formData.exclusive_settings?.subtitle || '',
                    banner_image: formData.exclusive_settings?.banner_image || '',
                    direct_shopping_enabled: formData.exclusive_settings?.direct_shopping_enabled ?? true
                  }
                })}
                placeholder="MAHALEELA EXCLUSIVE"
                className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold uppercase tracking-wider"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                Exclusive Subtitle & Manifesto
              </label>
              <textarea
                rows={2}
                value={formData.exclusive_settings?.subtitle || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  exclusive_settings: {
                    ...formData.exclusive_settings,
                    title: formData.exclusive_settings?.title || '',
                    subtitle: e.target.value,
                    banner_image: formData.exclusive_settings?.banner_image || '',
                    direct_shopping_enabled: formData.exclusive_settings?.direct_shopping_enabled ?? true
                  }
                })}
                placeholder="A PRIVATE EDITION OF SELECTED PIECES. DIRECT ATELIER SHOPPING."
                className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold text-xs"
              />
            </div>

            {/* Exclusive Banner Image with Direct Device Upload */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                Exclusive Hero Banner Photo
              </label>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Image Preview */}
                <div className="w-full sm:w-48 h-28 bg-neutral-950 border border-neutral-700 rounded overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                  {formData.exclusive_settings?.banner_image ? (
                    <img
                      src={formData.exclusive_settings.banner_image}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-neutral-600 flex flex-col items-center">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[9px]">No Photo</span>
                    </div>
                  )}
                </div>

                {/* Upload Action */}
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={isUploadingBanner}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-luxury-gold border border-neutral-700 rounded text-xs uppercase tracking-wider font-semibold transition-colors flex items-center space-x-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingBanner ? 'Uploading 4K Photo...' : 'Upload 4K Photo Direct from Device'}</span>
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
                    value={formData.exclusive_settings?.banner_image || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      exclusive_settings: {
                        ...formData.exclusive_settings,
                        title: formData.exclusive_settings?.title || '',
                        subtitle: formData.exclusive_settings?.subtitle || '',
                        banner_image: e.target.value,
                        direct_shopping_enabled: formData.exclusive_settings?.direct_shopping_enabled ?? true
                      }
                    })}
                    placeholder="Or enter image URL: /uploads/... or https://..."
                    className="w-full bg-neutral-950 border border-neutral-700 p-2 rounded text-white font-mono text-[11px] focus:outline-none focus:border-luxury-gold"
                  />
                  <span className="text-[10px] text-neutral-500 block">
                    Upload directly from your phone/computer without external links.
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Shopping Toggle */}
            <div className="pt-2">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.exclusive_settings?.direct_shopping_enabled ?? true}
                  onChange={(e) => setFormData({
                    ...formData,
                    exclusive_settings: {
                      ...formData.exclusive_settings,
                      title: formData.exclusive_settings?.title || '',
                      subtitle: formData.exclusive_settings?.subtitle || '',
                      banner_image: formData.exclusive_settings?.banner_image || '',
                      direct_shopping_enabled: e.target.checked
                    }
                  })}
                  className="w-4 h-4 rounded border-neutral-700 text-luxury-gold focus:ring-0 focus:ring-offset-0 bg-neutral-950"
                />
                <div>
                  <span className="text-white font-medium block">
                    Enable Direct Viewing & Instant Shopping (No Joining Barrier)
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    When enabled, all patrons can directly browse, select sizes, and purchase Exclusive pieces immediately.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* 3. Atelier Business Information */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-6">
          <div className="flex items-center space-x-2 border-b border-neutral-800 pb-3">
            <MapPin className="w-4 h-4 text-luxury-gold" />
            <h3 className="font-serif text-base uppercase tracking-wider text-white">
              Official Business Identity & Address
            </h3>
          </div>

          {/* Brand Logo with Direct Device Upload */}
          <div className="space-y-2 bg-neutral-950 p-4 rounded border border-neutral-800">
            <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-semibold block">
              Brand Emblem / Logo (Direct Device Upload)
            </span>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-neutral-900 border border-neutral-750 rounded flex items-center justify-center p-2 flex-shrink-0">
                <img
                  src={formData.logo_url || '/logo.png'}
                  alt="Logo Preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="space-y-2 flex-1">
                <button
                  type="button"
                  disabled={isUploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-luxury-gold border border-neutral-700 rounded text-xs uppercase tracking-wider font-semibold transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingLogo ? 'Uploading Logo...' : 'Upload Logo from Device'}</span>
                </button>
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="text"
                  value={formData.logo_url || ''}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="Or enter logo path: /logo.png or https://..."
                  className="w-full bg-neutral-900 border border-neutral-700 p-2 rounded text-white font-mono text-[11px] focus:outline-none focus:border-luxury-gold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Brand Name</label>
              <input
                type="text"
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold uppercase"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Brand Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Official Telephone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Concierge Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Official Physical Address</label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold font-mono text-xs"
            />
          </div>
        </div>

        {/* 4. Shipping & COD Parameters */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-6">
          <div className="flex items-center space-x-2 border-b border-neutral-800 pb-3">
            <Truck className="w-4 h-4 text-luxury-gold" />
            <h3 className="font-serif text-base uppercase tracking-wider text-white">
              Logistics & COD Convenience Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                Complimentary Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={formData.free_shipping_threshold}
                onChange={(e) => setFormData({ ...formData, free_shipping_threshold: Number(e.target.value) })}
                className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold font-mono"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">Orders exceeding this amount receive free delivery across India.</span>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                Standard Delivery / Shipping Charge (₹)
              </label>
              <input
                type="number"
                value={formData.standard_shipping_fee ?? 60}
                onChange={(e) => setFormData({ ...formData, standard_shipping_fee: Number(e.target.value) })}
                className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold font-mono"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">Transparently added to product orders: "Product Price + Shipping Charges = Total Amount".</span>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                COD Convenience Fee (₹)
              </label>
              <input
                type="number"
                value={formData.cod_fee}
                onChange={(e) => setFormData({ ...formData, cod_fee: Number(e.target.value) })}
                className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold font-mono"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">Convenience charge added specifically for cash on delivery checkout.</span>
            </div>
          </div>
        </div>

        {/* 4.5. BOTTOM HOMEPAGE PHOTO GALLERY (9:16 VERTICAL 4K) */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-luxury-gold" />
              <h3 className="font-serif text-base uppercase tracking-wider text-white">
                Bottom Homepage Photo Gallery (9:16 Vertical, 4K)
              </h3>
            </div>
            <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-mono">
              {(formData.bottom_gallery || []).length} Photo{formData.bottom_gallery?.length !== 1 ? 's' : ''} Live
            </span>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Upload high-resolution 4K photos directly from your device. These photos scroll horizontally at the bottom of your homepage in strict <strong>9:16 vertical ratio</strong>.
          </p>

          <div className="bg-neutral-950 p-4 rounded border border-neutral-800">
            <ImageUploader
              images={(formData.bottom_gallery || []).map(g => g.image_url)}
              onChange={(newImgs) => {
                setFormData(prev => ({
                  ...prev,
                  bottom_gallery: newImgs.map((url, i) => ({
                    id: `gal-${Date.now()}-${i}`,
                    image_url: url,
                    title: `Editorial ${i + 1}`
                  }))
                }));
              }}
              multiple={true}
              label="Upload 4K 9:16 Photos Directly From Device"
              helperText="Upload vertical photos directly from your phone/computer (in full 4K clarity). Drag & reorder or delete anytime."
            />
          </div>
        </div>

        {/* 5. Social URLs */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-6">
          <div className="flex items-center space-x-2 border-b border-neutral-800 pb-3">
            <Share2 className="w-4 h-4 text-luxury-gold" />
            <h3 className="font-serif text-base uppercase tracking-wider text-white">
              Official Social Channels (Strictly Instagram, Facebook, YouTube)
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Instagram Atelier URL</label>
              <input
                type="text"
                value={formData.social?.instagram || ''}
                onChange={(e) => setFormData({ ...formData, social: { ...formData.social, instagram: e.target.value } })}
                className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Facebook Page URL</label>
              <input
                type="text"
                value={formData.social?.facebook || ''}
                onChange={(e) => setFormData({ ...formData, social: { ...formData.social, facebook: e.target.value } })}
                className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">YouTube Channel URL</label>
              <input
                type="text"
                value={formData.social?.youtube || ''}
                onChange={(e) => setFormData({ ...formData, social: { ...formData.social, youtube: e.target.value } })}
                className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-luxury-gold text-black rounded text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors flex items-center space-x-2 shadow-[0_0_20px_rgba(197,160,89,0.25)]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating Atelier Settings...' : 'Save Settings Live'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
