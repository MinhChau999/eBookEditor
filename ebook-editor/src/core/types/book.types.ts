export interface BookInfo {
  id: string;
  title: string;
  author?: string;
  description?: string;
  coverImage?: string;
  layoutMode: 'fixed' | 'reflow';
  template?: string; // For fixed layout page size
  createdAt: Date;
  updatedAt: Date;
  reflowSettings?: ReflowSettings;
  styles?: string; // Book-specific CSS
}

export interface ReflowSettings {
  fontSize: number;
  lineHeight: number;
  theme: 'light' | 'dark' | 'sepia';
  fontFamily: string;
}

export interface PageData {
  id: string;
  name: string;
  content: string; // HTML content
  styles?: string; // Page-specific CSS
  pageNumber: number;
  type: 'cover' | 'content' | 'toc';
}

export interface BookState {
  books: BookInfo[];
  currentBook: BookInfo | null;
  pages: PageData[];
  currentPageId: string | null;
  isLoading: boolean;
  error: string | null;
}
