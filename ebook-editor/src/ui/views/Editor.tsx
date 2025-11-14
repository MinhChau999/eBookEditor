import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import '../../styles/theme.css';
import '../../styles/editor.css';

export const Editor: React.FC = () => {
  const { bookId } = useParams();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'settings'>('edit');

  return (
    <div className="editor-layout">
      <Header />

      <div className="editor-content">
        <div className="editor-content-wrapper">
          {/* Tab Navigation */}
          <nav className="tab-navigation">
            <button
              className={`tab-item ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              <i className="fas fa-edit tab-icon"></i>
              Edit
            </button>
            <button
              className={`tab-item ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <i className="fas fa-eye tab-icon"></i>
              Preview
            </button>
            <button
              className={`tab-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <i className="fas fa-cog tab-icon"></i>
              Settings
            </button>
          </nav>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Edit Tab */}
            <div className={`tab-panel ${activeTab === 'edit' ? 'active' : ''}`}>
              <div className="editor-workspace">
                <div className="editor-sidebar">
                  <h3 className="sidebar-title">Tools</h3>
                  <div className="tool-section">
                    <div className="tool-item">
                      <i className="fas fa-font"></i>
                      <span>Text</span>
                    </div>
                    <div className="tool-item">
                      <i className="fas fa-image"></i>
                      <span>Images</span>
                    </div>
                    <div className="tool-item">
                      <i className="fas fa-shapes"></i>
                      <span>Shapes</span>
                    </div>
                    <div className="tool-item">
                      <i className="fas fa-palette"></i>
                      <span>Colors</span>
                    </div>
                  </div>

                  <h3 className="sidebar-title">Pages</h3>
                  <div className="page-list">
                    <div className="page-item active">Page 1</div>
                    <div className="page-item">Page 2</div>
                    <button className="add-page-btn">
                      <i className="fas fa-plus"></i>
                      Add Page
                    </button>
                  </div>
                </div>

                <div className="editor-canvas">
                  <div className="canvas-toolbar">
                    <button className="tool-btn">
                      <i className="fas fa-undo"></i>
                    </button>
                    <button className="tool-btn">
                      <i className="fas fa-redo"></i>
                    </button>
                    <div className="divider"></div>
                    <button className="tool-btn">
                      <i className="fas fa-cut"></i>
                    </button>
                    <button className="tool-btn">
                      <i className="fas fa-copy"></i>
                    </button>
                    <button className="tool-btn">
                      <i className="fas fa-paste"></i>
                    </button>
                    <div className="divider"></div>
                    <button className="tool-btn">
                      <i className="fas fa-align-left"></i>
                    </button>
                    <button className="tool-btn">
                      <i className="fas fa-align-center"></i>
                    </button>
                    <button className="tool-btn">
                      <i className="fas fa-align-right"></i>
                    </button>
                  </div>
                  <div className="canvas-area">
                    <div className="canvas-placeholder">
                      <div className="placeholder-icon">
                        <i className="fas fa-book-open"></i>
                      </div>
                      <h3>{bookId ? `Editing Book #${parseInt(bookId) + 1}` : 'Create New Book'}</h3>
                      <p>Drag and drop elements from the sidebar or double-click to add content</p>
                      <button className="start-editing-btn">Start Editing</button>
                      <Link to="/" className="back-to-books-btn">
                        <i className="fas fa-arrow-left"></i>
                        Back to Books
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="editor-properties">
                  <h3 className="properties-title">Properties</h3>
                  <div className="property-section">
                    <div className="property-item">
                      <label>Font Size</label>
                      <input type="number" defaultValue="16" />
                    </div>
                    <div className="property-item">
                      <label>Font Weight</label>
                      <select>
                        <option>Regular</option>
                        <option>Bold</option>
                        <option>Light</option>
                      </select>
                    </div>
                    <div className="property-item">
                      <label>Color</label>
                      <input type="color" defaultValue="#000000" />
                    </div>
                    <div className="property-item">
                      <label>Background</label>
                      <input type="color" defaultValue="#ffffff" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Tab */}
            <div className={`tab-panel ${activeTab === 'preview' ? 'active' : ''}`}>
              <div className="preview-workspace">
                <div className="preview-controls">
                  <button className="preview-btn">
                    <i className="fas fa-mobile-alt"></i>
                    Mobile
                  </button>
                  <button className="preview-btn active">
                    <i className="fas fa-tablet-alt"></i>
                    Tablet
                  </button>
                  <button className="preview-btn">
                    <i className="fas fa-desktop"></i>
                    Desktop
                  </button>
                  <button className="export-btn">
                    <i className="fas fa-download"></i>
                    Export
                  </button>
                </div>
                <div className="preview-viewport">
                  <div className="preview-page">
                    <div className="preview-placeholder">
                      <i className="fas fa-eye"></i>
                      <h3>Preview Mode</h3>
                      <p>Your book will appear here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Tab */}
            <div className={`tab-panel ${activeTab === 'settings' ? 'active' : ''}`}>
              <div className="settings-workspace">
                <div className="settings-section">
                  <h3>Book Settings</h3>
                  <div className="setting-item">
                    <label>Book Title</label>
                    <input type="text" placeholder="Enter book title" />
                  </div>
                  <div className="setting-item">
                    <label>Author</label>
                    <input type="text" placeholder="Enter author name" />
                  </div>
                  <div className="setting-item">
                    <label>Description</label>
                    <textarea placeholder="Enter book description" rows={4}></textarea>
                  </div>
                  <div className="setting-item">
                    <label>Cover Image</label>
                    <button className="upload-btn">
                      <i className="fas fa-upload"></i>
                      Upload Cover
                    </button>
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Export Settings</h3>
                  <div className="setting-item">
                    <label>Format</label>
                    <select>
                      <option>PDF</option>
                      <option>EPUB</option>
                      <option>MOBI</option>
                      <option>HTML</option>
                    </select>
                  </div>
                  <div className="setting-item">
                    <label>Quality</label>
                    <select>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>

                <div className="settings-actions">
                  <button className="save-btn">Save Settings</button>
                  <button className="reset-btn">Reset to Default</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="editor-status">
        <Footer />
      </div>
    </div>
  );
};