import React, { useState } from 'react';
import { Tag, Task } from '../types';
import { createTask } from '../utils/taskUtils';

interface TaskInputProps {
  existingTags: Tag[];
  onAddTask: (task: Task) => void;
  onAddTags: (tags: Tag[]) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ 
  existingTags,
  onAddTask,
  onAddTags
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const task = createTask(input, existingTags);
    
    const newTags = task.tags.filter(
      newTag => !existingTags.some(existingTag => existingTag.id === newTag.id)
    );
    
    if (newTags.length > 0) {
      onAddTags(newTags);
    }
    
    onAddTask(task);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="タグ1,タグ2,タスク内容,タスク期限"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          追加
        </button>
      </div>
    </form>
  );
};

export default TaskInput;