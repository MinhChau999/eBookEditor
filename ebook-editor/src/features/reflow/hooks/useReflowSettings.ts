import { useBookStore } from '../../../core/store/bookStore';
import type { ReflowSettings } from '../../../core/types/book.types';

export const useReflowSettings = () => {
  const currentBook = useBookStore((state) => state.currentBook);
  const setReflowSettings = useBookStore((state) => state.setReflowSettings);

  const settings = currentBook?.reflowSettings || {
    fontSize: 16,
    lineHeight: 1.5,
    theme: 'light',
    fontFamily: 'Inter, sans-serif',
  };

  const updateSettings = (newSettings: Partial<ReflowSettings>) => {
    setReflowSettings(newSettings);
  };

  return {
    settings,
    updateSettings,
  };
};
