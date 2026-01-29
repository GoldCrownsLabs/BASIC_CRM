import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { taskStatuses } from "@/data/tasks";
import { TaskStatusFilter } from "@/data/types/task.types";


interface StatusFilterProps {
  selectedStatus: TaskStatusFilter; // Use proper type
  onStatusFilter: (status: TaskStatusFilter) => void; // Use proper type
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatus,
  onStatusFilter,
}) => {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: 12 }}
    >
      <View style={{ flexDirection: "row", gap: 8 }}>
        {taskStatuses.map((status) => (
          <TouchableOpacity
            key={status.id}
            onPress={() => onStatusFilter(status.id as TaskStatusFilter)}
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
                selectedStatus === status.id ? status.color : colors.border,
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
  );
};
