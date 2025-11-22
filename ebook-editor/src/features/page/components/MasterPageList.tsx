import React, { useState } from 'react';

interface MasterPageListProps {
  layoutMode?: 'fixed' | 'reflow';
}

export const MasterPageList: React.FC<MasterPageListProps> = ({ layoutMode = 'reflow' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show Master Pages in Fixed Layout mode
  if (layoutMode !== 'fixed') {
    return null;
  }

  return (
    <div className="master-pages-section">
      <div 
        className={`master-pages-header ${!isExpanded ? 'collapsed' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <i className="fas fa-layer-group" style={{ marginRight: '8px', fontSize: '10px' }}></i>
        <span>Master Pages</span>
      </div>
      
      {isExpanded && (
        <div className="master-pages-list">
          <div className="master-page-item">
            <button className="master-page-delete-btn" title="Delete Master Page">
              <i className="fas fa-trash"></i>
            </button>
            <div className="master-page-thumbnail">
              <div className="master-page-icon">
                <i className="fas fa-layer-group"></i>
              </div>
            </div>
            <div className="master-page-label">A-Master</div>
          </div>
        </div>
      )}
    </div>
  );
};
