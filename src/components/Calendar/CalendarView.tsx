import React, { useState } from 'react';
import { Task, Milestone } from '../../types';
import { getCalendarData, getCurrentDate } from '../../utils/dateUtils';
import CalendarDay from './CalendarDay';
import MilestoneModal from './MilestoneModal';
import MilestoneList from './MilestoneList';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  milestones: Milestone[];
  onAddMilestone: (milestone: Milestone) => void;
  onUpdateMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  milestones,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  
  const calendarDays = getCalendarData(currentYear, currentMonth);
  const currentDate = getCurrentDate();
  
  const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
  
  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const goToCurrentMonth = () => {
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
  };
  
  const handleAddMilestone = (date: string) => {
    setSelectedDate(date);
    setSelectedMilestone(null);
    setModalOpen(true);
  };
  
  const handleEditMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setSelectedDate(milestone.date);
    setModalOpen(true);
  };
  
  const handleSaveMilestone = (title: string) => {
    if (selectedMilestone) {
      // Update existing milestone
      onUpdateMilestone({
        ...selectedMilestone,
        title
      });
    } else {
      // Add new milestone
      onAddMilestone({
        id: Date.now().toString(),
        date: selectedDate,
        title
      });
    }
    setModalOpen(false);
  };
  
  const handleDeleteMilestone = () => {
    if (selectedMilestone) {
      onDeleteMilestone(selectedMilestone.id);
    }
    setModalOpen(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
      <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
        <div className="text-lg font-medium">
          {currentYear}年{currentMonth}月
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={goToPreviousMonth}
            className="p-1 rounded hover:bg-gray-200"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={goToCurrentMonth}
            className="p-1 rounded hover:bg-gray-200"
          >
            <Calendar size={20} />
          </button>
          <button 
            onClick={goToNextMonth}
            className="p-1 rounded hover:bg-gray-200"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7">
          {daysOfWeek.map((day, index) => (
            <div 
              key={index} 
              className={`p-2 text-center font-medium text-sm ${
                index === 0 ? 'text-red-500' : 
                index === 6 ? 'text-blue-500' : 'text-gray-800'
              }`}
            >
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => (
            <CalendarDay
              key={index}
              date={day.date}
              day={day.day}
              currentMonth={day.currentMonth}
              tasks={tasks}
              milestones={milestones}
              onAddMilestone={handleAddMilestone}
              onEditMilestone={handleEditMilestone}
              isToday={day.date === currentDate}
            />
          ))}
        </div>
        
        <MilestoneList milestones={milestones} />
      </div>
      
      {modalOpen && (
        <MilestoneModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveMilestone}
          onDelete={handleDeleteMilestone}
          date={selectedDate}
          milestone={selectedMilestone}
        />
      )}
    </div>
  );
};

export default CalendarView;