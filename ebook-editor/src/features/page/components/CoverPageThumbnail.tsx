import React from 'react';

interface CoverPageThumbnailProps {
  pageName: string;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const CoverPageThumbnail: React.FC<CoverPageThumbnailProps> = ({
  pageName,
  isActive,
  onSelect,
  onDelete
}) => {
  return (
    <div 
      className={`cover-page-item ${isActive ? 'active' : ''}`}
      onClick={onSelect}
    >
      <button 
        className="cover-page-delete-btn" 
        title="Delete Cover Page"
        onClick={onDelete}
      >
        <i className="fas fa-trash"></i>
      </button>
      
      <div className="cover-page-thumbnail">
        <div className="page-content">
          {/* Header decoration */}
          <div className="cover-header-area">
            <div className="page-content-line cover-line-short"></div>
          </div>
          
          {/* Center content lines */}
          <div className="cover-center-area">
            <div className="page-content-line cover-line-full"></div>
            <div className="page-content-line cover-line-92"></div>
            <div className="page-content-line cover-line-96"></div>
            <div className="page-content-line cover-line-88"></div>
            <div className="page-content-line cover-line-94"></div>
          </div>
        </div>
      </div>
      
      <div className="cover-page-label">{pageName}</div>
    </div>
  );
};
