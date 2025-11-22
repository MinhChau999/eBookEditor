import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grapesjs from 'grapesjs';
import tuiImageEditorPlugin from 'grapesjs-tui-image-editor';
import coreSetup from '../../plugins/core-setup';
import bookAdapter from '../../plugins/book-adapter';
import leftPanel from '../../plugins/left-panel';
// import customRuler from '../../plugins/ruler/index';
import { ExportModal } from '../../features/export/components/ExportModal';
import { useBookStore } from '../../core/store/bookStore';

// Define GrapesJS editor type
interface EditorProps {
  // Add any props if needed
}

const Editor: React.FC<EditorProps> = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<any>(null);
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
        const editorInstance = grapesjs.init({
          container: editorRef.current as HTMLElement,
          height: '100%',
          width: '100%',
          storageManager: false,
          // Initialize with Sample Pages
          pageManager: {
            pages: [
              {
                id: 'page-cover',
                name: 'Cover',
                component: `
                  <div class="page-container" data-page="1">
                    <div class="ebook-page ebook-page-cover w-full h-full flex flex-col items-center justify-center text-center p-20 relative overflow-hidden">
                      <div class="container w-full max-w-3xl mx-auto">
                        <h1 class="cover-title text-5xl mb-5 font-bold text-gray-800">Thơ ca Đời sống</h1>
                        <p class="cover-subtitle text-xl mb-8 text-gray-600">Hành trình của những cảm xúc thăng hoa</p>
                        <div class="cover-author mt-16">
                          <p class="italic text-gray-500">Với lời tâm sự từ trái tim</p>
                          <p class="italic text-gray-500">Khám phá vẻ đẹp trong từng vần thơ</p>
                        </div>
                      </div>
                    </div>
                  </div>
                `
              },
              {
                id: 'page-chapter-1',
                name: 'Chapter 1',
                component: `
                  <div class="page-container" data-page="2">
                    <div class="ebook-page ebook-page-content w-full h-full p-16 relative overflow-hidden bg-white text-gray-800">
                      <div class="container w-full h-full flex flex-col">
                        <h2 class="chapter-title text-4xl mb-8 text-blue-600 font-bold">Chương 1: Khởi đầu hành trình</h2>
                        <p class="chapter-intro text-lg leading-relaxed mb-6">Trong thế giới của chữ nghĩa và cảm xúc, mỗi trang sách là một cánh cửa mở ra những chân trời mới. Từng câu thơ như mạch nguồn trong veo, chảy trôi qua những thung lũng của tâm hồn, mang theo hương thơm của ký ức và màu sắc của hiện tại.</p>
                        
                        <h3 class="section-title text-2xl mt-8 mb-4 text-green-600 font-semibold">Vẻ đẹp của sự đơn sơ</h3>
                        <div class="feature-list leading-relaxed mb-4 pl-4 border-l-4 border-green-100">
                          <p>• Mỗi vần thơ là một trang đời</p>
                          <p>• Từng câu văn là một khúc ca</p>
                          <p>• Mỗi trang sách là một câu chuyện</p>
                          <p>• Mỗi chương là một chặng đường</p>
                        </div>

                        <p class="content-paragraph leading-relaxed mt-6">Hãy để cho tâm hồn mình được phiêu lãng cùng những con chữ, để trái tim được rung động bởi những giai điệu của ngôn từ. Cuốn sách này không chỉ là tập hợp những con chữ, mà là cuộc đối thoại giữa tâm hồn ta và thế giới xung quanh.</p>
                        
                        <!-- Footer/Page Number -->
                        <div class="absolute bottom-8 left-0 right-0 text-center text-sm text-gray-400">
                          Page 2
                        </div>
                      </div>
                    </div>
                  </div>
                `
              },
              {
                id: 'page-chapter-2',
                name: 'Chapter 2',
                component: `
                  <div class="page-container" data-page="3">
                    <div class="ebook-page ebook-page-content w-full h-full p-16 relative overflow-hidden bg-white text-gray-800">
                      <div class="container w-full h-full flex flex-col">
                        <h2 class="chapter-title text-4xl mb-8 text-purple-600 font-bold">Chương 2: Những Cung Bậc Cảm Xúc</h2>
                        <p class="chapter-intro text-lg leading-relaxed mb-6">Cuộc sống là một bản giao hưởng của những cảm xúc. Có những nốt thăng vui tươi, rộn rã, nhưng cũng có những nốt trầm sâu lắng, suy tư. Thơ ca chính là phương tiện để ta ghi lại những cung bậc ấy, để lưu giữ những khoảnh khắc đáng nhớ của cuộc đời.</p>

                        <div class="grid grid-cols-2 gap-6 mt-8">
                          <div class="p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <h4 class="font-bold text-purple-700 mb-2">Niềm Vui</h4>
                            <p class="text-sm text-gray-600">Như ánh nắng ban mai, sưởi ấm tâm hồn và mang lại hy vọng mới.</p>
                          </div>
                          <div class="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h4 class="font-bold text-blue-700 mb-2">Nỗi Buồn</h4>
                            <p class="text-sm text-gray-600">Như cơn mưa rào mùa hạ, gột rửa những ưu tư và giúp ta trưởng thành hơn.</p>
                          </div>
                        </div>

                        <p class="content-paragraph leading-relaxed mt-8">Đừng ngại ngần thể hiện cảm xúc của mình. Hãy để những vần thơ nói hộ lòng bạn, để chia sẻ niềm vui và nỗi buồn với thế giới xung quanh.</p>
                        
                        <!-- Footer/Page Number -->
                        <div class="absolute bottom-8 left-0 right-0 text-center text-sm text-gray-400">
                          Page 3
                        </div>
                      </div>
                    </div>
                  </div>
                `
              }
            ]
          },
          plugins: [
            coreSetup,
            bookAdapter,
            leftPanel,
            // customRuler,
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
        editorInstance.addStyle(`
          * {
            box-sizing: border-box;
          }

          .ebook-page-cover {
            min-height: 100vh;
            background: linear-gradient(135deg, #81C7BD 0%, #6BB6A8 50%, #A8D5E2 100%);
            color: #2c3e50;
            padding: 80px 20px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .ebook-page-content {
            min-height: 100vh;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%);
            color: #2c3e50;
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
            color: #2980b9;
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
            color: #27ae60;
          }

          .feature-list {
            line-height: 1.6;
            margin-bottom: 15px;
          }

          .content-paragraph {
            line-height: 1.6;
            margin-top: 30px;
          }

          /* Default Page Container Style (will be overridden by Fixed Adapter) */
          .page-container {
            position: relative;
            width: 100%;
            height: auto;
            background: white;
          }
        `);

        editorInstanceRef.current = editorInstance;
        setIsLoading(false);
      } catch (error) {
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