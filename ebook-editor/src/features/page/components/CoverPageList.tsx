import React, { useState, useEffect } from 'react';
import { CoverPageThumbnail } from './CoverPageThumbnail';

interface CoverPageListProps {
  editor: any;
}

export const CoverPageList: React.FC<CoverPageListProps> = ({ editor }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [coverPages, setCoverPages] = useState<any[]>([]);

  const updateCoverPages = () => {
    const allPages = editor.Pages.getAll();
    console.log('All pages:', allPages.map((p: any) => ({ 
      id: p.getId(), 
      name: p.get('name'),
      attributes: p.get('attributes'),
      index: allPages.indexOf(p)
    })));
    
    // Filter to only get cover type pages
    // Check both attributes.type and if it's the first page
    const covers = allPages.filter((page: any, index: number) => {
      const attributes = page.get('attributes');
      const pageName = (page.get('name') || '').toLowerCase();
      
      // Cover page is either:
      // 1. Has type === 'cover' in attributes
      // 2. Is first page (index 0)
      // 3. Page name contains 'cover' or 'bìa'
      return attributes?.type === 'cover' || 
             index === 0 || 
             pageName.includes('cover') || 
             pageName.includes('bìa');
    });
    
    console.log('Cover pages found:', covers.length);
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

  // Don't show if no cover pages
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
          {coverPages.map((page) => {
            const isActive = editor.Pages.getSelected()?.getId() === page.getId();
            const pageName = page.get('name') || 'Cover';
            
            return (
              <CoverPageThumbnail
                key={page.getId()}
                pageName={pageName}
                isActive={isActive}
                onSelect={() => handleSelectPage(page)}
                onDelete={(e) => handleDeletePage(e, page)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

