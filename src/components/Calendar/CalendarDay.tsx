import React from 'react';
import { Task, Milestone } from '../../types';

interface CalendarDayProps {
  date: string;
  day: number;
  currentMonth: boolean;
  tasks: Task[];
  milestones: Milestone[];
  onAddMilestone: (date: string) => void;
  onEditMilestone: (milestone: Milestone) => void;
  isToday: boolean;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  day,
  currentMonth,
  tasks,
  milestones,
  onAddMilestone,
  onEditMilestone,
  isToday
}) => {
  const tasksForDay = tasks.filter(task => task.deadline === date);
  const milestonesForDay = milestones.filter(milestone => milestone.date === date);
  
  const handleDayClick = () => {
    if (currentMonth) {
      onAddMilestone(date);
    }
  };

  return (
    <div 
      className={`min-h-[80px] border p-1 overflow-hidden ${
        currentMonth ? 'bg-white' : 'bg-gray-100'
      } ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}`}
      onClick={handleDayClick}
    >
      <div 
        className={`text-right text-sm font-medium mb-1 ${
          currentMonth ? (isToday ? 'text-blue-500' : 'text-gray-700') : 'text-gray-400'
        }`}
      >
        {day}
      </div>
      
      <div className="space-y-1 overflow-y-auto max-h-[60px]">
        {milestonesForDay.map(milestone => (
          <div 
            key={milestone.id}
            className="bg-purple-100 border-l-4 border-purple-500 px-1 py-0.5 text-xs truncate cursor-pointer hover:bg-purple-200"
            onClick={(e) => {
              e.stopPropagation();
              onEditMilestone(milestone);
            }}
          >
            {milestone.title}
          </div>
        ))}
        
        {tasksForDay.map(task => {
          const firstTagColor = task.tags[0]?.color;
          const baseColor = firstTagColor || '#3b82f6'; // デフォルトは青色
          
          return (
            <div 
              key={task.id}
              className={`border-l-4 px-1 py-0.5 text-xs truncate ${
                task.completed 
                  ? 'bg-gray-100 border-gray-400 text-gray-500 line-through' 
                  : 'bg-opacity-10 text-opacity-90'
              }`}
              style={{
                borderLeftColor: baseColor,
                backgroundColor: task.completed ? undefined : `${baseColor}15`,
                color: task.completed ? undefined : baseColor
              }}
            >
              {task.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarDay;