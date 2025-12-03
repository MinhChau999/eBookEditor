import React from 'react';
import { useBookStore } from '../../../core/store/bookStore';

interface PageThumbnailPluginProps {
  page: {
    id: string;
    getMainComponent?: () => {
      toHTML: () => string;
    };
  };
  pageNumber: number | string;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  editor: {
    runCommand: (command: string, options?: any) => any;
    on: (event: string, callback: (data?: any) => void) => void;
    off: (event: string, callback: (data?: any) => void) => void;
  };
  hideMasterIndicator?: boolean;
  minimal?: boolean;
}

export const PageThumbnailPlugin: React.FC<PageThumbnailPluginProps> = ({
  page,
  pageNumber,
  isActive,
  onSelect,
  onDelete,
  editor,
  hideMasterIndicator,
  minimal
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const currentBook = useBookStore((state: { currentBook?: { styles?: string } | null }) => state.currentBook);

  // Update thumbnail function
  const updateThumbnail = React.useCallback(() => {
    if (!containerRef.current || !page?.id || !isActive) return;

    setIsUpdating(true);

    try {
      const thumbnail = editor.runCommand('thumbpage:generate', {
        pageId: page.id,
        container: containerRef.current
      });

      if (thumbnail) {
        console.log(`Thumbnail updated for page ${page.id}`);
      }
    } catch (error) {
      console.error('Error updating thumbnail:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [editor, page.id, isActive]);

  // Initialize thumbnail on mount
  React.useEffect(() => {
    if (page?.id && containerRef.current) {
      updateThumbnail();
    }
  }, [page?.id, updateThumbnail]);

  // Listen to thumbnail update events
  React.useEffect(() => {
    if (!isActive) return;

    const handleThumbnailUpdate = (data: { pageIds?: string[] }) => {
      if (!data?.pageIds || data.pageIds.includes(page.id)) {
        updateThumbnail();
      }
    };

    editor.on('thumbpage:updated', handleThumbnailUpdate);

    return () => {
      editor.off('thumbpage:updated', handleThumbnailUpdate);
    };
  }, [editor, page.id, isActive, updateThumbnail]);

  // Update global styles when book changes
  React.useEffect(() => {
    if (currentBook?.styles && (editor as any).thumbpage) {
      (editor as any).thumbpage.updateGlobalStyles(currentBook.styles);
    }
  }, [currentBook?.styles, editor]);

  return (
    <div
      className={`page-item ${isActive ? 'page-active' : ''} ${isUpdating ? 'page-updating' : ''}`}
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
          {isUpdating && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '12px',
              color: '#666',
              zIndex: 1
            }}>
              Updating...
            </div>
          )}
          <div
            ref={containerRef}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative'
            }}
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