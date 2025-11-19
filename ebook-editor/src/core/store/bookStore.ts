import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BookInfo, PageData, BookState } from '../types/book.types';

interface BookStore extends BookState {
  // Actions
  createBook: (book: Omit<BookInfo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBook: (id: string, updates: Partial<BookInfo>) => void;
  deleteBook: (id: string) => void;
  setCurrentBook: (id: string) => void;
  setPages: (pages: PageData[]) => void;
  addPage: (page: PageData) => void;
  updatePage: (id: string, updates: Partial<PageData>) => void;
  deletePage: (id: string) => void;
}

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      books: [],
      currentBook: null,
      pages: [],
      isLoading: false,
      error: null,

      createBook: (bookData: Omit<BookInfo, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newBook: BookInfo = {
          ...bookData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state: BookStore) => ({
          books: [...state.books, newBook],
          currentBook: newBook,
        }));
      },

      updateBook: (id: string, updates: Partial<BookInfo>) => {
        set((state: BookStore) => {
          const updatedBooks = state.books.map((book) =>
            book.id === id ? { ...book, ...updates, updatedAt: new Date() } : book
          );
          
          // Update current book if it's the one being modified
          const currentBook = state.currentBook?.id === id 
            ? { ...state.currentBook, ...updates, updatedAt: new Date() } 
            : state.currentBook;

          return { books: updatedBooks, currentBook };
        });
      },

      deleteBook: (id: string) => {
        set((state: BookStore) => ({
          books: state.books.filter((book) => book.id !== id),
          currentBook: state.currentBook?.id === id ? null : state.currentBook,
        }));
      },

      setCurrentBook: (id: string) => {
        const book = get().books.find((b) => b.id === id) || null;
        set({ currentBook: book });
      },

      setPages: (pages: PageData[]) => set({ pages }),

      addPage: (page: PageData) => set((state: BookStore) => ({ pages: [...state.pages, page] })),

      updatePage: (id: string, updates: Partial<PageData>) => {
        set((state: BookStore) => ({
          pages: state.pages.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      deletePage: (id: string) => {
        set((state: BookStore) => ({
          pages: state.pages.filter((p) => p.id !== id),
        }));
      },
    }),
    {
      name: 'ebook-storage',
      partialize: (state: BookStore) => ({ books: state.books, currentBook: state.currentBook } as any), // Persist only books and current selection
    }
  )
);
