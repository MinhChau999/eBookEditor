import { Editor } from 'grapesjs';
import html2canvas from 'html2canvas';
import { useBookStore } from '../../core/store/bookStore';

// Debounce utility
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const coverSyncPlugin = (editor: Editor) => {
  
  const updateCoverImage = async () => {
    const selectedPage = editor.Pages.getSelected();
    const attributes = selectedPage?.get('attributes') as any;
    const isCover = attributes?.type === 'cover' || 
                    selectedPage?.getName().toLowerCase().includes('cover') ||
                    selectedPage?.getName().toLowerCase().includes('bìa');

    if (!isCover) return;

    const frame = editor.Canvas.getFrameEl();
    if (!frame) return;

    // We need to capture the body of the iframe
    // Note: html2canvas needs to run in the context of the iframe's window if possible, 
    // or we pass the body.
    const iframeBody = editor.Canvas.getBody();
    
    if (!iframeBody) return;

    try {
        // Temporarily remove GrapesJS selection outlines/helpers for clean screenshot
        editor.stopCommand('sw-visibility');
        const selected = editor.getSelected();
        if (selected) {
            editor.selectRemove(selected);
        }

        const canvas = await html2canvas(iframeBody, {
            useCORS: true,
            allowTaint: true,
            logging: false,
            scale: 1, // Lower scale for performance/thumbnail size? Or 1 for quality?
            height: iframeBody.scrollHeight,
            windowWidth: iframeBody.scrollWidth,
            ignoreElements: (element) => {
                // Ignore GrapesJS UI elements if any sneak in
                return element.classList.contains('gjs-frame');
            }
        });

        // Restore visibility
        editor.runCommand('sw-visibility');
        if (selected) editor.select(selected);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 0.7 quality
        
        // Update store
        const currentBook = useBookStore.getState().currentBook;
        if (currentBook) {
            useBookStore.getState().updateBook(currentBook.id, { coverImage: dataUrl });
            console.log('Cover image updated successfully');
        }

    } catch (error) {
        console.error('Failed to update cover image:', error);
        // Restore visibility in case of error
        editor.runCommand('sw-visibility');
    }
  };

  // Debounce the update to avoid performance issues
  // 3 seconds delay after last change
  const debouncedUpdate = debounce(updateCoverImage, 3000);

  // Listen to changes
  editor.on('component:update', debouncedUpdate);
  editor.on('style:update', debouncedUpdate);
  editor.on('block:drag:stop', debouncedUpdate);
  
  // Also update when switching AWAY from cover page (immediate, no debounce needed ideally, but let's reuse)
  editor.on('page:before:change', () => {
      // If we are currently on cover, snapshot before leaving
      const selectedPage = editor.Pages.getSelected();
      const attributes = selectedPage?.get('attributes') as any;
      const isCover = attributes?.type === 'cover';
      if (isCover) {
          updateCoverImage(); // Immediate
      }
  });
};

export default coverSyncPlugin;
