import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { priorities } from "@/data/tasks";
import { TaskPriorityFilter } from "@/data/types/task.types";


interface PriorityFilterProps {
  selectedPriority: TaskPriorityFilter; // Use proper type
  onPriorityFilter: (priority: TaskPriorityFilter) => void; // Use proper type
}

export const PriorityFilter: React.FC<PriorityFilterProps> = ({
  selectedPriority,
  onPriorityFilter,
}) => {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: 12 }}
    >
      <View style={{ flexDirection: "row", gap: 8 }}>
        {priorities.map((priority) => (
          <TouchableOpacity
            key={priority.value}
            onPress={() =>
              onPriorityFilter(priority.value as TaskPriorityFilter)
            }
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
  );
};
