import React from 'react';
import { useBookStore } from '../../../core/store/bookStore';

export const ChapterNavigation: React.FC = () => {
  const pages = useBookStore((state) => state.pages);
  // In the future, we will filter by 'chapter' type or group pages.
  // For now, we just list pages as a flat list for navigation.

  return (
    <div className="h-full bg-gray-50 border-r border-gray-200 flex flex-col w-64">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-700">Table of Contents</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {pages.length === 0 ? (
          <p className="text-sm text-gray-500 p-2">No pages added yet.</p>
        ) : (
          <ul className="space-y-1">
            {pages.map((page, index) => (
              <li key={page.id}>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md transition-colors truncate"
                  onClick={() => {
                    // TODO: Scroll to page or set active page
                  }}
                >
                  {page.name || `Page ${index + 1}`}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
