import React, { useEffect, useState } from 'react';
import { PageThumbnail } from './PageThumbnail';

interface PageListProps {
  editor: any;
  viewMode: 'spreads' | 'single';
}

export const PageList: React.FC<PageListProps> = ({ editor, viewMode }) => {
  const [localPages, setLocalPages] = useState<any[]>([]);

  const updatePages = () => {
    const allPages = editor.Pages.getAll();
    setLocalPages([...allPages]);
  };

  useEffect(() => {
    updatePages();
    
    editor.on('page:add page:remove page:update page:select', updatePages);
    return () => {
      editor.off('page:add page:remove page:update page:select', updatePages);
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
    
    // Filter out cover pages - they are handled by CoverPageList component
    const nonCoverPages = localPages.filter((page, index) => {
      const attributes = page.get('attributes');
      const pageName = (page.get('name') || '').toLowerCase();
      
      const isCover = attributes?.type === 'cover' || 
                      index === 0 || 
                      pageName.includes('cover') || 
                      pageName.includes('bìa');
      
      return !isCover;
    });

    // Render spreads from non-cover pages
    for (let i = 0; i < nonCoverPages.length; i += 2) {
      const leftPage = nonCoverPages[i];
      const rightPage = nonCoverPages[i + 1];

      spreads.push(
        <div key={`spread-${i}`} className="page-spread">
          {/* Left Page */}
          <PageThumbnail
            page={leftPage}
            pageNumber={i + 1}
            isActive={editor.Pages.getSelected()?.getId() === leftPage.getId()}
            onSelect={() => handleSelectPage(leftPage)}
            onDelete={(e) => handleDeletePage(e, leftPage)}
            editor={editor}
          />

          {/* Right Page (if exists) */}
          {rightPage && (
            <PageThumbnail
              page={rightPage}
              pageNumber={i + 2}
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
    // Filter out cover pages - they are handled by CoverPageList component
    const nonCoverPages = localPages.filter((page, index) => {
      const attributes = page.get('attributes');
      const pageName = (page.get('name') || '').toLowerCase();
      
      const isCover = attributes?.type === 'cover' || 
                      index === 0 || 
                      pageName.includes('cover') || 
                      pageName.includes('bìa');
      
      return !isCover;
    });

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', padding: '0 8px' }}>
        {nonCoverPages.map((page, index) => (
          <div key={page.getId()} style={{ display: 'flex', justifyContent: 'center' }}>
            <PageThumbnail
              page={page}
              pageNumber={index + 1}
              isActive={editor.Pages.getSelected()?.getId() === page.getId()}
              onSelect={() => handleSelectPage(page)}
              onDelete={(e) => handleDeletePage(e, page)}
              editor={editor}
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
    </div>
  );
};
