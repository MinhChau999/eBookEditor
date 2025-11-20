export interface PageTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: 'mm' | 'px' | 'in';
}

export const PAGE_TEMPLATES: Record<string, PageTemplate> = {
  A4_PORTRAIT: { id: 'A4_PORTRAIT', name: 'A4 Portrait', width: 210, height: 297, unit: 'mm' },
  A4_LANDSCAPE: { id: 'A4_LANDSCAPE', name: 'A4 Landscape', width: 297, height: 210, unit: 'mm' },
  A5_PORTRAIT: { id: 'A5_PORTRAIT', name: 'A5 Portrait', width: 148, height: 210, unit: 'mm' },
  LETTER_PORTRAIT: { id: 'LETTER_PORTRAIT', name: 'Letter Portrait', width: 216, height: 279, unit: 'mm' },
  IPAD_PORTRAIT: { id: 'IPAD_PORTRAIT', name: 'iPad Portrait', width: 768, height: 1024, unit: 'px' },
  IPAD_LANDSCAPE: { id: 'IPAD_LANDSCAPE', name: 'iPad Landscape', width: 1024, height: 768, unit: 'px' },
};

export const getTemplateById = (id: string): PageTemplate | undefined => {
  return Object.values(PAGE_TEMPLATES).find(t => t.id === id);
};
