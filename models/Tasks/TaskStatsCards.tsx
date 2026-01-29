import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";

interface TaskStatsCardsProps {
  stats: {
    totalTasks: number;
    todayTasks: number;
    highPriorityTasks: number;
    overdueTasks: number;
  };
  selectedStatus: string;
  selectedPriority: string;
  onAllTasks: () => void; // Add this prop
  onTodayTasks: () => void;
  onHighPriority: () => void; // Add this prop
  onOverdueTasks: () => void; // Add this prop
  onUpcomingTasks: () => void;
}

export const TaskStatsCards: React.FC<TaskStatsCardsProps> = ({
  stats,
  selectedStatus,
  selectedPriority,
  onAllTasks,
  onTodayTasks,
  onHighPriority,
  onOverdueTasks,
  onUpcomingTasks,
}) => {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: 15, paddingTop: 10 }}
    >
      <View style={{ flexDirection: "row", gap: 10 }}>
        {/* All Tasks */}
        <TouchableOpacity
          onPress={onAllTasks}
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
            style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}
          >
            All Tasks
          </ThemedText>
        </TouchableOpacity>

        {/* Today */}
        <TouchableOpacity
          onPress={onTodayTasks}
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
          <ThemedText type="title" style={{ color: "#2196F3", fontSize: 20 }}>
            {stats.todayTasks}
          </ThemedText>
          <ThemedText
            style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}
          >
            Today
          </ThemedText>
        </TouchableOpacity>

        {/* High Priority */}
        <TouchableOpacity
          onPress={onHighPriority}
          style={{
            minWidth: 100,
            padding: 12,
            borderRadius: 12,
            backgroundColor:
              selectedPriority === "High" ? "#F4433620" : colors.background,
            borderWidth: 1,
            borderColor:
              selectedPriority === "High" ? "#F44336" : colors.border,
            alignItems: "center",
          }}
        >
          <ThemedText type="title" style={{ color: "#F44336", fontSize: 20 }}>
            {stats.highPriorityTasks}
          </ThemedText>
          <ThemedText
            style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}
          >
            High Priority
          </ThemedText>
        </TouchableOpacity>

        {/* Overdue */}
        <TouchableOpacity
          onPress={onOverdueTasks}
          style={{
            minWidth: 100,
            padding: 12,
            borderRadius: 12,
            backgroundColor:
              selectedStatus === "overdue" ? "#F4433620" : colors.background,
            borderWidth: 1,
            borderColor:
              selectedStatus === "overdue" ? "#F44336" : colors.border,
            alignItems: "center",
          }}
        >
          <ThemedText type="title" style={{ color: "#F44336", fontSize: 20 }}>
            {stats.overdueTasks}
          </ThemedText>
          <ThemedText
            style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}
          >
            Overdue
          </ThemedText>
        </TouchableOpacity>

        {/* Upcoming */}
        <TouchableOpacity
          onPress={onUpcomingTasks}
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
          <ThemedText type="title" style={{ color: "#FF9800", fontSize: 20 }}>
            {stats.todayTasks + stats.totalTasks}
          </ThemedText>
          <ThemedText
            style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}
          >
            Upcoming
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
