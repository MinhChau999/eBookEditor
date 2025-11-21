import grapesjs, { Editor } from 'grapesjs';
import { createRoot } from 'react-dom/client';
import { useBookStore } from '../../core/store/bookStore';
import { PAGE_TEMPLATES } from '../../features/fixed-layout/utils/pageTemplates';
import { PageSizeControls } from '../../features/fixed-layout/components/PageSizeControls';
import { ZoomControls } from '../../features/fixed-layout/components/ZoomControls';
import '../../features/fixed-layout/styles/fixed-layout.css';
import '../../features/fixed-layout/styles/grid.css';

const FixedAdapterPlugin = () => {
  grapesjs.plugins.add('fixed-adapter', (editor: Editor) => {
  
  const updateCanvasSize = () => {
    const { currentBook } = useBookStore.getState();
    const templateId = currentBook?.template || 'A4_PORTRAIT';
    const template = PAGE_TEMPLATES[templateId];
    const container = editor.getContainer();
    const isSpread = container?.classList.contains('gjs-view-spread');

    if (template) {
      const frameEl = editor.Canvas.getFrameEl();
      const frameBody = editor.Canvas.getBody();
      
      if (frameEl && frameBody) {
        const width = isSpread ? template.width * 2 : template.width;
        
        // 1. Reset Frame Styles (Canvas acts as the viewport/desk)
        frameEl.style.width = '100%';
        frameEl.style.height = '100%';
        frameEl.style.maxWidth = 'none';
        frameEl.style.backgroundImage = 'radial-gradient(#d1d1d1 1px, transparent 1px)'; // Subtle grid dots
        frameEl.style.backgroundSize = '20px 20px';

        // 2. Inject/Update Page Container (The actual paper)
        let pageContainer = frameBody.querySelector('.page-container') as HTMLElement;
        if (!pageContainer) {
            // User requested 'section.page-container'
            pageContainer = document.createElement('section');
            pageContainer.className = 'page-container';
            // Move existing content into page container
            while (frameBody.firstChild) {
                pageContainer.appendChild(frameBody.firstChild);
            }
            frameBody.appendChild(pageContainer);
        }

        // 3. Apply Strict Dimensions to Page Container (Artboard)
        pageContainer.style.position = 'absolute';
        pageContainer.style.width = `${width}${template.unit}`;
        pageContainer.style.height = `${template.height}${template.unit}`;
        pageContainer.style.left = '50%';
        pageContainer.style.transform = 'translateX(-50%)';
        pageContainer.style.backgroundColor = '#ffffff';
        // Realistic paper shadow
        pageContainer.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.15), 0 2px 5px rgba(0,0,0,0.1)';
        pageContainer.style.overflow = 'hidden'; // Clip content
        pageContainer.style.minHeight = `${template.height}${template.unit}`; // Ensure height
        
        // Add a visual "bleed" border (optional, for guide)
        pageContainer.style.outline = '1px dashed #ff0000'; // Bleed guide
        pageContainer.style.outlineOffset = '3mm';

        // 4. Handle Spread Guide
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

  // Listen for spread toggle
  editor.on('run:toggle-spread', () => {
      updateCanvasSize();
  });
  
  editor.on('stop:toggle-spread', () => {
      updateCanvasSize();
  });

  let layoutRoot: ReturnType<typeof createRoot> | null = null;

  const mountLayoutControls = () => {
      const mountPoint = document.querySelector('.gjs-pn-btn.layout-controls-mount');
      if (mountPoint && !layoutRoot) {
          // Clear label
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

  // Listen for mode changes
  editor.on('mode:change', ({ mode }) => {
    if (mode === 'fixed') {
      updateCanvasSize();
      mountLayoutControls();
      editor.runCommand('ruler-visibility'); // Enable rulers
    } else {
        unmountLayoutControls();
        editor.stopCommand('ruler-visibility'); // Disable rulers
    }
  });

  // Initial check
  editor.on('load', () => {
     const container = editor.getContainer();
     if (container && container.classList.contains('gjs-mode-fixed')) {
         updateCanvasSize();
         mountLayoutControls();
         editor.runCommand('ruler-visibility');
     }
  });

  editor.Commands.add('fixed:update-canvas', updateCanvasSize);
  });
};

export default FixedAdapterPlugin;
