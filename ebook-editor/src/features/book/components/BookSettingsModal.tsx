import React, { useState, useEffect } from 'react';
import { useBookStore } from '../../../core/store/bookStore';
import type { BookInfo } from '../../../core/types/book.types';

interface BookSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookSettingsModal: React.FC<BookSettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentBook, updateBook } = useBookStore();
  const [formData, setFormData] = useState<Partial<BookInfo>>({});

  useEffect(() => {
    if (isOpen && currentBook) {
      setFormData({
        title: currentBook.title,
        author: currentBook.author || '',
        description: currentBook.description || '',
        coverImage: currentBook.coverImage || '',
      });
    }
  }, [isOpen, currentBook]);

  if (!isOpen || !currentBook) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    updateBook(currentBook.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Book Settings</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Author</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={formData.author || ''}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2 h-24"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Cover Image URL</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={formData.coverImage || ''}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
            <p><strong>Layout Mode:</strong> {currentBook.layoutMode === 'fixed' ? 'Fixed Layout' : 'Reflowable'}</p>
            {currentBook.layoutMode === 'fixed' && currentBook.pageSize && (
               <p><strong>Size:</strong> {currentBook.pageSize.width} x {currentBook.pageSize.height} {currentBook.pageSize.unit}</p>
            )}
          </div>

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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
