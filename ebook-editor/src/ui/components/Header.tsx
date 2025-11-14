import React from 'react';

export const Header: React.FC = () => {
  return (
    <div className="header">
      <div className="header-left">
        <div className="logo">
          <i className="fas fa-book"></i>
        </div>
        <span className="app-title">eBook Editor</span>
      </div>

      <div className="header-right">
        <div className="action-group">
          <button className="btn btn-primary">
            <i className="fas fa-plus"></i>
            <span>New Book</span>
          </button>
          <button className="btn btn-secondary">
            <i className="fas fa-file-import"></i>
            <span>Import EPUB</span>
          </button>
        </div>

        <div className="divider"></div>

        <button className="icon-btn" title="Settings">
          <i className="fas fa-cog"></i>
        </button>

        <div className="user-avatar" title="User Profile">
          <i className="fas fa-user"></i>
        </div>
      </div>
    </div>
  );
};