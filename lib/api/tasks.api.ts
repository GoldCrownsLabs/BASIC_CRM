import { APIPriority, APIStatus, BulkStatusUpdatePayload, QueryParams, StatsResponse, TaskPayload, TaskResponse, TasksResponse, TaskUpdatePayload, TaskFormData } from "@/data/types/task";
import api from "./index";


/**
 * Get all tasks with optional filters
 */
export const getTasks = async (
  params?: QueryParams,
): Promise<TasksResponse> => {
  try {
    const response = await api.get("/tasks", { params });
    return response.data;
  } catch (error) {
    console.error("Get tasks error:", error);
    throw error;
  }
};

/**
 * Get a single task by ID
 */
export const getTask = async (id: string): Promise<TaskResponse> => {
  try {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Get task ${id} error:`, error);
    throw error;
  }
};

/**
 * Create a new task
 */
export const createTask = async (
  payload: TaskPayload,
): Promise<TaskResponse> => {
  try {
    const response = await api.post("/tasks", payload);
    return response.data;
  } catch (error) {
    console.error("Create task error:", error);
    throw error;
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (
  id: string,
  payload: TaskUpdatePayload,
): Promise<TaskResponse> => {
  try {
    const response = await api.put(`/tasks/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Update task ${id} error:`, error);
    throw error;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (
  id: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Delete task ${id} error:`, error);
    throw error;
  }
};

/**
 * Bulk update task status
 */
export const bulkUpdateTaskStatus = async (
  payload: BulkStatusUpdatePayload,
): Promise<{
  success: boolean;
  message: string;
  modifiedCount: number;
}> => {
  try {
    const response = await api.patch("/tasks/bulk-status", payload);
    return response.data;
  } catch (error) {
    console.error("Bulk update task status error:", error);
    throw error;
  }
};

/**
 * Get today's tasks
 */
export const getTodayTasks = async (): Promise<TasksResponse> => {
  try {
    const response = await api.get("/tasks/analytics/today");
    return response.data;
  } catch (error) {
    console.error("Get today's tasks error:", error);
    throw error;
  }
};

/**
 * Get overdue tasks
 */
export const getOverdueTasks = async (): Promise<TasksResponse> => {
  try {
    const response = await api.get("/tasks/analytics/overdue");
    return response.data;
  } catch (error) {
    console.error("Get overdue tasks error:", error);
    throw error;
  }
};

/**
 * Get upcoming tasks (next 7 days)
 */
export const getUpcomingTasks = async (): Promise<TasksResponse> => {
  try {
    const response = await api.get("/tasks/analytics/upcoming");
    return response.data;
  } catch (error) {
    console.error("Get upcoming tasks error:", error);
    throw error;
  }
};

/**
 * Get task statistics
 */
export const getTaskStats = async (): Promise<StatsResponse> => {
  try {
    const response = await api.get("/tasks/analytics/stats");
    return response.data;
  } catch (error) {
    console.error("Get task stats error:", error);
    throw error;
  }
};

/**
 * Mark task as completed
 */
export const markTaskAsCompleted = async (
  id: string,
): Promise<TaskResponse> => {
  try {
    const response = await api.put(`/tasks/${id}`, { status: "completed" });
    return response.data;
  } catch (error) {
    console.error(`Mark task ${id} as completed error:`, error);
    throw error;
  }
};

/**
 * Mark task as in progress
 */
export const markTaskAsInProgress = async (
  id: string,
): Promise<TaskResponse> => {
  try {
    const response = await api.put(`/tasks/${id}`, { status: "in_progress" });
    return response.data;
  } catch (error) {
    console.error(`Mark task ${id} as in progress error:`, error);
    throw error;
  }
};

/**
 * Update task reminder
 */
export const updateTaskReminder = async (
  id: string,
  reminderDate: string,
): Promise<TaskResponse> => {
  try {
    const response = await api.put(`/tasks/${id}`, { reminderDate });
    return response.data;
  } catch (error) {
    console.error(`Update task ${id} reminder error:`, error);
    throw error;
  }
};

/**
 * Search tasks by title or description
 */
export const searchTasks = async (
  searchTerm: string,
  params?: QueryParams,
): Promise<TasksResponse> => {
  try {
    const response = await api.get("/tasks", {
      params: { ...params, search: searchTerm },
    });
    return response.data;
  } catch (error) {
    console.error("Search tasks error:", error);
    throw error;
  }
};

/**
 * Get tasks by status
 */
export const getTasksByStatus = async (
  status: APIStatus,
): Promise<TasksResponse> => {
  try {
    const response = await api.get("/tasks", { params: { status } });
    return response.data;
  } catch (error) {
    console.error(`Get tasks by status ${status} error:`, error);
    throw error;
  }
};

/**
 * Get tasks by priority
 */
export const getTasksByPriority = async (
  priority: APIPriority,
): Promise<TasksResponse> => {
  try {
    const response = await api.get("/tasks", { params: { priority } });
    return response.data;
  } catch (error) {
    console.error(`Get tasks by priority ${priority} error:`, error);
    throw error;
  }
};
