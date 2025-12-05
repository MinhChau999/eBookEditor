import React, { useState } from 'react';
import type { ClassInfo } from '../types';


interface ClassItemProps {
  classInfo: ClassInfo;
  onEdit: (className: string) => void;
  onDelete: (className: string) => void;
  onApply: (className: string) => void;
}

export const ClassItem: React.FC<ClassItemProps> = ({
  classInfo,
  onEdit,
  onDelete,
  onApply,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onApply(classInfo.name);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(classInfo.name);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(classInfo.name);
  };

  return (
    <div
      className="gjs-class-item"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="gjs-class-item-content">
        <span className="gjs-class-item-name">.{classInfo.name}</span>
        <span className="gjs-class-usage-badge">{classInfo.usageCount}</span>
      </div>

      {isHovered && (
        <div className="gjs-class-item-actions">
          <button
            className="gjs-class-item-btn gjs-class-item-btn-edit"
            onClick={handleEdit}
            title="Edit class name"
          >
            <i className="fa fa-pencil"></i>
          </button>
          <button
            className="gjs-class-item-btn gjs-class-item-btn-delete"
            onClick={handleDelete}
            title="Delete class"
          >
            <i className="fa fa-trash"></i>
          </button>
        </div>
      )}
    </div>
  );
};
