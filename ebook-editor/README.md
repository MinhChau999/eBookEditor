# 📘 eBook Editor

Một trình biên tập eBook dựa trên GrapesJS, hỗ trợ cả Fixed Layout và Reflow Layout EPUB.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Cấu trúc thư mục

```
src/
├── plugins/                          # GrapesJS Plugins
│   ├── book-manager/                 # Quản lý sách
│   ├── chapter-manager/              # Quản lý chương
│   ├── page-manager/                 # Quản lý trang (CRITICAL cho fixed layout)
│   ├── fixed-layout/                 # Hỗ trợ fixed layout
│   ├── storage-manager/              # Quản lý lưu trữ
│   └── version-control/              # Version control
├── ui/                               # UI Components
│   ├── components/                   # React Components
│   │   ├── EditorHeader.tsx          # Header bar
│   │   ├── EditorSidebar.tsx         # Sidebar với tabs
│   │   ├── EditorCanvas.tsx          # Canvas area
│   │   ├── EditorProperties.tsx      # Properties panel
│   │   ├── EditorStatus.tsx          # Status bar
│   │   └── EditorOverlay.tsx         # Mobile overlay
│   ├── layouts/                      # Layout Components
│   │   └── EditorLayout.tsx          # Main layout
│   └── theme/                        # Theme & Styles
│       └── custom-theme.css          # Custom theme với color palette
├── services/                         # Core Services
│   ├── epub/                         # EPUB parsing/building
│   ├── book/                         # Book management
│   ├── page/                         # Page management (fixed layout)
│   ├── storage/                      # Storage services
│   └── auth/                         # Authentication
├── stores/                           # State Management
│   ├── hooks/                        # Custom React hooks
│   └── types/                        # TypeScript definitions
│       └── editor.d.ts               # Core type definitions
└── styles/                           # Global Styles
```

## 🎨 Design System

### Color Palette
- **Primary**: #3f3f3f (Deep charcoal)
- **Secondary**: #e6e6e6 (Light gray)
- **Accent**: #4a8c87 (Muted teal)
- **Accent Light**: #6cdada (Light aqua)

### Layout Architecture
- **3-column layout**: Sidebar (280px) | Canvas (flexible) | Properties (320px)
- **Sticky header**: 60px height
- **Status bar**: 24px height
- **Responsive**: Mobile overlay pattern cho screens < 768px

## 🏗️ Current Status (Week 1 - Foundation)

### ✅ Completed
- [x] Vite + React + TypeScript setup
- [x] GrapesJS dependencies installed
- [x] Project structure created
- [x] Basic UI layout implemented
- [x] Custom theme with color palette
- [x] Responsive layout structure
- [x] Component architecture foundation

### 🔄 Next Steps (Week 2-3)
- [ ] Implement book manager plugin
- [ ] Create book library UI
- [ ] **Create page manager plugin** ← CRITICAL for fixed layout
- [ ] **Build page editor with canvas** ← CRITICAL for fixed layout
- [ ] Implement chapter manager plugin
- [ ] Create metadata editor
- [ ] Build asset manager
- [ ] Setup basic storage system (IndexedDB)

## 🎯 Features Overview

### Core Features
- **Book Management**: Tạo, sửa, xóa, tổ chức sách
- **Chapter Management**: Quản lý chương (reflow layout)
- **Page Management**: Quản lý trang individual (fixed layout) ← **CRITICAL**
- **Visual Editor**: GrapesJS-based WYSIWYG editor
- **Metadata Editor**: Dublin Core metadata
- **Asset Management**: Quản lý images, fonts
- **Import/Export**: EPUB 2 & 3 support
- **Preview Mode**: Real-time preview
- **Validation**: EPUB validation

### Fixed Layout Support (Priority)
- **Page Editor**: Canvas với fixed dimensions
- **Page Thumbnails**: Real-time preview
- **Drag & Drop**: Sắp xếp trang
- **Templates**: Page templates & master pages
- **Layer Management**: Layers cho từng trang
- **Grid & Guides**: Precision alignment
- **Zoom Controls**: Detail editing

## 📚 Documentation

- [Plan chi tiết](../plan.md)
- [UI Design Guide](../ui-design-guide.md)
- [API Documentation](./docs/) (coming soon)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Editor**: GrapesJS + Custom Plugins
- **Build Tool**: Vite
- **Styling**: CSS Custom Properties
- **Storage**: IndexedDB + Cloud (optional)
- **EPUB**: JSZip + Custom parser

## 📱 Responsive Design

- **Desktop**: Full 3-column layout
- **Tablet**: Reduced widths (240px | flex | 280px)
- **Mobile**: Overlay panels with full-width canvas

## 🎯 MVP Timeline

- **Week 1**: Foundation setup ✅
- **Week 2-3**: Core features implementation
- **Week 4**: Import/Export EPUB
- **Week 5**: Style & Validation
- **Week 6**: Page Templates
- **Week 7-8**: Polish & Testing

---

📧 **Contact**: [Your Email]
🌐 **Website**: [Your Website]
📚 **Docs**: [Documentation URL]
