

# 📘 KẾ HOẠCH PHÁT TRIỂN EBOOK EDITOR DỰA TRÊN GRAPESJS

## 1. Mục tiêu

Xây dựng **trình biên tập eBook (EPUB Editor)** dựa trên nền tảng **GrapesJS**, cho phép:
- Soạn thảo, bố cục và chỉnh sửa nội dung eBook (Fixed Layout hoặc Reflow Layout)
- Quản lý style, chương, hình ảnh, metadata (tác giả, tiêu đề, ISBN,...)
- Quản lý thư viện eBook với lưu trữ đa nền tảng
- Xuất ra định dạng **EPUB 3** hợp chuẩn (và EPUB 2 để tương thích rộng)
- **Validation tự động** để đảm bảo file EPUB hợp lệ
- **Preview đa thiết bị** để kiểm tra trước khi xuất bản
- Có thể mở rộng thành plugin hoặc ứng dụng web độc lập

---

## 2. Định hướng kiến trúc

### 2.1. Cách tiếp cận
- **Không chỉnh sửa trực tiếp mã nguồn GrapesJS**
- Xây dựng **ứng dụng riêng** sử dụng GrapesJS như **thư viện chính**
- Tạo **hệ thống plugin modular** để dễ bảo trì và mở rộng
- **Separation of Concerns**: Tách biệt logic, UI, và data layer

### 2.2. Công nghệ sử dụng

| Thành phần | Công nghệ | Lý do lựa chọn |
|-------------|------------|----------------|
| Core Editor | GrapesJS latest | WYSIWYG mạnh mẽ, plugin system tốt |
| Build Tool | Vite | Fast HMR, modern ESM support |
| Đóng gói EPUB | JSZip | Tạo file .zip/.epub |
| Parser EPUB | JSZip + DOMParser | Giải nén và parse XML/HTML |
| Trình xem EPUB | epub.js | Reader mạnh mẽ, hỗ trợ EPUB2/3 |
| Validation | EPUBCheck (API) | Chuẩn công nghiệp |
| State Management | Zustand / Pinia | Quản lý state app |
| Storage | IndexedDB (Dexie.js) | Lưu trữ local, hỗ trợ file lớn |
| Backend | Node.js + Express | API cho server-side processing |
| Authentication | JWT / OAuth | Xác thực người dùng |
| Database | MongoDB / PostgreSQL | Lưu trữ dữ liệu người dùng và eBook |
| Testing | Vitest + Playwright | Unit test + E2E test |
| CSS | Code css thuần | Thiết kế đồng bộ với GrapesJS |
| Font Management | Google Fonts API | Quản lý fonts cho eBook |

### 2.3. Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (React)                 │
│  ┌──────────┬──────────┬──────────┬─────────────────┐ │
│  │ Toolbar  │ Sidebar  │  Canvas  │  Properties     │ │
│  │          │          │          │  Panel          │ │
│  └──────────┴──────────┴──────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Plugin System (GrapesJS)                   │
│  ┌──────────────────────────────────────────────────┐ │
│  │ • Book Manager        • Metadata Editor         │ │
│  │ • Chapter Manager     • Style Editor            │ │
│  │ • Asset Manager       • Import/Export           │ │
│  │ • Validation          • Preview                 │ │
│  │ • Template System     • User Authentication     │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    Core Services                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ • EPUB Builder       • EPUB Parser               │ │
│  │ • Validator          • Storage Manager           │ │
│  │ • Font Manager       • Image Optimizer           │ │
│  │ • TOC Generator      • User Manager              │ │
│  │ • Book Library       • Cloud Sync                │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                            │
│  ┌──────────────────────────────────────────────────┐ │
│  │ IndexedDB (Local Projects, Assets, History)       │ │
│  │ LocalStorage (Settings, Preferences)              │ │
│  │ Server API (Cloud Sync, User Data, Book Library)  │ │
│  │ Database (User Accounts, Book Metadata)            │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Cấu trúc dự án (Chi tiết)

```
eBookEditor/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── templates/                    # Template EPUB mẫu
│   │   ├── novel.epub
│   │   ├── textbook.epub
│   │   └── cookbook.epub
│   └── assets/
│       ├── fonts/
│       └── icons/
│
├── src/
│   ├── main.js                       # Entry point
│   ├── config/
│   │   ├── editor.config.js          # GrapesJS config
│   │   ├── epub.config.js            # EPUB standards
│   │   ├── auth.config.js            # Authentication config
│   │   └── constants.js              # App constants
│   │
│   ├── plugins/                      # GrapesJS Plugins
│   │   ├── index.js                  # Plugin registry
│   │   ├── book-manager/             # NEW: Book management
│   │   │   ├── index.js
│   │   │   ├── book-library.js       # UI for book library
│   │   │   ├── book-card.js          # Book card component
│   │   │   └── book-search.js        # Search and filter
│   │   ├── ebook-importer/
│   │   │   ├── index.js
│   │   │   ├── parser.js
│   │   │   └── loader.js
│   │   ├── ebook-exporter/
│   │   │   ├── index.js
│   │   │   ├── builder.js
│   │   │   ├── opf-generator.js
│   │   │   ├── ncx-generator.js
│   │   │   └── nav-generator.js      # EPUB3 nav.xhtml
│   │   ├── ebook-metadata/
│   │   │   ├── index.js
│   │   │   ├── metadata-panel.js
│   │   │   └── dublin-core.js        # DC metadata schema
│   │   ├── chapter-manager/
│   │   │   ├── index.js
│   │   │   ├── chapter-tree.js
│   │   │   ├── navigation.js
│   │   │   └── reorder.js
│   │   ├── style-manager/            # UPDATED: Style management
│   │   │   ├── index.js
│   │   │   ├── book-style-editor.js  # Book-level styles
│   │   │   ├── class-manager.js
│   │   │   ├── preset-styles.js
│   │   │   └── css-optimizer.js
│   │   ├── asset-manager/
│   │   │   ├── index.js
│   │   │   ├── image-uploader.js
│   │   │   ├── image-optimizer.js
│   │   │   ├── font-manager.js
│   │   │   └── media-library.js
│   │   ├── block-manager/
│   │   │   ├── index.js
│   │   │   ├── ebook-blocks.js       # Custom blocks
│   │   │   └── templates.js
│   │   ├── validator/
│   │   │   ├── index.js
│   │   │   ├── html-validator.js
│   │   │   ├── css-validator.js
│   │   │   ├── epub-checker.js
│   │   │   └── accessibility-check.js
│   │   ├── preview/
│   │   │   ├── index.js
│   │   │   ├── epub-renderer.js
│   │   │   └── device-frames.js
│   │   ├── template-system/
│   │   │   ├── index.js
│   │   │   ├── template-loader.js
│   │   │   └── template-gallery.js
│   │   ├── user-auth/                # NEW: User authentication
│   │   │   ├── index.js
│   │   │   ├── login-panel.js
│   │   │   ├── registration-form.js
│   │   │   └── profile-manager.js
│   │   ├── storage-manager/          # UPDATED: Storage management
│   │   │   ├── index.js
│   │   │   ├── local-storage.js      # For unregistered users
│   │   │   ├── cloud-storage.js      # For registered users
│   │   │   └── sync-manager.js       # Sync between local and cloud
│   │   ├── fixed-layout/             # NEW: Fixed layout support
│   │   │   ├── index.js
│   │   │   ├── layout-editor.js
│   │   │   ├── page-manager.js       # NEW: Core page management
│   │   │   ├── page-editor.js        # NEW: Individual page editor
│   │   │   ├── page-spreads.js
│   │   │   ├── viewport-settings.js
│   │   │   ├── page-templates.js     # NEW: Page templates
│   │   │   ├── master-pages.js       # NEW: Master pages for consistency
│   │   │   └── page-numbering.js     # NEW: Page numbering system
│   │   └── version-control/
│   │       ├── index.js
│   │       ├── history.js
│   │       └── diff-viewer.js
│   │
│   ├── ui/                           # UI Components
│   │   ├── components/
│   │   │   ├── Modal.js
│   │   │   ├── Sidebar.js
│   │   │   ├── Toolbar.js
│   │   │   ├── PropertyPanel.js
│   │   │   ├── ChapterTree.js
│   │   │   ├── MetadataForm.js
│   │   │   ├── AssetGallery.js
│   │   │   ├── ValidationPanel.js
│   │   │   ├── PreviewFrame.js
│   │   │   ├── BookLibrary.js        # NEW: Book library UI
│   │   │   ├── BookCard.js           # NEW: Book card component
│   │   │   ├── LoginForm.js          # NEW: Login form
│   │   │   ├── UserProfile.js        # NEW: User profile
│   │   │   ├── PageManager.js        # NEW: Fixed layout page manager UI
│   │   │   ├── PageThumbnail.js      # NEW: Page thumbnail component
│   │   │   ├── PageEditor.js         # NEW: Individual page editor UI
│   │   │   ├── PageSpread.js         # NEW: Page spread component
│   │   │   ├── PageTemplates.js      # NEW: Page templates gallery
│   │   │   └── MasterPageEditor.js   # NEW: Master page editor
│   │   ├── layouts/
│   │   │   ├── EditorLayout.js
│   │   │   ├── PreviewLayout.js
│   │   │   ├── LibraryLayout.js      # NEW: Library layout
│   │   │   └── FixedLayoutEditor.js  # NEW: Fixed layout specific editor layout
│   │   └── theme/
│   │       ├── colors.js
│   │       ├── typography.js
│   │       └── custom-theme.css
│   │
│   ├── services/                     # Core Services
│   │   ├── epub/
│   │   │   ├── EPUBBuilder.js
│   │   │   ├── EPUBParser.js
│   │   │   ├── OPFGenerator.js
│   │   │   ├── NCXGenerator.js
│   │   │   ├── NAVGenerator.js
│   │   │   └── Validator.js
│   │   ├── book/                     # NEW: Book services
│   │   │   ├── BookManager.js        # Book CRUD operations
│   │   │   ├── BookMetadata.js       # Handle book metadata
│   │   │   ├── BookStyle.js          # Handle book styles
│   │   │   └── FixedLayoutHandler.js # Fixed layout specific
│   │   ├── page/                     # NEW: Page management services
│   │   │   ├── PageManager.js        # Page CRUD operations
│   │   │   ├── PageRenderer.js       # Render page thumbnails
│   │   │   ├── PageTemplateManager.js # Template management
│   │   │   ├── MasterPageManager.js  # Master page system
│   │   │   └── PageSizeCalculator.js # Size/orientation calculations
│   │   ├── storage/
│   │   │   ├── StorageManager.js
│   │   │   ├── IndexedDBService.js
│   │   │   ├── LocalStorageService.js
│   │   │   ├── CloudStorageService.js # NEW: Cloud storage
│   │   │   └── SyncService.js        # NEW: Sync service
│   │   ├── auth/                     # NEW: Authentication services
│   │   │   ├── AuthService.js
│   │   │   ├── TokenManager.js
│   │   │   └── UserService.js
│   │   ├── media/
│   │   │   ├── ImageProcessor.js
│   │   │   ├── FontLoader.js
│   │   │   └── MediaOptimizer.js
│   │   ├── export/
│   │   │   ├── EPUBExporter.js
│   │   │   ├── PDFExporter.js        # Optional
│   │   │   └── MOBIExporter.js       # Optional
│   │   └── api/
│   │       ├── APIClient.js
│   │       ├── authEndpoints.js      # NEW: Auth endpoints
│   │       ├── bookEndpoints.js      # NEW: Book endpoints
│   │       └── endpoints.js
│   │
│   ├── utils/                        # Utilities
│   │   ├── epub-utils.js
│   │   ├── dom-utils.js
│   │   ├── file-utils.js
│   │   ├── validation-utils.js
│   │   ├── css-sanitizer.js
│   │   ├── html-sanitizer.js
│   │   ├── uuid-generator.js
│   │   ├── date-formatter.js
│   │   ├── auth-utils.js             # NEW: Auth utilities
│   │   └── error-handler.js
│   │
│   ├── store/                        # State Management
│   │   ├── index.js
│   │   ├── editorStore.js
│   │   ├── projectStore.js
│   │   ├── chapterStore.js
│   │   ├── metadataStore.js
│   │   ├── bookStore.js              # NEW: Book store
│   │   ├── authStore.js              # NEW: Auth store
│   │   ├── styleStore.js             # NEW: Style store
│   │   ├── pageStore.js              # NEW: Page management store
│   │   ├── fixedLayoutStore.js       # NEW: Fixed layout store
│   │   └── uiStore.js
│   │
│   ├── hooks/                        # Custom Hooks (React)
│   │   ├── useEditor.js
│   │   ├── useChapters.js
│   │   ├── useMetadata.js
│   │   ├── useValidation.js
│   │   ├── useBooks.js               # NEW: Books hook
│   │   ├── useAuth.js                # NEW: Auth hook
│   │   ├── useStorage.js             # NEW: Storage hook
│   │   ├── useAutoSave.js
│   │   ├── usePages.js               # NEW: Page management hook
│   │   ├── useFixedLayout.js         # NEW: Fixed layout hook
│   │   ├── usePageTemplates.js       # NEW: Page templates hook
│   │   └── useMasterPages.js         # NEW: Master pages hook
│   │
│   ├── types/                        # TypeScript definitions
│   │   ├── epub.d.ts
│   │   ├── editor.d.ts
│   │   ├── metadata.d.ts
│   │   ├── book.d.ts                 # NEW: Book types
│   │   ├── auth.d.ts                 # NEW: Auth types
│   │   ├── style.d.ts                # NEW: Style types
│   │   ├── page.d.ts                 # NEW: Page management types
│   │   └── fixed-layout.d.ts         # NEW: Fixed layout types
│   │
│   └── styles/
│       ├── main.css
│       ├── editor.css
│       ├── preview.css
│       ├── library.css               # NEW: Library styles
│       ├── fixed-layout.css         # NEW: Fixed layout specific styles
│       ├── page-manager.css         # NEW: Page manager UI styles
│       └── themes/
│           ├── dark.css
│           └── light.css
│
├── tests/
│   ├── unit/
│   │   ├── epub-builder.test.js
│   │   ├── epub-parser.test.js
│   │   ├── validator.test.js
│   │   ├── book-manager.test.js      # NEW: Book manager tests
│   │   └── auth.test.js              # NEW: Auth tests
│   ├── integration/
│   │   ├── import-export.test.js
│   │   ├── chapter-manager.test.js
│   │   ├── book-library.test.js      # NEW: Book library tests
│   │   └── storage.test.js           # NEW: Storage tests
│   └── e2e/
│       ├── create-ebook.spec.js
│       ├── export-epub.spec.js
│       ├── user-workflow.spec.js     # NEW: User workflow tests
│       └── library-management.spec.js # NEW: Library management tests
│
├── docs/
│   ├── API.md
│   ├── PLUGIN_DEVELOPMENT.md
│   ├── EPUB_STRUCTURE.md
│   ├── USER_GUIDE.md
│   ├── BOOK_MANAGEMENT.md            # NEW: Book management guide
│   ├── USER_ACCOUNTS.md              # NEW: User accounts guide
│   └── DEPLOYMENT.md
│
├── server/                           # Backend
│   ├── index.js
│   ├── config/
│   │   ├── database.js              # Database configuration
│   │   └── auth.js                  # Auth configuration
│   ├── models/
│   │   ├── User.js                  # User model
│   │   └── Book.js                  # Book model
│   ├── routes/
│   │   ├── auth.js                  # Authentication routes
│   │   ├── books.js                 # Book CRUD routes
│   │   ├── export.js
│   │   ├── storage.js
│   │   └── validation.js
│   ├── services/
│   │   ├── epub-validator.js
│   │   ├── file-storage.js
│   │   ├── auth-service.js          # Authentication service
│   │   └── book-service.js          # Book service
│   ├── middleware/
│   │   ├── auth.js                  # Authentication middleware
│   │   ├── upload.js
│   │   └── validation.js
│   └── utils/
│       ├── jwt.js                   # JWT utilities
│       └── password.js              # Password utilities
│
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
├── vitest.config.js
├── playwright.config.js
├── tsconfig.json
├── README.md
└── LICENSE
```

