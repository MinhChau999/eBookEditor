import React from 'react';

export const MasterPageList: React.FC = () => {
  return (
    <div className="master-pages-section">
      <div className="master-pages-header">
        <div className="master-pages-title">
          <div className="master-master-icon">M</div>
          <span>Master Pages</span>
        </div>
      </div>
      <div className="master-pages-list">
        <div className="master-page-item active">
          <button className="master-page-delete-btn" title="Delete Master Page">
            <i className="fas fa-trash"></i>
          </button>
          <div className="master-page-thumbnail">
            <div style={{ position: 'absolute', top: '4px', left: '4px', fontSize: '7px', fontWeight: 600, color: 'var(--gjs-font-color)' }}>A-Master</div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '20px', color: 'var(--gjs-secondary-light-color)' }}>
              <i className="fas fa-layer-group"></i>
            </div>
          </div>
          <div className="master-page-label">A-Master</div>
        </div>
      </div>
    </div>
  );
};
