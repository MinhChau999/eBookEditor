import React, { useState } from 'react';
import { PageList } from './PageList';
import { MasterPageList } from './MasterPageList';
import { BookInfoCard } from '../../book/components/BookInfoCard';
import { TableOfContents } from '../../toc/components/TableOfContents';

interface StructurePanelProps {
  editor: any;
}

export const StructurePanel: React.FC<StructurePanelProps> = ({ editor }) => {
  const [isPagesExpanded, setIsPagesExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'spreads' | 'single'>('spreads');

  return (
    <>
      {/* 1. Book Info Section */}
      <BookInfoCard />

      {/* 2. Table of Contents Section */}
      <TableOfContents editor={editor} />

      {/* 3. Pages Section */}
      <div className="pages-panel-container">
        <div className="pages-panel-header">
          <div className="pages-panel-title">
            <i className="fas fa-file-alt"></i>
            <span>Pages</span>
          </div>
          <div className="pages-panel-actions">
            <button className="panel-action-btn" title="New Master Page">M</button>
            <button className="panel-action-btn" title="Add Page" onClick={() => editor.Pages.add({ name: 'New Page' })}>+</button>
            <button className="panel-action-btn" title="Page Options">⋮</button>
          </div>
        </div>

        <div className="gjs-category-content" style={{ display: isPagesExpanded ? 'block' : 'none' }}>
          <div className="pages-view-options">
            <button 
              className={`view-btn ${viewMode === 'spreads' ? 'active' : ''}`} 
              title="Spread View"
              onClick={() => setViewMode('spreads')}
            >
              <i className="fas fa-columns"></i>
              <span>Spreads</span>
            </button>
            <button 
              className={`view-btn ${viewMode === 'single' ? 'active' : ''}`} 
              title="Single Page View"
              onClick={() => setViewMode('single')}
            >
              <i className="fas fa-file"></i>
              <span>Pages</span>
            </button>
            <button className="view-btn" title="Page Info">
              <i className="fas fa-info-circle"></i>
              <span>Info</span>
            </button>
          </div>

          <MasterPageList />
          <PageList editor={editor} viewMode={viewMode} />
        </div>
      </div>
    </>
  );
};
