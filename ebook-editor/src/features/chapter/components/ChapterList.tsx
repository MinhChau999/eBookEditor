import React, { useState } from 'react';

export const ChapterList: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div>
      <div className="left-sidebar-title" onClick={() => setIsExpanded(!isExpanded)}>
        <i className="fas fa-list" style={{ marginRight: '8px' }}></i>
        <span>Chapters</span>
        <button className="gjs-sm-btn" style={{ marginLeft: 'auto' }}>+ Add</button>
      </div>
      
      {isExpanded && (
        <div className="gjs-category-content" style={{ padding: 'var(--gjs-input-padding-multiple)' }}>
          <div id="chapters-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
            <div className="gjs-field" style={{ padding: 'var(--gjs-input-padding)', cursor: 'pointer' }}>
              Chapter 1: Introduction
            </div>
            <div className="gjs-field" style={{ padding: 'var(--gjs-input-padding)', cursor: 'pointer' }}>
              Chapter 2: Getting Started
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
