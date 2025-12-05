import type { Editor } from 'grapesjs';
import type { ClassInfo } from '../types';

/**
 * Get all CSS classes from the editor's Selector Manager
 */
export function getAllClasses(editor: Editor): ClassInfo[] {
  if (!editor.Selectors) return [];

  const allSelectors = editor.Selectors.getAll();
  const classes: ClassInfo[] = [];

  allSelectors.forEach((selector: any) => {
    // Only include class selectors (not IDs, tags, etc.)
    if (selector.isClass && selector.isClass()) {
      const name = selector.get('name') || '';
      const label = selector.getLabel ? selector.getLabel() : name;
      const usageCount = getUsageCount(editor, name);

      classes.push({
        name,
        label,
        usageCount,
        selector,
      });
    }
  });

  // Sort alphabetically by name
  return classes.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Count how many components use a specific class
 */
export function getUsageCount(editor: Editor, className: string): number {
  let count = 0;

  // Get all components in the wrapper
  const wrapper = editor.DomComponents.getWrapper();
  if (!wrapper) return 0;

  // Recursively count components with this class
  const countInComponent = (component: any) => {
    const classes = component.getClasses ? component.getClasses() : [];
    if (classes.includes(className)) {
      count++;
    }

    // Check children
    const children = component.components ? component.components() : [];
    children.forEach((child: any) => countInComponent(child));
  };

  countInComponent(wrapper);
  return count;
}

/**
 * Apply a class to the currently selected component
 */
export function applyClassToComponent(editor: Editor, className: string): boolean {
  const selected = editor.getSelected();
  if (!selected) return false;

  const classes = selected.getClasses ? selected.getClasses() : [];
  
  // Check if class is already applied
  if (classes.includes(className)) {
    return false;
  }

  // Add the class
  selected.addClass(className);
  return true;
}

/**
 * Remove a class from all components and the Selector Manager
 */
export function deleteClass(editor: Editor, className: string): void {
  // Remove from all components
  const wrapper = editor.DomComponents.getWrapper();
  if (wrapper) {
    const removeFromComponent = (component: any) => {
      const classes = component.getClasses ? component.getClasses() : [];
      if (classes.includes(className)) {
        component.removeClass(className);
      }

      // Process children
      const children = component.components ? component.components() : [];
      children.forEach((child: any) => removeFromComponent(child));
    };

    removeFromComponent(wrapper);
  }

  // Remove from Selector Manager
  if (editor.Selectors) {
    const selector = editor.Selectors.getAll().find(
      (s: any) => s.get('name') === className && s.isClass && s.isClass()
    );
    if (selector) {
      editor.Selectors.remove(selector);
    }
  }
}

/**
 * Rename a class across all components
 */
export function updateClassName(editor: Editor, oldName: string, newName: string): boolean {
  // Validate new name
  if (!validateClassName(newName)) {
    return false;
  }

  // Check if new name already exists
  const existing = editor.Selectors?.getAll().find(
    (s: any) => s.get('name') === newName && s.isClass && s.isClass()
  );
  if (existing) {
    return false;
  }

  // Update in all components
  const wrapper = editor.DomComponents.getWrapper();
  if (wrapper) {
    const updateInComponent = (component: any) => {
      const classes = component.getClasses ? component.getClasses() : [];
      if (classes.includes(oldName)) {
        component.removeClass(oldName);
        component.addClass(newName);
      }

      // Process children
      const children = component.components ? component.components() : [];
      children.forEach((child: any) => updateInComponent(child));
    };

    updateInComponent(wrapper);
  }

  // Update selector
  if (editor.Selectors) {
    const selector = editor.Selectors.getAll().find(
      (s: any) => s.get('name') === oldName && s.isClass && s.isClass()
    );
    if (selector) {
      selector.set('name', newName);
      if (selector.setLabel) {
        selector.setLabel(newName);
      }
    }
  }

  return true;
}

/**
 * Validate class name format
 * Must start with a letter or underscore, followed by letters, digits, hyphens, or underscores
 */
export function validateClassName(name: string): boolean {
  if (!name || name.trim() === '') return false;
  
  // Remove leading/trailing whitespace
  name = name.trim();
  
  // Class names should not contain spaces or special characters (except - and _)
  // Should start with a letter or underscore
  const validPattern = /^[a-zA-Z_][a-zA-Z0-9_-]*$/;
  return validPattern.test(name);
}

/**
 * Create a new class in the Selector Manager
 */
export function createClass(editor: Editor, className: string): boolean {
  if (!validateClassName(className)) {
    return false;
  }

  // Check if class already exists
  const existing = editor.Selectors?.getAll().find(
    (s: any) => s.get('name') === className && s.isClass && s.isClass()
  );
  if (existing) {
    return false;
  }

  // Add new class selector
  if (editor.Selectors) {
    editor.Selectors.add({ name: className, label: className });
    return true;
  }

  return false;
}
