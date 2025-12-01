import type { Editor } from 'grapesjs';
import postcss, { Rule, AtRule, Declaration, ChildNode } from 'postcss';

export type ParsedRule = {
  selectors: string;
  style: Record<string, string>;
  atRule?: string;
  params?: string;
}

// Check if we're in development mode
const isDev = process.env.NODE_ENV !== 'production';

/**
 * Log stuff (only in development)
 * @param  {Editor} editor
 * @param  {*} msg
 */
export const log = (editor?: Editor, msg?: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (isDev && editor) {
    editor.log(msg, { ns: 'parser-postcss' });
  }
};

/**
 * Create rule from node
 * @param  {Rule} node
 * @return {ParsedRule}
 */
export const createRule = (node: Rule): ParsedRule => {
  const declarations = (node.nodes as Declaration[]) || [];
  const style: Record<string, string> = {};

  declarations.forEach(({ prop, value, important }) => {
    // Use template literal for cleaner code
    style[prop] = important ? `${value} !important` : value;
  });

  return {
    selectors: node.selector || '',
    style,
  }
};

/**
 * Create at rule from node
 * @param  {AtRule} node
 * @param  {ParsedRule[]} result
 */
export const createAtRule = (node: AtRule, result: ParsedRule[]) => {
  const { name, params } = node;
  // Use includes() instead of indexOf for better readability
  const isNested = ['media', 'keyframes'].includes(name);

  if (isNested && node.nodes) {
    node.nodes.forEach((childNode: ChildNode) => {
      // Proper type checking instead of @ts-ignore
      if (childNode.type === 'rule') {
        result.push({
          ...createRule(childNode as Rule),
          atRule: name,
          params,
        });
      }
    });
  } else if (node.nodes) {
    // Handle non-nested at-rules
    node.nodes.forEach((childNode: ChildNode) => {
      if (childNode.type === 'rule') {
        result.push({
          ...createRule(childNode as Rule),
          atRule: name,
        });
      }
    });
  }
};

/**
 * Parse CSS using PostCSS
 * @param {string} css - CSS string to parse
 * @param {Editor} editor - GrapesJS editor instance
 * @return {ParsedRule[]} Array of parsed CSS rules
 */
export default (css: string, editor?: Editor): ParsedRule[] => {
  const result: ParsedRule[] = [];
  
  // Return empty array for empty input
  if (!css || css.trim().length === 0) {
    return result;
  }

  log(editor, ['Input CSS', css]);

  try {
    // Parse CSS with PostCSS
    const ast = postcss().process(css).sync().root;
    log(editor, ['PostCSS AST', ast]);

    // Process each node in the AST
    ast.nodes.forEach(node => {
      const { type } = node;

      switch (type) {
        case 'rule':
          result.push(createRule(node as Rule));
          break;
        case 'atrule':
          createAtRule(node as AtRule, result);
          break;
        case 'comment':
          // Skip comments
          break;
        default:
          // Unknown node type, skip silently
          log(editor, [`Unknown node type: ${type}`]);
          break;
      }
    });

    log(editor, ['Output', result]);
  } catch (error) {
    // Graceful error handling - don't crash the app
    console.error('[parser-postcss] Parse error:', error);
    if (editor && isDev) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      editor.log(`Parse error: ${errorMsg}`, { ns: 'parser-postcss', level: 'error' });
    }
  }

  return result;
}
