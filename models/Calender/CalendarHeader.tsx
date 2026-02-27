// components/CalendarHeader.tsx
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface CalendarHeaderProps {
  viewMode: "month" | "agenda";
  currentMonthName: string;
  currentYear: number;
  onToggleViewMode: () => void;
  onGoToToday: () => void;
  onToggleCalendar: () => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onOpenCalendarPicker: () => void;
  onAddEvent: () => void;
  showMonthCalendar: boolean;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  currentMonthName,
  currentYear,
  onToggleViewMode,
  onGoToToday,
  onToggleCalendar,
  onPreviousMonth,
  onNextMonth,
  onOpenCalendarPicker,
  onAddEvent,
  showMonthCalendar,
}) => {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        paddingHorizontal: 20,
        // paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      ></View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8, gap: 12 }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 18,
            paddingVertical: 10,
            backgroundColor:
              viewMode === "agenda"
                ? colors.primary
                : isDark
                  ? colors.border
                  : "#F3F4F6",
            borderRadius: 20,
            borderWidth: 2,
            borderColor: viewMode === "agenda" ? colors.primary : colors.border,
            minWidth: 120,
          }}
          onPress={onToggleViewMode}
        >
          <Feather
            name={viewMode === "month" ? "list" : "grid"}
            size={18}
            color={viewMode === "agenda" ? "#FFFFFF" : colors.text}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: viewMode === "agenda" ? "#FFFFFF" : colors.text,
            }}
          >
            {viewMode === "month" ? "Agenda View" : "Month View"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 18,
            paddingVertical: 10,
            backgroundColor: isDark ? colors.border : "#F3F4F6",
            borderRadius: 20,
            borderWidth: 2,
            borderColor: colors.border,
            minWidth: 100,
          }}
          onPress={onGoToToday}
        >
          <Feather
            name="calendar"
            size={18}
            color={colors.text}
            style={{ marginRight: 8 }}
          />
          <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 18,
            paddingVertical: 10,
            backgroundColor:
              viewMode === "month" && showMonthCalendar
                ? colors.primary + "20"
                : isDark
                  ? colors.border
                  : "#F3F4F6",
            borderRadius: 20,
            borderWidth: 2,
            borderColor:
              viewMode === "month" && showMonthCalendar
                ? colors.primary + "50"
                : colors.border,
            minWidth: 140,
          }}
          onPress={onToggleCalendar}
        >
          <Feather
            name="calendar"
            size={18}
            color={
              viewMode === "month" && showMonthCalendar
                ? colors.primary
                : colors.text
            }
            style={{ marginRight: 10 }}
          />
          <View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "800",
                color:
                  viewMode === "month" && showMonthCalendar
                    ? colors.primary
                    : colors.text,
              }}
            >
              {viewMode === "month"
                ? showMonthCalendar
                  ? "Hide Calendar"
                  : "Show Calendar"
                : "Pick Date"}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              {viewMode === "month"
                ? "Toggle calendar visibility"
                : "Open calendar picker"}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? colors.border : "#F3F4F6",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={onPreviousMonth}
          >
            <Feather name="chevron-left" size={22} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 18,
              paddingVertical: 10,
              backgroundColor: isDark
                ? colors.primary + "20"
                : colors.primary + "10",
              borderRadius: 20,
              borderWidth: 2,
              borderColor: colors.primary + "30",
              minWidth: 120,
            }}
            onPress={onOpenCalendarPicker}
          >
            <Text
              style={{ fontSize: 15, fontWeight: "800", color: colors.text }}
            >
              {currentMonthName} {currentYear}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? colors.border : "#F3F4F6",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={onNextMonth}
          >
            <Feather name="chevron-right" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
