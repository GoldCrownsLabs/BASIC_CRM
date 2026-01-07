import AddTaskModal from "@/components/Modal/AddTaskModal";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { priorities, tasksData, taskStatuses, taskTypes } from "@/data/tasks";
import { Task } from "@/data/types/task";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TasksScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedAssignee, setSelectedAssignee] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showAddModal, setShowAddModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(tasksData);
  const [showFilters, setShowFilters] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleAddTask = (taskData: any) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      status: "pending",
      type: taskData.type,
      assignedTo: taskData.assignedTo,
      relatedTo: taskData.relatedTo,
      relatedToType: taskData.relatedToType,
      createdAt: new Date().toISOString().split("T")[0],
      reminder: taskData.reminder,
      reminderTime: taskData.reminderTime,
      completedAt: null,
      tags: taskData.tags,
      notes: taskData.notes,
      timeEstimate: taskData.timeEstimate,
      location: taskData.location,
      recurrence: taskData.recurrence,
      createdBy: "Current User",
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  const handleTaskPress = (taskId: string) => {
    router.push({
      pathname: "/(tools)/tasks/[id]",
      params: { id: taskId },
    } as any); // Type assertion to bypass TypeScript error
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "completed",
              completedAt: new Date().toISOString().split("T")[0],
            }
          : task
      )
    );
  };

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.relatedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.tags?.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      if (selectedStatus === "overdue") {
        filtered = filtered.filter((task) => {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return task.status !== "completed" && dueDate < today;
        });
      } else {
        filtered = filtered.filter((task) => task.status === selectedStatus);
      }
    }

    // Priority filter
    if (selectedPriority !== "All") {
      filtered = filtered.filter((task) => task.priority === selectedPriority);
    }

    // Type filter
    if (selectedType !== "All") {
      filtered = filtered.filter(
        (task) => task.type === selectedType.toLowerCase()
      );
    }

    // Assignee filter
    if (selectedAssignee !== "All") {
      filtered = filtered.filter(
        (task) => task.assignedTo === selectedAssignee
      );
    }

    return filtered;
  }, [
    tasks,
    searchQuery,
    selectedStatus,
    selectedPriority,
    selectedType,
    selectedAssignee,
  ]);

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
    if (task.status === "pending") {
      if (daysUntilDue < 0) return "#F44336";
      if (daysUntilDue <= 2) return "#FF9800";
      return "#FF9800";
    }
    return colors.textSecondary;
  };

  const getPriorityColor = (priority: string) => {
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

  const getTaskTypeIcon = (type: string) => {
    return taskTypes[type as keyof typeof taskTypes] || taskTypes.other;
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

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const pendingTasks = tasks.filter((t) => t.status === "pending").length;
    const inProgressTasks = tasks.filter(
      (t) => t.status === "in_progress"
    ).length;
    const overdueTasks = tasks.filter((t) => {
      const daysUntilDue = getDaysUntilDue(t.dueDate);
      return t.status !== "completed" && daysUntilDue < 0;
    }).length;

    const todayTasks = tasks.filter((t) => {
      const dueDate = new Date(t.dueDate);
      const today = new Date();
      return dueDate.toDateString() === today.toDateString();
    }).length;

    const highPriorityTasks = tasks.filter((t) => t.priority === "High").length;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      todayTasks,
      highPriorityTasks,
    };
  }, [tasks]);

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
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
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
                onPress={() => setSelectedStatus("all")}
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
                onPress={() => setSelectedPriority("High")}
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
                onPress={() => setSelectedStatus("overdue")}
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
                  onPress={() => setSelectedStatus(status.id)}
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
                  onPress={() => setSelectedPriority(priority.value)}
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
            {/* Assignee Filter */}
            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
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
              <Ionicons name="people" size={14} color={colors.textSecondary} />
              <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>
                {selectedAssignee === "All" ? "Everyone" : selectedAssignee}
              </ThemedText>
              <Ionicons
                name="chevron-down"
                size={12}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Type Filter */}
            <TouchableOpacity
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
              <Ionicons name="apps" size={14} color={colors.textSecondary} />
              <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>
                {selectedType === "All" ? "All Types" : selectedType}
              </ThemedText>
              <Ionicons
                name="chevron-down"
                size={12}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tasks List */}
        <View style={{ padding: 20 }}>
          {viewMode === "list" ? (
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
                <TouchableOpacity>
                  <ThemedText style={{ color: colors.primary, fontSize: 12 }}>
                    Sort by: Due Date
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
