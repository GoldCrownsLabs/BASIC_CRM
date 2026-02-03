import CommonHeader from "@/components/common/CommonHeader";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { taskTypes, timeEstimates } from "@/data/tasks";
import { Task } from "@/data/types/task";
import { useTasks } from "@/hooks/useTasks";
import {
  getTask,
  markTaskAsCompleted,
  updateTask,
  updateTaskReminder,
} from "@/lib/api/tasks.api";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigationState } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Share,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Helper function to map API task to local task format
const mapApiTaskToLocal = (apiTask: any): Task => {
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
      status = "pending";
      break;
  }

  // Get metadata fields
  const metadata = apiTask.metadata || {};

  // Determine task type from metadata or related data
  let type: any = metadata.type || "other";
  let relatedToType: "contact" | "company" | "deal" | "project" | undefined =
    metadata.relatedToType as any;

  if (apiTask.leadId) {
    type = "call";
    relatedToType = "contact";
  } else if (apiTask.contactId) {
    type = "call";
    relatedToType = "contact";
  }

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
    dueDate: apiTask.dueDate.split("T")[0],
    priority,
    status,
    type,
    assignedTo: Array.isArray(apiTask.assignedTo)
      ? apiTask.assignedTo.length > 0
        ? apiTask.assignedTo[0]
        : "Me"
      : "Me",
    relatedTo: apiTask.leadId || apiTask.contactId || metadata.relatedTo || "",
    relatedToType,
    createdAt: apiTask.createdAt.split("T")[0],
    reminder: !!apiTask.reminderDate,
    reminderTime: apiTask.reminderDate
      ? new Date(apiTask.reminderDate)
          .toTimeString()
          .split(" ")[0]
          .substring(0, 5)
      : "",
    completedAt: apiTask.completedAt ? apiTask.completedAt.split("T")[0] : null,
    tags: metadata.tags || [],
    notes: metadata.notes || "",
    timeEstimate: metadata.timeEstimate || "",
    location: metadata.location || "",
    recurrence: metadata.recurrence || "none",
    createdBy: apiTask.userId?.name || "System User",
  };
};

