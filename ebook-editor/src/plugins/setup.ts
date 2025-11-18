/*!
 * grapesjs-setup - 1.0.0
 * Custom setup plugin for eBook editor
 * Based on grapesjs-preset-webpage but modified for better eBook editing experience
 */
import grapesjs from 'grapesjs';
import '../styles/left-sidebar.css';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Plugin configuration interface
interface SetupOptions {
  blocks?: string[];
  block?: (blockId: string) => Record<string, unknown>;
  modalImportTitle?: string;
  modalImportButton?: string;
  modalImportLabel?: string;
  modalImportContent?: string | ((editor: any) => string);
  importViewerOptions?: Record<string, unknown>;
  textCleanCanvas?: string;
  showStylesOnChange?: boolean;
  useCustomTheme?: boolean; // IMPORTANT: This controls CSS injection
}

// Import command interface
interface ImportCommand {
  codeViewer: any | null;
  container: HTMLElement | null;
  run(editor: any): void;
  stop(): void;
  getContainer(): HTMLElement;
  getCodeViewer(): any;
}

const plugin = grapesjs.plugins.add('setup', (editor: any, options: SetupOptions = {}) => {
  const config: SetupOptions = Object.assign({
    blocks: ['link-block', 'quote', 'text-basic'],
    block: () => ({}),
    modalImportTitle: 'Import',
    modalImportButton: 'Import',
    modalImportLabel: '',
    modalImportContent: '',
    importViewerOptions: {},
    textCleanCanvas: 'Are you sure you want to clear the canvas?',
    showStylesOnChange: true,
    useCustomTheme: false // DISABLED - This prevents CSS injection
  }, options);

  // Device switching commands
  const commands = editor.Commands;

  // Import command
  const importCommand = 'gjs-open-import-webpage';
  commands.add(importCommand, {
    codeViewer: null,
    container: null,

    run(editorInstance: any) {
      const modalContent = config.modalImportContent;
      const codeViewer = this.getCodeViewer();

      editorInstance.Modal.open({
        title: config.modalImportTitle,
        content: this.getContainer()
      }).onceClose(() => editorInstance.stopCommand(importCommand));

      codeViewer.setContent(
        typeof modalContent === 'function' ? modalContent(editorInstance) : modalContent || ''
      );
      codeViewer.refresh();
      setTimeout(() => codeViewer.focus(), 0);
    },

    stop() {
      editor.Modal.close();
    },

    getContainer(): HTMLElement {
      if (!this.container) {
        const codeViewer = this.getCodeViewer();
        const container = document.createElement('div');
        const stylePrefix = editor.getConfig('stylePrefix');

        container.className = `${stylePrefix}import-container`;

        if (config.modalImportLabel) {
          const label = document.createElement('div');
          label.className = `${stylePrefix}import-label`;
          label.innerHTML = config.modalImportLabel;
          container.appendChild(label);
        }

        const importBtn = document.createElement('button');
        importBtn.type = 'button';
        importBtn.innerHTML = config.modalImportButton || 'Import';
        importBtn.className = `${stylePrefix}btn-prim ${stylePrefix}btn-import`;
        importBtn.onclick = () => {
          editor.Css.clear();
          editor.setComponents(codeViewer.getContent().trim());
          editor.Modal.close();
        };
        container.appendChild(importBtn);

        container.appendChild(codeViewer.getElement());
        this.container = container;
      }
      return this.container;
    },

    getCodeViewer() {
      if (!this.codeViewer) {
        this.codeViewer = editor.CodeManager.createViewer(Object.assign({
          codeName: 'htmlmixed',
          theme: 'hopscotch',
          readOnly: false
        }, config.importViewerOptions));
      }
      return this.codeViewer;
    }
  } as ImportCommand);

  // Device commands
  commands.add('set-device-desktop', {
    run: (editorInstance: any) => editorInstance.setDevice('Desktop'),
    stop: () => {}
  });

  commands.add('set-device-tablet', {
    run: (editorInstance: any) => editorInstance.setDevice('Tablet'),
    stop: () => {}
  });

  commands.add('set-device-mobile', {
    run: (editorInstance: any) => editorInstance.setDevice('Mobile portrait'),
    stop: () => {}
  });

  commands.add('canvas-clear', (editorInstance: any) => {
    return confirm(config.textCleanCanvas) && editorInstance.runCommand('core:canvas-clear');
  });

  // Setup panels
  const setupPanels = () => {
    const panels = editor.Panels;
    const editorConfig = editor.getConfig();
    const swVisibility = 'sw-visibility';
    const exportTemplate = 'export-template';
    const openSm = 'open-sm';
    const openTm = 'open-tm';
    const openLayers = 'open-layers';
    const openBlocks = 'open-blocks';
    const fullscreen = 'fullscreen';
    const preview = 'preview';
    const iconStyle = 'style="display: block; max-width:22px"';

    editorConfig.showDevices = false;

    panels.getPanels().reset([
      {
        id: 'left-sidebar',
        buttons: []
      },
      {
        id: 'commands',
        buttons: [{}]
      },
      {
        id: 'devices-c',
        buttons: [
          {
            id: 'set-device-desktop',
            command: 'set-device-desktop',
            active: true,
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z" /></svg>`
          },
          {
            id: 'set-device-tablet',
            command: 'set-device-tablet',
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M19,18H5V6H19M19,4H5C3.89,4 3,4.89 3,6V18A2,2 0 0,0 5,20H19A2,2 0 0,0 21,18V6C21,4.89 20.1,4 19,4Z" /></svg>`
          },
          {
            id: 'set-device-mobile',
            command: 'set-device-mobile',
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z" /></svg>`
          }
        ]
      },
      {
        id: 'options',
        buttons: [
          {
            id: swVisibility,
            command: swVisibility,
            context: swVisibility,
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M15,5H17V3H15M15,21H17V19H15M11,5H13V3H11M19,5H21V3H19M19,9H21V7H19M19,21H21V19H19M19,13H21V11H19M19,17H21V15H19M3,5H5V3H3M3,9H5V7H3M3,13H5V11H3M3,17H5V15H3M3,21H5V19H3M11,21H13V19H11M7,21H9V19H7M7,5H9V3H7V5Z" /></svg>`
          },
          {
            id: preview,
            context: preview,
            command: () => editor.runCommand(preview),
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" /></svg>`
          },
          {
            id: fullscreen,
            command: fullscreen,
            context: fullscreen,
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z" /></svg>`
          },
          {
            id: exportTemplate,
            command: () => editor.runCommand(exportTemplate),
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M12.89,3L14.85,3.4L11.11,21L9.15,20.6L12.89,3M19.59,12L16,8.41V5.58L22.42,12L16,18.41V15.58L19.59,12M1.58,12L8,5.58V8.41L4.41,12L8,15.58V18.41L1.58,12Z" /></svg>`
          },
          {
            id: importCommand,
            command: () => editor.runCommand(importCommand),
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" /></svg>`
          },
          {
            id: 'canvas-clear',
            command: () => editor.runCommand('canvas-clear'),
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>`
          }
        ]
      },
      {
        id: 'views',
        buttons: [
          {
            id: openSm,
            command: openSm,
            active: true,
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z" /></svg>`
          },
          {
            id: openTm,
            command: openTm,
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" /></svg>`
          },
          {
            id: openLayers,
            command: openLayers,
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M12,16L19.36,10.27L21,9L12,2L3,9L4.63,10.27M12,18.54L4.62,12.81L3,14.07L12,21.07L21,14.07L19.37,12.8L12,18.54Z" /></svg>`
          },
          {
            id: openBlocks,
            command: openBlocks,
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M17,13H13V17H11V13H7V11H11V7H13V11H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" /></svg>`
          }
        ]
      }
    ]);

    // Header with tabs
    const headerLeftSidebar = document.createElement('div');
    headerLeftSidebar.className = 'gjs-pn-header-left-sidebar gjs-pn-panel gjs-one-bg gjs-two-color';

    // Tab configuration
    const leftSidebarTabs = [
      { id: 'book-structure', label: 'Structure', icon: '<svg style="display:block;max-width:18px" viewBox="0 0 24 24"><path fill="currentColor" d="M21,5C19.89,4.65 18.67,4.5 17.5,4.5C15.55,4.5 13.45,4.9 12,6C10.55,4.9 8.45,4.5 6.5,4.5C4.55,4.5 2.45,4.9 1,6V20.65C1,20.9 1.25,21.15 1.5,21.15C1.6,21.15 1.65,21.1 1.75,21.1C3.1,20.45 5.05,20 6.5,20C8.45,20 10.55,20.4 12,21.5C13.35,20.65 15.8,20 17.5,20C19.15,20 20.85,20.3 22.25,21.05C22.35,21.1 22.4,21.1 22.5,21.1C22.75,21.1 23,20.85 23,20.6V6C22.4,5.55 21.75,5.25 21,5M21,18.5C19.9,18.15 18.7,18 17.5,18C15.8,18 13.35,18.65 12,19.5V8C13.35,7.15 15.8,6.5 17.5,6.5C18.7,6.5 19.9,6.65 21,7V18.5Z" /></svg>' },
      { id: 'assets', label: 'Assets', icon: '<svg style="display:block;max-width:18px" viewBox="0 0 24 24"><path fill="currentColor" d="M5,1C3.89,1 3,1.89 3,3V7H5V5H19V19H5V17H3V21A2,2 0 0,0 5,23H19A2,2 0 0,0 21,21V3A2,2 0 0,0 19,1H5M7,9V11H9V9H7M11,9V11H13V9H11M15,9V11H17V9H15M7,13V15H9V13H7M11,13V15H13V13H11M15,13V15H17V13H15Z" /></svg>' },
      { id: 'settings', label: 'Settings', icon: '<svg style="display:block;max-width:18px" viewBox="0 0 24 24"><path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" /></svg>' }
    ];

    // Create tab buttons using GrapesJS patterns
    leftSidebarTabs.forEach((tab, index) => {
      const tabButton = document.createElement('div');
      tabButton.className = `gjs-pn-tab-btn ${index === 0 ? 'gjs-pn-tab-active' : ''}`;
      tabButton.setAttribute('data-tab', tab.id);
      tabButton.title = tab.label;

      // Create icon and label structure
      const tabIcon = document.createElement('div');
      tabIcon.innerHTML = tab.icon;

      const tabLabel = document.createElement('div');
      tabLabel.className = 'gjs-pn-tab-label';
      tabLabel.textContent = tab.label;

      tabButton.appendChild(tabIcon);
      tabButton.appendChild(tabLabel);

      tabButton.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('.gjs-pn-tab-btn').forEach((btn) => {
          btn.classList.remove('gjs-pn-tab-active');
        });

        // Add active class to clicked tab
        tabButton.classList.add('gjs-pn-tab-active');

        // Switch content
        switchLeftSidebarContent(tab.id);
      });

      headerLeftSidebar.appendChild(tabButton);
    });

    // Tab switching function
    const switchLeftSidebarContent = async (tabId: string) => {
      if (!contentLeftSidebar) return;

      contentLeftSidebar.innerHTML = '';

      switch (tabId) {
        case 'book-structure':
          createBookStructureView(contentLeftSidebar);
          break;
        case 'assets':
          createAssetsView(contentLeftSidebar);
          break;
        case 'settings':
          await createSettingsView(contentLeftSidebar);
          break;
      }
    };

    // Content area
    const contentLeftSidebar = document.createElement('div');
    contentLeftSidebar.className = 'gjs-pn-content-left-sidebar gjs-pn-panel gjs-one-bg gjs-two-color left-sidebar-content';

    // Create book structure view
    const createBookStructureView = (container: HTMLElement) => {
      const structureView = document.createElement('div');
      structureView.className = 'structure-view';

      // Book Info Section
      const bookInfoSection = document.createElement('div');
      bookInfoSection.innerHTML = `
        <div class="left-sidebar-title">
          <i class="fas fa-book" style="margin-right: 8px;"></i>
          <span>Book Information</span>
        </div>
        <div class="gjs-category-content" style="padding: var(--gjs-input-padding-multiple);">
          <div class="gjs-form-group">
            <label style="display: block; margin-bottom: 4px; font-size: var(--gjs-font-size); color: var(--gjs-font-color);">Title</label>
            <div class="gjs-field">
              <input type="text" placeholder="Enter book title" style="color: var(--gjs-font-color);">
            </div>
          </div>
          <div class="gjs-form-group">
            <label style="display: block; margin-bottom: 4px; font-size: var(--gjs-font-size); color: var(--gjs-font-color);">Author</label>
            <div class="gjs-field">
              <input type="text" placeholder="Enter author name" style="color: var(--gjs-font-color);">
            </div>
          </div>
        </div>
      `;
      structureView.appendChild(bookInfoSection);

      // Chapters Section
      const chaptersSection = document.createElement('div');
      chaptersSection.innerHTML = `
        <div class="left-sidebar-title">
          <i class="fas fa-list" style="margin-right: 8px;"></i>
          <span>Chapters</span>
          <button class="gjs-sm-btn" style="margin-left: auto;">+ Add</button>
        </div>
        <div class="gjs-category-content" style="padding: var(--gjs-input-padding-multiple);">
          <div id="chapters-list" style="display: flex; flex-direction: column; gap: 4px;">
            <div class="gjs-field" style="padding: var(--gjs-input-padding); cursor: pointer;">
              <i class="fas fa-file-alt" style="margin-right: 8px; color: var(--gjs-secondary-light-color);"></i>
              Chapter 1: Introduction
            </div>
            <div class="gjs-field" style="padding: var(--gjs-input-padding); cursor: pointer;">
              <i class="fas fa-file-alt" style="margin-right: 8px; color: var(--gjs-secondary-light-color);"></i>
              Chapter 2: Getting Started
            </div>
          </div>
        </div>
      `;
      structureView.appendChild(chaptersSection);

      // Pages Section - InDesign Style with Spreads
      const pagesSection = document.createElement('div');
      pagesSection.innerHTML = `
        <!-- InDesign Style Pages Panel Header -->
        <div class="pages-panel-header">
          <div class="pages-panel-title">
            <i class="fas fa-file-alt"></i>
            <span>Pages</span>
          </div>
          <div class="pages-panel-actions">
            <button class="panel-action-btn" title="New Master Page">M</button>
            <button class="panel-action-btn" title="Add Page">+</button>
            <button class="panel-action-btn" title="Page Options">⋮</button>
          </div>
        </div>

        <!-- InDesign Style View Options -->
        <div class="pages-view-options">
          <button class="view-btn active" title="Spread View">
            <i class="fas fa-columns"></i>
            <span>Spreads</span>
          </button>
          <button class="view-btn" title="Single Page View">
            <i class="fas fa-file"></i>
            <span>Pages</span>
          </button>
          <button class="view-btn" title="Page Info">
            <i class="fas fa-info-circle"></i>
            <span>Info</span>
          </button>
        </div>

        <!-- Master Pages Section - InDesign Style -->
        <div class="master-pages-section">
          <div class="master-pages-header">
            <div class="master-pages-title">
              <div class="master-master-icon">M</div>
              <span>Master Pages</span>
            </div>
          </div>
          <div class="master-pages-list">
            <div class="master-page-item active">
              <button class="master-page-delete-btn" title="Delete Master Page">
                <i class="fas fa-trash"></i>
              </button>
              <div class="master-page-thumbnail">
                <div style="position: absolute; top: 4px; left: 4px; font-size: 7px; font-weight: 600; color: var(--gjs-font-color);">A-Master</div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 20px; color: var(--gjs-secondary-light-color);">
                  <i class="fas fa-layer-group"></i>
                </div>
              </div>
              <div class="master-page-label">A-Master</div>
            </div>
          </div>
        </div>

        <!-- Pages Section - InDesign Style -->
        <div class="pages-section">
          <div class="pages-header">
            <div class="pages-title">
              <i class="fas fa-file"></i>
              <span>Pages</span>
            </div>
            <div class="pages-count">5</div>
          </div>

          <div class="pages-list">
            <!-- Cover Page - Full Width -->
            <div class="cover-page-container">
              <div class="page-item page-cover page-active">
                <button class="page-delete-btn" title="Delete Page">
                  <i class="fas fa-trash"></i>
                </button>
                <div class="master-applied-indicator">A</div>
                <div class="page cover-page">
                  <div class="page-content">
                    <div style="position: absolute; top: 6px; left: 6px; right: 6px;">
                      <div class="page-content-line" style="width: 40%; height: 1px; margin-bottom: 3px;"></div>
                    </div>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 85%;">
                      <div class="page-content-line" style="width: 75%; height: 2px; margin: 3px auto;"></div>
                      <div class="page-content-line" style="width: 90%; height: 1px; margin: 2px auto;"></div>
                      <div class="page-content-line" style="width: 80%; height: 1px; margin: 2px auto;"></div>
                      <div class="page-content-line" style="width: 65%; height: 1px; margin: 2px auto;"></div>
                    </div>
                  </div>
                </div>
                <div class="page-number">Cover</div>
              </div>
            </div>

            <!-- Page Spread 1: Pages 2-3 -->
            <div class="page-spread">
              <div class="page-item">
                <button class="page-delete-btn" title="Delete Page">
                  <i class="fas fa-trash"></i>
                </button>
                <div class="master-applied-indicator">A</div>
                <div class="page">
                  <div class="page-content">
                    <div style="position: absolute; top: 4px; left: 4px; right: 4px;">
                      <div class="page-content-line" style="width: 50%; height: 1px;"></div>
                    </div>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%;">
                      <div class="page-content-line" style="width: 100%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 92%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 96%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 88%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 94%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 90%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 85%; height: 1px; margin: 1px 0;"></div>
                    </div>
                  </div>
                </div>
                <div class="page-number">2</div>
              </div>

              <div class="page-item">
                <button class="page-delete-btn" title="Delete Page">
                  <i class="fas fa-trash"></i>
                </button>
                <div class="master-applied-indicator">A</div>
                <div class="page">
                  <div class="page-content">
                    <div style="position: absolute; top: 4px; left: 4px; right: 4px;">
                      <div class="page-content-line" style="width: 45%; height: 1px;"></div>
                    </div>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%;">
                      <div class="page-content-line" style="width: 100%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 94%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 90%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 96%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 88%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 93%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 75%; height: 1px; margin: 2px 0; background: var(--gjs-secondary-light-color);"></div>
                    </div>
                  </div>
                </div>
                <div class="page-number">3</div>
              </div>
            </div>

            <!-- Page Spread 2: Pages 4-5 -->
            <div class="page-spread">
              <div class="page-item">
                <button class="page-delete-btn" title="Delete Page">
                  <i class="fas fa-trash"></i>
                </button>
                <div class="master-applied-indicator">A</div>
                <div class="page">
                  <div class="page-content">
                    <div style="position: absolute; top: 4px; left: 4px; right: 4px;">
                      <div class="page-content-line" style="width: 55%; height: 1px;"></div>
                    </div>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%;">
                      <div class="page-content-line" style="width: 100%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 95%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 90%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 97%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 86%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 93%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 80%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 88%; height: 1px; margin: 1px 0;"></div>
                    </div>
                  </div>
                </div>
                <div class="page-number">4</div>
              </div>

              <div class="page-item">
                <button class="page-delete-btn" title="Delete Page">
                  <i class="fas fa-trash"></i>
                </button>
                <div class="master-applied-indicator">A</div>
                <div class="page">
                  <div class="page-content">
                    <div style="position: absolute; top: 4px; left: 4px; right: 4px;">
                      <div class="page-content-line" style="width: 48%; height: 1px;"></div>
                    </div>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%;">
                      <div class="page-content-line" style="width: 100%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 91%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 96%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 88%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 94%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 90%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 78%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 85%; height: 1px; margin: 1px 0;"></div>
                      <div class="page-content-line" style="width: 70%; height: 1px; margin: 2px 0; background: var(--gjs-secondary-light-color);"></div>
                    </div>
                  </div>
                </div>
                <div class="page-number">5</div>
              </div>
            </div>
          </div>
        </div>

        <!-- InDesign Style Panel Footer -->
        <div class="pages-panel-footer">
          <div class="page-info">
            <div class="page-info-item">
              <span class="page-info-label">Layout:</span>
              <span class="page-info-value">Fixed</span>
            </div>
            <div class="page-info-item">
              <span class="page-info-label">Size:</span>
              <span class="page-info-value">A4</span>
            </div>
          </div>
          <div class="page-info-item">
            <span class="page-info-label">5 pages</span>
          </div>
        </div>
      `;
      structureView.appendChild(pagesSection);

      container.appendChild(structureView);

      // Add collapse functionality to all category titles
      addCollapseFunctionality(container);
    };

    // Add collapse/expand functionality to category titles
    const addCollapseFunctionality = (container: HTMLElement) => {
      const categoryTitles = container.querySelectorAll('.left-sidebar-title, .gjs-category-title, .gjs-sm-sector-title');

      categoryTitles.forEach(title => {
        title.addEventListener('click', (e) => {
          e.preventDefault();
          const isCollapsed = title.classList.contains('collapsed');
          const content = title.nextElementSibling as HTMLElement;

          if (content && content.classList.contains('gjs-category-content')) {
            if (isCollapsed) {
              title.classList.remove('collapsed');
              content.classList.remove('collapsed');
            } else {
              title.classList.add('collapsed');
              content.classList.add('collapsed');
            }
          }
        });
      });
    };

    // Create assets view
    const createAssetsView = (container: HTMLElement) => {
      const assetsView = document.createElement('div');
      assetsView.className = 'assets-view';

      assetsView.innerHTML = `
        <div class="left-sidebar-title">
          <i class="fas fa-photo-video" style="margin-right: 8px;"></i>
          Media Assets
          <button class="gjs-sm-btn" style="margin-left: auto;">Upload</button>
        </div>
        <div class="gjs-category-content">
          <div class="media-section">
            <div class="left-sidebar-title">
              <i class="fas fa-images" style="margin-right: 4px; font-size: 12px;"></i>
              IMAGES
            </div>
            <div class="gjs-category-content">
              <div class="media-grid">
                <div class="media-placeholder">
                  <i class="fas fa-images media-icon"></i>
                  <span class="media-label">No images</span>
                </div>
              </div>
            </div>
          </div>

          <div class="media-section">
            <div class="left-sidebar-title">
              <i class="fas fa-file-alt" style="margin-right: 4px; font-size: 12px;"></i>
              DOCUMENTS
            </div>
            <div class="gjs-category-content">
              <div class="media-empty">
                <i class="fas fa-file-alt media-icon"></i>
                <span>No documents uploaded</span>
              </div>
            </div>
          </div>
        </div>
      `;

      container.appendChild(assetsView);

      // Add collapse functionality to all category titles
      addCollapseFunctionality(container);
    };

      // Create settings view
    const createSettingsView = async (container: HTMLElement) => {
      // Import layout manager
      const settingsView = document.createElement('div');
      settingsView.className = 'settings-view';


      settingsView.innerHTML = `
        <div class="left-sidebar-title">
          <i class="fas fa-cog" style="margin-right: 8px;"></i>
          Book Settings
        </div>
        <div class="gjs-category-content">
          <div class="settings-section">
            <div class="left-sidebar-title">
              <i class="fas fa-ruler-combined" style="margin-right: 4px; font-size: 12px;"></i>
              PAGE LAYOUT
            </div>
            <div class="gjs-category-content">
              <div class="gjs-form-group">
                <label style="display: block; margin-bottom: 4px; font-size: var(--gjs-font-size); color: var(--gjs-font-color);">Layout Type</label>
                <div class="gjs-field">
                  <select id="layout-type-select" style="color: var(--gjs-font-color);">
                  </select>
                </div>
              </div>
              <div class="gjs-form-group">
                <label style="display: block; margin-bottom: 4px; font-size: var(--gjs-font-size); color: var(--gjs-font-color);">Page Size</label>
                <div class="gjs-field">
                  <select style="color: var(--gjs-font-color);">
                    <option>A4 (210x297mm)</option>
                    <option>Letter (8.5x11in)</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>
              <div class="gjs-form-group">
                <label style="display: block; margin-bottom: 4px; font-size: var(--gjs-font-size); color: var(--gjs-font-color);">Orientation</label>
                <div class="gjs-field">
                  <select style="color: var(--gjs-font-color);">
                    <option>Portrait</option>
                    <option>Landscape</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <div class="left-sidebar-title">
              <i class="fas fa-download" style="margin-right: 4px; font-size: 12px;"></i>
              EXPORT SETTINGS
            </div>
            <div class="gjs-category-content">
              <div class="gjs-form-group">
                <label style="display: block; margin-bottom: 4px; font-size: var(--gjs-font-size); color: var(--gjs-font-color);">EPUB Version</label>
                <div class="gjs-field">
                  <select style="color: var(--gjs-font-color);">
                    <option>EPUB 3.0</option>
                    <option>EPUB 2.0</option>
                  </select>
                </div>
              </div>
              <div class="gjs-form-group">
                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input">
                  <span>Include table of contents</span>
                </label>
              </div>
            </div>
          </div>

          <div style="padding: var(--gjs-input-padding-multiple);">
            <button class="btn-full">
              <i class="fas fa-save" style="margin-right: 6px;"></i>
              Save Settings
            </button>
          </div>
        </div>
      `;

      container.appendChild(settingsView);


      addCollapseFunctionality(container);
    };

    // Add left sidebar to editor container when editor loads
    editor.on('load', async () => {
      const editorContainer = editor.getContainer();
      if (editorContainer) {
        const editorContent = editorContainer.querySelector('.gjs-editor');
        editorContent.appendChild(headerLeftSidebar);
        editorContent.appendChild(contentLeftSidebar);

        // Initialize with default tab content
        await switchLeftSidebarContent('book-structure');

        // Adjust canvas to account for left sidebar and right panels
        const canvas = editorContainer.querySelector('.gjs-cv-canvas') as HTMLElement;
        if (canvas) {
          canvas.style.left = 'var(--gjs-left-width, 15%)';
          canvas.style.width = 'calc(100% - var(--gjs-left-width, 15%) - var(--gjs-left-width, 15%))';
        }

        // Also adjust the commands panel position
        const commandsPanel = editorContainer.querySelector('.gjs-pn-commands') as HTMLElement;
        if (commandsPanel) {
          commandsPanel.style.left = 'var(--gjs-left-width, 15%)';
        }

        const devicesPanel = editorContainer.querySelector('.gjs-pn-devices-c') as HTMLElement;
        if (devicesPanel) {
          devicesPanel.style.left = 'var(--gjs-left-width, 15%)';
        }
      }
    });

    const blocksBtn = panels.getButton('views', openBlocks);
    editor.on('load', () => {
      if (blocksBtn) blocksBtn.set('active', true);
    });

    if (config.showStylesOnChange) {
      editor.on('component:selected', () => {
        const styleBtn = panels.getButton('views', openSm);
        const blocksBtn = panels.getButton('views', openBlocks);

        if ((!blocksBtn || !blocksBtn.get('active')) && editor.getSelected() && styleBtn) {
          styleBtn.set('active', true);
        }
      });
    }
  };

  setupPanels();

  return editor;
});

export default plugin;

/* eslint-enable @typescript-eslint/no-explicit-any */