---

## 4. Các module chức năng (Chi tiết)

### 4.1. Book Manager (Quản lý tất cả eBook) - NEW

**Tính năng:**
- ✅ Thư viện eBook centralized cho người dùng
- ✅ Hiển thị tất cả sách dưới dạng grid/list với thumbnail
- ✅ Tìm kiếm và lọc sách theo metadata (tên, tác giả, thể loại)
- ✅ Sắp xếp sách theo tiêu chí (tên, ngày tạo, ngày sửa)
- ✅ Nhóm sách theo collections/projects
- ✅ Import/export book library
- ✅ Chia sẻ sách với người dùng khác (cho registered users)
- ✅ Backup và restore thư viện
- ✅ Thống kê (số lượng sách, tổng dung lượng)
- ✅ Quick actions (edit, duplicate, delete, export)

**UI Components:**
- Book library grid/list view
- Book card với thumbnail và metadata
- Advanced search và filter panel
- Collections sidebar
- Context menu cho book actions
- Bulk operations toolbar

**Data Structure:**
```javascript
{
  id: 'book-uuid',
  title: 'My eBook',
  author: 'John Doe',
  coverImage: 'data:image/jpeg;base64,...',
  metadata: {
    // Dublin Core và extended metadata
    // Xem section 4.2
  },
  style: {
    // Book-level styles
    // Xem section 4.6
  },
  layout: {
    type: 'reflow' | 'fixed',
    // Fixed layout specific properties
    // Xem section 4.9
  },
  chapters: [
    // Array of chapter references
    // Chi tiết trong section 4.3
  ],
  assets: [
    // Array of asset references
    // Chi tiết trong section 4.5
  ],
  createdAt: '2025-01-15T10:30:00Z',
  updatedAt: '2025-01-20T14:45:00Z',
  ownerId: 'user-uuid', // null cho local storage
  isPublic: false,
  collections: ['collection-uuid-1', 'collection-uuid-2']
}
```

**Storage Strategy:**
- **Unregistered users:** Lưu trữ hoàn toàn trong IndexedDB
- **Registered users:**
  - Primary storage trên server
  - Local cache trong IndexedDB cho offline access
  - Sync mechanism để đồng bộ hóa giữa local và server

### 4.2. Metadata Editor (Quản lý metadata)

**Dublin Core Metadata (Required):**
- Title (dc:title)
- Creator/Author (dc:creator)
- Language (dc:language)
- Identifier (dc:identifier - ISBN/UUID)
- Publisher (dc:publisher)
- Date (dc:date)
- Rights (dc:rights)
- Description (dc:description)
- Subject/Keywords (dc:subject)
- Type (dc:type)
- Format (dc:format)
- Source (dc:source)
- Relation (dc:relation)
- Coverage (dc:coverage)
- Contributor (dc:contributor)

**Extended Metadata:**
- Cover image
- Series information
- Edition
- Page progression direction (LTR/RTL)
- Reading level
- Maturity rating
- Genre/Category
- Price information

**Validation:**
- Required fields checker
- ISBN validator
- Language code validator (ISO 639)
- Date format validator (ISO 8601)

### 4.3. Chapter Manager (Quản lý chương)

**Tính năng:**
- ✅ Tạo, xóa, đổi tên, sắp xếp chương
- ✅ Drag & drop để reorder chapters
- ✅ Nested chapters (chương con, phần)
- ✅ Chapter templates (intro, content, epilogue)
- ✅ Auto-generate TOC từ chapter structure
- ✅ Chapter preview thumbnails
- ✅ Chapter word count & reading time
- ✅ Chapter status (draft, review, final)
- ✅ Quick navigation giữa các chương
- ✅ Copy/duplicate chapters

**UI Components:**
- Tree view với expand/collapse
- Context menu (right-click actions)
- Inline editing cho chapter names
- Status indicators
- Search/filter chapters

**Data Structure:**
```javascript
{
  id: 'chapter-uuid',
  title: 'Chapter 1: The Beginning',
  order: 1,
  parentId: null,
  status: 'draft',
  content: '<html>...</html>',
  // Note: CSS không được lưu ở cấp chapter nữa
  // mà được quản lý ở cấp book
  metadata: {
    wordCount: 2500,
    readingTime: 10,
    lastModified: '2025-01-15T10:30:00Z'
  },
  children: []
}
```

### 4.4. Import EPUB (Chi tiết)

**Flow Import:**

```
1. User chọn file .epub
   ↓
2. Validate file structure
   ↓
3. Extract (unzip) to memory
   ↓
4. Parse META-INF/container.xml
   ↓
5. Parse content.opf
   ↓
6. Load metadata
   ↓
7. Parse toc.ncx / nav.xhtml
   ↓
8. Load chapters theo spine order
   ↓
9. Extract assets (images, fonts, CSS)
   ↓
10. Extract book-level styles
   ↓
11. Detect layout type (fixed/reflow)
   ↓
12. Extract fixed layout properties if applicable
   ↓
13. Render trong GrapesJS
   ↓
14. Build chapter tree
   ↓
15. Ready to edit
```

**Xử lý các trường hợp:**
- EPUB 2 vs EPUB 3
- Fixed layout vs Reflow
- Encrypted DRM (warning only)
- Corrupted files
- Missing resources
- Invalid structure

**Parser Features:**
- Extract inline styles → convert to book-level classes
- Extract chapter-specific CSS → merge into book styles
- Preserve semantic HTML
- Handle multiple CSS files
- Extract embedded fonts
- Parse NCX/NAV structure
- Maintain reading order
- Detect fixed layout properties

### 4.5. Export EPUB (Chi tiết)

**EPUB Structure:**
```
mybook.epub (ZIP)
├── mimetype                          # "application/epub+zip"
├── META-INF/
│   ├── container.xml                 # Points to OPF
│   └── com.apple.ibooks.display-options.xml  # Optional
├── OEBPS/                            # Content folder
│   ├── content.opf                   # Package document
│   ├── toc.ncx                       # EPUB 2 navigation
│   ├── nav.xhtml                     # EPUB 3 navigation
│   ├── cover.xhtml                   # Cover page
│   ├── styles/
│   │   ├── main.css                  # Book-level styles
│   │   └── chapter.css               # Chapter-specific styles (if needed)
│   ├── chapters/
│   │   ├── chapter001.xhtml
│   │   ├── chapter002.xhtml
│   │   └── ...
│   ├── images/
│   │   ├── cover.jpg
│   │   ├── fig001.jpg
│   │   └── ...
│   └── fonts/
│       ├── font1.woff
│       └── font2.woff
```

**Export Process:**

```javascript
1. Validate nội dung (HTML, CSS)
2. Optimize images (resize, compress)
3. Embed/reference fonts
4. Generate unique IDs
5. Build spine (reading order)
6. Generate TOC (NCX + NAV)
7. Generate OPF manifest
8. Create metadata section
9. Sanitize HTML/CSS
10. Package với JSZip
11. Add mimetype (uncompressed)
12. Download file
```

**Optimization:**
- Remove unused CSS
- Compress images (WebP support)
- Minify HTML/CSS (optional)
- Subset fonts (chỉ include ký tự được dùng)
- Remove comments
- Optimize SVG

### 4.6. Style Manager tùy chỉnh (UPDATED)

