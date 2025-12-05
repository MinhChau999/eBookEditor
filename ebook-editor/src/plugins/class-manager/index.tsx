import type { Editor } from 'grapesjs';
import { createRoot } from 'react-dom/client';
import { ClassManagerPanel } from './components/ClassManagerPanel';
import type { ClassManagerOptions } from './types';

/**
 * Global Class Manager Plugin for GrapesJS
 * 
 * Provides a panel to manage all CSS classes in the project with:
 * - List all classes with usage counts
 * - Search and filter functionality
 * - Add, edit, and delete classes
 * - Quick apply classes to selected components
 */
export default function classManager(editor: Editor, opts: ClassManagerOptions = {}) {
  const options: ClassManagerOptions = {
    container: '.gjs-pn-views-container',
    maxVisibleClasses: 100,
    enableQuickApply: true,
    confirmDelete: true,
    ...opts,
  };

  let panelRoot: ReturnType<typeof createRoot> | null = null;
  let panelContainer: HTMLElement | null = null;
  let isVisible = false;

  /**
   * Mount the class manager panel
   */
  const mountPanel = () => {
    if (panelRoot || !editor) return;

    // Find or create container
    const container = document.querySelector(options.container || '.gjs-pn-views-container');
    if (!container) {
      console.error('[Class Manager] Container not found:', options.container);
      return;
    }

    // Create panel container
    panelContainer = document.createElement('div');
    panelContainer.className = 'gjs-class-manager-container';
    panelContainer.style.display = 'none'; // Hidden by default
    container.appendChild(panelContainer);

    // Mount React component
    panelRoot = createRoot(panelContainer);
    panelRoot.render(<ClassManagerPanel editor={editor} />);
  };

  /**
   * Show the class manager panel
   */
  const showPanel = () => {
    if (panelContainer) {
      panelContainer.style.display = 'block';
      isVisible = true;
    }
  };

  /**
   * Hide the class manager panel
   */
  const hidePanel = () => {
    if (panelContainer) {
      panelContainer.style.display = 'none';
      isVisible = false;
    }
  };

  /**
   * Toggle panel visibility
   */
  const togglePanel = () => {
    if (isVisible) {
      hidePanel();
    } else {
      showPanel();
    }
  };

  // Add command to toggle class manager
  editor.Commands.add('open-class-manager', {
    run: () => {
      if (!panelRoot) {
        mountPanel();
      }
      showPanel();
    },
    stop: () => {
      hidePanel();
    },
  });

  // Initialize on editor load
  editor.on('load', () => {
    mountPanel();

    // Add button to panels if desired
    // You can customize this based on where you want the button
    const panelManager = editor.Panels;
    
    // Option 1: Add to views panel (right sidebar)
    const viewsPanel = panelManager.getPanel('views');
    if (viewsPanel) {
      const buttons = viewsPanel.get('buttons');
      if (buttons && !panelManager.getButton('views', 'open-class-manager')) {
        buttons.add([{
          id: 'open-class-manager',
          command: 'open-class-manager',
          label: '<i class="fa fa-css3"></i>',
          attributes: {
            title: 'Class Manager',
          },
          active: false,
        }]);
      }
    }
    
    // Listen to view command events to stop class manager when they run
    // This ensures mutual exclusivity between panels without modifying original commands
    const viewCommands = ['core:open-sm', 'core:open-tm', 'core:open-layers', 'core:open-blocks'];
    viewCommands.forEach(cmdId => {
      editor.on(`run:${cmdId}`, () => {
        editor.stopCommand('open-class-manager');
      });
    });
  });

  // Return API for external access
  return {
    show: showPanel,
    hide: hidePanel,
    toggle: togglePanel,
  };
}
