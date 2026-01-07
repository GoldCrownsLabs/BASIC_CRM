import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { tasksData, taskTypes } from "@/data/tasks";
import { Task } from "@/data/types/task";
import { Ionicons } from "@expo/vector-icons";
import { useNavigationState } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Share,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function TaskDetailScreen() {
  const navigationState = useNavigationState((state) => state);
  console.log("Navigation State:", navigationState);
  const { colors, isDark } = useAppTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  const task = tasksData.find((t) => t.id === id) || tasksData[0];
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [scrollY] = useState(new Animated.Value(0));

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
    // Use goBack instead of router.back()
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback if no navigation history
      router.push("/(tabs)/tasks");
    }
  };

  const formatDate = (dateString: string) => {
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
    if (!timeString) return "";

    // Agar already AM/PM hai → directly return
    if (/AM|PM/i.test(timeString)) {
      return timeString.trim();
    }

    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);

    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleUpdateTask = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Success", "Task updated successfully");
    setIsEditing(false);
  };

  const handleDeleteTask = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

            // First navigate back
            if (navigation.canGoBack()) {
              navigation.goBack();
            }

            // Then show alert
            setTimeout(() => {
              Alert.alert("Success", "Task deleted successfully");
            }, 300);
          },
        },
      ]
    );
  };
  const handleCompleteTask = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditedTask((prev) => ({
      ...prev,
      status: "completed",
      completedAt: new Date().toISOString().split("T")[0],
    }));
    Alert.alert("Success", "Task marked as complete");
  };

  const handleShareTask = async () => {
    try {
      await Share.share({
        title: task.title,
        message: `${task.title}\n\n${task.description}\n\nDue: ${formatDate(
          task.dueDate
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
    iconColor: string
  ) => (
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
    </View>
  );

  const renderStatusChip = (status: string) => {
    const statusConfig = {
      pending: {
        label: "Pending",
        color: colors.warning,
        icon: "time-outline",
      },
      in_progress: {
        label: "In Progress",
        color: colors.info,
        icon: "sync-outline",
      },
      completed: {
        label: "Completed",
        color: colors.success,
        icon: "checkmark-circle",
      },
      overdue: { label: "Overdue", color: colors.error, icon: "alert-circle" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: config.color + (isDark ? "15" : "10"),
          paddingHorizontal: 18,
          paddingVertical: 10,
          borderRadius: 25,
          gap: 8,
          borderWidth: 1,
          borderColor: config.color + "30",
        }}
      >
        <Ionicons name={config.icon as any} size={16} color={config.color} />
        <ThemedText
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: config.color,
            letterSpacing: 0.3,
          }}
        >
          {config.label}
        </ThemedText>
      </View>
    );
  };

  const renderPriorityChip = (priority: string) => {
    const color = getPriorityColor(priority);
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: color + (isDark ? "15" : "10"),
          paddingHorizontal: 18,
          paddingVertical: 10,
          borderRadius: 25,
          gap: 8,
          borderWidth: 1,
          borderColor: color + "30",
        }}
      >
        <Ionicons name="flag" size={16} color={color} />
        <ThemedText
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: color,
            letterSpacing: 0.3,
          }}
        >
          {priority} Priority
        </ThemedText>
      </View>
    );
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0 && task.status !== "completed";
  const isDueSoon =
    daysUntilDue >= 0 && daysUntilDue <= 2 && task.status !== "completed";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Animated Header */}

      <Animated.ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 40 }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Hero Section with Gradient Background */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 24,
            padding: 0,
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
                name={taskTypes[task.type]?.icon as any}
                size={28}
                color={taskTypes[task.type]?.color}
              />
            </View>

            {/* Content Container */}
            <View style={{ flex: 1 }}>
              {/* Header/Task Title Section */}
              <View style={{ marginBottom: 16 }}>
                {isEditing ? (
                  <View>
                    <ThemedText
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: colors.textSecondary,
                        marginBottom: 6,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Editing Task
                    </ThemedText>
                    <TextInput
                      value={editedTask.title}
                      onChangeText={(text) =>
                        setEditedTask((prev) => ({ ...prev, title: text }))
                      }
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: colors.text,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        backgroundColor: isDark ? "#2A2A2A" : "#F8F8F8",
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: taskTypes[task.type]?.color + "40",
                      }}
                      placeholder="Enter task title..."
                      placeholderTextColor={colors.textSecondary + "80"}
                      selectionColor={taskTypes[task.type]?.color}
                    />
                  </View>
                ) : (
                  <View>
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
                )}
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
                      getStatusColor(task.status) + (isDark ? "15" : "10"),
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

                {/* Priority Chip - Fixed comparison with uppercase strings */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor:
                      getPriorityColor(task.priority) + (isDark ? "15" : "10"),
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

                {/* Optional: Due Date Chip */}
                {task.dueDate && (
                  <>
                    <View
                      style={{
                        width: 1,
                        height: 20,
                        backgroundColor: isDark ? "#444" : "#E0E0E0",
                      }}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: isDark ? "#2A2A2A" : "#FFFFFF",
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: isDark ? "#444" : "#E0E0E0",
                      }}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={colors.textSecondary}
                        style={{ marginRight: 6 }}
                      />
                      <ThemedText
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          color: colors.textSecondary,
                        }}
                      >
                        {formatDate(task.dueDate)}
                      </ThemedText>
                    </View>
                  </>
                )}
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

            {isEditing ? (
              <TextInput
                value={editedTask.description}
                onChangeText={(text) =>
                  setEditedTask((prev) => ({ ...prev, description: text }))
                }
                multiline
                style={{
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.card,
                  padding: 18,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  minHeight: 140,
                  textAlignVertical: "top",
                  lineHeight: 24,
                }}
                placeholder="Add task description..."
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
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
                {task.description}
              </ThemedText>
            )}
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

            <View style={{ flex: 1, alignItems: "center" }}>
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
                  color={task.reminder ? colors.info : colors.textSecondary}
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
              <ThemedText
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color: task.reminder ? colors.info : colors.textSecondary,
                }}
              >
                {task.reminder ? formatTime(task.reminderTime) : "Off"}
              </ThemedText>
            </View>

            <View
              style={{
                width: 1,
                backgroundColor: colors.border,
                marginVertical: 8,
              }}
            />

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
                {task.timeEstimate || "N/A"}
              </ThemedText>
            </View>
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
              : colors.primary
          )}

          {renderInfoCard(
            "person-outline",
            "Assigned To",
            task.assignedTo,
            colors.info
          )}

          {renderInfoCard(
            "link-outline",
            "Related To",
            `${task.relatedTo}${
              task.relatedToType ? ` (${task.relatedToType})` : ""
            }`,
            colors.secondary
          )}

          {task.location &&
            renderInfoCard(
              "location-outline",
              "Location",
              task.location,
              colors.success
            )}

          {renderInfoCard(
            "create-outline",
            "Created Info",
            `By ${task.createdBy} on ${formatDate(task.createdAt)}`,
            colors.textSecondary
          )}

          {task.completedAt &&
            renderInfoCard(
              "checkmark-done-circle",
              "Completed On",
              formatDate(task.completedAt),
              colors.success
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
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {task.tags.map((tag, index) => (
                <View
                  key={index}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor: colors.primary + (isDark ? "15" : "10"),
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
            <Ionicons name="flash-outline" size={20} color={colors.primary} />
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
                <Ionicons name="checkmark-circle" size={22} color="white" />
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
              <Ionicons name="share-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {isEditing && (
            <TouchableOpacity
              onPress={handleUpdateTask}
              style={{
                marginTop: 16,
                backgroundColor: colors.primary,
                padding: 20,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 10,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="save-outline" size={22} color="white" />
              <ThemedText
                type="defaultSemiBold"
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                Save Changes
              </ThemedText>
            </TouchableOpacity>
          )}
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
            <Ionicons name="trash-outline" size={20} color={colors.error} />
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

        {/* Bottom Spacer */}
        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
