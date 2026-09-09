import React, { useState, useEffect } from 'react';
import { Sliders, Eye, EyeOff, ArrowUp, ArrowDown, Edit3, Save, CheckCircle } from 'lucide-react';
import { HomepageSection } from '../../types';
import { storeService } from '../../services/storeService';
import { ImageUploader } from '../../components/ui/ImageUploader';

export const AdminHomepage: React.FC = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSections = () => {
    setLoading(true);
    try {
      setSections(storeService.getHomepageSections());
    } catch (e) {
      console.error('Failed to load homepage sections:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();

    const unsubscribe = storeService.subscribe((event) => {
      if (event.type === 'homepage') {
        setSections(storeService.getHomepageSections());
      }
    });
    return unsubscribe;
  }, []);

  const moveSection = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIdx, 0, moved);

    const reordered = newSections.map((sec, idx) => ({ ...sec, display_order: idx + 1 }));
    setSections(reordered);

    try {
      await storeService.reorderHomepageSections(reordered);
      showNotification();
    } catch (e) {
      console.error('Reorder error:', e);
    }
  };

  const toggleVisibility = async (sec: HomepageSection) => {
    const updated = { ...sec, is_visible: !sec.is_visible };
    try {
      await storeService.saveHomepageSection(updated);
      setSections(prev => prev.map(s => s.id === sec.id ? updated : s));
      showNotification();
    } catch (e) {
      console.error('Visibility toggle error:', e);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;
    try {
      await storeService.saveHomepageSection(editingSection);
      setSections(prev => prev.map(s => s.id === editingSection.id ? editingSection : s));
      setEditingSection(null);
      showNotification();
    } catch (e) {
      console.error('Edit error:', e);
    }
  };

  const showNotification = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
        <div>
          <div className="flex items-center space-x-2 text-luxury-gold text-xs uppercase tracking-luxury font-medium mb-1">
            <Sliders className="w-4 h-4" />
            <span>VISUAL PAGE BUILDER</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-white uppercase tracking-wider font-light">
            Homepage Section Manager
          </h1>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Reorder, hide, show, or edit titles and imagery for all homepage editorial chapters without modifying code.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-950/80 border border-green-700 text-green-400 rounded text-xs">
            <CheckCircle className="w-4 h-4" />
            <span>Changes Synced Live</span>
          </div>
        )}
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded bg-neutral-950 border border-neutral-800 flex items-center justify-center font-mono text-xs text-luxury-gold font-bold">
                {idx + 1}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif text-base text-white uppercase tracking-wider font-medium">
                    {sec.title || sec.section_type}
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 rounded text-[9px] uppercase font-mono text-neutral-400">
                    Type: {sec.section_type}
                  </span>
                </div>
                {sec.subtitle && (
                  <p className="text-xs text-neutral-400 font-light mt-0.5">{sec.subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-center">
              {/* Move buttons */}
              <button
                disabled={idx === 0}
                onClick={() => moveSection(idx, 'up')}
                className="p-2 bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 rounded"
                title="Move Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={idx === sections.length - 1}
                onClick={() => moveSection(idx, 'down')}
                className="p-2 bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 rounded"
                title="Move Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              {/* Toggle visibility */}
              <button
                onClick={() => toggleVisibility(sec)}
                className={`p-2 border rounded transition-colors ${
                  sec.is_visible
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-luxury-gold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-600'
                }`}
                title={sec.is_visible ? 'Hide section' : 'Show section'}
              >
                {sec.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              {/* Edit Content */}
              <button
                onClick={() => setEditingSection(sec)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs uppercase tracking-wider"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT SECTION MODAL */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-lg w-full p-6 space-y-4 text-xs text-neutral-200">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <h3 className="font-serif text-lg uppercase tracking-wider text-white">
                Edit Section: {editingSection.section_type}
              </h3>
              <button onClick={() => setEditingSection(null)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-neutral-400 mb-1 uppercase text-[10px]">Headline Title</label>
                <input
                  type="text"
                  value={editingSection.title}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 p-2 rounded text-white focus:outline-none focus:border-luxury-gold uppercase tracking-wider"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 uppercase text-[10px]">Subtitle / Badge</label>
                <input
                  type="text"
                  value={editingSection.subtitle || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 p-2 rounded text-white focus:outline-none focus:border-luxury-gold uppercase tracking-wider"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 uppercase text-[10px]">Body / Narrative Content</label>
                <textarea
                  rows={3}
                  value={editingSection.content || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 p-2 rounded text-white focus:outline-none focus:border-luxury-gold font-light"
                />
              </div>

              {/* Primary Section Photo with Direct Device Upload */}
              <div className="space-y-2 bg-neutral-950 p-3 rounded border border-neutral-800">
                <span className="text-[10px] uppercase tracking-wider text-luxury-gold font-medium block">
                  Section Feature Photo (Direct Device Upload)
                </span>
                <ImageUploader
                  images={editingSection.image_url ? [editingSection.image_url] : []}
                  onChange={(imgs) => {
                    if (imgs.length > 0) {
                      setEditingSection({ ...editingSection, image_url: imgs[0] });
                    }
                  }}
                  label="Upload 4K Feature Photo from Computer / Phone"
                  helperText="Choose 4K Ultra-HD photo directly from your device (up to 3840px)"
                />
              </div>

              {/* Secondary Image (for split section) */}
              {editingSection.secondary_image_url !== undefined && (
                <div className="space-y-2 bg-neutral-950 p-3 rounded border border-neutral-800">
                  <span className="text-[10px] uppercase tracking-wider text-luxury-gold font-medium block">
                    Secondary Photo (Asymmetrical Split)
                  </span>
                  <ImageUploader
                    images={editingSection.secondary_image_url ? [editingSection.secondary_image_url] : []}
                    onChange={(imgs) => {
                      if (imgs.length > 0) {
                        setEditingSection({ ...editingSection, secondary_image_url: imgs[0] });
                      }
                    }}
                    label="Upload 4K Secondary Photo"
                    helperText="Select 4K Ultra-HD secondary photo from device (up to 3840px)"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 border border-neutral-700 text-neutral-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-luxury-gold text-black rounded font-semibold hover:bg-luxury-goldLight"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
