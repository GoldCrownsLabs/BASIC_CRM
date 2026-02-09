import React from "react";
import { Modal, View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  Activity,
  activityConfig,
  formatActivityTime,
  formatDuration,
  formatIndianDateTime,
} from "@/lib/api/activities.api";

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

  // ✅ Format date, time and duration
  const formattedDate = formatIndianDateTime(selectedActivity.date);
  const formattedTime = formatActivityTime(
    selectedActivity.time || "",
    selectedActivity.date,
  );
  const formattedDuration = formatDuration(selectedActivity.duration);

  // ✅ Safe priority handling
  const priority = selectedActivity.priority || "medium";
  const priorityColor = priorityColors[priority] || priorityColors.medium;

  // ✅ Safe status handling
  const status = selectedActivity.isCompleted
    ? "completed"
    : selectedActivity.status || "pending";
  const statusColor = statusColors[status] || statusColors.pending;

  // ✅ Get activity config
  const activityTypeConfig = activityConfig[selectedActivity.type];

  // ✅ Check if time should be shown (not midnight/00:00)
  const shouldShowTime = () => {
    if (!selectedActivity.date) return false;

    try {
      const date = new Date(selectedActivity.date);
      const hours = date.getHours();
      const minutes = date.getMinutes();

      // Don't show time if it's midnight (00:00) - likely means time was not specified
      return !(hours === 0 && minutes === 0);
    } catch {
      return false;
    }
  };

  const showTime = shouldShowTime();


  // console.log("Selected Activity:", selectedActivity);


  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.6)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: "92%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 24,
              paddingTop: 28,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.08)",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: activityTypeConfig.bg + "40",
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: activityTypeConfig.bg,
                }}
              >
                <Feather
                  name={activityTypeConfig.icon as any}
                  size={18}
                  color={activityTypeConfig.color}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.text,
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                >
                  {selectedActivity.title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                  }}
                >
                  {activityTypeConfig.label}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 8,
              }}
            >
              <Feather name="x" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ maxHeight: "80%" }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <View style={{ padding: 24 }}>
              {/* Contact & Company Info */}
              {(selectedActivity.contactName || selectedActivity.company) && (
                <View
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "#F8FAFC",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
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
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.primary + "20",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <Feather name="user" size={16} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: colors.text,
                          marginBottom: 2,
                        }}
                      >
                        {selectedActivity.contactName || "No Contact"}
                      </Text>
                      {selectedActivity.company && (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Feather
                            name="briefcase"
                            size={12}
                            color={colors.textSecondary}
                          />
                          <Text
                            style={{
                              fontSize: 14,
                              color: colors.textSecondary,
                              marginLeft: 4,
                            }}
                          >
                            {selectedActivity.company}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* Description */}
              {selectedActivity.description && (
                <View
                  style={{
                    marginBottom: 20,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "#F8FAFC",
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.textSecondary,
                      marginBottom: 8,
                    }}
                  >
                    Description
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      lineHeight: 22,
                      color: colors.text,
                    }}
                  >
                    {selectedActivity.description}
                  </Text>
                </View>
              )}

              {/* Date & Time Section */}
              <View
                style={{
                  marginBottom: 20,
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "#F8FAFC",
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.textSecondary,
                    marginBottom: 12,
                  }}
                >
                  Schedule
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    marginBottom: 12,
                    flex: 1,
                  }}
                >
                  {/* Date Card - Always show */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: showTime ? 1 : 2,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: "#3B82F620",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <Feather name="calendar" size={16} color="#3B82F6" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textSecondary,
                          marginBottom: 2,
                        }}
                      >
                        Date
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: colors.text,
                        }}
                      >
                        {formattedDate}
                      </Text>
                    </View>
                  </View>

                  {/* Time Card - Only show if time is specified */}
                  {/* {showTime && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: 1,
                        marginLeft: 16,
                      }}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          backgroundColor: "#10B98120",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 12,
                        }}
                      >
                        <Feather name="clock" size={16} color="#10B981" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.textSecondary,
                            marginBottom: 2,
                          }}
                        >
                          Time
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: colors.text,
                          }}
                        >
                          {formattedTime}
                        </Text>
                      </View>
                    </View>
                  )} */}
                </View>

                {/* Duration */}
                {selectedActivity.duration && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "white",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                      marginTop: 8,
                    }}
                  >
                    <Feather name="watch" size={16} color={colors.primary} />
                    <Text
                      style={{
                        color: colors.primary,
                        marginLeft: 8,
                        fontSize: 14,
                        fontWeight: "500",
                        flex: 1,
                      }}
                    >
                      Duration: {formattedDuration}
                    </Text>
                  </View>
                )}
              </View>

              {/* Priority & Status Cards */}
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
                {/* Priority Card */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "#F8FAFC",
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: priorityColor + "20",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 8,
                      }}
                    >
                      <Feather name="flag" size={14} color={priorityColor} />
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.textSecondary,
                      }}
                    >
                      Priority
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: priorityColor + "15",
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        color: priorityColor,
                        fontWeight: "700",
                        fontSize: 13,
                      }}
                    >
                      {priority.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Status Card */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "#F8FAFC",
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: statusColor + "20",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 8,
                      }}
                    >
                      <Feather
                        name="check-circle"
                        size={14}
                        color={statusColor}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.textSecondary,
                      }}
                    >
                      Status
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: statusColor + "15",
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        color: statusColor,
                        fontWeight: "700",
                        fontSize: 13,
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Additional Info */}
              {(selectedActivity.location ||
                selectedActivity.notes ||
                selectedActivity.outcome) && (
                <View
                  style={{
                    marginBottom: 20,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "#F8FAFC",
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.textSecondary,
                      marginBottom: 12,
                    }}
                  >
                    Additional Information
                  </Text>

                  {selectedActivity.location && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <Feather
                        name="map-pin"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.text,
                          marginLeft: 8,
                          flex: 1,
                        }}
                      >
                        {selectedActivity.location}
                      </Text>
                    </View>
                  )}

                  {selectedActivity.notes && (
                    <View style={{ marginBottom: 10 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.textSecondary,
                          marginBottom: 4,
                        }}
                      >
                        Notes
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.text,
                          lineHeight: 20,
                        }}
                      >
                        {selectedActivity.notes}
                      </Text>
                    </View>
                  )}

                  {selectedActivity.outcome && (
                    <View>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.textSecondary,
                          marginBottom: 4,
                        }}
                      >
                        Outcome
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.text,
                          lineHeight: 20,
                        }}
                      >
                        {selectedActivity.outcome}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Created Info */}
              {selectedActivity.createdAt && (
                <View
                  style={{
                    marginBottom: 20,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "#F8FAFC",
                    borderRadius: 16,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Feather
                    name="calendar"
                    size={12}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginLeft: 6,
                      flex: 1,
                    }}
                  >
                    Created: {formatIndianDateTime(selectedActivity.createdAt)}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={{ gap: 12 }}>
                {!selectedActivity.isCompleted && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.primary,
                      padding: 18,
                      borderRadius: 14,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                    onPress={() => onMarkComplete(selectedActivity._id)}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name="check"
                      size={20}
                      color="#FFFFFF"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontWeight: "700",
                        fontSize: 16,
                      }}
                    >
                      Mark as Completed
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={{
                    backgroundColor: isDark
                      ? "rgba(220, 38, 38, 0.2)"
                      : "#FEE2E2",
                    padding: 18,
                    borderRadius: 14,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: isDark ? "#DC262640" : "#FECACA",
                  }}
                  onPress={() => onDelete(selectedActivity._id)}
                  activeOpacity={0.8}
                >
                  <Feather
                    name="trash-2"
                    size={20}
                    color="#DC2626"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: "#DC2626",
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    Delete Activity
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ActivityDetailModal;
