// models/Analytics/WeeklyTrends.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface WeeklyTrendData {
  day: string;
  activities: number;
  leads: number;
}

interface WeeklyTrendsProps {
  weeklyTrends: WeeklyTrendData[];
}

const WeeklyTrends: React.FC<WeeklyTrendsProps> = ({ weeklyTrends }) => {
  const { colors, isDark } = useAppTheme();

  if (!weeklyTrends?.length) return null;

  const leadsColor = isDark ? "#60A5FA" : "#3B82F6";
  const activitiesColor = isDark ? "#34D399" : "#10B981";

  // Calculate max value for scaling
  const maxValue = Math.max(
    ...weeklyTrends.map((d) => Math.max(d.activities, d.leads)),
  );

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
          const leadsHeight = maxValue > 0 ? (day.leads / maxValue) * 80 : 5;
          const activitiesHeight =
            maxValue > 0 ? (day.activities / maxValue) * 80 : 5;

          return (
            <View key={day.day} style={{ alignItems: "center" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  gap: 4,
                  height: 80,
                }}
              >
                {/* Leads Bar */}
                <View
                  style={{
                    width: 8,
                    height: leadsHeight,
                    backgroundColor: leadsColor,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: isDark ? `${leadsColor}80` : `${leadsColor}30`,
                  }}
                />
                {/* Activities Bar */}
                <View
                  style={{
                    width: 8,
                    height: activitiesHeight,
                    backgroundColor: activitiesColor,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: isDark
                      ? `${activitiesColor}80`
                      : `${activitiesColor}30`,
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
              <View style={{ flexDirection: "row", gap: 4, marginTop: 2 }}>
                <Text
                  style={{
                    fontSize: 9,
                    color: leadsColor,
                    fontWeight: "600",
                  }}
                >
                  {day.leads}L
                </Text>
                <Text
                  style={{
                    fontSize: 9,
                    color: activitiesColor,
                    fontWeight: "600",
                  }}
                >
                  {day.activities}A
                </Text>
              </View>
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
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: leadsColor,
            }}
          />
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            Leads ({weeklyTrends.reduce((sum, day) => sum + day.leads, 0)})
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: activitiesColor,
            }}
          />
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            Activities (
            {weeklyTrends.reduce((sum, day) => sum + day.activities, 0)})
          </Text>
        </View>
      </View>
    </View>
  );
};

export default WeeklyTrends;
