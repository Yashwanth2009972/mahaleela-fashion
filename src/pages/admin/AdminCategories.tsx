import React, { useState, useEffect } from 'react';
import { FolderTree, Edit2, Save, ExternalLink, Upload, Image as ImageIcon } from 'lucide-react';
import { Category } from '../../types';
import { storeService } from '../../services/storeService';
import { processImageFile } from '../../utils/imageOptimizer';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(() => storeService.getCategories());
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editImg, setEditImg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchCats = () => {
    try {
      setCategories(storeService.getCategories());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCats();

    const unsub = storeService.subscribe((event) => {
      if (event.type === 'categories') {
        fetchCats();
      }
    });
    return unsub;
  }, []);

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditDesc(cat.description || '');
    setEditImg(cat.image || '');
  };

  const handleSave = async (id: string) => {
    try {
      await storeService.saveCategory({ id, description: editDesc, image: editImg });
      setEditingId(null);
      fetchCats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const optimizedUrl = await processImageFile(file);
      if (optimizedUrl) {
        setEditImg(optimizedUrl);
      }
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
        <div className="flex items-center space-x-2 text-luxury-gold text-xs uppercase tracking-luxury font-medium mb-1">
          <FolderTree className="w-4 h-4" />
          <span>STRICT CATEGORY ARCHITECTURE</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wider font-light">
          Menswear Categories (11 Approved)
        </h1>
        <p className="text-xs text-neutral-400 font-light mt-1">
          Strictly locked to approved menswear categories: T-Shirts, Shirts, Hoodies, Sweatshirts, Watches, Sunglasses, Photo Frames, Headcaps, Mugs, Keychains, Wallets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => {
          const isEditing = editingId === cat.id;
          return (
            <div key={cat.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="aspect-[16/9] overflow-hidden rounded bg-neutral-800 mb-3 relative">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center p-4 text-center">
                      <ImageIcon className="w-6 h-6 text-neutral-600 mb-1" />
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{cat.name}</span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 font-mono text-[9px] text-luxury-gold uppercase font-bold">
                    #{idx + 1}
                  </span>
                </div>

                <h3 className="font-serif text-lg text-white uppercase">{cat.name}</h3>
                <span className="text-[10px] text-neutral-500 font-mono">Slug: /{cat.slug}</span>

                {isEditing ? (
                  <div className="space-y-3 mt-3 text-xs">
                    <textarea
                      rows={2}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 p-2 text-white text-xs"
                      placeholder="Category description"
                    />
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1 uppercase tracking-wider">Photo / Cover</label>
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-1.5 cursor-pointer px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-luxury-gold text-[10px] tracking-wider uppercase font-semibold border border-neutral-700 rounded transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploading ? 'Processing 4K...' : 'Upload 4K from Device'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                        </label>
                        {editImg && (
                          <span className="text-[10px] text-green-400 font-mono">Photo ready</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={editImg}
                        onChange={(e) => setEditImg(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 p-2 text-white text-xs font-mono mt-2"
                        placeholder="Or paste Image URL"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 font-light mt-2 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 border border-neutral-700 text-neutral-400 rounded text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave(cat.id)}
                      className="px-4 py-1.5 bg-luxury-gold text-black rounded text-xs font-semibold"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs uppercase tracking-wider"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
