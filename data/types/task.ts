// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  status: "pending" | "in_progress" | "completed" | "overdue";
  type: TaskType;
  assignedTo: string;
  relatedTo: string;
  relatedToId?: string;
  relatedToType?: "contact" | "company" | "deal" | "project";
  createdAt: string;
  reminder: boolean;
  reminderTime?: string;
  completedAt: string | null;
  tags?: string[];
  notes?: string;
  attachments?: number;
  timeEstimate?: string;
  actualTimeSpent?: string;
  followUpDate?: string;
  location?: string;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
  createdBy: string;
}

export type TaskType =
  | "call"
  | "email"
  | "meeting"
  | "report"
  | "demo"
  | "follow_up"
  | "proposal"
  | "contract"
  | "payment"
  | "documentation"
  | "training"
  | "review"
  | "admin"
  | "other";

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
  priority: "High" | "Medium" | "Low";
  type: TaskType;
  assignedTo: string;
  relatedTo: string;
  relatedToType?: "contact" | "company" | "deal" | "project";
  reminder: boolean;
  reminderTime?: string;
  tags: string[];
  notes?: string;
  timeEstimate?: string;
  location?: string;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
}

// API Task Types (from your api.ts)
export interface APITask {
  _id: string;
  userId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate: string;
  reminderDate?: string;
  completedAt?: string;
  contactId?: string;
  leadId?: string;
  createdAt: string;
  updatedAt: string;
}

// data/types/task.ts में
export interface TaskPayload {
  title: string;
  description?: string;

  // Allow both formats
  priority?: "low" | "medium" | "high" | "urgent" | "Low" | "Medium" | "High";

  dueDate: string;
  reminderDate?: string;
  contactId?: string;
  leadId?: string;

  // Add new fields
  type?: TaskType;
  assignedTo?: string;
  relatedTo?: string;
  relatedToType?: "contact" | "company" | "deal" | "project";
  reminder?: boolean;
  reminderTime?: string;
  tags?: string[];
  notes?: string;
  timeEstimate?: string;
  location?: string;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
  metadata?: Record<string, any>;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate?: string;
  reminderDate?: string;
  contactId?: string;
  leadId?: string;
}

export interface BulkStatusUpdatePayload {
  taskIds: string[];
  status: "pending" | "in_progress" | "completed" | "cancelled";
}

export interface TasksResponse {
  success: boolean;
  count: number;
  data: APITask[];
}

export interface TaskResponse {
  message: any;
  success: boolean;
  data: APITask;
}

export interface StatsResponse {
  success: boolean;
  data: {
    statusStats: Record<string, number>;
    priorityStats: Record<string, number>;
    todayTasks: number;
    overdueTasks: number;
    totalTasks: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Task Filter Types
export type TaskStatusFilter =
  | "all"
  | "pending"
  | "in_progress"
  | "completed"
  | "overdue";

export type TaskPriorityFilter = "All" | "High" | "Medium" | "Low";

export type TaskViewMode = "list" | "calendar";

// Task Stats Interface
export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  todayTasks: number;
  highPriorityTasks: number;
}

// Bulk Action Types
export interface BulkActionPayload {
  taskIds: string[];
  action: "complete" | "delete" | "status_update";
  status?: "pending" | "in_progress" | "completed" | "overdue";
}

// Task Analytics Types
export interface TaskAnalytics {
  statusDistribution: {
    pending: number;
    in_progress: number;
    completed: number;
    overdue: number;
  };
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  completionRate: number;
  averageCompletionTime: number;
  upcomingDeadlines: number;
}

// Task Context Types
export interface TasksContextType {
  tasks: Task[];
  stats: TaskStats;
  loading: boolean;
  refreshing: boolean;
  searchQuery: string;
  selectedStatus: TaskStatusFilter;
  selectedPriority: TaskPriorityFilter;
  viewMode: TaskViewMode;
  fetchTasks: (filters?: QueryParams) => Promise<void>;
  fetchStats: () => Promise<void>;
  onRefresh: () => Promise<void>;
  handleAddTask: (taskData: TaskFormData) => Promise<boolean>;
  handleTaskPress: (taskId: string) => void;
  handleCompleteTask: (taskId: string) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  handleUpdateTaskStatus: (
    taskId: string,
    newStatus: "pending" | "in_progress" | "completed" | "overdue",
  ) => Promise<void>;
  handleBulkUpdate: (
    taskIds: string[],
    status: "pending" | "in_progress" | "completed" | "overdue",
  ) => Promise<void>;
  handleSearch: (query: string) => Promise<void>;
  handleStatusFilter: (status: TaskStatusFilter) => Promise<void>;
  handlePriorityFilter: (priority: TaskPriorityFilter) => Promise<void>;
  handleTodayTasks: () => Promise<void>;
  handleUpcomingTasks: () => Promise<void>;
  setViewMode: (mode: TaskViewMode) => void;
}

// Helper Types for Mapping
export type APIPriority = "low" | "medium" | "high" | "urgent";
export type LocalPriority = "High" | "Medium" | "Low";

export type APIStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type LocalStatus = "pending" | "in_progress" | "completed" | "overdue";
