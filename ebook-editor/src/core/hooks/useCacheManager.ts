import { useCallback } from 'react';
import CacheManager from '../utils/cacheManager';
import { useBookStore } from '../store/bookStore';

export const useCacheManager = () => {
  const cacheManager = CacheManager.getInstance();
  const currentBook = useBookStore(state => state.currentBook);

  // Book position management
  const saveBookPosition = useCallback((bookId: string, position: {
    currentPageId: string | null;
    scrollPosition?: number;
    zoomLevel?: number;
  }) => {
    cacheManager.setBookPosition(bookId, position);
  }, [cacheManager]);

  const getBookPosition = useCallback((bookId: string) => {
    return cacheManager.getBookPosition(bookId);
  }, [cacheManager]);

  // Editor state management (for future auto-save features)
  const saveEditorState = useCallback((bookId: string, state: {
    undoHistory?: any[];
    redoHistory?: any[];
    hasUnsavedChanges?: boolean;
  }) => {
    cacheManager.setEditorState(bookId, state);
  }, [cacheManager]);

  const getEditorState = useCallback((bookId: string) => {
    return cacheManager.getEditorState(bookId);
  }, [cacheManager]);

  // User preferences management
  const getUserPreferences = useCallback(() => {
    return cacheManager.getUserPreferences();
  }, [cacheManager]);

  const saveUserPreferences = useCallback((preferences: {
    recentlyOpenedBooks?: string[];
    favoriteBooks?: string[];
    defaultLayoutMode?: 'fixed' | 'reflow';
    autoSaveEnabled?: boolean;
    autoSaveInterval?: number;
  }) => {
    cacheManager.setUserPreferences(preferences);
  }, [cacheManager]);

  // Recently opened books
  const addToRecentlyOpened = useCallback((bookId: string) => {
    cacheManager.addToRecentlyOpened(bookId);
  }, [cacheManager]);

  const getRecentlyOpenedBooks = useCallback(() => {
    const preferences = cacheManager.getUserPreferences();
    return preferences.recentlyOpenedBooks || [];
  }, [cacheManager]);

  // Current book position shortcut
  const saveCurrentBookPosition = useCallback((currentPageId: string | null, options?: {
    scrollPosition?: number;
    zoomLevel?: number;
  }) => {
    if (currentBook) {
      saveBookPosition(currentBook.id, {
        currentPageId,
        scrollPosition: options?.scrollPosition,
        zoomLevel: options?.zoomLevel,
      });
    }
  }, [currentBook, saveBookPosition]);

  const getCurrentBookPosition = useCallback(() => {
    if (currentBook) {
      return getBookPosition(currentBook.id);
    }
    return {
      currentPageId: null,
      lastAccessedAt: Date.now(),
    };
  }, [currentBook, getBookPosition]);

  // Cache utilities
  const clearAllCache = useCallback(() => {
    cacheManager.clearAllCache();
  }, [cacheManager]);

  const getCacheStats = useCallback(() => {
    return cacheManager.getCacheStats();
  }, [cacheManager]);

  const exportCache = useCallback(() => {
    return cacheManager.exportCache();
  }, [cacheManager]);

  const importCache = useCallback((data: Record<string, any>) => {
    cacheManager.importCache(data);
  }, [cacheManager]);

  return {
    // Position management
    saveBookPosition,
    getBookPosition,
    saveCurrentBookPosition,
    getCurrentBookPosition,

    // Editor state
    saveEditorState,
    getEditorState,

    // User preferences
    getUserPreferences,
    saveUserPreferences,

    // Recently opened
    addToRecentlyOpened,
    getRecentlyOpenedBooks,

    // Utilities
    clearAllCache,
    getCacheStats,
    exportCache,
    importCache,

    // Direct access to cache manager
    cacheManager,
  };
};

export default useCacheManager;