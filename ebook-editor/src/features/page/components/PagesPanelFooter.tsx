import React, { useEffect, useState } from 'react';
import { useBookStore } from '../../../core/store/bookStore';

interface PagesPanelFooterProps {
  editor: any;
}

export const PagesPanelFooter: React.FC<PagesPanelFooterProps> = ({ editor }) => {
  const { currentBook } = useBookStore();
  const [pageCount, setPageCount] = useState(0);

  const updatePageCount = () => {
    if (editor?.Pages) {
      const allPages = editor.Pages.getAll();
      
      // Filter out cover pages - covers are not counted as pages
      const nonCoverPages = allPages.filter((page: any, index: number) => {
        const attributes = page.get('attributes');
        const pageName = (page.get('name') || '').toLowerCase();
        
        // Cover page is either:
        // 1. Has type === 'cover' in attributes
        // 2. Is first page (index 0)
        // 3. Page name contains 'cover' or 'bìa'
        const isCover = attributes?.type === 'cover' || 
                        index === 0 || 
                        pageName.includes('cover') || 
                        pageName.includes('bìa');
        
        return !isCover;
      });
      
      setPageCount(nonCoverPages.length);
    }
  };

  useEffect(() => {
    updatePageCount();
    
    if (editor) {
      editor.on('page:add page:remove page:update', updatePageCount);
      return () => {
        editor.off('page:add page:remove page:update', updatePageCount);
      };
    }
  }, [editor]);

  // Format page size
  const getPageSizeText = () => {
    if (currentBook?.pageSize) {
      const { width, height, unit } = currentBook.pageSize;
      return `${width}×${height}${unit}`;
    }
    return currentBook?.template || 'A4';
  };

  const layoutMode = currentBook?.layoutMode === 'fixed' ? 'Fixed' : 'Reflow';

  return (
    <div className="pages-footer-container">
      <div className="footer-info-item">
        <span className="footer-value">{pageCount} pages</span>
      </div>
      <div className="footer-divider">•</div>
      <div className="footer-info-item">
        <span className="footer-value">{getPageSizeText()}</span>
      </div>
      <div className="footer-divider">•</div>
      <div className="footer-info-item">
        <span className="footer-value">{layoutMode}</span>
      </div>
    </div>
  );
};
