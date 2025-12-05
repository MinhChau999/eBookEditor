import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grapesjs from 'grapesjs';
import tuiImageEditorPlugin from 'grapesjs-tui-image-editor';
import coreSetup from '../../plugins/core-setup';
import bookAdapter from '../../plugins/book-adapter';
import basicBlocks from '../../plugins/basic-blocks';
import thumbPagePlugin from '../../plugins/thumbpage';
import selectorAutocomplete from '../../plugins/selector-autocomplete';
import styleManagerTabs from '../../plugins/style-manager-tabs';
import classManager from '../../plugins/class-manager';
import { ExportModal } from '../../features/export/components/ExportModal';
import { useBookStore } from '../../core/store/bookStore';
import '../../styles/setup.css';
import '../../styles/rulers.css';

// Define GrapesJS editor type
const Editor: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isLoading, setIsLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Optimize store selectors - only subscribe to what we need
  const currentBook = useBookStore(state => state.books.find(b => b.id === bookId));
  const setCurrentBook = useBookStore(state => state.setCurrentBook);

  useEffect(() => {
    if (!bookId) {
        navigate('/');
        return;
    }
    if (!currentBook) {
        navigate('/');
        return;
    }
    setCurrentBook(currentBook.id);
  }, [bookId, currentBook, navigate, setCurrentBook]);



  useEffect(() => {
    if (!editorRef.current || !currentBook) return;

    const initializeEditor = async () => {
      try {
        const bookPages = useBookStore.getState().pages;

        const gjsPages = bookPages.map(page => ({
          id: page.id,
          name: page.name,
          attributes: {
            type: page.type,
            pageNumber: page.pageNumber
          },
          component: page.content
        }));

        const editorInstance = grapesjs.init({
          container: editorRef.current as HTMLElement,
          height: '100%',
          width: '100%',
          storageManager: false,
          pageManager: {
            pages: gjsPages.length > 0 ? gjsPages : [
              {
                id: 'default-page',
                name: 'Page 1',
                component: '<div style="padding: 20px;">Empty Page</div>'
              }
            ]
          },
          selectorManager: {
            states: [
              { name: 'hover', label: 'Hover' },
              { name: 'before', label: 'Before' },
              { name: 'after', label: 'After' },
              { name: 'nth-of-type(2n)', label: 'Even/Odd' }
            ]
          },
          plugins: [
            coreSetup,
            bookAdapter,
            tuiImageEditorPlugin,
            basicBlocks,
            thumbPagePlugin
          ],
          deviceManager: {
            devices: [
              {
                id: 'fixed',
                name: 'Fixed',
                width: currentBook.layoutMode === 'fixed' && currentBook.pageSize
                  ? `${currentBook.pageSize.width}${currentBook.pageSize.unit}`
                  : '210mm',
                height: currentBook.layoutMode === 'fixed' && currentBook.pageSize
                  ? `${currentBook.pageSize.height}${currentBook.pageSize.unit}`
                  : '297mm',
                widthMedia: currentBook.layoutMode === 'fixed' && currentBook.pageSize
                  ? `${currentBook.pageSize.width}${currentBook.pageSize.unit}`
                  : '210mm',
              },
              {
                id: 'desktop',
                name: 'Desktop',
                width: '',
              },
              {
                id: 'tablet',
                name: 'Tablet',
                width: '768px',
                widthMedia: '992px',
              },
              {
                id: 'mobile',
                name: 'Mobile',
                width: '320px',
                widthMedia: '480px',
              },
            ],
          },
          pluginsOpts: {
            [coreSetup as any]: { // eslint-disable-line @typescript-eslint/no-explicit-any
              layoutMode: currentBook.layoutMode,
              dragMode: '', // Default to empty string (Default mode)
              rulerOpts: {
                canvasZoom: currentBook.layoutMode === 'fixed' ? 95 : 100,
              }
            },
            [thumbPagePlugin as any]: { // eslint-disable-line @typescript-eslint/no-explicit-any
              thumbnailScale: 0.07,
              thumbnailWidth: 1000,
              thumbnailHeight: 1414,
              debounceTime: 300,
              customStyles: currentBook?.styles || '',
            },
          }
        });

        editorInstance.Commands.add('open-export-modal', () => {
            setShowExportModal(true);
        });
        
        // Initialize selector autocomplete plugin
        selectorAutocomplete(editorInstance);

        // Initialize style manager tabs plugin
        styleManagerTabs(editorInstance);

        // Initialize class manager plugin
        classManager(editorInstance);

        // Add book-specific styles if available
        if (currentBook?.styles) {
          editorInstance.addStyle(currentBook.styles);
        }

        editorInstanceRef.current = editorInstance;
        setIsLoading(false);
      } catch (error) {
        console.error('Editor initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeEditor();

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy();
      }
    };
  }, [currentBook]); // Re-run if currentBook changes (though it should be stable after initial load)

  if (!currentBook) {
      return null; // Or a loading spinner
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--color-background, #444444)',
      color: 'var(--color-text-primary, #dddddd)'
    }}>
      {isLoading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: 'var(--color-background, #444444)'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--color-text-primary, #dddddd)'
          }}>
            <h3>Loading GrapesJS Editor...</h3>
            <p>Initializing your eBook editor workspace</p>
          </div>
        </div>
      ) : null}


      <div
        ref={editorRef}
        style={{
          display: isLoading ? 'none' : 'block',
          height: '100%',
          width: '100%'
        }}
      />

      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}
    </div>
  );
};

export default Editor;