export default function TaskDetailScreen() {
  const navigationState = useNavigationState((state) => state);
  console.log("Navigation State:", navigationState);
  const { colors, isDark } = useAppTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [scrollY] = useState(new Animated.Value(0));

  // New states for editing
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { handleDeleteTask: deleteTaskFromHook, fetchTasks } = useTasks();

  const taskIcons = [
    "layers-outline",
    "clipboard-outline",
    "list-outline",
    "briefcase-outline",
    "document-text-outline",
    "grid-outline",
    "checkmark-done-outline",
    "alarm-outline",
    "calendar-outline",
  ];

  // Fetch task details on mount
  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await getTask(id as string);
      if (response.success) {
        const mappedTask = mapApiTaskToLocal(response.data);
        setTask(mappedTask);
        setEditedTask(mappedTask);

        // Set reminder date/time if exists from API response
        if (response.data.reminderDate) {
          const reminderDateTime = new Date(response.data.reminderDate);
          setReminderDate(reminderDateTime);
          setReminderTime(reminderDateTime);
        }
      } else {
        Alert.alert("Error", "Task not found");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching task:", error);
      Alert.alert("Error", "Failed to load task details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getRandomIcon = () => {
    return taskIcons[Math.floor(Math.random() * taskIcons.length)];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return colors.error;
      case "Medium":
        return colors.warning;
      case "Low":
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return colors.success;
      case "in_progress":
        return colors.info;
      case "pending":
        return colors.warning;
      case "overdue":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.push("/(tabs)/tasks");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "Not set";

    // If already has AM/PM
    if (/AM|PM/i.test(timeString)) {
      return timeString.trim();
    }

    // If it's a full ISO date string
    if (timeString.includes("T")) {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return "Not set";

      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    // If it's just time like "10:00"
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);

    if (isNaN(hour)) return "Not set";

    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
  };

  const getDaysUntilDue = () => {
    if (!task) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysUntilReminder = () => {
    if (!task || !task.reminder) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Use the component-level reminderDate (Date) and task.reminderTime (string)
    const datePart = reminderDate
      ? reminderDate.toISOString().split("T")[0]
      : null;
    if (!datePart) return null;

    const reminderDateTime = new Date(
      `${datePart}T${task.reminderTime || "00:00"}`,
    );
    reminderDateTime.setHours(0, 0, 0, 0);

    const diffTime = reminderDateTime.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleUpdateTask = async () => {
    try {
      if (!editedTask) return;

      const payload: any = {
        title: editedTask.title,
        description: editedTask.description,
        priority: editedTask.priority.toLowerCase() as
          | "low"
          | "medium"
          | "high"
          | "urgent",
        status:
          editedTask.status === "completed"
            ? "completed"
            : editedTask.status === "in_progress"
              ? "in_progress"
              : "pending",
        // Add metadata fields
        metadata: {
          type: editedTask.type,
          relatedTo: editedTask.relatedTo,
          relatedToType: editedTask.relatedToType,
          tags: editedTask.tags,
          notes: editedTask.notes,
          timeEstimate: editedTask.timeEstimate,
          location: editedTask.location,
          recurrence: editedTask.recurrence,
        },
      };

      const response = await updateTask(editedTask.id, payload);

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTask(editedTask);
        setIsEditing(false);
        Alert.alert("Success", "Task updated successfully");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Failed to update task");
    }
  };

  const handleUpdateReminder = async () => {
    try {
      if (!task) return;

      const reminderDateTime = new Date(reminderDate);
      reminderDateTime.setHours(
        reminderTime.getHours(),
        reminderTime.getMinutes(),
      );

      const response = await updateTaskReminder(
        task.id,
        reminderDateTime.toISOString(),
      );

      if (response.success) {
        setShowReminderModal(false);
        Alert.alert("Success", "Reminder updated successfully");
        await fetchTaskDetails(); // Refresh task data
      }
    } catch (error) {
      console.error("Error updating reminder:", error);
      Alert.alert("Error", "Failed to update reminder");
    }
  };

  const handleRemoveReminder = async () => {
    try {
      if (!task) return;

      const response = await updateTaskReminder(task.id, "");

      if (response.success) {
        Alert.alert("Success", "Reminder removed successfully");
        await fetchTaskDetails(); // Refresh task data
      }
    } catch (error) {
      console.error("Error removing reminder:", error);
      Alert.alert("Error", "Failed to remove reminder");
    }
  };

  const handleDeleteTask = () => {
    if (!task) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("❌ Delete cancelled"),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🗑️ Deleting task:", task.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

              // ✅ useTasks hook का function use करें
              await deleteTaskFromHook(task.id);

              console.log("✅ Task deleted successfully, navigating back...");

              // Navigate back
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                router.push("/(tabs)/tasks");
              }

              // Refresh tasks list
              await fetchTasks();
            } catch (error) {
              console.error("❌ Error deleting task:", error);
              Alert.alert("Error", "Failed to delete task");
            }
          },
        },
      ],
    );
  };

  const handleCompleteTask = async () => {
    try {
      if (!task) return;

      const response = await markTaskAsCompleted(task.id);
      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const updatedTask = {
          ...task,
          status: "completed" as const,
          completedAt: new Date().toISOString().split("T")[0],
        };
        setTask(updatedTask);
        setEditedTask(updatedTask);
        Alert.alert("Success", "Task marked as complete");
      }
    } catch (error) {
      console.error("Error completing task:", error);
      Alert.alert("Error", "Failed to complete task");
    }
  };

  const handleShareTask = async () => {
    if (!task) return;

    try {
      await Share.share({
        title: task.title,
        message: `${task.title}\n\n${task.description}\n\nDue: ${formatDate(
          task.dueDate,
        )}\nPriority: ${task.priority}\nStatus: ${task.status}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share task");
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  const renderInfoCard = (
    icon: string,
    title: string,
    value: string,
    iconColor: string,
    onPress?: () => void,
  ) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.card,
          padding: 10,
          borderRadius: 20,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.1 : 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: iconColor + "20",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
          }}
        >
          <Ionicons name={icon as any} size={24} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              marginBottom: 6,
              fontWeight: "500",
              letterSpacing: 0.3,
            }}
          >
            {title}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 17,
              color: colors.text,
              fontWeight: "600",
              lineHeight: 22,
            }}
          >
            {value}
          </ThemedText>
        </View>
        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEditableField = (
    label: string,
    value: string,
    field: keyof Task,
    multiline: boolean = false,
    placeholder: string = "",
  ) => (
    <View style={{ marginBottom: 16 }}>
      <ThemedText
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          marginBottom: 8,
          fontWeight: "500",
        }}
      >
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={(text) =>
          setEditedTask((prev) => (prev ? { ...prev, [field]: text } : null))
        }
        style={{
          fontSize: 16,
          color: colors.text,
          backgroundColor: colors.card,
          padding: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          minHeight: multiline ? 80 : 50,
          textAlignVertical: multiline ? "top" : "center",
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        multiline={multiline}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons name="hourglass-outline" size={50} color={colors.primary} />
          <ThemedText style={{ marginTop: 16, color: colors.textSecondary }}>
            Loading task details...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons
            name="alert-circle-outline"
            size={50}
            color={colors.error}
          />
          <ThemedText style={{ marginTop: 16, color: colors.textSecondary }}>
            Task not found
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 20,
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: colors.primary,
              borderRadius: 20,
            }}
          >
            <ThemedText style={{ color: "white" }}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const daysUntilDue = getDaysUntilDue();
  const daysUntilReminder = getDaysUntilReminder();
  const isOverdue = daysUntilDue < 0 && task.status !== "completed";
  const isDueSoon =
    daysUntilDue >= 0 && daysUntilDue <= 2 && task.status !== "completed";

  return (
    <>
      <CommonHeader
        title="Task Details"
        rightIcon={
          <Ionicons
            name={isEditing ? "close" : "pencil"}
            size={20}
            color={isEditing ? colors.primary : colors.text}
          />
        }
        onRightPress={() => setIsEditing(!isEditing)}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Animated.ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 0, paddingBottom: 40 }}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
        >
          {isEditing && editedTask ? (
            // Edit Mode
            <View style={{ padding: 20 }}>
              <View style={{ marginBottom: 24 }}>
                <ThemedText
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: colors.text,
                    marginBottom: 20,
                  }}
                >
                  Edit Task
                </ThemedText>

                {renderEditableField(
                  "Title",
                  editedTask.title,
                  "title",
                  false,
                  "Enter task title",
                )}
                {renderEditableField(
                  "Description",
                  editedTask.description,
                  "description",
                  true,
                  "Enter task description",
                )}

                {/* Priority Selector */}
                <View style={{ marginBottom: 16 }}>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                      marginBottom: 8,
                      fontWeight: "500",
                    }}
                  >
                    Priority
                  </ThemedText>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {["Low", "Medium", "High"].map((priority) => (
                      <TouchableOpacity
                        key={priority}
                        onPress={() =>
                          setEditedTask((prev) =>
                            prev
                              ? { ...prev, priority: priority as any }
                              : null,
                          )
                        }
                        style={{
                          flex: 1,
                          padding: 12,
                          borderRadius: 12,
                          backgroundColor:
                            editedTask.priority === priority
                              ? getPriorityColor(priority) + "20"
                              : colors.card,
                          borderWidth: 2,
                          borderColor:
                            editedTask.priority === priority
                              ? getPriorityColor(priority)
                              : colors.border,
                          alignItems: "center",
                        }}
                      >
                        <ThemedText
                          style={{
                            color:
                              editedTask.priority === priority
                                ? getPriorityColor(priority)
                                : colors.text,
                            fontWeight: "600",
                          }}
                        >
                          {priority}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Type Selector */}
                <View style={{ marginBottom: 16 }}>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                      marginBottom: 8,
                      fontWeight: "500",
                    }}
                  >
                    Type
                  </ThemedText>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {(Object.keys(taskTypes) as (keyof typeof taskTypes)[]).map(
                      (typeKey) => (
                        <TouchableOpacity
                          key={typeKey}
                          onPress={() =>
                            setEditedTask((prev) =>
                              prev ? { ...prev, type: typeKey as any } : null,
                            )
                          }
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 20,
                            backgroundColor:
                              editedTask.type === typeKey
                                ? taskTypes[typeKey].color + "20"
                                : colors.card,
                            borderWidth: 2,
                            borderColor:
                              editedTask.type === typeKey
                                ? taskTypes[typeKey].color
                                : colors.border,
                          }}
                        >
                          <ThemedText
                            style={{
                              color:
                                editedTask.type === typeKey
                                  ? taskTypes[typeKey].color
                                  : colors.text,
                            }}
                          >
                            {taskTypes[typeKey].label}
                          </ThemedText>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>

                {renderEditableField(
                  "Location",
                  editedTask.location || "",
                  "location",
                  false,
                  "Enter location",
                )}
                {renderEditableField(
                  "Time Estimate",
                  editedTask.timeEstimate || "",
                  "timeEstimate",
                  false,
                  "e.g., 1h, 30m",
                )}
                {renderEditableField(
                  "Notes",
                  editedTask.notes || "",
                  "notes",
                  true,
                  "Additional notes",
                )}

                {/* Tags Editor */}
                <View style={{ marginBottom: 16 }}>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                      marginBottom: 8,
                      fontWeight: "500",
                    }}
                  >
                    Tags
                  </ThemedText>
                  <TextInput
                    value={editedTask.tags?.join(", ") || ""}
                    onChangeText={(text) =>
                      setEditedTask((prev) =>
                        prev
                          ? {
                              ...prev,
                              tags: text
                                .split(",")
                                .map((tag) => tag.trim())
                                .filter((tag) => tag),
                            }
                          : null,
                      )
                    }
                    style={{
                      fontSize: 16,
                      color: colors.text,
                      backgroundColor: colors.card,
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    placeholder="Enter tags separated by commas"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  onPress={handleUpdateTask}
                  style={{
                    backgroundColor: colors.primary,
                    padding: 16,
                    borderRadius: 16,
                    alignItems: "center",
                    marginTop: 20,
                  }}
                >
                  <ThemedText
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    Save Changes
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // View Mode
            <>
              {/* Hero Section with Gradient Background */}
              <View
                style={{
                  padding: 5,
                  borderColor: taskTypes[task.type]?.color + "20",
                  shadowColor: taskTypes[task.type]?.color,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0.15 : 0.1,
                  shadowRadius: 20,
                  elevation: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 28,
                    backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
                    borderRadius: 16,
                    padding: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.3 : 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: isDark ? "#333333" : "#F0F0F0",
                  }}
                >
                  {/* Icon Container */}
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: isDark
                        ? taskTypes[task.type]?.color + "20"
                        : taskTypes[task.type]?.color + "10",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 16,
                      borderWidth: 2,
                      borderColor:
                        taskTypes[task.type]?.color + (isDark ? "30" : "20"),
                    }}
                  >
                    <Ionicons
                      name={getRandomIcon() as any}
                      size={28}
                      color={taskTypes[task.type]?.color}
                    />
                  </View>

                  {/* Content Container */}
                  <View style={{ flex: 1 }}>
                    <View style={{ marginBottom: 16 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={14}
                          color={colors.textSecondary}
                          style={{ marginRight: 6 }}
                        />
                        <ThemedText
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: colors.textSecondary,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Task Details
                        </ThemedText>
                      </View>
                      <ThemedText
                        style={{
                          fontSize: 20,
                          fontWeight: "700",
                          color: colors.text,
                          lineHeight: 28,
                          letterSpacing: -0.2,
                        }}
                      >
                        {task.title}
                      </ThemedText>
                    </View>

                    {/* Status & Priority Chips - Same Line */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                        backgroundColor: isDark ? "#222222" : "#F5F5F5",
                        padding: 12,
                        borderRadius: 12,
                      }}
                    >
                      {/* Status Chip */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor:
                            getStatusColor(task.status) +
                            (isDark ? "15" : "10"),
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: getStatusColor(task.status) + "40",
                          flexShrink: 1,
                        }}
                      >
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: getStatusColor(task.status),
                            marginRight: 8,
                          }}
                        />
                        <ThemedText
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: getStatusColor(task.status),
                            textTransform: "capitalize",
                          }}
                        >
                          {task.status}
                        </ThemedText>
                      </View>

                      <View
                        style={{
                          width: 1,
                          height: 20,
                          backgroundColor: isDark ? "#444" : "#E0E0E0",
                        }}
                      />

                      {/* Priority Chip */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor:
                            getPriorityColor(task.priority) +
                            (isDark ? "15" : "10"),
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: getPriorityColor(task.priority) + "40",
                          flexShrink: 1,
                        }}
                      >
                        <Ionicons
                          name={
                            task.priority === "High"
                              ? "alert-circle"
                              : task.priority === "Medium"
                                ? "time"
                                : "flag-outline"
                          }
                          size={16}
                          color={getPriorityColor(task.priority)}
                          style={{ marginRight: 6 }}
                        />
                        <ThemedText
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: getPriorityColor(task.priority),
                            textTransform: "capitalize",
                          }}
                        >
                          {task.priority} Priority
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Description */}
                <View style={{ marginBottom: 28 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 16,
                      paddingBottom: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border + "50",
                    }}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={taskTypes[task.type]?.color}
                    />
                    <ThemedText
                      style={{
                        fontSize: 15,
                        color: taskTypes[task.type]?.color,
                        marginLeft: 10,
                        fontWeight: "700",
                        letterSpacing: 0.5,
                      }}
                    >
                      DESCRIPTION
                    </ThemedText>
                  </View>

                  <ThemedText
                    style={{
                      fontSize: 16,
                      color: colors.text,
                      lineHeight: 26,
                      backgroundColor: colors.card,
                      padding: 18,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    {task.description || "No description provided"}
                  </ThemedText>
                </View>

                {/* Quick Stats */}
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: colors.card,
                    borderRadius: 20,
                    padding: 20,
                    gap: 24,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  {/* Days Left - Based on Due Date */}
                  <View style={{ flex: 1, alignItems: "center" }}>
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: isOverdue
                          ? colors.error + "20"
                          : isDueSoon
                            ? colors.warning + "20"
                            : colors.success + "20",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 12,
                        borderWidth: 2,
                        borderColor: isOverdue
                          ? colors.error + "40"
                          : isDueSoon
                            ? colors.warning + "40"
                            : colors.success + "40",
                      }}
                    >
                      <Ionicons
                        name={isOverdue ? "alert-circle" : "calendar"}
                        size={24}
                        color={
                          isOverdue
                            ? colors.error
                            : isDueSoon
                              ? colors.warning
                              : colors.success
                        }
                      />
                    </View>
                    <ThemedText
                      style={{
                        fontSize: 14,
                        color: colors.textSecondary,
                        marginBottom: 4,
                        fontWeight: "500",
                      }}
                    >
                      Days Left
                    </ThemedText>
                    <ThemedText
                      style={{
                        fontSize: 14,
                        fontWeight: "800",
                        color: isOverdue
                          ? colors.error
                          : isDueSoon
                            ? colors.warning
                            : colors.success,
                      }}
                    >
                      {daysUntilDue}
                    </ThemedText>
                  </View>

                  <View
                    style={{
                      width: 1,
                      backgroundColor: colors.border,
                      marginVertical: 8,
                    }}
                  />

                  {/* Reminder - Shows Days until Reminder */}
                  <View style={{ flex: 1, alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => setShowReminderModal(true)}
                      style={{ alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 28,
                          backgroundColor: task.reminder
                            ? colors.info + "20"
                            : colors.border,
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: 12,
                          borderWidth: 2,
                          borderColor: task.reminder
                            ? colors.info + "40"
                            : colors.border,
                        }}
                      >
                        <Ionicons
                          name="notifications"
                          size={24}
                          color={
                            task.reminder ? colors.info : colors.textSecondary
                          }
                        />
                      </View>
                      <ThemedText
                        style={{
                          fontSize: 14,
                          color: colors.textSecondary,
                          marginBottom: 4,
                          fontWeight: "500",
                        }}
                      >
                        Reminder
                      </ThemedText>
                      {task.reminder && daysUntilReminder !== null ? (
                        <ThemedText
                          style={{
                            fontSize: 14,
                            fontWeight: "800",
                            color:
                              daysUntilReminder <= 1
                                ? colors.warning
                                : colors.info,
                          }}
                        >
                          {daysUntilReminder === 0
                            ? "Today"
                            : daysUntilReminder === 1
                              ? "Tomorrow"
                              : `${daysUntilReminder}d`}
                        </ThemedText>
                      ) : (
                        <ThemedText
                          style={{
                            fontSize: 14,
                            fontWeight: "800",
                            color: colors.textSecondary,
                          }}
                        >
                          {task.reminder
                            ? formatTime(task.reminderTime)
                            : "Off"}
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  </View>

                  <View
                    style={{
                      width: 1,
                      backgroundColor: colors.border,
                      marginVertical: 8,
                    }}
                  />

                  {/* Time Estimate - Only show if exists */}
                  {task.timeEstimate ? (
                    <View style={{ flex: 1, alignItems: "center" }}>
                      <View
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 28,
                          backgroundColor: colors.secondary + "20",
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: 12,
                          borderWidth: 2,
                          borderColor: colors.secondary + "40",
                        }}
                      >
                        <Ionicons
                          name="time-outline"
                          size={24}
                          color={colors.secondary}
                        />
                      </View>
                      <ThemedText
                        style={{
                          fontSize: 14,
                          color: colors.textSecondary,
                          marginBottom: 4,
                          fontWeight: "500",
                        }}
                      >
                        Estimate
                      </ThemedText>
                      <ThemedText
                        style={{
                          fontSize: 14,
                          fontWeight: "800",
                          color: colors.secondary,
                        }}
                      >
                        {timeEstimates.find(
                          (t) => t.value === task.timeEstimate,
                        )?.label || task.timeEstimate}
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Task Details Grid */}
              <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
                {renderInfoCard(
                  "calendar-outline",
                  "Due Date",
                  `${formatDate(task.dueDate)}${
                    isOverdue ? " (Overdue!)" : isDueSoon ? " (Due Soon)" : ""
                  }`,
                  isOverdue
                    ? colors.error
                    : isDueSoon
                      ? colors.warning
                      : colors.primary,
                )}

                {renderInfoCard(
                  "person-outline",
                  "Assigned To",
                  task.assignedTo,
                  colors.info,
                )}

                {renderInfoCard(
                  "link-outline",
                  "Related To",
                  `${task.relatedTo}${
                    task.relatedToType ? ` (${task.relatedToType})` : ""
                  }`,
                  colors.secondary,
                )}

                {task.location &&
                  renderInfoCard(
                    "location-outline",
                    "Location",
                    task.location,
                    colors.success,
                  )}

                {renderInfoCard(
                  "create-outline",
                  "Created By",
                  task.createdBy, // Updated to show actual creator name
                  colors.textSecondary,
                )}

                {task.completedAt &&
                  renderInfoCard(
                    "checkmark-done-circle",
                    "Completed On",
                    formatDate(task.completedAt),
                    colors.success,
                  )}
              </View>

              {/* Tags Section */}
              {task.tags && task.tags.length > 0 && (
                <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 16,
                      paddingBottom: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border + "50",
                    }}
                  >
                    <Ionicons
                      name="pricetag-outline"
                      size={20}
                      color={colors.secondary}
                    />
                    <ThemedText
                      style={{
                        fontSize: 15,
                        color: colors.secondary,
                        marginLeft: 10,
                        fontWeight: "700",
                        letterSpacing: 0.5,
                      }}
                    >
                      TAGS
                    </ThemedText>
                  </View>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                  >
                    {task.tags.map((tag, index) => (
                      <View
                        key={index}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 20,
                          backgroundColor:
                            colors.primary + (isDark ? "15" : "10"),
                          borderWidth: 1,
                          borderColor: colors.primary + "30",
                        }}
                      >
                        <ThemedText
                          style={{
                            fontSize: 14,
                            color: colors.primary,
                            fontWeight: "600",
                          }}
                        >
                          {tag}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Notes Section */}
              {task.notes && (
                <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 16,
                      paddingBottom: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border + "50",
                    }}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={colors.warning}
                    />
                    <ThemedText
                      style={{
                        fontSize: 15,
                        color: colors.warning,
                        marginLeft: 10,
                        fontWeight: "700",
                        letterSpacing: 0.5,
                      }}
                    >
                      ADDITIONAL NOTES
                    </ThemedText>
                  </View>
                  <View
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 20,
                      padding: 20,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 15,
                        color: colors.text,
                        lineHeight: 24,
                        fontStyle: "italic",
                      }}
                    >
                      {task.notes}
                    </ThemedText>
                  </View>
                </View>
              )}

              {/* Actions Section */}
              <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 20,
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border + "50",
                  }}
                >
                  <Ionicons
                    name="flash-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <ThemedText
                    style={{
                      fontSize: 15,
                      color: colors.primary,
                      marginLeft: 10,
                      fontWeight: "700",
                      letterSpacing: 0.5,
                    }}
                  >
                    QUICK ACTIONS
                  </ThemedText>
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  {task.status !== "completed" ? (
                    <TouchableOpacity
                      onPress={handleCompleteTask}
                      style={{
                        flex: 1,
                        backgroundColor: colors.success,
                        padding: 20,
                        borderRadius: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        gap: 10,
                        shadowColor: colors.success,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="white"
                      />
                      <ThemedText
                        type="defaultSemiBold"
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontWeight: "700",
                        }}
                      >
                        Mark Complete
                      </ThemedText>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: colors.success + "20",
                        padding: 20,
                        borderRadius: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        gap: 10,
                        borderWidth: 2,
                        borderColor: colors.success,
                      }}
                      disabled
                    >
                      <Ionicons
                        name="checkmark-done-circle"
                        size={22}
                        color={colors.success}
                      />
                      <ThemedText
                        type="defaultSemiBold"
                        style={{
                          color: colors.success,
                          fontSize: 16,
                          fontWeight: "700",
                        }}
                      >
                        Completed
                      </ThemedText>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={handleShareTask}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 20,
                      backgroundColor: colors.card,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="share-outline"
                      size={24}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                </View>

                {/* Set/Update Reminder Button */}
                <TouchableOpacity
                  onPress={() => setShowReminderModal(true)}
                  style={{
                    marginTop: 16,
                    backgroundColor: task.reminder
                      ? colors.warning
                      : colors.info,
                    padding: 16,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 10,
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={
                      task.reminder ? "notifications" : "notifications-outline"
                    }
                    size={22}
                    color="white"
                  />
                  <ThemedText
                    type="defaultSemiBold"
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    {task.reminder ? "Update Reminder" : "Set Reminder"}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Danger Zone */}
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  borderTopWidth: 1,
                  borderTopColor: colors.border + "50",
                  marginTop: 10,
                }}
              >
                <TouchableOpacity
                  onPress={handleDeleteTask}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.error + "10",
                    padding: 18,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: colors.error + "30",
                    gap: 12,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.error}
                  />
                  <ThemedText
                    style={{
                      color: colors.error,
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    Delete Task
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Bottom Spacer */}
          <View style={{ height: 40 }} />
        </Animated.ScrollView>
      </SafeAreaView>

      {/* Reminder Modal */}
      <Modal
        visible={showReminderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReminderModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: 20,
              padding: 20,
              width: "90%",
              maxWidth: 400,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
                {task?.reminder ? "Update Reminder" : "Set Reminder"}
              </ThemedText>
              <TouchableOpacity onPress={() => setShowReminderModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Date Picker */}
            <View style={{ marginBottom: 20 }}>
              <ThemedText
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Reminder Date
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  backgroundColor: colors.card,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <ThemedText style={{ color: colors.text }}>
                  {reminderDate.toLocaleDateString()}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Time Picker */}
            <View style={{ marginBottom: 30 }}>
              <ThemedText
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Reminder Time
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={{
                  backgroundColor: colors.card,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <ThemedText style={{ color: colors.text }}>
                  {reminderTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              {task?.reminder && (
                <TouchableOpacity
                  onPress={handleRemoveReminder}
                  style={{
                    flex: 1,
                    backgroundColor: colors.error + "10",
                    padding: 16,
                    borderRadius: 12,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: colors.error,
                  }}
                >
                  <ThemedText
                    style={{ color: colors.error, fontWeight: "600" }}
                  >
                    Remove Reminder
                  </ThemedText>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleUpdateReminder}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <ThemedText style={{ color: "white", fontWeight: "600" }}>
                  Save
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={reminderDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setReminderDate(selectedDate);
              }
            }}
          />
        )}

        {/* Time Picker Modal */}
        {showTimePicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setReminderTime(selectedTime);
              }
            }}
          />
        )}
      </Modal>
    </>
  );
}