**Book-Level Styles:**
```javascript
{
  bookId: 'book-uuid',
  version: '1.0',
  
  // CSS Variables - Mapping trực tiếp với CSS custom properties
  variables: {
    // Typography
    '--font-family-body': 'Merriweather, Georgia, serif',
    '--font-family-heading': 'Playfair Display, serif',
    '--font-family-mono': 'Consolas, Monaco, monospace',
    
    '--font-size-base': '16px',
    '--font-size-h1': '2.5em',
    '--font-size-h2': '2em',
    '--font-size-h3': '1.75em',
    '--font-size-h4': '1.5em',
    '--font-size-h5': '1.25em',
    '--font-size-h6': '1em',
    '--font-size-small': '0.875em',
    
    '--font-weight-normal': '400',
    '--font-weight-medium': '500',
    '--font-weight-semibold': '600',
    '--font-weight-bold': '700',
    
    '--line-height-base': '1.6',
    '--line-height-heading': '1.2',
    '--line-height-tight': '1.4',
    '--line-height-loose': '1.8',
    
    '--letter-spacing-normal': '0',
    '--letter-spacing-wide': '0.05em',
    '--letter-spacing-wider': '0.1em',
    
    // Colors
    '--color-primary': '#2c3e50',
    '--color-secondary': '#3498db',
    '--color-accent': '#e74c3c',
    '--color-success': '#27ae60',
    '--color-warning': '#f39c12',
    '--color-danger': '#c0392b',
    
    '--color-text': '#333333',
    '--color-text-light': '#666666',
    '--color-text-lighter': '#999999',
    '--color-heading': '#1a1a1a',
    
    '--color-background': '#ffffff',
    '--color-background-alt': '#f8f9fa',
    '--color-surface': '#ffffff',
    '--color-border': '#e0e0e0',
    
    '--color-link': '#3498db',
    '--color-link-hover': '#2980b9',
    '--color-link-visited': '#8e44ad',
    
    // Spacing
    '--spacing-xs': '0.25rem',
    '--spacing-sm': '0.5rem',
    '--spacing-md': '1rem',
    '--spacing-lg': '1.5rem',
    '--spacing-xl': '2rem',
    '--spacing-2xl': '3rem',
    '--spacing-3xl': '4rem',
    
    // Layout
    '--page-margin-top': '2rem',
    '--page-margin-right': '1.5rem',
    '--page-margin-bottom': '2rem',
    '--page-margin-left': '1.5rem',
    '--page-padding': '0',
    
    '--content-max-width': '40rem',
    '--column-gap': '2rem',
    '--column-count': '1',
    
    // Borders & Radius
    '--border-width': '1px',
    '--border-radius-sm': '0.25rem',
    '--border-radius-md': '0.5rem',
    '--border-radius-lg': '1rem',
    
    // Shadows
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    
    // Other
    '--text-indent': '2em',
    '--paragraph-spacing': '1em',
    '--orphans': '2',
    '--widows': '2'
  },
  
  // CSS Rules - Structured by selectors
  rules: {
    // Root styles
    ':root': {
      'font-family': 'var(--font-family-body)',
      'font-size': 'var(--font-size-base)',
      'line-height': 'var(--line-height-base)',
      'color': 'var(--color-text)',
      'background-color': 'var(--color-background)',
      '-webkit-font-smoothing': 'antialiased',
      '-moz-osx-font-smoothing': 'grayscale'
    },
    
    // Body
    'body': {
      'margin': '0',
      'padding': 'var(--page-margin-top) var(--page-margin-right) var(--page-margin-bottom) var(--page-margin-left)',
      'text-align': 'justify',
      'hyphens': 'auto',
      'orphans': 'var(--orphans)',
      'widows': 'var(--widows)'
    },
    
    // Headings
    'h1, h2, h3, h4, h5, h6': {
      'font-family': 'var(--font-family-heading)',
      'line-height': 'var(--line-height-heading)',
      'color': 'var(--color-heading)',
      'margin-top': 'var(--spacing-xl)',
      'margin-bottom': 'var(--spacing-md)',
      'font-weight': 'var(--font-weight-bold)',
      'page-break-after': 'avoid'
    },
    
    'h1': {
      'font-size': 'var(--font-size-h1)',
      'margin-top': '0'
    },
    
    'h2': {
      'font-size': 'var(--font-size-h2)'
    },
    
    'h3': {
      'font-size': 'var(--font-size-h3)'
    },
    
    'h4': {
      'font-size': 'var(--font-size-h4)'
    },
    
    'h5': {
      'font-size': 'var(--font-size-h5)'
    },
    
    'h6': {
      'font-size': 'var(--font-size-h6)'
    },
    
    // Paragraphs
    'p': {
      'margin-top': '0',
      'margin-bottom': 'var(--paragraph-spacing)',
      'text-indent': '0'
    },
    
    'p + p': {
      'text-indent': 'var(--text-indent)'
    },
    
    'p.no-indent': {
      'text-indent': '0'
    },
    
    // Links
    'a': {
      'color': 'var(--color-link)',
      'text-decoration': 'underline'
    },
    
    'a:hover': {
      'color': 'var(--color-link-hover)'
    },
    
    'a:visited': {
      'color': 'var(--color-link-visited)'
    },
    
    // Lists
    'ul, ol': {
      'margin-top': 'var(--spacing-md)',
      'margin-bottom': 'var(--spacing-md)',
      'padding-left': 'var(--spacing-xl)'
    },
    
    'li': {
      'margin-bottom': 'var(--spacing-sm)'
    },
    
    'li:last-child': {
      'margin-bottom': '0'
    },
    
    // Blockquotes
    'blockquote': {
      'margin': 'var(--spacing-lg) 0',
      'padding': 'var(--spacing-md) var(--spacing-lg)',
      'border-left': '4px solid var(--color-border)',
      'background-color': 'var(--color-background-alt)',
      'font-style': 'italic',
      'color': 'var(--color-text-light)'
    },
    
    // Code
    'code': {
      'font-family': 'var(--font-family-mono)',
      'font-size': '0.9em',
      'padding': '0.125em 0.25em',
      'background-color': 'var(--color-background-alt)',
      'border-radius': 'var(--border-radius-sm)'
    },
    
    'pre': {
      'font-family': 'var(--font-family-mono)',
      'font-size': '0.875em',
      'line-height': 'var(--line-height-tight)',
      'padding': 'var(--spacing-md)',
      'background-color': 'var(--color-background-alt)',
      'border-radius': 'var(--border-radius-md)',
      'overflow-x': 'auto',
      'margin': 'var(--spacing-lg) 0'
    },
    
    'pre code': {
      'padding': '0',
      'background-color': 'transparent',
      'border-radius': '0'
    },
    
    // Images
    'img': {
      'max-width': '100%',
      'height': 'auto',
      'display': 'block',
      'margin': 'var(--spacing-lg) auto'
    },
    
    'figure': {
      'margin': 'var(--spacing-xl) 0',
      'text-align': 'center'
    },
    
    'figcaption': {
      'margin-top': 'var(--spacing-sm)',
      'font-size': 'var(--font-size-small)',
      'color': 'var(--color-text-light)',
      'font-style': 'italic'
    },
    
    // Tables
    'table': {
      'width': '100%',
      'border-collapse': 'collapse',
      'margin': 'var(--spacing-lg) 0'
    },
    
    'th, td': {
      'padding': 'var(--spacing-sm) var(--spacing-md)',
      'border': 'var(--border-width) solid var(--color-border)',
      'text-align': 'left'
    },
    
    'th': {
      'background-color': 'var(--color-background-alt)',
      'font-weight': 'var(--font-weight-semibold)'
    },
    
    // Horizontal Rule
    'hr': {
      'border': 'none',
      'border-top': 'var(--border-width) solid var(--color-border)',
      'margin': 'var(--spacing-xl) 0'
    },
    
    // Print/Page Break Rules
    'h1, h2, h3, h4, h5, h6': {
      'page-break-inside': 'avoid',
      'break-inside': 'avoid'
    },
    
    'img, figure, table': {
      'page-break-inside': 'avoid',
      'break-inside': 'avoid'
    },
    
    // Text formatting
    'em, i': {
      'font-style': 'italic'
    },
    
    'strong, b': {
      'font-weight': 'var(--font-weight-bold)'
    },
    
    'small': {
      'font-size': 'var(--font-size-small)'
    },
    
    'sub, sup': {
      'font-size': '0.75em',
      'line-height': '0',
      'position': 'relative',
      'vertical-align': 'baseline'
    },
    
    'sup': {
      'top': '-0.5em'
    },
    
    'sub': {
      'bottom': '-0.25em'
    }
  },
  
  // Custom CSS (raw CSS string for advanced users)
  customCSS: `
    /* Custom classes can be added here */
    .drop-cap::first-letter {
      font-size: 3em;
      font-weight: bold;
      float: left;
      line-height: 0.8;
      margin: 0.1em 0.1em 0 0;
    }
    
    .chapter-title {
      text-align: center;
      margin-bottom: var(--spacing-2xl);
    }
    
    .scene-break {
      text-align: center;
      margin: var(--spacing-xl) 0;
      font-size: var(--font-size-h3);
    }
  `,
  
  // Metadata
  metadata: {
    name: 'Custom Style',
    description: 'My custom book style',
    author: 'User Name',
    version: '1.0.0',
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-20T14:45:00Z'
  }
}
```

**Preset Styles:**
```javascript
const stylePresets = {
  novel: {
    name: 'Novel',
    description: 'Classic novel typography with justified text',
    category: 'fiction',
    thumbnail: '/presets/novel.jpg',
    
    variables: {
      // Typography
      '--font-family-body': 'Merriweather, Georgia, serif',
      '--font-family-heading': 'Playfair Display, serif',
      '--font-size-base': '16px',
      '--line-height-base': '1.6',
      
      // Colors
      '--color-text': '#2d2d2d',
      '--color-heading': '#1a1a1a',
      '--color-background': '#fffef8',
      
      // Layout
      '--page-margin-top': '2rem',
      '--page-margin-right': '1.5rem',
      '--page-margin-bottom': '2rem',
      '--page-margin-left': '1.5rem',
      '--text-indent': '2em',
      '--paragraph-spacing': '0.75em'
    },
    
    rules: {
      'body': {
        'text-align': 'justify',
        'hyphens': 'auto'
      },
      'p + p': {
        'text-indent': 'var(--text-indent)'
      }
    }
  },
  
  textbook: {
    name: 'Textbook',
    description: 'Clean and readable for educational content',
    category: 'non-fiction',
    thumbnail: '/presets/textbook.jpg',
    
    variables: {
      // Typography
      '--font-family-body': 'Open Sans, -apple-system, sans-serif',
      '--font-family-heading': 'Roboto Slab, serif',
      '--font-size-base': '14px',
      '--line-height-base': '1.5',
      
      // Colors
      '--color-text': '#333333',
      '--color-heading': '#2c3e50',
      '--color-primary': '#3498db',
      '--color-background': '#ffffff',
      '--color-background-alt': '#f8f9fa',
      
      // Layout
      '--page-margin-top': '1.5rem',
      '--page-margin-right': '1.25rem',
      '--page-margin-bottom': '1.5rem',
      '--page-margin-left': '1.25rem',
      '--text-indent': '0',
      '--paragraph-spacing': '1em'
    },
    
    rules: {
      'body': {
        'text-align': 'left'
      },
      'p': {
        'text-indent': '0'
      },
      'h1, h2, h3': {
        'color': 'var(--color-primary)'
      }
    },
    
    customCSS: `
      .info-box {
        padding: var(--spacing-md);
        background-color: var(--color-background-alt);
        border-left: 4px solid var(--color-primary);
        margin: var(--spacing-lg) 0;
      }
      
      .definition {
        font-weight: var(--font-weight-semibold);
      }
    `
  },
  
  children: {
    name: 'Children\'s Book',
    description: 'Fun and playful for young readers',
    category: 'children',
    thumbnail: '/presets/children.jpg',
    
    variables: {
      // Typography
      '--font-family-body': 'Comic Neue, cursive',
      '--font-family-heading': 'Fredoka One, cursive',
      '--font-size-base': '18px',
      '--line-height-base': '1.8',
      
      // Colors - Vibrant palette
      '--color-text': '#2d3436',
      '--color-heading': '#6c5ce7',
      '--color-primary': '#ff6b6b',
      '--color-secondary': '#4ecdc4',
      '--color-accent': '#ffe66d',
      '--color-background': '#ffffff',
      
      // Layout
      '--page-margin-top': '1.5rem',
      '--page-margin-right': '1rem',
      '--page-margin-bottom': '1.5rem',
      '--page-margin-left': '1rem',
      '--text-indent': '0',
      '--paragraph-spacing': '1.2em'
    },
    
    rules: {
      'body': {
        'text-align': 'left'
      },
      'p': {
        'text-indent': '0',
        'font-size': '1.1em'
      },
      'h1, h2': {
        'color': 'var(--color-primary)',
        'text-align': 'center'
      }
    }
  },
  
  academic: {
    name: 'Academic Paper',
    description: 'Professional formatting for academic writing',
    category: 'academic',
    thumbnail: '/presets/academic.jpg',
    
    variables: {
      // Typography
      '--font-family-body': 'Times New Roman, Times, serif',
      '--font-family-heading': 'Times New Roman, Times, serif',
      '--font-size-base': '12pt',
      '--line-height-base': '2',
      
      // Colors - Minimal
      '--color-text': '#000000',
      '--color-heading': '#000000',
      '--color-background': '#ffffff',
      
      // Layout - Strict margins
      '--page-margin-top': '1in',
      '--page-margin-right': '1in',
      '--page-margin-bottom': '1in',
      '--page-margin-left': '1in',
      '--text-indent': '0.5in',
      '--paragraph-spacing': '0'
    },
    
    rules: {
      'body': {
        'text-align': 'left'
      },
      'p': {
        'margin-bottom': '0',
        'text-indent': 'var(--text-indent)'
      },
      'h1, h2, h3': {
        'text-align': 'center',
        'font-weight': 'bold',
        'text-transform': 'none'
      }
    }
  },
  
  modern: {
    name: 'Modern Minimal',
    description: 'Clean, contemporary design with lots of whitespace',
    category: 'minimal',
    thumbnail: '/presets/modern.jpg',
    
    variables: {
      // Typography
      '--font-family-body': 'Inter, -apple-system, sans-serif',
      '--font-family-heading': 'Inter, -apple-system, sans-serif',
      '--font-size-base': '15px',
      '--line-height-base': '1.7',
      '--letter-spacing-normal': '0.01em',
      
      // Colors - Monochrome
      '--color-text': '#1a1a1a',
      '--color-heading': '#000000',
      '--color-text-light': '#666666',
      '--color-background': '#ffffff',
      '--color-border': '#e5e5e5',
      
      // Layout - Generous spacing
      '--page-margin-top': '3rem',
      '--page-margin-right': '2rem',
      '--page-margin-bottom': '3rem',
      '--page-margin-left': '2rem',
      '--paragraph-spacing': '1.5em',
      '--spacing-xl': '3rem',
      '--spacing-2xl': '4rem'
    },
    
    rules: {
      'body': {
        'text-align': 'left'
      },
      'h1, h2, h3': {
        'letter-spacing': '-0.02em',
        'margin-top': 'var(--spacing-2xl)'
      },
      'p': {
        'text-indent': '0'
      }
    }
  },
  
  magazine: {
    name: 'Magazine',
    description: 'Multi-column layout with modern typography',
    category: 'editorial',
    thumbnail: '/presets/magazine.jpg',
    
    variables: {
      // Typography
      '--font-family-body': 'Lora, Georgia, serif',
      '--font-family-heading': 'Montserrat, sans-serif',
      '--font-size-base': '14px',
      '--line-height-base': '1.6',
      
      // Colors
      '--color-text': '#2c2c2c',
      '--color-heading': '#000000',
      '--color-primary': '#e63946',
      '--color-background': '#ffffff',
      
      // Layout - Columns
      '--page-margin-top': '1.5rem',
      '--page-margin-right': '1.25rem',
      '--page-margin-bottom': '1.5rem',
      '--page-margin-left': '1.25rem',
      '--column-count': '2',
      '--column-gap': '2rem'
    },
    
    rules: {
      'body': {
        'text-align': 'justify',
        'column-count': 'var(--column-count)',
        'column-gap': 'var(--column-gap)'
      },
      'h1': {
        'column-span': 'all',
        'text-transform': 'uppercase',
        'letter-spacing': '0.1em'
      },
      'h2, h3': {
        'text-transform': 'uppercase',
        'letter-spacing': '0.05em',
        'font-weight': 'var(--font-weight-bold)'
      }
    },
    
    customCSS: `
      .byline {
        font-family: var(--font-family-heading);
        font-size: var(--font-size-small);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--color-text-light);
        margin-bottom: var(--spacing-lg);
      }
      
      .pull-quote {
        font-size: 1.5em;
        line-height: 1.4;
        font-style: italic;
        text-align: center;
        margin: var(--spacing-xl) 0;
        padding: var(--spacing-lg) 0;
        border-top: 2px solid var(--color-primary);
        border-bottom: 2px solid var(--color-primary);
      }
    `
  }
};
```

