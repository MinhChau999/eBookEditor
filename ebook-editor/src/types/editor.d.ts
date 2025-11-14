export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImage?: string;
  language: string;
  publisher?: string;
  publishedDate?: string;
  isbn?: string;
  metadata: BookMetadata;
  layout: LayoutType;
  chapters: Chapter[];
  pages?: Page[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BookMetadata {
  identifier: string;
  title: string;
  creator: string[];
  contributor?: string[];
  language: string;
  date?: string;
  publisher?: string;
  subject?: string[];
  description?: string;
  type?: string;
  format?: string;
  source?: string;
  relation?: string;
  coverage?: string;
  rights?: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  content: string;
  order: number;
  parentChapterId?: string;
  subChapters: Chapter[];
  wordCount: number;
  readingTimeMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  id: string;
  bookId: string;
  pageNumber: number;
  pageNumberVisible: boolean;
  pageNumberFormat: 'arabic' | 'roman' | 'none';
  name: string;
  templateId?: string;
  masterPageId?: string;
  size: PageSize;
  orientation: 'portrait' | 'landscape' | 'auto';
  spread: 'left' | 'right' | 'center' | 'none';
  background: PageBackground;
  margins: PageMargins;
  elements: PageElement[];
  layers: Layer[];
  guides: PageGuides;
  metadata: PageMetadata;
}

export interface PageSize {
  width: number;
  height: number;
  unit: 'px' | 'in' | 'cm' | 'mm';
  dpi: number;
}

export interface PageBackground {
  type: 'color' | 'image' | 'gradient';
  value: string;
  image?: string;
  opacity: number;
}

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PageElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'table';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  content: {
    text?: string;
    style?: any;
    src?: string;
    alt?: string;
  };
  layer: number;
  locked: boolean;
  visible: boolean;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  elements: string[];
}

export interface PageGuides {
  horizontal: number[];
  vertical: number[];
}

export interface PageMetadata {
  createdAt: string;
  modifiedAt: string;
  version: number;
}

export type LayoutType = 'reflow' | 'fixed';

export interface EditorState {
  currentBook: Book | null;
  currentChapter: Chapter | null;
  currentPage: Page | null;
  isDirty: boolean;
  isLoading: boolean;
}