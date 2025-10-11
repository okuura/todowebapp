import React, { useState, useEffect } from 'react';
import { Milestone } from '../../types';
import { X } from 'lucide-react';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  onDelete: () => void;
  date: string;
  milestone: Milestone | null;
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  date,
  milestone
}) => {
  const [title, setTitle] = useState('');
  
  useEffect(() => {
    if (milestone) {
      setTitle(milestone.title);
    } else {
      setTitle('');
    }
  }, [milestone]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title.trim());
    }
  };
  
  if (!isOpen) return null;
  
  const formattedDate = date.replace(/\//g, '-');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {milestone ? 'マイルストーンを編集' : 'マイルストーンを追加'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日付
            </label>
            <div className="p-2 bg-gray-100 rounded">
              {formattedDate}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="マイルストーン名"
              autoFocus
            />
          </div>
          
          <div className="flex justify-between">
            {milestone && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                削除
              </button>
            )}
            <div className={milestone ? '' : 'ml-auto'}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded mr-2 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilestoneModal;