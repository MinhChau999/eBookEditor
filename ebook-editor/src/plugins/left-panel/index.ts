import grapesjs from 'grapesjs';

export default grapesjs.plugins.add('left-panel', (editor, options = {}) => {
  const config = { ...options };

  // Create the main left panel container
  const headerLeftSidebar = document.createElement('div');
  headerLeftSidebar.className = 'gjs-pn-header-left-sidebar gjs-pn-panel gjs-one-bg gjs-two-color';

  const contentLeftSidebar = document.createElement('div');
  contentLeftSidebar.className = 'gjs-pn-content-left-sidebar gjs-pn-panel gjs-one-bg gjs-two-color left-sidebar-content';

  // Tab configuration
  const leftSidebarTabs = [
    { id: 'book-structure', label: 'Structure', icon: '<svg style="display:block;max-width:18px" viewBox="0 0 24 24"><path fill="currentColor" d="M21,5C19.89,4.65 18.67,4.5 17.5,4.5C15.55,4.5 13.45,4.9 12,6C10.55,4.9 8.45,4.5 6.5,4.5C4.55,4.5 2.45,4.9 1,6V20.65C1,20.9 1.25,21.15 1.5,21.15C1.6,21.15 1.65,21.1 1.75,21.1C3.1,20.45 5.05,20 6.5,20C8.45,20 10.55,20.4 12,21.5C13.35,20.65 15.8,20 17.5,20C19.15,20 20.85,20.3 22.25,21.05C22.35,21.1 22.4,21.1 22.5,21.1C22.75,21.1 23,20.85 23,20.6V6C22.4,5.55 21.75,5.25 21,5M21,18.5C19.9,18.15 18.7,18 17.5,18C15.8,18 13.35,18.65 12,19.5V8C13.35,7.15 15.8,6.5 17.5,6.5C18.7,6.5 19.9,6.65 21,7V18.5Z" /></svg>' },
    { id: 'assets', label: 'Assets', icon: '<svg style="display:block;max-width:18px" viewBox="0 0 24 24"><path fill="currentColor" d="M5,1C3.89,1 3,1.89 3,3V7H5V5H19V19H5V17H3V21A2,2 0 0,0 5,23H19A2,2 0 0,0 21,21V3A2,2 0 0,0 19,1H5M7,9V11H9V9H7M11,9V11H13V9H11M15,9V11H17V9H15M7,13V15H9V13H7M11,13V15H13V13H11M15,13V15H17V13H15Z" /></svg>' }
  ];

  // Helper to add collapse functionality
  const addCollapseFunctionality = (container: HTMLElement) => {
    const categoryTitles = container.querySelectorAll('.left-sidebar-title, .gjs-category-title, .gjs-sm-sector-title');
    categoryTitles.forEach(title => {
      title.addEventListener('click', (e) => {
        e.preventDefault();
        const isCollapsed = title.classList.contains('collapsed');
        const content = title.nextElementSibling as HTMLElement;
        if (content && content.classList.contains('gjs-category-content')) {
          if (isCollapsed) {
            title.classList.remove('collapsed');
            content.classList.remove('collapsed');
          } else {
            title.classList.add('collapsed');
            content.classList.add('collapsed');
          }
        }
      });
    });
  };

  // --- View Creators ---

  const createBookStructureView = (container: HTMLElement) => {
    const structureView = document.createElement('div');
    structureView.className = 'structure-view';

    // Book Info Section
    // Book Info Section
    const bookInfoSection = document.createElement('div');
    bookInfoSection.innerHTML = `
      <div class="left-sidebar-title">
        <i class="fas fa-book" style="margin-right: 8px;"></i>
        <span>Book Info</span>
      </div>
      <div class="gjs-category-content" style="padding: var(--gjs-input-padding-multiple);">
        <div class="gjs-form-group">
          <div class="gjs-field">
            <input type="text" placeholder="Book Title" value="My Awesome Book" />
          </div>
        </div>
        <div class="gjs-form-group">
          <div class="gjs-field">
            <input type="text" placeholder="Author" value="Author Name" />
          </div>
        </div>
        <div class="gjs-form-group">
          <div class="gjs-field">
            <textarea placeholder="Description" rows="3"></textarea>
          </div>
        </div>
      </div>
    `;
    structureView.appendChild(bookInfoSection);

    // Chapters Section
    const chaptersSection = document.createElement('div');
    chaptersSection.innerHTML = `
      <div class="left-sidebar-title">
        <i class="fas fa-list" style="margin-right: 8px;"></i>
        <span>Chapters</span>
        <button class="gjs-sm-btn" style="margin-left: auto;">+ Add</button>
      </div>
      <div class="gjs-category-content" style="padding: var(--gjs-input-padding-multiple);">
        <div id="chapters-list" style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px;">
          <div class="gjs-field" style="padding: var(--gjs-input-padding); cursor: pointer;">
            Chapter 1: Introduction
          </div>
          <div class="gjs-field" style="padding: var(--gjs-input-padding); cursor: pointer;">
            Chapter 2: Getting Started
          </div>
        </div>
      </div>
    `;
    structureView.appendChild(chaptersSection);

    // Pages Section
    const pagesSection = document.createElement('div');
    pagesSection.innerHTML = `
      <div class="left-sidebar-title">
        <div class="pages-panel-title">
          <i class="fas fa-file-alt"></i>
          <span>Pages</span>
        </div>
        <div class="pages-panel-actions">
          <button class="panel-action-btn" title="New Master Page">M</button>
          <button class="panel-action-btn" id="btn-add-page" title="Add Page">+</button>
          <button class="panel-action-btn" title="Page Options">⋮</button>
        </div>
      </div>

      <div class="gjs-category-content" style="padding: var(--gjs-input-padding-multiple);">
        <div class="pages-view-options">
          <button class="view-btn active" title="Spread View">
            <i class="fas fa-columns"></i>
            <span>Spreads</span>
          </button>
          <button class="view-btn" title="Single Page View">
            <i class="fas fa-file"></i>
            <span>Pages</span>
          </button>
          <button class="view-btn" title="Page Info">
            <i class="fas fa-info-circle"></i>
            <span>Info</span>
          </button>
        </div>

        <div class="master-pages-section">
          <div class="master-pages-header">
            <div class="master-pages-title">
              <div class="master-master-icon">M</div>
              <span>Master Pages</span>
            </div>
          </div>
          <div class="master-pages-list">
            <div class="master-page-item active">
              <button class="master-page-delete-btn" title="Delete Master Page">
                <i class="fas fa-trash"></i>
              </button>
              <div class="master-page-thumbnail">
                <div style="position: absolute; top: 4px; left: 4px; font-size: 7px; font-weight: 600; color: var(--gjs-font-color);">A-Master</div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 20px; color: var(--gjs-secondary-light-color);">
                  <i class="fas fa-layer-group"></i>
                </div>
              </div>
              <div class="master-page-label">A-Master</div>
            </div>
          </div>
        </div>

        <div class="pages-section">
          <div class="pages-header">
            <div class="pages-title">
              <i class="fas fa-file"></i>
              <span>Pages</span>
            </div>
            <div class="pages-count" id="pages-count">0</div>
          </div>

          <div class="pages-list" id="pages-list">
            <!-- Pages will be injected here -->
          </div>
        </div>

        <div class="pages-panel-footer">
          <div class="page-info">
            <div class="page-info-item">
              <span class="page-info-label">Layout:</span>
              <span class="page-info-value">Fixed</span>
            </div>
            <div class="page-info-item">
              <span class="page-info-label">Size:</span>
              <span class="page-info-value">A4</span>
            </div>
          </div>
          <div class="page-info-item">
            <span class="page-info-label" id="footer-page-count">0 pages</span>
          </div>
        </div>
      </div>
    `;
    structureView.appendChild(pagesSection);
    container.appendChild(structureView);
    addCollapseFunctionality(container);

    // --- Page Management Logic ---
    const pagesListEl = pagesSection.querySelector('#pages-list') as HTMLElement;
    const pagesCountEl = pagesSection.querySelector('#pages-count') as HTMLElement;
    const footerPageCountEl = pagesSection.querySelector('#footer-page-count') as HTMLElement;
    const btnAddPage = pagesSection.querySelector('#btn-add-page') as HTMLElement;

    const renderPagesList = () => {
      if (!pagesListEl) return;
      pagesListEl.innerHTML = '';
      const pages = editor.Pages.getAll();
      const selectedPage = editor.Pages.getSelected();
      
      // Update counts
      if (pagesCountEl) pagesCountEl.textContent = pages.length.toString();
      if (footerPageCountEl) footerPageCountEl.textContent = `${pages.length} pages`;

      // Create a container for the spread layout
      const spreadContainer = document.createElement('div');
      spreadContainer.className = 'page-spread';
      spreadContainer.style.flexWrap = 'wrap'; // Allow wrapping
      
      pages.forEach((page: any, index: number) => {
        const pageId = page.getId();
        const pageName = page.getName() || `Page ${index + 1}`;
        const isSelected = selectedPage && selectedPage.getId() === pageId;
        const isCover = index === 0; // Treat first page as cover

        const pageItemWrapper = document.createElement('div');
        // Use cover-page-container for first page, otherwise just add to spread
        if (isCover) {
             pageItemWrapper.className = 'cover-page-container';
             pageItemWrapper.style.width = '100%';
             pageItemWrapper.style.display = 'flex';
             pageItemWrapper.style.justifyContent = 'center';
             pageItemWrapper.style.marginBottom = '10px';
        } else {
             pageItemWrapper.className = 'page-item-wrapper';
             // No specific class needed here if we append directly to spreadContainer
        }

        const pageItem = document.createElement('div');
        pageItem.className = `page-item ${isSelected ? 'page-active' : ''}`;
        
        // Rich HTML Structure for Page Item
        pageItem.innerHTML = `
          <button class="page-delete-btn" title="Delete Page">
            <i class="fas fa-trash"></i>
          </button>
          <div class="master-applied-indicator">A</div>
          <div class="page ${isCover ? 'cover-page' : ''}">
            <div class="page-content">
              <div style="position: absolute; top: 4px; left: 4px; right: 4px;">
                <div class="page-content-line" style="width: 50%; height: 1px;"></div>
              </div>
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%;">
                <div class="page-content-line" style="width: 100%; height: 1px; margin: 1px 0;"></div>
                <div class="page-content-line" style="width: 92%; height: 1px; margin: 1px 0;"></div>
                <div class="page-content-line" style="width: 96%; height: 1px; margin: 1px 0;"></div>
                <div class="page-content-line" style="width: 88%; height: 1px; margin: 1px 0;"></div>
                <div class="page-content-line" style="width: 94%; height: 1px; margin: 1px 0;"></div>
              </div>
            </div>
          </div>
          <div class="page-number">${index + 1}</div>
        `;

        // Select Page
        pageItem.addEventListener('click', () => {
          editor.Pages.select(pageId);
        });

        // Delete Page
        const btnDelete = pageItem.querySelector('.page-delete-btn') as HTMLElement;
        if (btnDelete) {
          btnDelete.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this page?')) {
              editor.Pages.remove(pageId);
            }
          });
        }

        if (isCover) {
            pageItemWrapper.appendChild(pageItem);
            pagesListEl.appendChild(pageItemWrapper);
            // Start a new spread container after cover
            pagesListEl.appendChild(spreadContainer);
        } else {
            spreadContainer.appendChild(pageItem);
        }
      });
      
      // If no pages (shouldn't happen usually), or only cover, spreadContainer might be empty/unused logic check
      if (pages.length === 0) {
          pagesListEl.innerHTML = '<div style="padding:10px; text-align:center; color:var(--gjs-font-color);">No pages</div>';
      }
    };

    // Initial Render
    renderPagesList();

    // Event Listeners
    editor.on('page:add page:remove page:select', () => {
      renderPagesList();
    });

    // Add Page Action
    if (btnAddPage) {
      btnAddPage.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent collapse
        editor.Pages.add({
            name: `Page ${editor.Pages.getAll().length + 1}`,
            component: [] // Start with empty component
        });
      });
    }
  };

  const createAssetsView = (container: HTMLElement) => {
    const assetsView = document.createElement('div');
    assetsView.className = 'assets-view';

    // Header with upload button
    const headerSection = document.createElement('div');
    headerSection.className = 'left-sidebar-title';
    headerSection.innerHTML = `
      <i class="fas fa-photo-video" style="margin-right: 8px;"></i>
      Media Assets
    `;

    // Upload button
    const uploadButton = (editor as any).createAssetUploadButton ? (editor as any).createAssetUploadButton() : null;
    if (uploadButton) {
      headerSection.appendChild(uploadButton);
    } else {
      const fallbackButton = document.createElement('button');
      fallbackButton.className = 'gjs-sm-btn';
      fallbackButton.style.marginLeft = 'auto';
      fallbackButton.textContent = 'Upload';
      fallbackButton.addEventListener('click', () => {
        editor.runCommand('open-assets');
      });
      headerSection.appendChild(fallbackButton);
    }

    const contentContainer = document.createElement('div');
    contentContainer.className = 'gjs-category-content';

    // Images section
    const imagesSection = document.createElement('div');
    imagesSection.className = 'media-section';
    const imagesHeader = document.createElement('div');
    imagesHeader.className = 'left-sidebar-title';
    imagesHeader.innerHTML = `<i class="fas fa-images" style="margin-right: 4px; font-size: 12px;"></i> IMAGES`;
    const imagesContent = document.createElement('div');
    imagesContent.className = 'gjs-category-content';
    const imagesGrid = document.createElement('div');
    imagesGrid.className = 'media-grid';
    imagesGrid.id = 'images-grid';

    // Documents section
    const documentsSection = document.createElement('div');
    documentsSection.className = 'media-section';
    const documentsHeader = document.createElement('div');
    documentsHeader.className = 'left-sidebar-title';
    documentsHeader.innerHTML = `<i class="fas fa-file-alt" style="margin-right: 4px; font-size: 12px;"></i> DOCUMENTS`;
    const documentsContent = document.createElement('div');
    documentsContent.className = 'gjs-category-content';
    const documentsList = document.createElement('div');
    documentsList.className = 'media-empty';
    documentsList.id = 'documents-list';
    documentsList.innerHTML = `<i class="fas fa-file-alt media-icon"></i><span>No documents uploaded</span>`;

    // Update assets display function
    const updateAssetsDisplay = () => {
      try {
        const assets = editor.AssetManager.getAll();
        const images: any[] = [];
        const documents: any[] = [];

        assets.forEach((asset: any) => {
          const assetType = asset.get('type') || asset.type || '';
          if (assetType.startsWith('image/')) {
            images.push(asset);
          } else {
            documents.push(asset);
          }
        });

        if (images.length > 0) {
          imagesGrid.innerHTML = images.map(asset => {
            const src = asset.getSrc ? asset.getSrc() : (asset.src || asset.url);
            const name = asset.get('name') || asset.name || asset.filename || 'Unnamed';
            return `<div class="media-item" data-asset-src="${src}" title="${name}"><img src="${src}" alt="${name}" /></div>`;
          }).join('');
          imagesGrid.querySelectorAll('.media-item').forEach((item, index) => {
            item.addEventListener('click', () => {
              const selectedAsset = images[index];
              if (selectedAsset && editor.select) editor.select(selectedAsset);
            });
          });
        } else {
          imagesGrid.innerHTML = `<div class="media-placeholder"><i class="fas fa-images media-icon"></i><span class="media-label">No images</span></div>`;
        }

        if (documents.length > 0) {
          documentsList.className = 'media-list';
          documentsList.innerHTML = documents.map(asset => {
            const src = asset.getSrc ? asset.getSrc() : (asset.src || asset.url);
            const name = asset.get('name') || asset.name || asset.filename || 'Untitled';
            const type = asset.get('type') || asset.type || 'Document';
            return `
              <div class="media-item" data-asset-src="${src}" title="${name}">
                <i class="fas fa-file-alt media-icon"></i>
                <div class="media-info"><div class="media-name">${name}</div><div class="media-type">${type}</div></div>
              </div>`;
          }).join('');
          documentsList.querySelectorAll('.media-item').forEach((item, index) => {
            item.addEventListener('click', () => {
              const selectedAsset = documents[index];
              if (selectedAsset && editor.select) editor.select(selectedAsset);
            });
          });
        } else {
          documentsList.className = 'media-empty';
          documentsList.innerHTML = `<i class="fas fa-file-alt media-icon"></i><span>No documents uploaded</span>`;
        }
      } catch (error) {
        console.error('Error updating assets display:', error);
      }
    };

    setTimeout(updateAssetsDisplay, 100);
    editor.on('asset:add', updateAssetsDisplay);
    editor.on('asset:remove', updateAssetsDisplay);
    editor.on('asset:load', updateAssetsDisplay);
    editor.on('asset-manager:ready', updateAssetsDisplay);

    imagesContent.appendChild(imagesGrid);
    imagesSection.appendChild(imagesHeader);
    imagesSection.appendChild(imagesContent);
    documentsContent.appendChild(documentsList);
    documentsSection.appendChild(documentsHeader);
    documentsSection.appendChild(documentsContent);
    contentContainer.appendChild(imagesSection);
    contentContainer.appendChild(documentsSection);
    assetsView.appendChild(headerSection);
    assetsView.appendChild(contentContainer);
    container.appendChild(assetsView);
    addCollapseFunctionality(container);
  };



  const switchLeftSidebarContent = (tabId: string) => {
    contentLeftSidebar.innerHTML = '';
    switch (tabId) {
      case 'book-structure':
        createBookStructureView(contentLeftSidebar);
        break;
      case 'assets':
        createAssetsView(contentLeftSidebar);
        break;
    }
  };

  // Create tab buttons
  leftSidebarTabs.forEach((tab, index) => {
    const tabButton = document.createElement('div');
    tabButton.className = `gjs-pn-tab-btn ${index === 0 ? 'gjs-pn-tab-active' : ''}`;
    tabButton.setAttribute('data-tab', tab.id);
    tabButton.title = tab.label;
    tabButton.innerHTML = `<div>${tab.icon}</div><div class="gjs-pn-tab-label">${tab.label}</div>`;
    
    tabButton.addEventListener('click', () => {
      headerLeftSidebar.querySelectorAll('.gjs-pn-tab-btn').forEach(btn => btn.classList.remove('gjs-pn-tab-active'));
      tabButton.classList.add('gjs-pn-tab-active');
      switchLeftSidebarContent(tab.id);
    });
    
    headerLeftSidebar.appendChild(tabButton);
  });

  // Initialize
  editor.on('load', () => {
    const editorContainer = editor.getContainer();
    if (editorContainer) {
      const editorContent = editorContainer.querySelector('.gjs-editor');
      if (editorContent) {
        editorContent.appendChild(headerLeftSidebar);
        editorContent.appendChild(contentLeftSidebar);
        
        // Initialize with default tab
        switchLeftSidebarContent('book-structure');

        // Adjust canvas and panels
        const canvas = editorContainer.querySelector('.gjs-cv-canvas') as HTMLElement;
        if (canvas) {
          canvas.style.left = 'var(--gjs-left-width, 15%)';
          canvas.style.width = 'calc(100% - var(--gjs-left-width, 15%) - var(--gjs-left-width, 15%))';
        }

        const commandsPanel = editorContainer.querySelector('.gjs-pn-commands') as HTMLElement;
        if (commandsPanel) commandsPanel.style.left = 'var(--gjs-left-width, 15%)';

        const devicesPanel = editorContainer.querySelector('.gjs-pn-devices-c') as HTMLElement;
        if (devicesPanel) devicesPanel.style.left = 'var(--gjs-left-width, 15%)';
      }
    }
  });
});
