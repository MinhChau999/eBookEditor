import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grapesjs from 'grapesjs';
import tuiImageEditorPlugin from 'grapesjs-tui-image-editor';
import coreSetup from '../../plugins/core-setup';
import bookAdapter from '../../plugins/book-adapter';
import leftPanel from '../../plugins/left-panel';
import { ExportModal } from '../../features/export/components/ExportModal';
import { useBookStore } from '../../core/store/bookStore';

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
        // Get pages for current book from store
        const bookPages = useBookStore.getState().pages;
        // TODO: Filter by current bookId when implementing proper page-book mapping

        // Map pages to GrapesJS format
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
              // Fallback if no pages found
              {
                id: 'default-page',
                name: 'Page 1',
                component: '<div style="padding: 20px;">Empty Page</div>'
              }
            ]
          },
          plugins: [
            coreSetup,
            bookAdapter,
            leftPanel,
            tuiImageEditorPlugin
          ],
          deviceManager: {
            devices: [
              {
                id: 'fixed',
                name: 'Fixed',
                width: '816px', // A4 width approx
                height: '1056px', // A4 height approx
                widthMedia: '816px',
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
            // Default will be set by core-setup based on layoutMode
          },
          pluginsOpts: {
            'core-setup': {
              textCleanCanvas: 'Are you sure you want to clear the canvas?',
              layoutMode: currentBook.layoutMode,
            },
            'tuiImageEditorPlugin': {
              config: {
                includeUI: {
                  initMenu: 'filter',
                  menuBarPosition: 'bottom',
                  theme: {
                    'common.bi.image': 'https://uicdn.toast.com/tui-image-editor/latest/svg/icon-b.svg',
                    'common.bisize.width': '251px',
                    'common.bisize.height': '21px',
                    'common.backgroundImage': 'none',
                    'common.backgroundColor': '#f3f4f6',
                    'common.border': '1px solid #ddd',
                    'header.backgroundImage': 'none',
                    'header.backgroundColor': '#f3f4f6',
                    'header.border': '0px',
                    'menu.normalIcon.color': '#8a8a8a',
                    'menu.activeIcon.color': '#555555',
                    'menu.disabledIcon.color': '#434343',
                    'menu.hoverIcon.color': '#e9e9e9',
                    'submenu.backgroundColor': '#ffffff',
                    'submenu.partition.color': '#e5e5e5',
                    'submenu.normalIcon.color': '#8a8a8a',
                    'submenu.activeIcon.color': '#555555',
                    'submenu.iconSize.width': '32px',
                    'submenu.iconSize.height': '32px',
                    'submenu.normalLabel.color': '#858585',
                    'submenu.normalLabel.fontWeight': 'normal',
                    'submenu.activeLabel.color': '#000',
                    'submenu.activeLabel.fontWeight': 'normal',
                    'checkbox.border': '1px solid #ccc',
                    'checkbox.backgroundColor': '#fff',
                    'range.pointer.color': '#333',
                    'range.bar.color': '#ccc',
                    'range.subbar.color': '#606060',
                    'range.disabledPointer.color': '#d3d3d3',
                    'range.disabledBar.color': 'rgba(85,85,85,0.06)',
                    'range.disabledSubbar.color': 'rgba(51,51,51,0.2)',
                    'range.value.color': '#000',
                    'range.value.fontWeight': 'normal',
                    'range.value.fontSize': '11px',
                    'range.value.border': '0',
                    'range.value.backgroundColor': '#f5f5f5',
                    'range.title.color': '#000',
                    'range.title.fontWeight': 'lighter',
                    'colorpicker.button.border': '0px',
                    'colorpicker.title.color': '#000'
                  },
                },
                cssMaxWidth: 700,
                cssMaxHeight: 500,
                usageStatistics: false
              },
              labelImageEditor: 'Image Editor',
              labelApply: 'Apply',
              height: '700px',
              width: '100%',
              hideHeader: true,
              addToAssets: true
            }
          }
        });

        editorInstance.Commands.add('open-export-modal', () => {
            setShowExportModal(true);
        });
        
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