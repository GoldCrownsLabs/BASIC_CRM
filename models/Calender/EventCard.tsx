// components/EventCard.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { CalendarEvent } from "@/lib/api/calender.api";


interface EventCardProps {
  event: CalendarEvent;
  onPress: (event: CalendarEvent) => void;
  eventConfig: Record<string, any>;
  statusConfig: Record<string, any>;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  eventConfig,
  statusConfig,
}) => {
  const { colors, isDark } = useAppTheme();
  const config = eventConfig[event.type] || eventConfig.meeting;
  const status = statusConfig[event.status] || statusConfig.scheduled;

  return (
    <TouchableOpacity
      onPress={() => onPress(event)}
      activeOpacity={0.8}
      style={{
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        borderLeftWidth: 6,
        borderLeftColor: config.color,
        shadowColor: config.color,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDark ? 0.25 : 0.15,
        shadowRadius: 12,
        elevation: isDark ? 6 : 4,
        transform: [{ scale: 1 }],
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}
      >
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor: isDark ? `${config.color}25` : `${config.color}15`,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 14,
            borderWidth: 2,
            borderColor: config.color + "30",
          }}
        >
          <Feather name={config.icon} size={22} color={config.color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 4,
            }}
          >
            {event.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Feather
              name="clock"
              size={13}
              color={colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              {event.startTime}
              {event.endTime && ` - ${event.endTime}`}
            </Text>
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.textSecondary,
                marginHorizontal: 8,
              }}
            />
            <Feather
              name="user"
              size={13}
              color={colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              {event.contactName?.split(" ")[0] || "Unknown"}
            </Text>
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
            backgroundColor: isDark ? `${status.color}25` : `${status.color}12`,
            borderWidth: 1,
            borderColor: status.color + "30",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "800",
              color: status.color,
              letterSpacing: 0.5,
            }}
          >
            {status.label.toUpperCase()}
          </Text>
        </View>
      </View>

      {event.description && (
        <Text
          style={{
            fontSize: 14.5,
            color: colors.textSecondary,
            lineHeight: 22,
            marginBottom: 14,
            fontStyle: "italic",
          }}
          numberOfLines={2}
        >
          {event.description}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: isDark ? colors.border + "50" : colors.border + "30",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {event.priority === "high" ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark
                  ? "rgba(220, 38, 38, 0.25)"
                  : "rgba(220, 38, 38, 0.1)",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isDark
                  ? "rgba(220, 38, 38, 0.4)"
                  : "rgba(220, 38, 38, 0.2)",
              }}
            >
              <Feather
                name="alert-circle"
                size={12}
                color={isDark ? "#F87171" : "#DC2626"}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: isDark ? "#F87171" : "#DC2626",
                  marginLeft: 4,
                }}
              >
                HIGH PRIORITY
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: isDark
                  ? colors.border + "40"
                  : colors.border + "20",
              }}
            >
              <Feather
                name="briefcase"
                size={12}
                color={colors.textSecondary}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginLeft: 4,
                }}
              >
                {event.company || "No Company"}
              </Text>
            </View>
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark
              ? colors.border + "40"
              : colors.border + "20",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Feather name="calendar" size={12} color={colors.textSecondary} />
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: colors.textSecondary,
              marginLeft: 4,
            }}
          >
            {new Date(event.date).getDate()}/
            {new Date(event.date).getMonth() + 1}/
            {new Date(event.date).getFullYear().toString().slice(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
