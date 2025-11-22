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
    <div>
      <div className="left-sidebar-title" onClick={() => setIsExpanded(!isExpanded)}>
        <i className="fas fa-list-ol" style={{ marginRight: '8px' }}></i>
        <span>Table of Contents</span>
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
        <div className="gjs-category-content" style={{ padding: 'var(--gjs-input-padding-multiple)' }}>
          {headings.length === 0 ? (
            <div style={{ padding: 'var(--gjs-input-padding)', color: '#aaa', fontStyle: 'italic', fontSize: '0.9em' }}>
              No headings found.
            </div>
          ) : (
            <div id="toc-list" style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
              {headings.map((item) => (
                <div 
                  key={item.id} 
                  className="gjs-field toc-item" 
                  style={{ 
                    padding: '6px var(--gjs-input-padding)', 
                    cursor: 'pointer',
                    marginLeft: getIndent(item.tagName),
                    fontSize: '0.9em',
                    borderLeft: '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderLeftColor = 'var(--gjs-primary-color, #444)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderLeftColor = 'transparent';
                  }}
                >
                  <span style={{ opacity: 0.7, marginRight: '6px', fontSize: '0.8em' }}>{item.tagName.toUpperCase()}</span>
                  {item.text.replace(/<[^>]*>/g, '')}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
