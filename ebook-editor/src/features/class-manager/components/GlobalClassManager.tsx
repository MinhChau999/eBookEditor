import React, { useState, useEffect } from 'react';
import { Editor } from 'grapesjs';

interface GlobalClassManagerProps {
  editor: Editor;
}

export const GlobalClassManager: React.FC<GlobalClassManagerProps> = ({ editor }) => {
  const [selectors, setSelectors] = useState<any[]>([]);
  const [newClass, setNewClass] = useState('');

  const updateSelectors = () => {
    const collection = editor.Selectors.getAll();
    // @ts-ignore - GrapesJS types might be tricky, accessing models directly or mapping
    setSelectors(collection.models || Array.from(collection));
  };

  useEffect(() => {
    updateSelectors();
    editor.on('selector:add selector:remove', updateSelectors);
    return () => {
      editor.off('selector:add selector:remove', updateSelectors);
    };
  }, [editor]);

  const handleAdd = () => {
    if (newClass.trim()) {
      editor.Selectors.add({ name: newClass.trim(), label: newClass.trim() });
      setNewClass('');
    }
  };

  const handleDelete = (selector: any) => {
    if (confirm(`Are you sure you want to delete class ".${selector.getLabel()}"?`)) {
        // We need to remove it from all components first? 
        // Or just remove from the global list. GrapesJS might handle it.
        // editor.Selectors.remove(selector); // This might not be exposed directly on collection in older versions
        // Try removing by name or object
        const collection = editor.Selectors.getAll();
        collection.remove(selector);
    }
  };

  return (
    <div className="global-class-manager" style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '10px' }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Global Classes</span>
        <span style={{ fontSize: '0.8em', opacity: 0.7 }}>{selectors.length}</span>
      </div>
      
      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        <input
          type="text"
          value={newClass}
          onChange={(e) => setNewClass(e.target.value)}
          placeholder="New class name"
          style={{ 
            flex: 1, 
            padding: '5px', 
            borderRadius: '3px', 
            border: '1px solid #444', 
            background: 'rgba(0,0,0,0.2)', 
            color: 'inherit' 
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button 
            onClick={handleAdd}
            style={{
                background: '#444',
                border: 'none',
                color: 'white',
                borderRadius: '3px',
                cursor: 'pointer',
                padding: '0 10px'
            }}
        >
            +
        </button>
      </div>

      <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {selectors.map((selector) => (
          <div 
            key={selector.toString()} 
            style={{ 
                background: 'rgba(255,255,255,0.1)', 
                padding: '2px 8px', 
                borderRadius: '10px', 
                fontSize: '0.85em',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
            }}
          >
            <span>.{selector.getLabel()}</span>
            <span 
                onClick={() => handleDelete(selector)}
                style={{ cursor: 'pointer', opacity: 0.5, fontWeight: 'bold' }}
                title="Delete class"
            >
                ×
            </span>
          </div>
        ))}
        {selectors.length === 0 && (
            <div style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '0.9em' }}>No classes found</div>
        )}
      </div>
    </div>
  );
};
