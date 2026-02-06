// components/EventDetailModal.tsx
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

import { formatDate } from "@/data/calendar";
import { CalendarEvent } from "@/lib/api/calender.api";

interface EventDetailModalProps {
  visible: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onEditEvent: () => void;
  onUpdateStatus: (eventId: string, status: string) => void;
  onSetReminder: (eventId: string, minutesBefore: number) => void;
  onMoveEvent: (eventId: string, newDate: string, newTime: string) => void;
  eventConfig: Record<string, any>;
  statusConfig: Record<string, any>;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  visible,
  event,
  onClose,
  onEditEvent,
  onUpdateStatus,
  onSetReminder,
  onMoveEvent,
  eventConfig,
  statusConfig,
}) => {
  const { colors, isDark } = useAppTheme();
  const [reminderMinutes, setReminderMinutes] = useState(30);

  if (!event) return null;

  const config = eventConfig[event.type] || eventConfig.meeting;
  const status = statusConfig[event.status] || statusConfig.scheduled;

  const handleSetReminder = () => {
    onSetReminder(event._id, reminderMinutes);
  };

  const handleMarkComplete = () => {
    Alert.alert(
      "Mark as Complete",
      "Are you sure you want to mark this event as complete?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Complete",
          onPress: () => onUpdateStatus(event._id, "completed"),
        },
      ],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "85%",
          }}
        >
          <View
            style={{
              backgroundColor: config.bg,
              paddingTop: 24,
              paddingHorizontal: 24,
              paddingBottom: 20,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather name={config.icon} size={24} color={config.color} />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: config.color,
                    marginLeft: 12,
                  }}
                >
                  {config.label}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color={config.color} />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: colors.text,
                marginTop: 16,
              }}
            >
              {event.title}
            </Text>
          </View>

          <ScrollView
            style={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                backgroundColor: isDark ? colors.border : "#F9FAFB",
                borderRadius: 16,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: isDark ? colors.card : "#FFFFFF",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Feather
                    name="clock"
                    size={20}
                    color={isDark ? "#60A5FA" : "#3B82F6"}
                  />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: colors.text,
                    }}
                  >
                    {event.startTime}
                    {event.endTime && ` - ${event.endTime}`}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {formatDate(event.date)}
                  </Text>
                </View>
              </View>

              {event.location && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 12,
                  }}
                >
                  <Feather
                    name="map-pin"
                    size={16}
                    color={colors.textSecondary}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ fontSize: 14, color: colors.text }}>
                    {event.location}
                  </Text>
                </View>
              )}
            </View>

            <View
              style={{
                backgroundColor: isDark ? colors.border : "#F9FAFB",
                borderRadius: 16,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Contact Details
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <FontAwesome
                  name="user"
                  size={16}
                  color={colors.textSecondary}
                  style={{ marginRight: 12 }}
                />
                <Text style={{ fontSize: 16, color: colors.text }}>
                  {event.contactName || "No contact"}
                </Text>
              </View>
              {event.company && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons
                    name="business"
                    size={16}
                    color={colors.textSecondary}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ fontSize: 16, color: colors.text }}>
                    {event.company}
                  </Text>
                </View>
              )}
            </View>

            {event.description && (
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 12,
                  }}
                >
                  Description
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.textSecondary,
                    lineHeight: 24,
                  }}
                >
                  {event.description}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: isDark ? "#34D399" : "#10B981",
                  alignItems: "center",
                }}
                onPress={handleMarkComplete}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}
                >
                  Mark Complete
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  backgroundColor: isDark ? colors.border : "#F3F4F6",
                  alignItems: "center",
                }}
                onPress={onEditEvent}
              >
                <Feather name="edit-2" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View
              style={{
                backgroundColor: isDark ? colors.border : "#F9FAFB",
                borderRadius: 16,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Set Reminder
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                {[15, 30, 60, 120].map((minutes) => (
                  <TouchableOpacity
                    key={minutes}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor:
                        reminderMinutes === minutes
                          ? colors.primary
                          : colors.border,
                      alignItems: "center",
                    }}
                    onPress={() => setReminderMinutes(minutes)}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color:
                          reminderMinutes === minutes ? "#FFFFFF" : colors.text,
                      }}
                    >
                      {minutes} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={{
                  marginTop: 12,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: isDark ? "#3B82F6" : "#2563EB",
                  alignItems: "center",
                }}
                onPress={handleSetReminder}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}
                >
                  Set Reminder
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
