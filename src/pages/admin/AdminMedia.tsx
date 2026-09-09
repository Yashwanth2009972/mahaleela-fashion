import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Check, Copy, Trash2 } from 'lucide-react';
import { ImageUploader } from '../../components/ui/ImageUploader';

export const AdminMedia: React.FC = () => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [mediaList, setMediaList] = useState<Array<{ name: string; url: string }>>(() => {
    try {
      const saved = localStorage.getItem('ml_store_media');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { name: "Official Gold Monogram Logo", url: "/logo.png" }
    ];
  });

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleUploadFromDevice = (newUrls: string[]) => {
    const newlyAdded = newUrls.filter(u => !mediaList.some(m => m.url === u)).map((u, i) => ({
      name: `Atelier Asset ${mediaList.length + i + 1}`,
      url: u
    }));
    const updated = [...newlyAdded, ...mediaList];
    setMediaList(updated);
    try {
      localStorage.setItem('ml_store_media', JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteMedia = (url: string) => {
    const updated = mediaList.filter(m => m.url !== url);
    setMediaList(updated);
    try {
      localStorage.setItem('ml_store_media', JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="space-y-8">
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
        <div className="flex items-center space-x-2 text-luxury-gold text-xs uppercase tracking-luxury font-medium mb-1">
          <ImageIcon className="w-4 h-4" />
          <span>CENTRAL ARCHIVE</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wider font-light">
          Media Assets & Lookbooks
        </h1>
        <p className="text-xs text-neutral-400 font-light mt-1">
          Central asset vault with direct device photo upload for lookbooks, product imagery, and campaign banners.
        </p>
      </div>

      {/* Direct Device Upload Component */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
        <ImageUploader
          images={[]}
          onChange={handleUploadFromDevice}
          multiple={true}
          label="Add New 4K Assets Directly From Computer or Phone"
          helperText="Upload 4K Ultra-HD photos (up to 3840px, JPG, PNG, or WebP) directly into your store's media vault"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {mediaList.map((m, idx) => (
          <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden group flex flex-col justify-between">
            <div className="aspect-square overflow-hidden bg-neutral-950 relative">
              <img src={m.url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="p-3 text-xs space-y-2">
              <span className="font-serif text-white truncate block">{m.name}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(m.url)}
                  className="flex-1 py-1.5 bg-neutral-950 border border-neutral-700 hover:border-luxury-gold text-[10px] uppercase font-mono text-neutral-300 hover:text-luxury-gold rounded flex items-center justify-center space-x-1 transition-colors"
                >
                  {copiedUrl === m.url ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUrl === m.url ? 'Copied' : 'Copy URL'}</span>
                </button>
                {m.url !== '/logo.png' && (
                  <button
                    onClick={() => handleDeleteMedia(m.url)}
                    className="p-1.5 bg-neutral-950 border border-neutral-800 hover:border-red-500 text-neutral-500 hover:text-red-400 rounded transition-colors"
                    title="Delete media"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
