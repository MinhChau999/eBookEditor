import React, { useEffect, useState, useCallback } from 'react';
import { PageThumbnail } from './PageThumbnail';

interface PageListProps {
  editor: any;
  viewMode: 'spreads' | 'single';
}

// Internal component that re-renders when editor changes
const PageListContent: React.FC<{ editor: any; viewMode: 'spreads' | 'single' }> = ({ editor, viewMode }) => {
  const [localPages, setLocalPages] = useState<any[]>([]);

  const updatePages = useCallback(() => {
    const allPages = editor.Pages.getAll();
    setLocalPages([...allPages]);
  }, [editor]);

  useEffect(() => {
    updatePages();
    editor.on('page:add page:remove page:update page:select', updatePages);
    return () => {
      editor.off('page:add page:remove page:update page:select', updatePages);
    };
  }, [editor, updatePages]);

  const handleSelectPage = (page: any) => {
    editor.Pages.select(page.getId());
  };

  const handleDeletePage = (e: React.MouseEvent, page: any) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this page?')) {
      editor.Pages.remove(page.getId());
    }
  };

  // Filter content pages (type: 'content')
  const getContentPages = () => {
    return localPages.filter((page) => {
      const attributes = page.get('attributes');
      return attributes?.type === 'content';
    });
  };

  // Group pages into spreads
  const renderSpreads = () => {
    const spreads = [];
    const contentPages = getContentPages();

    // Render spreads from content pages
    for (let i = 0; i < contentPages.length; i += 2) {
      const leftPage = contentPages[i];
      const rightPage = contentPages[i + 1];

      // Get page numbers from attributes
      const leftPageNumber = leftPage.get('attributes')?.pageNumber || i + 1;
      const rightPageNumber = rightPage ? rightPage.get('attributes')?.pageNumber || i + 2 : null;

      spreads.push(
        <div key={`spread-${i}`} className="page-spread">
          {/* Left Page */}
          <PageThumbnail
            page={leftPage}
            pageNumber={leftPageNumber}
            isActive={editor.Pages.getSelected()?.getId() === leftPage.getId()}
            onSelect={() => handleSelectPage(leftPage)}
            onDelete={(e) => handleDeletePage(e, leftPage)}
            editor={editor}
          />

          {/* Right Page (if exists) */}
          {rightPage && (
            <PageThumbnail
              page={rightPage}
              pageNumber={rightPageNumber}
              isActive={editor.Pages.getSelected()?.getId() === rightPage.getId()}
              onSelect={() => handleSelectPage(rightPage)}
              onDelete={(e) => handleDeletePage(e, rightPage)}
              editor={editor}
            />
          )}
        </div>
      );
    }

    return spreads;
  };

  // Render single pages in a grid
  const renderSinglePages = () => {
    const contentPages = getContentPages();

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', padding: '0 8px' }}>
        {contentPages.map((page) => {
          const pageNumber = page.get('attributes')?.pageNumber;
          return (
            <div key={page.getId()} style={{ display: 'flex', justifyContent: 'center' }}>
              <PageThumbnail
                page={page}
                pageNumber={pageNumber}
                isActive={editor.Pages.getSelected()?.getId() === page.getId()}
                onSelect={() => handleSelectPage(page)}
                onDelete={(e) => handleDeletePage(e, page)}
                editor={editor}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pages-section">
      <div className="pages-list">
        {viewMode === 'spreads' ? renderSpreads() : renderSinglePages()}
      </div>
    </div>
  );
};

export const PageList: React.FC<PageListProps> = ({ editor, viewMode }) => {
  // Use key to force re-render when editor instance changes
  return <PageListContent key={editor?.id || 'editor'} editor={editor} viewMode={viewMode} />;
};
