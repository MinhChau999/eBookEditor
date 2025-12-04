import React, { useState, useEffect, useCallback } from 'react';
import { PageThumbnail } from './PageThumbnail';

interface CoverPageListProps {
  editor: any;
}

// Internal component that re-renders when editor changes
const CoverPagesContent: React.FC<{ editor: any }> = ({ editor }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get initial cover pages
  const getCoverPages = useCallback(() => {
    const allPages = editor.Pages.getAll();
    return allPages.filter((page: any) => {
      const attributes = page.get('attributes');
      return attributes?.type === 'cover';
    });
  }, [editor]);

  const [coverPages, setCoverPages] = useState<any[]>(getCoverPages);

  // Update cover pages when editor events fire
  const updateCoverPages = useCallback(() => {
    setCoverPages(getCoverPages());
  }, [getCoverPages]);

  useEffect(() => {
    editor.on('page:add page:remove page:update page:select', updateCoverPages);
    return () => {
      editor.off('page:add page:remove page:update page:select', updateCoverPages);
    };
  }, [editor, updateCoverPages]);

  const handleSelectPage = (page: any) => {
    editor.Pages.select(page.getId());
  };

  const handleDeletePage = (e: React.MouseEvent, page: any) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this cover page?')) {
      editor.Pages.remove(page.getId());
    }
  };

  const handleCreateCoverPage = useCallback(() => {
    // Always create a cover page if none exists
    editor.Pages.add({
      name: 'Cover Page',
      attributes: {
        type: 'cover'
      },
      component: '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 18px;">Empty Cover Page</div>'
    });
  }, [editor]);

  // Ensure there's always a cover page
  useEffect(() => {
    if (coverPages.length === 0) {
      handleCreateCoverPage();
    }
  }, [coverPages.length, handleCreateCoverPage]);

  return (
    <div className="cover-pages-section">
      <div
        className={`cover-pages-header ${!isExpanded ? 'collapsed' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <i className="fas fa-book-open" style={{ marginRight: '8px', fontSize: '10px' }}></i>
        <span>Cover Pages</span>
      </div>

      {isExpanded && (
        <div className="cover-pages-list">
          {coverPages.map((page: any) => {
            const isActive = editor.Pages.getSelected()?.getId() === page.getId();
            const pageName = page.get('name') || 'Cover';

            return (
              <div key={page.getId()} style={{ display: 'flex', justifyContent: 'center' }}>
                <PageThumbnail
                  page={page}
                  pageNumber={pageName}
                  isActive={isActive}
                  onSelect={() => handleSelectPage(page)}
                  onDelete={(e) => handleDeletePage(e, page)}
                  editor={editor}
                  hideMasterIndicator={true}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const CoverPageList: React.FC<CoverPageListProps> = ({ editor }) => {
  // Use key to force re-render when editor instance changes
  return <CoverPagesContent key={editor?.id || 'editor'} editor={editor} />;
};

