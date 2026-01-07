export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  type: TaskType;
  assignedTo: string;
  relatedTo: string;
  relatedToId?: string;
  relatedToType?: 'contact' | 'company' | 'deal' | 'project';
  createdAt: string;
  reminder: boolean;
  reminderTime?: string;
  completedAt: string | null;
  tags?: string[];
  notes?: string;
  attachments?: number;
  timeEstimate?: string; // e.g., "2 hours"
  actualTimeSpent?: string;
  followUpDate?: string;
  location?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  createdBy: string;
}

export type TaskType = 
  | 'call' 
  | 'email' 
  | 'meeting' 
  | 'report' 
  | 'demo' 
  | 'follow_up'
  | 'proposal'
  | 'contract'
  | 'payment'
  | 'documentation'
  | 'training'
  | 'review'
  | 'admin'
  | 'other';

export interface TaskFilter {
  search: string;
  status: string;
  priority: string;
  type: string;
  assignedTo: string;
  dateRange: {
    start: string;
    end: string;
  };
  tags: string[];
}

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  type: TaskType;
  assignedTo: string;
  relatedTo: string;
  relatedToType?: 'contact' | 'company' | 'deal' | 'project';
  reminder: boolean;
  reminderTime?: string;
  tags: string[];
  notes?: string;
  timeEstimate?: string;
  location?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}