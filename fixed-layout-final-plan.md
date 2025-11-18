# 📋 KẾ HOẠCH PHÁT TRIỂN FIXED LAYOUT PLUGIN (FINAL VERSION)
**Xây dựng hệ thống Fixed Layout với Canvas cố định và Content Reflow - Book Info-based Page Size Management**

---

## 🎯 MỤC TIÊU CHÍNH (FINAL)

### ✅ Core Concept:
- **Book-level Page Size**: Kích thước page được lưu trong book metadata
- **Template Options**: Standard sizes (A4, A5, Letter, etc.) chỉ là preset cho người dùng
- **Custom Size Support**: Người dùng có thể nhập kích thước tùy chỉnh
- **All Pages Same Size**: Tất cả pages trong book có cùng kích thước
- **Content Reflow**: Nội dung flow bình thường trong từng page cố định

---

## 📊 BOOK INFO DATA STRUCTURE

### 1. Book Metadata Enhancement
```typescript
interface BookInfo {
  id: string
  title: string
  author: string
  publisher: string

  // NEW: Fixed Layout Settings
  layoutType: 'reflow' | 'fixed'

  // Page Size Configuration
  pageSize: {
    preset?: 'A4' | 'A5' | 'Letter' | 'Legal' | 'Custom'
    width: number
    height: number
    units: 'mm' | 'in' | 'px'
    orientation: 'portrait' | 'landscape'
  }

  // Margins (optional)
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }

  // Other existing metadata
  isbn: string
  language: string
  description: string
  // ... other fields
}
```

### 2. Page Size Presets (Options Only)
```typescript
interface PageSizePreset {
  name: string
  width: number
  height: number
  units: 'mm' | 'in' | 'px'
  description: string
}

const PAGE_SIZE_PRESETS: PageSizePreset[] = [
  {
    name: 'A4',
    width: 210,
    height: 297,
    units: 'mm',
    description: 'Standard A4 (210×297mm)'
  },
  {
    name: 'A5',
    width: 148,
    height: 210,
    units: 'mm',
    description: 'Standard A5 (148×210mm)'
  },
  {
    name: 'Letter',
    width: 8.5,
    height: 11,
    units: 'in',
    description: 'US Letter (8.5×11in)'
  },
  {
    name: 'Legal',
    width: 8.5,
    height: 14,
    units: 'in',
    description: 'US Legal (8.5×14in)'
  },
  {
    name: 'Custom',
    width: 0,
    height: 0,
    units: 'mm',
    description: 'Custom dimensions'
  }
]
```

---

## 🏗️ KIẾN TRÚC CỘNG THỂ

### 1. BOOK INFO SERVICE
**File:** `services/BookInfoService.ts`

```typescript
class BookInfoService {
  private bookInfo: BookInfo

  // Getters
  getPageSize(): PageSize
  getPageDimensions(): { width: string; height: string }
  getLayoutType(): 'reflow' | 'fixed'

  // Setters
  setPageSize(preset: string): void
  setCustomPageSize(width: number, height: number, units: string): void
  setLayoutType(type: 'reflow' | 'fixed'): void
  setOrientation(orientation: 'portrait' | 'landscape'): void

  // Conversion
  convertToPixels(size: PageSize): { width: number; height: number }
  generateCSSTemplate(): string

  // Save/Load
  saveBookInfo(): void
  loadBookInfo(): BookInfo
}
```

### 2. PAGE SIZE MANAGER (Simplified)
**File:** `services/PageSizeManager.ts`

```typescript
class PageSizeManager {
  private presets: PageSizePreset[] = PAGE_SIZE_PRESETS

  // Get available presets
  getPresets(): PageSizePreset[]
  getPresetByName(name: string): PageSizePreset | null

  // Calculate actual dimensions
  calculateDimensions(bookInfo: BookInfo): { width: number; height: number }
  generatePageCSS(bookInfo: BookInfo): string

  // Preset application
  applyPreset(bookInfo: BookInfo, presetName: string): BookInfo
  applyCustomSize(bookInfo: BookInfo, width: number, height: number, units: string): BookInfo
}
```

