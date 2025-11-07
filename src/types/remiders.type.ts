export type ReminderStatus = 'todo' | 'in-progress' | 'done';
export type ReminderPriority = 'low' | 'medium' | 'high';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  status: ReminderStatus;
  priority: ReminderPriority;
  dueDate?: Date;
  tags: string[];
  projectId?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  completed: boolean;
  notes?: string;
}
