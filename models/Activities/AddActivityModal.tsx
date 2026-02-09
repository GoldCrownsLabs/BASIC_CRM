import React from "react";
import {
  Modal,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  activityConfig,
  ActivityType,
  activityTypes,
  PriorityType,
} from "@/lib/api/activities.api";

// Define proper type for newActivity
interface NewActivityType {
  title: string;
  contactName: string;
  company: string;
  description: string;
  type: ActivityType;
  priority: PriorityType;
  date: string;
  time: string;
  duration: string;
}

interface AddActivityModalProps {
  visible: boolean;
  colors: any;
  isDark: boolean;
  loading: boolean;
  newActivity: NewActivityType;
  priorityColors: Record<PriorityType, string>;
  onClose: () => void;
  onSave: () => void;
  onUpdateNewActivity: (key: keyof NewActivityType, value: string) => void;
  onUpdateType: (type: ActivityType) => void;
  onUpdatePriority: (priority: PriorityType) => void;
}

// ✅ Feather icon names के लिए proper type
type FeatherIconName = keyof typeof Feather.glyphMap;

// ✅ Priority के लिए default value
const DEFAULT_PRIORITY: PriorityType = "medium";

const AddActivityModal: React.FC<AddActivityModalProps> = ({
  visible,
  colors,
  isDark,
  loading,
  newActivity,
  priorityColors,
  onClose,
  onSave,
  onUpdateNewActivity,
  onUpdateType,
  onUpdatePriority,
}) => {
  // ✅ Safe priority value
  const currentPriority = newActivity.priority || DEFAULT_PRIORITY;

  // ✅ Activity type selection helper
  const handleTypeSelect = (type: ActivityType) => {
    onUpdateType(type);
  };

  // ✅ Priority selection helper
  const handlePrioritySelect = (priority: PriorityType) => {
    onUpdatePriority(priority);
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
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              Add New Activity
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ paddingHorizontal: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Activity Type */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text,
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              Activity Type
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {activityTypes.map((type: ActivityType) => {
                const config = activityConfig[type];
                const isSelected = newActivity.type === type;

                return (
                  <TouchableOpacity
                    key={type}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: isSelected ? config.color : colors.border,
                      gap: 8,
                      backgroundColor: isSelected ? config.bg : "transparent",
                    }}
                    onPress={() => handleTypeSelect(type)}
                  >
                    <Feather
                      name={config.icon as FeatherIconName} // ✅ Proper type
                      size={20}
                      color={isSelected ? config.color : colors.textSecondary}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: isSelected ? config.color : colors.textSecondary,
                      }}
                    >
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Common Input Style */}
            {(
              [
                ["Title *", "title", "Enter activity title"],
                ["Contact Name *", "contactName", "Enter contact name"],
                ["Company", "company", "Enter company name (optional)"],
              ] as const
            ).map(([label, key, placeholder]) => (
              <View key={key} style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  {label}
                </Text>
                <TextInput
                  style={{
                    backgroundColor: isDark ? colors.card : "#F9FAFB",
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: colors.text,
                  }}
                  placeholder={placeholder}
                  placeholderTextColor={colors.textSecondary}
                  value={newActivity[key as keyof NewActivityType]}
                  onChangeText={(text) =>
                    onUpdateNewActivity(key as keyof NewActivityType, text)
                  }
                />
              </View>
            ))}

            {/* Date & Time */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              {(["date", "time"] as const).map((key) => (
                <View key={key} style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.text,
                      marginBottom: 8,
                    }}
                  >
                    {key === "date" ? "Date" : "Time"}
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: isDark ? colors.card : "#F9FAFB",
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: colors.text,
                    }}
                    placeholder={key === "date" ? "YYYY-MM-DD" : "HH:MM AM/PM"}
                    placeholderTextColor={colors.textSecondary}
                    value={newActivity[key]}
                    onChangeText={(text) => onUpdateNewActivity(key, text)}
                  />
                </View>
              ))}
            </View>

            {/* Description */}
            <View style={{ marginBottom: 16 }}>
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
                  backgroundColor: isDark ? colors.card : "#F9FAFB",
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  height: 100,
                  textAlignVertical: "top",
                }}
                placeholder="Enter activity description"
                placeholderTextColor={colors.textSecondary}
                multiline
                value={newActivity.description}
                onChangeText={(text) =>
                  onUpdateNewActivity("description", text)
                }
              />
            </View>

            {/* Duration (Optional) */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Duration (Optional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: isDark ? colors.card : "#F9FAFB",
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                }}
                placeholder="e.g., 30 mins, 1 hour"
                placeholderTextColor={colors.textSecondary}
                value={newActivity.duration}
                onChangeText={(text) => onUpdateNewActivity("duration", text)}
              />
            </View>

            {/* Priority */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Priority
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {(["low", "medium", "high"] as const).map((priority) => {
                  const color =
                    priorityColors[priority] || priorityColors.medium;
                  const isSelected = currentPriority === priority;

                  return (
                    <TouchableOpacity
                      key={priority}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isSelected ? color : colors.border,
                        alignItems: "center",
                        backgroundColor: isSelected
                          ? `${color}20`
                          : "transparent",
                      }}
                      onPress={() => handlePrioritySelect(priority)}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: isSelected ? color : colors.textSecondary,
                        }}
                      >
                        {priority.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
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
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.text,
                }}
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
              }}
              onPress={onSave}
              disabled={loading}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#FFFFFF",
                }}
              >
                {loading ? "Saving..." : "Save Activity"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddActivityModal;
