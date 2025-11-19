# 📋 KẾ HOẠCH PHÁT TRIỂN EBOOK DUAL-MODE SYSTEM
**Reflow + Fixed Layout với Content Management thống nhất**

---

## 🎯 OVERVIEW

Xây dựng hệ thống eBook Editor hỗ trợ 2 chế độ:
- **Reflow Mode**: Nội dung flows continuously (traditional eBook)
- **Fixed Layout Mode**: Nội dung trong trang cố định (magazine, children's books)

**Core Principle**: Same content source, different display modes

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

### 2. **Component Structure**

```
src/
├── types/
│   ├── book.types.ts          # BookInfo, PageData interfaces
│   └── editor.types.ts        # Editor extensions
├── store/
│   ├── bookStore.ts           # Book state management
│   └── settingsStore.ts       # Editor settings
├── components/
│   ├── ModeSwitcher/          # UI for switching modes
│   ├── PageManager/           # Page list & operations
│   ├── BookSettings/          # Book metadata & templates
│   └── ExportDialog/          # Export options
├── plugins/
│   ├── dualMode/              # Dual mode core plugin
│   ├── reflowMode/            # Reflow mode implementation
│   └── fixedLayoutMode/       # Fixed layout implementation
└── utils/
    ├── pageTemplates.ts       # Page size presets
    ├── contentConverter.ts    # Convert between modes
    └── exportUtils.ts         # Export helpers
```

---

## 🚀 IMPLEMENTATION PHASES

### **PHASE 1: FOUNDATION** (Week 1)

#### 1.1 Book Info Management System
- [ ] Create `BookInfo` and `PageData` types
- [ ] Implement `bookStore` for state management
- [ ] Create `BookSettings` component
- [ ] Add localStorage persistence

**Files to create:**
- `src/types/book.types.ts`
- `src/store/bookStore.ts`
- `src/components/BookSettings/index.tsx`

#### 1.2 Enhanced Page Manager Plugin
- [ ] Extend existing Page Manager
- [ ] Add book-level operations
- [ ] Implement content synchronization
- [ ] Add chapter management

**Files to modify:**
- `src/plugins/book-manager/index.ts`
- `src/lib/grapesjs/packages/core/src/pages/index.ts`

#### 1.3 Mode Switching Infrastructure
- [ ] Create mode switching commands
- [ ] Implement content converter
- [ ] Add mode-specific CSS handling
- [ ] Create `ModeSwitcher` component

**Files to create:**
- `src/components/ModeSwitcher/index.tsx`
- `src/utils/contentConverter.ts`

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
- [ ] Grid system for alignment
- [ ] Element positioning
- [ ] Master pages support
- [ ] Layer management

### **PHASE 4: ADVANCED FEATURES** (Week 4)

#### 4.1 Content Synchronization
- [ ] Bidirectional content sync
- [ ] Mode-specific optimizations
- [ ] Conflict resolution
- [ ] Version history

#### 4.2 Export System
- [ ] EPUB export (reflow & fixed)
- [ ] PDF export
- [ ] Web export
- [ ] Print optimization

#### 4.3 Import & Migration
- [ ] Import existing eBooks
- [ ] Convert between formats
- [ ] Template library
- [ ] Asset management

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