**Class Library:**
- Typography classes (chapter-title, subtitle, drop-cap...)
- Layout classes (sidebar, callout, note...)
- Content classes (dialogue, quote, citation...)
- Special classes (glossary, index, footnote...)

**CSS Management:**
- Visual CSS editor for book-level styles
- Code editor (syntax highlight)
- CSS validator
- eBook-safe CSS filter (chỉ properties được support)
- Import external CSS
- Export CSS
- CSS optimization (remove unused)

**Theme System:**
- Dark/Light mode
- Color schemes
- Custom variables
- Save/load themes

### 4.7. Asset Manager mở rộng

**Image Management:**
- Upload: drag-drop, paste from clipboard
- Formats: JPG, PNG, WebP, SVG, GIF
- Auto-resize cho eBook (max 1200px)
- Auto-compress (quality slider)
- Alt text editor (accessibility)
- Image cropper/editor basic
- Gallery view with preview
- Search & filter
- Usage tracking (which chapters use this image)

**Font Management:**
- Upload custom fonts (WOFF, WOFF2, TTF, OTF)
- Google Fonts integration
- Font preview
- Font subsetting
- License info display
- Fallback fonts config

**Audio/Video (Enhanced EPUB):**
- Upload MP3, M4A, OGG
- Upload MP4, WebM
- Duration display
- File size warning
- Codec compatibility check

**Storage:**
- IndexedDB cho assets lớn (unregistered users)
- Server storage cho registered users
- Base64 inline cho assets nhỏ
- External URL support
- Batch upload
- Import from URL

### 4.8. Preview Mode (Chi tiết)

**Features:**
- Real-time preview với epub.js
- Device frames (Kindle, iPad, Kobo...)
- Font size adjustment
- Day/Night mode toggle
- Page flip animation
- Search in book
- Bookmarks
- Highlights
- TOC navigation
- Progress indicator

**Device Presets:**
```javascript
devices: {
  kindle_paperwhite: {
    width: 758,
    height: 1024,
    dpi: 300,
    frame: 'kindle-frame.png'
  },
  ipad_mini: {
    width: 768,
    height: 1024,
    dpi: 264,
    frame: 'ipad-frame.png'
  },
  kobo_aura: {
    width: 758,
    height: 1024,
    dpi: 300,
    frame: 'kobo-frame.png'
  }
}
```

**Validation trong Preview:**
- CSS compatibility warnings
- Missing images
- Broken links
- Font rendering issues
- Layout problems

### 4.9. Page Management System (NEW - CRITICAL for Fixed Layout)

**Tầm quan trọng:** Fixed layout EPUB yêu cầu quản lý từng trang riêng lẻ, không phải flow-based như reflow layout. Đây là feature cốt lõi.

**Tính năng chính:**

#### 4.9.1. Page Manager
- ✅ **Pages Panel**: Hiển thị tất cả pages dưới dạng thumbnails
- ✅ **Page thumbnails**: Real-time preview của từng trang
- ✅ **Drag & drop**: Sắp xếp lại thứ tự pages
- ✅ **Page selection**: Click để chọn và edit từng page
- ✅ **Multi-page selection**: Bulk operations (delete, duplicate, apply template)
- ✅ **Page spread management**: Xử lý 2-page spreads cho landscape
- ✅ **Page numbering**: Tùy chọn hiển thị/số trang

#### 4.9.2. Page Editor
- ✅ **Canvas per page**: Mỗi page là canvas riêng với fixed dimensions
- ✅ **Viewport control**: Đặt chính xác kích thước page (px/cm/inch)
- ✅ **Grid & guides**: Snap-to-grid cho chính xác alignment
- ✅ **Rulers**: Horizontal và vertical rulers
- ✅ **Zoom controls**: Zoom in/out để edit chi tiết
- ✅ **Layer management**: Quản lý layers trong mỗi page
- ✅ **Object positioning**: Absolute positioning với precision
- ✅ **Content placement**: Drag & drop content vào chính xác vị trí

#### 4.9.3. Page Templates
- ✅ **Template library**: Templates cho different page types
  - Cover page templates
  - Chapter opening templates
  - Content templates (text-only, image-heavy)
  - Section divider templates
  - Back matter templates
- ✅ **Custom templates**: Lưu page template từ existing page
- ✅ **Template categories**: Organize by type/style
- ✅ **Apply template**: One-click apply to new/existing pages

#### 4.9.4. Master Pages
- ✅ **Master page system**: Tạo page templates reusable
- ✅ **Page elements**: Headers, footers, page numbers, backgrounds
- ✅ **Inheritance**: Child pages inherit từ master pages
- ✅ **Override capability**: Override specific elements khi cần
- ✅ **Multiple master pages**: Different masters cho different sections

#### 4.9.5. Page Size & Orientation
- ✅ **Standard sizes**: A4, A5, Letter, Legal, Custom
- ✅ **Orientation**: Portrait, Landscape, Auto
- ✅ **Units**: Pixels, inches, centimeters, points
- ✅ **DPI settings**: 72, 96, 150, 300, 600 DPI
- ✅ **Bleed settings**: Add bleed for printing
- ✅ **Margin settings**: Custom margins per page

**Data Structure cho Pages:**
```javascript
{
  bookId: 'book-uuid',
  layout: {
    type: 'fixed', // 'fixed' or 'reflow'
    defaultPageSize: {
      width: 1200,  // pixels
      height: 1600, // pixels
      unit: 'px',
      dpi: 150
    },
    orientation: 'portrait', // 'portrait', 'landscape', 'auto'
    spread: 'none', // 'none', 'portrait', 'landscape', 'both'
    bleed: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  },

  pages: [
    {
      id: 'page-uuid-1',
      pageNumber: 1,
      pageNumberVisible: true,
      pageNumberFormat: 'arabic', // 'arabic', 'roman', 'none'
      name: 'Cover Page',
      templateId: 'template-cover-01',
      masterPageId: null,
      size: {
        width: 1200,
        height: 1600
      },
      orientation: 'portrait',
      spread: 'none', // 'left', 'right', 'center', 'none'
      background: {
        type: 'color', // 'color', 'image', 'gradient'
        value: '#ffffff',
        image: null,
        opacity: 1
      },
      margins: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      },
      elements: [
        {
          id: 'element-uuid-1',
          type: 'text', // 'text', 'image', 'shape', 'table'
          position: {
            x: 100,
            y: 200,
            width: 1000,
            height: 200
          },
          content: {
            text: 'Chapter 1',
            style: {
              fontFamily: 'Playfair Display',
              fontSize: 48,
              color: '#2c3e50',
              textAlign: 'center'
            }
          },
          layer: 1,
          locked: false,
          visible: true
        }
      ],
      layers: [
        {
          id: 'layer-uuid-1',
          name: 'Background',
          visible: true,
          locked: false,
          opacity: 1,
          elements: ['element-uuid-bg-1', 'element-uuid-bg-2']
        },
        {
          id: 'layer-uuid-2',
          name: 'Content',
          visible: true,
          locked: false,
          opacity: 1,
          elements: ['element-uuid-1', 'element-uuid-2']
        }
      ],
      guides: {
        horizontal: [100, 400, 800, 1500],
        vertical: [50, 600, 1150]
      },
      metadata: {
        createdAt: '2025-01-15T10:30:00Z',
        modifiedAt: '2025-01-20T14:45:00Z',
        version: 1
      }
    }
  ],

  masterPages: [
    {
      id: 'master-uuid-1',
      name: 'Chapter Master',
      description: 'Standard chapter page with header and footer',
      pageSize: {
        width: 1200,
        height: 1600
      },
      elements: [
        {
          id: 'header-element',
          type: 'text',
          position: { x: 100, y: 30, width: 1000, height: 40 },
          content: {
            text: '{{bookTitle}}',
            style: { fontSize: 24, textAlign: 'center' }
          },
          placeholder: true // Template variable
        },
        {
          id: 'footer-element',
          type: 'text',
          position: { x: 100, y: 1560, width: 1000, height: 40 },
          content: {
            text: 'Page {{pageNumber}}',
            style: { fontSize: 14, textAlign: 'center' }
          },
          placeholder: true
        }
      ],
      variableFields: ['bookTitle', 'pageNumber', 'chapterTitle']
    }
  ],

  pageTemplates: [
    {
      id: 'template-cover-01',
      name: 'Classic Cover',
      category: 'cover',
      thumbnail: 'templates/cover-01-thumb.jpg',
      pageSize: {
        width: 1200,
        height: 1600
      },
      elements: [
        // Template elements with placeholder content
      ],
      styles: {
        // Template-specific styles
      }
    }
  ]
}
```

**UI Layout cho Fixed Layout Editor:**
```
┌─────────────────────────────────────────────────────────┐
│                   Toolbar (Top)                        │
├──────────────┬──────────────────────┬──────────────────┤
│   Pages      │                      │   Properties     │
│   Panel      │      Canvas Area     │      Panel       │
│              │                      │                  │
│ ┌──────────┐ │  ┌─────────────────┐ │  ┌────────────┐ │
│ │Cover Page│ │  │                 │ │  │Position    │ │
│ │Thumbnail │ │  │   Page Canvas   │ │  │Size        │ │
│ └──────────┘ │  │   (1200x1600)   │ │  │Style       │ │
│              │  │                 │ │  │Effects     │ │
│ ┌──────────┐ │  │                 │ │  │Layers      │ │
│ │Page 1    │ │  │  Content Here   │ │  └────────────┘ │
│ │Thumbnail │ │  │                 │ │                  │
│ └──────────┘ │  └─────────────────┘ │                  │
│              │                      │                  │
│ [+ Add Page] │  [Zoom] [Grid] [Guides]│                  │
└──────────────┴──────────────────────┴──────────────────┘
```

### 4.10. Fixed Layout Support (UPDATED)

**Fixed Layout Properties:**
```javascript
{
  layout: {
    type: 'fixed',
    viewport: {
      width: 1200,
      height: 1600
    },
    orientation: 'portrait' | 'landscape' | 'auto',
    spread: 'none' | 'portrait' | 'landscape' | 'both',
    pageSpread: {
      leftPage: 'chapter001.xhtml',
      rightPage: 'chapter002.xhtml'
    },
    viewportMeta: 'width=1200, height=1600'
  },
  rendering: {
    precision: 'high' | 'standard',
    orientationLock: false,
    fixedLayout: true
  }
}
```

