import React from 'react';
import { useBookStore } from '../../../core/store/bookStore';

export const BookInfoCard: React.FC = () => {
  const { currentBook } = useBookStore();

  // Using legacy classes for consistent styling
  return (
    <div className="gjs-category-title" style={{ marginBottom: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="fas fa-book"></i>
        <span>{currentBook?.title || 'Book Info'}</span>
      </div>
    </div>
  );
};
