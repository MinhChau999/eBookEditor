import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MasterPageList } from './MasterPageList';
import { CoverPageList } from './CoverPageList';
import { DocumentPagesSection } from './DocumentPagesSection';

interface PagesPanelProps {
  editor: any;
  viewMode?: 'spreads' | 'single';
  layoutMode?: 'fixed' | 'reflow';
}

export const PagesPanel: React.FC<PagesPanelProps> = ({ editor, viewMode = 'spreads', layoutMode = 'reflow' }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowActions(false);
      }
    };

    // Update position on scroll or resize to keep it attached
    const handleScrollOrResize = () => {
      if (showActions && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 2,
          left: rect.left
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [showActions]);

  const toggleDropdown = () => {
    if (!showActions && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 2,
        left: rect.left
      });
    }
    setShowActions(!showActions);
  };

  return (
    <div className="pages-panel-container">
      <div className={`left-sidebar-title ${!isExpanded ? 'collapsed' : ''}`} onClick={() => setIsExpanded(!isExpanded)}>
        <i className="fas fa-file-alt"></i>
        <span className="gjs-text-truncate gjs-two-color" title="Pages">Pages</span>
        
        <div className="pages-actions-container" style={{ marginLeft: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <button 
            ref={buttonRef}
            className="gjs-sm-btn" 
            onClick={toggleDropdown}
            title="Page Actions"
          >
            <i className="fas fa-ellipsis-v"></i>
          </button>
          
          {showActions && createPortal(
            <div 
              ref={dropdownRef}
              className="gjs-custom-dropdown-menu"
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                zIndex: 100000,
                marginTop: 0
              }}
            >
              <div 
                className="gjs-custom-dropdown-item" 
                onClick={() => { setShowActions(false); }}
              >
                <i className="fas fa-layer-group" style={{ marginRight: '8px', width: '12px' }}></i>
                New Master
              </div>
              <div
                className="gjs-custom-dropdown-item"
                onClick={() => {
                  editor.Pages.add({
                    name: 'New Page',
                    attributes: {
                      type: 'content',
                      pageNumber: editor.Pages.getAll().filter(p => p.get('attributes')?.type === 'content').length + 1
                    }
                  });
                  setShowActions(false);
                }}
              >
                <i className="fas fa-plus" style={{ marginRight: '8px', width: '12px' }}></i>
                Add Page
              </div>
              <div
                className="gjs-custom-dropdown-item"
                onClick={() => { setShowActions(false); }}
              >
                <i className="fas fa-cog" style={{ marginRight: '8px', width: '12px' }}></i>
                Options
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>

      <div className="gjs-category-content" style={{ display: isExpanded ? 'block' : 'none' }}>
        <MasterPageList layoutMode={layoutMode} />
        <CoverPageList editor={editor} />
        <DocumentPagesSection editor={editor} viewMode={viewMode} />
      </div>
    </div>
  );
};
