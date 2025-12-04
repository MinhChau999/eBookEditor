import React, { useState } from 'react';
import { useBookStore } from '../../../core/store/bookStore';
import { BookSettingsModal } from './BookSettingsModal';

export const BookInfoCard: React.FC = () => {
  const { currentBook } = useBookStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  if (!currentBook) return null;

  return (
    <>
      <div className={`left-sidebar-title ${!isInfoExpanded ? 'collapsed' : ''}`} onClick={() => setIsInfoExpanded(!isInfoExpanded)}>
        <i className="fas fa-book"></i>
        <span className="gjs-text-truncate gjs-two-color" title={currentBook.title}>
          {currentBook.title}
        </span>
        <button 
          className="gjs-sm-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          title="Book Settings"
        >
          <i className="fas fa-cog"></i>
        </button>
      </div>

      {isInfoExpanded && (
        <div className="gjs-category-content" style={{ display: 'block', padding: '10px' }}>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#aaa' }}>
            <i className="fas fa-user" style={{ marginRight: '6px', width: '12px' }}></i>
            {currentBook.author || 'Unknown Author'}
          </div>
          
          {currentBook.description && (
            <div style={{ marginBottom: '8px', fontSize: '11px', color: '#888', fontStyle: 'italic', lineHeight: '1.4' }}>
              {currentBook.description}
            </div>
          )}

          <div style={{ fontSize: '11px', color: '#666', display: 'flex', gap: '10px' }}>
            <span title="Layout Mode">
              <i className="fas fa-layer-group" style={{ marginRight: '4px' }}></i>
              {currentBook.layoutMode === 'fixed' ? 'Fixed' : 'Reflow'}
            </span>
            {currentBook.layoutMode === 'fixed' && currentBook.pageSize && (
              <span title="Page Size">
                <i className="fas fa-ruler-combined" style={{ marginRight: '4px' }}></i>
                {currentBook.pageSize.width}x{currentBook.pageSize.height}
              </span>
            )}
          </div>
        </div>
      )}

      <BookSettingsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
