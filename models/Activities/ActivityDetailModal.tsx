import React from "react";
import { Modal, View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Activity, activityConfig } from "@/lib/api/activities.api";

interface ActivityDetailModalProps {
  visible: boolean;
  selectedActivity: Activity | null;
  colors: any;
  isDark: boolean;
  priorityColors: Record<string, string>;
  statusColors: Record<string, string>;
  onClose: () => void;
  onDelete: (id: string) => void;
  onMarkComplete: (id: string) => void;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  visible,
  selectedActivity,
  colors,
  isDark,
  priorityColors,
  statusColors,
  onClose,
  onDelete,
  onMarkComplete,
}) => {
  if (!selectedActivity) return null;

  const status = selectedActivity.isCompleted
    ? "completed"
    : selectedActivity.status || "pending";

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
              Activity Details
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ maxHeight: "80%" }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ padding: 24 }}>
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.detailLabel}>Title</Text>
                <Text style={styles.detailValue}>{selectedActivity.title}</Text>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={styles.detailLabel}>Type</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: activityConfig[selectedActivity.type].bg,
                      marginRight: 10,
                    }}
                  >
                    <Feather
                      name={activityConfig[selectedActivity.type].icon}
                      size={16}
                      color={activityConfig[selectedActivity.type].color}
                    />
                  </View>
                  <Text style={styles.detailValue}>
                    {activityConfig[selectedActivity.type].label}
                  </Text>
                </View>
              </View>

              {selectedActivity.contactName && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.detailLabel}>Contact</Text>
                  <Text style={styles.detailValue}>
                    {selectedActivity.contactName}
                  </Text>
                </View>
              )}

              {selectedActivity.company && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.detailLabel}>Company</Text>
                  <Text style={styles.detailValue}>
                    {selectedActivity.company}
                  </Text>
                </View>
              )}

              {selectedActivity.description && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>
                    {selectedActivity.description}
                  </Text>
                </View>
              )}

              <View style={{ marginBottom: 20 }}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {selectedActivity.date} • {selectedActivity.time}
                  {selectedActivity.duration &&
                    ` • ${selectedActivity.duration}`}
                </Text>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={styles.detailLabel}>Priority</Text>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    backgroundColor: `${priorityColors[selectedActivity.priority]}20`,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      color: priorityColors[selectedActivity.priority],
                      fontWeight: "600",
                    }}
                  >
                    {selectedActivity.priority.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={{ marginBottom: 30 }}>
                <Text style={styles.detailLabel}>Status</Text>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    backgroundColor: `${statusColors[status]}20`,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      color: statusColors[status],
                      fontWeight: "600",
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </View>
              </View>

              {!selectedActivity.isCompleted && (
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                  onPress={() => onMarkComplete(selectedActivity._id)}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                    Mark as Completed
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={{
                  backgroundColor: "#DC2626",
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
                onPress={() => onDelete(selectedActivity._id)}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  Delete Activity
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  detailLabel: {
    fontSize: 12,
    fontWeight: 600 as const,
    color: "#9CA3AF",
    marginBottom: 4,
    textTransform: "uppercase" as const,
  },
  detailValue: {
    fontSize: 16,
    color: "#000",
    lineHeight: 24,
  },
};

export default ActivityDetailModal;
