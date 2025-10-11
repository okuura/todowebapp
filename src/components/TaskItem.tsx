import React, { useState, useRef } from 'react';
import { Task, Tag } from '../types';
import TagBadge from './TagBadge';
import TagDropdown from './TagDropdown';
import { X, Plus, Calendar } from 'lucide-react';
import { TAG_COLORS } from '../utils/taskUtils';
import { v4 as uuidv4 } from 'uuid';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTask: (updatedTask: Task) => void;
  onAddTag: (taskId: string, tag: Tag) => void;
  existingTags: Tag[];
  tagColumnWidth: number;
  dragHandleProps?: any;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onUpdateTask,
  onAddTag,
  existingTags,
  tagColumnWidth,
  dragHandleProps
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [editedDeadline, setEditedDeadline] = useState(task.deadline || '');
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content);
  const contentInputRef = useRef<HTMLInputElement>(null);

  const getDeadlineStyle = () => {
    if (!task.deadline) return {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [year, month, day] = task.deadline.split('/').map(Number);
    const deadline = new Date(year, month - 1, day);
    deadline.setHours(0, 0, 0, 0);

    if (deadline < today) {
      return { fontWeight: 'bold', color: '#ef4444' }; // 期限切れ: 太字の赤
    } else if (deadline.getTime() === today.getTime()) {
      return { color: '#3b82f6' }; // 今日が期限: 青
    }
    return { color: '#374151' }; // それ以外: 黒
  };

  const handleToggleComplete = () => {
    onToggleComplete(task.id);
  };

  const handleRemoveTag = (tagId: string) => {
    const updatedTags = task.tags.filter(tag => tag.id !== tagId);
    onUpdateTask({ ...task, tags: updatedTags });
  };

  const handleEditTag = (updatedTag: Tag) => {
    const updatedTags = task.tags.map(tag => 
      tag.id === updatedTag.id ? updatedTag : tag
    );
    onUpdateTask({ ...task, tags: updatedTags });
  };

  const handleAddNewTag = () => {
    if (!newTagName.trim()) return;

    const existingTag = existingTags.find(
      tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase()
    );

    if (existingTag) {
      if (!task.tags.some(t => t.id === existingTag.id)) {
        onAddTag(task.id, existingTag);
      }
    } else {
      const newTag: Tag = {
        id: uuidv4(),
        name: newTagName.trim(),
        color: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]
      };
      onAddTag(task.id, newTag);
    }

    setNewTagName('');
    setShowTagDropdown(false);
  };

  const handleSelectExistingTag = (tag: Tag) => {
    if (!task.tags.some(t => t.id === tag.id)) {
      onAddTag(task.id, tag);
    }
    setShowTagDropdown(false);
  };

  const handleEditDeadline = () => {
    setIsEditingDeadline(true);
  };

  const handleSaveDeadline = () => {
    if (editedDeadline && !/^\d{4}\/\d{2}\/\d{2}$/.test(editedDeadline)) {
      if (/^\d{8}$/.test(editedDeadline)) {
        const formatted = `${editedDeadline.substring(0, 4)}/${editedDeadline.substring(4, 6)}/${editedDeadline.substring(6, 8)}`;
        setEditedDeadline(formatted);
        onUpdateTask({ ...task, deadline: formatted });
      } else {
        setEditedDeadline(task.deadline || '');
      }
    } else {
      onUpdateTask({ ...task, deadline: editedDeadline || undefined });
    }
    setIsEditingDeadline(false);
  };

  const handleDeadlineKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveDeadline();
    } else if (e.key === 'Escape') {
      setIsEditingDeadline(false);
      setEditedDeadline(task.deadline || '');
    }
  };

  const handleContentClick = () => {
    setIsEditingContent(true);
    setTimeout(() => {
      contentInputRef.current?.focus();
      contentInputRef.current?.select();
    }, 0);
  };

  const handleContentSave = () => {
    if (editedContent.trim()) {
      onUpdateTask({ ...task, content: editedContent.trim() });
    } else {
      setEditedContent(task.content);
    }
    setIsEditingContent(false);
  };

  const handleContentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleContentSave();
    } else if (e.key === 'Escape') {
      setIsEditingContent(false);
      setEditedContent(task.content);
    }
  };

  return (
    <div
      className={`flex items-center py-1 px-2 border-b ${
        task.completed ? 'bg-gray-200' : 'bg-white'
      }`}
    >
      <div
        className="flex items-center space-x-1 cursor-grab active:cursor-grabbing"
        style={{ width: '40px' }}
        {...dragHandleProps}
      >
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
          className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
        />
      </div>

      <div
        className="flex items-center min-w-0 relative"
        style={{ width: `${tagColumnWidth}px` }}
      >
        <div className="flex flex-wrap items-center gap-1">
          {task.tags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              onRemove={() => handleRemoveTag(tag.id)}
              onEdit={handleEditTag}
            />
          ))}
          <div className="relative inline-block">
            <button
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className="inline-flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Plus size={14} />
            </button>
            {showTagDropdown && (
              <TagDropdown
                existingTags={existingTags}
                taskTags={task.tags}
                newTagName={newTagName}
                onNewTagNameChange={setNewTagName}
                onSelectExistingTag={handleSelectExistingTag}
                onAddNewTag={handleAddNewTag}
                onClose={() => {
                  setShowTagDropdown(false);
                  setNewTagName('');
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
        {isEditingContent ? (
          <input
            ref={contentInputRef}
            type="text"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onBlur={handleContentSave}
            onKeyDown={handleContentKeyDown}
            className="w-full px-1 py-0.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ) : (
          <div
            onClick={handleContentClick}
            className="cursor-pointer hover:bg-gray-50 px-1 py-0.5 text-sm rounded"
          >
            {task.content}
          </div>
        )}
      </div>

      <div className="w-28">
        {isEditingDeadline ? (
          <input
            type="text"
            value={editedDeadline}
            onChange={e => setEditedDeadline(e.target.value)}
            onBlur={handleSaveDeadline}
            onKeyDown={handleDeadlineKeyDown}
            placeholder="YYYY/MM/DD"
            className="w-full text-xs border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <div
            className="flex items-center text-xs cursor-pointer hover:opacity-80"
            onClick={handleEditDeadline}
            style={getDeadlineStyle()}
          >
            <Calendar size={12} className="mr-1" />
            {task.deadline || '期限なし'}
          </div>
        )}
      </div>
      
      <div className="w-8 flex justify-end">
        <button
          onClick={() => onDelete(task.id)}
          className="text-red-400 hover:text-red-600 focus:outline-none"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;