import React from 'react';

interface PageThumbnailProps {
  page: any;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const PageThumbnail: React.FC<PageThumbnailProps> = ({ 
  page, 
  index, 
  isActive, 
  onSelect, 
  onDelete 
}) => {
  // Determine if it's a cover page (first page)
  const isCover = index === 0;

  return (
    <div 
      className={`page-item ${isActive ? 'page-active' : ''} ${isCover ? 'page-cover' : ''}`}
      onClick={onSelect}
    >
      <button 
        onClick={onDelete}
        className="page-delete-btn"
        title="Delete Page"
      >
        <i className="fas fa-trash"></i>
      </button>
      
      <div className="master-applied-indicator">A</div>
      
      <div className={`page ${isCover ? 'cover-page' : ''}`}>
        <div className="page-content">
          {/* Simulated content lines based on legacy CSS */}
          <div style={{ position: 'absolute', top: '4px', left: '4px', right: '4px' }}>
            <div className="page-content-line" style={{ width: isCover ? '40%' : '50%', height: '1px' }}></div>
          </div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%' }}>
            <div className="page-content-line" style={{ width: '100%', height: '1px', margin: '1px 0' }}></div>
            <div className="page-content-line" style={{ width: '92%', height: '1px', margin: '1px 0' }}></div>
            <div className="page-content-line" style={{ width: '96%', height: '1px', margin: '1px 0' }}></div>
            <div className="page-content-line" style={{ width: '88%', height: '1px', margin: '1px 0' }}></div>
            <div className="page-content-line" style={{ width: '94%', height: '1px', margin: '1px 0' }}></div>
          </div>
        </div>
      </div>
      
      <div className="page-number">
        {isCover ? 'Cover' : index + 1}
      </div>
    </div>
  );
};
