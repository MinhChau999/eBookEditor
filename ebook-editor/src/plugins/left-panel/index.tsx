/* eslint-disable react-refresh/only-export-components */
import grapesjs, { Editor } from 'grapesjs';
import { createRoot } from 'react-dom/client';
import { StructurePanel } from '../../features/page/components/StructurePanel';

export interface LeftPanelOptions {
  showStructure?: boolean;
  showAssets?: boolean;
  defaultTab?: string;
  [key: string]: unknown;
}

export default grapesjs.plugins.add('left-panel', (editor: Editor, options: LeftPanelOptions = {}) => {
  const config = { ...options };
  console.log('config', config);
  
  // Create the main left panel container
  const headerLeftSidebar = document.createElement('div');
  headerLeftSidebar.className = 'gjs-pn-header-left-sidebar gjs-pn-panel gjs-one-bg gjs-two-color';

  const contentLeftSidebar = document.createElement('div');
  contentLeftSidebar.className = 'gjs-pn-content-left-sidebar gjs-pn-panel gjs-one-bg gjs-two-color left-sidebar-content';

  // Tab configuration
  const leftSidebarTabs = [
    { id: 'book-structure', label: 'Structure', icon: '<svg style="display:block;max-width:18px" viewBox="0 0 24 24"><path fill="currentColor" d="M21,5C19.89,4.65 18.67,4.5 17.5,4.5C15.55,4.5 13.45,4.9 12,6C10.55,4.9 8.45,4.5 6.5,4.5C4.55,4.5 2.45,4.9 1,6V20.65C1,20.9 1.25,21.15 1.5,21.15C1.6,21.15 1.65,21.1 1.75,21.1C3.1,20.45 5.05,20 6.5,20C8.45,20 10.55,20.4 12,21.5C13.35,20.65 15.8,20 17.5,20C19.15,20 20.85,20.3 22.25,21.05C22.35,21.1 22.4,21.1 22.5,21.1C22.75,21.1 23,20.85 23,20.6V6C22.4,5.55 21.75,5.25 21,5M21,18.5C19.9,18.15 18.7,18 17.5,18C15.8,18 13.35,18.65 12,19.5V8C13.35,7.15 15.8,6.5 17.5,6.5C18.7,6.5 19.9,6.65 21,7V18.5Z" /></svg>' },
    { id: 'assets', label: 'Assets', icon: '<svg style="display:block;max-width:18px" viewBox="0 0 24 24"><path fill="currentColor" d="M5,1C3.89,1 3,1.89 3,3V7H5V5H19V19H5V17H3V21A2,2 0 0,0 5,23H19A2,2 0 0,0 21,21V3A2,2 0 0,0 19,1H5M7,9V11H9V9H7M11,9V11H13V9H11M15,9V11H17V9H15M7,13V15H9V13H7M11,13V15H13V13H11M15,13V15H17V13H15Z" /></svg>' }
  ];

  let structurePanelRoot: ReturnType<typeof createRoot> | null = null;

  const createBookStructureView = (container: HTMLElement) => {
    // Mount React StructurePanel
    if (!structurePanelRoot) {
      structurePanelRoot = createRoot(container);
    }
    structurePanelRoot.render(<StructurePanel editor={editor} />);
  };

  const createAssetsView = (container: HTMLElement) => {
     container.innerHTML = '<div style="padding: 20px; text-align: center; color: #aaa;">Assets Panel (Coming Soon)</div>';
  };

  const switchLeftSidebarContent = (tabId: string) => {
    // Unmount React root if switching away from structure
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

  // Create tab buttons
  leftSidebarTabs.forEach((tab, index) => {
    const tabButton = document.createElement('div');
    tabButton.className = `gjs-pn-tab-btn ${index === 0 ? 'gjs-pn-tab-active' : ''}`;
    tabButton.setAttribute('data-tab', tab.id);
    tabButton.title = tab.label;
    tabButton.innerHTML = `<div>${tab.icon}</div><div class="gjs-pn-tab-label">${tab.label}</div>`;
    
    tabButton.addEventListener('click', () => {
      headerLeftSidebar.querySelectorAll('.gjs-pn-tab-btn').forEach(btn => btn.classList.remove('gjs-pn-tab-active'));
      tabButton.classList.add('gjs-pn-tab-active');
      switchLeftSidebarContent(tab.id);
    });
    
    headerLeftSidebar.appendChild(tabButton);
  });

  // Initialize
  editor.on('load', () => {
    const editorContainer = editor.getContainer();
    if (editorContainer) {
      const editorContent = editorContainer.querySelector('.gjs-editor');
      if (editorContent) {
        editorContent.appendChild(headerLeftSidebar);
        editorContent.appendChild(contentLeftSidebar);
        
        // Initialize with default tab
        switchLeftSidebarContent('book-structure');

        // Adjust canvas and panels
        const canvas = editorContainer.querySelector('.gjs-cv-canvas') as HTMLElement;
        if (canvas) {
          canvas.style.left = 'var(--gjs-left-width, 15%)';
          canvas.style.width = 'calc(100% - var(--gjs-left-width, 15%) - var(--gjs-left-width, 15%))';
        }

        const commandsPanel = editorContainer.querySelector('.gjs-pn-commands') as HTMLElement;
        if (commandsPanel) commandsPanel.style.left = 'var(--gjs-left-width, 15%)';

        const devicesPanel = editorContainer.querySelector('.gjs-pn-devices-c') as HTMLElement;
        if (devicesPanel) devicesPanel.style.left = 'var(--gjs-left-width, 15%)';
      }
    }
  });
});
