import grapesjs from 'grapesjs';
import { createRoot } from 'react-dom/client';

export default grapesjs.plugins.add('reflow-adapter', (editor) => {
  let navRoot: ReturnType<typeof createRoot> | null = null;
  
  const onModeChange = ({ mode }: { mode: 'reflow' | 'fixed' }) => {
    if (mode === 'reflow') {
      enableReflowMode();
    } else {
      disableReflowMode();
    }
  };

  const enableReflowMode = () => {
    const canvas = editor.Canvas;
    const frameEl = canvas.getFrameEl();
    const frameBody = canvas.getBody();

    if (frameEl) {
      // Make canvas fluid
      frameEl.style.width = '100%';
      frameEl.style.height = '100%';
      frameEl.style.maxWidth = '800px'; // Max reading width
      frameEl.style.margin = '0 auto';
      frameEl.style.display = 'block';
      frameEl.style.backgroundColor = '#fff'; // White background for reading
    }

    // Handle .page-container from Fixed Mode
    if (frameBody) {
      const pageContainer = frameBody.querySelector('.page-container') as HTMLElement;
      if (pageContainer) {
        // Reset fixed styles to allow reflow
        pageContainer.style.position = 'static';
        pageContainer.style.width = '100%';
        pageContainer.style.height = 'auto';
        pageContainer.style.minHeight = '100%';
        pageContainer.style.top = 'auto';
        pageContainer.style.left = 'auto';
        pageContainer.style.transform = 'none';
        pageContainer.style.boxShadow = 'none';
        pageContainer.style.overflow = 'visible';
        pageContainer.style.backgroundColor = 'transparent';
        
        // Remove spread guide if present
        const spreadGuide = pageContainer.querySelector('.spread-guide');
        if (spreadGuide) spreadGuide.remove();
      }
    }

    // Create a container for Chapter Navigation (Left Sidebar replacement/overlay)
    // REMOVED: We now use the unified StructurePanel for both modes.
    // The StructurePanel persists in the left sidebar and handles navigation.
  };

  const disableReflowMode = () => {
    const canvas = editor.Canvas;
    const frameEl = canvas.getFrameEl();

    if (frameEl) {
      // Reset to default (Fixed Layout handles its own sizing)
      frameEl.style.width = '';
      frameEl.style.height = '';
      frameEl.style.maxWidth = '';
      frameEl.style.margin = '';
      frameEl.style.display = '';
    }

    // Restore Left Panel - No longer needed as we don't hide it
  };

  editor.on('mode:change', onModeChange);

  // Check initial mode
  // We can't easily get the "current mode" state from core-setup without a shared state or querying the DOM.
  // But core-setup triggers 'load' which calls updateMode('reflow'), so we should catch the event.
});
