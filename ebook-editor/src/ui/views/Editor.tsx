import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import '../../styles/grapes.min.css';
import {setup, bookBlocks} from '../../plugins';
// import '../../styles/theme.css';

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
          plugins: [setup, bookBlocks],

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
            }
          }
        });

        editorInstance.addStyle(`
          * {
            box-sizing: border-box;
          }

          body, .gjs-cv-canvas {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 0;
            background: var(--color-background, #444444);
            color: var(--color-text-primary, #dddddd);
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
          }

          /* Theme-based content sections */
          .hero-section {
            background: linear-gradient(135deg, var(--tertiary-color, #4a8c87) 0%, var(--primary-color, #3f3f3f) 100%) !important;
            color: var(--color-text-primary, #dddddd) !important;
            padding: 80px 20px !important;
            text-align: center !important;
          }

          .text-section {
            background: var(--color-surface, #4a4a4a) !important;
            padding: 60px 20px !important;
          }

          .image-text-section {
            background: var(--main-dk-color, rgba(0, 0, 0, 0.2)) !important;
            padding: 60px 20px !important;
          }

          .quote-section {
            background: linear-gradient(135deg, var(--tertiary-color, #4a8c87) 0%, var(--quaternary-color, #6cdada) 100%) !important;
            color: var(--color-text-primary, #dddddd) !important;
            padding: 60px 20px !important;
            text-align: center !important;
          }

          h1, h2, h3, h4, h5, h6 {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-weight: 600;
            color: var(--color-text-primary, #dddddd);
          }

          p {
            line-height: 1.6;
            color: var(--color-text-secondary, #b0b0b0);
          }

          /* GrapesJS Selection and Highlighting - USING DIRECT COLORS */
          .gjs-selected {
            outline: 2px solid #4a8c87 !important;
            outline-offset: 2px;
          }

          .gjs-cv-canvas {
            background: #444444 !important;
          }

          .gjs-pn-panel {
            background: #4a4a4a !important;
            color: #dddddd !important;
            border-color: #606060 !important;
          }

          .gjs-pn-panel .gjs-title {
            background: rgba(0, 0, 0, 0.2) !important;
            color: #dddddd !important;
            border-bottom-color: #606060 !important;
          }

          .gjs-block {
            background: #4a4a4a !important;
            color: #dddddd !important;
            border-color: #606060 !important;
          }

          .gjs-block:hover {
            background: #555555 !important;
            border-color: #4a8c87 !important;
          }

          .gjs-layer {
            background: #4a4a4a !important;
            color: #dddddd !important;
            border-color: #606060 !important;
          }

          .gjs-layer:hover {
            background: #555555 !important;
          }

          .gjs-layer.gjs-selected {
            background: #4a8c87 !important;
            color: white !important;
          }

          /* Style Manager */
          .gjs-sm-sector {
            background: var(--color-surface, #4a4a4a) !important;
            color: var(--color-text-primary, #dddddd) !important;
            border-color: var(--color-border, #606060) !important;
          }

          .gjs-sm-property {
            background: var(--color-surface, #4a4a4a) !important;
            color: var(--color-text-primary, #dddddd) !important;
          }

          .gjs-sm-label {
            color: var(--color-text-secondary, #b0b0b0) !important;
          }

          .gjs-sm-input, .gjs-sm-select {
            background: var(--main-dk-color, rgba(0, 0, 0, 0.2)) !important;
            color: var(--color-text-primary, #dddddd) !important;
            border-color: var(--color-border, #606060) !important;
          }

          .gjs-sm-input:focus, .gjs-sm-select:focus {
            border-color: var(--color-accent, #3b97e3) !important;
          }

          /* Traits Manager */
          .gjs-tm-traits {
            background: var(--color-surface, #4a4a4a) !important;
            color: var(--color-text-primary, #dddddd) !important;
          }

          .gjs-tm-trait {
            background: var(--color-surface, #4a4a4a) !important;
            border-color: var(--color-border, #606060) !important;
          }

          .gjs-tm-label {
            color: var(--color-text-secondary, #b0b0b0) !important;
          }

          .gjs-tm-input {
            background: var(--main-dk-color, rgba(0, 0, 0, 0.2)) !important;
            color: var(--color-text-primary, #dddddd) !important;
            border-color: var(--color-border, #606060) !important;
          }

          .gjs-tm-input:focus {
            border-color: var(--color-accent, #3b97e3) !important;
          }

          /* Top Toolbar */
          .gjs-toolbar {
            background: var(--color-surface, #4a4a4a) !important;
            border-color: var(--color-border, #606060) !important;
          }

          .gjs-toolbar-item {
            color: var(--color-text-primary, #dddddd) !important;
          }

          .gjs-toolbar-item:hover {
            color: var(--color-accent, #3b97e3) !important;
          }

          .gjs-toolbar-item.active {
            background: var(--color-accent, #3b97e3) !important;
            color: white !important;
          }

          /* GrapesJS Default Panel Styles - Enhanced for eBook Theme */
          .gjs-cv-canvas {
            height: 100vh !important;
            background: #444444 !important;
          }

          /* Default Panels */
          .gjs-pn-panel {
            background: #4a4a4a !important;
            color: #dddddd !important;
            border-color: #606060 !important;
          }

          .gjs-pn-panel .gjs-title {
            background: rgba(0, 0, 0, 0.2) !important;
            color: #dddddd !important;
            border-bottom-color: #606060 !important;
          }

          /* Style Manager */
          .gjs-sm-sector {
            background: #4a4a4a !important;
            color: #dddddd !important;
            border-color: #606060 !important;
          }

          .gjs-sm-property {
            background: #4a4a4a !important;
            color: #dddddd !important;
          }

          .gjs-sm-label {
            color: #b0b0b0 !important;
          }

          .gjs-sm-input, .gjs-sm-select {
            background: rgba(0, 0, 0, 0.2) !important;
            color: #dddddd !important;
            border-color: #606060 !important;
          }

          .gjs-sm-input:focus, .gjs-sm-select:focus {
            border-color: #4a8c87 !important;
          }

          /* Traits Manager */
          .gjs-tm-traits {
            background: #4a4a4a !important;
            color: #dddddd !important;
          }

          .gjs-tm-trait {
            background: #4a4a4a !important;
            border-color: #606060 !important;
          }

          .gjs-tm-label {
            color: #b0b0b0 !important;
          }

          .gjs-tm-input {
            background: rgba(0, 0, 0, 0.2) !important;
            color: #dddddd !important;
            border-color: #606060 !important;
          }

          .gjs-tm-input:focus {
            border-color: #4a8c87 !important;
          }

          /* Layers Panel */
          .gjs-layer {
            background: #4a4a4a !important;
            color: #dddddd !important;
            border-color: #606060 !important;
          }

          .gjs-layer:hover {
            background: #555555 !important;
          }

          .gjs-layer.gjs-selected {
            background: #4a8c87 !important;
            color: white !important;
          }

          /* Block Manager Styles */
          .gjs-block {
            background: #555555 !important;
            color: #dddddd !important;
            border: 1px solid #606060 !important;
            border-radius: 5px !important;
            padding: 15px !important;
            margin: 10px 0 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
          }

          .gjs-block:hover {
            background: #4a8c87 !important;
            border-color: #4a8c87 !important;
          }

          /* Custom preset-webpage plugin styles now - no auto-injected CSS */

          /* Ensure eBook content maintains our theme */
          .ebook-content * {
            color: inherit !important;
            background-color: transparent !important;
          }

          /* Block category styles */
          .gjs-block-category {
            background: #4a4a4a !important;
            color: #dddddd !important;
            border-bottom: 1px solid #606060 !important;
          }

          .gjs-block-category:hover {
            background: #555555 !important;
          }

          .gjs-block-category.active {
            background: #4a8c87 !important;
            color: white !important;
          }

          /* Left Sidebar Panel Styles */
          .gjs-pn-left-sidebar {
            --gjs-left-width: 15%;
          }

          /* Left sidebar container styles */
          .gjs-pn-left-sidebar {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: var(--gjs-left-width, 15%) !important;
            height: 100% !important;
            z-index: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1) !important;
          }

          /* Canvas layout adjustments */
          .gjs-cv-canvas {
            margin-left: var(--gjs-left-width, 15%) !important;
            width: calc(100% - 2 * var(--gjs-left-width, 15%)) !important;
          }

          /* Top panels positioning */
          .gjs-pn-commands,
          .gjs-pn-devices-c,
          .gjs-pn-options,
          .gjs-pn-views {
            left: var(--gjs-left-width, 15%) !important;
          }

          .gjs-pn-left-sidebar .gjs-pn-header {
            background: rgba(0, 0, 0, 0.2) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            font-weight: 500 !important;
            height: 40px !important;
            display: flex !important;
            align-items: center !important;
            padding: 0 15px !important;
            font-size: 14px !important;
          }

          .gjs-pn-left-sidebar .gjs-pn-content {
            background: transparent !important;
            flex: 1 !important;
            padding: 15px !important;
            overflow-y: auto !important;
          }

          .gjs-pn-left-sidebar .gjs-pn-btn {
            transition: all 0.2s ease;
          }

          .gjs-pn-left-sidebar .gjs-pn-btn:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: var(--gjs-ui-primary-color, #4a8c87) !important;
          }

          .gjs-pn-left-sidebar .gjs-page-item {
            transition: all 0.2s ease;
          }

          .gjs-pn-left-sidebar .gjs-page-item:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
          }

          .gjs-pn-left-sidebar .gjs-page-item.active {
            background: var(--gjs-ui-primary-color, #4a8c87) !important;
            border-color: var(--gjs-ui-primary-color, #4a8c87) !important;
          }
        `);

        // Set initial content with page structure
        editorInstance.setComponents(`
          <div class="ebook-content">
            <!-- Page 1: Cover Page -->
            <div class="ebook-page" data-page="1" style="
              min-height: 100vh;
              background: linear-gradient(135deg, var(--tertiary-color, #4a8c87) 0%, var(--primary-color, #3f3f3f) 100%);
              color: var(--color-text-primary, #dddddd);
              padding: 80px 20px;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
            ">
              <div class="container">
                <h1 style="font-size: 3em; margin-bottom: 20px;">Your eBook Title</h1>
                <p style="font-size: 1.2em; margin-bottom: 30px;">A Journey Through Content Creation</p>
                <div style="margin-top: 60px;">
                  <p style="font-style: italic;">Written by: Your Name</p>
                </div>
              </div>
            </div>

            <!-- Page 2: Chapter 1 Start -->
            <div class="ebook-page" data-page="2" style="
              min-height: 100vh;
              background: var(--color-surface, #4a4a4a);
              color: var(--color-text-primary, #dddddd);
              padding: 60px 20px;
              position: relative;
            ">
              <div class="container">
                <h2 style="font-size: 2.5em; margin-bottom: 30px; color: var(--tertiary-color, #4a8c87);">Chapter 1: Getting Started</h2>
                <p style="font-size: 1.1em; line-height: 1.8; margin-bottom: 20px;">Welcome to the world of eBook creation! This editor provides you with powerful tools to bring your ideas to life. With our drag-and-drop interface, you can create professional-looking pages with minimal effort.</p>

                <h3 style="font-size: 1.8em; margin-top: 30px; margin-bottom: 15px; color: var(--color-accent, #3b97e3);">Features at Your Fingertips</h3>
                <p style="line-height: 1.6; margin-bottom: 15px;">• Page management with thumbnail previews<br/>
                • Drag-and-drop content blocks<br/>
                • Responsive design tools<br/>
                • Real-time editing capabilities</p>

                <p style="line-height: 1.6; margin-top: 30px;">Use the Page Manager panel on the left to navigate between pages, add new pages, or reorganize your eBook structure. Each page can be customized with different layouts, content types, and styling options.</p>
              </div>
            </div>
          </div>
        `);

        // GrapesJS will automatically show its default panels

        // GrapesJS blocks-basic plugin provides its own panel management

        // GrapesJS blocks-basic plugin already provides blocks

        // GrapesJS blocks-basic plugin provides its own blocks and drag-drop functionality

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