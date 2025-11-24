import React, { useEffect, useState, useCallback } from 'react';
import { PageThumbnail } from './PageThumbnail';
import { useBookStore } from '../../../core/store/bookStore';

interface PageListProps {
  editor: any;
  viewMode: 'spreads' | 'single';
}

// Internal component that re-renders when editor changes
const PageListContent: React.FC<{ editor: any; viewMode: 'spreads' | 'single' }> = ({ editor, viewMode }) => {
  const [localPages, setLocalPages] = useState<any[]>([]);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const reorderPages = useBookStore((state) => state.reorderPages);

  const updatePages = useCallback(() => {
    const allPages = editor.Pages.getAll();
    setLocalPages([...allPages]);
  }, [editor]);

  useEffect(() => {
    updatePages();
    editor.on('page:add page:remove page:update page:select', updatePages);
    return () => {
      editor.off('page:add page:remove page:update page:select', updatePages);
    };
  }, [editor, updatePages]);

  const handleSelectPage = (page: any) => {
    editor.Pages.select(page.getId());
  };

  const handleDeletePage = (e: React.MouseEvent, page: any) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this page?')) {
      editor.Pages.remove(page.getId());
    }
  };

  // DnD Handlers
  const handleDragStart = (e: React.DragEvent, page: any) => {
    if (page.get('attributes')?.type !== 'content') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', page.getId());
    e.dataTransfer.effectAllowed = 'move';
    // Add a class to the dragged element for styling if needed
    (e.target as HTMLElement).classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).classList.remove('dragging');
    setDragOverId(null);
  };

  const handleDragOver = (e: React.DragEvent, targetPage: any) => {
    e.preventDefault(); // Necessary to allow dropping
    if (targetPage.get('attributes')?.type !== 'content') return;
    setDragOverId(targetPage.getId());
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetPage: any) => {
    e.preventDefault();
    setDragOverId(null);

    const draggedId = e.dataTransfer.getData('text/plain');
    const targetId = targetPage.getId();

    if (draggedId === targetId) return;
    if (targetPage.get('attributes')?.type !== 'content') return;

    const allPages = [...localPages];
    const oldIndex = allPages.findIndex(p => p.getId() === draggedId);
    
    if (oldIndex === -1) return;

    // Remove dragged page from the list
    const [draggedPage] = allPages.splice(oldIndex, 1);
    
    // Find new index for the target in the modified list
    const newIndex = allPages.findIndex(p => p.getId() === targetId);
    
    if (newIndex === -1) return;
    // Get the component content before removing the page
    const component = draggedPage.getMainComponent();
    const componentJSON = component ? JSON.parse(JSON.stringify(component)) : '';
    const pageName = draggedPage.getName();
    const pageId = draggedPage.getId();
    const pageType = draggedPage.get('attributes')?.type;

    editor.Pages.remove(draggedPage);
    
    // Re-add the page with the preserved content
    const newPage = editor.Pages.add({
      id: pageId,
      name: pageName,
      component: componentJSON,
      attributes: {
        type: pageType,
        // Temporary page number, will be updated below
        pageNumber: 0
      }
    }, { at: newIndex });

    // Update Store
    reorderPages(oldIndex, newIndex);
    
    // Update page numbers for all content pages
    const contentPages = localPages.filter(p => p.get('attributes')?.type === 'content');
    // We need to simulate the new order in our local list to calculate correct numbers
    const reorderedPages = [...contentPages];
    const [movedP] = reorderedPages.splice(oldIndex, 1);
    reorderedPages.splice(newIndex, 0, movedP);

    reorderedPages.forEach((p, index) => {
      // For the moved page, we use the newly created instance 'newPage'
      // For others, we use the existing 'p'
      const targetPage = p.getId() === pageId ? newPage : p;
      if (targetPage) {
        targetPage.set('attributes', {
          ...targetPage.get('attributes'),
          pageNumber: index + 1
        });
      }
    });

    // Select the moved page
    editor.Pages.select(newPage.getId());
  };

  // Filter content pages (type: 'content')
  const getContentPages = () => {
    return localPages.filter((page) => {
      const attributes = page.get('attributes');
      return attributes?.type === 'content';
    });
  };

  // Group pages into spreads
  const renderSpreads = () => {
    const spreads = [];
    const contentPages = getContentPages();

    // Render spreads from content pages
    for (let i = 0; i < contentPages.length; i += 2) {
      const leftPage = contentPages[i];
      const rightPage = contentPages[i + 1];

      // Get page numbers from attributes
      const leftPageNumber = leftPage.get('attributes')?.pageNumber || i + 1;
      const rightPageNumber = rightPage ? rightPage.get('attributes')?.pageNumber || i + 2 : null;

      spreads.push(
        <div key={`spread-${i}`} className="page-spread">
          {/* Left Page */}
          <div 
            draggable 
            onDragStart={(e) => handleDragStart(e, leftPage)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, leftPage)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, leftPage)}
            style={{ 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center',
              opacity: dragOverId === leftPage.getId() ? 0.5 : 1,
              border: dragOverId === leftPage.getId() ? '2px dashed #444' : 'none',
              borderRadius: '4px'
            }}
          >
            <PageThumbnail
              page={leftPage}
              pageNumber={leftPageNumber}
              isActive={editor.Pages.getSelected()?.getId() === leftPage.getId()}
              onSelect={() => handleSelectPage(leftPage)}
              onDelete={(e) => handleDeletePage(e, leftPage)}
              editor={editor}
            />
          </div>

          {/* Right Page (if exists) */}
          {rightPage && (
            <div 
              draggable 
              onDragStart={(e) => handleDragStart(e, rightPage)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, rightPage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, rightPage)}
              style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center',
                opacity: dragOverId === rightPage.getId() ? 0.5 : 1,
                border: dragOverId === rightPage.getId() ? '2px dashed #444' : 'none',
                borderRadius: '4px'
              }}
            >
              <PageThumbnail
                page={rightPage}
                pageNumber={rightPageNumber}
                isActive={editor.Pages.getSelected()?.getId() === rightPage.getId()}
                onSelect={() => handleSelectPage(rightPage)}
                onDelete={(e) => handleDeletePage(e, rightPage)}
                editor={editor}
              />
            </div>
          )}
        </div>
      );
    }

    return spreads;
  };

  // Render single pages in a grid
  const renderSinglePages = () => {
    const contentPages = getContentPages();

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', padding: '0 8px' }}>
        {contentPages.map((page) => {
          const pageNumber = page.get('attributes')?.pageNumber;
          return (
            <div 
              key={page.getId()} 
              draggable
              onDragStart={(e) => handleDragStart(e, page)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, page)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, page)}
              style={{ 
                display: 'flex', 
                justifyContent: 'center',
                opacity: dragOverId === page.getId() ? 0.5 : 1,
                border: dragOverId === page.getId() ? '2px dashed #444' : 'none',
                borderRadius: '4px'
              }}
            >
              <PageThumbnail
                page={page}
                pageNumber={pageNumber}
                isActive={editor.Pages.getSelected()?.getId() === page.getId()}
                onSelect={() => handleSelectPage(page)}
                onDelete={(e) => handleDeletePage(e, page)}
                editor={editor}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pages-section">
      <div className="pages-list">
        {viewMode === 'spreads' ? renderSpreads() : renderSinglePages()}
      </div>
    </div>
  );
};

export const PageList: React.FC<PageListProps> = ({ editor, viewMode }) => {
  // Use key to force re-render when editor instance changes
  return <PageListContent key={editor?.id || 'editor'} editor={editor} viewMode={viewMode} />;
};
