import React from 'react';
import { Milestone } from '../../types';
import { Flag } from 'lucide-react';

interface MilestoneListProps {
  milestones: Milestone[];
}

const MilestoneList: React.FC<MilestoneListProps> = ({ milestones }) => {
  const calculateDaysRemaining = (date: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [year, month, day] = date.split('/').map(Number);
    const milestoneDate = new Date(year, month - 1, day);
    milestoneDate.setHours(0, 0, 0, 0);
    
    const diffTime = milestoneDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const sortedMilestones = [...milestones].sort((a, b) => {
    const [yearA, monthA, dayA] = a.date.split('/').map(Number);
    const [yearB, monthB, dayB] = b.date.split('/').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="mt-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-purple-500" />
          <h2 className="text-sm font-medium">マイルストーン一覧</h2>
        </div>
      </div>
      
      {sortedMilestones.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-2">マイルストーンはありません</p>
      ) : (
        <div className="divide-y">
          {sortedMilestones.map(milestone => {
            const daysRemaining = calculateDaysRemaining(milestone.date);
            const isOverdue = daysRemaining < 0;
            const isToday = daysRemaining === 0;
            
            return (
              <div 
                key={milestone.id}
                className="flex items-center gap-4 px-4 py-2 hover:bg-gray-50"
              >
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <div className="font-medium">{milestone.title}</div>
                <div className="text-sm text-gray-600">{milestone.date}</div>
                <div 
                  className={`ml-auto text-sm font-medium ${
                    isOverdue ? 'text-red-600' :
                    isToday ? 'text-blue-600' :
                    'text-gray-600'
                  }`}
                >
                  {isOverdue ? `${Math.abs(daysRemaining)}日経過` :
                   isToday ? '今日' :
                   `あと${daysRemaining}日`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MilestoneList;