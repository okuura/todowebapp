import React, { useState, useRef, useEffect } from 'react';
import { Task, Tag, Milestone, AppData } from './types';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import TagFilter from './components/TagFilter';
import CalendarView from './components/Calendar/CalendarView';
import { sortTasksByDeadline, organizeTasks } from './utils/taskUtils';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Layout, Upload, Download, List } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('todo-tasks', []);
  const [tags, setTags] = useLocalStorage<Tag[]>('todo-tags', []);
  const [milestones, setMilestones] = useLocalStorage<Milestone[]>('todo-milestones', []);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>('asc');
  const [splitPosition, setSplitPosition] = useState(70);
  const [tagColumnWidth, setTagColumnWidth] = useState(200);
  const [title, setTitle] = useState('TODO');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tagColumnDividerRef = useRef<HTMLDivElement>(null);
  
  const existingTagIds = new Set(tasks.flatMap(task => task.tags.map(tag => tag.id)));
  const availableTags = tags.filter(tag => existingTagIds.has(tag.id));
  
  const filteredTasks = tasks.filter(task => {
    if (selectedTagIds.length === 0) return true;
    return selectedTagIds.every(tagId => 
      task.tags.some(tag => tag.id === tagId)
    );
  });
  
  const sortedTasks = sortDirection
    ? sortTasksByDeadline(filteredTasks, sortDirection === 'asc')
    : filteredTasks;
  
  const handleAddTask = (task: Task) => {
    setTasks([task, ...tasks]);
  };
  
  const handleToggleComplete = (id: string) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(
      tasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
    );
  };
  
  const handleReorderTasks = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
  };
  
  const handleOrganizeTasks = () => {
    setTasks(organizeTasks(tasks));
  };
  
  const handleAddTags = (newTags: Tag[]) => {
    setTags([...tags, ...newTags]);
  };
  
  const handleAddTagToTask = (taskId: string, tag: Tag) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId
          ? { ...task, tags: [...task.tags, tag] }
          : task
      )
    );
  };
  
  const handleSelectTag = (tagId: string) => {
    setSelectedTagIds(
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter(id => id !== tagId)
        : [...selectedTagIds, tagId]
    );
  };
  
  const handleToggleSortDirection = () => {
    setSortDirection(current => {
      if (current === 'asc') return 'desc';
      return 'asc';
    });
  };

  
  const handleAddMilestone = (milestone: Milestone) => {
    setMilestones([...milestones, milestone]);
  };
  
  const handleUpdateMilestone = (updatedMilestone: Milestone) => {
    setMilestones(
      milestones.map(milestone => 
        milestone.id === updatedMilestone.id ? updatedMilestone : milestone
      )
    );
  };
  
  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter(milestone => milestone.id !== id));
  };
  
  const handleExport = () => {
    const data: AppData = {
      tasks,
      tags,
      milestones
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data: AppData = JSON.parse(e.target?.result as string);
        
        const importedTasks = data.tasks.map(task => ({
          ...task,
          id: uuidv4()
        }));
        
        const tagIdMap = new Map<string, string>();
        
        const importedTags = data.tags.map(tag => {
          const newId = uuidv4();
          tagIdMap.set(tag.id, newId);
          return {
            ...tag,
            id: newId
          };
        });
        
        const tasksWithUpdatedTagRefs = importedTasks.map(task => ({
          ...task,
          tags: task.tags.map(tag => {
            const newTagId = tagIdMap.get(tag.id);
            if (!newTagId) return tag;
            
            return {
              ...tag,
              id: newTagId
            };
          })
        }));
        
        const importedMilestones = data.milestones.map(milestone => ({
          ...milestone,
          id: uuidv4()
        }));
        
        setTasks([...tasks, ...tasksWithUpdatedTagRefs]);
        setTags([...tags, ...importedTags]);
        setMilestones([...milestones, ...importedMilestones]);
        
      } catch (error) {
        console.error('Failed to parse import file:', error);
        alert('インポートに失敗しました。ファイル形式を確認してください。');
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };
  
  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const startX = e.clientX;
    const startPosition = splitPosition;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const newPosition = startPosition + ((e.clientX - startX) / containerWidth) * 100;
      
      const limitedPosition = Math.min(Math.max(newPosition, 30), 80);
      setSplitPosition(limitedPosition);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTagColumnDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const startX = e.clientX;
    const startWidth = tagColumnWidth;
    
    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(150, Math.min(400, startWidth + diff));
      setTagColumnWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };

  const handleTitleSave = () => {
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitle('TODO');
      setIsEditingTitle(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-2 py-2 flex justify-between items-center">
          <div className="flex items-center">
            <Layout className="h-5 w-5 mr-2 text-blue-600" />
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="text-lg font-bold text-gray-800 border rounded px-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <h1 
                className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-600"
                onClick={handleTitleClick}
              >
                {title}
              </h1>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleOrganizeTasks}
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center text-sm"
            >
              <List className="h-4 w-4 mr-1" />
              整理
            </button>
            
            <label className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center text-sm cursor-pointer">
              <Download className="h-4 w-4 mr-1" />
              インポート
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleExport}
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center text-sm"
            >
              <Upload className="h-4 w-4 mr-1" />
              エクスポート
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-2 py-4 flex-grow">
        <TaskInput 
          existingTags={tags} 
          onAddTask={handleAddTask} 
          onAddTags={handleAddTags} 
        />
        
        <div className="flex items-center mb-2">
          <span className="text-sm font-medium text-gray-700 mr-2">フィルタ：</span>
          <TagFilter 
            tags={availableTags} 
            selectedTagIds={selectedTagIds} 
            onSelectTag={handleSelectTag} 
          />
        </div>
        
        <div 
          ref={containerRef}
          className="flex space-x-2 h-[calc(100vh-11rem)]"
        >
          <div 
            className="overflow-hidden"
            style={{ width: `${splitPosition}%` }}
          >
            <TaskList
              tasks={tasks}
              filteredTasks={sortedTasks}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              onReorderTasks={handleReorderTasks}
              onAddTag={handleAddTagToTask}
              existingTags={tags}
              sortDirection={sortDirection}
              onToggleSortDirection={handleToggleSortDirection}
              tagColumnWidth={tagColumnWidth}
              onTagColumnResize={handleTagColumnDividerMouseDown}
            />
          </div>
          
          <div 
            ref={dividerRef}
            className="w-1 bg-gray-300 hover:bg-blue-400 cursor-col-resize hover:w-2 transition-all flex-shrink-0"
            onMouseDown={handleDividerMouseDown}
          />
          
          <div 
            className="overflow-hidden"
            style={{ width: `${100 - splitPosition}%` }}
          >
            <CalendarView 
              tasks={tasks} 
              milestones={milestones}
              onAddMilestone={handleAddMilestone}
              onUpdateMilestone={handleUpdateMilestone}
              onDeleteMilestone={handleDeleteMilestone}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;