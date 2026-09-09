import React, { useState, useEffect } from 'react';
import { Image, Plus, Trash2, Edit2, CheckCircle, Eye, ExternalLink, X, Monitor, Smartphone } from 'lucide-react';
import { Banner } from '../../types';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { storeService } from '../../services/storeService';

export const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: 'SUMMER EDITORIAL DROPS',
    subtitle: 'COMPLIMENTARY EXPRESS DELIVERY OVER ₹2,000',
    desktop_image: '',
    mobile_image: '',
    cta_text: 'DISCOVER NOW',
    cta_url: '/collections',
    position: 'homepage_hero_top',
    is_active: true
  });

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);

  const fetchBanners = () => {
    setLoading(true);
    try {
      setBanners(storeService.getBanners());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();

    const unsubscribe = storeService.subscribe((event) => {
      if (event.type === 'banners') {
        setBanners(storeService.getBanners());
      }
    });
    return unsubscribe;
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: 'SUMMER EDITORIAL DROPS',
      subtitle: 'COMPLIMENTARY EXPRESS DELIVERY OVER ₹2,000',
      desktop_image: '',
      mobile_image: '',
      cta_text: 'EXPLORE COLLECTION',
      cta_url: '/collections',
      position: 'homepage_hero_top',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setFormData({
      title: b.title,
      subtitle: b.subtitle || '',
      desktop_image: b.desktop_image,
      mobile_image: b.mobile_image || b.desktop_image,
      cta_text: b.cta_text || 'DISCOVER',
      cta_url: b.cta_url || '/collections',
      position: b.position || 'homepage_hero_top',
      is_active: b.is_active
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await storeService.saveBanner({
        ...(editingBanner ? { id: editingBanner.id } : {}),
        ...formData
      });
      setIsModalOpen(false);
      fetchBanners();
    } catch (e) {
      console.error('Failed to save banner:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await storeService.deleteBanner(id);
      fetchBanners();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
        <div>
          <div className="flex items-center space-x-2 text-luxury-gold text-xs uppercase tracking-luxury font-medium mb-1">
            <Image className="w-4 h-4" />
            <span>EDITORIAL BANNERS & ACCENTS</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wider font-light">
            Homepage & Campaign Banners
          </h1>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Create custom horizontal banners with direct device photo upload and live homepage reference preview.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-luxury-gold text-black rounded text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Custom Banner</span>
        </button>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="text-center py-20 text-xs uppercase tracking-widest text-neutral-400">
          Loading campaign banners...
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 bg-neutral-900 border border-neutral-800 rounded-lg p-8">
          <p className="font-serif text-lg text-neutral-300 uppercase mb-2">No custom banners yet</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-6 py-2 bg-luxury-gold text-black text-xs uppercase tracking-wider font-semibold"
          >
            Create Your First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col justify-between hover:border-luxury-gold/50 transition-all">
              <div>
                {/* Horizontal Banner Display */}
                <div className="aspect-[16/9] overflow-hidden bg-neutral-800 relative group">
                  <img src={b.desktop_image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-green-950/80 text-green-400 border border-green-800 rounded text-[10px] font-mono uppercase font-semibold">
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[9px] uppercase tracking-widest text-luxury-gold block mb-1">
                      {b.subtitle}
                    </span>
                    <h3 className="font-serif text-xl uppercase text-white font-light">
                      {b.title}
                    </h3>
                  </div>
                </div>

                <div className="p-5 space-y-2 text-xs">
                  <div className="text-[11px] text-luxury-gold font-mono">
                    CTA Action: {b.cta_text} &rarr; {b.cta_url}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    Placement Position: {b.position || 'homepage_hero_top'}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-neutral-800 flex justify-end space-x-2 pt-3">
                <button
                  onClick={() => openEditModal(b)}
                  className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded"
                  title="Edit Banner"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-1.5 bg-neutral-800 hover:bg-red-900 text-neutral-400 hover:text-white rounded"
                  title="Delete Banner"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD / EDIT BANNER WITH LIVE HOMEPAGE REFERENCE PREVIEW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-5xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 text-neutral-200 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block">
                  Campaign Studio
                </span>
                <h2 className="font-serif text-2xl uppercase tracking-wider text-white">
                  {editingBanner ? 'Edit Banner' : 'Add Custom Banner with Live Homepage Reference'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Split Screen Layout: Form on Left, Live Homepage Reference on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Controls (5 cols) */}
              <form onSubmit={handleSave} className="lg:col-span-6 space-y-5 text-xs">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                    Banner Title / Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold uppercase tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                    Subtitle / Top Announcement *
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold uppercase tracking-wider"
                  />
                </div>

                {/* Direct Device Photo Upload (NO URL REQUIRED!) */}
                <div className="space-y-2 bg-neutral-950 p-4 rounded border border-neutral-800">
                  <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-semibold block">
                    Upload 4K Ultra-HD Banner Directly from Device
                  </span>
                  <ImageUploader
                    images={formData.desktop_image ? [formData.desktop_image] : []}
                    onChange={(imgs) => {
                      if (imgs.length > 0) {
                        setFormData({
                          ...formData,
                          desktop_image: imgs[0],
                          mobile_image: imgs[0]
                        });
                      }
                    }}
                    label="4K Ultra-HD Horizontal Banner (16:9 or Wide, up to 3840px)"
                    helperText="Select high-resolution 4K banner photo directly from your computer or phone"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                      Button CTA Text
                    </label>
                    <input
                      type="text"
                      value={formData.cta_text}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                      Target Link / URL
                    </label>
                    <input
                      type="text"
                      value={formData.cta_url}
                      onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                    Placement Position
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold uppercase"
                  >
                    <option value="homepage_hero_top">Homepage Hero Top</option>
                    <option value="top_announcement">Top Announcement Strip</option>
                    <option value="collections_header">Collections Department Header</option>
                    <option value="sale_header">The Sale Edit Header</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-neutral-700 text-neutral-300 rounded text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-luxury-gold text-black rounded text-xs uppercase tracking-wider font-semibold hover:bg-luxury-goldLight"
                  >
                    {isSaving ? 'Publishing...' : 'Save & Publish Banner'}
                  </button>
                </div>
              </form>

              {/* LIVE HOMEPAGE REFERENCE PREVIEW (6 cols) */}
              <div className="lg:col-span-6 bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center space-x-2 text-luxury-gold text-xs uppercase tracking-luxury font-medium">
                    <Eye className="w-4 h-4" />
                    <span>Live Homepage Reference Preview</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-luxury-gold text-black' : 'text-neutral-400'}`}
                      title="Desktop View"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-luxury-gold text-black' : 'text-neutral-400'}`}
                      title="Mobile View"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Simulated Homepage Mockup */}
                <div className="border border-neutral-800 rounded overflow-hidden bg-luxury-black">
                  {/* Mock Homepage Minimal Header */}
                  <div className="bg-black/90 py-2.5 px-4 border-b border-neutral-800 flex items-center justify-between text-[9px] uppercase tracking-widest text-neutral-400">
                    <span>MENU</span>
                    <span className="font-serif text-white font-bold text-[11px] text-luxury-gold">
                      MAHALEELA FASHION
                    </span>
                    <div className="flex space-x-2">
                      <span>BAG</span>
                    </div>
                  </div>

                  {/* Horizontal Banner Realtime Preview */}
                  <div className={`relative overflow-hidden transition-all bg-neutral-900 ${
                    previewDevice === 'mobile' ? 'aspect-[4/3] max-w-[280px] mx-auto my-2 border border-neutral-700' : 'aspect-[16/9] w-full'
                  }`}>
                    {formData.desktop_image ? (
                      <img
                        src={formData.desktop_image}
                        alt="Banner Preview"
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center text-center p-4">
                        <Image className="w-8 h-8 text-neutral-600 mb-2" />
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">No Image Uploaded</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />

                    <div className="absolute inset-0 p-6 flex flex-col justify-end items-center text-center">
                      <span className="text-[8px] tracking-luxury uppercase text-luxury-gold bg-black/60 px-2 py-0.5 mb-2 font-mono">
                        {formData.subtitle || 'ANNOUNCEMENT'}
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl tracking-wider uppercase text-white font-light leading-tight mb-3">
                        {formData.title || 'BANNER HEADLINE'}
                      </h3>
                      <div className="px-4 py-1.5 bg-luxury-gold text-black text-[9px] tracking-luxury uppercase font-bold">
                        {formData.cta_text || 'EXPLORE NOW'}
                      </div>
                    </div>
                  </div>

                  {/* Mock Next Section on Homepage */}
                  <div className="p-4 bg-luxury-cream text-black text-center border-t border-neutral-700">
                    <span className="text-[8px] uppercase tracking-widest text-neutral-500 block">Editorial Intro</span>
                    <span className="font-serif text-xs uppercase font-light text-neutral-800">
                      DESIGNED FOR THE MODERN MAN.
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500 italic text-center">
                  * This interactive preview reflects the live aspect and typography placement on the customer storefront.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
