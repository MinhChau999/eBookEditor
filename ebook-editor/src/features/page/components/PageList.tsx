import React, { useEffect, useState } from 'react';
import { useBookStore } from '../../../core/store/bookStore';
import { PageThumbnail } from './PageThumbnail';

interface PageListProps {
  editor: any;
  viewMode: 'spreads' | 'single';
}

export const PageList: React.FC<PageListProps> = ({ editor, viewMode }) => {
  const { pages, setPages, currentPageId, setCurrentBook } = useBookStore();
  const [localPages, setLocalPages] = useState<any[]>([]);

  const updatePages = () => {
    const allPages = editor.Pages.getAll();
    setLocalPages([...allPages]);
  };

  useEffect(() => {
    updatePages();
    
    editor.on('page:add page:remove page:update', updatePages);
    return () => {
      editor.off('page:add page:remove page:update', updatePages);
    };
  }, [editor]);

  const handleSelectPage = (page: any) => {
    editor.Pages.select(page.getId());
  };

  const handleDeletePage = (e: React.MouseEvent, page: any) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this page?')) {
      editor.Pages.remove(page.getId());
    }
  };

  // Group pages into spreads
  const renderSpreads = () => {
    const spreads = [];
    
    // Cover Page
    if (localPages.length > 0) {
      spreads.push(
        <div key="cover" className="cover-page-container">
          <PageThumbnail
            page={localPages[0]}
            index={0}
            isActive={editor.Pages.getSelected()?.getId() === localPages[0].getId()}
            onSelect={() => handleSelectPage(localPages[0])}
            onDelete={(e) => handleDeletePage(e, localPages[0])}
          />
        </div>
      );
    }

    // Subsequent Spreads
    for (let i = 1; i < localPages.length; i += 2) {
      const leftPage = localPages[i];
      const rightPage = localPages[i + 1];

      spreads.push(
        <div key={`spread-${i}`} className="page-spread">
          {/* Left Page */}
          <PageThumbnail
            page={leftPage}
            index={i}
            isActive={editor.Pages.getSelected()?.getId() === leftPage.getId()}
            onSelect={() => handleSelectPage(leftPage)}
            onDelete={(e) => handleDeletePage(e, leftPage)}
          />

          {/* Right Page (if exists) */}
          {rightPage && (
            <PageThumbnail
              page={rightPage}
              index={i + 1}
              isActive={editor.Pages.getSelected()?.getId() === rightPage.getId()}
              onSelect={() => handleSelectPage(rightPage)}
              onDelete={(e) => handleDeletePage(e, rightPage)}
            />
          )}
        </div>
      );
    }

    return spreads;
  };

  // Render single pages in a grid
  const renderSinglePages = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', padding: '0 8px' }}>
        {localPages.map((page, index) => (
          <div key={page.getId()} style={{ display: 'flex', justifyContent: 'center' }}>
            <PageThumbnail
              page={page}
              index={index}
              isActive={editor.Pages.getSelected()?.getId() === page.getId()}
              onSelect={() => handleSelectPage(page)}
              onDelete={(e) => handleDeletePage(e, page)}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pages-section">
      <div className="pages-list">
        {viewMode === 'spreads' ? renderSpreads() : renderSinglePages()}
      </div>
      
      <div className="pages-panel-footer">
        <div className="page-info">
          <div className="page-info-item">
            <span className="page-info-label">Layout:</span>
            <span className="page-info-value">Fixed</span>
          </div>
          <div className="page-info-item">
            <span className="page-info-label">Size:</span>
            <span className="page-info-value">A4</span>
          </div>
        </div>
        <div className="page-info-item">
          <span className="page-info-label">{localPages.length} pages</span>
        </div>
      </div>
    </div>
  );
};
