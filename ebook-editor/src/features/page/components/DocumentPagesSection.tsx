import React, { useState } from 'react';
import { PageList } from './PageList';

interface DocumentPagesSectionProps {
  editor: any;
  viewMode: 'spreads' | 'single';
}

export const DocumentPagesSection: React.FC<DocumentPagesSectionProps> = ({ editor, viewMode }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="document-pages-section">
      <div 
        className={`document-pages-header ${!isExpanded ? 'collapsed' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <i className="fas fa-file-alt" style={{ marginRight: '8px', fontSize: '10px' }}></i>
        <span>Document Pages</span>
      </div>
      
      <div style={{ display: isExpanded ? 'block' : 'none' }}>
        <PageList editor={editor} viewMode={viewMode} />
      </div>
    </div>
  );
};
