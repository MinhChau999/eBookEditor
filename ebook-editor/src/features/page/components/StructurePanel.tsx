import React from 'react';
import { useBookStore } from '../../../core/store/bookStore';
import { BookInfoCard } from '../../book/components/BookInfoCard';
import { TableOfContents } from '../../toc/components/TableOfContents';
import { PagesPanel } from './PagesPanel';

interface StructurePanelProps {
  editor: any;
}

export const StructurePanel: React.FC<StructurePanelProps> = ({ editor }) => {
  const { currentBook } = useBookStore();

  return (
    <>
      {/* 1. Book Info Section */}
      <BookInfoCard />

      {/* 2. Table of Contents Section */}
      <TableOfContents editor={editor} />

      {/* 3. Pages Section */}
      <PagesPanel 
        editor={editor} 
        layoutMode={currentBook?.layoutMode || 'reflow'}
      />
    </>
  );
};