### 3. PAGE MANAGER
**File:** `services/PageManager.ts`

```typescript
interface Page {
  id: string
  pageNumber: number
  name: string
  content: string // HTML content
  thumbnail?: string
  bookInfoId: string // Reference to book info
}

class PageManager {
  private pages: Page[]
  private bookInfoService: BookInfoService

  // Page Operations
  createPage(name?: string): Page
  deletePage(pageId: string): void
  duplicatePage(pageId: string): Page
  reorderPages(newOrder: string[]): void

  // Content Management
  updatePageContent(pageId: string, content: string): void
  getPageContent(pageId: string): string

  // Page Generation
  generatePageHTML(page: Page): string
  generatePageSection(page: Page): HTMLElement
}
```

---

## 🔧 CÁC COMPONENT CHÍNH

### 1. BOOK INFO PANEL
**File:** `components/BookInfoPanel.ts`

```typescript
interface BookInfoPanelProps {
  bookInfo: BookInfo
  onBookInfoChange: (bookInfo: BookInfo) => void
}

// Features:
// - Layout type selector (Reflow/Fixed)
// - Page size preset selector
// - Custom size inputs (width, height, units)
// - Orientation selector (Portrait/Landscape)
// - Auto-save to localStorage
```

### 2. PAGE SIZE SELECTOR
**File:** `components/PageSizeSelector.ts`

```typescript
interface PageSizeSelectorProps {
  value: PageSize
  onPresetChange: (presetName: string) => void
  onCustomSizeChange: (width: number, height: number, units: string) => void
  onOrientationChange: (orientation: 'portrait' | 'landscape') => void
}

// UI Structure:
// ┌─────────────────────────────────┐
// │ Preset Size: [A4 ▼]            │
// │ Width: [210] [mm ▼]             │
// │ Height: [297] [mm ▼]            │
// │ Orientation: ○ Portrait ● Landscape │
// └─────────────────────────────────┘
```

### 3. PAGE PANEL
**File:** `components/PagePanel.ts`

```typescript
interface PagePanelProps {
  pages: Page[]
  currentPage: number
  onPageSelect: (pageNumber: number) => void
  onPageAdd: () => void
  onPageDelete: (pageId: string) => void
  onPageReorder: (newOrder: number[]) => void
}

// Features:
// - Page thumbnails with current book size
// - Add/Delete page buttons
// - Page reordering (drag-drop)
// - Page navigation
// - Page count display
```

---

## 📅 PHASED DEVELOPMENT PLAN (FINAL)

### PHASE 1: BOOK INFO & PAGE SIZE MANAGEMENT (1 week)

#### Week 1: Foundation
- [ ] **BookInfoService**
  - Define BookInfo interface with page size
  - Implement save/load functionality
  - Add layout type management

- [ ] **PageSizeManager**
  - Create preset definitions
  - Implement size calculations
  - Add unit conversions (mm ↔ in ↔ px)

- [ ] **BookInfoPanel UI**
  - Layout type selector (Reflow/Fixed)
  - Page size preset dropdown
  - Custom size input fields
  - Orientation selector

**Deliverables:**
- ✅ Book info with page size configuration
- ✅ UI for selecting/changing page size
- ✅ Save/load book settings
- ✅ Preset and custom size support

---

### PHASE 2: FIXED LAYOUT CORE (1.5 weeks)

#### Week 1.5: Layout Engine
- [ ] **LayoutEngine Service**
  - Canvas sizing based on book info
  - Page section generation with correct dimensions
  - Fixed layout enable/disable

- [ ] **PageManager Implementation**
  - Page CRUD operations
  - Page HTML generation with correct structure
  - Page content management

#### Week 2.5: Canvas Integration
- [ ] **Fixed Layout Canvas**
  - Set canvas to book page dimensions
  - Create page sections dynamically
  - Handle page navigation

- [ ] **GrapesJS Integration**
  - Register fixed layout commands
  - Update canvas when book info changes
  - Handle mode switching (reflow ↔ fixed)

**Deliverables:**
- ✅ Canvas with fixed page dimensions
- ✅ Page creation with book size applied
- ✅ Fixed layout mode working
- ✅ Page navigation functional

