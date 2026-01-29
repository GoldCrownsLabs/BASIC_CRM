import React from "react";
import { View } from "react-native";
import { Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface ActivityTimelineCardProps {
  activityLogs: any[];
}

export const ActivityTimelineCard: React.FC<ActivityTimelineCardProps> = ({
  activityLogs,
}) => {
  const { colors } = useAppTheme();

  const getActivityColor = (type: string) => {
    switch (type) {
      case "login":
        return colors.info;
      case "contact":
        return colors.success;
      case "task":
        return colors.warning;
      case "meeting":
        return colors.primary;
      case "export":
        return colors.info;
      case "password":
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.text,
          marginBottom: 20,
        }}
      >
        Activity Timeline
      </Text>

      {activityLogs.length > 0 ? (
        activityLogs.map((activity, index) => (
          <View
            key={activity.id}
            style={{
              flexDirection: "row",
              paddingVertical: 16,
              borderBottomWidth: index < activityLogs.length - 1 ? 1 : 0,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ marginRight: 16 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: getActivityColor(activity.type) + "20",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Feather
                  name={activity.icon}
                  size={20}
                  color={getActivityColor(activity.type)}
                />
              </View>

              {index < activityLogs.length - 1 && (
                <View
                  style={{
                    flex: 1,
                    width: 2,
                    backgroundColor: colors.border,
                    alignSelf: "center",
                    marginTop: 4,
                  }}
                />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 4,
                }}
              >
                {activity.title}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                {activity.description}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                {activity.time}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <Feather
            name="activity"
            size={48}
            color={colors.textSecondary}
            style={{ marginBottom: 16 }}
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 8,
            }}
          >
            No Activity Logs
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: "center",
            }}
          >
            Your activity logs will appear here
          </Text>
        </View>
      )}
    </View>
  );
};
