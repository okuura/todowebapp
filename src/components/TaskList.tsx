import React from 'react';
import { Task, Tag } from '../types';
import TaskItem from './TaskItem';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ArrowUp, ArrowDown } from 'lucide-react';
import SortableTaskItem from './SortableTaskItem';

interface TaskListProps {
  tasks: Task[];
  filteredTasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onAddTag: (taskId: string, tag: Tag) => void;
  existingTags: Tag[];
  sortDirection: 'asc' | 'desc' | null;
  onToggleSortDirection: () => void;
  tagColumnWidth: number;
  onTagColumnResize: (e: React.MouseEvent) => void;
  onClearSort: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  filteredTasks,
  onToggleComplete,
  onDelete,
  onUpdateTask,
  onReorderTasks,
  onAddTag,
  existingTags,
  sortDirection,
  onToggleSortDirection,
  tagColumnWidth,
  onTagColumnResize,
  onClearSort
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = filteredTasks.findIndex((task) => task.id === active.id);
    const newIndex = filteredTasks.findIndex((task) => task.id === over.id);

    if (oldIndex === newIndex) {
      return;
    }

    if (sortDirection !== null) {
      onClearSort();
    }

    const reorderedFiltered = arrayMove(filteredTasks, oldIndex, newIndex);

    const reorderedIds = new Set(reorderedFiltered.map(task => task.id));
    const remainingTasks = tasks.filter(task => !reorderedIds.has(task.id));

    onReorderTasks([...reorderedFiltered, ...remainingTasks]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center py-1.5 px-2 bg-gray-50 border-b text-xs font-medium text-gray-700">
        <div style={{ width: '40px' }}>済</div>
        <div
          style={{ width: `${tagColumnWidth}px` }}
          className="flex items-center relative"
        >
          タグ
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400"
            onMouseDown={onTagColumnResize}
          />
        </div>
        <div className="flex-1">タスク</div>
        <div className="w-28 flex items-center">
          期限
          <button
            onClick={onToggleSortDirection}
            className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {sortDirection === 'asc' ? <ArrowUp size={12} /> :
             sortDirection === 'desc' ? <ArrowDown size={12} /> :
             <span className="w-3 h-3"></span>}
          </button>
        </div>
        <div className="w-8"></div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredTasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="bg-white">
            {filteredTasks.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                タスクがありません
              </div>
            ) : (
              filteredTasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onUpdateTask={onUpdateTask}
                  onAddTag={onAddTag}
                  existingTags={existingTags}
                  tagColumnWidth={tagColumnWidth}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default TaskList;
