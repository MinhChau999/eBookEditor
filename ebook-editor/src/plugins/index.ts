// Export all custom plugins
export { default as setup } from './setup';
export { default as bookBlocks } from './book-blocks';
export { default as bookManager } from './book-manager';

// Plugin registration function
export const registerEbookPlugins = () => {
  // Import plugin styles if needed
  // No auto-injected CSS like grapesjs-preset-webpage!
};