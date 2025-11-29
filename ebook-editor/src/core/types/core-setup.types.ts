export interface CoreSetupOptions {
  textCleanCanvas?: string;
  layoutMode?: 'fixed' | 'reflow';
  dragMode?: 'translate' | 'absolute' | '';
  rulerOpts?: any; // Using any for now to avoid circular dependency or complex type imports
}
