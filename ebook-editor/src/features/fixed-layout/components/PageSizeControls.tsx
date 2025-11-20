import React from 'react';
import { useBookStore } from '../../../core/store/bookStore';
import { PAGE_TEMPLATES } from '../utils/pageTemplates';

export const PageSizeControls: React.FC = () => {
  const currentBook = useBookStore((state) => state.currentBook);
  const updateBook = useBookStore((state) => state.updateBook);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    const template = PAGE_TEMPLATES[templateId];
    
    if (template && currentBook) {
      updateBook(currentBook.id, {
        template: templateId as any,
        pageSize: {
          width: template.width,
          height: template.height,
          unit: template.unit
        }
      });
    }
  };

  // Determine current selection
  const currentTemplateId = currentBook?.template || 'A4_PORTRAIT';

  return (
    <div className="page-size-selector">
      <select
        value={currentTemplateId}
        onChange={handleTemplateChange}
        title="Select Page Size"
      >
        {Object.values(PAGE_TEMPLATES).map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
        <option value="Custom">Custom...</option>
      </select>
    </div>
  );
};
