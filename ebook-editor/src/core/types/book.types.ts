export interface BookInfo {
  id: string;
  title: string;
  author?: string;
  mode: 'reflow' | 'fixed-layout';
  pageSize?: {
    width: number;
    height: number;
    unit: 'px' | 'mm' | 'in';
  };
  template?: 'A4' | 'A5' | 'Letter' | 'Custom';
  createdAt: Date;
  updatedAt: Date;
  coverImage?: string;
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
