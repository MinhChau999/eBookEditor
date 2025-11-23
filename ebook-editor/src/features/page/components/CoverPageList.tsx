import React, { useState, useEffect } from 'react';
import { PageThumbnail } from './PageThumbnail';

interface CoverPageListProps {
  editor: any;
}

export const CoverPageList: React.FC<CoverPageListProps> = ({ editor }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [coverPages, setCoverPages] = useState<any[]>([]);

  const updateCoverPages = () => {
    const allPages = editor.Pages.getAll();
    const covers = allPages.filter((page: any, index: number) => {
      const attributes = page.get('attributes');
      const pageName = (page.get('name') || '').toLowerCase();
      return attributes?.type === 'cover' || 
             index === 0 || 
             pageName.includes('cover') || 
             pageName.includes('bìa');
    });
    setCoverPages(covers);
  };

  useEffect(() => {
    updateCoverPages();
    editor.on('page:add page:remove page:update page:select', updateCoverPages);
    return () => {
      editor.off('page:add page:remove page:update page:select', updateCoverPages);
    };
  }, [editor]);

  const handleSelectPage = (page: any) => {
    editor.Pages.select(page.getId());
  };

  const handleDeletePage = (e: React.MouseEvent, page: any) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this cover page?')) {
      editor.Pages.remove(page.getId());
    }
  };

  if (coverPages.length === 0) {
    return null;
  }

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

