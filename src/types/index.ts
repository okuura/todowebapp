export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  content: string;
  completed: boolean;
  priority: boolean;
  tags: Tag[];
  deadline?: string; // YYYY/MM/DD format
}

export interface Milestone {
  id: string;
  date: string; // YYYY/MM/DD format
  title: string;
}

export interface AppData {
  tasks: Task[];
  tags: Tag[];
  milestones: Milestone[];
}