import React, { useState, useEffect } from 'react';
import { Tag } from '../types';
import { TAG_COLORS } from '../utils/taskUtils';
import { X } from 'lucide-react';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
  onEdit?: (updatedTag: Tag) => void;
  allowEdit?: boolean;
}

const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  onRemove,
  onEdit,
  allowEdit = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(tag.name);
  const [editedColor, setEditedColor] = useState(tag.color);

  useEffect(() => {
    setEditedName(tag.name);
    setEditedColor(tag.color);
  }, [tag.name, tag.color]);

  const handleEdit = () => {
    if (!allowEdit) return;
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onEdit && editedName.trim()) {
      onEdit({
        ...tag,
        name: editedName.trim(),
        color: editedColor
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedName(tag.name);
      setEditedColor(tag.color);
    }
  };

  const handleColorChange = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    setEditedColor(color);
    if (onEdit && editedName.trim()) {
      onEdit({
        ...tag,
        name: editedName.trim(),
        color: color
      });
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="inline-flex items-center bg-white border border-gray-200 rounded p-0.5 mr-1 shadow-sm">
        <input
          type="text"
          value={editedName}
          onChange={e => setEditedName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-16 text-xs border-none focus:ring-0 outline-none px-1"
          autoFocus
        />
        <div className="flex space-x-0.5 ml-1">
          {TAG_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onMouseDown={(e) => handleColorChange(e, color)}
              className={`w-3 h-3 rounded-full cursor-pointer ${
                editedColor === color ? 'ring-1 ring-offset-1 ring-blue-500' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="inline-flex items-center rounded px-1.5 py-0.5 mr-1 text-xs text-white shadow-sm cursor-pointer transition-opacity hover:opacity-90"
      style={{ backgroundColor: tag.color }}
    >
      <span onClick={allowEdit ? handleEdit : undefined}>
        {tag.name}
      </span>
      {onRemove && (
        <X 
          size={12}
          className="ml-1 cursor-pointer hover:text-gray-200" 
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
        />
      )}
    </div>
  );
};

export default TagBadge;