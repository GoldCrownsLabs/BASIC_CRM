import React from "react";
import { View } from "react-native";
import { Text } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

interface StatsCardProps {
  user: any;
  stats: {
    contacts: number;
    activeLeads: number;
    activities: number;
    meetings: number;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({ user, stats }) => {
  const { colors } = useAppTheme();

  const formatData = (value: any, fallback: string = "0") => {
    if (!value || value === "" || value === undefined || value === null) {
      return fallback;
    }
    return value.toString();
  };

  const statItems = [
    {
      label: "Addresses",
      value: user?.addresses?.length || 0,
      color: colors.primary,
    },
    {
      label: "Verified",
      value: user?.emailVerified ? 1 : 0,
      color: colors.success,
    },
    { label: "Activities", value: stats.activities, color: colors.warning },
  ];

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
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.text,
          marginBottom: 20,
        }}
      >
        Stats
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {statItems?.map((stat, index) => (
          <View key={index} style={{ alignItems: "center", flex: 1 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: stat.color,
                marginBottom: 4,
              }}
            >
              {formatData(stat.value)}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              {stat?.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
