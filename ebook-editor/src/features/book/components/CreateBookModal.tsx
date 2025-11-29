import React, { useState } from 'react';
import { useBookStore } from '../../../core/store/bookStore';
import type { BookInfo } from '../../../core/types/book.types';

interface CreateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TemplateType = 'A4' | 'A5' | 'Letter';

interface PageSize {
  width: number;
  height: number;
  unit: 'px';
}

export const CreateBookModal: React.FC<CreateBookModalProps> = ({ isOpen, onClose }) => {
  const createBook = useBookStore((state) => state.createBook);
  const [formData, setFormData] = useState<Partial<BookInfo>>({
    title: '',
    author: '',
    layoutMode: 'reflow',

  });
  const [template, setTemplate] = useState<TemplateType>('A4');

  const getPageSize = (template?: TemplateType): PageSize => {
    switch (template) {
      case 'A4': return { width: 794, height: 1123, unit: 'px' }; // 96 DPI
      case 'A5': return { width: 559, height: 794, unit: 'px' };
      case 'Letter': return { width: 816, height: 1056, unit: 'px' };
      default: return { width: 794, height: 1123, unit: 'px' };
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const pageSize = formData.layoutMode === 'fixed' ? getPageSize(template) : undefined;

    createBook({
      title: formData.title!,
      author: formData.author,
      layoutMode: formData.layoutMode as 'fixed' | 'reflow',
      pageSize,
    });

    onClose();
    setFormData({ title: '', author: '', layoutMode: 'reflow' });
    setTemplate('A4');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Create New Book</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Author</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Mode</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formData.layoutMode}
              onChange={(e) => setFormData({ ...formData, layoutMode: e.target.value as 'fixed' | 'reflow' })}
            >
              <option value="reflow">Reflowable (Standard eBook)</option>
              <option value="fixed">Fixed Layout (Comics, Kids)</option>
            </select>
          </div>

          {formData.layoutMode === 'fixed' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Page Size</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={template}
                onChange={(e) => setTemplate(e.target.value as TemplateType)}
              >
                <option value="A4">A4</option>
                <option value="A5">A5</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
