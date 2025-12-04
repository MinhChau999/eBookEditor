import grapesjs, { Editor } from 'grapesjs';

interface ThumbnailManager {
  thumbnails: Map<string, ThumbnailData>;
  updateQueue: Set<string>;
  isProcessing: boolean;
}

interface ThumbnailData {
  pageId: string;
  html: string;
  css: string;
  lastUpdated: number;
  element?: HTMLElement;
}

interface ThumbPageOptions {
  thumbnailScale?: number;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  debounceTime?: number;
  customStyles?: string;
}

const thumbPagePlugin = grapesjs.plugins.add('thumbpage', (editor: Editor, options: ThumbPageOptions = {}) => {
  const config = {
    thumbnailScale: 0.07,
    thumbnailWidth: 1000,
    thumbnailHeight: 1414,
    debounceTime: 300,
    customStyles: '',
    ...options,
  };

  const thumbnails: ThumbnailManager = {
    thumbnails: new Map(),
    updateQueue: new Set(),
    isProcessing: false,
  };

  let debounceTimeout: NodeJS.Timeout | null = null;
  let globalStyles = '';

  // ==================== COMMANDS ====================

  editor.Commands.add('thumbpage:get', (editor: Editor, sender?: any, options?: { pageId: string }) => {
    if (!options?.pageId) return null;
    return thumbnails.thumbnails.get(options.pageId) || null;
  });

  editor.Commands.add('thumbpage:getAll', (editor: Editor) => {
    return Array.from(thumbnails.thumbnails.values());
  });

  editor.Commands.add('thumbpage:update', (editor: Editor, sender?: any, options?: { pageId?: string }) => {
    if (options?.pageId) {
      queueThumbnailUpdate(options.pageId);
    } else {
      // Update all page thumbnails
      const pages = editor.Pages.getAll();
      pages.forEach(page => queueThumbnailUpdate(String(page.id)));
    }
  });

  editor.Commands.add('thumbpage:generate', (editor: Editor, sender?: any, options?: { pageId: string; container?: HTMLElement }) => {
    const { pageId, container } = options || {};
    if (!pageId) return null;

    const pages = editor.Pages.getAll();
    const page = pages.find(p => String(p.id) === pageId);
    if (!page) return null;

    return generateThumbnail(page, container);
  });

  editor.Commands.add('thumbpage:clear', (editor: Editor, sender?: any, options?: { pageId?: string }) => {
    if (options?.pageId) {
      const thumbnail = thumbnails.thumbnails.get(options.pageId);
      if (thumbnail?.element) {
        thumbnail.element.remove();
      }
      thumbnails.thumbnails.delete(options.pageId);
      thumbnails.updateQueue.delete(options.pageId);
    } else {
      // Clear all thumbnails
      thumbnails.thumbnails.forEach((thumbnail) => {
        if (thumbnail.element) {
          thumbnail.element.remove();
        }
      });
      thumbnails.thumbnails.clear();
      thumbnails.updateQueue.clear();
    }
  });

  // ==================== THUMBNAIL GENERATION ====================

  // Simple hash function for content comparison
  const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  };

  const generateThumbnail = (page: any, container?: HTMLElement): ThumbnailData | null => {
    try {
      const pageId = String(page.id);
      const mainComponent = page.getMainComponent?.();

      if (!mainComponent) {
        console.warn(`No main component found for page ${pageId}`);
        return null;
      }

      const html = mainComponent.toHTML();
      const css = editor.getCss() + globalStyles;
      
      // Check if content has changed using hash
      const contentHash = simpleHash(html + css);
      const existingThumbnail = thumbnails.thumbnails.get(pageId);
      
      if (existingThumbnail) {
        const existingHash = simpleHash(existingThumbnail.html + existingThumbnail.css);
        if (contentHash === existingHash && !container) {
          // Content hasn't changed, return existing thumbnail
          return existingThumbnail;
        }
      }

      const thumbnailData: ThumbnailData = {
        pageId,
        html,
        css,
        lastUpdated: Date.now(),
      };

      if (container) {
        renderThumbnailToContainer(thumbnailData, container);
      }

      thumbnails.thumbnails.set(pageId, thumbnailData);
      return thumbnailData;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  };

  const renderThumbnailToContainer = (thumbnail: ThumbnailData, container: HTMLElement) => {
    const { html, css } = thumbnail;

    const convertVhToPixels = (styles: string) => {
      const vhInPixels = 1414;
      return styles.replace(/(\d+(?:\.\d+)?)vh/g, `${vhInPixels}px`);
    };

    const srcDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            ${css}
            ${convertVhToPixels(config.customStyles)}
            body {
              overflow: hidden;
              background-color: white;
              transform: scale(${config.thumbnailScale});
              transform-origin: top left;
              width: ${config.thumbnailWidth}px;
              min-height: ${config.thumbnailHeight}px;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        ${html}
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.srcdoc = srcDoc;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      pointer-events: none;
      background-color: #fff;
    `;
    iframe.title = `Page ${thumbnail.pageId}`;

    container.innerHTML = '';
    container.appendChild(iframe);
    thumbnail.element = iframe;
  };

  // ==================== UPDATE QUEUE MANAGEMENT ====================

  const queueThumbnailUpdate = (pageId: string) => {
    thumbnails.updateQueue.add(pageId);

    if (!thumbnails.isProcessing) {
      processUpdateQueue();
    }
  };

  const processUpdateQueue = () => {
    if (thumbnails.updateQueue.size === 0) {
      thumbnails.isProcessing = false;
      return;
    }

    thumbnails.isProcessing = true;

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(() => {
      const pageIds = Array.from(thumbnails.updateQueue);
      thumbnails.updateQueue.clear();

      pageIds.forEach(pageId => {
        const pages = editor.Pages.getAll();
        const page = pages.find(p => String(p.id) === pageId);
        if (page) {
          generateThumbnail(page);
        }
      });

      editor.trigger('thumbpage:updated', { pageIds });
      thumbnails.isProcessing = false;

      // Process any new updates that came in during processing
      if (thumbnails.updateQueue.size > 0) {
        processUpdateQueue();
      }
    }, config.debounceTime);
  };

  // ==================== EVENT HANDLERS ====================

  // Throttle helper
  let eventThrottle: NodeJS.Timeout | null = null;
  const throttleDelay = 100; // ms

  const throttledUpdate = (pageId: string) => {
    if (eventThrottle) return; // Skip if already scheduled
    
    eventThrottle = setTimeout(() => {
      queueThumbnailUpdate(pageId);
      eventThrottle = null;
    }, throttleDelay);
  };

  editor.on('load', () => {

    // Listen to component changes with throttle
    editor.on('component:update', () => {
      const selectedPage = editor.Pages.getSelected();
      if (selectedPage) {
        throttledUpdate(String(selectedPage.id));
      }
    });

    editor.on('component:add', () => {
      const selectedPage = editor.Pages.getSelected();
      if (selectedPage) {
        throttledUpdate(String(selectedPage.id));
      }
    });

    editor.on('component:remove', () => {
      const selectedPage = editor.Pages.getSelected();
      if (selectedPage) {
        throttledUpdate(String(selectedPage.id));
      }
    });

    // Listen to style changes with throttle
    editor.on('style:change', () => {
      const selectedPage = editor.Pages.getSelected();
      if (selectedPage) {
        throttledUpdate(String(selectedPage.id));
      }
    });

    editor.on('style:update', () => {
      const selectedPage = editor.Pages.getSelected();
      if (selectedPage) {
        throttledUpdate(String(selectedPage.id));
      }
    });

    editor.on('page:remove', (page: any) => {
      editor.runCommand('thumbpage:clear', { pageId: String(page.id) });
    });
  });

  // ==================== UTILITY FUNCTIONS ====================

  const updateGlobalStyles = (styles: string) => {
    globalStyles = styles;
    // Update all thumbnails when global styles change
    const pages = editor.Pages.getAll();
    pages.forEach(page => queueThumbnailUpdate(String(page.id)));
  };

  // Expose utility functions for external use
  (editor as any).thumbpage = {
    updateGlobalStyles,
    generateThumbnail,
    queueThumbnailUpdate,
    getThumbnail: (pageId: string) => thumbnails.thumbnails.get(pageId),
    getAllThumbnails: () => Array.from(thumbnails.thumbnails.values()),
  };

  // Cleanup on editor destroy
  editor.on('destroy', () => {
    // Clear debounce timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      debounceTimeout = null;
    }
    
    // Clear throttle timeout
    if (eventThrottle) {
      clearTimeout(eventThrottle);
      eventThrottle = null;
    }
    
    // Clear all thumbnail elements
    thumbnails.thumbnails.forEach((thumbnail) => {
      if (thumbnail.element) {
        thumbnail.element.remove();
      }
    });
    
    // Clear maps
    thumbnails.thumbnails.clear();
    thumbnails.updateQueue.clear();
  });
});

export default thumbPagePlugin;