import React, { useRef, useEffect } from 'react';
import { Tag } from '../types';

interface TagDropdownProps {
  existingTags: Tag[];
  taskTags: Tag[];
  newTagName: string;
  onNewTagNameChange: (name: string) => void;
  onSelectExistingTag: (tag: Tag) => void;
  onAddNewTag: () => void;
  onClose: () => void;
}

const TagDropdown: React.FC<TagDropdownProps> = ({
  existingTags,
  taskTags,
  newTagName,
  onNewTagNameChange,
  onSelectExistingTag,
  onAddNewTag,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableTags = existingTags.filter(
    tag => !taskTags.some(t => t.id === tag.id)
  );

  useEffect(() => {
    inputRef.current?.focus();

    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      if (rect.right > viewportWidth) {
        dropdownRef.current.style.left = 'auto';
        dropdownRef.current.style.right = '0';
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddNewTag();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-3 w-64"
    >
      {availableTags.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-gray-600 mb-2">既存のタグから選択</div>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {availableTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => onSelectExistingTag(tag)}
                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-white hover:opacity-90 transition-opacity shadow-sm"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={availableTags.length > 0 ? "border-t border-gray-200 pt-3" : ""}>
        <div className="text-xs font-semibold text-gray-600 mb-2">新規タグを作成</div>
        <input
          ref={inputRef}
          type="text"
          value={newTagName}
          onChange={(e) => onNewTagNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-2"
          placeholder="タグ名を入力..."
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onAddNewTag}
            disabled={!newTagName.trim()}
            className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagDropdown;
