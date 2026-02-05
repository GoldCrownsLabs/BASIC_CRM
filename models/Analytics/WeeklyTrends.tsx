import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface WeeklyTrendData {
  day: string;
  activities: number;
}

interface WeeklyTrendsProps {
  weeklyTrends: WeeklyTrendData[];
}

const WeeklyTrends: React.FC<WeeklyTrendsProps> = ({ weeklyTrends }) => {
  const { colors, isDark } = useAppTheme();

  if (!weeklyTrends?.length) return null;

  const leadsColor = isDark ? "#60A5FA" : "#3B82F6";
  const activitiesColor = isDark ? "#34D399" : "#10B981";

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.1 : 0.05,
        shadowRadius: 8,
        elevation: isDark ? 4 : 2,
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
        <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text }}>
          Weekly Trends
        </Text>
        <TouchableOpacity>
          <Feather
            name="more-vertical"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "flex-end",
          height: 120,
        }}
      >
        {weeklyTrends.map((day) => {
          const maxActivities = Math.max(
            ...weeklyTrends.map((d) => d.activities),
          );
          const barHeight = (day.activities / maxActivities) * 80;

          return (
            <View key={day.day} style={{ alignItems: "center" }}>
              <View
                style={{ flexDirection: "row", alignItems: "flex-end", gap: 2 }}
              >
                <View
                  style={{
                    width: 6,
                    height: barHeight * 0.7,
                    backgroundColor: leadsColor,
                    borderRadius: 3,
                  }}
                />
                <View
                  style={{
                    width: 6,
                    height: barHeight,
                    backgroundColor: activitiesColor,
                    borderRadius: 3,
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginTop: 8,
                }}
              >
                {day.day}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                {day.activities}
              </Text>
            </View>
          );
        })}
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 20,
          marginTop: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: leadsColor,
            }}
          />
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            Leads
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: activitiesColor,
            }}
          />
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            Activities
          </Text>
        </View>
      </View>
    </View>
  );
};

export default WeeklyTrends;
