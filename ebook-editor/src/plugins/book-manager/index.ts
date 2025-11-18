/*!
 * grapesjs-book-manager - 1.0.0
 * Book information management plugin for eBook editor
 */
import grapesjs from 'grapesjs';
import './book-manager.css';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Plugin configuration interface
interface BookManagerOptions {
  showBookInfo?: boolean;
  autoSave?: boolean;
  storageKey?: string;
}

// Book data interface
interface BookData {
  title: string;
  author: string;
  subtitle?: string;
  publisher?: string;
  isbn?: string;
  language?: string;
  genre?: string;
  description?: string;
  keywords?: string[];
  publishedDate?: string;
}

const plugin = grapesjs.plugins.add('book-manager', (editor: any, options: BookManagerOptions = {}) => {
  const config: BookManagerOptions = Object.assign({
    showBookInfo: true,
    autoSave: true,
    storageKey: 'ebook-book-data'
  }, options);

  // Default book data
  let bookData: BookData = {
    title: '',
    author: '',
    subtitle: '',
    publisher: '',
    isbn: '',
    language: 'en',
    genre: '',
    description: '',
    keywords: [],
    publishedDate: ''
  };

  // Load saved book data from localStorage
  const loadBookData = (): BookData => {
    try {
      const saved = localStorage.getItem(config.storageKey || 'ebook-book-data');
      if (saved) {
        return { ...bookData, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load book data from storage:', error);
    }
    return bookData;
  };

  // Save book data to localStorage
  const saveBookData = (data: Partial<BookData>) => {
    bookData = { ...bookData, ...data };

    if (config.autoSave) {
      try {
        localStorage.setItem(config.storageKey || 'ebook-book-data', JSON.stringify(bookData));
      } catch (error) {
        console.warn('Failed to save book data to storage:', error);
      }
    }

    // Trigger custom event for other components
    editor.trigger('book:dataChanged', bookData);
  };

  // Get current book data
  const getBookData = (): BookData => ({ ...bookData });

  // Create book info panel
  const createBookInfoPanel = (container: HTMLElement) => {
    const currentData = loadBookData();

    const bookInfoSection = document.createElement('div');
    bookInfoSection.className = 'book-info-section';

    bookInfoSection.innerHTML = `
      <div class="left-sidebar-title">
        <i class="fas fa-book"></i>
        <span>Book Information</span>
      </div>
      <div class="gjs-category-content">
        <div class="gjs-sm-properties">
          <div class="gjs-sm-field gjs-sm-composite">
            <div class="gjs-sm-label">Title *</div>
            <div class="gjs-sm-field">
              <input type="text" id="book-title" placeholder="Enter book title" value="${currentData.title || ''}">
            </div>
          </div>
          <div class="gjs-sm-field gjs-sm-composite">
            <div class="gjs-sm-label">Subtitle</div>
            <div class="gjs-sm-field">
              <input type="text" id="book-subtitle" placeholder="Enter book subtitle" value="${currentData.subtitle || ''}">
            </div>
          </div>
          <div class="gjs-sm-field gjs-sm-composite">
            <div class="gjs-sm-label">Author *</div>
            <div class="gjs-sm-field">
              <input type="text" id="book-author" placeholder="Enter author name" value="${currentData.author || ''}">
            </div>
          </div>
          <div class="gjs-sm-field gjs-sm-composite">
            <div class="gjs-sm-label">Publisher</div>
            <div class="gjs-sm-field">
              <input type="text" id="book-publisher" placeholder="Enter publisher name" value="${currentData.publisher || ''}">
            </div>
          </div>
          <div class="gjs-sm-field gjs-sm-composite">
            <div class="gjs-sm-label">ISBN</div>
            <div class="gjs-sm-field">
              <input type="text" id="book-isbn" placeholder="Enter ISBN number" value="${currentData.isbn || ''}">
            </div>
          </div>
          <div class="gjs-sm-field gjs-sm-composite">
            <div class="gjs-sm-label">Language</div>
            <div class="gjs-sm-field">
              <select id="book-language">
                <option value="en" ${currentData.language === 'en' ? 'selected' : ''}>English</option>
                <option value="vi" ${currentData.language === 'vi' ? 'selected' : ''}>Vietnamese</option>
                <option value="fr" ${currentData.language === 'fr' ? 'selected' : ''}>French</option>
                <option value="de" ${currentData.language === 'de' ? 'selected' : ''}>German</option>
                <option value="es" ${currentData.language === 'es' ? 'selected' : ''}>Spanish</option>
                <option value="ja" ${currentData.language === 'ja' ? 'selected' : ''}>Japanese</option>
                <option value="ko" ${currentData.language === 'ko' ? 'selected' : ''}>Korean</option>
                <option value="zh" ${currentData.language === 'zh' ? 'selected' : ''}>Chinese</option>
              </select>
            </div>
          </div>
          <div class="gjs-sm-field gjs-sm-composite">
            <div class="gjs-sm-label">Genre</div>
            <div class="gjs-sm-field">
              <input type="text" id="book-genre" placeholder="e.g., Fiction, Non-fiction, Technical" value="${currentData.genre || ''}">
            </div>
          </div>
          <div class="gjs-sm-field gjs-sm-composite">
            <div class="gjs-sm-label">Keywords</div>
            <div class="gjs-sm-field">
              <input type="text" id="book-keywords" placeholder="Enter keywords separated by commas" value="${currentData.keywords?.join(', ') || ''}">
            </div>
          </div>
          <div class="gjs-sm-field gjs-sm-composite">
            <div class="gjs-sm-label">Published Date</div>
            <div class="gjs-sm-field">
              <input type="date" id="book-published-date" value="${currentData.publishedDate || ''}">
            </div>
          </div>

          <div class="gjs-sm-field gjs-sm-composite">
            <div class="gjs-sm-label"></div>
            <div class="gjs-sm-field" style="display: flex; gap: 8px;">
              <button type="button" class="gjs-btn-import" id="save-book-info">
                <i class="fas fa-save"></i>
                Save Book Info
              </button>
              <button type="button" class="gjs-sm-btn" id="clear-book-info" title="Clear all fields">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    container.appendChild(bookInfoSection);

    // Add event listeners for form inputs
    const setupEventListeners = () => {
      // Auto-save on input change (debounced)
      let timeoutId: NodeJS.Timeout;

      const autoSave = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const formData = collectFormData();
          saveBookData(formData);
        }, 500);
      };

      const collectFormData = (): Partial<BookData> => {
        const keywordsStr = (bookInfoSection.querySelector('#book-keywords') as HTMLInputElement)?.value || '';
        const keywords = keywordsStr.split(',').map(k => k.trim()).filter(k => k.length > 0);

        return {
          title: (bookInfoSection.querySelector('#book-title') as HTMLInputElement)?.value || '',
          subtitle: (bookInfoSection.querySelector('#book-subtitle') as HTMLInputElement)?.value || '',
          author: (bookInfoSection.querySelector('#book-author') as HTMLInputElement)?.value || '',
          publisher: (bookInfoSection.querySelector('#book-publisher') as HTMLInputElement)?.value || '',
          isbn: (bookInfoSection.querySelector('#book-isbn') as HTMLInputElement)?.value || '',
          language: (bookInfoSection.querySelector('#book-language') as HTMLSelectElement)?.value || 'en',
          genre: (bookInfoSection.querySelector('#book-genre') as HTMLInputElement)?.value || '',
          keywords: keywords,
          publishedDate: (bookInfoSection.querySelector('#book-published-date') as HTMLInputElement)?.value || ''
        };
      };

      // Add input event listeners to all form fields
      const inputs = bookInfoSection.querySelectorAll('input, select');
      inputs.forEach(input => {
        input.addEventListener('input', autoSave);
        input.addEventListener('change', autoSave);
      });

      // Save button click handler
      const saveBtn = bookInfoSection.querySelector('#save-book-info');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const formData = collectFormData();
          saveBookData(formData);

          // Visual feedback
          const saveBtnEl = saveBtn as HTMLButtonElement;
          const originalText = saveBtnEl.innerHTML;
          saveBtnEl.innerHTML = '<i class="fas fa-check" style="margin-right: 6px;"></i>Saved!';
          saveBtnEl.classList.add('saved');

          setTimeout(() => {
            saveBtnEl.innerHTML = originalText;
            saveBtnEl.classList.remove('saved');
          }, 2000);
        });
      }

      // Clear button click handler
      const clearBtn = bookInfoSection.querySelector('#clear-book-info');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          if (confirm('Are you sure you want to clear all book information?')) {
            // Clear all form fields
            const inputs = bookInfoSection.querySelectorAll('input, select');
            inputs.forEach(input => {
              if (input instanceof HTMLInputElement) {
                input.value = '';
              } else if (input instanceof HTMLSelectElement) {
                input.selectedIndex = 0;
              }
            });

            // Clear saved data
            saveBookData({
              title: '',
              author: '',
              subtitle: '',
              publisher: '',
              isbn: '',
              language: 'en',
              genre: '',
              keywords: [],
              publishedDate: ''
            });
          }
        });
      }
    };

    // Setup event listeners after a short delay to ensure DOM is ready
    setTimeout(setupEventListeners, 100);
  };

  // Expose methods to editor
  editor.BookManager = {
    getData: getBookData,
    saveData: saveBookData,
    loadData: loadBookData,
    createPanel: createBookInfoPanel
  };

  // Add commands
  editor.Commands.add('book-manager:show', {
    run(editor: any) {
      const modal = editor.Modal;
      const content = document.createElement('div');
      content.className = 'book-manager-modal-content';

      createBookInfoPanel(content);

      modal.open({
        title: 'Book Information Manager',
        content: content
      });
    },

    stop(editor: any) {
      editor.Modal.close();
    }
  });

  editor.Commands.add('book-manager:get-data', {
    run() {
      return getBookData();
    }
  });

  // Initialize book data on plugin load
  bookData = loadBookData();

  return editor;
});

export default plugin;

/* eslint-enable @typescript-eslint/no-explicit-any */