import AddTaskModal from "@/components/Modal/AddTaskModal";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { priorities, taskStatuses, taskTypes } from "@/data/tasks";
import { Task, TaskType } from "@/data/types/task";
import {
  BulkStatusUpdatePayload,
  bulkUpdateTaskStatus,
  createTask,
  deleteTask,
  getOverdueTasks,
  getTasks,
  getTasksByPriority,
  getTasksByStatus,
  getTaskStats,
  getTodayTasks,
  getUpcomingTasks,
  markTaskAsCompleted,
  QueryParams,
  searchTasks,
  TaskPayload,
  Task as APITask,
  updateTask,
} from "@/lib/api/tasks.api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper function to map API task to local task format
const mapApiTaskToLocal = (apiTask: APITask): Task => {
  // Determine priority mapping
  let priority: "High" | "Medium" | "Low";
  switch (apiTask.priority) {
    case "high":
    case "urgent":
      priority = "High";
      break;
    case "medium":
      priority = "Medium";
      break;
    case "low":
    default:
      priority = "Low";
      break;
  }

  // Determine status mapping
  let status: "pending" | "in_progress" | "completed" | "overdue";
  switch (apiTask.status) {
    case "pending":
      status = "pending";
      break;
    case "in_progress":
      status = "in_progress";
      break;
    case "completed":
      status = "completed";
      break;
    case "cancelled":
    default:
      status = "pending"; // Default to pending for cancelled
      break;
  }

  let relatedToType: "contact" | "company" | "deal" | "project" | undefined;
  let type: TaskType = "other";

  if (apiTask.leadId) {
    type = "call";
    relatedToType = "contact"; // If "lead" is not in your Task type, keep as "contact"
  } else if (apiTask.contactId) {
    type = "call";
    relatedToType = "contact";
  }
  // For other cases, type remains "other" as default

  // Determine if task is overdue
  const dueDate = new Date(apiTask.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  if (status === "pending" && dueDate < today) {
    status = "overdue";
  }

  return {
    id: apiTask._id,
    title: apiTask.title,
    description: apiTask.description || "",
    dueDate: apiTask.dueDate.split("T")[0], // Keep only date part
    priority,
    status,
    type,
    assignedTo: "Me", // Default since API doesn't have this
    relatedTo: apiTask.leadId || apiTask.contactId || "",
    relatedToType,
    createdAt: apiTask.createdAt.split("T")[0],
    reminder: !!apiTask.reminderDate,
    reminderTime: apiTask.reminderDate || "",
    completedAt: apiTask.completedAt ? apiTask.completedAt.split("T")[0] : null,
    tags: [],
    notes: "",
    timeEstimate: "",
    location: "",
    recurrence: "none" as const, // Change from "" to "none"
    createdBy: "API User",
  };
};

// Helper function to map local task to API payload
const mapLocalTaskToApi = (localTask: Partial<Task>): TaskPayload => {
  // Determine priority mapping
  let priority: "low" | "medium" | "high" | "urgent";
  switch (localTask.priority) {
    case "High":
      priority = "high";
      break;
    case "Medium":
      priority = "medium";
      break;
    case "Low":
    default:
      priority = "low";
      break;
  }

  // Handle reminder date properly
  let reminderDate;
  if (localTask.reminder && localTask.reminderTime) {
    try {
      // Check if reminderTime is a valid date string
      const reminder = new Date(localTask.reminderTime);
      if (!isNaN(reminder.getTime())) {
        reminderDate = reminder.toISOString();
      }
    } catch (error) {
      console.error("Invalid reminder date:", error);
    }
  }

 return {
   title: localTask.title!,
   description: localTask.description,
   priority,
   dueDate: new Date(localTask.dueDate!).toISOString(),
   reminderDate,
   // Only check for types that exist in relatedToType
   contactId:
     localTask.relatedToType === "contact" ? localTask.relatedTo : undefined,
   // Remove leadId since "lead" is not a valid relatedToType
   leadId: undefined,
 };
};

// Priority mapping helper functions
const mapPriorityToLocal = (apiPriority: string): "High" | "Medium" | "Low" => {
  switch (apiPriority) {
    case "high":
    case "urgent":
      return "High";
    case "medium":
      return "Medium";
    case "low":
    default:
      return "Low";
  }
};

const mapPriorityToApi = (
  localPriority: "High" | "Medium" | "Low",
): "low" | "medium" | "high" | "urgent" => {
  switch (localPriority) {
    case "High":
      return "high";
    case "Medium":
      return "medium";
    case "Low":
    default:
      return "low";
  }
};

// Status mapping helper functions
const mapStatusToLocal = (
  apiStatus: string,
): "pending" | "in_progress" | "completed" | "overdue" => {
  switch (apiStatus) {
    case "pending":
      return "pending";
    case "in_progress":
      return "in_progress";
    case "completed":
      return "completed";
    case "cancelled":
    default:
      return "pending";
  }
};

const mapStatusToApi = (
  localStatus: "pending" | "in_progress" | "completed" | "overdue",
): "pending" | "in_progress" | "completed" | "cancelled" => {
  switch (localStatus) {
    case "pending":
    case "overdue":
      return "pending";
    case "in_progress":
      return "in_progress";
    case "completed":
      return "completed";
    default:
      return "pending";
  }
};

export default function TasksScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showAddModal, setShowAddModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
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
        const mappedTasks = response.data.map(mapApiTaskToLocal);
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
        setStats({
          totalTasks: response.data.totalTasks,
          completedTasks: response.data.statusStats.completed || 0,
          pendingTasks: response.data.statusStats.pending || 0,
          inProgressTasks: response.data.statusStats.in_progress || 0,
          overdueTasks: response.data.overdueTasks,
          todayTasks: response.data.todayTasks,
          highPriorityTasks: response.data.priorityStats.high || 0,
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

  const handleAddTask = async (taskData: any) => {
    try {
      // Create proper date objects
      const dueDate = new Date(taskData.dueDate);

      // Handle reminder date properly
      let reminderDate;
      if (taskData.reminder && taskData.reminderTime) {
        // If reminderTime is just a time string (e.g., "10:00"), combine it with dueDate
        if (
          typeof taskData.reminderTime === "string" &&
          taskData.reminderTime.includes(":")
        ) {
          const [hours, minutes] = taskData.reminderTime.split(":");
          const reminder = new Date(taskData.dueDate);
          reminder.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          reminderDate = reminder.toISOString();
        } else {
          // If it's already a full date string
          reminderDate = new Date(taskData.reminderTime).toISOString();
        }
      }

      const apiPayload: TaskPayload = {
        title: taskData.title,
        description: taskData.description,
        priority: mapPriorityToApi(taskData.priority),
        dueDate: new Date(taskData.dueDate).toISOString(),
        // Temporarily disable reminderDate
        reminderDate: undefined,
        contactId:
          taskData.relatedToType === "contact" ? taskData.relatedTo : undefined,
        leadId:
          taskData.relatedToType === "lead" ? taskData.relatedTo : undefined,
      };

      const response = await createTask(apiPayload);
      if (response.success) {
        const newTask = mapApiTaskToLocal(response.data);
        setTasks((prev) => [newTask, ...prev]);
        await fetchStats();
        Alert.alert("Success", "Task created successfully");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("Error", "Failed to create task");
    }
  };
  const handleTaskPress = async (taskId: string) => {
    try {
      // Navigate to task detail screen with task ID
      router.push({
        pathname: "/(tools)/tasks/[id]",
        params: { id: taskId },
      } as any);
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
                  status: "completed" as const,
                  completedAt: new Date().toISOString().split("T")[0],
                }
              : task,
          ),
        );
        await fetchStats(); // Refresh stats
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
              await fetchStats(); // Refresh stats
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
    newStatus: "pending" | "in_progress" | "completed" | "overdue",
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
        await fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      Alert.alert("Error", "Failed to update task status");
    }
  };

  const handleBulkUpdate = async (
    taskIds: string[],
    status: "pending" | "in_progress" | "completed" | "overdue",
  ) => {
    try {
      const apiStatus = mapStatusToApi(status);
      const payload: BulkStatusUpdatePayload = { taskIds, status: apiStatus };
      const response = await bulkUpdateTaskStatus(payload);
      if (response.success) {
        // Refresh tasks after bulk update
        await fetchTasks();
        await fetchStats();
        Alert.alert("Success", response.message);
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
          const mappedTasks = response.data.map(mapApiTaskToLocal);
          setTasks(mappedTasks);
        }
      } catch (error) {
        console.error("Error searching tasks:", error);
      }
    } else {
      await fetchTasks(); // Reset to all tasks
    }
  };

  const handleStatusFilter = async (status: string) => {
    setSelectedStatus(status);
    if (status === "all") {
      await fetchTasks();
    } else if (status === "overdue") {
      try {
        const response = await getOverdueTasks();
        if (response.success) {
          const mappedTasks = response.data.map(mapApiTaskToLocal);
          setTasks(mappedTasks);
        }
      } catch (error) {
        console.error("Error fetching overdue tasks:", error);
      }
    } else {
      try {
        const apiStatus = mapStatusToApi(status as any);
        const response = await getTasksByStatus(apiStatus);
        if (response.success) {
          const mappedTasks = response.data.map(mapApiTaskToLocal);
          setTasks(mappedTasks);
        }
      } catch (error) {
        console.error(`Error fetching ${status} tasks:`, error);
      }
    }
  };

  const handlePriorityFilter = async (priority: string) => {
    setSelectedPriority(priority);
    if (priority === "All") {
      await fetchTasks();
    } else {
      try {
        const apiPriority = mapPriorityToApi(
          priority as "High" | "Medium" | "Low",
        );
        const response = await getTasksByPriority(apiPriority);
        if (response.success) {
          const mappedTasks = response.data.map(mapApiTaskToLocal);
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
        const mappedTasks = response.data.map(mapApiTaskToLocal);
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
        const mappedTasks = response.data.map(mapApiTaskToLocal);
        setTasks(mappedTasks);
        setSelectedStatus("all");
        setSelectedPriority("All");
      }
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error);
    }
  };

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Local filters (for additional filtering after API fetch)
    if (selectedType !== "All") {
      filtered = filtered.filter(
        (task) => task.type === selectedType.toLowerCase(),
      );
    }

    if (selectedAssignee !== "All") {
      filtered = filtered.filter(
        (task) => task.assignedTo === selectedAssignee,
      );
    }

    return filtered;
  }, [tasks, selectedType, selectedAssignee]);

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (task: Task) => {
    const daysUntilDue = getDaysUntilDue(task.dueDate);

    if (task.status === "completed") return "#4CAF50";
    if (task.status === "in_progress") return "#2196F3";
    if (task.status === "pending" || task.status === "overdue") {
      if (daysUntilDue < 0) return "#F44336";
      if (daysUntilDue <= 2) return "#FF9800";
      return "#FF9800";
    }
    return colors.textSecondary;
  };

  const getPriorityColor = (priority: "High" | "Medium" | "Low") => {
    switch (priority) {
      case "High":
        return "#F44336";
      case "Medium":
        return "#FF9800";
      case "Low":
        return "#4CAF50";
      default:
        return colors.textSecondary;
    }
  };

  const getTaskTypeIcon = (type: TaskType) => {
    return taskTypes[type] || taskTypes.other;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        weekday: "short",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const renderTaskItem = (task: Task) => {
    const daysUntilDue = getDaysUntilDue(task.dueDate);
    const statusColor = getStatusColor(task);
    const priorityColor = getPriorityColor(task.priority);
    const taskType = getTaskTypeIcon(task.type);
    const isOverdue = daysUntilDue < 0 && task.status !== "completed";
    const isDueSoon =
      daysUntilDue >= 0 && daysUntilDue <= 2 && task.status !== "completed";

    return (
      <TouchableOpacity
        key={task.id}
        onPress={() => handleTaskPress(task.id)}
        onLongPress={() => {
          Alert.alert("Task Actions", "What would you like to do?", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Mark as Complete",
              onPress: () => handleCompleteTask(task.id),
              style: "default",
            },
            {
              text: "Delete Task",
              onPress: () => handleDeleteTask(task.id),
              style: "destructive",
            },
            {
              text: "Edit",
              onPress: () => {
                // Navigate to edit screen or open edit modal
                console.log("Edit task:", task.id);
              },
            },
          ]);
        }}
        activeOpacity={0.7}
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          {/* Task Type Icon */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: taskType.color + "20",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Ionicons
              name={taskType.icon as any}
              size={20}
              color={taskType.color}
            />
          </View>

          {/* Task Info */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <ThemedText
                type="defaultSemiBold"
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: colors.text,
                  textDecorationLine:
                    task.status === "completed" ? "line-through" : "none",
                  opacity: task.status === "completed" ? 0.7 : 1,
                }}
                numberOfLines={1}
              >
                {task.title}
              </ThemedText>

              {/* Priority Badge */}
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: priorityColor + "20",
                  marginLeft: 8,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: priorityColor,
                  }}
                >
                  {task.priority}
                </ThemedText>
              </View>
            </View>

            {/* Description */}
            <ThemedText
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                lineHeight: 18,
                marginBottom: 8,
              }}
              numberOfLines={2}
            >
              {task.description}
            </ThemedText>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                {task.tags.slice(0, 3).map((tag, index) => (
                  <View
                    key={index}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: colors.primary + "15",
                    }}
                  >
                    <ThemedText style={{ fontSize: 10, color: colors.primary }}>
                      {tag}
                    </ThemedText>
                  </View>
                ))}
                {task.tags.length > 3 && (
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: colors.border,
                    }}
                  >
                    <ThemedText
                      style={{ fontSize: 10, color: colors.textSecondary }}
                    >
                      +{task.tags.length - 3}
                    </ThemedText>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Task Details */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 12,
          }}
        >
          {/* First Row: Due Date and Assignee */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <ThemedText
                  style={{
                    fontSize: 12,
                    color: isOverdue
                      ? "#F44336"
                      : isDueSoon
                        ? "#FF9800"
                        : colors.textSecondary,
                    fontWeight: isOverdue || isDueSoon ? "600" : "400",
                  }}
                >
                  {formatDate(task.dueDate)}
                  {isOverdue && " (Overdue)"}
                  {isDueSoon && !isOverdue && " (Due Soon)"}
                </ThemedText>
              </View>

              {task.timeEstimate && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    backgroundColor: colors.border,
                    borderRadius: 8,
                  }}
                >
                  <Ionicons
                    name="time-outline"
                    size={10}
                    color={colors.textSecondary}
                  />
                  <ThemedText
                    style={{ fontSize: 10, color: colors.textSecondary }}
                  >
                    {task.timeEstimate}
                  </ThemedText>
                </View>
              )}
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Ionicons
                name="person-outline"
                size={14}
                color={colors.textSecondary}
              />
              <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>
                {task.assignedTo}
              </ThemedText>
            </View>
          </View>

          {/* Second Row: Status and Related To */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              {/* Status Badge */}
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: statusColor + "20",
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: statusColor,
                    textTransform: "capitalize",
                  }}
                >
                  {task.status === "in_progress"
                    ? "In Progress"
                    : task.status === "completed"
                      ? "Completed"
                      : task.status.replace("_", " ")}
                </ThemedText>
              </View>

              {/* Reminder Indicator */}
              {task.reminder && (
                <Ionicons name="notifications" size={14} color="#FF9800" />
              )}
            </View>

            {/* Related To */}
            {task.relatedTo && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Ionicons
                  name="link-outline"
                  size={12}
                  color={colors.textSecondary}
                />
                <ThemedText
                  style={{
                    fontSize: 11,
                    color: colors.textSecondary,
                  }}
                >
                  {task.relatedTo}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Completion Info */}
          {task.completedAt && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
              <ThemedText style={{ fontSize: 11, color: colors.textSecondary }}>
                Completed: {formatDate(task.completedAt)}
              </ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Main Content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header Section */}
        <View
          style={{
            backgroundColor: colors.card,
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <View>
              <ThemedText
                type="title"
                style={{ color: colors.text, fontSize: 28 }}
              >
                Tasks
              </ThemedText>
              <ThemedText style={{ color: colors.textSecondary, marginTop: 4 }}>
                {filteredTasks.length} tasks found
                {loading && " (Loading...)"}
              </ThemedText>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {/* View Mode Toggle */}
              <TouchableOpacity
                onPress={() =>
                  setViewMode(viewMode === "list" ? "calendar" : "list")
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.primary + "15",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={
                    viewMode === "list" ? "calendar-outline" : "list-outline"
                  }
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>

              {/* Add Task Button */}
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  gap: 8,
                }}
              >
                <Ionicons name="add" size={18} color="white" />
                <ThemedText
                  type="defaultSemiBold"
                  style={{ color: "white", fontSize: 14 }}
                >
                  Add Task
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.background,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 15,
            }}
          >
            <Ionicons
              name="search"
              size={20}
              color={colors.textSecondary}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: colors.text,
                padding: 0,
              }}
              placeholder="Search tasks..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Stats Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 15 }}
          >
            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* All Tasks */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedStatus("all");
                  setSelectedPriority("All");
                  fetchTasks();
                }}
                style={{
                  minWidth: 100,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor:
                    selectedStatus === "all"
                      ? colors.primary + "20"
                      : colors.background,
                  borderWidth: 1,
                  borderColor:
                    selectedStatus === "all" ? colors.primary : colors.border,
                  alignItems: "center",
                }}
              >
                <ThemedText
                  type="title"
                  style={{ color: colors.primary, fontSize: 20 }}
                >
                  {stats.totalTasks}
                </ThemedText>
                <ThemedText
                  style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  All Tasks
                </ThemedText>
              </TouchableOpacity>

              {/* Today */}
              <TouchableOpacity
                onPress={handleTodayTasks}
                style={{
                  minWidth: 100,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                }}
              >
                <ThemedText
                  type="title"
                  style={{ color: "#2196F3", fontSize: 20 }}
                >
                  {stats.todayTasks}
                </ThemedText>
                <ThemedText
                  style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  Today
                </ThemedText>
              </TouchableOpacity>

              {/* High Priority */}
              <TouchableOpacity
                onPress={() => handlePriorityFilter("High")}
                style={{
                  minWidth: 100,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor:
                    selectedPriority === "High"
                      ? "#F4433620"
                      : colors.background,
                  borderWidth: 1,
                  borderColor:
                    selectedPriority === "High" ? "#F44336" : colors.border,
                  alignItems: "center",
                }}
              >
                <ThemedText
                  type="title"
                  style={{ color: "#F44336", fontSize: 20 }}
                >
                  {stats.highPriorityTasks}
                </ThemedText>
                <ThemedText
                  style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  High Priority
                </ThemedText>
              </TouchableOpacity>

              {/* Overdue */}
              <TouchableOpacity
                onPress={() => handleStatusFilter("overdue")}
                style={{
                  minWidth: 100,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor:
                    selectedStatus === "overdue"
                      ? "#F4433620"
                      : colors.background,
                  borderWidth: 1,
                  borderColor:
                    selectedStatus === "overdue" ? "#F44336" : colors.border,
                  alignItems: "center",
                }}
              >
                <ThemedText
                  type="title"
                  style={{ color: "#F44336", fontSize: 20 }}
                >
                  {stats.overdueTasks}
                </ThemedText>
                <ThemedText
                  style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  Overdue
                </ThemedText>
              </TouchableOpacity>

              {/* Upcoming */}
              <TouchableOpacity
                onPress={handleUpcomingTasks}
                style={{
                  minWidth: 100,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                }}
              >
                <ThemedText
                  type="title"
                  style={{ color: "#FF9800", fontSize: 20 }}
                >
                  {stats.todayTasks + stats.pendingTasks}
                </ThemedText>
                <ThemedText
                  style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  Upcoming
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Status Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
          >
            <View style={{ flexDirection: "row", gap: 8 }}>
              {taskStatuses.map((status) => (
                <TouchableOpacity
                  key={status.id}
                  onPress={() => handleStatusFilter(status.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor:
                      selectedStatus === status.id
                        ? status.color + "20"
                        : colors.background,
                    borderWidth: 1,
                    borderColor:
                      selectedStatus === status.id
                        ? status.color
                        : colors.border,
                    gap: 6,
                  }}
                >
                  <Ionicons
                    name={status.icon as any}
                    size={14}
                    color={
                      selectedStatus === status.id
                        ? status.color
                        : colors.textSecondary
                    }
                  />
                  <ThemedText
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color:
                        selectedStatus === status.id
                          ? status.color
                          : colors.textSecondary,
                    }}
                  >
                    {status.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Priority Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
          >
            <View style={{ flexDirection: "row", gap: 8 }}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority.value}
                  onPress={() => handlePriorityFilter(priority.value)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor:
                      selectedPriority === priority.value
                        ? priority.color + "20"
                        : colors.background,
                    borderWidth: 1,
                    borderColor:
                      selectedPriority === priority.value
                        ? priority.color
                        : colors.border,
                    gap: 6,
                  }}
                >
                  <Ionicons
                    name="flag"
                    size={14}
                    color={
                      selectedPriority === priority.value
                        ? priority.color
                        : colors.textSecondary
                    }
                  />
                  <ThemedText
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color:
                        selectedPriority === priority.value
                          ? priority.color
                          : colors.textSecondary,
                    }}
                  >
                    {priority.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Quick Filters Row */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {/* Bulk Actions */}
            <TouchableOpacity
              onPress={() => {
                if (filteredTasks.length > 0) {
                  Alert.alert(
                    "Bulk Actions",
                    "Select action for selected tasks",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Mark as Completed",
                        onPress: () => {
                          const taskIds = filteredTasks.map((t) => t.id);
                          handleBulkUpdate(taskIds, "completed");
                        },
                      },
                      {
                        text: "Delete All",
                        style: "destructive",
                        onPress: () => {
                          Alert.alert(
                            "Confirm Delete",
                            `Delete ${filteredTasks.length} tasks?`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: async () => {
                                  // You might want to implement bulk delete
                                  console.log("Bulk delete not implemented");
                                },
                              },
                            ],
                          );
                        },
                      },
                    ],
                  );
                }
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: colors.primary + "15",
                borderWidth: 1,
                borderColor: colors.primary,
                gap: 6,
              }}
            >
              <Ionicons name="layers" size={14} color={colors.primary} />
              <ThemedText style={{ fontSize: 12, color: colors.primary }}>
                Bulk Actions
              </ThemedText>
            </TouchableOpacity>

            {/* Refresh Button */}
            <TouchableOpacity
              onPress={onRefresh}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 6,
              }}
            >
              <Ionicons name="refresh" size={14} color={colors.textSecondary} />
              <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>
                Refresh
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tasks List */}
        <View style={{ padding: 20 }}>
          {loading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 50,
              }}
            >
              <Ionicons
                name="hourglass-outline"
                size={40}
                color={colors.primary}
              />
              <ThemedText
                style={{
                  color: colors.textSecondary,
                  marginTop: 10,
                  fontSize: 14,
                }}
              >
                Loading tasks...
              </ThemedText>
            </View>
          ) : viewMode === "list" ? (
            <>
              {/* Tasks Counter */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <ThemedText type="subtitle" style={{ color: colors.text }}>
                  My Tasks ({filteredTasks.length})
                </ThemedText>
                <TouchableOpacity onPress={onRefresh}>
                  <ThemedText style={{ color: colors.primary, fontSize: 12 }}>
                    Last updated: Now
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Tasks List */}
              {filteredTasks.length > 0 ? (
                filteredTasks.map(renderTaskItem)
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 50,
                  }}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={60}
                    color={colors.textSecondary}
                  />
                  <ThemedText
                    type="default"
                    style={{
                      color: colors.textSecondary,
                      marginTop: 10,
                      fontSize: 16,
                    }}
                  >
                    No tasks found
                  </ThemedText>
                  <ThemedText
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginTop: 5,
                    }}
                  >
                    {searchQuery
                      ? "Try a different search term"
                      : selectedStatus !== "all"
                        ? "No tasks with this status"
                        : "Add a new task to get started"}
                  </ThemedText>
                  {!searchQuery && selectedStatus === "all" && (
                    <TouchableOpacity
                      onPress={() => setShowAddModal(true)}
                      style={{
                        marginTop: 20,
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        backgroundColor: colors.primary,
                        borderRadius: 20,
                      }}
                    >
                      <ThemedText style={{ color: "white", fontSize: 14 }}>
                        Add Your First Task
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          ) : (
            // Calendar View Placeholder
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 50,
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={60}
                color={colors.textSecondary}
              />
              <ThemedText
                type="default"
                style={{
                  color: colors.textSecondary,
                  marginTop: 10,
                  fontSize: 16,
                }}
              >
                Calendar View
              </ThemedText>
              <ThemedText
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginTop: 5,
                  textAlign: "center",
                }}
              >
                View your tasks on a calendar timeline\nComing soon!
              </ThemedText>
            </View>
          )}
        </View>

        {/* Bottom Spacer for floating buttons */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        style={{
          position: "absolute",
          right: 20,
          bottom: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <AddTaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddTask={handleAddTask}
      />
    </SafeAreaView>
  );
}
