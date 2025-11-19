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
├── lib/
│   └── grapesjs/
│       └── plugins/           # GrapesJS Adapters (The "Bridge")
│           ├── core-setup/    # Minimal Editor Config (Panels, Commands)
│           ├── book-adapter/  # Renders Book UI into Editor Panels
│           ├── page-adapter/  # Renders Page UI into Editor Panels
│           └── dual-mode/     # Orchestrates Reflow/Fixed switching
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

---

## 🚀 EPUB FIXED LAYOUT EXPORT ARCHITECTURE

### **1. Data Structure for Export**

```typescript
interface EPUBFixedLayoutExport {
  bookInfo: {
    title: string;
    author: string;
    language: string;
    identifier: string;
    modified: string;
  };
  layout: {
    width: number;    // Page width in pixels
    height: number;   // Page height in pixels
    orientation: 'portrait' | 'landscape' | 'auto';
    spread: 'none' | 'landscape' | 'portrait' | 'both';
  };
  pages: EPUBPage[];
  assets: EPUBAsset[];
  navigation: EPUBNavigation[];
}

interface EPUBPage {
  id: string;           // page-001, page-002, etc.
  filename: string;     // page-001.xhtml
  title: string;        // Page title for accessibility
  content: string;      // XHTML content with absolute positioning
  styles: string;       // Page-specific CSS
  assets: string[];     // Asset references
  pageNumber: number;   // Sequential page number
}

interface EPUBAsset {
  id: string;
  filename: string;
  mediaType: string;
  content: Buffer | string;
  optimized: boolean;
}
```

### **2. EPUB File Generation Pipeline**

```typescript
class EPUBFixedLayoutExporter {
  async export(bookInfo: BookInfo, pages: PageData[]): Promise<Buffer> {
    const epubData = await this.prepareEPUBData(bookInfo, pages);
    const zipFile = await this.createEPUBZip(epubData);
    return zipFile;
  }

  private async prepareEPUBData(bookInfo: BookInfo, pages: PageData[]): Promise<EPUBData> {
    return {
      'mimetype': 'application/epub+zip',
      'META-INF/container.xml': this.generateContainerXML(),
      'OEBPS/content.opf': await this.generateContentOPF(bookInfo, pages),
      'OEBPS/nav.xhtml': this.generateNavigation(pages),
      'OEBPS/toc.ncx': this.generateNCX(pages),
      'OEBPS/css/epub-core.css': this.generateCoreCSS(),
      'OEBPS/css/page-styles.css': this.generatePageCSS(bookInfo.pageSize),
      ...await this.generatePageFiles(pages),
      ...await this.copyAssets(pages)
    };
  }

  private async generateContentOPF(bookInfo: BookInfo, pages: PageData[]): Promise<string> {
    return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">

  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${bookInfo.id}</dc:identifier>
    <dc:title>${bookInfo.title}</dc:title>
    <dc:creator>${bookInfo.author}</dc:creator>
    <dc:language>vi</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString()}</meta>

    <!-- 🔥 FIXED LAYOUT CRITICAL METADATA -->
    <meta property="rendition:layout">pre-paginated</meta>
    <meta property="rendition:orientation">${bookInfo.orientation || 'auto'}</meta>
    <meta property="rendition:spread">${bookInfo.spread || 'auto'}</meta>
    <meta property="rendition:viewport">width=${bookInfo.pageSize?.width}, height=${bookInfo.pageSize?.height}</meta>
  </metadata>

  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css-core" href="css/epub-core.css" media-type="text/css"/>
    <item id="css-page" href="css/page-styles.css" media-type="text/css"/>

    ${this.generateManifestItems(pages)}
    ${this.generateAssetManifestItems(pages)}
  </manifest>

  <spine page-progression-direction="ltr">
    ${this.generateSpineItems(pages)}
  </spine>

</package>`;
  }

  private async generatePageFiles(pages: PageData[]): Promise<Record<string, string>> {
    const pageFiles: Record<string, string> = {};

    pages.forEach((page, index) => {
      const pageId = `page-${String(index + 1).padStart(3, '0')}`;
      const filename = `xhtml/${pageId}.xhtml`;

      pageFiles[filename] = this.generatePageXHTML(page, pageId);
    });

    return pageFiles;
  }

  private generatePageXHTML(page: PageData, pageId: string): string {
    const { pageSize } = this.getBookInfo();

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${page.name}</title>
  <link rel="stylesheet" type="text/css" href="../css/epub-core.css"/>
  <link rel="stylesheet" type="text/css" href="../css/page-styles.css"/>

  <style>
    /* 🔥 CRITICAL: Fixed positioning for EPUB readers */
    html, body {
      width: ${pageSize.width}px;
      height: ${pageSize.height}px;
      overflow: hidden;
      margin: 0;
      padding: 0;
      position: absolute;
      top: 0;
      left: 0;
      -epub-writing-mode: horizontal-tb;
    }

    .page-content {
      width: 100%;
      height: 100%;
      position: relative;
      background: white;
      box-sizing: border-box;
    }

    /* Page-specific styles */
    ${page.styles || ''}
  </style>
</head>
<body>
  <div class="page-content">
    ${this.convertContentToFixedLayout(page.content)}
  </div>
</body>
</html>`;
  }

  private convertContentToFixedLayout(content: string): string {
    // ⚠️ UPDATED STRATEGY: Keep content responsive within the fixed page container
    // Do NOT convert to absolute positioning.
    // Just ensure the content is wrapped in a container that matches the page size.
    
    return content; 
  }
}
```

### **3. Responsive Container Strategy (Replaces Positioning Algorithm)**

Instead of calculating absolute positions, we use CSS to ensure content fits within the fixed page boundaries.

```css
/* Core CSS for Fixed Layout Page */
.page-container {
  width: var(--page-width);
  height: var(--page-height);
  overflow: hidden; /* Clip content that overflows */
  position: relative;
  background: white;
}

/* Content Area */
.content-area {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* Allow internal scrolling during editing, but hidden in export */
  overflow: hidden; 
}

/* Grid System Support */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--grid-gap);
}
```

> **💡 Note:** With this approach, the author is responsible for ensuring content fits within the page. If content overflows, it will be clipped. We can provide a "Overflow Warning" in the editor.

### **4. EPUB Validation**

```typescript
class EPUBValidator {
  async validateEPUB(epubBuffer: Buffer): Promise<ValidationResult> {
    // 1. Check mimetype
    // 2. Validate container.xml
    // 3. Check content.opf structure
    // 4. Verify fixed layout metadata
    // 5. Validate XHTML files
    // 6. Check CSS compliance
    // 7. Verify asset references

    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }
}
```

---

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