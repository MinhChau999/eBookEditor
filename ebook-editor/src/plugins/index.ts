// Export all custom plugins
export { default as grapesjsPresetWebpage } from './grapesjs-preset-webpage';
export { default as bookBlocks } from './book-blocks';

// Plugin registration function
export const registerEbookPlugins = () => {
  // Import plugin styles if needed
  // No auto-injected CSS like grapesjs-preset-webpage!
};