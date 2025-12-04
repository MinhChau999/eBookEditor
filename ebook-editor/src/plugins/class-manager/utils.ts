import type { Editor, Selector, Component } from 'grapesjs';

/**
 * Calculate how many components use a specific class
 */
export function calculateUsageCount(editor: Editor, selector: Selector): number {
  let count = 0;
  const allComponents = editor.Components.getComponents();
  
  const traverseComponents = (components: Component[] | any) => {
    const componentArray = Array.isArray(components) ? components : (components.models || []);
    
    componentArray.forEach((component: Component) => {
      const selectors = component.getSelectors ? component.getSelectors() : null;
      if (selectors && selectors.includes(selector)) {
        count++;
      }
      
      // Recursively check children
      const children = component.components ? component.components() : [];
      if (children && children.length > 0) {
        traverseComponents(children);
      }
    });
  };
  
  traverseComponents(allComponents);
  return count;
}

/**
 * Filter classes based on search query
 */
export function filterClasses(classes: Selector[], query: string): Selector[] {
  if (!query.trim()) {
    return classes;
  }
  
  const lowerQuery = query.toLowerCase().trim();
  return classes.filter((selector) => {
    const name = selector.get('name') || '';
    const label = selector.getLabel ? selector.getLabel() : '';
    
    return (
      name.toLowerCase().includes(lowerQuery) ||
      label.toLowerCase().includes(lowerQuery)
    );
  });
}

/**
 * Apply class to currently selected component(s)
 */
export function applyClassToComponent(editor: Editor, selector: Selector): void {
  const selected = editor.getSelectedAll();
  
  if (selected && selected.length > 0) {
    selected.forEach((component) => {
      if (component.getSelectors) {
        const selectors = component.getSelectors();
        if (!selectors.includes(selector)) {
          selectors.add(selector);
        }
      }
    });
  }
}

/**
 * Validate class name
 */
export function validateClassName(name: string): { valid: boolean; error?: string } {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Class name cannot be empty' };
  }
  
  const trimmedName = name.trim();
  
  // Check for invalid characters (CSS class names)
  const validPattern = /^[a-zA-Z_-][a-zA-Z0-9_-]*$/;
  if (!validPattern.test(trimmedName)) {
    return {
      valid: false,
      error: 'Class name must start with a letter, underscore, or hyphen and contain only letters, numbers, underscores, or hyphens'
    };
  }
  
  return { valid: true };
}

/**
 * Get all components using a specific class
 */
export function getComponentsUsingClass(editor: Editor, selector: Selector): Component[] {
  const results: Component[] = [];
  const allComponents = editor.Components.getComponents();
  
  const traverseComponents = (components: Component[] | any) => {
    const componentArray = Array.isArray(components) ? components : (components.models || []);
    
    componentArray.forEach((component: Component) => {
      const selectors = component.getSelectors ? component.getSelectors() : null;
      if (selectors && selectors.includes(selector)) {
        results.push(component);
      }
      
      // Recursively check children
      const children = component.components ? component.components() : [];
      if (children && children.length > 0) {
        traverseComponents(children);
      }
    });
  };
  
  traverseComponents(allComponents);
  return results;
}
