/**
 * Core Setup Plugin Constants
 * Centralized configuration values and constants
 */

// ==================== ZOOM CONFIGURATION ====================

export const ZOOM_CONFIG = {
  MIN: 25,
  MAX: 200,
  STEP: 5,
  DEFAULT: 100,
} as const;

// ==================== RULER CONFIGURATION ====================

export const RULER_CONFIG = {
  DEFAULT_HEIGHT: 15,
} as const;

// ==================== DRAG MODE CONFIGURATION ====================

export type DragMode = '' | 'translate' | 'absolute';

export const DRAG_MODES: DragMode[] = ['', 'translate', 'absolute'];

const iconStyle = 'style="display: block; max-width:22px"';

export const DRAG_MODE_ICONS = {
  select: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M13.64,21.97C13.14,22.21 12.54,22 12.31,21.5L10.13,16.76L7.62,18.78C7.45,18.92 7.24,19 7,19A1,1 0 0,1 6,18V3A1,1 0 0,1 7,2C7.24,2 7.47,2.09 7.64,2.23L7.65,2.22L19.14,11.86C19.57,12.22 19.62,12.85 19.27,13.27C19.12,13.45 18.91,13.57 18.7,13.61L13.97,14.5L16.15,19.29C16.38,19.78 16.13,20.38 15.64,20.61L13.64,21.97Z" /></svg>`,
  
  move: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z" /></svg>`,
  
  absolute: `<svg ${iconStyle} viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" /></svg>`
} as const;

export const DRAG_MODE_CONFIG: Record<DragMode, { icon: string; title: string; tooltip: string }> = {
  '': { 
    icon: DRAG_MODE_ICONS.select,
    title: 'Select',
    tooltip: 'Select Mode - Click to select elements'
  },
  'translate': { 
    icon: DRAG_MODE_ICONS.move,
    title: 'Move',
    tooltip: 'Move Mode - Drag to move elements freely'
  },
  'absolute': { 
    icon: DRAG_MODE_ICONS.absolute,
    title: 'Absolute',
    tooltip: 'Absolute Mode - Position elements with absolute positioning'
  }
} as const;

// ==================== PANEL CONFIGURATION ====================

export const PANEL_CLASS_NAMES = {
  HEADER_LEFT_SIDEBAR: 'gjs-pn-header-left-sidebar gjs-pn-panel gjs-one-bg gjs-two-color',
  CONTENT_LEFT_SIDEBAR: 'gjs-pn-content-left-sidebar gjs-one-bg gjs-two-color left-sidebar-content',
  FOOTER_LEFT_SIDEBAR: 'gjs-pn-footer-left-sidebar gjs-pn-panel gjs-one-bg gjs-two-color',
  TAB_BUTTON: 'gjs-pn-tab-btn',
  TAB_ACTIVE: 'gjs-pn-tab-active',
  TAB_LABEL: 'gjs-pn-tab-label',
} as const;

// ==================== LAYOUT MODE CONFIGURATION ====================

export const LAYOUT_MODE_CLASSES = {
  REFLOW: 'gjs-mode-reflow',
  FIXED: 'gjs-mode-fixed',
} as const;
