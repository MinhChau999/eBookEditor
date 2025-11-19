# GrapesJS Plugins for eBook Editor

This directory contains custom GrapesJS plugins specifically designed for the eBook editor application. All plugins follow GrapesJS core patterns and architecture.

## Plugin Architecture

Each plugin follows the GrapesJS core structure:
```
plugin-name/
├── types.ts          # TypeScript interfaces and types
├── config/
│   └── config.ts      # Default configuration
├── utils/             # Utility functions
├── view/              # View/UI components
├── index.ts           # Main plugin entry point
├── plugin-name.css    # Plugin-specific styles
└── README.md          # Plugin documentation (if needed)
```

## Available Plugins

### 1. Enhanced Asset Manager (`enhanced-asset-manager`)

**Location**: `/plugins/enhanced-asset-manager/`

**Purpose**: Advanced asset management with categorization, search, and enhanced UI

**Features**:
- Asset categorization (images, documents, videos, audio)
- Search and filtering capabilities
- File upload with validation
- Asset metadata management
- Grid and list views
- Drag and drop support (planned)
- Cloud storage integration (planned)

**Usage**:
```javascript
// Access via editor
editor.EnhancedAssetManager

// Add custom asset
editor.EnhancedAssetManager.addAsset({
  id: 'custom-asset',
  src: 'path/to/asset.jpg',
  name: 'Custom Asset',
  type: 'image/jpeg',
  category: 'images'
});

// Upload files
await editor.EnhancedAssetManager.uploadFiles(fileList);

// Filter assets
const images = editor.EnhancedAssetManager.filterAssets({
  category: 'images',
  search: 'logo'
});
```

**Configuration**:
```javascript
{
  showCategories: true,
  showSearch: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/*', 'application/pdf'],
  autoCategorize: true
}
```

---

### 2. Panel Manager (`panel-manager`)

**Location**: `/plugins/panel-manager/`

**Purpose**: Advanced sidebar and panel management with state persistence

**Features**:
- Left and right sidebar support
- Custom tabs with icons and labels
- Resizable sidebars with drag handles
- Collapsible sidebars
- State persistence (localStorage)
- Keyboard shortcuts
- Responsive design
- Custom panels support

**Usage**:
```javascript
// Access via editor
editor.PanelManager

// Add tab to left sidebar
editor.PanelManager.addTab('left', {
  id: 'custom-tab',
  label: 'Custom',
  icon: '<svg>...</svg>',
  content: (container) => {
    container.innerHTML = '<div>Custom Content</div>';
  }
});

// Select specific tab
editor.PanelManager.selectTab('left', 'custom-tab');

// Get tab content container
const container = editor.PanelManager.getTabContent('left', 'custom-tab');

// Toggle sidebar
editor.PanelManager.toggleSidebar('left');

// Set sidebar width
editor.PanelManager.setSidebarWidth('left', 300);

// Add custom panel
editor.PanelManager.addPanel({
  id: 'top-panel',
  position: 'top',
  content: (container) => { /* ... */ }
});
```

**Configuration**:
```javascript
{
  showTabLabels: true,
  showTabIcons: true,
  persistState: true,
  sidebars: {
    left: {
      width: 280,
      minWidth: 200,
      maxWidth: 400,
      collapsible: true
    },
    right: {
      width: 280,
      collapsible: true
    }
  }
}
```

---

### 3. Command Manager (`command-manager`)

**Location**: `/plugins/command-manager/`

**Purpose**: Enhanced command system with device management, import/export, and custom commands

**Features**:
- Custom command registration
- Keyboard shortcuts
- Command confirmation dialogs
- Success/error notifications
- Device management commands
- Import/export functionality
- Command categories
- Async command support

**Usage**:
```javascript
// Access via editor
editor.CommandManager

// Register custom command
editor.CommandManager.register({
  id: 'my-custom-command',
  name: 'My Custom Command',
  icon: '<svg>...</svg>',
  category: 'custom',
  shortcut: 'ctrl+shift+c',
  confirmMessage: 'Are you sure?',
  run: (editor, options) => {
    console.log('Executing custom command');
    // Your logic here
  }
});

// Execute command
editor.CommandManager.execute('my-custom-command', { option: 'value' });

// Get device commands
const devices = editor.CommandManager.getDeviceCommands();

// Show notification
editor.CommandManager.showNotification('Operation completed', 'success');
```

**Default Commands**:
- Import HTML content
- Export template
- Canvas clear
- Device switching (Desktop, Tablet, Mobile)
- Fullscreen toggle
- Preview mode

**Configuration**:
```javascript
{
  enableShortcuts: true,
  showConfirmations: true,
  showSuccessMessages: true,
  defaultCommands: {
    import: true,
    export: true,
    canvas: true,
    devices: true,
    fullscreen: true,
    preview: true
  }
}
```

---

### 4. Book Manager (`book-manager`)

