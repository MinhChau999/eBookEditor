export interface ClassManagerOptions {
  /**
   * Container selector where the panel should be mounted
   * @default '.gjs-pn-views-container'
   */
  container?: string;

  /**
   * Maximum number of classes to display before virtualization
   * @default 100
   */
  maxVisibleClasses?: number;

  /**
   * Enable/disable quick apply on click
   * @default true
   */
  enableQuickApply?: boolean;

  /**
   * Confirmation dialog on delete
   * @default true
   */
  confirmDelete?: boolean;
}

export interface ClassInfo {
  /**
   * Class name without the dot prefix
   */
  name: string;

  /**
   * Display label (can be customized)
   */
  label: string;

  /**
   * Number of components using this class
   */
  usageCount: number;

  /**
   * Reference to the GrapesJS Selector model
   */
  selector: any;
}

export type ClassAction = 'create' | 'edit' | 'delete' | 'apply';

export interface ClassEditorState {
  mode: 'create' | 'edit';
  className: string;
  originalClassName?: string;
  isOpen: boolean;
}
