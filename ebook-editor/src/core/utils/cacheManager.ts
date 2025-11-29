/**
 * Cache Management System for eBook Editor
 * Designed for both client-side optimization and future database integration
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
  version?: string;
}

interface BookPositionCache {
  currentPageId: string | null;
  lastAccessedAt: number;
  scrollPosition?: number;
  zoomLevel?: number;
}

interface EditorStateCache {
  undoHistory?: any[];
  redoHistory?: any[];
  hasUnsavedChanges?: boolean;
  lastSyncAt?: number;
}

interface UserPreferencesCache {
  recentlyOpenedBooks: string[]; // Array of book IDs, most recent first
  favoriteBooks: string[];
  defaultLayoutMode?: 'fixed' | 'reflow';
  autoSaveEnabled?: boolean;
  autoSaveInterval?: number; // in milliseconds
}

class CacheManager {
  private static instance: CacheManager;
  private readonly CACHE_PREFIX = 'ebook_editor_';
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly POSITION_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly MAX_RECENT_BOOKS = 10;

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Generic cache set method with TTL support
   */
  private setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      };

      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to set cache:', error);
      // Handle quota exceeded error
      this.cleanupExpiredCache();
    }
  }

  /**
   * Generic cache get method with expiration check
   */
  private getCache<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);

      // Check if expired
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        this.removeCache(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to get cache:', error);
      this.removeCache(key);
      return null;
    }
  }

  private removeCache(key: string): void {
    localStorage.removeItem(this.CACHE_PREFIX + key);
  }

  /**
   * Book Position Caching
   */
  setBookPosition(bookId: string, position: Partial<BookPositionCache>): void {
    const key = `book_position_${bookId}`;
    const current = this.getBookPosition(bookId);

    const updated: BookPositionCache = {
      ...current,
      ...position,
      lastAccessedAt: Date.now(),
    };

    this.setCache(key, updated, this.POSITION_CACHE_TTL);
  }

  getBookPosition(bookId: string): BookPositionCache {
    const key = `book_position_${bookId}`;
    const cached = this.getCache<BookPositionCache>(key);

    return cached || {
      currentPageId: null,
      lastAccessedAt: Date.now(),
    };
  }

  /**
   * Editor State Caching (for future auto-save features)
   */
  setEditorState(bookId: string, state: Partial<EditorStateCache>): void {
    const key = `editor_state_${bookId}`;
    const current = this.getEditorState(bookId);

    const updated: EditorStateCache = {
      ...current,
      ...state,
      lastSyncAt: Date.now(),
    };

    this.setCache(key, updated, this.DEFAULT_TTL);
  }

  getEditorState(bookId: string): EditorStateCache {
    const key = `editor_state_${bookId}`;
    const cached = this.getCache<EditorStateCache>(key);

    return cached || {};
  }

  /**
   * User Preferences Caching
   */
  setUserPreferences(preferences: Partial<UserPreferencesCache>): void {
    const key = 'user_preferences';
    const current = this.getUserPreferences();

    const updated: UserPreferencesCache = {
      ...current,
      ...preferences,
    };

    this.setCache(key, updated, this.DEFAULT_TTL * 30); // 30 days for preferences
  }

  getUserPreferences(): UserPreferencesCache {
    const key = 'user_preferences';
    const cached = this.getCache<UserPreferencesCache>(key);

    return cached || {
      recentlyOpenedBooks: [],
      favoriteBooks: [],
      autoSaveEnabled: true,
      autoSaveInterval: 30000, // 30 seconds
    };
  }

  /**
   * Recently opened books management
   */
  addToRecentlyOpened(bookId: string): void {
    const preferences = this.getUserPreferences();
    const recentlyOpened = preferences.recentlyOpenedBooks || [];

    // Remove if already exists
    const filtered = recentlyOpened.filter(id => id !== bookId);

    // Add to beginning
    const updated = [bookId, ...filtered].slice(0, this.MAX_RECENT_BOOKS);

    this.setUserPreferences({ recentlyOpenedBooks: updated });
  }

  /**
   * Cache cleanup and maintenance
   */
  cleanupExpiredCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const entry: CacheEntry<any> = JSON.parse(cached);
              if (entry.expiresAt && Date.now() > entry.expiresAt) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { totalEntries: number; totalSize: number; entries: Array<{ key: string; size: number; expired: boolean }> } {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.CACHE_PREFIX));
    let totalSize = 0;
    const entries: any[] = [];

    keys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        const size = value ? new Blob([value]).size : 0;
        totalSize += size;

        let expired = false;
        if (value) {
          const entry: CacheEntry<any> = JSON.parse(value);
          expired = entry.expiresAt ? Date.now() > entry.expiresAt : false;
        }

        entries.push({ key, size, expired });
      } catch (error) {
        console.warn('Error analyzing cache entry:', key, error);
      }
    });

    return { totalEntries: keys.length, totalSize, entries };
  }

  /**
   * Clear all cache (for logout/reset)
   */
  clearAllCache(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.CACHE_PREFIX));
    keys.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Export cache data (for migration/sync)
   */
  exportCache(): Record<string, any> {
    const data: Record<string, any> = {};
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.CACHE_PREFIX));

    keys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          data[key] = JSON.parse(value);
        }
      } catch (error) {
        console.warn('Failed to export cache entry:', key, error);
      }
    });

    return data;
  }

  /**
   * Import cache data (for migration/sync)
   */
  importCache(data: Record<string, any>): void {
    Object.keys(data).forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        try {
          localStorage.setItem(key, JSON.stringify(data[key]));
        } catch (error) {
          console.warn('Failed to import cache entry:', key, error);
        }
      }
    });
  }
}

export default CacheManager;
export type {
  BookPositionCache,
  EditorStateCache,
  UserPreferencesCache
};