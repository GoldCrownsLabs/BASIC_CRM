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
}

const ActivitiesChart: React.FC<ActivitiesChartProps> = ({
  activitiesByType,
}) => {
  const { colors, isDark } = useAppTheme();

  if (!activitiesByType?.length) return null;

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
          Activities
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
          const activityColor = isDark ? activity.color : activity.color;

          return (
            <View key={activity.type} style={{ alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
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
                  name={activity.icon as any}
                  size={20}
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
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ActivitiesChart;
