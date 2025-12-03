import { Editor } from 'grapesjs';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

interface CodeViewer {
  getContent(): string;
  setContent(content: string): void;
  refresh(): void;
  getElement(): HTMLElement;
}

interface CodeManager {
  createViewer(opts: { label: string; codeName: string; theme: string; readOnly?: boolean }): CodeViewer;
  EditorView: new (opts: { model: CodeViewer; config: unknown }) => { render(): { el: HTMLElement } };
  getConfig(): unknown;
}

// Helper: Get main selector from selected component
const getMainSelector = (selected: any): string => {
  const classes = selected.getClasses();
  if (classes.length > 0) {
    return `.${classes[classes.length - 1]}`;
  }
  const id = selected.getId();
  return id ? `#${id}` : '';
};

// Helper: Filter rules by selector
const filterRulesBySelector = (allRules: any, mainSelector: string): any[] => {
  const rulesArray = Array.isArray(allRules) ? allRules : [...allRules];
  return rulesArray.filter((rule: any) => {
    const ruleSelector = rule.get('selectors').getFullString();
    return (
      ruleSelector === mainSelector ||
      ruleSelector.startsWith(`${mainSelector}:`) ||
      ruleSelector.startsWith(`${mainSelector}::`)
    );
  });
};

// Helper: Format CSS rules to string
const formatCSSRules = (rules: any[], mainSelector: string): string => {
  const sortedRules = [...rules].sort((a, b) => {
    const selA = a.get('selectors').getFullString();
    const selB = b.get('selectors').getFullString();
    if (selA === mainSelector) return -1;
    if (selB === mainSelector) return 1;
    return selA.localeCompare(selB);
  });

  return sortedRules
    .map(rule => {
      const selector = rule.get('selectors').getFullString();
      const style = rule.getStyle();
      const props = Object.entries(style as Record<string, any>)
        .map(([prop, value]) => `  ${prop}: ${value};`)
        .join('\n');
      return `${selector} {\n${props}\n}`;
    })
    .join('\n\n');
};

// Helper: Parse CSS string to rules
const parseCSSToRules = (code: string): Array<{ selector: string; styles: Record<string, string> }> => {
  const ruleRegex = /([^{]+)\{([^}]+)\}/g;
  const parsed: Array<{ selector: string; styles: Record<string, string> }> = [];
  let match;

  while ((match = ruleRegex.exec(code)) !== null) {
    const selector = match[1].trim();
    const body = match[2].trim();
    const styles: Record<string, string> = {};

    body.split(';').forEach(propLine => {
      const [prop, value] = propLine.split(':');
      if (prop && value) {
        styles[prop.trim()] = value.trim();
      }
    });

    parsed.push({ selector, styles });
  }

  return parsed;
};

const StyleManagerTabs = ({ editor }: { editor: Editor }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CodeViewer | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Apply CSS changes from viewer to editor
  const applyCodeChanges = useCallback(() => {
    if (!viewerRef.current) return;

    const code = viewerRef.current.getContent();
    const parsedRules = parseCSSToRules(code);

    parsedRules.forEach(({ selector, styles }) => {
      let rule = editor.Css.getRule(selector);
      if (!rule) {
        rule = editor.Css.add(selector);
      }
      if (rule) {
        rule.setStyle(styles);
      }
    });
  }, [editor]);

  // Update code viewer with current selection's CSS
  const updateCodeViewer = useCallback(() => {
    const selected = editor.getSelected();
    
    if (!selected || !viewerRef.current) {
      if (viewerRef.current) {
        viewerRef.current.setContent('');
        viewerRef.current.refresh();
      }
      return;
    }

    const mainSelector = getMainSelector(selected);
    if (!mainSelector) return;

    const allRules = editor.Css.getAll();
    let rules = filterRulesBySelector(allRules, mainSelector);

    if (rules.length === 0) {
      const mainRule = editor.Css.getRule(mainSelector);
      if (mainRule) rules = [mainRule];
    }

    const cssString = rules.length > 0
      ? formatCSSRules(rules, mainSelector)
      : `${mainSelector} {\n  \n}`;

    viewerRef.current.setContent(cssString);
    viewerRef.current.refresh();
  }, [editor]);

  // Initialize CodeMirror Viewer
  useEffect(() => {
    if (!containerRef.current) return;

    const cmdm = (editor as unknown as { CodeManager: CodeManager }).CodeManager;
    if (!cmdm) return;

    const viewer = cmdm.createViewer({
      label: 'CSS',
      codeName: 'css',
      theme: 'hopscotch',
      readOnly: false,
    });

    viewerRef.current = viewer;

    const view = new cmdm.EditorView({
      model: viewer,
      config: cmdm.getConfig(),
    }).render();

    containerRef.current.appendChild(view.el);

    // Setup live update listener
    const codeMirrorEl = view.el.querySelector('.CodeMirror') as any;
    if (codeMirrorEl?.CodeMirror) {
      const cm = codeMirrorEl.CodeMirror;
      const handleChange = () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(applyCodeChanges, 500);
      };
      cm.on('change', handleChange);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [editor, applyCodeChanges]);

  // Handle editor events
  useEffect(() => {
    const handlePreviewStop = () => {
      if (viewerRef.current) viewerRef.current.refresh();
    };

    const handleStyleUpdate = () => {
      if (activeTab === 'visual') {
        updateCodeViewer();
      }
    };

    editor.on('component:selected', updateCodeViewer);
    editor.on('stop:preview', handlePreviewStop);
    editor.on('style:update', handleStyleUpdate);

    return () => {
      editor.off('component:selected', updateCodeViewer);
      editor.off('stop:preview', handlePreviewStop);
      editor.off('style:update', handleStyleUpdate);
    };
  }, [editor, activeTab, updateCodeViewer]);

  const handleTabChange = useCallback((tab: 'visual' | 'code') => {
    setActiveTab(tab);
    const smSectors = document.querySelector('.gjs-sm-sectors') as HTMLElement;
    if (smSectors) {
      smSectors.style.display = tab === 'visual' ? 'block' : 'none';
    }

    if (tab === 'code' && viewerRef.current) {
      setTimeout(() => {
        viewerRef.current?.refresh();
      }, 10);
    }
  }, []);

  return (
    <div className="gjs-sm-tabs-container">
      <div className="gjs-sm-tabs">
        <button
          onClick={() => handleTabChange('visual')}
          className={`gjs-sm-tab-btn ${activeTab === 'visual' ? 'active' : ''}`}
        >
          Visual
        </button>
        <button
          onClick={() => handleTabChange('code')}
          className={`gjs-sm-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
        >
          Code
        </button>
      </div>

      <div
        className="gjs-sm-code-editor"
        style={{ display: activeTab === 'code' ? 'flex' : 'none' }}
      >
        <div ref={containerRef} className="gjs-sm-code-container" />
      </div>
    </div>
  );
};

const styleManagerTabs = (editor: Editor) => {
  editor.on('load', () => {
    const findAndInject = () => {
      const smSectors = document.querySelector('.gjs-sm-sectors');
      if (smSectors?.parentElement) {
        if (smSectors.parentElement.querySelector('.gjs-sm-tabs-container')) return;

        const container = document.createElement('div');
        container.style.height = '100%';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';

        smSectors.parentElement.insertBefore(container, smSectors);

        const root = createRoot(container);
        root.render(<StyleManagerTabs editor={editor} />);
      } else {
        setTimeout(findAndInject, 100);
      }
    };

    findAndInject();
    editor.on('run:open-sm', () => {
      setTimeout(findAndInject, 50);
    });
  });
};

export default styleManagerTabs;
