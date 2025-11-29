export interface CoreSetupOptions {
  textCleanCanvas?: string;
  layoutMode?: 'fixed' | 'reflow';
  rulerOpts?: any; // Using any for now to avoid circular dependency or complex type imports
}
