import React from 'react';
import { useBookStore } from '../../../core/store/bookStore';

export const BookInfoCard: React.FC = () => {
  const { currentBook } = useBookStore();

  return (
    <div className="left-sidebar-title">
      <i className="fas fa-book"></i>
      <span>{currentBook?.title || 'Book Info'}</span>
    </div>
  );
};