---

### PHASE 3: PAGE MANAGEMENT UI (1 week)

#### Week 3.5: Page Panel
- [ ] **Page Panel Component**
  - Page list with thumbnails
  - Add/Delete page buttons
  - Page selection highlighting

- [ ] **Page Thumbnails**
  - Generate thumbnails from page content
  - Update thumbnails when content changes
  - Display page number in thumbnails

- [ ] **Page Operations**
  - Page reordering (drag-drop)
  - Page duplication
  - Page renaming

**Deliverables:**
- ✅ Professional page management UI
- ✅ Page thumbnails working
- ✅ Page operations (add, delete, reorder)
- ✅ Page navigation

---

### PHASE 4: TEMPLATES & POLISH (1.5 weeks)

#### Week 4.5: Template System
- [ ] **Page Templates**
  - Cover page templates
  - Content page templates
  - Chapter start templates

- [ ] **Template Browser**
  - Template gallery UI
  - Template preview
  - One-click template application

#### Week 5.5: Polish & Export
- [ ] **UI Polish**
  - Responsive design
  - Loading states
  - Error handling

- [ ] **Export Integration**
  - Export fixed layout EPUB
  - Maintain page structure in export
  - Generate proper EPUB metadata

**Deliverables:**
- ✅ Complete template system
- ✅ Professional UI/UX
- ✅ Fixed layout export
- ✅ Production ready

---

## 🔌 INTEGRATION REQUIREMENTS

### 1. Editor.tsx Modifications
```typescript
// Add fixed layout plugin
import { fixedLayout } from '../../plugins';

const editorInstance = grapesjs.init({
  container: editorRef.current as HTMLElement,
  plugins: [setup, bookBlocks, bookManager, fixedLayout, tuiImageEditorPlugin],

  pluginsOpts: {
    'fixed-layout': {
      autoEnable: false, // Start with reflow mode
      bookInfo: {
        layoutType: 'reflow',
        pageSize: {
          preset: 'A4',
          width: 210,
          height: 297,
          units: 'mm',
          orientation: 'portrait'
        }
      }
    }
  }
});
```