**Fixed Layout Editor:**
- Visual viewport editor
- Page spread configuration
- Orientation settings
- Preview in fixed layout mode
- Device-specific viewport presets
- Zoom controls

### 4.10. User Authentication (NEW)

**Features:**
- User registration (email/password)
- Login/logout
- Password reset
- Profile management
- Social login (Google, Facebook)
- Email verification
- Remember me option
- Session management

**UI Components:**
- Login form
- Registration form
- Password reset form
- Profile settings
- Account dashboard

**Security:**
- Password hashing (bcrypt)
- JWT tokens for authentication
- Rate limiting for login attempts
- CSRF protection
- Secure password reset

### 4.11. Storage Management (UPDATED)

**Local Storage (Unregistered Users):**
- IndexedDB for book data
- LocalStorage for settings
- No server sync
- Limited by browser storage quota

**Cloud Storage (Registered Users):**
- Server-side storage for book data
- Local cache for offline access
- Sync mechanism between local and server
- Higher storage limits
- Backup and restore

**Sync Strategy:**
- Auto-sync on connection
- Conflict resolution
- Manual sync option
- Sync status indicators
- Offline mode support

### 4.12. Validation & Quality Check

**Automated Checks:**

**Structure Validation:**
- ✅ Valid EPUB package structure
- ✅ All referenced files exist
- ✅ No broken internal links
- ✅ Valid HTML5/XHTML
- ✅ Valid CSS (eBook subset)
- ✅ OPF schema validation
- ✅ NCX schema validation
- ✅ Spine continuity

**Content Validation:**
- ✅ Metadata completeness
- ✅ Language consistency
- ✅ ISBN format
- ✅ Date format
- ✅ Required pages (cover, TOC)

**Media Validation:**
- ✅ Image formats supported
- ✅ Image size warnings (too large)
- ✅ Font embedding issues
- ✅ Audio/video codec support

**Accessibility Check:**
- ✅ Alt text trên images
- ✅ Semantic HTML usage
- ✅ Heading hierarchy
- ✅ ARIA labels
- ✅ Color contrast ratio
- ✅ Screen reader compatibility

**Integration:**
- EPUBCheck API (server-side)
- Ace by DAISY (accessibility)
- Custom validators

**UI:**
- Validation panel với categorized errors/warnings
- Click vào error → jump to location
- Auto-fix cho một số lỗi common
- Export validation report

---

## 5. MVP Timeline (Tối ưu cho 4 tháng)

### 🎯 Priority Features cho MVP
**Core Features (Must-have):**
1. ✅ Book management (create, edit, delete, organize)
2. ✅ Chapter management (basic reflow support)
3. ✅ Page management cho fixed layout
4. ✅ Basic visual editor (GrapesJS)
5. ✅ Metadata editor (basic Dublin Core)
6. ✅ Asset management (images, fonts)
7. ✅ Import EPUB (basic support)
8. ✅ Export EPUB (valid output)
9. ✅ Preview mode
10. ✅ Basic validation

**Nice-to-have (Post-MVP):**
- User authentication & cloud sync
- Advanced templates
- Advanced styling
- Search & replace
- Spell check
- Version history
- Collaboration

---

## 5. DESIGN SYSTEM & UX/UI PRINCIPLES (TẬP TRUNG TUẦN 1)

### 5.1. Design Philosophy

**Core Principles:**
1. **Google Material Design 3** inspiration:
   - Dynamic color, elevation, và typography
   - Adaptive design cho mọi screen size
   - Intuitive navigation và clear visual hierarchy
   - Meaningful motion và micro-interactions

2. **GrapesJS Core Compatibility**:
   - Maintain editor functionality
   - Extend default components không replace
   - Consistent visual language với GrapesJS
   - Preserve plugin system integrity

3. **Accessibility First**:
   - WCAG 2.1 AA compliance
   - High contrast ratios
   - Keyboard navigation
   - Screen reader support

### 5.2. User Flow Architecture

**Primary User Journey:**
```
📚 Book Library (Entry Point)
  ↓ (Select/Create Book)
✏️  Editor (Main Workspace)
  ↓ (User Menu)
👤 Profile (Settings/Management)
```

**Detailed Flow Analysis:**

#### 📚 Book Library (Landing Page)
**Purpose:** Central hub cho tất cả eBook operations

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────┐
│                    Header Navigation                     │
│  [Logo] [Search...] [New Book] [Import] [Profile▼]     │
├─────────────────────────────────────────────────────────┤
│  Filters: [All] [Recent] [Templates] [Collections]      │
├──────────────┬──────────────────────┬────────────────────┤
│              │                      │                    │
│   Sidebar    │    Book Grid         │   Quick Actions    │
│   Collections│   ┌─────────────┐    │   • Create New     │
│   • Fiction  │   │ Book Card   │    │   • Import EPUB    │
│   • Non-Fic  │   │ [Thumbnail] │    │   • Browse Templates│
│   • Work     │   │ Title       │    │   • Statistics     │
│   • Personal │   │ Author      │    │                    │
│              │   │ ────────    │    │   Sort: [Date▼]    │
│   Tags       │   │ Last edited │    │   View: [Grid▼]    │
│   • Draft    │   └─────────────┘    │                    │
│   • Complete │                      │                    │
│   • Shared   │   [More books...]     │                    │
│              │                      │                    │
└──────────────┴──────────────────────┴────────────────────┘
```

**Book Card Design:**
- **Visual**: High-quality thumbnail, book cover placeholder
- **Typography**: Clean title, author metadata
- **Status indicators**: Draft/Complete sharing status
- **Actions**: Edit, duplicate, delete, export (hover reveal)
- **Accessibility**: Proper labeling, keyboard navigation

#### ✏️ Editor (Main Workspace)
**Purpose:** Professional editing environment cho eBook content

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────┐
│                    Editor Header                         │
│  [◀ Back] [Book Title] [Save] [Preview] [Export] [...] │
├──────────────┬──────────────────────┬────────────────────┤
│              │                      │                    │
│   Left       │                      │    Right           │
│   Sidebar    │      Canvas Area     │    Sidebar         │
│              │                      │                    │
│ 📑 Chapters  │   ┌─────────────────┐│  🔧 Properties     │
│ 📄 Pages     │   │                 ││  • Styles          │
│ 🎨 Templates │   │   Editing       ││  • Typography     │
│ 📁 Assets    │   │   Canvas        ││  • Layout          │
│ ⚙️ Settings  │   │                 ││  • Effects         │
│              │   └─────────────────┘│  • Components      │
│              │                      │                    │
│              │   [Zoom Controls]    │  🎯 Component     │
│              │   [Grid/Guides]      │     Library        │
│              │                      │                    │
└──────────────┴──────────────────────┴────────────────────┘
```

**Editor Features:**
- **Responsive Design**: Adapts to different screen sizes
- **Focus Mode**: Minimal distractions for writing
- **Split View**: Edit + preview side-by-side
- **Contextual Tools**: Right tools for right task
- **Keyboard Shortcuts**: Power user efficiency

