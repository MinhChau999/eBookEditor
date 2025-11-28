
import grapesjs, { Editor } from 'grapesjs';
import { useBookStore } from '../../core/store/bookStore';
import { createRoot } from 'react-dom/client';
import { StructurePanel } from '../../features/page/components/StructurePanel';
import { PagesPanelFooter } from '../../features/page/components/PagesPanelFooter';
export interface PageTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: 'mm' | 'px' | 'in';
}
export const getTemplateById = (id: string): PageTemplate | undefined => {
  return Object.values(PAGE_TEMPLATES).find(t => t.id === id);
};
export const PAGE_TEMPLATES: Record<string, PageTemplate> = {
  A4_PORTRAIT: { id: 'A4_PORTRAIT', name: 'A4 Portrait', width: 210, height: 297, unit: 'mm' },
  A4_LANDSCAPE: { id: 'A4_LANDSCAPE', name: 'A4 Landscape', width: 297, height: 210, unit: 'mm' },
  A5_PORTRAIT: { id: 'A5_PORTRAIT', name: 'A5 Portrait', width: 148, height: 210, unit: 'mm' },
  LETTER_PORTRAIT: { id: 'LETTER_PORTRAIT', name: 'Letter Portrait', width: 216, height: 279, unit: 'mm' },
  IPAD_PORTRAIT: { id: 'IPAD_PORTRAIT', name: 'iPad Portrait', width: 768, height: 1024, unit: 'px' },
  IPAD_LANDSCAPE: { id: 'IPAD_LANDSCAPE', name: 'iPad Landscape', width: 1024, height: 768, unit: 'px' },
};
export interface CoreSetupOptions {
  textCleanCanvas?: string;
  layoutMode?: 'fixed' | 'reflow';
}

// Type for editor with left panel extensions
type EditorWithLeftPanel = Editor & {
  leftPanelElements?: {
    header: HTMLElement;
    content: HTMLElement;
    footer: HTMLElement;
  };
  adjustLeftPanelLayout?: (visible: boolean) => void;
  leftSidebarVisible?: boolean;
};


