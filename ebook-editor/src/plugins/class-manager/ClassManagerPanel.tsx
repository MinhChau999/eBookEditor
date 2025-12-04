import React, { useState, useEffect, useCallback } from 'react';
import type { Editor, Selector } from 'grapesjs';
import { calculateUsageCount, filterClasses, applyClassToComponent, validateClassName } from './utils';
import type { ClassItemData } from './types';
import './styles.css';

interface ClassManagerPanelProps {
  editor: Editor;
}

interface EditModalState {
  isOpen: boolean;
  selector: Selector | null;
  name: string;
  error: string;
}

export const ClassManagerPanel: React.FC<ClassManagerPanelProps> = ({ editor }) => {
  const [classes, setClasses] = useState<ClassItemData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredClassId, setHoveredClassId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassError, setNewClassError] = useState('');
  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    selector: null,
    name: '',
    error: ''
  });

  // Load all classes
  const loadClasses = useCallback(() => {
    if (!editor.Selectors) return;
    
    const allSelectors = editor.Selectors.getAll({ array: true }) as Selector[];
    const classSelectors = allSelectors.filter((selector) => selector.isClass && selector.isClass());
    
    const classData: ClassItemData[] = classSelectors.map((selector) => ({
      selector,
      usageCount: calculateUsageCount(editor, selector),
      name: selector.get('name') || '',
      label: selector.getLabel ? selector.getLabel() : selector.get('name') || ''
    }));
    
    setClasses(classData);
  }, [editor]);

  // Initial load
  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Listen to selector events
  useEffect(() => {
    const handleSelectorChange = () => {
      loadClasses();
    };

    editor.on('selector:add', handleSelectorChange);
    editor.on('selector:remove', handleSelectorChange);
    editor.on('selector:update', handleSelectorChange);
    editor.on('component:update:classes', handleSelectorChange);

    return () => {
      editor.off('selector:add', handleSelectorChange);
      editor.off('selector:remove', handleSelectorChange);
      editor.off('selector:update', handleSelectorChange);
      editor.off('component:update:classes', handleSelectorChange);
    };
  }, [editor, loadClasses]);

  // Filter classes based on search
  const filteredClasses = searchQuery.trim()
    ? filterClasses(classes.map(c => c.selector), searchQuery).map(selector => {
        const classData = classes.find(c => c.selector === selector);
        return classData!;
      }).filter(Boolean)
    : classes;

  // Handle class click (quick apply)
  const handleClassClick = (classData: ClassItemData) => {
    applyClassToComponent(editor, classData.selector);
  };

  // Handle add class
  const handleAddClass = () => {
    const validation = validateClassName(newClassName);
    
    if (!validation.valid) {
      setNewClassError(validation.error || 'Invalid class name');
      return;
    }

    // Check for duplicates
    const exists = editor.Selectors.get(`.${newClassName.trim()}`);
    if (exists) {
      setNewClassError('Class already exists');
      return;
    }

    // Add the class
    editor.Selectors.add(newClassName.trim());
    
    // Reset and close modal
    setNewClassName('');
    setNewClassError('');
    setAddModalOpen(false);
    loadClasses();
  };

  // Handle edit class
  const handleEditClass = (classData: ClassItemData) => {
    setEditModal({
      isOpen: true,
      selector: classData.selector,
      name: classData.name,
      error: ''
    });
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editModal.selector) return;

    const validation = validateClassName(editModal.name);
    
    if (!validation.valid) {
      setEditModal({ ...editModal, error: validation.error || 'Invalid class name' });
      return;
    }

    const trimmedName = editModal.name.trim();
    
    // Check if name is the same
    if (trimmedName === editModal.selector.get('name')) {
      setEditModal({ isOpen: false, selector: null, name: '', error: '' });
      return;
    }

    // Rename the selector
    const result = editor.Selectors.rename(editModal.selector, trimmedName);
    
    if (result && result !== editModal.selector) {
      setEditModal({ ...editModal, error: 'Class with this name already exists' });
      return;
    }

    // Reset and close modal
    setEditModal({ isOpen: false, selector: null, name: '', error: '' });
    loadClasses();
  };

  // Handle delete class
  const handleDeleteClass = (classData: ClassItemData) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete the class ".${classData.name}"?\n\n` +
      `This class is used in ${classData.usageCount} component(s) and will be removed from all of them.`
    );
    
    if (!confirmDelete) return;

    editor.Selectors.remove(classData.selector);
    loadClasses();
  };

  return (
    <div className="class-manager-panel">
      <div className="class-manager-header">
        <h3 className="class-manager-title">Class Manager</h3>
        
        <div className="class-manager-search-wrapper">
          <i className="fa fa-search class-manager-search-icon"></i>
          <input
            type="text"
            className="class-manager-search"
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="class-manager-actions">
          <button className="add-class-btn" onClick={() => setAddModalOpen(true)}>
            <i className="fa fa-plus" style={{ marginRight: '5px' }}></i>
            Add New Class
          </button>
        </div>
      </div>

      <div className="class-list">
        {filteredClasses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="fa fa-css3"></i>
            </div>
            <p className="empty-state-text">
              {searchQuery.trim() 
                ? 'No classes match your search' 
                : 'No classes yet. Add your first class to get started!'}
            </p>
          </div>
        ) : (
          filteredClasses.map((classData) => {
            const id = `${classData.name}_${classData.selector.get('type')}`;
            return (
              <div
                key={id}
                className="class-item"
                onMouseEnter={() => setHoveredClassId(id)}
                onMouseLeave={() => setHoveredClassId(null)}
                onClick={() => handleClassClick(classData)}
                title={`Click to apply .${classData.name} to selected component`}
              >
                <div className="class-item-main">
                  <span className="class-item-name">.{classData.label}</span>
                  <span className="usage-count" title={`Used in ${classData.usageCount} component(s)`}>
                    {classData.usageCount}
                  </span>
                </div>
                
                {hoveredClassId === id && (
                  <div className="class-item-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="class-item-btn"
                      onClick={() => handleEditClass(classData)}
                      title="Edit class name"
                    >
                      <i className="fa fa-pencil"></i>
                    </button>
                    <button
                      className="class-item-btn delete-btn"
                      onClick={() => handleDeleteClass(classData)}
                      title="Delete class"
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Class Modal */}
      {addModalOpen && (
        <div className="class-manager-modal-overlay" onClick={() => {
          setAddModalOpen(false);
          setNewClassName('');
          setNewClassError('');
        }}>
          <div className="class-manager-modal" onClick={(e) => e.stopPropagation()}>
            <div className="class-manager-modal-header">
              <h4 className="class-manager-modal-title">Add New Class</h4>
            </div>
            <div className="class-manager-modal-body">
              <div className="class-manager-form-group">
                <label className="class-manager-form-label">Class Name</label>
                <input
                  type="text"
                  className="class-manager-form-input"
                  placeholder="e.g., my-class"
                  value={newClassName}
                  onChange={(e) => {
                    setNewClassName(e.target.value);
                    setNewClassError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddClass();
                    } else if (e.key === 'Escape') {
                      setAddModalOpen(false);
                      setNewClassName('');
                      setNewClassError('');
                    }
                  }}
                  autoFocus
                />
                {newClassError && (
                  <div className="class-manager-form-error">{newClassError}</div>
                )}
              </div>
            </div>
            <div className="class-manager-modal-footer">
              <button
                className="class-manager-modal-btn secondary"
                onClick={() => {
                  setAddModalOpen(false);
                  setNewClassName('');
                  setNewClassError('');
                }}
              >
                Cancel
              </button>
              <button
                className="class-manager-modal-btn primary"
                onClick={handleAddClass}
              >
                Add Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {editModal.isOpen && (
        <div className="class-manager-modal-overlay" onClick={() => {
          setEditModal({ isOpen: false, selector: null, name: '', error: '' });
        }}>
          <div className="class-manager-modal" onClick={(e) => e.stopPropagation()}>
            <div className="class-manager-modal-header">
              <h4 className="class-manager-modal-title">Edit Class</h4>
            </div>
            <div className="class-manager-modal-body">
              <div className="class-manager-form-group">
                <label className="class-manager-form-label">Class Name</label>
                <input
                  type="text"
                  className="class-manager-form-input"
                  value={editModal.name}
                  onChange={(e) => {
                    setEditModal({ ...editModal, name: e.target.value, error: '' });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEdit();
                    } else if (e.key === 'Escape') {
                      setEditModal({ isOpen: false, selector: null, name: '', error: '' });
                    }
                  }}
                  autoFocus
                />
                {editModal.error && (
                  <div className="class-manager-form-error">{editModal.error}</div>
                )}
              </div>
            </div>
            <div className="class-manager-modal-footer">
              <button
                className="class-manager-modal-btn secondary"
                onClick={() => {
                  setEditModal({ isOpen: false, selector: null, name: '', error: '' });
                }}
              >
                Cancel
              </button>
              <button
                className="class-manager-modal-btn primary"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
