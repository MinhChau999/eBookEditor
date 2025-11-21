import React from 'react';
import grapesjs, { Editor } from 'grapesjs';
import { createRoot } from 'react-dom/client';
import { useBookStore } from '../../core/store/bookStore';
import { PAGE_TEMPLATES } from '../../features/fixed-layout/utils/pageTemplates';
import { PageSizeControls } from '../../features/fixed-layout/components/PageSizeControls';
import { ZoomControls } from '../../features/fixed-layout/components/ZoomControls';
import '../../features/fixed-layout/styles/fixed-layout.css';
import '../../features/fixed-layout/styles/grid.css';

export interface CoreSetupOptions {
  textCleanCanvas?: string;
}

export default grapesjs.plugins.add('core-setup', (editor: Editor, options: CoreSetupOptions = {}) => {
  const config = {
    textCleanCanvas: 'Are you sure you want to clear the canvas?',
    ...options,
  };

  // DeviceManager is now configured in Editor.tsx


  const commands = editor.Commands;
  const panels = editor.Panels;

  // --- Fixed Layout Logic ---
  let layoutRoot: ReturnType<typeof createRoot> | null = null;

  const updateCanvasSize = () => {
    const { currentBook } = useBookStore.getState();
    const templateId = currentBook?.template || 'A4_PORTRAIT';
    const template = PAGE_TEMPLATES[templateId];
    const container = editor.getContainer();
    const isSpread = container?.classList.contains('gjs-view-spread');

    if (template) {
      const frameBody = editor.Canvas.getBody();
      
      if (frameBody) {
        const widthVal = isSpread ? template.width * 2 : template.width;
        const width = `${widthVal}${template.unit}`;
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

        // Inject/Update Page Container
        let pageContainer = frameBody.querySelector('.page-container') as HTMLElement;
        if (!pageContainer) {
            pageContainer = document.createElement('section');
            pageContainer.className = 'page-container';
            while (frameBody.firstChild) {
                pageContainer.appendChild(frameBody.firstChild);
            }
            frameBody.appendChild(pageContainer);
        }

        // Apply Strict Dimensions
        pageContainer.style.width = `${width}${template.unit}`;
        pageContainer.style.height = `${template.height}${template.unit}`;
        pageContainer.style.minHeight = `${template.height}${template.unit}`;
        
        // Add bleed guide class
        pageContainer.classList.add('page-bleed-guide');

        // Handle Spread Guide
        let spreadGuide = pageContainer.querySelector('.spread-guide');
        if (isSpread) {
            if (!spreadGuide) {
                spreadGuide = document.createElement('div');
                spreadGuide.className = 'spread-guide';
                (spreadGuide as HTMLElement).style.position = 'absolute';
                (spreadGuide as HTMLElement).style.top = '0';
                (spreadGuide as HTMLElement).style.bottom = '0';
                (spreadGuide as HTMLElement).style.left = '50%';
                (spreadGuide as HTMLElement).style.width = '1px';
                (spreadGuide as HTMLElement).style.backgroundColor = '#ddd';
                (spreadGuide as HTMLElement).style.zIndex = '100';
                (spreadGuide as HTMLElement).style.pointerEvents = 'none';
                pageContainer.appendChild(spreadGuide);
            }
        } else {
            if (spreadGuide) {
                spreadGuide.remove();
            }
        }
      }
    }
  };

  const mountLayoutControls = () => {
      const mountPoint = document.querySelector('.gjs-pn-btn.layout-controls-mount');
      if (mountPoint && !layoutRoot) {
          mountPoint.innerHTML = ''; 
          (mountPoint as HTMLElement).style.width = 'auto';
          (mountPoint as HTMLElement).style.padding = '0 10px';
          
          layoutRoot = createRoot(mountPoint);
          layoutRoot.render(
              <div className="fixed-layout-controls" onClick={(e) => e.stopPropagation()}>
                  <PageSizeControls />
                  <ZoomControls editor={editor} />
              </div>
          );
      }
  };

  const unmountLayoutControls = () => {
      if (layoutRoot) {
          layoutRoot.unmount();
          layoutRoot = null;
      }
      const mountPoint = document.querySelector('.gjs-pn-btn.layout-controls-mount');
      if (mountPoint) {
          mountPoint.innerHTML = '';
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

  // --- Commands ---

  // Layout Mode commands
  const updateMode = (mode: 'reflow' | 'fixed') => {
    const container = editor.getContainer();
    if (container) {
      container.classList.remove('gjs-mode-reflow', 'gjs-mode-fixed');
      container.classList.add(`gjs-mode-${mode}`);
    }
    
    // Switch Device
    editor.Devices.select(mode);
    
    const pn = editor.Panels;
    const btnReflow = pn.getButton('devices-c', 'set-mode-reflow');
    const btnFixed = pn.getButton('devices-c', 'set-mode-fixed');
    const btnSpread = pn.getButton('devices-c', 'toggle-spread');

    if (btnReflow) btnReflow.set('active', mode === 'reflow');
    if (btnFixed) btnFixed.set('active', mode === 'fixed');
    
    // Show/Hide Spread button based on mode
    if (btnSpread) {
        if (mode === 'fixed') {
            btnSpread.set('visible', true);
        } else {
            btnSpread.set('visible', false);
            btnSpread.set('active', false); // Reset spread when leaving fixed mode
            if (container) container.classList.remove('gjs-view-spread');
        }
    }

    // Trigger Logic
    if (mode === 'fixed') {
        updateCanvasSize();
        mountLayoutControls();
        editor.runCommand('ruler-visibility');
    } else {
        enableReflowMode();
        unmountLayoutControls();
        editor.stopCommand('ruler-visibility');
    }

    editor.trigger('mode:change', { mode });
  };

  commands.add('set-mode-reflow', {
    run: () => {
      updateMode('reflow');
      console.log('Switched to Reflow Mode');
    },
  });

  commands.add('set-mode-fixed', {
    run: () => {
      updateMode('fixed');
      console.log('Switched to Fixed Layout Mode');
    },
  });

  commands.add('toggle-spread', {
    run: (editor: Editor) => {
        const container = editor.getContainer();
        if (container) {
            container.classList.toggle('gjs-view-spread');
            console.log('Toggled Spread View');
            // Update canvas if in fixed mode
            if (editor.Devices.getSelected()?.id === 'fixed') {
                updateCanvasSize();
            }
        }
    }
  });

  commands.add('fixed:update-canvas', updateCanvasSize);

  // Initialize default mode
  editor.on('load', () => {
    // Default to fixed
    updateMode('fixed');
  });

  // Canvas clear
  commands.add('canvas-clear', (editor: Editor) => {
    return confirm(config.textCleanCanvas) && editor.runCommand('core:canvas-clear');
  });

  // --- Panels ---

  const iconStyle = 'style="display: block; max-width:22px"';

  const editorConfig = editor.getConfig();
  editorConfig.showDevices = false;

  // Reset panels to a clean state
  panels.getPanels().reset([
    {
      id: 'left-sidebar',
      buttons: [], // Will be populated by adapters
    },
    {
      id: 'panel-top',
      el: '.panel-top',
    },
    {
      id: 'panel-basic-actions',
      el: '.panel-basic-actions',
      buttons: [
        {
          id: 'visibility',
          active: true, // active by default
          className: 'btn-toggle-borders',
          label: '<u>B</u>',
          command: 'sw-visibility', // Built-in command
        },
        {
          id: 'export',
          className: 'btn-open-export',
          label: 'Exp',
          command: 'export-template',
          context: 'export-template', // For grouping context of buttons from the same panel
        },
        {
          id: 'import-book',
          className: 'fa fa-upload',
          command: 'import-book',
          attributes: { title: 'Import eBook (EPUB)' }
        },
        {
          id: 'preview',
          className: 'fa fa-eye',
          command: 'core:preview',
          attributes: { title: 'Preview' }
        },
        {
          id: 'export-book',
          className: 'fa fa-download',
          command: 'open-export-modal',
          attributes: { title: 'Export eBook' }
        },
        {
          id: 'show-json',
          className: 'btn-show-json',
          label: 'JSON',
          context: 'show-json',
          command: (editor: Editor) => {
            editor.runCommand('core:canvas-clear'); // Just for testing
            console.log('Components:', editor.getComponents());
          },
        },
        {
            id: 'undo',
            className: 'fa fa-undo',
            command: 'core:undo',
        },
        {
            id: 'redo',
            className: 'fa fa-repeat',
            command: 'core:redo',
        },
        {
            id: 'layout-controls-mount',
            className: 'layout-controls-mount',
            label: '',
            command: 'custom-layout-controls',
        }
      ],
    },
    {
      id: 'commands',
      buttons: [{}],
    },
    {
      id: 'devices-c',
      buttons: [
        {
          id: 'set-mode-reflow',
          command: 'set-mode-reflow',
          active: true,
          label: 'Reflow',
          attributes: { title: 'Reflowable Layout' }
        },
        {
          id: 'set-mode-fixed',
          command: 'set-mode-fixed',
          label: 'Fixed',
          attributes: { title: 'Fixed Layout' }
        },
        {
          id: 'toggle-spread',
          command: 'toggle-spread',
          label: '<i class="fas fa-book-open"></i>',
          attributes: { title: 'Toggle Spread View' },
          togglable: true,
          visible: false // Hidden by default (only for fixed mode)
        },
      ],
    },
    {
      id: 'options',
      buttons: [
        {
          id: 'sw-visibility',
          command: 'sw-visibility',
          context: 'sw-visibility',
          label: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M15,5H17V3H15M15,21H17V19H15M11,5H13V3H11M19,5H21V3H19M19,9H21V7H19M19,21H21V19H19M19,13H21V11H19M19,17H21V15H19M3,5H5V3H3M3,9H5V7H3M3,13H5V11H3M3,17H5V15H3M3,21H5V19H3M11,21H13V19H11M7,21H9V19H7M7,5H9V3H7V5Z" /></svg>`,
        },
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

  // --- Sidebar Tab Management ---
  // (Moved to left-panel plugin)
});
