import React, { useState, useEffect, useCallback } from 'react';
import type { Editor } from 'grapesjs';
import type { ClassInfo, ClassEditorState } from '../types';
import { ClassItem } from './ClassItem';
import { ClassEditor } from './ClassEditor';
import {
  getAllClasses,
  applyClassToComponent,
  deleteClass,
  updateClassName,
  createClass,
} from '../utils/classUtils';

interface ClassManagerPanelProps {
  editor: Editor;
}

export const ClassManagerPanel: React.FC<ClassManagerPanelProps> = ({ editor }) => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editorState, setEditorState] = useState<ClassEditorState>({
    mode: 'create',
    className: '',
    isOpen: false,
  });
  const [selectedComponent, setSelectedComponent] = useState<any>(null);

  // Refresh class list
  const refreshClasses = useCallback(() => {
    const allClasses = getAllClasses(editor);
    setClasses(allClasses);
  }, [editor]);

  // Initialize and set up event listeners
  useEffect(() => {
    refreshClasses();

    // Listen for component selection
    const handleComponentSelect = () => {
      setSelectedComponent(editor.getSelected());
      refreshClasses(); // Refresh to update usage counts
    };

    // Listen for component updates
    const handleComponentUpdate = () => {
      refreshClasses();
    };

    // Listen for selector changes
    const handleSelectorAdd = () => {
      refreshClasses();
    };

    const handleSelectorRemove = () => {
      refreshClasses();
    };

    editor.on('component:selected', handleComponentSelect);
    editor.on('component:update', handleComponentUpdate);
    editor.on('selector:add', handleSelectorAdd);
    editor.on('selector:remove', handleSelectorRemove);

    // Initial component check
    setSelectedComponent(editor.getSelected());

    return () => {
      editor.off('component:selected', handleComponentSelect);
      editor.off('component:update', handleComponentUpdate);
      editor.off('selector:add', handleSelectorAdd);
      editor.off('selector:remove', handleSelectorRemove);
    };
  }, [editor, refreshClasses]);

  // Filter classes based on search query
  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle add new class
  const handleAddClass = () => {
    setEditorState({
      mode: 'create',
      className: '',
      isOpen: true,
    });
  };

  // Handle edit class
  const handleEditClass = (className: string) => {
    setEditorState({
      mode: 'edit',
      className,
      originalClassName: className,
      isOpen: true,
    });
  };

  // Handle delete class
  const handleDeleteClass = (className: string) => {
    const classInfo = classes.find((c) => c.name === className);
    const usageCount = classInfo?.usageCount || 0;

    let message = `Are you sure you want to delete class "${className}"?`;
    if (usageCount > 0) {
      message += `\n\nThis class is currently used by ${usageCount} component${usageCount > 1 ? 's' : ''}. It will be removed from all components.`;
    }

    if (confirm(message)) {
      deleteClass(editor, className);
      refreshClasses();
    }
  };

  // Handle apply class to selected component
  const handleApplyClass = (className: string) => {
    if (!selectedComponent) {
      alert('Please select a component first');
      return;
    }

    const applied = applyClassToComponent(editor, className);
    if (applied) {
      refreshClasses(); // Refresh to update usage count
    } else {
      // Class already applied
      alert(`Class "${className}" is already applied to this component`);
    }
  };

  // Handle save from editor
  const handleSaveClass = (className: string) => {
    let success = false;

    if (editorState.mode === 'create') {
      success = createClass(editor, className);
      if (!success) {
        alert(`Class "${className}" already exists or is invalid`);
        return;
      }
    } else {
      // Edit mode
      if (editorState.originalClassName) {
        success = updateClassName(editor, editorState.originalClassName, className);
        if (!success) {
          alert(`Failed to rename class. "${className}" may already exist or be invalid.`);
          return;
        }
      }
    }

    setEditorState({ mode: 'create', className: '', isOpen: false });
    refreshClasses();
  };

  // Handle cancel editor
  const handleCancelEditor = () => {
    setEditorState({ mode: 'create', className: '', isOpen: false });
  };

  return (
    <div className="gjs-class-manager-panel">
      {/* Header */}
      <div className="gjs-class-manager-header">
        <input
          type="text"
          className="gjs-class-manager-search"
          placeholder="Search classes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="gjs-class-manager-add-btn"
          onClick={handleAddClass}
          title="Add new class"
        >
          <i className="fa fa-plus"></i> Add Class
        </button>
      </div>

      {/* Class List */}
      <div className="gjs-class-manager-list">
        {filteredClasses.length === 0 ? (
          <div className="gjs-class-manager-empty">
            {searchQuery ? (
              <>
                <i className="fa fa-search gjs-class-manager-empty-icon"></i>
                <p>No classes found matching "{searchQuery}"</p>
              </>
            ) : (
              <>
                <i className="fa fa-css3 gjs-class-manager-empty-icon"></i>
                <p>No classes yet</p>
                <p className="gjs-class-manager-empty-hint">
                  Click "Add Class" to create your first CSS class
                </p>
              </>
            )}
          </div>
        ) : (
          filteredClasses.map((classInfo) => (
            <ClassItem
              key={classInfo.name}
              classInfo={classInfo}
              onEdit={handleEditClass}
              onDelete={handleDeleteClass}
              onApply={handleApplyClass}
            />
          ))
        )}
      </div>

      {/* Class Editor Modal */}
      {editorState.isOpen && (
        <ClassEditor
          state={editorState}
          onSave={handleSaveClass}
          onCancel={handleCancelEditor}
        />
      )}

      {/* Info Footer */}
      <div className="gjs-class-manager-footer">
        <span className="gjs-class-manager-footer-text">
          {filteredClasses.length} {filteredClasses.length === 1 ? 'class' : 'classes'}
          {selectedComponent && ' · Click a class to apply'}
        </span>
      </div>
    </div>
  );
};
