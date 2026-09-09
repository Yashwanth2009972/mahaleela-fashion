import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

import { processImageFile } from '../../utils/imageOptimizer';

interface ImageUploaderProps {
  images: string[];
  onChange: (newImages: string[]) => void;
  multiple?: boolean;
  label?: string;
  helperText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  multiple = false,
  label = "Upload 4K Ultra-HD Photos from Device",
  helperText = "Select 4K Ultra-HD photos directly from your computer or phone (up to 3840px, JPG, PNG, WebP)"
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const fileArray = Array.from(files);
      const processedUrls: string[] = [];

      for (const file of fileArray) {
        try {
          const url = await processImageFile(file);
          if (url) {
            processedUrls.push(url);
          }
        } catch (err) {
          console.error('Failed to process image file:', err);
        }
      }

      if (processedUrls.length > 0) {
        if (multiple) {
          onChange([...images, ...processedUrls]);
        } else {
          onChange(processedUrls.slice(0, 1));
        }
      }
    } catch (e) {
      console.error('Error uploading file:', e);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (idxToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== idxToRemove));
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-luxury-gold bg-luxury-gold/10'
            : 'border-neutral-700 bg-neutral-950/60 hover:border-luxury-gold/70 hover:bg-neutral-900/60'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          {uploading ? (
            <div className="flex items-center space-x-2 text-luxury-gold">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs uppercase tracking-wider">Processing 4K Ultra-HD photo from device...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-luxury-gold">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs text-white font-medium">
                Click to browse device or drag photos here
              </div>
              <p className="text-[10px] text-neutral-500 max-w-xs">
                {helperText}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Thumbnails Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-[9/16] rounded overflow-hidden bg-neutral-900 border border-neutral-800 group"
            >
              <img
                src={img}
                alt={`Upload ${idx + 1}`}
                className="w-full h-full object-cover object-center"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(idx);
                }}
                className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-red-900/90 text-white rounded-full transition-colors"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="absolute bottom-1.5 left-1.5 text-[8px] font-mono bg-black/70 px-1 py-0.5 rounded text-luxury-gold">
                #{idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
