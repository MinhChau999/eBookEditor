import type { Selector } from 'grapesjs';

export interface ClassManagerOptions {
  // Panel title
  title?: string;
  // Container selector where to mount the panel
  container?: string;
  // Whether to show usage count
  showUsageCount?: boolean;
  // Maximum classes to display (pagination)
  maxDisplay?: number;
}

export interface ClassItemData {
  selector: Selector;
  usageCount: number;
  name: string;
  label: string;
}

export interface ClassManagerState {
  classes: ClassItemData[];
  filteredClasses: ClassItemData[];
  searchQuery: string;
  selectedClass: Selector | null;
  isEditing: boolean;
  hoveredClassId: string | null;
}
