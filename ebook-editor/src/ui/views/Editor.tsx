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
        `);

        // Set initial content
        editorInstance.setComponents(`
          <div class="ebook-content">
            <section class="hero-section">
              <div class="container">
                <h1>Welcome to Your eBook Editor</h1>
                <p>Start creating amazing content with our powerful drag-and-drop editor</p>
              </div>
            </section>

            <section class="text-section">
              <div class="container">
                <h2>Chapter 1: Getting Started</h2>
                <p>This is where your story begins. Use the blocks on the left to add different types of content to your eBook. You can drag and drop text blocks, images, videos, and more to create rich, engaging content for your readers.</p>
                <p>Click on any element to select it and use the properties panel on the right to customize its appearance. You can change colors, fonts, spacing, and much more to make your eBook look exactly how you want it to.</p>
              </div>
            </section>
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