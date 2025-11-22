import React from 'react';
import { useBookStore } from '../../../core/store/bookStore';

export const BookInfoCard: React.FC = () => {
  const { currentBook } = useBookStore();

  return (
    <div className="left-sidebar-title">
      <i className="fas fa-book"></i>
      <span className="gjs-text-truncate gjs-two-color" title={currentBook?.title || 'Book Info'}>
        {currentBook?.title || 'Book Info'}
      </span>
    </div>
  );
};
