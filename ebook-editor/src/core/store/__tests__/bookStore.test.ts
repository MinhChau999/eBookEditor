import { describe, it, expect, beforeEach } from 'vitest';
import { useBookStore } from '../bookStore';

describe('BookStore', () => {
  beforeEach(() => {
    useBookStore.setState({
      books: [],
      currentBook: null,
      pages: [],
      isLoading: false,
      error: null
    });
  });

  it('should create a book', () => {
    const { createBook } = useBookStore.getState();
    createBook({
      title: 'Test Book',
      mode: 'reflow'
    });

    const { books, currentBook } = useBookStore.getState();
    expect(books).toHaveLength(1);
    expect(currentBook).not.toBeNull();
    expect(currentBook?.title).toBe('Test Book');
  });

  it('should add a page', () => {
    const { addPage } = useBookStore.getState();
    const page = {
      id: 'p1',
      name: 'Page 1',
      content: '<div>Content</div>',
      pageNumber: 1,
      type: 'content' as const
    };

    addPage(page);
    const { pages } = useBookStore.getState();
    expect(pages).toHaveLength(1);
    expect(pages[0]).toEqual(page);
  });

  it('should update reflow settings', () => {
    const { createBook, setReflowSettings } = useBookStore.getState();
    createBook({ title: 'Reflow Book', mode: 'reflow' });

    setReflowSettings({ fontSize: 20 });
    
    const { currentBook } = useBookStore.getState();
    expect(currentBook?.reflowSettings?.fontSize).toBe(20);
  });
});
