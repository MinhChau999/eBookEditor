import type { Editor } from 'grapesjs';

// Browser-compatible CSS parser using regex
export type BrowserParsedRule = {
  selectors: string;
  style: Record<string, string>;
  atRule?: string;
  params?: string;
}

// Check if we're in development mode
const isDev = import.meta.env.DEV;

/**
 * Log stuff (only in development)
 */
export const log = (editor?: Editor, msg?: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (isDev && editor) {
    editor.log(msg, { ns: 'parser-browser-css' });
  }
};

/**
 * Parse CSS declarations into style object
 */
const parseDeclarations = (declarationsStr: string): Record<string, string> => {
  const style: Record<string, string> = {};

  // Split declarations by semicolon, handle empty strings
  const declarations = declarationsStr.split(';').filter(decl => decl.trim());

  for (const declaration of declarations) {
    // Find the first colon that separates property and value
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) continue;

    const prop = declaration.substring(0, colonIndex).trim();
    const value = declaration.substring(colonIndex + 1).trim();

    if (prop && value) {
      style[prop] = value;
    }
  }

  return style;
};

/**
 * Parse CSS at-rule (@media, @keyframes, etc.)
 */
const parseAtRule = (ruleStr: string, atRuleName: string, result: BrowserParsedRule[]) => {
  // Extract params from @media or @keyframes
  const paramsMatch = ruleStr.match(new RegExp(`@${atRuleName}\\s+([^{]+)`, 'i'));
  const params = paramsMatch ? paramsMatch[1].trim() : '';

  // Extract the CSS content inside the at-rule
  const contentMatch = ruleStr.match(new RegExp(`@${atRuleName}\\s+[^{]+\\{([^}]*)\\}`, 'i'));
  if (!contentMatch) return;

  const content = contentMatch[1];

  // Parse nested rules
  const nestedRules = parseBasicRules(content);
  nestedRules.forEach(rule => {
    result.push({
      ...rule,
      atRule: atRuleName,
      params,
    });
  });
};

/**
 * Parse basic CSS rules (no at-rules)
 */
const parseBasicRules = (css: string): BrowserParsedRule[] => {
  const result: BrowserParsedRule[] = [];

  // Remove comments first
  const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // Match CSS rules: selector { declarations }
  const ruleRegex = /([^{}]+)\{([^{}]*)\}/g;
  let match;

  while ((match = ruleRegex.exec(cleanCss)) !== null) {
    const selector = match[1].trim();
    const declarationsStr = match[2].trim();

    if (selector && declarationsStr) {
      result.push({
        selectors: selector,
        style: parseDeclarations(declarationsStr),
      });
    }
  }

  return result;
};

/**
 * Browser-compatible CSS parser
 * Handles basic CSS rules and common at-rules (@media, @keyframes)
 */
export default (css: string, editor?: Editor): BrowserParsedRule[] => {
  const result: BrowserParsedRule[] = [];

  // Return empty array for empty input
  if (!css || css.trim().length === 0) {
    return result;
  }

  log(editor, ['Input CSS', css]);

  try {
    // Remove comments first
    const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, '');

    // Handle @media rules first
    const mediaRegex = /@media[^{]+\{[\s\S]*?\}/g;
    const mediaMatches = cleanCss.match(mediaRegex) || [];

    // Extract and process @media rules
    mediaMatches.forEach(mediaRule => {
      parseAtRule(mediaRule, 'media', result);
    });

    // Remove @media rules from CSS and process remaining rules
    const remainingCss = cleanCss.replace(mediaRegex, '');

    // Handle @keyframes rules
    const keyframesRegex = /@keyframes[^{]+\{[\s\S]*?\}/g;
    const keyframesMatches = remainingCss.match(keyframesRegex) || [];

    keyframesMatches.forEach(keyframesRule => {
      parseAtRule(keyframesRule, 'keyframes', result);
    });

    // Remove @keyframes rules and process basic rules
    const finalCss = remainingCss.replace(keyframesRegex, '');
    const basicRules = parseBasicRules(finalCss);
    result.push(...basicRules);

    log(editor, ['Output', result]);
  } catch (error) {
    // Graceful error handling - don't crash the app
    console.error('[parser-browser-css] Parse error:', error);
    if (editor && isDev) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      editor.log(`Parse error: ${errorMsg}`, { ns: 'parser-browser-css', level: 'error' });
    }

    // Fallback: return empty array
    return [];
  }

  return result;
};