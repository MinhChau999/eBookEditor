import React, { useState } from 'react';
import { useBookStore } from '../../../core/store/bookStore';
import { CreateBookModal } from './CreateBookModal';
import type { BookInfo } from '../../../core/types/book.types';

export const BookSettings: React.FC = () => {
  const { books, currentBook, setCurrentBook, deleteBook } = useBookStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Current Book</h3>
        {currentBook ? (
          <div className="bg-gray-50 p-3 rounded border">
            <div className="font-medium">{currentBook.title}</div>
            <div className="text-sm text-gray-500">{currentBook.author}</div>
            <div className="text-xs mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded inline-block">
              {currentBook.layoutMode === 'fixed' ? 'Fixed Layout' : 'Reflowable'}
            </div>
          </div>
        ) : (
          <div className="text-gray-400 italic">No book selected</div>
        )}
      </div>

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">My Books</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          + New
        </button>
      </div>

      <div className="space-y-2">
        {books.map((book: BookInfo) => (
          <div
            key={book.id}
            className={`p-3 rounded border cursor-pointer transition-colors ${
              currentBook?.id === book.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => setCurrentBook(book.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{book.title}</div>
                <div className="text-sm text-gray-500">{book.author || 'Unknown Author'}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this book?')) {
                    deleteBook(book.id);
                  }
                }}
                className="text-red-400 hover:text-red-600 px-2"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        
        {books.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No books yet. Create one to get started!
          </div>
        )}
      </div>

      <CreateBookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
