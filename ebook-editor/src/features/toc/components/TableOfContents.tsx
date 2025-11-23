import React, { useEffect, useState } from 'react';

interface TableOfContentsProps {
  editor: any;
}

interface TocItem {
  id: string;
  tagName: string;
  text: string;
  componentId: string;
  pageId: string;
  pageName: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ editor }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [headings, setHeadings] = useState<TocItem[]>([]);

  const refreshHeadings = () => {
    if (!editor) return;

    const allPages = editor.Pages.getAll();
    let allItems: TocItem[] = [];
    const parser = new DOMParser();

    allPages.forEach((page: any, index: number) => {
      const attributes = page.get('attributes');
      const pageName = (page.get('name') || '').toLowerCase();
      const isCover = attributes?.type === 'cover' || 
                      index === 0 || 
                      pageName.includes('cover') || 
                      pageName.includes('bìa');

      if (isCover) return;

      // Use toHTML() to get the content even if not rendered
      const htmlContent = page.getMainComponent().toHTML();
      // console.log(`TOC: Page ${index} HTML length:`, htmlContent.length);
      
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      const foundHeadings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      console.log(`TOC: Page ${index} (${pageName}) - Headings found in HTML:`, foundHeadings.length);
      
      const pageItems: TocItem[] = Array.from(foundHeadings).map((el: any) => ({
        id: el.id || '', // GrapesJS usually adds IDs
        tagName: el.tagName.toLowerCase(),
        text: el.textContent || 'Untitled',
        componentId: el.id || '',
        pageId: page.getId(),
        pageName: page.get('name') || `Page ${index + 1}`
      }));

      allItems = [...allItems, ...pageItems];
    });

    console.log('TOC: Total items found:', allItems.length);
    setHeadings(allItems);
  };

  useEffect(() => {
    if (!editor) return;
    refreshHeadings();
    editor.on('component:update', refreshHeadings);
    editor.on('component:add', refreshHeadings);
    editor.on('component:remove', refreshHeadings);
    editor.on('page:add page:remove page:update', refreshHeadings);
    editor.on('load', refreshHeadings);
    return () => {
      editor.off('component:update', refreshHeadings);
      editor.off('component:add', refreshHeadings);
      editor.off('component:remove', refreshHeadings);
      editor.off('page:add page:remove page:update', refreshHeadings);
      editor.off('load', refreshHeadings);
    };
  }, [editor]);

  const handleItemClick = (item: TocItem) => {
    const currentPageId = editor.Pages.getSelected()?.getId();
    
    if (currentPageId !== item.pageId) {
      editor.Pages.select(item.pageId);
      setTimeout(() => {
        selectAndScroll(item);
      }, 300); // Increased timeout to ensure render
    } else {
      selectAndScroll(item);
    }
  };

  const selectAndScroll = (item: TocItem) => {
    const wrapper = editor.getWrapper();
    // Find model by ID
    const model = wrapper.find(`#${item.componentId}`)[0];
    
    if (model) {
      editor.select(model);
      const el = model.getEl();
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
        console.warn('TOC: Could not find model for', item.componentId);
    }
  };

  const getIndent = (tagName: string) => {
    switch (tagName.toLowerCase()) {
      case 'h1': return '0px';
      case 'h2': return '12px';
      case 'h3': return '24px';
      default: return '30px';
    }
  };

  return (
    <>
      <div className={`left-sidebar-title ${!isExpanded ? 'collapsed' : ''}`} onClick={() => setIsExpanded(!isExpanded)}>
        <i className="fas fa-list-ol"></i>
        <span className="gjs-text-truncate gjs-two-color" title="Table of Contents">Table of Contents</span>
        <button 
            className="gjs-sm-btn" 
            style={{ marginLeft: 'auto' }}
            onClick={(e) => {
                e.stopPropagation();
                refreshHeadings();
            }}
            title="Refresh TOC"
        >
            <i className="fas fa-sync-alt"></i>
        </button>
      </div>
      
      {isExpanded && (
        <div className="gjs-category-content" style={{ display: isExpanded ? 'block' : 'none' }}>
          {headings.length === 0 ? (
            <div className="toc-empty">
              <i className="fas fa-stream"></i>
              <span>No headings found</span>
            </div>
          ) : (
            <div className="toc-list">
              {headings.map((item) => (
                <div 
                  key={`${item.pageId}-${item.componentId}`} 
                  className="toc-item" 
                  style={{ paddingLeft: `calc(12px + ${getIndent(item.tagName)})` }}
                  onClick={() => handleItemClick(item)}
                >
                  <span className="toc-item-tag">{item.tagName}</span>
                  <span className="toc-item-text" title={item.text}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