const coreSetupPlugin = grapesjs.plugins.add('core-setup', (editor: Editor, options: CoreSetupOptions = {}) => {
  const config = {
    textCleanCanvas: 'Are you sure you want to clear the canvas?',
    layoutMode: 'fixed',
    ...options,
  };

  const commands = editor.Commands;
  const panels = editor.Panels;

  // --- Left Panel Logic ---
  let structurePanelRoot: ReturnType<typeof createRoot> | null = null;
  let footerPanelRoot: ReturnType<typeof createRoot> | null = null;

  const createBookStructureView = (container: HTMLElement) => {
    if (!structurePanelRoot) {
      structurePanelRoot = createRoot(container);
    }
    structurePanelRoot.render(<StructurePanel editor={editor} />);
  };

  const createAssetsView = (container: HTMLElement) => {
     container.innerHTML = '<div style="padding: 20px; text-align: center; color: #aaa;">Assets Panel (Coming Soon)</div>';
  };

  const createFooterView = (footerLeftSidebar: HTMLElement) => {
    if (!footerPanelRoot) {
      footerPanelRoot = createRoot(footerLeftSidebar);
    }
    footerPanelRoot.render(<PagesPanelFooter editor={editor} />);
  };

  const switchLeftSidebarContent = (tabId: string, contentLeftSidebar: HTMLElement) => {
    if (tabId !== 'book-structure' && structurePanelRoot) {
        structurePanelRoot.unmount();
        structurePanelRoot = null;
    }

    contentLeftSidebar.innerHTML = '';

    switch (tabId) {
      case 'book-structure':
        createBookStructureView(contentLeftSidebar);
        break;
      case 'assets':
        createAssetsView(contentLeftSidebar);
        break;
    }
  };

  const initializeLeftPanel = () => {
    const editorContainer = editor.getContainer();
    if (!editorContainer) return;

    const editorContent = editorContainer.querySelector('.gjs-editor');
    if (!editorContent) return;

    // Create left panel containers
    const headerLeftSidebar = document.createElement('div');
    headerLeftSidebar.className = 'gjs-pn-header-left-sidebar gjs-pn-panel gjs-one-bg gjs-two-color';

    const contentLeftSidebar = document.createElement('div');
    contentLeftSidebar.className = 'gjs-pn-content-left-sidebar gjs-one-bg gjs-two-color left-sidebar-content';

    const footerLeftSidebar = document.createElement('div');
    footerLeftSidebar.className = 'gjs-pn-footer-left-sidebar gjs-pn-panel gjs-one-bg gjs-two-color';

    // Tab configuration
    const leftSidebarTabs = [
      { id: 'book-structure', label: 'Structure', icon: '<svg style="display:block;max-width:18px" viewBox="0 0 24 24"><path fill="currentColor" d="M21,5C19.89,4.65 18.67,4.5 17.5,4.5C15.55,4.5 13.45,4.9 12,6C10.55,4.9 8.45,4.5 6.5,4.5C4.55,4.5 2.45,4.9 1,6V20.65C1,20.9 1.25,21.15 1.5,21.15C1.6,21.15 1.65,21.1 1.75,21.1C3.1,20.45 5.05,20 6.5,20C8.45,20 10.55,20.4 12,21.5C13.35,20.65 15.8,20 17.5,20C19.15,20 20.85,20.3 22.25,21.05C22.35,21.1 22.4,21.1 22.5,21.1C22.75,21.1 23,20.85 23,20.6V6C22.4,5.55 21.75,5.25 21,5M21,18.5C19.9,18.15 18.7,18 17.5,18C15.8,18 13.35,18.65 12,19.5V8C13.35,7.15 15.8,6.5 17.5,6.5C18.7,6.5 19.9,6.65 21,7V18.5Z" /></svg>' },
      { id: 'assets', label: 'Assets', icon: '<svg style="display:block;max-width:18px" viewBox="0 0 24 24"><path fill="currentColor" d="M5,1C3.89,1 3,1.89 3,3V7H5V5H19V19H5V17H3V21A2,2 0 0,0 5,23H19A2,2 0 0,0 21,21V3A2,2 0 0,0 19,1H5M7,9V11H9V9H7M11,9V11H13V9H11M15,9V11H17V9H15M7,13V15H9V13H7M11,13V15H13V13H11M15,13V15H17V13H15Z" /></svg>' }
    ];

    // Store references for toggle command
    const editorWithExtensions = editor as EditorWithLeftPanel;

    editorWithExtensions.leftPanelElements = {
      header: headerLeftSidebar,
      content: contentLeftSidebar,
      footer: footerLeftSidebar
    };

    // Create tab buttons
    leftSidebarTabs.forEach((tab, index) => {
      const tabButton = document.createElement('div');
      tabButton.className = `gjs-pn-tab-btn ${index === 0 ? 'gjs-pn-tab-active' : ''}`;
      tabButton.setAttribute('data-tab', tab.id);
      tabButton.title = tab.label;
      tabButton.innerHTML = `<div class="gjs-pn-tab-label">${tab.label}</div>`;

      tabButton.addEventListener('click', () => {
        headerLeftSidebar.querySelectorAll('.gjs-pn-tab-btn').forEach(btn => btn.classList.remove('gjs-pn-tab-active'));
        tabButton.classList.add('gjs-pn-tab-active');
        switchLeftSidebarContent(tab.id, contentLeftSidebar);
      });

      headerLeftSidebar.appendChild(tabButton);
    });

    // Append to editor
    editorContent.appendChild(headerLeftSidebar);
    editorContent.appendChild(contentLeftSidebar);
    editorContent.appendChild(footerLeftSidebar);
    switchLeftSidebarContent('book-structure', contentLeftSidebar);
    createFooterView(footerLeftSidebar);
    const adjustLayout = (visible: boolean) => {
      const leftWidth = visible ? 'var(--gjs-left-width, 15%)' : '0px';
      const canvas = editorContainer.querySelector('.gjs-cv-canvas') as HTMLElement;
      if (canvas) {
        canvas.style.left = leftWidth;
        canvas.style.width = visible ? 'calc(100% - var(--gjs-left-width, 15%) - var(--gjs-left-width, 15%))' : '100%';
      }

      const commandsPanel = editorContainer.querySelector('.gjs-pn-commands') as HTMLElement;
      if (commandsPanel) commandsPanel.style.left = leftWidth;

      const devicesPanel = editorContainer.querySelector('.gjs-pn-devices-c') as HTMLElement;
      if (devicesPanel) devicesPanel.style.left = leftWidth;
    };

    adjustLayout(true);
    editorWithExtensions.adjustLeftPanelLayout = adjustLayout;
    editorWithExtensions.leftSidebarVisible = true; // Set initial state
  };

  // --- Fixed Layout Logic ---

  const updateCanvasSize = () => {
    const { currentBook } = useBookStore.getState();
    const templateId = currentBook?.template || 'A4_PORTRAIT';
    const template = PAGE_TEMPLATES[templateId];

    if (template) {
      const frameBody = editor.Canvas.getBody();
      
      if (frameBody) {
        const width = `${template.width}${template.unit}`;
        const height = `${template.height}${template.unit}`;
        
        const fixedDevice = editor.Devices.get('fixed');
        if (fixedDevice) {
            fixedDevice.set('width', width);
            fixedDevice.set('height', height);
            fixedDevice.set('widthMedia', width);
            
            if (editor.Devices.getSelected()?.id === 'fixed') {
                editor.refresh();
            }
        }
      }
    }
  };

  // --- Reflow Logic ---
  const enableReflowMode = () => {
    const canvas = editor.Canvas;
    const frameBody = canvas.getBody();
    if (frameBody) {
      const pageContainer = frameBody.querySelector('.page-container') as HTMLElement;
      if (pageContainer) {
         pageContainer.removeAttribute('style');
      }
    }
  };
  // Layout Mode Initialization (Internal, not exposed as commands anymore)
  const initializeMode = (mode: 'reflow' | 'fixed') => {
    const container = editor.getContainer();
    if (container) {
      container.classList.remove('gjs-mode-reflow', 'gjs-mode-fixed');
      container.classList.add(`gjs-mode-${mode}`);
    }
    
    if (mode === 'fixed') {
        editor.Devices.select('fixed');
        updateCanvasSize();
        editor.runCommand('ruler-visibility');
    } else {
        editor.Devices.select('desktop'); // Default to desktop for reflow
        enableReflowMode();
        editor.stopCommand('ruler-visibility');
    }

    editor.trigger('mode:change', { mode });
  };

  // Device Commands
  commands.add('set-device-desktop', {
    run: (editor: Editor) => editor.Devices.select('desktop'),
    stop: () => {},
  });
  commands.add('set-device-tablet', {
    run: (editor: Editor) => editor.Devices.select('tablet'),
    stop: () => {},
  });
  commands.add('set-device-mobile', {
    run: (editor: Editor) => editor.Devices.select('mobile'),
    stop: () => {},
  });

  commands.add('fixed:update-canvas', updateCanvasSize);

  // Zoom commands - only work in fixed mode
  commands.add('zoom-in', (editor: Editor) => {
    if (config.layoutMode !== 'fixed') return;
    const currentZoom = editor.Canvas.getZoom();
    const newZoom = Math.min(currentZoom + 5, 200); // Max 200%, 5% steps
    editor.runCommand('set-zoom', { zoom: newZoom });
  });

  commands.add('zoom-out', (editor: Editor) => {
    if (config.layoutMode !== 'fixed') return;
    const currentZoom = editor.Canvas.getZoom();
    const newZoom = Math.max(currentZoom - 5, 25); // Min 25%, 5% steps
    editor.runCommand('set-zoom', { zoom: newZoom });
  });

  commands.add('zoom-reset', (editor: Editor) => {
    if (config.layoutMode !== 'fixed') return;
    editor.runCommand('set-zoom', { zoom: 100 });
  });

  // Left Panel Toggle Command (using GrapesJS pattern)
  commands.add('left-panel-toggle', {
    run: (editor: Editor) => {
      const editorWithExtensions = editor as EditorWithLeftPanel;
      const elements = editorWithExtensions.leftPanelElements;
      const adjustLayout = editorWithExtensions.adjustLeftPanelLayout;
      const isVisible = editorWithExtensions.leftSidebarVisible !== false;

      if (!elements || !adjustLayout) return;

      // Toggle visibility
      const newVisibility = !isVisible;
      const displayStyle = newVisibility ? 'block' : 'none';

      elements.header.style.display = displayStyle;
      elements.content.style.display = displayStyle;
      elements.footer.style.display = displayStyle;

      adjustLayout(newVisibility);
      editorWithExtensions.leftSidebarVisible = newVisibility;
    },
    stop: () => {},
  });

  // Left Panel Show Command (kept for manual control)
  commands.add('left-panel-show', {
    run: (editor: Editor) => {
      const editorWithExtensions = editor as EditorWithLeftPanel;
      const elements = editorWithExtensions.leftPanelElements;
      const adjustLayout = editorWithExtensions.adjustLeftPanelLayout;

      if (!elements || !adjustLayout) return;

      // Remove display style to restore default (flex for header)
      elements.header.style.removeProperty('display');
      elements.content.style.removeProperty('display');
      elements.footer.style.removeProperty('display');

      adjustLayout(true);
      editorWithExtensions.leftSidebarVisible = true;
    },
    stop: () => {},
  });

  // Left Panel Hide Command (kept for manual control)
  commands.add('left-panel-hide', {
    run: (editor: Editor) => {
      const editorWithExtensions = editor as EditorWithLeftPanel;
      const elements = editorWithExtensions.leftPanelElements;
      const adjustLayout = editorWithExtensions.adjustLeftPanelLayout;

      if (!elements || !adjustLayout) return;

      elements.header.style.display = 'none';
      elements.content.style.display = 'none';
      elements.footer.style.display = 'none';

      adjustLayout(false);
      editorWithExtensions.leftSidebarVisible = false;
    },
    stop: () => {},
  });

  // Modify existing preview command to hide/show left panel
  editor.on('load', () => {
    // Get the existing preview command
    const previewCommand = commands.get('preview');

    if (previewCommand) {
      const originalRun = previewCommand.run;
      const originalStop = previewCommand.stop;

      // Override run method to hide left panel
      previewCommand.run = (ed: Editor, sender?: unknown) => {
        const editorWithExtensions = ed as EditorWithLeftPanel;
        const elements = editorWithExtensions.leftPanelElements;
        const adjustLayout = editorWithExtensions.adjustLeftPanelLayout;

        // Hide left panel before running preview
        if (elements && adjustLayout && editorWithExtensions.leftSidebarVisible !== false) {
          elements.header.style.display = 'none';
          elements.content.style.display = 'none';
          elements.footer.style.display = 'none';
          adjustLayout(false);
          editorWithExtensions.leftSidebarVisible = false;
        }

        // Run original preview logic if it exists
        if (originalRun) {
          return originalRun.call(previewCommand, ed, sender, {});
        }
      };

      // Override stop method to show left panel
      previewCommand.stop = (ed: Editor, sender?: unknown) => {
        const editorWithExtensions = ed as EditorWithLeftPanel;
        const elements = editorWithExtensions.leftPanelElements;
        const adjustLayout = editorWithExtensions.adjustLeftPanelLayout;

        // Show left panel after stopping preview
        if (elements && adjustLayout && editorWithExtensions.leftSidebarVisible === false) {
          // Remove display style to restore default (flex for header)
          elements.header.style.removeProperty('display');
          elements.content.style.removeProperty('display');
          elements.footer.style.removeProperty('display');
          adjustLayout(true);
          editorWithExtensions.leftSidebarVisible = true;
        }

        // Run original stop logic if it exists
        if (originalStop) {
          return originalStop.call(previewCommand, ed, sender, {});
        }
      };
    }
  });

  editor.on('load', () => {
    initializeMode(config.layoutMode as 'fixed' | 'reflow');
    initializeLeftPanel();

    if (config.layoutMode === 'fixed') {
      const canvasEl = editor.Canvas.getElement();
      if (canvasEl) {
        canvasEl.addEventListener('wheel', (e: WheelEvent) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            e.stopPropagation();
            const currentZoom = editor.Canvas.getZoom();
            const delta = e.deltaY > 0 ? -1 : 1;
            const newZoom = Math.max(25, Math.min(200, currentZoom + (delta * 5))); // 5% steps
            editor.runCommand('set-zoom', { zoom: newZoom });
          }
        });
      }
    }
  });

  // Canvas clear
  commands.add('canvas-clear', (editor: Editor) => {
    return confirm(config.textCleanCanvas) && editor.runCommand('core:canvas-clear');
  });

  // --- Panels ---

  const iconStyle = 'style="display: block; max-width:22px"';

  const editorConfig = editor.getConfig();
  editorConfig.showDevices = false;

  // Determine which device buttons to show based on initial mode
  const deviceButtons = [];

  if (config.layoutMode === 'reflow') {
      deviceButtons.push(
        {
            id: 'set-device-desktop',
            command: 'set-device-desktop',
            active: true,
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z" /></svg>`,
            attributes: { title: 'Desktop' },
        },
        {
            id: 'set-device-tablet',
            command: 'set-device-tablet',
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M19,18H5V6H19M19,4H5C3.89,4 3,4.89 3,6V18A2,2 0 0,0 5,20H19A2,2 0 0,0 21,18V6C21,4.89 20.1,4 19,4Z" /></svg>`,
            attributes: { title: 'Tablet' },
        },
        {
            id: 'set-device-mobile',
            command: 'set-device-mobile',
            label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z" /></svg>`,
            attributes: { title: 'Mobile' },
        }
      );
  } else {
      // Fixed Mode
      deviceButtons.push(
        {
          id: 'set-view-single',
          command: 'set-view-single',
          label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>`,
          attributes: { title: 'Single Page View' },
          active: true, // Default
          className: 'gjs-four-color'
        }
      );
  }

  // Zoom buttons - only show in fixed mode
  const zoomButtons = config.layoutMode === 'fixed' ? [
    {
      id: 'zoom-in',
      command: 'zoom-in',
      label: `<svg ${iconStyle} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  <path fill="none" d="M0 0h24v24H0V0z"/>
  <path fill="currentColor" d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
</svg>`,
      attributes: { title: 'Zoom In' },
    },
    {
      id: 'zoom-out',
      command: 'zoom-out',
      label: `<svg ${iconStyle} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  <path fill="none" d="M0 0h24v24H0V0z"/>
  <path fill="currentColor" d="M12 10h-5v-1h5v1z"/>
</svg>`,
      attributes: { title: 'Zoom Out' },
    },
    {
      id: 'zoom-reset',
      command: 'zoom-reset',
      label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M13,7H11V13H13V7Z" /></svg>`,
      attributes: { title: 'Zoom 100%' },
    }
  ] : [];

  panels.getPanels().reset([
    {
      id: 'devices-c',
      buttons: deviceButtons,
    },
    {
      id: 'options',
      buttons: [
        {
          id: 'ruler-toggle',
          className: 'btn-toggle-ruler',
          command: 'ruler-visibility',
          context: 'ruler-visibility',
          active: config.layoutMode === 'fixed', // Active by default in fixed mode
          label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1 .9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2v8z" /></svg>`,
          attributes: { title: 'Toggle Rulers' },
        },
        {
          id: 'sw-visibility',
          active: true,
          command: 'sw-visibility',
          context: 'sw-visibility',
          label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M15,5H17V3H15M15,21H17V19H15M11,5H13V3H11M19,5H21V3H19M19,9H21V7H19M19,21H21V19H19M19,13H21V11H19M19,17H21V15H19M3,5H5V3H3M3,9H5V7H3M3,13H5V11H3M3,17H5V15H3M3,21H5V19H3M11,21H13V19H11M7,21H9V19H7M7,5H9V3H7V5Z" /></svg>`,
        },
        ...zoomButtons, // Only show zoom buttons in fixed mode
        {
          id: 'preview',
          context: 'preview',
          command: (editor: Editor) => editor.runCommand('preview'),
          label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" /></svg>`,
        },
        {
          id: 'fullscreen',
          command: 'fullscreen',
          context: 'fullscreen',
          label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z" /></svg>`,
        },
        {
          id: 'export-template',
          command: (editor: Editor) => editor.runCommand('export-template'),
          label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M12.89,3L14.85,3.4L11.11,21L9.15,20.6L12.89,3M19.59,12L16,8.41V5.58L22.42,12L16,18.41V15.58L19.59,12M1.58,12L8,5.58V8.41L4.41,12L8,15.58V18.41L1.58,12Z" /></svg>`,
        },
        {
          id: 'canvas-clear',
          command: (editor: Editor) => editor.runCommand('canvas-clear'),
          label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>`,
        },
      ],
    },
    {
      id: 'views',
      buttons: [
        {
          id: 'open-sm',
          command: 'open-sm',
          active: true,
          label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z" /></svg>`,
        },
        {
          id: 'open-tm',
          command: 'open-tm',
          label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" /></svg>`,
        },
        {
          id: 'open-layers',
          command: 'open-layers',
          label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M12,16L19.36,10.27L21,9L12,2L3,9L4.63,10.27M12,18.54L4.62,12.81L3,14.07L12,21.07L21,14.07L19.37,12.8L12,18.54Z" /></svg>`,
        },
        {
          id: 'open-blocks',
          command: 'open-blocks',
          label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M17,13H13V17H11V13H7V11H11V7H13V11H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" /></svg>`,
        },
      ],
    },
  ]);

});

export default coreSetupPlugin;