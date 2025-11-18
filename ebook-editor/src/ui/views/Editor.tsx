import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import {setup, bookBlocks} from '../../plugins';
import tuiImageEditorPlugin from 'grapesjs-tui-image-editor';

// Define GrapesJS editor type
interface GrapesJSEditor {
  destroy: () => void;
  addStyle: (css: string) => void;
  setComponents: (components: string) => void;
  Panels: {
    addPanel: (panel: { id: string; el: string }) => void;
  };
}

const Editor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<GrapesJSEditor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!editorRef.current) return;

    const initializeEditor = async () => {
      try {
        // Let GrapesJS create its own structure with blocks-basic plugin

        const editorInstance = grapesjs.init({
          container: editorRef.current as HTMLElement,
          height: '100%',
          width: '100%',
          storageManager: false,
          plugins: [setup, bookBlocks, tuiImageEditorPlugin],

          // Core Color Configuration
          canvas: {
            styles: [
              'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
              'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
            ],
            scripts: []
          },

    
          // Plugin Configuration
          pluginsOpts: {
            'setup': {
              blocks: ['link-block', 'quote', 'text-basic'],
              useCustomTheme: false,
              showStylesOnChange: true,
              textCleanCanvas: 'Are you sure you want to clear the canvas?',
              modalImportTitle: 'Import Content',
              modalImportButton: 'Import'
            },
            'book-blocks': {
              blocks: ['column1', 'column2', 'column3', 'text', 'image', 'video'],
              category: 'Book Elements',
              flexGrid: true,
              addBasicStyle: true,
              rowHeight: 100,
              labelColumn1: 'Single Column',
              labelColumn2: 'Two Columns',
              labelColumn3: 'Three Columns',
              labelText: 'Text Block',
              labelImage: 'Image',
              labelVideo: 'Video'
            },
            'ebook-blocks': {
              blocks: ['text-basic', 'quote', 'text-section', 'chapter-title'],
              showStylesOnChange: true,
              textCleanCanvas: 'Are you sure you want to clear all content?',
              modalImportTitle: 'Import eBook Content',
              modalImportButton: 'Import Content',
              block: () => ({
                // Custom block configurations can go here
                attributes: { class: 'gjs-block-custom' }
              })
            },
            'grapesjs-tui-image-editor': {
              config: {
                includeUI: {
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

                    'submenu.backgroundColor': 'white',
                    'submenu.partition.color': '#e5e5e5',

                    'submenu.normalIcon.color': '#8a8a8a',
                    'submenu.activeIcon.color': '#555555',

                    'submenu.normalLabel.color': '#858585',
                    'submenu.normalLabel.fontWeight': 'normal',
                    'submenu.activeLabel.color': '#000000',
                    'submenu.activeLabel.fontWeight': 'normal',

                    'checkbox.border': '1px solid #ccc',
                    'checkbox.backgroundColor': '#fff',

                    'range.pointer.color': '#333',
                    'range.bar.color': '#ccc',
                    'range.subbar.color': '#606060',

                    'range.value.color': '#000',
                    'range.value.fontWeight': 'normal',
                    'range.value.fontSize': '11px',
                    'range.value.border': '0',
                    'range.value.backgroundColor': '#f5f5f5',
                    'range.title.color': '#000',
                    'range.title.fontWeight': 'lighter',

                    'colorpicker.button.border': '1px solid #cbcbcb',
                    'colorpicker.title.color': '#000'
                  },
                  menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
                  initMenu: 'filter',
                  uiSize: {
                    width: '100%',
                    height: '700px'
                  },
                  menuBarPosition: 'bottom'
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

        editorInstance.addStyle(`
          * {
            box-sizing: border-box;
          }

          .ebook-page-cover {
            min-height: 100vh;
            background: linear-gradient(135deg, #4a8c87 0%, #3f3f3f 100%);
            color: #dddddd;
            padding: 80px 20px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .ebook-page-content {
            min-height: 100vh;
            background: #4a4a4a;
            color:  #dddddd;
            padding: 60px 20px;
            position: relative;
          }

          .cover-title {
            font-size: 3em;
            margin-bottom: 20px;
          }

          .cover-subtitle {
            font-size: 1.2em;
            margin-bottom: 30px;
          }

          .cover-author {
            margin-top: 60px;
          }

          .cover-author p {
            font-style: italic;
          }

          .chapter-title {
            font-size: 2.5em;
            margin-bottom: 30px;
            color: #4a8c87;
          }

          .chapter-intro {
            font-size: 1.1em;
            line-height: 1.8;
            margin-bottom: 20px;
          }

          .section-title {
            font-size: 1.8em;
            margin-top: 30px;
            margin-bottom: 15px;
            color: #3b97e3;
          }

          .feature-list {
            line-height: 1.6;
            margin-bottom: 15px;
          }

          .content-paragraph {
            line-height: 1.6;
            margin-top: 30px;
          }

        `);

        // Set initial content with page structure
        editorInstance.setComponents(`
          <div class="ebook-content">
            <!-- Page 1: Cover Page -->
            <div class="ebook-page ebook-page-cover" data-page="1">
              <div class="container">
                <h1 class="cover-title">Your eBook Title</h1>
                <p class="cover-subtitle">A Journey Through Content Creation</p>
                <div class="cover-author">
                  <p>Written by: Your Name</p>
                </div>
              </div>
            </div>

            <!-- Page 2: Chapter 1 Start -->
            <div class="ebook-page ebook-page-content" data-page="2">
              <div class="container">
                <h2 class="chapter-title">Chapter 1: Getting Started</h2>
                <p class="chapter-intro">Welcome to the world of eBook creation! This editor provides you with powerful tools to bring your ideas to life. With our drag-and-drop interface, you can create professional-looking pages with minimal effort.</p>

                <h3 class="section-title">Features at Your Fingertips</h3>
                <p class="feature-list">• Page management with thumbnail previews<br/>
                • Drag-and-drop content blocks<br/>
                • Responsive design tools<br/>
                • Real-time editing capabilities</p>

                <p class="content-paragraph">Use the Page Manager panel on the left to navigate between pages, add new pages, or reorganize your eBook structure. Each page can be customized with different layouts, content types, and styling options.</p>
              </div>
            </div>
          </div>
        `);


        editorInstanceRef.current = editorInstance;
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing GrapesJS editor:', error);
        setIsLoading(false);
      }
    };

    initializeEditor();

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy();
      }
    };
  }, []);

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
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
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
    </div>
  );
};

export default Editor;