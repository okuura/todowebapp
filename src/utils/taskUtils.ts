import { Task, Tag } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { formatDate, isValidDate } from './dateUtils';

export const TAG_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#84cc16', // Lime
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
];

export const parseTaskInput = (input: string, existingTags: Tag[]): { 
  content: string;
  tagNames: string[];
  deadline?: string;
} => {
  const parts = input.split(',').map(part => part.trim());
  
  // 最後の部分が日付形式かチェック
  let deadline: string | undefined;
  let remainingParts = [...parts];
  
  const lastPart = parts[parts.length - 1];
  if (/^\d{4}$/.test(lastPart) || /^\d{8}$/.test(lastPart) || lastPart.includes('/')) {
    if (isValidDate(lastPart)) {
      deadline = formatDate(lastPart);
      remainingParts.pop();
    }
  }
  
  // タグとタスク内容を分離
  // 最後の要素をタスク内容とし、それ以外をタグとして扱う
  const content = remainingParts.pop() || '';
  const tagNames = remainingParts;
  
  return { content, tagNames, deadline };
};

export const createTask = (input: string, existingTags: Tag[]): Task => {
  const { content, tagNames, deadline } = parseTaskInput(input, existingTags);
  
  const tags: Tag[] = tagNames.map(name => {
    const existingTag = existingTags.find(
      tag => tag.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingTag) {
      return existingTag;
    }
    
    return {
      id: uuidv4(),
      name,
      color: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]
    };
  });
  
  return {
    id: uuidv4(),
    content,
    completed: false,
    tags,
    deadline
  };
};

export const sortTasksByDeadline = (tasks: Task[], ascending = true): Task[] => {
  // まず完了状態でグループ分け
  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  // それぞれのグループを期限でソート
  const sortByDate = (a: Task, b: Task) => {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return ascending ? 1 : -1;
    if (!b.deadline) return ascending ? -1 : 1;
    
    const dateA = a.deadline.split('/').map(Number);
    const dateB = b.deadline.split('/').map(Number);
    
    if (dateA[0] !== dateB[0]) {
      return ascending ? dateA[0] - dateB[0] : dateB[0] - dateA[0];
    }
    
    if (dateA[1] !== dateB[1]) {
      return ascending ? dateA[1] - dateB[1] : dateB[1] - dateA[1];
    }
    
    return ascending ? dateA[2] - dateB[2] : dateB[2] - dateA[2];
  };

  // 各グループをソート
  const sortedIncompleteTasks = [...incompleteTasks].sort(sortByDate);
  const sortedCompletedTasks = [...completedTasks].sort(sortByDate);

  // 未完了タスクを先に、完了タスクを後ろに配置
  return [...sortedIncompleteTasks, ...sortedCompletedTasks];
};

export const organizeTasks = (tasks: Task[]): Task[] => {
  // 完了状態でグループ分け
  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  // 未完了タスクを先に、完了タスクを後ろに配置
  return [...incompleteTasks, ...completedTasks];
};