#### 👤 Profile (User Management)
**Purpose:** User settings, preferences, và account management

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────┐
│                    Profile Header                        │
│              [⚙️ Settings] [🚪 Logout]                  │
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│   Profile    │            Content Area                   │
│   Navigation │                                           │
│              │  ┌─────────────────────────────────────┐ │
│ 👤 Account   │  │            User Information          │ │
│ 📚 My Books  │  │  [Avatar]    Name: [Input]         │ │
│ 📊 Statistics│  │              Email: [Input]         │ │
│ 💾 Storage   │  │              Member since: Date      │ │
│ 🔒 Privacy   │  └─────────────────────────────────────┘ │
│ ⚙️ Settings  │                                           │
│              │  ┌─────────────────────────────────────┐ │
│              │  │            Book Statistics          │ │
│              │  │  Total Books: 12                   │ │
│              │  │  Total Words: 250K                 │ │
│              │  │  Storage Used: 45MB / 1GB          │ │
│              │  └─────────────────────────────────────┘ │
│              │                                           │
└──────────────┴───────────────────────────────────────────┘
```

### 5.3. Design Tokens & Variables

**Color System (Google Material 3 inspired):**
```css
:root {
  /* Primary Colors */
  --md-sys-color-primary: #1976d2;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #e3f2fd;
  --md-sys-color-on-primary-container: #0d47a1;

  /* Secondary Colors */
  --md-sys-color-secondary: #03a9f4;
  --md-sys-color-on-secondary: #ffffff;
  --md-sys-color-secondary-container: #e1f5fe;
  --md-sys-color-on-secondary-container: #01579b;

  /* Surface Colors */
  --md-sys-color-surface: #ffffff;
  --md-sys-color-on-surface: #1c1b1f;
  --md-sys-color-surface-variant: #f5f5f5;
  --md-sys-color-on-surface-variant: #49454f;

  /* Editor-specific Colors */
  --editor-toolbar-bg: #fafafa;
  --editor-canvas-bg: #ffffff;
  --editor-sidebar-bg: #f8f9fa;
  --editor-border: #e0e0e0;

  /* Semantic Colors */
  --md-sys-color-error: #ba1a1a;
  --md-sys-color-success: #1e8e3e;
  --md-sys-color-warning: #f57c00;
  --md-sys-color-info: #0288d1;
}
```

**Typography Scale:**
```css
:root {
  /* Display Typography */
  --md-sys-typescale-display-large: 57px / 64px;
  --md-sys-typescale-display-medium: 45px / 52px;
  --md-sys-typescale-display-small: 36px / 44px;

  /* Heading Typography */
  --md-sys-typescale-headline-large: 32px / 40px;
  --md-sys-typescale-headline-medium: 28px / 36px;
  --md-sys-typescale-headline-small: 24px / 32px;

  /* Body Typography */
  --md-sys-typescale-body-large: 16px / 24px;
  --md-sys-typescale-body-medium: 14px / 20px;
  --md-sys-typescale-body-small: 12px / 16px;

  /* Label Typography */
  --md-sys-typescale-label-large: 14px / 20px;
  --md-sys-typescale-label-medium: 12px / 16px;
  --md-sys-typescale-label-small: 11px / 16px;
}
```

**Spacing System:**
```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
  --spacing-4xl: 96px;
}
```

### 5.4. Component Library Structure

**Base Components:**
- `Button`: Variants (contained, outlined, text, floating)
- `Input`: Text, email, password, search
- `Card`: Book cards, chapter cards, asset cards
- `Modal`: Dialog, confirmation, forms
- `Tooltip`: Contextual help
- `Avatar`: User avatars, book covers

**Layout Components:**
- `Header`: Navigation, breadcrumbs
- `Sidebar`: Collapsible panels
- `Grid`: Responsive book/chapter grids
- `Toolbar`: Editor actions
- `Panel`: Properties, settings, info

**Editor-specific Components:**
- `PageThumbnail`: Fixed layout page previews
- `ChapterTree`: Nested chapter navigation
- `AssetGallery`: Media management
- `StyleEditor`: Visual CSS editing
- `PropertyPanel`: Component properties

### 5.5. Animation & Micro-interactions

**Motion Principles:**
- **Natural**: Physics-based animations
- **Responsive**: Immediate feedback
- **Meaningful**: Animations serve purpose
- **Delightful**: Subtle but engaging

**Animation Examples:**
- Page transitions: 300ms ease-in-out
- Hover effects: 150ms ease-out
- Loading states: Gentle pulse animation
- Success states: Checkmark animation
- Error states: Shake animation

---

## 6. Lộ trình phát triển (Chi tiết & Realistic)

### 📅 TUẦN 1: UX/UI DESIGN SYSTEM (TẬP TRUNG CAO ĐỘ)

**🎯 Mục tiêu tuần 1: Xây dựng UX/UI chuẩn chỉnh, tuân theo GrapesJS core và Google Material Design, với flow chính: Book → Editor → Profile**

**Day 1-2: Design Foundation & Research**
- [ ] **Research Design Systems**
  - Phân tích GrapesJS UI components và design patterns
  - Nghiên cứu Google Material Design 3 principles
  - Phân tích các ứng dụng editor thành công (Figma, Canva, Notion)
  - Xác định color palette, typography, spacing systems
- [ ] **User Flow Analysis**
  - Mapping flow: Book Library → Editor → Profile
  - User journey mapping cho từng persona
  - Identify key interaction patterns
  - Define micro-interactions và animations

**Day 3-4: UI Components Design**
- [ ] **Design System Creation**
  - Color system (primary, secondary, surface, error colors)
  - Typography scale (heading, body, caption systems)
  - Spacing & layout grid system
  - Icon system và guidelines
  - Button, input, card component variants
- [ ] **Core Screen Designs**
  - **Book Library Screen**: Grid/list view, search/filter, book cards
  - **Editor Layout**: Toolbar, sidebar, canvas, properties panel
  - **Profile Screen**: User info, settings, book management
- [ ] **Responsive Design**
  - Mobile-first approach
  - Tablet adaptations
  - Desktop layouts

**Day 5-7: Interactive Prototypes**
- [ ] **High-Fidelity Prototypes**
  - Figma/Framer prototypes cho main flows
  - Interactive transitions và animations
  - Hover states, loading states, error states
  - Accessibility compliance (WCAG 2.1 AA)
- [ ] **Design Documentation**
  - Component library documentation
  - Design tokens và variables
  - Usage guidelines và best practices
  - Developer handoff specifications

**Deliverables Tuần 1:**
- ✅ **Complete Design System** (colors, typography, spacing, components)
- ✅ **High-Fidelity Mockups** cho 3 màn hình chính
- ✅ **Interactive Prototypes** cho key user flows
- ✅ **Design Documentation** và style guide
- ✅ **Responsive Designs** cho mobile/tablet/desktop
- ✅ **Accessibility Guidelines** implementation

---

### 📅 TUẦN 2-4: FRONTEND DEVELOPMENT & UI IMPLEMENTATION

**🎯 Mục tiêu: Chuyển đổi design system thành code, implement 3 trang chính**

**Week 2: Book Library Implementation**
- [ ] **Setup Development Environment**
  - Vite + React + TypeScript configuration
  - GrapesJS integration setup
  - ESLint, Prettier, Husky setup
  - Component architecture setup (Storybook)
- [ ] **Design System Implementation**
  - CSS variables và design tokens
  - Base components (Button, Input, Card, Modal)
  - Layout components (Header, Sidebar, Grid)
  - Responsive grid system
- [ ] **Book Library Development**
  - Book card components với hover effects
  - Grid/list view toggle
  - Search và filter functionality
  - Book library layout
  - Navigation components

**Week 3: Editor Implementation**
- [ ] **GrapesJS Editor Integration**
  - Custom GrapesJS theme matching design system
  - Toolbar với custom actions
  - Sidebar panel components
  - Canvas styling và theming
  - Properties panel customization
- [ ] **Editor Layout Development**
  - Header với book actions
  - Left sidebar (chapter/pages manager)
  - Right sidebar (properties/styles)
  - Bottom status bar
  - Responsive editor layouts
- [ ] **Page Management System (Fixed Layout)**
  - Page thumbnail component
  - Page grid/list view
  - Drag & drop functionality
  - Page selection và multi-selection
  - Zoom controls

**Week 4: Profile & Navigation Implementation**
- [ ] **Profile Page Development**
  - User information display
  - Settings panel
  - Book statistics dashboard
  - Account management
  - Preferences configuration
- [ ] **Navigation & Routing**
  - React Router setup
  - Navigation between Book → Editor → Profile
  - Breadcrumb navigation
  - Mobile navigation menu
  - Loading states và transitions
- [ ] **State Management**
  - Zustand store setup
  - Book store implementation
  - User store implementation
  - UI state management
  - Persistence với IndexedDB

**Deliverables Tuần 2-4:**
- ✅ **Working Book Library** với đầy đủ functionality
- ✅ **Functional Editor** với GrapesJS integration
- ✅ **Complete Profile Page** với settings
- ✅ **Navigation Flow** Book → Editor → Profile
- ✅ **Responsive Design** working trên tất cả devices
- ✅ **Component Library** reusable
- ✅ **State Management** functioning

---

### 📅 TUẦN 5-7: CORE FUNCTIONALITY & EPUB INTEGRATION

**🎯 Mục tiêu: Implement các tính năng EPUB core, import/export, và validation**

**Week 5: EPUB Import/Export System**
- [ ] **EPUB Parser Development**
  - JSZip integration cho EPUB extraction
  - Container.xml và OPF parsing
  - Chapter content extraction
  - Metadata parsing (Dublin Core)
  - Asset extraction (images, fonts, CSS)
  - Fixed layout detection và parsing
- [ ] **Import Functionality**
  - File upload interface
  - Progress indicators
  - Error handling và recovery
  - Import validation
  - Book library integration
- [ ] **EPUB Builder Development**
  - mimetype generation
  - Container.xml creation
  - OPF manifest generation
  - Spine ordering
  - NCX/NAV generation
  - Asset packaging

**Week 6: Content Management & Validation**
- [ ] **Chapter Management**
  - Chapter CRUD operations
  - Chapter tree component
  - Drag & drop reordering
  - Nested chapters support
  - Chapter templates
  - Word count và reading time
- [ ] **Asset Management**
  - Image upload (drag-drop, paste)
  - Image gallery với preview
  - Font management system
  - Google Fonts integration
  - Asset optimization
  - Usage tracking
- [ ] **Validation System**
  - HTML validation
  - CSS validation (eBook subset)
  - Structure validation
  - Accessibility checking
  - EPUBCheck integration

**Week 7: Style Management & Templates**
- [ ] **Style Manager**
  - Book-level style editor
  - Visual CSS editor
  - Style presets (Novel, Textbook, etc.)
  - CSS variables system
  - Custom CSS support
  - Style inheritance
- [ ] **Template System**
  - Page templates (cover, content, back matter)
  - Master page system
  - Template gallery UI
  - Template application
  - Custom template creation
  - Template variables
- [ ] **Preview System**
  - epub.js integration
  - Device frame selection
  - Real-time preview
  - Navigation controls
  - Fixed layout preview

**Deliverables Tuần 5-7:**
- ✅ **Full EPUB Import/Export** working
- ✅ **Chapter Management** system
- ✅ **Asset Management** functionality
- ✅ **Validation System** comprehensive
- ✅ **Style Management** with presets
- ✅ **Template System** operational
- ✅ **Preview Mode** functional

---

### 📅 TUẦN 8-10: ADVANCED FEATURES & POLISH

**🎯 Mục tiêu: Hoàn thiện tính năng nâng cao, tối ưu performance và chuẩn bị launch**

**Week 8: Advanced Features**
- [ ] **Search & Replace**
  - Text search interface
  - Regex support
  - Search scope selection
  - Replace functionality
  - Search history
- [ ] **User Authentication** (Post-MVP Option)
  - Login/registration forms
  - JWT token management
  - Profile management
  - Social login options
- [ ] **Cloud Sync** (Post-MVP Option)
  - Server API integration
  - Sync mechanism
  - Conflict resolution
  - Offline mode

**Week 9: Performance & Polish**
- [ ] **Performance Optimization**
  - Code splitting
  - Lazy loading
  - Memory optimization
  - Bundle size optimization
  - Caching strategies
  - Large file handling
- [ ] **UI/UX Polish**
  - Animation refinement
  - Loading states
  - Error states
  - Empty states
  - Micro-interactions
  - Accessibility improvements
- [ ] **Testing & Debugging**
  - Unit tests (Vitest)
  - Integration tests
  - E2E tests (Playwright)
  - Cross-browser testing
  - Performance testing

**Week 10: Documentation & Launch Preparation**
- [ ] **Documentation**
  - User guide
  - API documentation
  - Component documentation
  - Troubleshooting guide
  - FAQ
- [ ] **Launch Preparation**
  - Production build optimization
  - Error tracking setup
  - Analytics integration
  - Deployment configuration
  - Beta testing coordination
  - Marketing materials

**Deliverables Tuần 8-10:**
- ✅ **Advanced Features** implemented
- ✅ **Performance Optimized**
- ✅ **Professional UI/UX**
- ✅ **Comprehensive Testing**
- ✅ **Complete Documentation**
- ✅ **Production Ready**

---

**Sprint 2.1: User Authentication (1.5 tuần)**
- [ ] Implement authentication service
- [ ] Create login/registration UI
- [ ] Setup JWT token management
- [ ] Implement password reset
- [ ] Create user profile management
- [ ] Add social login options
- [ ] Implement session management

**Sprint 2.2: Storage Management (1.5 tuần)**
- [ ] Implement local storage service
- [ ] Implement cloud storage service
- [ ] Create sync mechanism
- [ ] Add storage quota management
- [ ] Implement offline mode
- [ ] Create storage settings UI
- [ ] Add backup/restore functionality

**Deliverables:**
- ✅ User authentication system
- ✅ Dual storage system (local/cloud)
- ✅ Sync mechanism working
- ✅ Offline mode support

---

### 📅 PHASE 3: Content Management (4 tuần)

**Sprint 3.1: Advanced Book Manager (1 tuần)**
- [ ] Implement book collections
- [ ] Add book sharing functionality
- [ ] Implement book statistics
- [ ] Add bulk operations
- [ ] Create book import/export
- [ ] Implement book templates
- [ ] Add book versioning

**Sprint 3.2: Chapter & Page Manager (1.5 tuần)**
- [ ] Create chapter data structure
- [ ] Implement chapter tree UI
- [ ] Add/delete/rename chapters
- [ ] Drag & drop reordering
- [ ] Nested chapters (parts/sections)
- [ ] Chapter status system
- [ ] Chapter templates
- [ ] Copy/duplicate chapters
- [ ] Word count & reading time
- [ ] Chapter search/filter
- [ ] Bulk operations

**Page Management System (Fixed Layout)**
- [ ] Create page data structure
- [ ] Implement page manager UI with thumbnails
- [ ] Add/delete/duplicate pages
- [ ] Drag & drop page reordering
- [ ] Page selection and multi-selection
- [ ] Page numbering system
- [ ] Page spread management
- [ ] Page size and orientation settings
- [ ] Zoom controls for page editor
- [ ] Grid and guides system

**Sprint 3.3: Metadata Editor (1 tuần)**
- [ ] Create metadata form UI
- [ ] Dublin Core fields
- [ ] Extended metadata fields
- [ ] Cover image uploader
- [ ] ISBN validator
- [ ] Language selector (ISO 639)
- [ ] Date picker (ISO 8601)
- [ ] Metadata presets (fiction, non-fiction...)
- [ ] Auto-fill từ existing EPUB

**Sprint 3.4: Block Manager (0.5 tuần)**
- [ ] Create custom eBook blocks
  - Chapter title
  - Scene break
  - Pull quote
  - Sidebar/callout
  - Footnote
  - Image with caption
  - Dialogue
  - Poetry/verse
  - Code block
  - Table
- [ ] Block categories
- [ ] Block search
- [ ] Custom block creator

**Sprint 3.5: Fixed Layout Features (0.5 tuần)**
- [ ] Fixed layout detection and setup
- [ ] Layout type selector (reflow vs fixed)
- [ ] Viewport settings configuration
- [ ] Page orientation management
- [ ] Basic page editor with absolute positioning
- [ ] Element positioning tools
- [ ] Layer management UI
- [ ] Rulers and measurements

**Deliverables:**
- ✅ Hoàn chỉnh book management
- ✅ Hoàn chỉnh chapter management
- ✅ Page management system working
- ✅ Basic fixed layout support
- ✅ Metadata system working
- ✅ Rich block library

---

### 📅 PHASE 4: Style & Asset Management (3 tuần)

**Sprint 4.1: Style Manager (1 tuần)**
- [ ] Implement book-level style editor
- [ ] Create visual CSS editor
- [ ] Implement style presets
- [ ] Add theme system
- [ ] Create class library
- [ ] Implement CSS optimization
- [ ] Add CSS validation
- [ ] Import/export CSS

**Sprint 4.2: Page Templates & Master Pages (1 tuần)**
- [ ] Create page template system
- [ ] Build template library UI
- [ ] Implement page categories (cover, content, back matter)
- [ ] Create master page system
- [ ] Template inheritance mechanism
- [ ] Template variable system
- [ ] Apply template to pages
- [ ] Save custom templates
- [ ] Template preview system

**Sprint 4.3: Asset Manager (1 tuần)**
- [ ] Create asset library UI
- [ ] Image upload (drag-drop, paste)
- [ ] Image gallery với preview
- [ ] Image optimization pipeline
  - Auto-resize
  - Compression
  - Format conversion (WebP)
- [ ] Image editor basic (crop, rotate)
- [ ] Alt text editor
- [ ] Font uploader
- [ ] Font preview
- [ ] Google Fonts integration
- [ ] Asset usage tracking
- [ ] Search & filter assets
- [ ] Batch operations

**Deliverables:**
- ✅ Advanced styling capabilities
- ✅ Page templates & master pages system
- ✅ Asset management functional
- ✅ Style presets library

---

### 📅 PHASE 5: Import/Export EPUB (4 tuần)

**Sprint 5.1: EPUB Parser (1.5 tuần)**
- [ ] Implement EPUBParser class
- [ ] Parse container.xml
- [ ] Parse content.opf
  - Extract metadata
  - Parse manifest
  - Parse spine
  - Parse guide (EPUB 2)
- [ ] Parse toc.ncx (EPUB 2)
- [ ] Parse nav.xhtml (EPUB 3)
- [ ] Extract chapters HTML
- [ ] Extract book-level CSS files
- [ ] Extract chapter-specific CSS files
- [ ] Extract images
- [ ] Extract fonts
- [ ] Handle both EPUB 2 & 3
- [ ] Handle Fixed Layout properties
- [ ] Parse page spreads and viewport settings
- [ ] Extract page-specific positioning
- [ ] Handle master pages if present
- [ ] Convert to internal page structure
- [ ] Error handling & recovery

**Sprint 5.2: Import Functionality (1 tuần)**
- [ ] File selector UI
- [ ] Loading progress indicator
- [ ] Validate EPUB structure
- [ ] Unzip with JSZip
- [ ] Parse metadata → populate form
- [ ] Load chapters → GrapesJS canvas
- [ ] Load book styles → style manager
- [ ] Load assets → asset library
- [ ] Build chapter tree
- [ ] Detect layout type (fixed/reflow)
- [ ] Extract fixed layout properties
- [ ] Build page structure for fixed layout
- [ ] Generate page thumbnails
- [ ] Setup page manager for imported book
- [ ] Handle errors gracefully
- [ ] Import report (warnings/issues)

**Sprint 5.3: EPUB Builder (1.5 tuần)**
- [ ] Implement EPUBBuilder class
- [ ] Generate mimetype
- [ ] Generate container.xml
- [ ] Generate content.opf
  - Metadata section
  - Manifest section
  - Spine section
  - Guide section (optional)
- [ ] Generate toc.ncx (EPUB 2)
- [ ] Generate nav.xhtml (EPUB 3)
- [ ] Generate chapter XHTML files
- [ ] Handle book-level CSS files
- [ ] Handle chapter-specific CSS files
- [ ] Handle page-specific CSS for fixed layout
- [ ] Handle images
- [ ] Handle fonts
- [ ] Handle fixed layout properties
- [ ] Generate page XHTML for fixed layout
- [ ] Handle page spreads in output
- [ ] Handle master pages in output
- [ ] HTML sanitization
- [ ] CSS sanitization
- [ ] Package với JSZip
- [ ] Proper mimetype handling (uncompressed)

**Sprint 5.4: Export Functionality (1 tuần)**
- [ ] Export dialog UI
- [ ] EPUB version selector (2 or 3)
- [ ] Export options
  - Include fonts
  - Optimize images
  - Minify CSS/HTML
  - Embed styles vs external
- [ ] Progress indicator
- [ ] Pre-export validation
- [ ] Generate EPUB file
- [ ] Download functionality
- [ ] Export history
- [ ] Export templates (settings)

**Deliverables:**
- ✅ Full EPUB import working
- ✅ Full EPUB export working
- ✅ Support EPUB 2 & 3
- ✅ Support for fixed and reflow layouts
- ✅ Proper error handling

---

### 📅 PHASE 6: Validation & Quality (2 tuần)

**Sprint 6.1: Validators (1 tuần)**
- [ ] HTML validator
- [ ] CSS validator (eBook subset)
- [ ] Structure validator
  - Package integrity
  - Required files
  - Manifest completeness
  - Spine order
- [ ] Link checker (internal)
- [ ] Image checker
  - Format support
  - Size warnings
  - Missing images
- [ ] Font checker
- [ ] Metadata validator
- [ ] Accessibility checker
  - Alt text
  - Semantic HTML
  - Heading hierarchy
  - ARIA labels
  - Color contrast

**Sprint 6.2: Validation UI & Integration (1 tuần)**
- [ ] Validation panel UI
- [ ] Real-time validation
- [ ] Error categorization
  - Errors (must fix)
  - Warnings (should fix)
  - Info (suggestions)
- [ ] Click to jump to issue
- [ ] Auto-fix common issues
- [ ] Validation report export
- [ ] EPUBCheck integration (server API)
- [ ] Ace accessibility integration
- [ ] Pre-export validation gate

**Deliverables:**
- ✅ Comprehensive validation system
- ✅ Accessibility checking
- ✅ User-friendly error reporting

---

### 📅 PHASE 7: Preview & Testing (2 tuần)

**Sprint 7.1: Preview Implementation (1 tuần)**
- [ ] Integrate epub.js
- [ ] Preview panel/modal
- [ ] Device frame selection
- [ ] Device-specific rendering
- [ ] Font size adjustment
- [ ] Day/Night mode
- [ ] Page navigation
- [ ] TOC navigation
- [ ] Search in preview
- [ ] Bookmark functionality
- [ ] Highlight functionality
- [ ] Notes functionality
- [ ] Progress tracking
- [ ] Fixed layout preview

**Sprint 7.2: Testing & Debugging (1 tuần)**
- [ ] Write unit tests
  - EPUBParser tests
  - EPUBBuilder tests
  - Validators tests
  - Utilities tests
  - Book manager tests
  - Auth tests
- [ ] Write integration tests
  - Import flow
  - Export flow
  - Chapter management
  - Book management
  - Storage sync
- [ ] Write E2E tests
  - Complete workflow
  - User scenarios
  - Authentication flow
- [ ] Cross-browser testing
- [ ] Performance testing
- [ ] Memory leak detection
- [ ] Bug fixes

**Deliverables:**
- ✅ Full preview functionality
- ✅ Comprehensive test coverage
- ✅ Stable, tested codebase

---

### 📅 PHASE 8: Additional Features (2 tuần)

**Sprint 8.1: Template System (1 tuần)**
- [ ] Template data structure
- [ ] Template parser
- [ ] Variable replacement system
- [ ] Conditional sections
- [ ] Template gallery UI
- [ ] Template preview
- [ ] Apply template to project
- [ ] Template categories
- [ ] Create default templates
- [ ] Save custom templates
- [ ] Import/export templates

**Sprint 8.2: Search & Replace (1 tuần)**
- [ ] Search UI (floating panel)
- [ ] Text search
- [ ] Regex search
- [ ] Case options
- [ ] Whole word option
- [ ] Search scope (chapter, all, metadata)
- [ ] Results list
- [ ] Navigation between results
- [ ] Replace functionality
- [ ] Replace preview
- [ ] Search history

**Deliverables:**
- ✅ Template system working
- ✅ Search & replace working

---

### 📅 PHASE 9: Polish & Optimization (2 tuần)

**Sprint 9.1: UI/UX Polish (1 tuần)**
- [ ] Refine all UI components
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error states
- [ ] Improve animations
- [ ] Improve feedback messages
- [ ] Improve tooltips
- [ ] Improve accessibility
- [ ] Responsive design fixes
- [ ] Dark/Light theme polish
- [ ] Book library UI polish
- [ ] Authentication flow polish

**Sprint 9.2: Performance Optimization (1 tuần)**
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Asset optimization
- [ ] IndexedDB optimization
- [ ] Server optimization
- [ ] Memory optimization
- [ ] Bundle size optimization
- [ ] Rendering optimization
- [ ] Large file handling
- [ ] Caching strategies
- [ ] Progressive loading
- [ ] Sync performance optimization

**Deliverables:**
- ✅ Polished, professional UI
- ✅ Optimized performance
- ✅ Smooth user experience

---

### 📅 PHASE 10: Documentation & Launch (1 tuần)

**Sprint 10.1: Documentation (0.5 tuần)**
- [ ] User guide
- [ ] Video tutorials
- [ ] API documentation
- [ ] Plugin development guide
- [ ] EPUB structure guide
- [ ] Troubleshooting guide
- [ ] FAQ
- [ ] Changelog
- [ ] Contributing guide
- [ ] Code comments
- [ ] Book management guide
- [ ] User accounts guide

**Sprint 10.2: Launch Preparation (0.5 tuần)**
- [ ] Final testing
- [ ] Performance audit
- [ ] Security audit
- [ ] Browser compatibility check
- [ ] Create demo site
- [ ] Setup analytics
- [ ] Setup error tracking
- [ ] Create landing page
- [ ] Prepare marketing materials
- [ ] Deploy to production
- [ ] Server setup and configuration

**Deliverables:**
- ✅ Complete documentation
- ✅ Production-ready app
- ✅ Public launch

---

## 6. Technical Considerations (BỔ SUNG)

### 6.1. Browser Compatibility

**Target Browsers:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Polyfills needed:**
- IndexedDB
- Blob API
- FileReader API
- Async/Await (transpiled)

### 6.2. Performance Targets

**Metrics:**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Large EPUB import: < 10s for 10MB
- Export speed: < 5s for typical book
- Memory usage: < 500MB for large projects
- Sync time: < 30s for typical book
- Page thumbnail generation: < 0.5s per page
- Fixed layout canvas render: < 100ms

**Optimization strategies:**
- Virtual scrolling for large book lists
- Lazy loading for images and pages
- Web Workers for heavy processing (EPUB parsing, thumbnail generation)
- RequestIdleCallback for non-critical tasks
- Debouncing/throttling for frequent updates
- Incremental sync for large projects
- Canvas optimization for fixed layout editor
- Efficient page rendering with virtualization

### 6.3. Storage Limits

**IndexedDB:**
- Chrome: ~60% of free disk space
- Firefox: ~50% of free disk space
- Safari: ~1GB
- Strategy: Implement quota management & warnings

**LocalStorage:**
- 5-10MB limit
- Use only for settings & preferences

**Server Storage:**
- Configurable per user limits
- Tiered storage plans
- Compression for large files

### 6.4. Security Considerations

**Input Sanitization:**
- Sanitize HTML từ import
- Sanitize CSS
- Sanitize file names
- Validate file types
- Limit file sizes

**XSS Prevention:**
- Content Security Policy
- DOMPurify for HTML sanitization
- Escape user input

**File Security:**
- Validate EPUB structure
- Check for malicious scripts
- Sandbox iframe cho preview

**Authentication Security:**
- Password hashing (bcrypt)
- JWT token security
- Rate limiting
- CSRF protection
- Secure password reset

### 6.5. Accessibility Requirements

**WCAG 2.1 Level AA:**
- Keyboard navigation đầy đủ
- Screen reader support
- Color contrast minimum 4.5:1
- Focus indicators
- ARIA labels
- Alt text for images
- Semantic HTML

### 6.6. Error Handling Strategy

**Error Categories:**
1. **User Errors**: Invalid input, missing required fields
2. **System Errors**: Storage full, browser incompatible
3. **Network Errors**: API failures, timeout
4. **Data Errors**: Corrupted files, invalid EPUB
5. **Sync Errors**: Conflict resolution, connection issues

**Handling:**
- User-friendly error messages
- Recovery suggestions
- Error logging (Sentry)
- Fallback behaviors
- Graceful degradation
- Sync conflict resolution

### 6.7. Testing Strategy

**Unit Tests (70% coverage):**
- All utilities
- All services
- Core plugins
- Validators
- Book manager
- Authentication

**Integration Tests (50% coverage):**
- Import/Export flow
- Chapter management
- Book management
- Asset management
- Validation flow
- Storage sync
- Authentication flow

**E2E Tests (Critical paths):**
- Create new eBook
- Import existing EPUB
- Edit content
- Export EPUB
- Preview
- User registration/login
- Book library management
- Sync functionality

**Performance Tests:**
- Large file handling
- Memory leaks
- Concurrent operations
- Sync performance

**Cross-browser Tests:**
- Chrome, Firefox, Safari, Edge
- Desktop + Mobile

---

## 7. Deployment Strategy (BỔ SUNG)

### 7.1. Development Environment
```
dev.ebook-editor.com
- Latest features
- Debugging enabled
- Test data
- Analytics sandbox
- Local storage only
```

### 7.2. Staging Environment
```
staging.ebook-editor.com
- Production build
- Final testing
- Demo site
- Client preview
- Full authentication
- Server storage
```

### 7.3. Production Environment
```
app.ebook-editor.com
- Optimized build
- CDN for assets
- Error tracking
- Analytics
- Monitoring
- Full authentication
- Server storage
- Backup systems
```

### 7.4. CI/CD Pipeline

```yaml
Workflow:
1. Push to branch
   ↓
