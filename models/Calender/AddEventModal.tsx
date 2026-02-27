// components/AddEventModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import DateTimePicker from "@react-native-community/datetimepicker";

// Changed import
import {
  calendarConfig,
  formatDate,
  eventConfig,
  eventTypes as defaultEventTypes,
} from "@/lib/calendar-config";
import { CreateEventPayload, EventType } from "@/lib/api/calender.api";

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (eventData: CreateEventPayload) => void;
  selectedDate: string;
  onOpenCalendar: () => void;
  eventTypes?: EventType[];
  loading?: boolean;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  visible,
  onClose,
  onSubmit,
  selectedDate,
  onOpenCalendar,
  eventTypes: propEventTypes,
  loading = false,
}) => {
  const { colors, isDark } = useAppTheme();

  // 🔥 FIX 1: Better state management
  const [formData, setFormData] = useState<CreateEventPayload>({
    title: "",
    type: "meeting",
    date: selectedDate,
    startTime: "10:00",
    endTime: "11:00",
    contactId: undefined,
    contactName: "",
    company: "",
    description: "",
    priority: "medium",
    location: "",
    reminder: {
      enabled: true,
      minutesBefore: 30,
    },
  });

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());
  const [availableEventTypes, setAvailableEventTypes] = useState<string[]>([
    ...defaultEventTypes,
  ]);

  // 🔥 FIX 2: Initialize dates properly
  useEffect(() => {
    if (selectedDate) {
      const [year, month, day] = selectedDate.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      setTempDate(dateObj);

      // Set default time to current time + 1 hour
      const now = new Date();
      now.setHours(now.getHours() + 1);
      now.setMinutes(0);
      setTempTime(now);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (propEventTypes && propEventTypes.length > 0) {
      setAvailableEventTypes(propEventTypes.map((et) => et.name));
    }
  }, [propEventTypes]);

  // 🔥 FIX 3: Update form when modal opens
  useEffect(() => {
    if (visible) {
      setFormData((prev) => ({
        ...prev,
        date: selectedDate,
      }));
    }
  }, [visible, selectedDate]);

  // 🔥 FIX 4: Date Picker Handler
  const onDateChange = (event: any, selectedDateObj?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDateObj) {
      setTempDate(selectedDateObj);

      // Format date to YYYY-MM-DD
      const year = selectedDateObj.getFullYear();
      const month = String(selectedDateObj.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDateObj.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      setFormData((prev) => ({ ...prev, date: formattedDate }));
    }

    if (Platform.OS === "ios") {
      // Keep picker open on iOS
    }
  };

  // 🔥 FIX 5: Time Picker Handler
  const onTimeChange = (event: any, selectedTimeObj?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (selectedTimeObj) {
      setTempTime(selectedTimeObj);

      // Format time to HH:MM
      const hours = String(selectedTimeObj.getHours()).padStart(2, "0");
      const minutes = String(selectedTimeObj.getMinutes()).padStart(2, "0");
      const formattedTime = `${hours}:${minutes}`;

      setFormData((prev) => ({ ...prev, startTime: formattedTime }));
    }

    if (Platform.OS === "ios") {
      // Keep picker open on iOS
    }
  };

  // 🔥 FIX 6: Smooth Calendar Opening
  const handleOpenCalendar = () => {
    onClose(); // Close modal first
    setTimeout(() => {
      onOpenCalendar(); // Open calendar after modal closes
    }, 300);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter an event title");
      return;
    }

    if (!formData.startTime) {
      Alert.alert("Error", "Please select a start time");
      return;
    }

    onSubmit(formData);
  };

  // Format date for display
  const displayDate = () => {
    const [year, month, day] = formData.date.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
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
            maxHeight: "90%",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "600", color: colors.text }}
            >
              New Event
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ paddingHorizontal: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Event Type */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Event Type
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {availableEventTypes.map((typeName: string) => {
                    const config = eventConfig[typeName] || eventConfig.meeting;
                    return (
                      <TouchableOpacity
                        key={typeName}
                        style={{
                          alignItems: "center",
                          padding: 12,
                          borderRadius: 16,
                          backgroundColor:
                            formData.type === typeName
                              ? config.bg
                              : isDark
                                ? colors.border
                                : "#F9FAFB",
                          borderWidth: 2,
                          borderColor:
                            formData.type === typeName
                              ? config.color
                              : colors.border,
                          minWidth: 80,
                        }}
                        onPress={() =>
                          setFormData({ ...formData, type: typeName })
                        }
                      >
                        <Feather
                          name={config.icon as any}
                          size={24}
                          color={
                            formData.type === typeName
                              ? config.color
                              : colors.textSecondary
                          }
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color:
                              formData.type === typeName
                                ? config.color
                                : colors.textSecondary,
                            marginTop: 8,
                          }}
                        >
                          {config.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Event Title */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Event Title *
              </Text>
              <TextInput
                style={{
                  backgroundColor: isDark ? colors.border : "#F9FAFB",
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: colors.text,
                }}
                placeholder="Enter event title"
                placeholderTextColor={colors.textSecondary}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
              />
            </View>

            {/* Date and Time */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              {/* 🔥 FIX 7: Date Picker Button */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  Date *
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: isDark ? colors.border : "#F9FAFB",
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ fontSize: 16, color: colors.text }}>
                    {displayDate()}
                  </Text>
                  <Feather
                    name="calendar"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* 🔥 FIX 8: Time Picker Button */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  Start Time *
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: isDark ? colors.border : "#F9FAFB",
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={{ fontSize: 16, color: colors.text }}>
                    {formData.startTime}
                  </Text>
                  <Feather
                    name="clock"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 🔥 FIX 9: Date Picker Modal */}
            {showDatePicker && (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                minimumDate={new Date(2000, 0, 1)}
              />
            )}

            {/* 🔥 FIX 10: Time Picker Modal */}
            {showTimePicker && (
              <DateTimePicker
                value={tempTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onTimeChange}
              />
            )}

            {/* End Time */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                End Time
              </Text>
              <TextInput
                style={{
                  backgroundColor: isDark ? colors.border : "#F9FAFB",
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: colors.text,
                }}
                placeholder="11:00"
                placeholderTextColor={colors.textSecondary}
                value={formData.endTime}
                onChangeText={(text) =>
                  setFormData({ ...formData, endTime: text })
                }
              />
            </View>

            {/* Contact Name */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Contact Name
              </Text>
              <TextInput
                style={{
                  backgroundColor: isDark ? colors.border : "#F9FAFB",
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: colors.text,
                }}
                placeholder="Enter contact name (optional)"
                placeholderTextColor={colors.textSecondary}
                value={formData.contactName}
                onChangeText={(text) =>
                  setFormData({ ...formData, contactName: text })
                }
              />
            </View>

            {/* Company */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Company
              </Text>
              <TextInput
                style={{
                  backgroundColor: isDark ? colors.border : "#F9FAFB",
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: colors.text,
                }}
                placeholder="Enter company (optional)"
                placeholderTextColor={colors.textSecondary}
                value={formData.company}
                onChangeText={(text) =>
                  setFormData({ ...formData, company: text })
                }
              />
            </View>

            {/* Location */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Location
              </Text>
              <TextInput
                style={{
                  backgroundColor: isDark ? colors.border : "#F9FAFB",
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: colors.text,
                }}
                placeholder="Enter location (optional)"
                placeholderTextColor={colors.textSecondary}
                value={formData.location}
                onChangeText={(text) =>
                  setFormData({ ...formData, location: text })
                }
              />
            </View>

            {/* Priority */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Priority Level
              </Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {[
                  {
                    value: "low",
                    label: "Low",
                    color: isDark ? "#34D399" : "#10B981",
                    bg: isDark ? "rgba(52, 211, 153, 0.2)" : "#D1FAE5",
                  },
                  {
                    value: "medium",
                    label: "Medium",
                    color: isDark ? "#FBBF24" : "#F59E0B",
                    bg: isDark ? "rgba(251, 191, 36, 0.2)" : "#FEF3C7",
                  },
                  {
                    value: "high",
                    label: "High",
                    color: isDark ? "#F87171" : "#EF4444",
                    bg: isDark ? "rgba(248, 113, 113, 0.2)" : "#FEE2E2",
                  },
                ].map((priority) => (
                  <TouchableOpacity
                    key={priority.value}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor:
                        formData.priority === priority.value
                          ? priority.bg
                          : isDark
                            ? colors.border
                            : "#F9FAFB",
                      borderWidth: 2,
                      borderColor:
                        formData.priority === priority.value
                          ? priority.color
                          : colors.border,
                      alignItems: "center",
                    }}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        priority: priority.value as any,
                      })
                    }
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color:
                          formData.priority === priority.value
                            ? priority.color
                            : colors.textSecondary,
                      }}
                    >
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Description
              </Text>
              <TextInput
                style={{
                  backgroundColor: isDark ? colors.border : "#F9FAFB",
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: colors.text,
                  height: 100,
                  textAlignVertical: "top",
                }}
                placeholder="Add event details (optional)..."
                placeholderTextColor={colors.textSecondary}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              gap: 12,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor: isDark ? colors.border : "#F3F4F6",
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
              onPress={onClose}
              disabled={loading}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: colors.text }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: "center",
                opacity: loading ? 0.7 : 1,
              }}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}
                >
                  Creating...
                </Text>
              ) : (
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}
                >
                  Create Event
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
