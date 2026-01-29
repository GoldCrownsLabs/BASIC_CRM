import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { Task } from "@/data/types/task";
import { taskTypes } from "@/data/tasks";

interface TaskCardProps {
  task: Task;
  onPress: (taskId: string) => void;
  onComplete: (taskId: string) => void; // Add this prop
  onDelete: (taskId: string) => void;
  getStatusColor: (task: Task) => string;
  getPriorityColor: (priority: "High" | "Medium" | "Low") => string;
  formatDate: (dateString: string) => string;
  getDaysUntilDue: (dueDate: string) => number;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onComplete,
  onDelete,
  getStatusColor,
  getPriorityColor,
  formatDate,
  getDaysUntilDue,
}) => {
  const { colors } = useAppTheme();

  const daysUntilDue = getDaysUntilDue(task.dueDate);
  const statusColor = getStatusColor(task);
  const priorityColor = getPriorityColor(task.priority);
  const taskType = taskTypes[task.type] || taskTypes.other;
  const isOverdue = daysUntilDue < 0 && task.status !== "completed";
  const isDueSoon =
    daysUntilDue >= 0 && daysUntilDue <= 2 && task.status !== "completed";

  const handleLongPress = () => {
    Alert.alert("Task Actions", "What would you like to do?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark as Complete",
        onPress: () => onComplete(task.id),
        style: "default",
      },
      {
        text: "Delete Task",
        onPress: () => onDelete(task.id),
        style: "destructive",
      },
      {
        text: "Edit",
        onPress: () => {
          console.log("Edit task:", task.id);
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(task.id)}
      onLongPress={handleLongPress}
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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

          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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
              <ThemedText style={{ fontSize: 11, color: colors.textSecondary }}>
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
