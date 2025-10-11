import React from 'react';
import { Tag } from '../types';
import TagBadge from './TagBadge';

interface TagFilterProps {
  tags: Tag[];
  selectedTagIds: string[];
  onSelectTag: (tagId: string) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  selectedTagIds,
  onSelectTag
}) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap">
      {tags.map(tag => (
        <div
          key={tag.id}
          onClick={() => onSelectTag(tag.id)}
          className={`cursor-pointer transition-transform transform ${
            selectedTagIds.includes(tag.id) ? 'scale-105' : 'opacity-70 hover:opacity-100'
          }`}
        >
          <TagBadge tag={tag} allowEdit={false} />
        </div>
      ))}
    </div>
  );
};

export default TagFilter;