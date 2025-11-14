import React from 'react';
import { SimpleButton } from './Button';

export const Header: React.FC = () => {
  const handleNewBook = () => {
    console.log('Create new book');
  };

  const handleImportEpub = () => {
    console.log('Import EPUB file');
  };

  const handleSettings = () => {
    console.log('Open settings');
  };

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
          <SimpleButton
            variant="primary"
            iconLeft="fas fa-plus"
            onClick={handleNewBook}
          >
            New Book
          </SimpleButton>
          <SimpleButton
            variant="secondary"
            iconLeft="fas fa-file-import"
            onClick={handleImportEpub}
          >
            Import EPUB
          </SimpleButton>
        </div>

        <div className="divider"></div>

        <button className="icon-btn" title="Settings" onClick={handleSettings}>
          <i className="fas fa-cog"></i>
        </button>

        <div className="user-avatar" title="User Profile">
          <i className="fas fa-user"></i>
        </div>
      </div>
    </div>
  );
};