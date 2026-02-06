// components/CalendarDayCell.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

interface CalendarDayCellProps {
  day: any;
  isSelected: boolean;
  onPress: () => void;
  width: number;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  day,
  isSelected,
  onPress,
  width,
}) => {
  const { colors, isDark } = useAppTheme();
  const hasEvents = day.events && day.events.length > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        width: (width - 40) / 7,
        height: 65,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isSelected ? colors.primary : "transparent",
        borderRadius: 16,
        marginVertical: 4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {day.isToday && !isSelected && (
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: isDark
              ? "rgba(59, 130, 246, 0.2)"
              : "rgba(59, 130, 246, 0.1)",
            borderRadius: 16,
          }}
        />
      )}

      {isSelected && (
        <View
          style={{
            position: "absolute",
            top: 2,
            left: 2,
            right: 2,
            bottom: 2,
            borderWidth: 2,
            borderColor: "rgba(255, 255, 255, 0.3)",
            borderRadius: 14,
          }}
        />
      )}

      <Text
        style={{
          fontSize: 16,
          fontWeight: isSelected ? "800" : day.isToday ? "700" : "600",
          color: isSelected
            ? "#FFFFFF"
            : !day.isCurrentMonth
              ? colors.textSecondary + "70"
              : day.isToday
                ? colors.primary
                : colors.text,
          marginBottom: 4,
        }}
      >
        {day.day}
      </Text>

      {hasEvents && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 3,
            marginTop: 2,
          }}
        >
          {day.events.slice(0, 4).map((event: any, index: number) => (
            <View
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: event.color || colors.primary,
                opacity: isSelected ? 0.8 : 1,
              }}
            />
          ))}
          {day.events.length > 4 && (
            <Text
              style={{
                fontSize: 9,
                fontWeight: "700",
                color: isSelected
                  ? "rgba(255, 255, 255, 0.8)"
                  : colors.textSecondary,
              }}
            >
              +{day.events.length - 4}
            </Text>
          )}
        </View>
      )}

      {(day.weekDay === 0 || day.weekDay === 6) && !isSelected && (
        <View
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: isDark ? "#F87171" : "#EF4444",
          }}
        />
      )}
    </TouchableOpacity>
  );
};
