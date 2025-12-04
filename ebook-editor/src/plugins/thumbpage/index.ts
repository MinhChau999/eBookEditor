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
    debounceTime: 100, // Reduced for realtime feel
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

  const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
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
      const newHash = simpleHash(html + css);

      const existingThumbnail = thumbnails.thumbnails.get(pageId);

      const thumbnailData: ThumbnailData = {
        pageId,
        html,
        css,
        lastUpdated: Date.now(),
        element: existingThumbnail?.element
      };

      let shouldRender = true;
      
      if (container && thumbnailData.element) {
        const renderedHash = thumbnailData.element.getAttribute('data-hash');
        if (renderedHash === newHash) {
          shouldRender = false;
        }
      }

      thumbnails.thumbnails.set(pageId, thumbnailData);

      if (container && shouldRender) {
        renderThumbnailToContainer(thumbnailData, container, newHash);
      }

      return thumbnailData;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  };

  const renderThumbnailToContainer = (thumbnail: ThumbnailData, container: HTMLElement, hash?: string) => {
    const { html, css, pageId } = thumbnail;

    const convertVhToPixels = (styles: string) => {
      const vhInPixels = 1414;
      return styles.replace(/(\d+(?:\.\d+)?)vh/g, `${vhInPixels}px`);
    };

    const updateScript = `
      <script>
        window.addEventListener('message', function(event) {
          if (event.data.type === 'UPDATE_CONTENT') {
            try {
              const style = document.createElement('style');
              style.id = 'update-helper';
              style.textContent = '* { transition: none !important; animation: none !important; }';
              document.head.appendChild(style);
              
              if (event.data.html && document.body) {
                document.body.innerHTML = event.data.html;
              }
              
              if (event.data.css) {
                let styleTag = document.getElementById('dynamic-styles');
                if (!styleTag) {
                  styleTag = document.createElement('style');
                  styleTag.id = 'dynamic-styles';
                  document.head.appendChild(styleTag);
                }
                styleTag.textContent = event.data.css;
              }
              
              requestAnimationFrame(function() {
                const helper = document.getElementById('update-helper');
                if (helper) helper.remove();
              });
            } catch (e) {
              console.error('Error updating thumbnail:', e);
            }
          }
        });
      </script>
    `;

    const srcDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style id="dynamic-styles">
            ${css}
            ${convertVhToPixels(config.customStyles)}
          </style>
          <style>
            body {
              overflow: hidden;
              background-color: white;
              transform: scale(${config.thumbnailScale});
              transform-origin: top left;
              width: ${config.thumbnailWidth}px;
              min-height: ${config.thumbnailHeight}px;
              margin: 0;
              padding: 0;
              will-change: contents;
              contain: layout style paint;
            }
          </style>
          ${updateScript}
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    const existingIframe = thumbnail.element as HTMLIFrameElement | undefined;
    
    if (existingIframe && existingIframe.parentElement === container && existingIframe.contentWindow) {
      try {
        existingIframe.contentWindow.postMessage({
          type: 'UPDATE_CONTENT',
          html: html,
          css: css + '\n' + convertVhToPixels(config.customStyles)
        }, '*');
        
        if (hash) existingIframe.setAttribute('data-hash', hash);
        
      } catch (error) {
        console.error('Error sending update to iframe:', error);
        createNewIframe();
      }
    } else {
      createNewIframe();
    }

    function createNewIframe() {
      const newIframe = document.createElement('iframe');
      newIframe.srcdoc = srcDoc;
      newIframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        pointer-events: none;
        background-color: #fff;
      `;
      newIframe.title = `Page ${pageId}`;
      if (hash) newIframe.setAttribute('data-hash', hash);

      container.innerHTML = '';
      container.appendChild(newIframe);
      thumbnail.element = newIframe;
    }
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

      if (thumbnails.updateQueue.size > 0) {
        processUpdateQueue();
      }
    }, config.debounceTime);
  };

  // ==================== EVENT HANDLERS ====================

  let eventThrottle: NodeJS.Timeout | null = null;
  const throttleDelay = 50;

  const throttledUpdate = (pageId: string) => {
    if (eventThrottle) return;
    
    eventThrottle = setTimeout(() => {
      queueThumbnailUpdate(pageId);
      eventThrottle = null;
    }, throttleDelay);
  };

  editor.on('load', () => {
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
    const pages = editor.Pages.getAll();
    pages.forEach(page => queueThumbnailUpdate(String(page.id)));
  };

  (editor as any).thumbpage = {
    updateGlobalStyles,
    generateThumbnail,
    queueThumbnailUpdate,
    getThumbnail: (pageId: string) => thumbnails.thumbnails.get(pageId),
    getAllThumbnails: () => Array.from(thumbnails.thumbnails.values()),
  };

  editor.on('destroy', () => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      debounceTimeout = null;
    }
    
    if (eventThrottle) {
      clearTimeout(eventThrottle);
      eventThrottle = null;
    }
    
    thumbnails.thumbnails.forEach((thumbnail) => {
      if (thumbnail.element) {
        thumbnail.element.remove();
      }
    });
    
    thumbnails.thumbnails.clear();
    thumbnails.updateQueue.clear();
  });
});

export default thumbPagePlugin;