import React from 'react';
import { useBookStore } from '../../../core/store/bookStore';

interface PageThumbnailProps {
  page: any;
  pageNumber: number;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  editor: any;
}

export const PageThumbnail: React.FC<PageThumbnailProps> = ({ 
  page, 
  pageNumber, 
  isActive, 
  onSelect, 
  onDelete,
  editor
}) => {
  const [html, setHtml] = React.useState('');
  const [css, setCss] = React.useState('');
  const currentBook = useBookStore((state: any) => state.currentBook);

  React.useEffect(() => {
    if (page && editor) {
      setHtml(page.getMainComponent().toHTML());
      setCss(editor.getCss());
    }
  }, [page, editor]);

  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          ${css}
          ${currentBook?.styles || ''}
          body { 
            overflow: hidden; 
            background-color: white; 
            transform: scale(0.07); 
            transform-origin: top left; 
            width: 1000px; 
            min-height: 1414px;
          }
        </style>
      </head>
      ${html}
    </html>
  `;

  return (
    <div 
      className={`page-item ${isActive ? 'page-active' : ''}`}
      onClick={onSelect}
    >
      <div className="page-actions">
        <button 
          className="page-btn page-settings-btn"
          title="Page Settings"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <i className="fas fa-cog"></i>
        </button>
        <button 
          onClick={onDelete}
          className="page-btn page-delete-btn"
          title="Delete Page"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
      
      <div className="master-applied-indicator">A</div>
      
      <div className="page">
        <div className="page-content" style={{ padding: 0, overflow: 'hidden' }}>
          <iframe
            srcDoc={srcDoc}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              pointerEvents: 'none',
              backgroundColor: '#fff'
            }}
            title={`Page ${pageNumber}`}
          />
        </div>
      </div>
      
      <div className="page-number">
        {pageNumber}
      </div>
    </div>
  );
};
