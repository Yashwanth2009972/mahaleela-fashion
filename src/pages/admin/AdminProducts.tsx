import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Edit2, Trash2, Search, ExternalLink, Filter, Check, X } from 'lucide-react';
import { Product, Category, Collection } from '../../types';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { storeService } from '../../services/storeService';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    category_id: 'cat-1',
    category: 'T-Shirts',
    price: 999,
    mrp: 1499,
    description: '',
    colours: ['Deep Black', 'Warm Ivory'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 25,
    images: [] as string[],
    collections: [] as string[],
    badges: ['NEW'],
    is_signature: false,
    is_exclusive: false,
    status: 'published' as 'published' | 'draft' | 'archived'
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    try {
      setProducts(storeService.getProducts());
      setCategories(storeService.getCategories());
      setCollections(storeService.getCollections());
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();

    const unsubscribe = storeService.subscribe((event) => {
      if (event.type === 'products' || event.type === 'categories') {
        fetchAll();
      }
    });
    return unsubscribe;
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      sku: `ML-${Math.floor(100 + Math.random() * 900)}`,
      category_id: categories[0]?.id || 'cat-1',
      category: categories[0]?.name || 'T-Shirts',
      price: 999,
      mrp: 1499,
      description: 'Crafted from heavyweight organic textiles with refined architectural silhouette.',
      colours: ['Deep Black', 'Warm Ivory'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      stock: 25,
      images: [],
      collections: [],
      badges: ['NEW'],
      is_signature: false,
      is_exclusive: false,
      status: 'published'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      category_id: p.category_id,
      category: p.category,
      price: p.price,
      mrp: p.mrp,
      description: p.description || '',
      colours: p.colours || ['Deep Black'],
      sizes: p.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
      stock: p.stock || 0,
      images: p.images || [],
      collections: p.collections || [],
      badges: p.badges || [],
      is_signature: Boolean(p.is_signature),
      is_exclusive: Boolean(p.is_exclusive),
      status: p.status || 'published'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...(editingProduct ? { id: editingProduct.id } : {}),
        ...formData,
        images: formData.images
      };

      await storeService.saveProduct(payload);
      setIsModalOpen(false);
      fetchAll();
    } catch (e) {
      console.error('Failed to save product:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product from catalog?')) return;
    try {
      await storeService.deleteProduct(id);
      fetchAll();
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const filteredProducts = products.filter(p => {
    if (categoryFilter && p.category_id !== categoryFilter && p.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
        <div>
          <div className="flex items-center space-x-2 text-luxury-gold text-xs uppercase tracking-luxury font-medium mb-1">
            <Package className="w-4 h-4" />
            <span>MENSWEAR CATALOG</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wider font-light">
            Products Archive (9:16 Ratio)
          </h1>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Manage catalog items with direct device photo upload (no links required) and vertical 9:16 aspect ratio.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-luxury-gold text-black rounded text-xs uppercase tracking-luxury font-semibold hover:bg-luxury-goldLight transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search piece name or SKU..."
            className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs rounded text-white focus:outline-none focus:border-luxury-gold"
          />
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-neutral-500" />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-xs text-neutral-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 text-neutral-200 px-3 py-2 rounded text-xs focus:outline-none focus:border-luxury-gold uppercase"
          >
            <option value="">All 11 Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-xs uppercase tracking-widest text-neutral-400">
          Loading catalog items...
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider bg-neutral-950/50">
                  <th className="p-4">Piece (9:16)</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price / MRP</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Collections</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 font-light">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-850/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img src={p.images[0]} alt={p.name} className="w-9 h-16 object-cover rounded bg-neutral-800 flex-shrink-0" />
                        <div>
                          <span className="font-serif text-sm text-white font-medium block">{p.name}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">SKU: {p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-neutral-300">{p.category}</td>
                    <td className="p-4">
                      <div className="font-medium text-white">₹{p.price.toLocaleString()}</div>
                      <div className="text-[10px] text-neutral-500 line-through">₹{p.mrp.toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <span className={`font-mono ${p.stock <= 15 ? 'text-amber-400 font-bold' : 'text-neutral-300'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {p.collections?.map(cid => {
                          const col = collections.find(c => c.id === cid);
                          return col ? (
                            <span key={cid} className="px-1.5 py-0.5 bg-neutral-800 text-luxury-gold text-[9px] rounded font-mono">
                              {col.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-green-950/80 text-green-400 border border-green-800 rounded text-[9px] uppercase font-mono">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        to={`/product/${p.slug}`}
                        target="_blank"
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-luxury-gold hover:text-white rounded inline-block"
                        title="View on Storefront"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-400 rounded"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 text-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h2 className="font-serif text-xl uppercase tracking-wider text-white">
                {editingProduct ? `Edit Piece: ${editingProduct.name}` : 'Add New Atelier Piece'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1 uppercase text-[10px]">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: editingProduct ? formData.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    })}
                    className="w-full bg-neutral-950 border border-neutral-700 p-2 rounded text-white focus:outline-none focus:border-luxury-gold"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 uppercase text-[10px]">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 p-2 rounded text-white focus:outline-none focus:border-luxury-gold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1 uppercase text-[10px]">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      const selCat = categories.find(c => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        category_id: e.target.value,
                        category: selCat?.name || 'T-Shirts'
                      });
                    }}
                    className="w-full bg-neutral-950 border border-neutral-700 p-2 rounded text-white focus:outline-none focus:border-luxury-gold uppercase"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 uppercase text-[10px]">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-700 p-2 rounded text-white focus:outline-none focus:border-luxury-gold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 uppercase text-[10px]">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-700 p-2 rounded text-white focus:outline-none focus:border-luxury-gold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 uppercase text-[10px]">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 p-2 rounded text-white focus:outline-none focus:border-luxury-gold font-light"
                />
              </div>

              {/* DIRECT DEVICE PHOTO UPLOADER (NO URL REQUIRED!) */}
              <div className="bg-neutral-950 p-4 rounded border border-neutral-800">
                <ImageUploader
                  images={formData.images}
                  onChange={(newImgs) => setFormData({ ...formData, images: newImgs })}
                  multiple={true}
                  label="Upload 4K Ultra-HD Product Photos Directly From Device"
                  helperText="Select 4K Ultra-HD photos from your phone or computer (up to 3840px, saved in full clarity). Images display in vertical 9:16 aspect ratio."
                />
              </div>

              {/* Collections Multi-assignment Checkboxes */}
              <div>
                <label className="block text-neutral-400 mb-2 uppercase text-[10px] text-luxury-gold font-semibold">
                  Assigned Collections
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-950 p-3 rounded border border-neutral-800">
                  {collections.map((col) => {
                    const checked = formData.collections.includes(col.id);
                    return (
                      <label key={col.id} className="flex items-center space-x-2 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setFormData(prev => ({
                              ...prev,
                              collections: checked
                                ? prev.collections.filter(cid => cid !== col.id)
                                : [...prev.collections, col.id]
                            }));
                          }}
                          className="accent-luxury-gold"
                        />
                        <span className={checked ? 'text-luxury-gold font-medium' : 'text-neutral-400'}>
                          {col.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_signature}
                    onChange={(e) => setFormData({ ...formData, is_signature: e.target.checked })}
                    className="accent-luxury-gold"
                  />
                  <span>Feature in Homepage Signature Spotlight</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_exclusive}
                    onChange={(e) => setFormData({ ...formData, is_exclusive: e.target.checked })}
                    className="accent-luxury-gold"
                  />
                  <span className="text-luxury-gold">Mark as Exclusive Private Edition</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-700 text-neutral-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-luxury-gold text-black rounded font-semibold hover:bg-luxury-goldLight"
                >
                  {isSaving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