### 2. setup.ts Integration
```typescript
// Add Book Info section to Structure tab
const createBookStructureView = (container: HTMLElement) => {
  const structureView = document.createElement('div');
  structureView.className = 'structure-view';

  // Enhanced Book Info Section
  const bookInfoSection = document.createElement('div');
  bookInfoSection.innerHTML = `
    <div class="left-sidebar-title">
      <i class="fas fa-book" style="margin-right: 8px;"></i>
      <span>Book Info</span>
    </div>
    <div class="gjs-category-content">
      <div id="book-info-panel">
        <!-- Book info panel will be rendered here -->
      </div>
    </div>
  `;

  // Layout Type Selector
  const layoutSection = document.createElement('div');
  layoutSection.innerHTML = `
    <div class="left-sidebar-title">
      <i class="fas fa-cog" style="margin-right: 8px;"></i>
      <span>Layout Settings</span>
    </div>
    <div class="gjs-category-content">
      <div class="gjs-form-group">
        <label>Layout Type:</label>
        <select id="layout-type-select" class="gjs-field">
          <option value="reflow">Reflow Layout</option>
          <option value="fixed">Fixed Layout</option>
        </select>
      </div>

      <!-- Fixed Layout Controls (hidden by default) -->
      <div id="fixed-layout-controls" style="display: none;">
        <div class="gjs-form-group">
          <label>Page Size Preset:</label>
          <select id="page-size-preset" class="gjs-field">
            <option value="A4">A4 (210×297mm)</option>
            <option value="A5">A5 (148×210mm)</option>
            <option value="Letter">US Letter (8.5×11in)</option>
            <option value="Legal">US Legal (8.5×14in)</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        <div id="custom-size-controls" style="display: none;">
          <div class="gjs-form-group">
            <label>Width:</label>
            <input type="number" id="page-width" class="gjs-field" style="width: 80px; margin-right: 8px;">
            <select id="width-units" class="gjs-field" style="width: 60px;">
              <option value="mm">mm</option>
              <option value="in">in</option>
            </select>
          </div>

          <div class="gjs-form-group">
            <label>Height:</label>
            <input type="number" id="page-height" class="gjs-field" style="width: 80px; margin-right: 8px;">
            <select id="height-units" class="gjs-field" style="width: 60px;">
              <option value="mm">mm</option>
              <option value="in">in</option>
            </select>
          </div>
        </div>

        <div class="gjs-form-group">
          <label>Orientation:</label>
          <select id="page-orientation" class="gjs-field">
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>

        <button class="btn-full" id="apply-layout-settings">Apply Settings</button>
      </div>
    </div>
  `;

  structureView.appendChild(bookInfoSection);
  structureView.appendChild(layoutSection);

  // Add existing chapters and pages sections
  // ...

  container.appendChild(structureView);

  // Event Listeners
  setupLayoutEventListeners();
};

// Setup event listeners
const setupLayoutEventListeners = () => {
  const layoutTypeSelect = document.getElementById('layout-type-select');
  const fixedLayoutControls = document.getElementById('fixed-layout-controls');
  const pageSizePreset = document.getElementById('page-size-preset');
  const customSizeControls = document.getElementById('custom-size-controls');
  const applyButton = document.getElementById('apply-layout-settings');

  layoutTypeSelect?.addEventListener('change', (e) => {
    const isFixed = (e.target as HTMLSelectElement).value === 'fixed';
    fixedLayoutControls!.style.display = isFixed ? 'block' : 'none';

    if (isFixed) {
      editor.runCommand('fixed-layout:enable');
    } else {
      editor.runCommand('fixed-layout:disable');
    }
  });

  pageSizePreset?.addEventListener('change', (e) => {
    const preset = (e.target as HTMLSelectElement).value;
    customSizeControls!.style.display = preset === 'Custom' ? 'block' : 'none';
  });

  applyButton?.addEventListener('click', () => {
    const preset = (pageSizePreset as HTMLSelectElement).value;
    let width, height, units;

    if (preset === 'Custom') {
      width = parseFloat((document.getElementById('page-width') as HTMLInputElement).value);
      height = parseFloat((document.getElementById('page-height') as HTMLInputElement).value);
      units = (document.getElementById('width-units') as HTMLSelectElement).value;
    } else {
      const pageSizeManager = editor.PageSizeManager;
      const selectedPreset = pageSizeManager.getPresetByName(preset);
      if (selectedPreset) {
        width = selectedPreset.width;
        height = selectedPreset.height;
        units = selectedPreset.units;
      }
    }

    const orientation = (document.getElementById('page-orientation') as HTMLSelectElement).value;

    // Update book info and apply
    editor.BookInfoService.setPageSize(preset, width, height, units);
    editor.BookInfoService.setOrientation(orientation as 'portrait' | 'landscape');
    editor.runCommand('fixed-layout:apply-settings');
  });
};
```

### 3. CSS Updates
```css
/* Add to setup.css */

/* Book Info Panel */
#book-info-panel {
  padding: var(--gjs-input-padding-multiple);
}

/* Layout Controls */
.layout-controls {
  background: var(--gjs-panel-bg);
  border-bottom: 1px solid var(--gjs-border-color);
}

#fixed-layout-controls {
  background: var(--gjs-panel-bg-alt);
  border-top: 1px solid var(--gjs-border-color);
  padding: var(--gjs-input-padding-multiple);
}

/* Custom Size Controls */
#custom-size-controls {
  background: var(--gjs-panel-bg);
  border: 1px solid var(--gjs-border-color);
  border-radius: 4px;
  padding: var(--gjs-input-padding);
  margin-top: var(--gjs-input-padding);
}

/* Form Groups in Fixed Layout */
#fixed-layout-controls .gjs-form-group {
  margin-bottom: var(--gjs-input-padding);
}

#fixed-layout-controls .gjs-form-group:last-child {
  margin-bottom: 0;
}

/* Input Groups */
.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group .gjs-field {
  flex: 1;
}

.input-group .gjs-field[style*="width"] {
  flex: none;
}

/* Apply Button */
.btn-full {
  width: 100%;
  padding: 8px 16px;
  background: var(--gjs-primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  margin-top: var(--gjs-input-padding);
}

.btn-full:hover {
  background: var(--gjs-primary-color-dark);
}

/* Fixed Layout Canvas */
.ebook-content.fixed-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: var(--gjs-canvas-bg);
}

.ebook-page {
  position: relative;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  border-radius: 4px;
  padding: var(--page-padding, 40px);
  box-sizing: border-box;
  border: 1px solid #ddd;
}

/* Page Size Preview */
.page-size-preview {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  text-align: right;
}

/* Responsive scaling for large pages */
@media (max-width: 768px) {
  .ebook-page {
    transform: scale(0.8);
    transform-origin: top center;
  }
}

@media (max-width: 480px) {
  .ebook-page {
    transform: scale(0.6);
  }
}
```

