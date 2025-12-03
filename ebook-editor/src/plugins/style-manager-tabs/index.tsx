import { Editor } from 'grapesjs';
import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// Define CodeManager types locally since they might not be fully exported
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

const StyleManagerTabs = ({ editor }: { editor: Editor }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CodeViewer | null>(null);
  const cssRulesRef = useRef<any[]>([]); // Store all related rules

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

    // Set up live update listener on CodeMirror
    const codeMirrorEl = view.el.querySelector('.CodeMirror') as any;
    if (codeMirrorEl && codeMirrorEl.CodeMirror) {
      const cm = codeMirrorEl.CodeMirror;
      
      // Debounce function to avoid too frequent updates
      let debounceTimer: NodeJS.Timeout;
      cm.on('change', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          applyCodeChangesFromViewer();
        }, 500); // 500ms debounce
      });
    }

    return () => {
      // Cleanup if needed
    };
  }, [editor]);

  // Handle Selection and CSS Updates
  useEffect(() => {
    const updateCode = () => {
      const selected = editor.getSelected();

      if (selected) {
        let rules: any[] = [];
        const classes = selected.getClasses();
        let mainSelector = '';

        if (classes.length > 0) {
            // Use the last class as the primary selector
            const cls = classes[classes.length - 1];
            mainSelector = `.${cls}`;
        } else {
            // Fallback to ID
            const id = selected.getId();
            if (id) {
                mainSelector = `#${id}`;
            }
        }

        if (mainSelector) {
            // Find all rules that start with this selector
            // This includes .class, .class:hover, .class::before, etc.
            const allRules = editor.Css.getAll();
            rules = allRules.filter((rule: any) => {
                const ruleSelector = rule.get('selectors').getFullString();
                // Check if the rule selector matches or starts with our main selector
                // This is a basic check, might need more robust selector matching
                return ruleSelector === mainSelector || ruleSelector.startsWith(`${mainSelector}:`) || ruleSelector.startsWith(`${mainSelector}::`);
            });
            
            // If no rules found (e.g. new class with no styles yet), we might want to show at least the main block
            if (rules.length === 0) {
                // We can't easily create a rule object without adding it to the editor, 
                // but we can simulate it for the display if needed.
                // For now, let's just try to get the specific rule again to be sure
                const mainRule = editor.Css.getRule(mainSelector);
                if (mainRule) rules.push(mainRule);
            }
        }

        cssRulesRef.current = rules;

        if (rules.length > 0) {
            let fullCssString = '';
            
            // Sort rules to put the main one first, then states
            rules.sort((a, b) => {
                const selA = a.get('selectors').getFullString();
                const selB = b.get('selectors').getFullString();
                if (selA === mainSelector) return -1;
                if (selB === mainSelector) return 1;
                return selA.localeCompare(selB);
            });

            rules.forEach(rule => {
                const selector = rule.get('selectors').getFullString();
                const style = rule.getStyle();
                
                fullCssString += `${selector} {\n`;
                for (const [prop, value] of Object.entries(style)) {
                    fullCssString += `  ${prop}: ${value};\n`;
                }
                fullCssString += `}\n\n`;
            });

            if (viewerRef.current) {
                viewerRef.current.setContent(fullCssString);
                viewerRef.current.refresh();
            }
        } else {
             if (viewerRef.current) {
                // If no rules exist, show a template for the main selector
                const template = `${mainSelector} {\n  \n}`;
                viewerRef.current.setContent(template);
                viewerRef.current.refresh();
            }
        }
      } else {
        if (viewerRef.current) {
            viewerRef.current.setContent('');
            viewerRef.current.refresh();
        }
        cssRulesRef.current = [];
      }
    };

    editor.on('component:selected', updateCode);
    editor.on('stop:preview', () => {
         if (viewerRef.current) viewerRef.current.refresh();
    });
    
    // When styles update in Visual mode, refresh Code
    editor.on('style:update', () => {
        if (activeTab === 'visual') {
            updateCode();
        }
    });

    return () => {
      editor.off('component:selected', updateCode);
      editor.off('style:update', updateCode);
      editor.off('stop:preview', () => {});
    };
  }, [editor, activeTab]);

  const handleTabChange = (tab: 'visual' | 'code') => {
    setActiveTab(tab);
    const smSectors = document.querySelector('.gjs-sm-sectors') as HTMLElement;
    if (smSectors) {
      smSectors.style.display = tab === 'visual' ? 'block' : 'none';
    }
    
    if (tab === 'code') {
        // Refresh viewer when becoming visible
        setTimeout(() => {
            if (viewerRef.current) {
                viewerRef.current.refresh();
            }
        }, 10);
    }
  };

  // Handle Code Changes (Apply to Rules) - Extracted for reuse
  const applyCodeChangesFromViewer = () => {
      if (!viewerRef.current) return;
      
      const code = viewerRef.current.getContent();
      
      const ruleRegex = /([^{]+)\{([^}]+)\}/g;
      let match;
      
      while ((match = ruleRegex.exec(code)) !== null) {
          const selector = match[1].trim();
          const body = match[2].trim();
          
          const styleObj: Record<string, string> = {};
          body.split(';').forEach(propLine => {
              const [prop, value] = propLine.split(':');
              if (prop && value) {
                  styleObj[prop.trim()] = value.trim();
              }
          });
          
          // Find existing rule or create new one
          let rule = editor.Css.getRule(selector);
          if (!rule) {
              rule = editor.Css.add(selector);
          }
          
          if (rule) {
              rule.setStyle(styleObj);
          }
      }
  };

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
        if (smSectors && smSectors.parentElement) {
            if (smSectors.parentElement.querySelector('.gjs-sm-tabs-container')) return;

            const container = document.createElement('div');
            // Ensure the container takes full height if possible, though GrapesJS panels might constrain it
            container.style.height = '100%'; 
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            
            smSectors.parentElement.insertBefore(container, smSectors);
            
            // Move smSectors inside our container to manage its visibility better?
            // No, the requirement is to toggle visibility. 
            // But if we want the tabs to be *above* the sectors, we injected before.
            // If we want the code editor to take full height, we might need to hide sectors and let our container grow.
            
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
