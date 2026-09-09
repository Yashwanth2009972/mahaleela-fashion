import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
  Check,
  X,
  Search,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';
import { Collection, Product } from '../../types';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { storeService } from '../../services/storeService';

export const AdminCollections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    desktop_banner: '',
    mobile_banner: '',
    thumbnail: '',
    is_published: true,
    is_exclusive: false,
    sort_order: 1,
    product_ids: [] as string[]
  });
  const [productSearch, setProductSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchCollections = () => {
    setLoading(true);
    try {
      setCollections(storeService.getCollections());
      setProducts(storeService.getProducts());
    } catch (e) {
      console.error('Failed to load collections:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();

    const unsubscribe = storeService.subscribe((event) => {
      if (event.type === 'collections' || event.type === 'products') {
        fetchCollections();
      }
    });
    return unsubscribe;
  }, []);

  const openCreateModal = () => {
    setEditingCollection(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      desktop_banner: '',
      mobile_banner: '',
      thumbnail: '',
      is_published: true,
      is_exclusive: false,
      sort_order: collections.length + 1,
      product_ids: []
    });
    setIsEditorOpen(true);
  };

  const openEditModal = (col: Collection) => {
    setEditingCollection(col);
    const assignedIds = products.filter(p => p.collections && p.collections.includes(col.id)).map(p => p.id);
    setFormData({
      name: col.name,
      slug: col.slug,
      description: col.description || '',
      desktop_banner: col.desktop_banner || '',
      mobile_banner: col.mobile_banner || col.desktop_banner || '',
      thumbnail: col.thumbnail || col.desktop_banner || '',
      is_published: col.is_published,
      is_exclusive: Boolean(col.is_exclusive),
      sort_order: col.sort_order || 1,
      product_ids: assignedIds
    });
    setIsEditorOpen(true);
  };

  const toggleProductAssignment = (productId: string) => {
    setFormData(prev => {
      const isAssigned = prev.product_ids.includes(productId);
      return {
        ...prev,
        product_ids: isAssigned
          ? prev.product_ids.filter(id => id !== productId)
          : [...prev.product_ids, productId]
      };
    });
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await storeService.saveCollection({
        ...(editingCollection ? { id: editingCollection.id } : {}),
        ...formData,
        thumbnail: formData.desktop_banner || formData.thumbnail,
        mobile_banner: formData.mobile_banner || formData.desktop_banner
      });
      setIsEditorOpen(false);
      fetchCollections();
    } catch (e) {
      console.error('Failed to save collection:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this collection? Products will remain intact.')) return;
    try {
      await storeService.deleteCollection(id);
      fetchCollections();
    } catch (e) {
      console.error('Failed to delete collection:', e);
    }
  };

  const togglePublishStatus = async (col: Collection) => {
    try {
      await storeService.saveCollection({
        ...col,
        is_published: !col.is_published
      });
      fetchCollections();
    } catch (e) {
      console.error('Failed to toggle publish status:', e);
    }
  };

  const filteredModalProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
        <div>
          <div className="flex items-center space-x-2 text-luxury-gold text-xs uppercase tracking-luxury font-medium mb-1">
            <Layers className="w-4 h-4" />
            <span>CORE ARCHIVE MODULE</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wider font-light">
            Collections Management
          </h1>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Create, publish, and reorder seasonal edits with direct device photo upload and many-to-many product linkage.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-luxury-gold text-black rounded text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Collection</span>
        </button>
      </div>

      {/* Collections Cards Grid */}
      {loading ? (
        <div className="text-center py-24 text-xs uppercase tracking-widest text-neutral-400">
          Loading atelier collections...
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-24 bg-neutral-900 border border-neutral-800 rounded-lg p-8">
          <p className="font-serif text-lg text-neutral-300 uppercase mb-2">No Collections Created Yet</p>
          <p className="text-xs text-neutral-500 mb-6 max-w-sm mx-auto">
            Create your first atelier collection with a 9:16 vertical cover photo. Collections organize your apparel into thematic edits.
          </p>
          <button
            onClick={openCreateModal}
            className="px-6 py-2.5 bg-luxury-gold text-black text-xs uppercase tracking-wider font-semibold hover:bg-luxury-goldLight transition-colors"
          >
            + Create Your First Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {collections.map((col) => (
            <div
              key={col.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col justify-between hover:border-luxury-gold/50 transition-all group"
            >
              <div>
                <div className="aspect-[9/16] w-full overflow-hidden bg-neutral-800 relative">
                  {col.thumbnail || col.desktop_banner ? (
                    <img
                      src={col.thumbnail || col.desktop_banner}
                      alt={col.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-950 p-4 text-center">
                      <Layers className="w-8 h-8 text-luxury-gold/40 mb-2" />
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">9:16 Vertical Cover</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => togglePublishStatus(col)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider font-semibold transition-colors ${
                        col.is_published
                          ? 'bg-green-950/80 text-green-400 border border-green-800'
                          : 'bg-neutral-950/80 text-neutral-400 border border-neutral-700'
                      }`}
                      title="Click to toggle publish status"
                    >
                      {col.is_published ? '● Published' : '○ Draft'}
                    </button>
                  </div>
                  {col.is_exclusive && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/80 border border-luxury-gold text-luxury-gold text-[9px] uppercase tracking-wider font-semibold">
                      Private Edition
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase font-mono text-luxury-gold tracking-widest">
                      Order: #{col.sort_order || 1}
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      {col.product_count || 0} product(s)
                    </span>
                  </div>

                  <h3 className="font-serif text-lg uppercase text-white font-medium">
                    {col.name}
                  </h3>

                  <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                    {col.description || 'No description provided.'}
                  </p>

                  <div className="text-[11px] text-neutral-500 font-mono">
                    Slug: /{col.slug}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-neutral-800/80 flex items-center justify-between text-xs mt-4">
                <div className="flex items-center space-x-2 pt-3">
                  <button
                    onClick={() => openEditModal(col)}
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded transition-colors"
                    title="Edit Collection"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    to={`/collection/${col.slug}`}
                    target="_blank"
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-luxury-gold hover:text-white rounded transition-colors"
                    title="View on Storefront"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => handleDeleteCollection(col.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT COLLECTION MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-fade-in text-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] tracking-luxury uppercase text-luxury-gold block">
                  Collection Architecture
                </span>
                <h2 className="font-serif text-xl uppercase tracking-wider text-white">
                  {editingCollection ? `Edit Collection: ${editingCollection.name}` : 'Create New Collection'}
                </h2>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: editingCollection ? formData.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    })}
                    placeholder="e.g. SUMMER EDIT"
                    className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold uppercase tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. summer-edit"
                    className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold lowercase tracking-wider font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                  Editorial Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the aesthetic and mood of this collection..."
                  className="w-full bg-neutral-950 border border-neutral-700 p-2.5 rounded text-white focus:outline-none focus:border-luxury-gold font-light"
                />
              </div>

              {/* DIRECT DEVICE UPLOADER FOR COLLECTION BANNER (NO URL REQUIRED!) */}
              <div className="bg-neutral-950 p-4 rounded border border-neutral-800">
                <ImageUploader
                  images={formData.desktop_banner ? [formData.desktop_banner] : []}
                  onChange={(imgs) => {
                    if (imgs.length > 0) {
                      setFormData({
                        ...formData,
                        desktop_banner: imgs[0],
                        thumbnail: imgs[0]
                      });
                    }
                  }}
                  label="Upload 4K Collection Editorial Photo (9:16 Vertical Ratio)"
                  helperText="Upload 4K Ultra-HD vertical portrait photo (up to 3840px, 9:16 ratio) directly from your device"
                />
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="accent-luxury-gold w-4 h-4"
                  />
                  <span className="text-xs text-neutral-300 uppercase tracking-wider">Publish on Storefront</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_exclusive}
                    onChange={(e) => setFormData({ ...formData, is_exclusive: e.target.checked })}
                    className="accent-luxury-gold w-4 h-4"
                  />
                  <span className="text-xs text-luxury-gold uppercase tracking-wider">Private Exclusive Lounge Only</span>
                </label>
              </div>

              {/* MANY-TO-MANY PRODUCT SELECTOR */}
              <div className="border-t border-neutral-800 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-luxury text-luxury-gold font-medium">
                    Assign Atelier Products ({formData.product_ids.length} Selected)
                  </span>
                  <div className="relative w-48">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Filter pieces..."
                      className="w-full bg-neutral-950 border border-neutral-700 px-2 py-1 text-[11px] rounded text-white focus:outline-none focus:border-luxury-gold"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto bg-neutral-950 border border-neutral-800 rounded p-2 space-y-1 divide-y divide-neutral-850">
                  {filteredModalProducts.map((p) => {
                    const isSelected = formData.product_ids.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProductAssignment(p.id)}
                        className={`p-2 flex items-center justify-between cursor-pointer rounded transition-colors ${
                          isSelected ? 'bg-luxury-gold/15 text-luxury-gold' : 'hover:bg-neutral-900 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                          )}
                          <img src={p.images[0]} alt={p.name} className="w-8 h-12 object-cover rounded bg-neutral-800" />
                          <div>
                            <span className="font-serif text-xs text-white block">{p.name}</span>
                            <span className="text-[10px] text-neutral-500 uppercase font-mono">{p.category} • ₹{p.price}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 border border-neutral-700 text-neutral-300 rounded text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-luxury-gold text-black rounded text-xs uppercase tracking-wider font-semibold hover:bg-luxury-goldLight transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
