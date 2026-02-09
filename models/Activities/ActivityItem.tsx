import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import {
  Activity,
  ActivityConfig,
  formatActivityTime,
  formatDuration,
  formatIndianDateTime,
} from "@/lib/api/activities.api";

interface ActivityItemProps {
  item: Activity;
  config: ActivityConfig;
  priorityColor: string;
  statusColor: string;
  status: string;
  contactName: string;
  company: string;
  colors: any;
  isDark: boolean;
  onPress: () => void;
  onMarkComplete: (id: string) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  item,
  config,
  priorityColor,
  statusColor,
  status,
  contactName,
  company,
  colors,
  isDark,
  onPress,
  onMarkComplete,
}) => {
  // ✅ Safe priority handling
  const priority = item.priority || "medium";
  const safePriorityColor = priorityColor || "#F59E0B";
  const priorityText = priority.toUpperCase();

  // ✅ Safe status handling
  const safeStatus = status || "pending";
  const safeStatusColor = statusColor || "#6B7280";

  // ✅ Format date, time and duration
  const formattedDate = formatIndianDateTime(item.date);
  const formattedTime = formatActivityTime(item.time || "", item.date);
  const formattedDuration = formatDuration(item.duration);

  // ✅ Check if time should be shown
  const shouldShowTime = () => {
    if (!item.date) return false;
    try {
      const date = new Date(item.date);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return !(hours === 0 && minutes === 0);
    } catch {
      return false;
    }
  };

  const showTime = shouldShowTime();

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.card,
        borderRadius: 20,
        marginBottom: 16,
        padding: 18,
        shadowColor: isDark ? "#000" : "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: isDark ? 0.25 : 0.08,
        shadowRadius: isDark ? 8 : 6,
        elevation: isDark ? 10 : 4,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header with type and status */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: config.bg + "40",
              marginRight: 12,
              borderWidth: 1,
              borderColor: config.bg,
            }}
          >
            <Feather name={config.icon as any} size={20} color={config.color} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                marginBottom: 6,
                color: colors.text,
                lineHeight: 22,
              }}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            {/* Contact & Company */}
            {(contactName || company) && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {contactName && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <FontAwesome
                      name="user"
                      size={11}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                        marginLeft: 4,
                        fontWeight: "500",
                      }}
                    >
                      {contactName}
                    </Text>
                  </View>
                )}

                {company && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons
                      name="business"
                      size={11}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                        marginLeft: 4,
                        fontWeight: "500",
                      }}
                    >
                      {company}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: `${safeStatusColor}15`,
            borderWidth: 1,
            borderColor: safeStatusColor + "30",
            minWidth: 70,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: safeStatusColor,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
          </Text>
        </View>
      </View>

      {/* Description */}
      {item.description && (
        <Text
          style={{
            fontSize: 14.5,
            color: colors.textSecondary,
            lineHeight: 22,
            marginBottom: 16,
            backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC",
            padding: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0",
          }}
          numberOfLines={3}
        >
          {item.description}
        </Text>
      )}

      {/* Date, Time & Duration Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "rgba(255,255,255,0.1)" : "#F1F5F9",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          {/* Date */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "#3B82F615",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 8,
              }}
            >
              <Feather name="calendar" size={14} color="#3B82F6" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginBottom: 2,
                  fontWeight: "500",
                }}
              >
                Date
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.text,
                  fontWeight: "600",
                }}
              >
                {formattedDate}
              </Text>
            </View>
          </View>

          {/* Time (only if specified) */}
          {/* {showTime && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#10B98115",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 8,
                }}
              >
                <Feather name="clock" size={14} color="#10B981" />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginBottom: 2,
                    fontWeight: "500",
                  }}
                >
                  Time
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text,
                    fontWeight: "600",
                  }}
                >
                  {formattedTime}
                </Text>
              </View>
            </View>
          )} */}
        </View>

        {/* Duration (if available) */}
        {item.duration && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "#E0F2FE",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              marginLeft: 12,
            }}
          >
            <Feather name="watch" size={12} color="#0EA5E9" />
            <Text
              style={{
                color: "#0EA5E9",
                marginLeft: 6,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {formattedDuration}
            </Text>
          </View>
        )}
      </View>

      {/* Footer with Priority and Action Button */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Priority Badge */}
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: `${safePriorityColor}15`,
            borderWidth: 1,
            borderColor: safePriorityColor + "30",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Feather
            name="flag"
            size={12}
            color={safePriorityColor}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: safePriorityColor,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {priorityText}
          </Text>
        </View>

        {/* Mark as Completed Button */}
        {!item.isCompleted && (
          <TouchableOpacity
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: safeStatusColor + "20",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: safeStatusColor + "40",
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => onMarkComplete(item._id)}
          >
            <Feather
              name="check-circle"
              size={14}
              color={safeStatusColor}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                color: safeStatusColor,
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              Complete
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Completed indicator */}
      {item.isCompleted && (
        <View
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            backgroundColor: "#10B981",
            width: 24,
            height: 24,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 2,
            borderColor: colors.card,
          }}
        >
          <Feather name="check" size={12} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ActivityItem;
