import React, { useState } from 'react';
import type { ClassEditorState } from '../types';

interface ClassEditorProps {
  state: ClassEditorState;
  onSave: (className: string) => void;
  onCancel: () => void;
}

export const ClassEditor: React.FC<ClassEditorProps> = ({ state, onSave, onCancel }) => {
  const [inputValue, setInputValue] = useState(state.className);
  const [error, setError] = useState<string>('');

  const handleSave = () => {
    const trimmed = inputValue.trim();
    
    // Validation
    if (!trimmed) {
      setError('Class name cannot be empty');
      return;
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(trimmed)) {
      setError('Invalid class name. Must start with a letter or underscore, and contain only letters, numbers, hyphens, or underscores.');
      return;
    }

    onSave(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="gjs-class-editor-modal">
      <div className="gjs-class-editor-content">
        <h3 className="gjs-class-editor-title">
          {state.mode === 'create' ? 'Add New Class' : 'Edit Class'}
        </h3>
        
        <div className="gjs-class-editor-body">
          <div className="gjs-class-editor-field">
            <label className="gjs-class-editor-label">Class Name</label>
            <input
              type="text"
              className="gjs-class-editor-input"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g., my-class"
              autoFocus
            />
            {error && <div className="gjs-class-editor-error">{error}</div>}
          </div>
        </div>

        <div className="gjs-class-editor-actions">
          <button
            className="gjs-class-editor-btn gjs-class-editor-btn-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="gjs-class-editor-btn gjs-class-editor-btn-save"
            onClick={handleSave}
          >
            {state.mode === 'create' ? 'Add Class' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
