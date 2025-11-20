import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { useBookStore } from '../../../core/store/bookStore';
import { generateEPUB } from '../utils/epubGenerator';

import { generatePDF } from '../utils/pdfGenerator';

interface ExportModalProps {
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose }) => {
  const { currentBook, pages } = useBookStore();
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<'epub' | 'pdf'>('epub');
  const [mode, setMode] = useState<'fixed' | 'reflow'>('fixed');

  const handleExport = async () => {
    if (!currentBook) return;

    setIsExporting(true);
    try {
      let blob;
      let extension;

      if (format === 'pdf') {
        blob = await generatePDF(currentBook, pages);
        extension = 'pdf';
      } else {
        blob = await generateEPUB(currentBook, pages, mode);
        extension = 'epub';
      }

      saveAs(blob, `${currentBook.title || 'ebook'}.${extension}`);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. See console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Export eBook</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
          <select 
            value={format} 
            onChange={(e) => setFormat(e.target.value as 'epub' | 'pdf')}
            className="w-full border border-gray-300 rounded-md p-2 mb-4"
          >
            <option value="epub">EPUB (E-Reader)</option>
            <option value="pdf">PDF (Print/Web)</option>
          </select>

          {format === 'epub' && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">Layout Mode</label>
              <select 
                value={mode} 
                onChange={(e) => setMode(e.target.value as 'fixed' | 'reflow')}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="fixed">Fixed Layout (EPUB 3)</option>
                <option value="reflow">Reflowable (Standard)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {mode === 'fixed' 
                  ? 'Best for picture books, comics, and complex layouts.' 
                  : 'Best for novels and text-heavy books.'}
              </p>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : `Download ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};
