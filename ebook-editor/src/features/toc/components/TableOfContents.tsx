import React, { useEffect, useState } from 'react';

interface TableOfContentsProps {
  editor: any;
}

interface TocItem {
  id: string;
  tagName: string;
  text: string;
  model: any;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ editor }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [headings, setHeadings] = useState<TocItem[]>([]);

  const refreshHeadings = () => {
    if (!editor) return;

    const wrapper = editor.getWrapper();
    if (!wrapper) return;

    // Find all h1, h2, h3 elements
    const foundHeadings = wrapper.find('h1, h2, h3');
    
    const items: TocItem[] = foundHeadings.map((model: any) => ({
      id: model.getId(),
      tagName: model.get('tagName'),
      text: model.get('content') || model.components().models[0]?.get('content') || 'Untitled',
      model: model
    }));

    setHeadings(items);
  };

  useEffect(() => {
    if (!editor) return;

    // Initial load
    refreshHeadings();

    // Listen for changes
    editor.on('component:update', refreshHeadings);
    editor.on('component:add', refreshHeadings);
    editor.on('component:remove', refreshHeadings);
    editor.on('load', refreshHeadings);

    return () => {
      editor.off('component:update', refreshHeadings);
      editor.off('component:add', refreshHeadings);
      editor.off('component:remove', refreshHeadings);
      editor.off('load', refreshHeadings);
    };
  }, [editor]);

  const handleItemClick = (item: TocItem) => {
    editor.select(item.model);
    const el = item.model.getEl();
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getIndent = (tagName: string) => {
    switch (tagName.toLowerCase()) {
      case 'h1': return '0px';
      case 'h2': return '12px';
      case 'h3': return '24px';
      default: return '0px';
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
                  key={item.id} 
                  className="toc-item" 
                  style={{ paddingLeft: `calc(12px + ${getIndent(item.tagName)})` }}
                  onClick={() => handleItemClick(item)}
                >
                  <span className="toc-item-tag">{item.tagName}</span>
                  <span className="toc-item-text" title={item.text.replace(/<[^>]*>/g, '')}>
                    {item.text.replace(/<[^>]*>/g, '')}
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