**Location**: `/plugins/book-manager/`

**Purpose**: Complete book metadata management with auto-save functionality

**Features**:
- Book information management
- Chapter management integration
- Page management integration
- Settings management
- Auto-save to localStorage
- Event-driven architecture

**Usage**:
```javascript
// Access via editor
editor.BookManager

// Get book data
const bookData = editor.BookManager.getData();

// Save book data
editor.BookManager.saveData({
  title: 'My eBook',
  author: 'John Doe'
});

// Get settings
const settings = editor.BookManager.getSettings();

// Create management panel
editor.BookManager.createManagementPanel(container);
```

---

### 5. Book Blocks (`book-blocks`)

**Location**: `/plugins/book-blocks/`

**Purpose**: Custom blocks designed for eBook content creation

**Features**:
- Page layout blocks
- Chapter blocks
- Text formatting blocks
- Image blocks
- Custom styling

---

### 6. Setup (`setup`)

**Location**: `/plugins/setup/`

**Purpose**: Core setup plugin that orchestrates all other plugins

**Features**:
- Plugin initialization
- Panel configuration
- Editor customization
- Asset management integration
- Device configuration

## Plugin Integration

The plugins work together seamlessly:

1. **Setup** initializes the editor and coordinates other plugins
2. **Panel Manager** creates the sidebar infrastructure
3. **Enhanced Asset Manager** handles all media files
4. **Command Manager** provides command infrastructure
5. **Book Manager** manages book-related data
6. **Book Blocks** provides content creation tools

## Event System

Plugins communicate through GrapesJS events:

```javascript
// Listen to asset events
editor.on('asset:enhanced-select', (asset) => {
  console.log('Asset selected:', asset);
});

// Listen to panel events
editor.on('panel:tab-changed', ({ tabId, sidebar }) => {
  console.log('Tab changed:', tabId, sidebar);
});

// Listen to command events
editor.on('command:execute', ({ commandId, options }) => {
  console.log('Command executed:', commandId);
});
```

## Configuration

Plugins can be configured individually:

```javascript
const editor = grapesjs.init({
  plugins: [
    setup,
    enhancedAssetManager,
    panelManager,
    commandManager,
    bookManager,
    bookBlocks
  ],
  pluginsOpts: {
    'enhanced-asset-manager': {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      autoCategorize: true
    },
    'panel-manager': {
      persistState: true,
      showTabLabels: true
    },
    'command-manager': {
      enableShortcuts: true,
      showConfirmations: true
    },
    'book-manager': {
      autoSave: true,
      storageKey: 'my-ebook-data'
    }
  }
});
```

## Development Guidelines

When creating new plugins:

1. **Follow the established structure** with types, config, utils, view folders
2. **Use TypeScript interfaces** for all configuration and data structures
3. **Implement proper error handling** and user feedback
4. **Add comprehensive documentation** with examples
5. **Follow GrapesJS naming conventions**
6. **Use CSS custom properties** for theming
7. **Implement responsive design**
8. **Add keyboard accessibility support**
9. **Test with different plugin combinations**
10. **Use the event system** for plugin communication

## File Structure

```
src/plugins/
├── README.md                 # This documentation
├── index.ts                  # Plugin exports
├── setup.ts                  # Core setup plugin
├── book-blocks/
│   └── index.ts             # Book blocks plugin
├── book-manager/
│   └── index.ts             # Book management plugin
├── enhanced-asset-manager/
│   ├── types.ts             # Type definitions
│   ├── config/
│   │   └── config.ts        # Default config
│   ├── utils/
│   │   └── assetUtils.ts    # Utility functions
│   ├── view/
│   │   ├── AssetView.ts     # Individual asset view
│   │   └── AssetManagerView.ts # Asset manager view
│   ├── index.ts             # Main plugin
│   └── enhanced-asset-manager.css
├── panel-manager/
│   ├── types.ts             # Type definitions
│   ├── config/
│   │   └── config.ts        # Default config
│   ├── utils/
│   │   └── stateManager.ts  # State management
│   ├── view/
│   │   └── Sidebar.ts       # Sidebar component
│   ├── index.ts             # Main plugin
│   └── panel-manager.css
└── command-manager/
    ├── types.ts             # Type definitions
    ├── config/
    │   └── config.ts        # Default config
    ├── index.ts             # Main plugin
    └── command-manager.css
```

## Contributing

When contributing to the plugins:

1. Follow the established code patterns
2. Add proper TypeScript types
3. Include comprehensive tests
4. Update documentation
5. Ensure compatibility with existing plugins
6. Follow semantic versioning
7. Use conventional commits
8. Test with different GrapesJS versions

## Dependencies

All plugins depend on:
- GrapesJS core library
- TypeScript (for type safety)
- Modern browser APIs (localStorage, fetch, etc.)

Optional dependencies:
- Font Awesome for icons
- Custom CSS themes
- External libraries for specific functionality