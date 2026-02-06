// components/CalendarModal.tsx
import React from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { weekDays, months } from "@/data/calendar";

const { width } = Dimensions.get("window");

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  currentDate: Date;
  selectedDate: string;
  calendarDays: any[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  onSelectDate,
  currentDate,
  selectedDate,
  calendarDays,
  onPreviousMonth,
  onNextMonth,
  onGoToToday,
}) => {
  const { colors, isDark } = useAppTheme();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentMonthName = months[currentMonth];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: isDark ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.7)",
          justifyContent: "center",
          alignItems: "center",
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 24,
            width: width - 40,
            maxHeight: "80%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{ fontSize: 22, fontWeight: "800", color: colors.text }}
            >
              Select Date
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isDark ? colors.border : "#F3F4F6",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Feather name="x" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              backgroundColor: isDark ? colors.border : "#F9FAFB",
              padding: 12,
              borderRadius: 16,
            }}
          >
            <TouchableOpacity onPress={onPreviousMonth}>
              <Feather name="chevron-left" size={24} color={colors.primary} />
            </TouchableOpacity>

            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 18, fontWeight: "800", color: colors.text }}
              >
                {currentMonthName}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                {currentYear}
              </Text>
            </View>

            <TouchableOpacity onPress={onNextMonth}>
              <Feather name="chevron-right" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              marginBottom: 12,
              paddingHorizontal: 4,
            }}
          >
            {weekDays.map((day) => (
              <View key={day} style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    color:
                      day === "Sun" || day === "Sat"
                        ? isDark
                          ? "#F87171"
                          : "#EF4444"
                        : colors.textSecondary,
                    textTransform: "uppercase",
                  }}
                >
                  {day.charAt(0)}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              paddingHorizontal: 4,
            }}
          >
            {calendarDays.map((day, index) => {
              const isSelected = day.date === selectedDate;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    onSelectDate(day.date);
                    onClose();
                  }}
                  style={{
                    width: (width - 80) / 7,
                    height: 45,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isSelected
                      ? colors.primary
                      : "transparent",
                    borderRadius: 12,
                    marginVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: isSelected ? "800" : "600",
                      color: isSelected
                        ? "#FFFFFF"
                        : !day.isCurrentMonth
                          ? colors.textSecondary + "50"
                          : day.weekDay === 0 || day.weekDay === 6
                            ? isDark
                              ? "#F87171"
                              : "#EF4444"
                            : colors.text,
                    }}
                  >
                    {day.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={{
              marginTop: 20,
              paddingVertical: 14,
              backgroundColor: colors.primary,
              borderRadius: 14,
              alignItems: "center",
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
            onPress={() => {
              onGoToToday();
              onClose();
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>
              Go to Today
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