2. Run linting
   ↓
3. Run unit tests
   ↓
4. Build project
   ↓
5. Run E2E tests
   ↓
6. Deploy to staging (on merge to develop)
   ↓
7. Manual approval
   ↓
8. Deploy to production (on merge to main)
   ↓
9. Post-deployment tests
```

### 7.5. Monitoring & Analytics

**Metrics to track:**
- User engagement
- Feature usage
- Error rates
- Performance metrics
- Conversion rates
- Storage usage
- Sync success rates
- User registration/conversion

**Tools:**
- Google Analytics / Plausible
- Sentry for errors
- LogRocket for session replay
- Lighthouse CI for performance
- Server monitoring tools

---

## 8. Resource Planning (BỔ SUNG)

### 8.1. Team Structure (Recommended)

**Minimum Team:**
- 1x Frontend Developer (React/Vue + GrapesJS)
- 1x Backend Developer (Node.js) - full-time
- 1x UI/UX Designer - part-time
- 1x QA Tester - part-time

**Ideal Team:**
- 2x Frontend Developers
- 1x Backend Developer
- 1x UI/UX Designer
- 1x QA Engineer
- 1x Technical Writer
- 1x Project Manager

### 8.2. Time Estimates

**Realistic Timeline:**
- **Phase 0**: 1 week
- **Phase 1**: 3 weeks
- **Phase 2**: 3 weeks
- **Phase 3**: 4 weeks
- **Phase 4**: 3 weeks
- **Phase 5**: 4 weeks
- **Phase 6**: 2 weeks
- **Phase 7**: 2 weeks
- **Phase 8**: 2 weeks
- **Phase 9**: 2 weeks
- **Phase 10**: 1 week

**Total: 27 weeks (~6.5 months)** với 1 full-time frontend + 1 part-time backend

**With 2 developers: ~4.5 months**

### 8.3. Budget Estimation (Ballpark)

**Development:**
- Frontend Developer: $50-100/hour × 1200 hours = $60-120K
- Backend Developer: $50-100/hour × 400 hours = $20-40K
- UI/UX Designer: $50-80/hour × 150 hours = $7.5-12K
- QA: $40-60/hour × 200 hours = $8-12K

**Infrastructure:**
- Domain: $20/year
- Hosting: $100-300/month
- CDN: $50-100/month
- Database: $50-200/month
- Error tracking: $50/month
- Analytics: Free-$50/month

**Total development cost: $95.5-182K**

**SaaS model revenue needed:**
- Break-even: ~300-600 users @ $20/month
- Profitable: 800+ users

---

## 9. Risk Management (BỔ SUNG)

### 9.1. Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Browser compatibility issues | High | Medium | Early testing, polyfills |
| Performance with large files | High | High | Optimization, chunking |
| IndexedDB quota limits | Medium | Medium | Quota management, warnings |
| EPUB standard complexity | High | High | Thorough research, testing |
| Third-party library issues | Medium | Low | Careful selection, alternatives |
| Security vulnerabilities | High | Low | Code review, sanitization |
| Sync conflicts | High | Medium | Conflict resolution strategies |
| Server scalability | Medium | Medium | Scalable architecture, monitoring |

### 9.2. Project Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Scope creep | High | High | Clear requirements, phased approach |
| Resource constraints | High | Medium | Realistic planning, prioritization |
| Technical debt | Medium | High | Code reviews, refactoring sprints |
| Team turnover | High | Low | Documentation, knowledge sharing |
| Market competition | Medium | Medium | Unique features, quality focus |
| User adoption | High | Medium | User research, marketing |
| Storage costs | Medium | Medium | Tiered pricing, optimization |

### 9.3. Contingency Plans

**If timeline slips:**
- Cut Phase 8 features → post-launch
- Reduce template library
- Simplify UI polish
- Focus on MVP features only
- Implement basic sync only

**If performance issues:**
- Implement progressive loading
- Add virtual scrolling
- Optimize critical path only
- Consider Web Workers
- Optimize sync strategy

**If compatibility issues:**
- Focus on Chrome/Edge initially
- Add browser requirements warning
- Graceful degradation for unsupported features

**If storage costs high:**
- Implement compression
- Optimize asset handling
- Implement tiered storage plans
- Add storage quotas

---

## 10. Success Metrics (BỔ SUNG)

### 10.1. Launch Criteria

**Must Have:**
- ✅ Import EPUB 2 & 3
- ✅ Export valid EPUB 3
- ✅ Book management working
- ✅ Chapter management working
- ✅ Metadata editor functional
- ✅ Asset management functional
- ✅ Style management functional
- ✅ Preview mode working
- ✅ Validation passing EPUBCheck
- ✅ User authentication working
- ✅ Dual storage system (local/cloud)
- ✅ Sync functionality
- ✅ Zero critical bugs
- ✅ Documentation complete
- ✅ Performance targets met

**Nice to Have (can be post-launch):**
- Templates library
- Advanced search/replace
- Spell check
- Version history
- Collaboration features
- AI assistant

### 10.2. Success KPIs

**Technical:**
- EPUBCheck pass rate: > 95%
- Bug severity: < 5 critical bugs/month
- Performance: < 3s load time
- Uptime: > 99.5%
- Sync success rate: > 95%

**User:**
- User retention: > 40% after 30 days
- Daily active users: Target based on market
- Average session time: > 15 minutes
- Feature adoption: > 60% for core features
- Registration conversion: > 15%
- Storage upgrade conversion: > 5%

**Business:**
- User acquisition cost: < $20
- Lifetime value: > $100
- Churn rate: < 5%/month
- Net Promoter Score: > 50

---

## 11. Post-Launch Roadmap (BỔ SUNG)

### 11.1. Version 1.1 (Month 1-2 after launch)
- Bug fixes từ user feedback
- Performance improvements
- Additional templates
- UI/UX improvements
- Mobile responsiveness
- Localization (i18n) preparation
- Sync performance improvements

### 11.2. Version 1.2 (Month 3-4)
- Advanced search/replace
- Spell check system
- Version history
- More export formats (PDF preview)
- Template marketplace
- Batch operations
- Enhanced collaboration features

### 11.3. Version 2.0 (Month 6-9)
- Real-time co-editing
- Comments & annotations
- Advanced AI assistant
- Mobile app (React Native)
- Advanced analytics
- Enterprise features (SSO, admin panel)

### 11.4. Future Considerations
- Electron desktop app
- WordPress plugin
- Browser extension
- API for third-party integrations
- White-label solution
- Advanced publishing workflow

---

## 12. Alternative Approaches (BỔ SUNG)

### 12.1. MVP-First Approach

**Nếu cần launch nhanh (2.5 months):**

**Phase 1: Core Editor** (2 weeks)
- Basic GrapesJS setup
- Simple book management
- Simple chapter management
- Basic metadata

**Phase 2: Import/Export** (3 weeks)
- Simple EPUB import
- Basic EPUB export
- Validation cơ bản

**Phase 3: User System** (2 weeks)
- Basic authentication
- Local storage only
- No sync

**Phase 4: Polish** (3 weeks)
- UI improvements
- Bug fixes
- Documentation
- Launch beta

**Then iterate** based on feedback

### 12.2. Template-First Approach

**Nếu target non-technical users:**

Focus on:
1. Rich template library
2. Simple customization
3. Minimal technical exposure
4. Guided workflows
5. Pre-made styles
6. Simple book management

De-emphasize:
- Advanced CSS editing
- Complex layouts
- Technical validation details
- Advanced sync features

### 12.3. Professional Tool Approach

**Nếu target publishers/professionals:**

Focus on:
1. Advanced features
2. Batch processing
3. Automation
4. Integration with existing tools
5. Advanced validation
6. Compliance features
7. Advanced collaboration
8. Advanced analytics

Add:
- API access
- CLI tools
- Plugins system
- Advanced scripting
- Enterprise features

---

## 13. Competitive Analysis (BỔ SUNG)

### 13.1. Existing Solutions

**Sigil:**
- ✅ Mature, stable
- ✅ Free, open-source
- ❌ Desktop only
- ❌ Outdated UI
- ❌ Steep learning curve
- ❌ No cloud storage

**Calibre:**
- ✅ Comprehensive
- ✅ Format conversion
- ❌ Complex for beginners
- ❌ Not focused on creation
- ❌ Limited collaboration

**Reedsy Book Editor:**
- ✅ Beautiful UI
- ✅ Cloud-based
- ❌ Limited EPUB control
- ❌ Subscription required
- ❌ No local storage option

**Vellum:**
- ✅ Excellent output
- ✅ Great UX
- ❌ Mac only
- ❌ Expensive ($250+)
- ❌ No web-based option

### 13.2. Our Competitive Advantages

**Unique Value Props:**
1. **Web-based** - Works anywhere, no installation
2. **Visual editing** - GrapesJS WYSIWYG
3. **Modern UI** - Contemporary, intuitive design
4. **Dual storage** - Local for casual users, cloud for professionals
5. **Open/Free option** - Local storage without registration
6. **Template system** - Quick start with presets
7. **Real-time validation** - Catch errors early
8. **Preview mode** - See exactly how it looks
9. **Asset management** - Centralized media library
10. **Fixed layout support** - Advanced layout options

---

## 14. Kết luận (UPDATED)

### 14.1. Key Success Factors

1. **Focus on UX** - Make EPUB creation accessible
2. **Validation first** - Ensure output quality
3. **Performance** - Handle large books smoothly
4. **Documentation** - Help users succeed
5. **Iteration** - Launch MVP, improve based on feedback
6. **Storage flexibility** - Support both local and cloud storage
7. **User onboarding** - Smooth registration and first book creation

### 14.2. Critical Path

```
1. Solid foundation (Phase 1-2)
   ↓
