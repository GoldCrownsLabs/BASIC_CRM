import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import {
  getTasks,
  getTaskStats,
  createTask,
  deleteTask,
  markTaskAsCompleted,
  updateTask,
  bulkUpdateTaskStatus,
  searchTasks,
  getOverdueTasks,
  getTasksByPriority,
  getTasksByStatus,
  getTodayTasks,
  getUpcomingTasks,
} from "@/lib/api/tasks.api";
import {
  APITask,
  BulkStatusUpdatePayload,
  LocalStatus,
  QueryParams,
  Task,
  TaskFormData,
  TaskPriorityFilter,
  TaskStats,
  TaskStatusFilter,
  TaskViewMode,
} from "@/data/types/task";
import {
  mapApiTaskToLocal,
  mapLocalTaskToApi,
  mapPriorityToApi,
  mapStatusToApi,
} from "@/utils/task.utils";

export const useTasks = () => {
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatusFilter>("all");
  const [selectedPriority, setSelectedPriority] =
    useState<TaskPriorityFilter>("All");
  const [viewMode, setViewMode] = useState<TaskViewMode>("list");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    todayTasks: 0,
    highPriorityTasks: 0,
  });

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const fetchTasks = async (filters?: QueryParams) => {
    try {
      setLoading(true);
      const response = await getTasks(filters);

      if (response.success) {
        const apiTasks = response.data as APITask[];
        const mappedTasks = apiTasks.map(mapApiTaskToLocal);
        setTasks(mappedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      Alert.alert("Error", "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getTaskStats();
      if (response.success) {
        const statsData = response.data;
        setStats({
          totalTasks: statsData.totalTasks || 0,
          completedTasks: statsData.statusStats?.completed || 0,
          pendingTasks: statsData.statusStats?.pending || 0,
          inProgressTasks: statsData.statusStats?.in_progress || 0,
          overdueTasks: statsData.overdueTasks || 0,
          todayTasks: statsData.todayTasks || 0,
          highPriorityTasks: statsData.priorityStats?.high || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleAddTask = async (taskData: TaskFormData): Promise<boolean> => {
    try {
      const apiPayload = mapLocalTaskToApi(taskData);
      const response = await createTask(apiPayload);

      if (response.success) {
        const newTask = mapApiTaskToLocal(response.data);
        setTasks((prev) => [newTask, ...prev]);
        await fetchStats();
        Alert.alert("Success", "Task created successfully");
        return true;
      } else {
        Alert.alert("Error", "Failed to create task");
        return false;
      }
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("Error", "Failed to create task");
      return false;
    }
  };

  const handleTaskPress = async (taskId: string) => {
    try {
      // Check if you're using Expo Router file-based routing
      // If your task detail page is at app/(tools)/tasks/[id].tsx
      router.push(`/tasks/${taskId}`);

      // OR if it's in a different location, try one of these:
      // router.push(`/(tools)/tasks/${taskId}`);
      // router.push({ pathname: "/tasks/[id]", params: { id: taskId } });
    } catch (error) {
      console.error("Error navigating to task:", error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await markTaskAsCompleted(taskId);
      if (response.success) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: "completed",
                  completedAt: new Date().toISOString().split("T")[0],
                }
              : task,
          ),
        );
        await fetchStats();
      }
    } catch (error) {
      console.error("Error completing task:", error);
      Alert.alert("Error", "Failed to complete task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await deleteTask(taskId);
            if (response.success) {
              setTasks((prev) => prev.filter((task) => task.id !== taskId));
              await fetchStats();
              Alert.alert("Success", "Task deleted successfully");
            }
          } catch (error) {
            console.error("Error deleting task:", error);
            Alert.alert("Error", "Failed to delete task");
          }
        },
      },
    ]);
  };

  const handleUpdateTaskStatus = async (
    taskId: string,
    newStatus: LocalStatus,
  ) => {
    try {
      const apiStatus = mapStatusToApi(newStatus);
      const response = await updateTask(taskId, { status: apiStatus });
      if (response.success) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: newStatus,
                  completedAt:
                    newStatus === "completed"
                      ? new Date().toISOString().split("T")[0]
                      : task.completedAt,
                }
              : task,
          ),
        );
        await fetchStats();
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      Alert.alert("Error", "Failed to update task status");
    }
  };

  const handleBulkUpdate = async (taskIds: string[], status: LocalStatus) => {
    try {
      const apiStatus = mapStatusToApi(status);
      const payload: BulkStatusUpdatePayload = { taskIds, status: apiStatus };
      const response = await bulkUpdateTaskStatus(payload);
      if (response.success) {
        await fetchTasks();
        await fetchStats();
        Alert.alert(
          "Success",
          response.message || "Tasks updated successfully",
        );
      }
    } catch (error) {
      console.error("Error in bulk update:", error);
      Alert.alert("Error", "Failed to update tasks");
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const response = await searchTasks(query);
        if (response.success) {
          const apiTasks = response.data as APITask[];
          const mappedTasks = apiTasks.map(mapApiTaskToLocal);
          setTasks(mappedTasks);
        }
      } catch (error) {
        console.error("Error searching tasks:", error);
      }
    } else {
      await fetchTasks();
    }
  };

  const handleStatusFilter = async (status: TaskStatusFilter) => {
    setSelectedStatus(status);
    if (status === "all") {
      await fetchTasks();
    } else if (status === "overdue") {
      try {
        const response = await getOverdueTasks();
        if (response.success) {
          const apiTasks = response.data as APITask[];
          const mappedTasks = apiTasks.map(mapApiTaskToLocal);
          setTasks(mappedTasks);
        }
      } catch (error) {
        console.error("Error fetching overdue tasks:", error);
      }
    } else {
      try {
        const apiStatus = mapStatusToApi(status);
        const response = await getTasksByStatus(apiStatus);
        if (response.success) {
          const apiTasks = response.data as APITask[];
          const mappedTasks = apiTasks.map(mapApiTaskToLocal);
          setTasks(mappedTasks);
        }
      } catch (error) {
        console.error(`Error fetching ${status} tasks:`, error);
      }
    }
  };

  const handlePriorityFilter = async (priority: TaskPriorityFilter) => {
    setSelectedPriority(priority);
    if (priority === "All") {
      await fetchTasks();
    } else {
      try {
        const apiPriority = mapPriorityToApi(priority);
        const response = await getTasksByPriority(apiPriority);
        if (response.success) {
          const apiTasks = response.data as APITask[];
          const mappedTasks = apiTasks.map(mapApiTaskToLocal);
          setTasks(mappedTasks);
        }
      } catch (error) {
        console.error(`Error fetching ${priority} priority tasks:`, error);
      }
    }
  };

  const handleTodayTasks = async () => {
    try {
      const response = await getTodayTasks();
      if (response.success) {
        const apiTasks = response.data as APITask[];
        const mappedTasks = apiTasks.map(mapApiTaskToLocal);
        setTasks(mappedTasks);
        setSelectedStatus("all");
        setSelectedPriority("All");
      }
    } catch (error) {
      console.error("Error fetching today's tasks:", error);
    }
  };

  const handleUpcomingTasks = async () => {
    try {
      const response = await getUpcomingTasks();
      if (response.success) {
        const apiTasks = response.data as APITask[];
        const mappedTasks = apiTasks.map(mapApiTaskToLocal);
        setTasks(mappedTasks);
        setSelectedStatus("all");
        setSelectedPriority("All");
      }
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error);
    }
  };

  return {
    refreshing,
    loading,
    searchQuery,
    selectedStatus,
    selectedPriority,
    viewMode,
    tasks,
    stats,
    setViewMode,
    fetchTasks,
    fetchStats,
    onRefresh,
    handleAddTask,
    handleTaskPress,
    handleCompleteTask,
    handleDeleteTask,
    handleUpdateTaskStatus,
    handleBulkUpdate,
    handleSearch,
    handleStatusFilter,
    handlePriorityFilter,
    handleTodayTasks,
    handleUpcomingTasks,
  };
};
