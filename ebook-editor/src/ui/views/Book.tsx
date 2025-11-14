import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import '../../styles/theme.css';
import '../../styles/book.css';

export const Book: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'books' | 'templates'>('books');

  return (
    <div className="editor-layout">
      <Header />

      <div className="editor-content">
        <div className="editor-content-wrapper">
          {/* Tab Navigation */}
          <nav className="tab-navigation">
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
          </nav>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Books Tab */}
            <div className={`tab-panel ${activeTab === 'books' ? 'active' : ''}`}>
              <div className="content-grid">
                {/* Add New Book Card - First */}
                <Link to="/editor" className="book-card-link">
                  <div className="content-card content-card-create">
                    <div className="content-media content-media-create">
                      <i className="fas fa-plus content-media-icon"></i>
                    </div>
                    <div className="content-info content-info-create">
                      <h3 className="content-title">Create New Book</h3>
                      <p className="content-meta">Start from scratch</p>
                    </div>
                  </div>
                </Link>

                {/* Sample Book Cards */}
                {[
                  {
                    title: 'My First Novel',
                    meta: '2h ago',
                    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&q=80'
                  },
                  {
                    title: 'Travel Guide 2024',
                    meta: '1d ago',
                    cover: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=300&h=400&fit=crop&q=80'
                  },
                  {
                    title: 'Cookbook Collection',
                    meta: '3d ago',
                    cover: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=400&fit=crop&q=80'
                  },
                  {
                    title: 'Technical Manual',
                    meta: '1w ago',
                    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop&q=80'
                  },
                  {
                    title: 'Photo Album',
                    meta: '2w ago',
                    cover: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=400&fit=crop&q=80'
                  },
                  {
                    title: 'Story Collection',
                    meta: '1m ago',
                    cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&q=80'
                  },
                ].map((book, index) => (
                  <Link key={index} to={`/editor/${index}`} className="book-card-link">
                    <div className="content-card">
                      <div className="content-media content-media-book">
                        <img
                          src={book.cover}
                          alt={`${book.title} cover`}
                          className="book-cover-image"
                        />
                      </div>
                      <div className="content-info">
                        <h3 className="content-title">{book.title}</h3>
                        <p className="content-meta">{book.meta}</p>
                      </div>
                    </div>
                  </Link>
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
                  {
                    title: 'Non-Fiction Book',
                    description: 'Structured layout for educational and informational content',
                    badge: 'New',
                    cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&q=80'
                  },
                  {
                    title: 'Photo Book',
                    description: 'Showcase your photography with beautiful layouts',
                    badge: null,
                    cover: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=400&fit=crop&q=80'
                  },
                  {
                    title: 'Cookbook',
                    description: 'Recipe format with ingredient lists and instructions',
                    badge: null,
                    cover: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=400&fit=crop&q=80'
                  },
                  {
                    title: 'Travel Guide',
                    description: 'Organize travel content with maps and itineraries',
                    badge: null,
                    cover: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=300&h=400&fit=crop&q=80'
                  },
                  {
                    title: 'Technical Manual',
                    description: 'Clean layout for technical documentation',
                    badge: null,
                    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop&q=80'
                  },
                ].map((template, index) => (
                  <div key={index} className="content-card" onClick={() => console.log(`Use ${template.title} template`)}>
                    <div className="content-media content-media-book">
                      <img
                        src={template.cover}
                        alt={`${template.title} template`}
                        className="book-cover-image"
                      />
                      {template.badge && (
                        <span className="template-badge">{template.badge}</span>
                      )}
                    </div>
                    <div className="content-info">
                      <h3 className="content-title">{template.title}</h3>
                      <p className="content-description">{template.description}</p>
                    </div>
                  </div>
                ))}
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