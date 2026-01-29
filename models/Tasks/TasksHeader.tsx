import React from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface TasksHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  viewMode: "list" | "calendar";
  onToggleView: () => void; // Add this prop
  onAddTask: () => void;
  loading: boolean;
  taskCount: number;
}

export const TasksHeader: React.FC<TasksHeaderProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onToggleView,
  onAddTask,
  loading,
  taskCount,
}) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        // padding: 20,
        // borderBottomWidth: 1,
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
          <ThemedText type="title" style={{ color: colors.text, fontSize: 28 }}>
            Tasks
          </ThemedText>
          <ThemedText style={{ color: colors.textSecondary, marginTop: 4 }}>
            {taskCount} tasks found
            {loading && " (Loading...)"}
          </ThemedText>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {/* View Mode Toggle */}
          <TouchableOpacity
            onPress={onToggleView}
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
              name={viewMode === "list" ? "calendar-outline" : "list-outline"}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>

          {/* Add Task Button */}
          <TouchableOpacity
            onPress={onAddTask}
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
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
