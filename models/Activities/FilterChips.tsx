import {
  activityConfig,
  ActivityType,
  activityTypes,
} from "@/lib/api/activities.api";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface FilterChipsProps {
  filter: "all" | ActivityType;
  colors: any;
  isDark: boolean;
  onFilterChange: (filter: "all" | ActivityType) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  filter,
  colors,
  isDark,
  onFilterChange,
}) => {
  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 20 }}
      >
        {(["all", ...activityTypes] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              minHeight: 36,
              borderWidth: 1,
              backgroundColor:
                filter === type
                  ? colors.primary
                  : isDark
                    ? colors.border
                    : "#F3F4F6",
              borderColor: filter === type ? colors.primary : colors.border,
            }}
            onPress={() => onFilterChange(type)}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: filter === type ? "#FFFFFF" : colors.textSecondary,
              }}
            >
              {type === "all" ? "All Activities" : activityConfig[type].label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default FilterChips;
