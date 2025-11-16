/*!
 * grapesjs-setup - 1.0.0
 * Custom setup plugin for eBook editor
 * Based on grapesjs-preset-webpage but modified for better eBook editing experience
 */
import grapesjs from 'grapesjs';

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

    // Create custom left sidebar content
    const leftSidebarPanel = document.createElement('div');
    leftSidebarPanel.className = 'gjs-pn-panel gjs-pn-left-sidebar gjs-one-bg gjs-two-color';
    leftSidebarPanel.id = 'gjs-left-sidebar';
    leftSidebarPanel.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: var(--gjs-left-width, 15%);
      height: 100%;
      z-index: 1;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    `;

    // Header
    const header = document.createElement('div');
    header.className = 'gjs-pn-header';
    header.style.cssText = `
      height: 40px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      padding: 0 15px;
      font-size: 14px;
      font-weight: 500;
    `;
    header.innerHTML = '📚 Document';

    // Content area
    const content = document.createElement('div');
    content.className = 'gjs-pn-content';
    content.style.cssText = `
      flex: 1;
      padding: 15px;
      overflow-y: auto;
    `;

    // Add pages section
    const pagesSection = document.createElement('div');
    pagesSection.innerHTML = `
      <div style="font-size: 12px; color: var(--gjs-secondary-color); margin-bottom: 10px; text-transform: uppercase;">Pages</div>
      <div style="margin-bottom: 10px;">
        <button class="gjs-pn-btn" style="width: 100%; padding: 8px; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: var(--gjs-secondary-color); border-radius: 3px; cursor: pointer;">
          + Add New Page
        </button>
      </div>
      <div class="gjs-pages-list" style="display: flex; flex-direction: column; gap: 5px;">
        <div class="gjs-page-item" style="padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid transparent; border-radius: 3px; cursor: pointer; display: flex; align-items: center; gap: 10px;">
          <div style="width: 30px; height: 20px; background: var(--gjs-ui-primary-color, #4a8c87); border-radius: 2px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">1</div>
          <div style="flex: 1;">
            <div style="font-size: 12px; color: var(--gjs-secondary-color);">Page 1</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.5);">Cover page</div>
          </div>
        </div>
        <div class="gjs-page-item" style="padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid transparent; border-radius: 3px; cursor: pointer; display: flex; align-items: center; gap: 10px;">
          <div style="width: 30px; height: 20px; background: var(--gjs-ui-primary-color, #4a8c87); border-radius: 2px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">2</div>
          <div style="flex: 1;">
            <div style="font-size: 12px; color: var(--gjs-secondary-color);">Page 2</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.5);">Chapter 1</div>
          </div>
        </div>
      </div>
    `;

    content.appendChild(pagesSection);
    leftSidebarPanel.appendChild(header);
    leftSidebarPanel.appendChild(content);

    // Add left sidebar to editor container when editor loads
    editor.on('load', () => {
      const editorContainer = editor.getContainer();
      if (editorContainer) {
        editorContainer.appendChild(leftSidebarPanel);

        // Adjust canvas to account for left sidebar and right panels
        const canvas = editorContainer.querySelector('.gjs-cv-canvas') as HTMLElement;
        if (canvas) {
          canvas.style.marginLeft = 'var(--gjs-left-width, 15%)';
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