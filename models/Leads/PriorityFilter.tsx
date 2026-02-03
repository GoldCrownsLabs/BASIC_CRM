import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface PriorityFilterProps {
  selectedPriority: string;
  onSelectPriority: (priority: string) => void;
  getPriorityIcon: (priority: string) => string;
  getPriorityColor: (priority: string) => string;
  getPriorityDisplayLabel: (priority: string) => string;
}

// ✅ LOCAL PRIORITIES ARRAY
const LOCAL_PRIORITIES = ["high", "medium", "low"];

export const PriorityFilter: React.FC<PriorityFilterProps> = ({
  selectedPriority,
  onSelectPriority,
  getPriorityIcon,
  getPriorityColor,
  getPriorityDisplayLabel,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {/* All button... */}

      {/* ✅ USE LOCAL ARRAY INSTEAD */}
      {LOCAL_PRIORITIES.map((priority) => (
        <TouchableOpacity
          key={priority}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            borderWidth: 1,
            gap: 6,
            backgroundColor:
              selectedPriority === getPriorityDisplayLabel(priority)
                ? getPriorityColor(priority) + "20"
                : colors.background,
            borderColor:
              selectedPriority === getPriorityDisplayLabel(priority)
                ? getPriorityColor(priority)
                : colors.border,
          }}
          onPress={() => onSelectPriority(getPriorityDisplayLabel(priority))}
        >
          <Ionicons
            name={getPriorityIcon(priority) as any}
            size={16}
            color={
              selectedPriority === getPriorityDisplayLabel(priority)
                ? getPriorityColor(priority)
                : colors.textSecondary
            }
          />
          <ThemedText
            style={{
              color:
                selectedPriority === getPriorityDisplayLabel(priority)
                  ? getPriorityColor(priority)
                  : colors.textSecondary,
              fontSize: 12,
              fontWeight: "500",
            }}
          >
            {getPriorityDisplayLabel(priority)}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
};
