import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { Task } from "@/data/types/task";
import { TaskCard } from "./TaskCard";

interface TasksListProps {
  tasks: Task[];
  loading: boolean;
  viewMode: "list" | "calendar";
  onTaskPress: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: () => void;
  onRefresh: () => void;
  getStatusColor: (task: Task, colors: any) => string; // Added colors parameter
  getPriorityColor: (priority: "High" | "Medium" | "Low") => string;
  formatDate: (dateString: string) => string;
  getDaysUntilDue: (dueDate: string) => number;
  colors: any; // Add colors prop
}

export const TasksList: React.FC<TasksListProps> = ({
  tasks,
  loading,
  viewMode,
  onTaskPress,
  onCompleteTask,
  onDeleteTask,
  onAddTask,
  onRefresh,
  getStatusColor,
  getPriorityColor,
  formatDate,
  getDaysUntilDue,
  colors, // Destructure colors
}) => {
  const themeColors = useAppTheme().colors; // Get colors from theme

  if (viewMode === "calendar") {
    return (
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
          color={themeColors.textSecondary}
        />
        <ThemedText
          type="default"
          style={{
            color: themeColors.textSecondary,
            marginTop: 10,
            fontSize: 16,
          }}
        >
          Calendar View
        </ThemedText>
        <ThemedText
          style={{
            color: themeColors.textSecondary,
            fontSize: 12,
            marginTop: 5,
            textAlign: "center",
          }}
        >
          View your tasks on a calendar timeline\nComing soon!
        </ThemedText>
      </View>
    );
  }

  if (loading) {
    return (
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
          color={themeColors.primary}
        />
        <ThemedText
          style={{
            color: themeColors.textSecondary,
            marginTop: 10,
            fontSize: 14,
          }}
        >
          Loading tasks...
        </ThemedText>
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
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
          color={themeColors.textSecondary}
        />
        <ThemedText
          type="default"
          style={{
            color: themeColors.textSecondary,
            marginTop: 10,
            fontSize: 16,
          }}
        >
          No tasks found
        </ThemedText>
        <ThemedText
          style={{
            color: themeColors.textSecondary,
            fontSize: 12,
            marginTop: 5,
          }}
        >
          Add a new task to get started
        </ThemedText>
        <TouchableOpacity
          onPress={onAddTask}
          style={{
            marginTop: 20,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: themeColors.primary,
            borderRadius: 20,
          }}
        >
          <ThemedText style={{ color: "white", fontSize: 14 }}>
            Add Your First Task
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
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
        <ThemedText type="subtitle" style={{ color: themeColors.text }}>
          My Tasks ({tasks.length})
        </ThemedText>
        <TouchableOpacity onPress={onRefresh}>
          <ThemedText style={{ color: themeColors.primary, fontSize: 12 }}>
            Last updated: Now
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Tasks List */}
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onPress={onTaskPress}
          onComplete={onCompleteTask}
          onDelete={onDeleteTask}
          getStatusColor={(task: Task) => getStatusColor(task, colors)} // Pass colors
          getPriorityColor={getPriorityColor}
          formatDate={formatDate}
          getDaysUntilDue={getDaysUntilDue}
        />
      ))}
    </>
  );
};
