import grapesjs, { Editor } from 'grapesjs';
import { createRoot, Root } from 'react-dom/client';
import { ClassManagerPanel } from './ClassManagerPanel';

/**
 * Class Manager Plugin for GrapesJS
 * 
 * Provides a centralized panel to manage all CSS classes in the project.
 * Features:
 * - View all classes with usage counts
 * - Search and filter classes
 * - Add, edit, and delete classes
 * - Quick apply classes to selected components
 */
export default grapesjs.plugins.add('class-manager', (editor: Editor) => {
  // Plugin initialization
  let panelContainer: HTMLElement | null = null;
  let reactRoot: Root | null = null;

  /**
   * Create and mount the Class Manager panel
   */
  const createPanel = () => {
    // Find or create the panel container
    const editorContainer = editor.getContainer();
    if (!editorContainer) return;

    // Create a panel in the right sidebar below the trait manager
    const rightPanels = editorContainer.querySelector('.gjs-pn-panels-right');
    if (!rightPanels) return;

    // Create the panel container
    panelContainer = document.createElement('div');
    panelContainer.className = 'gjs-pn-panel class-manager-panel-container';
    panelContainer.style.width = '100%';
    panelContainer.style.display = 'flex';
    panelContainer.style.flexDirection = 'column';

    // Insert the panel after finding the trait manager panel or at the end
    const traitPanel = rightPanels.querySelector('.gjs-pn-panel.gjs-pn-traits');
    if (traitPanel && traitPanel.nextSibling) {
      rightPanels.insertBefore(panelContainer, traitPanel.nextSibling);
    } else {
      rightPanels.appendChild(panelContainer);
    }

    // Mount React component
    reactRoot = createRoot(panelContainer);
    reactRoot.render(<ClassManagerPanel editor={editor} />);
  };

  /**
   * Destroy the panel and cleanup
   */
  const destroyPanel = () => {
    if (reactRoot) {
      setTimeout(() => {
        reactRoot?.unmount();
        reactRoot = null;
      }, 0);
    }

    if (panelContainer && panelContainer.parentNode) {
      panelContainer.parentNode.removeChild(panelContainer);
      panelContainer = null;
    }
  };

  // Initialize panel after editor loads
  editor.on('load', () => {
    // Small delay to ensure all panels are rendered
    setTimeout(() => {
      createPanel();
    }, 100);
  });

  // Cleanup on editor destroy
  editor.on('destroy', () => {
    destroyPanel();
  });
});
