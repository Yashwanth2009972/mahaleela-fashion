/**
 * Universal 4K Ultra-HD Image Processor & Device Upload Engine
 * Preserves 4K Ultra-HD resolution (up to 3840px) across all mobile and desktop devices.
 * Works seamlessly on local servers, Netlify Drop, and static hosting environments.
 */

import { idbManager } from './indexedDBStorage';

export async function processImageFile(
  file: File,
  maxWidth = 3840,
  maxHeight = 3840,
  quality = 0.92
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1. Try ImgBB Cloud CDN if key is configured in settings (Universal public HTTPS link for all devices worldwide)
    const tryImgbbUpload = async (): Promise<string | null> => {
      try {
        const savedSettings = localStorage.getItem('ml_store_settings');
        let imgbbKey = '';
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            imgbbKey = parsed.cloud_sync?.imgbb_api_key?.trim() || '';
          } catch {}
        }
        if (imgbbKey) {
          const formData = new FormData();
          formData.append('image', file);
          const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
            method: 'POST',
            body: formData,
          });
          if (res.ok) {
            const json = await res.json();
            if (json.data?.url) {
              return json.data.url;
            }
          }
        }
      } catch (err) {
        console.warn('ImgBB upload attempt error:', err);
      }
      return null;
    };

    // 2. Try Backend Server Upload (if backend server is active or custom backend URL is configured)
    const tryBackendUpload = async (): Promise<string | null> => {
      try {
        const savedSettings = localStorage.getItem('ml_store_settings');
        let backendUrl = '';
        if (savedSettings) {
          try {
            backendUrl = JSON.parse(savedSettings).cloud_sync?.backend_url?.trim().replace(/\/$/, '') || '';
          } catch {}
        }
        const endpoint = backendUrl ? `${backendUrl}/api/upload` : '/api/upload';
        const formData = new FormData();
        formData.append('files', file);
        const res = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const apiData = await res.json();
            if (apiData.url) {
              return backendUrl && apiData.url.startsWith('/') ? `${backendUrl}${apiData.url}` : apiData.url;
            }
          }
        }
      } catch {}
      return null;
    };

    // 2. Client-side 4K Canvas processing (guaranteed to work offline and on Netlify Drop)
    const reader = new FileReader();

    reader.onload = async (readerEvent) => {
      const rawDataUrl = readerEvent.target?.result as string;

      // 1. Check ImgBB Cloud CDN first (gives permanent public HTTPS URL for all devices)
      const imgbbUrl = await tryImgbbUpload();
      if (imgbbUrl) {
        resolve(imgbbUrl);
        return;
      }

      // 2. Check Backend Server upload
      const serverUrl = await tryBackendUpload();
      if (serverUrl) {
        resolve(serverUrl);
        return;
      }

      const img = new Image();
      img.onload = async () => {
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          // Scale only if larger than 4K (3840px), maintaining original aspect ratio
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          // Ultra-HD High-Fidelity Rendering settings
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Determine optimal format: preserve PNG for transparency, otherwise high-grade JPEG
          const isPng = file.type === 'image/png';
          let finalDataUrl = isPng
            ? canvas.toDataURL('image/png')
            : canvas.toDataURL('image/jpeg', quality);

          // Store full 4K asset in IndexedDB for persistent unlimited storage
          const assetId = `img-4k-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          try {
            await idbManager.set4KImage(assetId, finalDataUrl);
          } catch {}

          resolve(finalDataUrl);
        } catch (err) {
          console.warn('4K Canvas optimization fallback:', err);
          resolve(rawDataUrl);
        }
      };

      img.onerror = () => {
        resolve(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
