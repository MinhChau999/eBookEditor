import type { Editor } from 'grapesjs';

export interface SelectorAutocompleteOptions {
  /**
   * Maximum number of autocomplete suggestions to show
   * @default 8
   */
  maxSuggestions?: number;
}

/**
 * Selector Autocomplete Plugin
 * 
 * Adds autocomplete functionality to the GrapesJS Selector Manager class input.
 * Shows a dropdown of existing classes as the user types, with keyboard navigation support.
 */
export default function selectorAutocomplete(editor: Editor, opts: SelectorAutocompleteOptions = {}) {
  const options = {
    maxSuggestions: 8,
    ...opts
  };

  // Autocomplete state
  let autocompleteState: {
    el: HTMLElement | null;
    filtered: any[];
    selectedIndex: number;
  } = {
    el: null,
    filtered: [],
    selectedIndex: -1
  };

  let autocompleteInitialized = false;
  let mutationObserver: MutationObserver | null = null;
  let listenersAttached = false;

  /**
   * Filter available classes based on query
   */
  const filterClasses = (query: string, currentClasses: any[]) => {
    // Safety check: ensure editor.Selectors exists
    if (!editor.Selectors) {
      autocompleteState.filtered = [];
      autocompleteState.selectedIndex = -1;
      return;
    }

    const allSelectors = editor.Selectors.getAll();
    const currentNames = currentClasses.map((s: any) => s.get ? s.get('name') : '');

    autocompleteState.filtered = allSelectors.filter((selector: any) => {
      const name = selector.get('name') || '';
      const label = selector.getLabel ? selector.getLabel() : '';
      const isClass = selector.isClass && selector.isClass();
      const notApplied = !currentNames.includes(name);
      const matchesQuery = name.toLowerCase().includes(query.toLowerCase()) ||
        label.toLowerCase().includes(query.toLowerCase());

      return isClass && notApplied && matchesQuery;
    }).slice(0, options.maxSuggestions);

    autocompleteState.selectedIndex = autocompleteState.filtered.length > 0 ? 0 : -1;
  };

  /**
   * Render autocomplete dropdown
   */
  const renderAutocomplete = () => {
    if (!autocompleteState.el) return;

    let html = '';
    autocompleteState.filtered.forEach((selector: any, index: number) => {
      const isSelected = index === autocompleteState.selectedIndex;
      const className = `gjs-clm-autocomplete-item${isSelected ? ' selected' : ''}`;
      const label = selector.getLabel ? selector.getLabel() : selector.get('name');

      html += `<div class="${className}" data-index="${index}">.${label}</div>`;
    });

    autocompleteState.el.innerHTML = html;

    // Add click handlers
    const items = autocompleteState.el.querySelectorAll('.gjs-clm-autocomplete-item');
    items.forEach((item) => {
      item.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const index = parseInt(target.getAttribute('data-index') || '0', 10);
        selectAutocompleteItem(index);
      });
    });
  };

  /**
   * Show autocomplete dropdown
   */
  const showAutocomplete = () => {
    if (!autocompleteState.el || autocompleteState.filtered.length === 0) {
      hideAutocomplete();
      return;
    }

    renderAutocomplete();
    autocompleteState.el.style.display = 'block';
  };

  /**
   * Hide autocomplete dropdown
   */
  const hideAutocomplete = () => {
    if (autocompleteState.el) {
      autocompleteState.el.style.display = 'none';
      autocompleteState.el.innerHTML = '';
    }
    autocompleteState.filtered = [];
    autocompleteState.selectedIndex = -1;
  };

  /**
   * Select an autocomplete item
   */
  const selectAutocompleteItem = (index: number) => {
    if (index < 0 || index >= autocompleteState.filtered.length) return;
    if (!editor.Selectors) return; // Safety check

    const selector = autocompleteState.filtered[index];
    const label = selector.getLabel ? selector.getLabel() : selector.get('name');

    editor.Selectors.addSelected({ label });

    // Clear input and hide autocomplete
    const input = autocompleteState.el?.parentElement?.querySelector('[data-input]') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.style.display = 'none';
    }

    const addBtn = autocompleteState.el?.parentElement?.querySelector('[data-add]') as HTMLElement;
    if (addBtn) {
      addBtn.style.display = '';
    }

    hideAutocomplete();
  };

  /**
   * Attach event listeners to input field
   */
  const attachInputListeners = (input: HTMLInputElement, tagsField: HTMLElement) => {
    if (listenersAttached) return; // Prevent duplicate attachment

    // Create autocomplete element if it doesn't exist
    if (!autocompleteState.el) {
      autocompleteState.el = document.createElement('div');
      autocompleteState.el.className = 'gjs-clm-autocomplete';
      autocompleteState.el.style.display = 'none';
      tagsField.style.position = 'relative';
      tagsField.appendChild(autocompleteState.el);
    }

    // Add input event listener
    const inputHandler = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const query = target.value.trim();

      if (query.length > 0) {
        try {
          const selected = editor.getSelected();
          const currentClasses = selected ? (selected.getClasses ? selected.getClasses() : []) : [];
          filterClasses(query, currentClasses);
          showAutocomplete();
        } catch (error) {
          // Silently handle case where editor.getSelected() fails
          filterClasses(query, []);
          showAutocomplete();
        }
      } else {
        hideAutocomplete();
      }
    };

    // Add keydown event listener for keyboard navigation
    const keydownHandler = (e: KeyboardEvent) => {
      const key = e.keyCode;

      // Arrow Down
      if (key === 40 && autocompleteState.filtered.length > 0) {
        e.preventDefault();
        autocompleteState.selectedIndex = Math.min(
          autocompleteState.selectedIndex + 1,
          autocompleteState.filtered.length - 1
        );
        renderAutocomplete();
        return;
      }

      // Arrow Up
      if (key === 38 && autocompleteState.filtered.length > 0) {
        e.preventDefault();
        autocompleteState.selectedIndex = Math.max(autocompleteState.selectedIndex - 1, 0);
        renderAutocomplete();
        return;
      }

      // Enter - select from autocomplete if available
      if (key === 13) {
        if (autocompleteState.selectedIndex >= 0 && autocompleteState.filtered.length > 0) {
          e.preventDefault();
          selectAutocompleteItem(autocompleteState.selectedIndex);
          return;
        }
      }

      // Tab - select from autocomplete if available
      if (key === 9 && autocompleteState.selectedIndex >= 0 && autocompleteState.filtered.length > 0) {
        e.preventDefault();
        selectAutocompleteItem(autocompleteState.selectedIndex);
        return;
      }

      // Escape
      if (key === 27) {
        if (autocompleteState.el && autocompleteState.el.style.display !== 'none') {
          e.preventDefault();
          hideAutocomplete();
        }
      }
    };

    // Blur handler
    const blurHandler = () => {
      setTimeout(() => hideAutocomplete(), 200);
    };

    // Add listeners
    input.addEventListener('input', inputHandler as EventListener);
    input.addEventListener('keydown', keydownHandler as EventListener);
    input.addEventListener('blur', blurHandler);

    listenersAttached = true;
  };

  /**
   * Initialize autocomplete by setting up MutationObserver
   */
  const initializeAutocomplete = () => {
    if (autocompleteInitialized) return;

    // Find the selector container
    const selectorContainer = document.querySelector('.gjs-clm-tags');
    if (!selectorContainer) return;

    const tagsField = selectorContainer.querySelector('[id$="tags-field"]') as HTMLElement;
    if (!tagsField) return;

    // Watch for input field being added/shown
    mutationObserver = new MutationObserver(() => {
      const input = selectorContainer.querySelector('[data-input]') as HTMLInputElement;
      if (input && input.offsetParent !== null && !listenersAttached) {
        attachInputListeners(input, tagsField);
      } else if (!input || input.offsetParent === null) {
        // Input is hidden, reset flag
        listenersAttached = false;
      }
    });

    // Start observing
    mutationObserver.observe(selectorContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    });

    autocompleteInitialized = true;
  };

  // Try to initialize on component selection
  editor.on('component:toggled', () => {
    setTimeout(() => initializeAutocomplete(), 100);
  });

  // Also try to initialize after editor load
  editor.on('load', () => {
    setTimeout(() => initializeAutocomplete(), 1000);
  });
}
