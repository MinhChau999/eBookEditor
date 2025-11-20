# 📋 KẾ HOẠCH PHÁT TRIỂN EBOOK DUAL-MODE SYSTEM
**Reflow + Fixed Layout với Content Management thống nhất**

---

## 🎯 OVERVIEW

Xây dựng hệ thống eBook Editor hỗ trợ 2 chế độ:
- **Reflow Mode**: Nội dung flows continuously (traditional eBook)
- **Fixed Layout Mode**: Fixed page container với content responsive bên trong (magazine, children's books)

**Core Principle**: Same content source, different display modes

**Fixed Layout Innovation**:
- Page container có kích thước cố định (A4, A5, etc.)
- Content bên trong responsive và flexible
- Elements có thể drag-drop positioning bên trong container
- Export EPUB với proper fixed-layout metadata

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### 1. **Data Models**

```typescript
// Book Metadata
interface BookInfo {
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
}

// Page Content
interface PageData {
  id: string;
  name: string;
  content: string; // HTML content
  styles?: string; // CSS riêng cho page
  pageNumber: number;
  type: 'cover' | 'chapter' | 'content' | 'toc';
  chapterId?: string; // Group pages by chapter
}
```

### 2. **Modular Architecture (New Standard)**

We will move away from the monolithic `setup.ts` and adopt a **Feature-Based Architecture**. This separates "Business Logic" (React/Zustand) from "Editor Integration" (GrapesJS Plugins).

```
src/
├── core/                      # Core Application Layer
│   ├── store/                 # Global State (Zustand)
│   │   ├── bookStore.ts
│   │   └── uiStore.ts
│   ├── types/                 # Shared Types
│   └── events/                # Event Bus (if needed)
│
├── features/                  # Business Logic & UI (React)
│   ├── book/                  # Book Management Feature
│   │   ├── components/        # React Components (Settings, CreateModal)
│   │   └── hooks/             # Custom Hooks
│   ├── chapter/               # Chapter Management Feature
│   ├── page/                  # Page/Spread Management Feature
│   └── assets/                # Asset Management Feature
│
├── plugins/                   # GrapesJS Adapters (The "Bridge")
│   ├── core-setup/            # Minimal Editor Config (Panels, Commands)
│   ├── book-adapter/          # Renders Book UI into Editor Panels
│   ├── page-adapter/          # Renders Page UI into Editor Panels
│   └── dual-mode/             # Orchestrates Reflow/Fixed switching
│
└── ui/                        # Shared Design System
    ├── components/            # Generic UI (Button, Input, Modal)
    └── icons/                 # Icon set
```

**Key Changes from Legacy `setup.ts`:**
1.  **Decoupling**: UI is no longer hardcoded HTML strings in a plugin. It's React components rendered into GrapesJS panels.
2.  **State Source**: Truth comes from `bookStore` (Zustand), not local DOM state.
3.  **Adapters**: Plugins act as *adapters* that mount React features into the GrapesJS interface.

---

## 🚀 IMPLEMENTATION PHASES

### **PHASE 1: ARCHITECTURE & MIGRATION** (Week 1)

**Goal**: Replace `setup.ts` with the new modular architecture and establish the Book Foundation.

#### 1.1 Core Infrastructure
- [ ] Setup new folder structure (`core`, `features`, `lib/grapesjs/plugins`)
- [ ] Create `core/store/bookStore.ts` (Zustand)
- [ ] Create `core/types/book.types.ts`

#### 1.2 Refactor `setup.ts` -> `core-setup`
- [ ] Create `lib/grapesjs/plugins/core-setup`
- [ ] Move basic panel/command config from `setup.ts` to `core-setup`
- [ ] **REMOVE** all hardcoded HTML (Structure, Assets, Settings panels)
- [ ] Ensure Editor loads with a clean slate

#### 1.3 Feature: Book Management
- [ ] Create `features/book`
- [ ] Implement `BookSettings` and `CreateBookModal` (React)
- [ ] Create `lib/grapesjs/plugins/book-adapter`
- [ ] **Integration**: Mount `BookSettings` into the "Settings" panel using `ReactDOM.createPortal` or GrapesJS `content` API.

#### 1.4 Feature: Page Management (Fixed Layout Base)
- [ ] Create `features/page`
- [ ] Implement `PageList` and `SpreadView` (React) - porting logic from `setup.ts`
- [ ] Create `lib/grapesjs/plugins/page-adapter`
- [ ] **Integration**: Mount `PageList` into the "Structure" panel.

### **PHASE 2: REFLOW MODE** (Week 2)

#### 2.1 Reflow Mode Implementation
- [ ] Create continuous content flow
- [ ] Implement responsive typography
- [ ] Add chapter navigation
- [ ] Handle images in reflow

**Features:**
- Auto-pagination for reading
- Adjustable font sizes
- Line height control
- Theme support (light/dark)

#### 2.2 Content Editor for Reflow
- [ ] Enhanced text editing
- [ ] Chapter management
- [ ] Image positioning
- [ ] Table support

#### 2.3 Reflow Mode UI
- [ ] Reading progress indicator
- [ ] Chapter sidebar
- [ ] Reading settings panel
- [ ] Print/export for reflow

### **PHASE 3: FIXED LAYOUT MODE** (Week 3)

#### 3.1 Fixed Layout Core
- [ ] Page size management
- [ ] Canvas constraints
- [ ] Page break handling
- [ ] Zoom controls

#### 3.2 Page Templates System
- [ ] Standard page sizes (A4, A5, Letter)
- [ ] Custom page sizes
- [ ] Landscape/Portrait support
- [ ] Template presets

**Templates to implement:**
```typescript
const PAGE_TEMPLATES = {
  A4_PORTRAIT: { width: 210, height: 297, unit: 'mm' },
  A4_LANDSCAPE: { width: 297, height: 210, unit: 'mm' },
  A5_PORTRAIT: { width: 148, height: 210, unit: 'mm' },
  LETTER_PORTRAIT: { width: 216, height: 279, unit: 'mm' },
  IPAD_PORTRAIT: { width: 768, height: 1024, unit: 'px' },
  IPAD_LANDSCAPE: { width: 1024, height: 768, unit: 'px' }
};
```

#### 3.3 Fixed Layout Tools
- [ ] **Responsive Layout System** (NEW!)
  - [ ] CSS Grid integration within fixed container
  - [ ] Flexbox layouts for content elements
  - [ ] Responsive breakpoints within page bounds
  - [ ] Auto-resize components for container constraints
- [ ] Grid system for alignment
- [ ] Element positioning (drag-drop + responsive)
- [ ] Master pages support
- [ ] Layer management

**🆕 Responsive Fixed Layout Architecture:**
```typescript
interface ResponsiveFixedLayout {
  pageContainer: {
    width: number;     // Fixed: 210mm (A4)
    height: number;    // Fixed: 297mm (A4)
    unit: 'mm' | 'px';
  };
  contentArea: {
    padding: number;
    gridSystem: {
      columns: number;
      gap: number;
      responsive: boolean;
    };
    breakpoints: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
  };
}
```

### **PHASE 4: ADVANCED FEATURES** (Week 4)

#### 4.1 Content Synchronization
- [ ] Bidirectional content sync
- [ ] Mode-specific optimizations
- [ ] Conflict resolution
- [ ] Version history

#### 4.2 EPUB Export System

##### 4.2.1 EPUB Fixed Layout Export
- [ ] **META-INF/container.xml** - EPUB container structure
- [ ] **OEBPS/content.opf** - Package declaration với fixed-layout metadata
- [ ] **OEBPS/xhtml/page-*.xhtml** - Individual page files với absolute positioning
- [ ] **OEBPS/css/epub-core.css** - EPUB 3 core styles
- [ ] **OEBPS/css/page-styles.css** - Page-specific styling
- [ ] **OEBPS/nav.xhtml** - HTML5 navigation structure
- [ ] **OEBPS/toc.ncx** - Traditional NCX navigation
- [ ] **Page generation** - Convert fixed-layout pages to XHTML files
- [ ] **Asset management** - Copy and optimize images/media
- [ ] **ZIP packaging** - Create valid EPUB file structure

##### 4.2.2 EPUB Reflow Export
- [ ] Single XHTML files for chapters
- [ ] Relative positioning
- [ ] Flow-friendly CSS
- [ ] Responsive typography

##### 4.2.3 Additional Export Formats
- [ ] PDF export (with page preservation)
- [ ] Web export (HTML bundle)
- [ ] Print optimization

#### 4.3 Import & Migration
- [ ] Import existing eBooks
- [ ] Convert between formats
- [ ] Template library
- [ ] Asset management

### **PHASE 5: POLISH & ADVANCED FEATURES** (Week 5)

#### 5.1 PDF Export System
- [ ] Implement PDF generation using `html2canvas` + `jspdf`
- [ ] Add PDF option to Export Modal
- [ ] Support A4/A5 page sizes for PDF

#### 5.2 Enhanced Import
- [ ] Extract and display images from EPUB
- [ ] Improve style parsing and application
- [ ] Handle relative paths for assets

#### 5.3 UI Polish
- [ ] Add Toast notifications for actions
- [ ] Improve loading states and error handling
- [ ] Add "Preview Mode" toggle

#### 5.4 Testing & Quality
- [ ] Setup Vitest for unit testing
- [ ] Write tests for `bookStore` and `epubParser`

### **PHASE 6: CORE LAYOUT & PAGES REFACTOR** (Week 6)

#### 6.1 Page Management Refactor (React Migration)
- [ ] **Migrate "Structure" Panel**: Replace legacy DOM code with React components (`PageManager`, `PageList`).
- [ ] **Page Thumbnails**: Visual representation of pages in grid view.
- [ ] **Spread View UI**: Better visualization of 2-page spreads in the panel.
- [ ] **Interactivity**: Drag-and-drop reordering (future), context menus.

#### 6.2 Fixed Layout Core Fixes
- [ ] **Strict Page Container**: Inject a `.page-container` div into the canvas that acts as the physical paper.
- [ ] **Centering & Shadow**: Ensure the page container is centered on the gray workspace with a realistic drop shadow.
- [ ] **Content Clipping**: Enforce `overflow: hidden` on the page container to prevent content from floating outside.
- [ ] **Spread View Logic**: Correctly double the container width and render the spine guide.

#### 6.3 Master Pages (UI)
- [ ] **Master Page List**: UI for managing master templates.
- [ ] **Apply Master**: Logic to apply master page background/elements to regular pages.
## 💡 RECOMMENDATIONS

### **Technical Recommendations**

1. **State Management**: Use Zustand for simple, TypeScript-friendly state
2. **Plugin Architecture**: Keep modes as separate GrapesJS plugins
3. **CSS Strategy**: Use CSS-in-JS for mode-specific styles
4. **Performance**: Implement lazy loading for large books

### **UX Recommendations**

1. **Mode Transition**: Smooth animation when switching modes
2. **Content Preservation**: Never lose content when switching modes
3. **Preview Mode**: Real-time preview for both modes
4. **Mobile Support**: Responsive design for tablet editing

### **Development Recommendations**

1. **Start Simple**: Implement reflow mode first (easier)
2. **Incremental**: Add features phase by phase
3. **Testing**: Test with actual eBook content early
4. **Documentation**: Document all APIs and components

### **Code Structure Recommendations**

```typescript
// Example: Plugin structure
class DualModePlugin {
  private reflowMode: ReflowModePlugin;
  private fixedLayoutMode: FixedLayoutModePlugin;
  private currentMode: 'reflow' | 'fixed-layout';

  switchMode(mode: string) {
    // Save current state
    // Switch plugin
    // Restore content
  }

  convertContent(from: string, to: string, content: string) {
    // Convert content between modes
  }
}
```

### **File Organization Recommendations**

1. **Separate Concerns**: Each mode in its own plugin folder
2. **Shared Components**: Common UI in shared components folder
3. **Type Safety**: Strict TypeScript everywhere
4. **Testing**: Unit tests for core functionality

---

## 🎯 SUCCESS METRICS

### **Phase 1 Success**
- [ ] Book info persists across sessions
- [ ] Mode switching works without content loss
- [ ] Basic UI components functional

### **Phase 2 Success**
- [ ] Reflow mode handles long content correctly
- [ ] Responsive editing works on different screen sizes
- [ ] Chapter navigation functions properly

### **Phase 3 Success**
- [ ] Fixed layout respects page constraints
- [ ] Templates apply correctly
- [ ] Print preview matches design

### **Phase 4 Success**
- [ ] Export generates valid EPUB files
- [ ] Content sync works bidirectionally
- [ ] Performance acceptable for large books

---

## 🚀 GETTING STARTED

1. **Clone & Setup**: Ensure current project builds successfully
2. **Branch**: Create feature branch `dual-mode-system`
3. **Phase 1**: Start with Book Info Management
4. **Daily**: Commit progress with detailed messages
5. **Review**: Weekly progress reviews

**Priority Order:**
1. Book Management (Foundation)
2. Mode Switching (Core Feature)
3. Reflow Mode (Simpler implementation)
4. Fixed Layout (More complex)
5. Export/Import (Final features)

---

## 📚 RESOURCES

- **EPUB Specification**: https://www.w3.org/publishing/epub3/
- **Fixed Layout Docs**: https://www.w3.org/publishing/epub3/epub-contentdocs.html#sec-fixed-layouts
- **GrapesJS Plugins**: https://grapesjs.com/docs/plugins/
- **TypeScript Patterns**: https://github.com/typescript-cheatsheets/react

---

*Last Updated: ${new Date().toLocaleDateString('vi-VN')}*