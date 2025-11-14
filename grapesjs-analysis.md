# 📋 GRAPESJS PANELS & LAYOUT ANALYSIS

## 🔍 GRAPESJS DEFAULT STRUCTURE

Based on the official demo and documentation, GrapesJS comes with a **3-panel layout** that's optimized for visual web building:

### **Default Layout Structure**
```
┌─────────────────────────────────────────────────────────┐
│                    Toolbar (Top)                        │
├──────────────┬──────────────────────┬──────────────────┤
│              │                      │                  │
│   Left       │                      │    Right         │
│   Panel      │      Canvas Area     │    Panel         │
│              │                      │                  │
│ Components   │                      │   Layers         │
│ Blocks       │    [Drag & Drop]     │   Styles         │
│ Assets       │                      │   Traits         │
│              │                      │   Properties     │
└──────────────┴──────────────────────┴──────────────────┘
```

---

## 📚 DEFAULT PANELS

### 1. **Left Panel - Components & Assets**
**Purpose:** Drag & drop elements into canvas

**Built-in Panels:**
- **Blocks**: Pre-designed component groups
  - [ ] Basic blocks (text, image, link)
  - [ ] Form blocks (input, button, select)
  - [ ] Media blocks (image, video, map)
  - [ ] Component blocks (navigation, cards)

- **Components**: Individual HTML elements
  - [ ] Text elements (headings, paragraphs)
  - [ ] Media elements (images, videos)
  - [ ] Form elements (inputs, buttons)
  - [ ] Structure elements (containers, sections)

- **Assets**: Media library
  - [ ] Image upload
  - [ ] Image gallery
  - [ ] File manager

### 2. **Right Panel - Properties & Settings**
**Purpose:** Element selection, styling, and configuration

**Built-in Panels:**
- **Layers**: Document structure tree
  - [ ] Hierarchical view
  - [ ] Component selection
  - [ ] Drag to reorder
  - [ ] Show/hide elements

- **Style**: Visual CSS editor
  - [ ] Typography settings
  - [ ] Colors & backgrounds
  - [ ] Borders & shadows
  - [ ] Spacing & sizing
  - [ ] Positioning
  - [ ] Transitions

- **Traits**: Component properties
  - [ ] Text content
  - [ ] Link URLs
  - [ ] Image sources
  - [ ] Custom attributes

- **Properties**: Advanced settings
  - [ ] Component ID
  - [ ] CSS classes
  - [ ] Custom attributes
  - [ ] Visibility settings

### 3. **Top Panel - Toolbar**
**Purpose:** Quick access actions

**Built-in Tools:**
- [ ] View mode (desktop, tablet, mobile)
- [ ] Preview mode
- [ ] Full screen
- [ ] Undo/Redo
- [ ] Clear canvas
- [ ] Export/Import
- [ ] Device preview

---

## 🎨 CUSTOMIZATION POSSIBILITIES

### **Panel Configuration Options**
```javascript
// Example from GrapesJS documentation
editor.Panels.addPanel({
  id: 'my-panel',
  el: '.my-panel-wrapper',
  buttons: [
    {
      id: 'my-button',
      className: 'my-button-class',
      label: 'My Button',
      command: 'my-command',
      attributes: { title: 'My Title' }
    }
  ]
});
```

### **Panel Types**
1. **Standard Panels**: Built-in functionality
2. **Custom Panels**: User-defined content
3. **Modal Panels**: Overlay dialogs
4. **Floating Panels**: Positionable panels

### **Layout Flexibility**
- **Resizable panels**: Users can adjust panel widths
- **Collapsible panels**: Minimize panels to save space
- **Draggable panels**: Move panels to different positions
- **Multiple views**: Switch between different panel configurations

---

## 🔧 INTEGRATION FOR EBOOK EDITOR

### **Recommended Panel Layout for eBooks**

```
┌─────────────────────────────────────────────────────────┐
│                    Header Toolbar                        │
│  [Back][Save][Preview][Export][Device]                  │
├──────────────┬──────────────────────┬──────────────────┤
│              │                      │                  │
│   Left       │                      │    Right         │
│   Panel      │      Canvas Area     │    Panel         │
│              │                      │                  │
│ 📑 Chapters  │                      │   Styles         │
│ 📄 Pages     │                      │   Typography    │
│ 🎨 Templates │   [Page Canvas]      │   Layout         │
│ 📁 Assets    │                      │   Page Props     │
│ ⚙️ Settings  │                      │   Properties     │
│              │                      │   Inspector      │
└──────────────┴──────────────────────┴──────────────────┘
```

### **Custom Panels Needed for eBook Editor**

