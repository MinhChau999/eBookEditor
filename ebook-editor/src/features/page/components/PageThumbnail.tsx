import React from 'react';
import { useBookStore } from '../../../core/store/bookStore';

interface PageThumbnailProps {
  page: {
    getMainComponent: () => {
      toHTML: () => string;
    };
  };
  pageNumber: number | string;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  editor: {
    getCss: () => string;
    on: (event: string, callback: () => void) => void;
    off: (event: string, callback: () => void) => void;
  };
  hideMasterIndicator?: boolean;
  minimal?: boolean;
}

export const PageThumbnail: React.FC<PageThumbnailProps> = ({ 
  page, 
  pageNumber, 
  isActive, 
  onSelect, 
  onDelete,
  editor,
  hideMasterIndicator,
  minimal
}) => {
  const [html, setHtml] = React.useState('');
  const [css, setCss] = React.useState('');
  const currentBook = useBookStore((state: { currentBook?: { styles?: string } | null }) => state.currentBook);

  React.useEffect(() => {
    if (page && editor) {
      let timeoutId: NodeJS.Timeout;

      // Debounced update function - only update after 300ms of inactivity
      const debouncedUpdate = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setHtml(page.getMainComponent().toHTML());
          setCss(editor.getCss());
        }, 300); // 300ms debounce
      };

      // Initial update (no debounce)
      setHtml(page.getMainComponent().toHTML());
      setCss(editor.getCss());

      let listeners: string[] = [];

      // Only listen to changes if this page is active
      if (isActive) {
        const listenToChanges = () => {
          // Only listen to essential events to reduce noise
          editor.on('component:update', debouncedUpdate);
          editor.on('component:add', debouncedUpdate);
          editor.on('component:remove', debouncedUpdate);
          // Skip style events for now as they can be very frequent
          // editor.on('style:change', debouncedUpdate);
          // editor.on('style:update', debouncedUpdate);

          listeners = ['component:update', 'component:add', 'component:remove'];
        };

        listenToChanges();
      }

      // Cleanup listeners on unmount or when page becomes inactive
      return () => {
        clearTimeout(timeoutId); // Clear pending timeout
        listeners.forEach(event => {
          editor.off(event, debouncedUpdate);
        });
      };
    }
  }, [page, editor, isActive]);

  // Convert vh units to fixed pixels for thumbnail rendering
  const convertVhToPixels = (styles: string) => {
    const vhInPixels = 1414; // 100vh = 1414px in thumbnail scale
    return styles.replace(/(\d+(?:\.\d+)?)vh/g, `${vhInPixels}px`);
  };

  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          ${css}
          ${convertVhToPixels(currentBook?.styles || '')}
          body {
            overflow: hidden;
            background-color: white;
            transform: scale(0.07);
            transform-origin: top left;
            width: 1000px;
            min-height: 1414px;
          }
        </style>
      </head>
      ${html}
    </html>
  `;

  return (
    <div 
      className={`page-item ${isActive ? 'page-active' : ''}`}
      onClick={onSelect}
    >
      {!minimal && (
        <div className="page-actions">
          <button 
            className="page-btn page-settings-btn"
            title="Page Settings"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <i className="fas fa-cog"></i>
          </button>
          <button 
            onClick={onDelete}
            className="page-btn page-delete-btn"
            title="Delete Page"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      )}
      
      {!hideMasterIndicator && !minimal && <div className="master-applied-indicator">A</div>}
      
      <div className="page">
        <div className="page-content" style={{ padding: 0, overflow: 'hidden' }}>
          <iframe
            srcDoc={srcDoc}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              pointerEvents: 'none',
              backgroundColor: '#fff'
            }}
            title={`Page ${pageNumber}`}
          />
        </div>
      </div>
      
      {!minimal && (
        <div className="page-number">
          {pageNumber}
        </div>
      )}
    </div>
  );
};
