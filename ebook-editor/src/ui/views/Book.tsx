import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SimpleInput } from '../components/Input';
import { CreateBookCard, BookItem, TemplateBookCard } from '../components/BookCard';
import { useBookStore } from '../../core/store/bookStore';
import { PAGE_TEMPLATES } from '../../features/fixed-layout/utils/pageTemplates';
import '../../styles/book.css';

export const Book: React.FC = () => {
  const navigate = useNavigate();
  const { books, createBook } = useBookStore();
  const [activeTab, setActiveTab] = useState<'books' | 'templates'>('books');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [layoutMode, setLayoutMode] = useState<'fixed' | 'reflow'>('fixed');
  const [templateId, setTemplateId] = useState('A4_PORTRAIT');

  const handleCreate = () => {
    if (!title) return;

    createBook({
      title,
      author,
      layoutMode,
      template: layoutMode === 'fixed' ? templateId : undefined,
    });

    setIsModalOpen(false);
    setTitle('');
    setAuthor('');
    // Optionally navigate to the new book immediately
    // const newBook = books[books.length - 1]; // This might be risky if state update is async
    // navigate(`/editor/${newBook.id}`);
  };

  const handleOpenBook = (bookId: string) => {
    navigate(`/editor/${bookId}`);
  };

  return (
    <div className="editor-layout">
      <Header />

      <div className="editor-content">
        <div className="editor-content-wrapper">
          {/* Tab Navigation */}
          <nav className="tab-navigation">
            <div className="tab-nav-left">
              <button
                className={`tab-item ${activeTab === 'books' ? 'active' : ''}`}
                onClick={() => setActiveTab('books')}
              >
                <i className="fas fa-book tab-icon"></i>
                Books
              </button>
              <button
                className={`tab-item ${activeTab === 'templates' ? 'active' : ''}`}
                onClick={() => setActiveTab('templates')}
              >
                <i className="fas fa-layer-group tab-icon"></i>
                Templates
              </button>
            </div>

            <div className="tab-nav-right">
              <SimpleInput
                type="search"
                placeholder="Search books, authors, or content..."
                iconLeft="fas fa-search"
              />
            </div>
          </nav>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Books Tab */}
            <div className={`tab-panel ${activeTab === 'books' ? 'active' : ''}`}>
              <div className="content-grid">
                {/* Add New Book Card - First */}
                <div onClick={() => setIsModalOpen(true)}>
                    <CreateBookCard
                    title="Create New Book"
                    description="Start from scratch"
                    href="#" // Prevent default navigation
                    />
                </div>

                {/* Actual Books from Store */}
                {books.map((book) => (
                  <div key={book.id} onClick={() => handleOpenBook(book.id)}>
                      <BookItem
                        title={book.title}
                        cover={book.coverImage || 'https://via.placeholder.com/300x400?text=No+Cover'}
                        meta={`${book.layoutMode === 'fixed' ? 'Fixed' : 'Reflowable'} • ${new Date(book.updatedAt).toLocaleDateString()}`}
                        href={`#`} // Handled by onClick
                      />
                  </div>
                ))}
              </div>
            </div>

            {/* Templates Tab */}
            <div className={`tab-panel ${activeTab === 'templates' ? 'active' : ''}`}>
              <div className="content-grid template-grid">
                {/* Sample Template Cards */}
                {[
                  {
                    title: 'Novel Template',
                    description: 'Perfect for fiction writers with chapter organization',
                    badge: 'Popular',
                    cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&q=80'
                  },
                  // ... keep other templates or load from a config
                ].map((template, index) => (
                  <TemplateBookCard
                    key={index}
                    title={template.title}
                    cover={template.cover}
                    description={template.description}
                    badge={template.badge || undefined}
                    onClick={() => console.log(`Use ${template.title} template`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="editor-status">
        <Footer />
      </div>

      {/* Create Book Modal */}
      {isModalOpen && (
        <div className="gjs-mdl-container">
          <div className="gjs-mdl-dialog" style={{
            animation: 'gjs-slide-down 0.3s ease-out'
          }}>
            <button
              className="gjs-mdl-btn-close"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
            >
              ×
            </button>

            <div className="gjs-mdl-header">
              <h2 className="gjs-mdl-title">Create New Book</h2>
            </div>

            <div className="gjs-mdl-content">
              <div className="gjs-field gjs-sm-field" style={{ marginBottom: 'var(--spacing-md)' }}>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter book title"
                  autoFocus
                  className="w-full"
                />
              </div>

              <div className="gjs-field gjs-sm-field" style={{ marginBottom: 'var(--spacing-md)' }}>
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Enter author name"
                  className="w-full"
                />
              </div>

              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Layout Type
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--spacing-md)'
                }}>
                  <div
                    onClick={() => setLayoutMode('fixed')}
                    className={`layout-option ${layoutMode === 'fixed' ? 'layout-option-active' : ''}`}
                  >
                    <div className="layout-option-icon">
                      <i className="fas fa-file-image"></i>
                    </div>
                    <div className="layout-option-title">Fixed Layout</div>
                    <div className="layout-option-desc">Best for comics, magazines, print</div>
                  </div>
                  <div
                    onClick={() => setLayoutMode('reflow')}
                    className={`layout-option ${layoutMode === 'reflow' ? 'layout-option-active' : ''}`}
                  >
                    <div className="layout-option-icon">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div className="layout-option-title">Reflowable</div>
                    <div className="layout-option-desc">Best for novels, text-heavy books</div>
                  </div>
                </div>
              </div>

              {layoutMode === 'fixed' && (
                <div className="gjs-field gjs-sm-field" style={{ marginBottom: 'var(--spacing-md)' }}>
                  <select
                    value={templateId}
                    onChange={e => setTemplateId(e.target.value)}
                    className="w-full"
                  >
                    {Object.entries(PAGE_TEMPLATES).map(([id, tpl]) => (
                      <option key={id} value={id}>{tpl.name} ({tpl.width}x{tpl.height}{tpl.unit})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="modal-actions">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="gjs-sm-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!title}
                  className={`gjs-btn-prim ${!title ? 'disabled' : ''}`}
                >
                  Create Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .layout-option {
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          cursor: pointer;
          background: var(--color-surface);
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          text-align: center;
        }

        .layout-option:hover {
          border-color: var(--color-accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .layout-option.layout-option-active {
          border-color: var(--color-accent);
          background: linear-gradient(135deg,
            rgba(59, 151, 227, 0.1),
            rgba(59, 151, 227, 0.05)
          );
        }

        .layout-option-icon {
          font-size: var(--font-size-2xl);
          margin-bottom: var(--spacing-sm);
          color: var(--color-text-secondary);
          transition: color 0.2s ease;
        }

        .layout-option.layout-option-active .layout-option-icon {
          color: var(--color-accent);
        }

        .layout-option-title {
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-xs);
          font-size: var(--font-size-sm);
        }

        .layout-option-desc {
          font-size: var(--font-size-xs);
          color: var(--color-text-secondary);
          line-height: var(--line-height-snug);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-md);
          margin-top: var(--spacing-lg);
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--color-border);
        }

        .disabled {
          opacity: 0.5;
          cursor: not-allowed !important;
          pointer-events: none;
        }

        @keyframes gjs-slide-down {
          0% {
            transform: translate(0, -3rem);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0);
            opacity: 1;
          }
        }

        .gjs-mdl-container {
          font-family: var(--font-family-sans);
          overflow-y: auto;
          position: fixed;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: var(--z-modal);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .gjs-mdl-dialog {
          text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.05);
          margin: auto;
          max-width: 600px;
          width: 90%;
          border-radius: var(--radius-lg);
          font-weight: var(--font-weight-light);
          position: relative;
          z-index: var(--z-modal);
          background: var(--color-surface);
          box-shadow: var(--shadow-xl);
        }

        .gjs-mdl-header {
          position: relative;
          border-bottom: 1px solid var(--color-border);
          padding: var(--spacing-lg);
        }

        .gjs-mdl-title {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin: 0;
        }

        .gjs-mdl-content {
          padding: var(--spacing-lg);
        }

        .gjs-mdl-btn-close {
          opacity: 0.7;
          filter: alpha(opacity: 70);
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          position: absolute;
          right: var(--spacing-md);
          top: var(--spacing-md);
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          transition: all 0.2s ease;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
        }

        .gjs-mdl-btn-close:hover {
          opacity: 1;
          filter: alpha(opacity: 100);
          background: var(--main-dkl-color);
          color: var(--color-text-primary);
        }

        .w-full {
          width: 100%;
        }
      `}</style>
    </div>
  );
};