---

## 📊 TECHNICAL SPECIFICATIONS (FINAL)

### 1. Core Data Flow
```typescript
// User selects page size preset -> BookInfo updates -> Canvas resizes -> Pages update
BookInfoService.setPageSize('A4')
  ↓
PageSizeManager.calculateDimensions(bookInfo)
  ↓
LayoutEngine.applyDimensions(dimensions)
  ↓
PageManager.updateAllPages()
  ↓
Canvas renders with new page size
```

### 2. State Management
```typescript
// Single source of truth for page size
interface AppState {
  bookInfo: BookInfo {
    layoutType: 'reflow' | 'fixed'
    pageSize: {
      width: number
      height: number
      units: 'mm' | 'in' | 'px'
      orientation: 'portrait' | 'landscape'
    }
  }
  pages: Page[]
  currentPage: number
}

// All components read from single bookInfo source
// Page size changes propagate to all pages automatically
```

### 3. Performance Considerations
- **Lazy Page Rendering:** Only render visible pages
- **Thumbnail Caching:** Cache generated thumbnails
- **Debounced Updates:** Debounce book info changes
- **Efficient Redraw:** Only recalculate when page size changes

---

## ✅ FINAL SUCCESS METRICS

### 1. User Experience
- **Setup Time:** < 1 minute to configure book page size
- **Size Switching:** < 2 seconds to change page size for entire book
- **Page Creation:** < 1 second to add new page with correct size
- **Template Application:** < 1 second to apply template

### 2. Technical Performance
- **Bundle Size:** < 30KB for fixed layout plugin
- **Memory Usage:** < 10MB increase for fixed layout
- **Canvas Performance:** < 50ms to resize canvas
- **Page Rendering:** < 100ms per page

### 3. Feature Completeness
- ✅ Book-level page size management
- ✅ 4 standard presets + custom sizes
- ✅ Portrait/landscape orientation
- ✅ All pages maintain consistent sizing
- ✅ Content reflows normally within fixed pages
- ✅ Professional UI for book configuration

---

## 📞 CONCLUSION (FINAL)

Fixed Layout Plugin với **Book Info-based Page Size Management** là approach **tối ưu và thực tế**:

### ✅ **Key Advantages:**
1. **✅ Centralized Management:** One place to manage page size for entire book
2. **✅ User-Friendly:** Simple preset selector with custom size option
3. **✅ Consistent Pages:** All pages automatically use book settings
4. **✅ Easy Implementation:** Simple data flow and state management
5. **✅ Scalable:** Easy to add more presets and features later

### ✅ **Workflow:**
1. User sets page size in book info (preset or custom)
2. All new pages automatically use book settings
3. Existing pages update when book settings change
4. Content flows normally within fixed page containers

### ✅ **Timeline:** 5 weeks total
- **Week 1:** Book info & page size management
- **Week 2.5:** Fixed layout core implementation
- **Week 3.5:** Page management UI
- **Week 5:** Templates & polish

Approach này cung cấp **fixed layout capability** mà vẫn giữ được **simplicity và consistency** - là giải pháp hoàn hảo cho eBook Editor!

---

**Document Version:** 3.0 (Final)
**Last Updated:** 2025-01-18
**Status:** Ready for Development 🚀