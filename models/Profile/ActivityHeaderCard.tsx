import React from "react";
import { View } from "react-native";
import { Text } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

interface ActivityHeaderCardProps {
  activityLogs: any[];
  securitySettings: any;
}

export const ActivityHeaderCard: React.FC<ActivityHeaderCardProps> = ({
  activityLogs,
  securitySettings,
}) => {
  const { colors } = useAppTheme();

  const formatData = (value: any, fallback: string = "N/A") => {
    if (!value || value === "" || value === undefined || value === null) {
      return fallback;
    }
    return value;
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
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
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: colors.text,
          }}
        >
          Recent Activity
        </Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
          Last 30 days
        </Text>
      </View>

      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "700",
            color: colors.primary,
          }}
        >
          {activityLogs.length}
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          activities this month
        </Text>
      </View>

      <Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: "center",
        }}
      >
        Last login: {formatData(securitySettings.lastLogin)}
      </Text>
    </View>
  );
};