2. Book and chapter management (Phase 3)
   ↓
3. Style and asset management (Phase 4)
   ↓
4. Import/Export working (Phase 5)
   ↓
5. Validation system (Phase 6)
   ↓
6. Preview functionality (Phase 7)
   ↓
7. Polish & optimize (Phase 9)
   ↓
8. Launch (Phase 10)
   ↓
9. Iterate based on feedback
```

### 14.3. Recommendation

**Phased Approach (Updated for Page Management):**

**Phase 1: Foundation (Months 1-2)**
- Editor setup with GrapesJS
- Basic book management
- Chapter management (reflow)
- **Page management system (fixed layout)** ← CRITICAL
- Basic metadata editor

**Phase 2: Core Features (Month 3)**
- Asset management
- Import/Export EPUB
- Preview functionality
- Basic validation

**Phase 3: Polish & Launch (Month 4)**
- UI/UX improvements
- Performance optimization
- Bug fixes & testing
- Documentation

**MVP Features** (Launch-critical):
- ✅ Book management
- ✅ Chapter management (reflow)
- ✅ **Page management (fixed layout)** ← NEW & CRITICAL
- ✅ Import EPUB
- ✅ Edit content visually (both reflow & fixed)
- ✅ Edit metadata
- ✅ Manage assets
- ✅ Basic style management
- ✅ Export valid EPUB
- ✅ Basic validation
- ✅ Preview
- ✅ Local storage (IndexedDB)

**Post-MVP** (Can add later):
- User authentication & cloud sync
- Advanced templates & master pages
- Advanced styling
- Search/replace
- Spell check
- Version history
- Collaboration
- AI features

---

## 15. Getting Started Checklist

### Week 1: Foundation
- [ ] Create GitHub repository
- [ ] Setup development environment
- [ ] Install GrapesJS and dependencies
- [ ] Create project structure
- [ ] Setup Vite build system
- [ ] Implement basic editor layout
- [ ] Create custom theme

### Week 2-3: Core Features
- [ ] Implement book manager plugin
- [ ] Create book library UI
- [ ] Implement chapter manager plugin
- [ ] **Create page manager plugin** ← CRITICAL for fixed layout
- [ ] **Build page editor with canvas** ← CRITICAL for fixed layout
- [ ] Create metadata editor
- [ ] Build asset manager
- [ ] Setup basic storage system (IndexedDB)

### Week 4: Import/Export
- [ ] Build EPUB parser (with page support)
- [ ] Build EPUB builder (with page support)
- [ ] Implement import functionality
- [ ] Implement export functionality
- [ ] Test with various EPUB files

### Week 5: Style & Validation
- [ ] Implement basic style manager
- [ ] Add validation system
- [ ] Create preview mode (with page rendering)
- [ ] **Test fixed layout import/export**
- [ ] Fix bugs

### Week 6: Page Templates
- [ ] Create basic page templates
- [ ] Implement master pages (basic)
- [ ] Add template gallery UI
- [ ] Test template system

### Week 7-8: Polish & Testing
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] **Optimize page rendering performance**
- [ ] Final testing
- [ ] Write documentation
- [ ] Prepare for beta launch

**Note:** User authentication & cloud sync moved to Post-MVP

---

📧 **Contact:** [Your Email]  
🌐 **Website:** [Your Website]  
📚 **Docs:** [Documentation URL]  
🐛 **Issues:** [GitHub Issues URL]

---

**Last Updated:** 2025-01-15  
**Version:** 2.1  
**Status:** Ready for Development ✅