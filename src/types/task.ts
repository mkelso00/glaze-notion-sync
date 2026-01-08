export type TaskStatus =
  | 'Pending Review'
  | 'In Progress'
  | 'Completed'
  | 'On Hold'
  | 'Not Started';

export type TaskPriority = 'High' | 'Medium' | 'Low';

export type TaskCategory = 'Design' | 'Development' | 'Navigation' | 'Shopify Functions' | 'Other';

export interface Task {
  id: string;
  title: string;
  aiTitle?: string;
  status: TaskStatus;
  dueDate: string | null;
  priority: TaskPriority;
  hours: number;
  hoursUsed: number;
  client: string | null;
  category: TaskCategory;
  parentTaskId: string | null;
  subTaskIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TimesheetEntry {
  id: string;
  taskId: string;
  taskName: string;
  hours: number;
  minutes: number;
  category: TaskCategory;
  date: string;
}

export interface ClientDashboard {
  clientName: string;
  totalHours: number;
  usedHours: number;
  remainingHours: number;
  tasks: Task[];
  timesheetEntries: TimesheetEntry[];
}
