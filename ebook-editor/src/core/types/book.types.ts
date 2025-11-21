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
  type: 'cover' | 'chapter' | 'content' | 'toc';
  chapterId?: string; // Group pages by chapter
}

export interface BookState {
  books: BookInfo[];
  currentBook: BookInfo | null;
  pages: PageData[];
  isLoading: boolean;
  error: string | null;
}
