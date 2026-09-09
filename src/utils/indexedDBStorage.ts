/**
 * High-Capacity IndexedDB Storage for 4K Ultra-HD Media & Offline Resilience
 * Allows storing gigabytes of 4K photos (3840x2160) without browser localStorage 5MB quota errors.
 */

const DB_NAME = 'MahaleelaStoreDB';
const DB_VERSION = 2;
const STORES = {
  MEDIA: 'media_4k',
  BACKUP: 'store_backup'
};

class IndexedDBManager {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return Promise.reject(new Error('IndexedDB not supported in this environment'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORES.MEDIA)) {
          db.createObjectStore(STORES.MEDIA, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.BACKUP)) {
          db.createObjectStore(STORES.BACKUP, { keyPath: 'key' });
        }
      };

      request.onsuccess = (e) => {
        resolve((e.target as IDBOpenDBRequest).result);
      };

      request.onerror = (e) => {
        console.warn('IndexedDB failed to open:', e);
        reject((e.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  // Store high-resolution 4K image
  public async set4KImage(id: string, dataUrl: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.MEDIA, 'readwrite');
        const store = tx.objectStore(STORES.MEDIA);
        store.put({ id, dataUrl, updatedAt: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Failed to save 4K image to IndexedDB:', err);
    }
  }

  // Retrieve high-resolution 4K image
  public async get4KImage(id: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.MEDIA, 'readonly');
        const store = tx.objectStore(STORES.MEDIA);
        const req = store.get(id);
        req.onsuccess = () => {
          resolve(req.result ? req.result.dataUrl : null);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      return null;
    }
  }

  // Store large backup data
  public async setBackup(key: string, data: any): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.BACKUP, 'readwrite');
        const store = tx.objectStore(STORES.BACKUP);
        store.put({ key, data, updatedAt: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Failed to backup to IndexedDB:', err);
    }
  }

  // Retrieve backup data
  public async getBackup<T>(key: string): Promise<T | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.BACKUP, 'readonly');
        const store = tx.objectStore(STORES.BACKUP);
        const req = store.get(key);
        req.onsuccess = () => {
          resolve(req.result ? (req.result.data as T) : null);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      return null;
    }
  }
}

export const idbManager = new IndexedDBManager();
