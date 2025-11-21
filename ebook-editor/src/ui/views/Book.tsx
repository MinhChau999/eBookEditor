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
  const { books, createBook, deleteBook } = useBookStore();
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
                        meta={`${book.layoutMode === 'fixed' ? 'Fixed' : 'Reflow'} • ${new Date(book.updatedAt).toLocaleDateString()}`}
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
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '500px', maxWidth: '90%',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.5rem', color: '#333' }}>Create New Book</h2>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Title</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)}
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }}
                        placeholder="Enter book title"
                        autoFocus
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Author</label>
                    <input 
                        type="text" 
                        value={author} 
                        onChange={e => setAuthor(e.target.value)}
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }}
                        placeholder="Enter author name"
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>Layout Type</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div 
                            onClick={() => setLayoutMode('fixed')}
                            style={{
                                border: `2px solid ${layoutMode === 'fixed' ? '#2196f3' : '#eee'}`,
                                borderRadius: '6px', padding: '15px', cursor: 'pointer',
                                backgroundColor: layoutMode === 'fixed' ? '#e3f2fd' : 'white',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '10px', color: layoutMode === 'fixed' ? '#2196f3' : '#888' }}>
                                <i className="fas fa-file-image" style={{ fontSize: '24px' }}></i>
                            </div>
                            <div style={{ fontWeight: 'bold', textAlign: 'center', color: '#333' }}>Fixed Layout</div>
                            <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center', marginTop: '5px' }}>Best for comics, magazines, print.</div>
                        </div>
                        <div 
                            onClick={() => setLayoutMode('reflow')}
                            style={{
                                border: `2px solid ${layoutMode === 'reflow' ? '#4caf50' : '#eee'}`,
                                borderRadius: '6px', padding: '15px', cursor: 'pointer',
                                backgroundColor: layoutMode === 'reflow' ? '#e8f5e9' : 'white',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '10px', color: layoutMode === 'reflow' ? '#4caf50' : '#888' }}>
                                <i className="fas fa-file-alt" style={{ fontSize: '24px' }}></i>
                            </div>
                            <div style={{ fontWeight: 'bold', textAlign: 'center', color: '#333' }}>Reflowable</div>
                            <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center', marginTop: '5px' }}>Best for novels, text-heavy books.</div>
                        </div>
                    </div>
                </div>

                {layoutMode === 'fixed' && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Page Size</label>
                        <select 
                            value={templateId} 
                            onChange={e => setTemplateId(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', backgroundColor: 'white' }}
                        >
                            {Object.entries(PAGE_TEMPLATES).map(([id, tpl]) => (
                                <option key={id} value={id}>{tpl.name} ({tpl.width}x{tpl.height}{tpl.unit})</option>
                            ))}
                        </select>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', color: '#666', fontSize: '1rem' }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreate}
                        disabled={!title}
                        style={{ 
                            padding: '10px 25px', 
                            backgroundColor: title ? '#2196f3' : '#ccc', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: title ? 'pointer' : 'not-allowed',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        Create Book
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};