// models/Analytics/ActivitiesChart.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface ActivityData {
  type: string;
  icon: string;
  count: number;
  color: string;
}

interface ActivitiesChartProps {
  activitiesByType: ActivityData[];
  onActivityClick?: (type: string) => void; // Add this prop
}

const ActivitiesChart: React.FC<ActivitiesChartProps> = ({
  activitiesByType,
  onActivityClick,
}) => {
  const { colors, isDark } = useAppTheme();

  if (!activitiesByType?.length) return null;

  // Map activity types to icons and colors
  const getActivityConfig = (type: string) => {
    const configs = {
      call: { icon: "phone", color: isDark ? "#34D399" : "#10B981" },
      meeting: { icon: "calendar", color: isDark ? "#60A5FA" : "#3B82F6" },
      note: { icon: "file-text", color: isDark ? "#A78BFA" : "#8B5CF6" },
      task: { icon: "check-square", color: isDark ? "#FBBF24" : "#F59E0B" },
      email: { icon: "mail", color: isDark ? "#F87171" : "#EF4444" },
    };

    return (
      configs[type as keyof typeof configs] || {
        icon: "activity",
        color: colors.primary,
      }
    );
  };

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
          Activities by Type
        </Text>
        <TouchableOpacity>
          <Feather
            name="more-vertical"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {activitiesByType.map((activity) => {
          const config = getActivityConfig(activity.type);
          const activityColor = activity.color || config.color;

          return (
            <TouchableOpacity
              key={activity.type}
              style={{ alignItems: "center", flex: 1 }}
              onPress={() => onActivityClick?.(activity.type)}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: isDark
                    ? `${activityColor}30`
                    : `${activityColor}15`,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Feather
                  name={config.icon as any}
                  size={22}
                  color={activityColor}
                />
              </View>
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: colors.text }}
              >
                {activity.count}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginTop: 4,
                  textTransform: "capitalize",
                }}
              >
                {activity.type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Total Activities */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 20,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.02)",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Feather name="activity" size={16} color={colors.primary} />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 14,
              fontWeight: "600",
              color: colors.text,
            }}
          >
            Total:{" "}
            {activitiesByType.reduce(
              (sum, activity) => sum + activity.count,
              0,
            )}{" "}
            activities
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ActivitiesChart;