#### **Left Panel - Content Management**
```javascript
// Chapter Manager Panel
{
  id: 'chapter-manager',
  el: '.chapter-panel',
  buttons: [
    {
      id: 'add-chapter',
      className: 'fa fa-plus',
      command: 'add-chapter',
      label: 'Add Chapter'
    }
  ],
  content: '<div class="chapter-tree"></div>'
}

// Page Manager Panel (Fixed Layout)
{
  id: 'page-manager',
  el: '.page-panel',
  buttons: [
    {
      id: 'add-page',
      className: 'fa fa-plus',
      command: 'add-page',
      label: 'Add Page'
    }
  ],
  content: '<div class="page-thumbnails"></div>'
}

// Template Gallery
{
  id: 'template-gallery',
  el: '.template-panel',
  buttons: [
    {
      id: 'browse-templates',
      className: 'fa fa-th',
      command: 'browse-templates',
      label: 'Browse'
    }
  ],
  content: '<div class="template-grid"></div>'
}
```

#### **Right Panel - Styling & Properties**
```javascript
// Style Manager (Enhanced)
{
  id: 'style-manager',
  el: '.style-panel',
  buttons: [
    {
      id: 'add-style',
      className: 'fa fa-plus',
      command: 'add-style',
      label: 'Add Style'
    }
  ],
  content: '<div class="style-editor"></div>'
}

// Page Properties
{
  id: 'page-properties',
  el: '.page-props-panel',
  buttons: [
    {
      id: 'page-settings',
      className: 'fa fa-cog',
      command: 'page-settings',
      label: 'Settings'
    }
  ],
  content: '<div class="page-settings-form"></div>'
}
```

### **Canvas Customizations**

#### **For Fixed Layout eBooks**
- **Page-based canvas**: Instead of continuous scrolling
- **Page boundaries**: Visual page separators
- **Grid system**: Snap-to-grid for precise positioning
- **Zoom controls**: For detailed editing
- **Page thumbnails**: Quick page navigation

#### **For Reflow Layout eBooks**
- **Chapter-based canvas**: Separate sections per chapter
- **Text flow**: Natural text wrapping
- **Style presets**: Typography-focused controls
- **Reading mode**: Preview for reading experience

### **Toolbar Enhancements**

#### **Book-Specific Tools**
```javascript
// Custom toolbar buttons
{
  id: 'save-book',
  className: 'fa fa-save',
  command: 'save-book',
  label: 'Save Book'
}

{
  id: 'export-epub',
  className: 'fa fa-download',
  command: 'export-epub',
  label: 'Export EPUB'
}

{
  id: 'preview-mode',
  className: 'fa fa-eye',
  command: 'preview-mode',
  label: 'Preview'
}

{
  id: 'layout-toggle',
  className: 'fa fa-columns',
  command: 'toggle-layout',
  label: 'Toggle Layout'
}
```

---

## 🎯 DESIGN INTEGRATION STRATEGY

### **Phase 1: Foundation (Week 2-3)**
1. **Analyze default GrapesJS panels**
   - Understand existing structure
   - Identify reusable components
   - Document customization points

2. **Design custom panel layouts**
   - Chapter management panel
   - Page thumbnail panel
   - eBook-specific style controls

### **Phase 2: Implementation (Week 3-4)**
1. **Create custom panels**
   - Chapter tree component
   - Page grid view
   - Template gallery

2. **Style customization**
   - Match Material Design tokens
   - Implement responsive behavior
   - Add eBook-specific controls

### **Phase 3: Enhancement (Week 5-7)**
1. **Advanced features**
   - Drag & drop between panels
   - Context-sensitive controls
   - Real-time preview integration

---

## 📱 RESPONSIVE CONSIDERATIONS

### **Desktop Layout**
- All panels visible
- Maximum workspace
- Advanced editing features

### **Tablet Layout**
- Collapsible panels
- Touch-friendly controls
- Simplified toolbar

### **Mobile Layout**
- Panel overlays (drawer style)
- Swipe gestures
- Essential controls only

---

## 🔗 USEFUL REFERENCES

- **GrapesJS Panel Documentation**: https://grapesjs.com/docs/api/Editor_Panels/
- **Custom Panel Examples**: https://grapesjs.com/docs/modules/Panels/
- **Plugin Development**: https://grapesjs.com/docs/dev-guides/plugins/
- **Component Customization**: https://grapesjs.com/docs/api/Component/

---

## 📋 SUMMARY

**GrapesJS Provides:**
✅ 3-panel layout structure
✅ Customizable panels system
✅ Drag & drop functionality
✅ Visual style editor
✅ Component management
✅ Resizable interfaces

**Customization Needed:**
🔧 Chapter management panels
🔧 Page thumbnail system
🔧 eBook-specific controls
🔧 Template gallery
🔧 Enhanced styling options
🔧 Export/import functionality

The existing GrapesJS framework provides an excellent foundation that can be extended with eBook-specific panels and functionality while maintaining the familiar drag-and-drop editor experience.