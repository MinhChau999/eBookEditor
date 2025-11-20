import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BookInfo, PageData, BookState, ReflowSettings } from '../types/book.types';

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
  setReflowSettings: (settings: Partial<ReflowSettings>) => void;
  syncContent: (sourceMode: 'reflow' | 'fixed', targetMode: 'reflow' | 'fixed') => void;
  importBook: (bookData: any) => void;
}

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      books: [],
      currentBook: null,
      pages: [],
      isLoading: false,
      error: null,

      setReflowSettings: (settings: Partial<ReflowSettings>) => {
        set((state: BookStore) => {
          if (!state.currentBook) return {};
          
          const updatedBook = {
            ...state.currentBook,
            reflowSettings: {
              ...state.currentBook.reflowSettings,
              ...settings
            } as ReflowSettings
          };

          // Update in books array as well
          const updatedBooks = state.books.map(b => 
            b.id === updatedBook.id ? updatedBook : b
          );

          return {
            currentBook: updatedBook,
            books: updatedBooks
          };
        });
      },

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

      syncContent: (sourceMode: 'reflow' | 'fixed', targetMode: 'reflow' | 'fixed') => {
        // Placeholder for advanced content synchronization logic
        // For now, since we share the same 'pages' content, this is implicit.
        // Future: Convert absolute positioning to relative for Reflow, etc.
        console.log(`Syncing content from ${sourceMode} to ${targetMode}`);
      },

      importBook: (bookData: any) => {
          const newBook = {
              id: 'imported-' + Date.now(),
              title: bookData.title,
              author: bookData.author,
              mode: 'reflow', // Default to reflow for imported books usually
              createdAt: new Date(),
              updatedAt: new Date(),
              reflowSettings: {
                  fontSize: 16,
                  lineHeight: 1.5,
                  theme: 'light'
              }
          };
          
          const newPages = bookData.pages.map((p: any, i: number) => ({
              id: 'page-' + Date.now() + '-' + i,
              name: p.name,
              content: p.content,
              styles: p.styles,
              pageNumber: i + 1,
              type: 'content'
          }));

          set({ currentBook: newBook as any, pages: newPages, currentPageId: newPages[0]?.id });
      }
    }),
    {
      name: 'ebook-storage',
      partialize: (state: BookStore): Pick<BookStore, 'books' | 'currentBook'> => ({ 
        books: state.books, 
        currentBook: state.currentBook 
      }), // Persist only books and current selection
    }
  )
);
