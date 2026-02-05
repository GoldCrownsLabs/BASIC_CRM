import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface LeadsFunnelProps {
  leadsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
    color: string;
  }>;
}

const LeadsFunnel: React.FC<LeadsFunnelProps> = ({ leadsByStatus }) => {
  const { colors, isDark } = useAppTheme();

  if (!leadsByStatus?.length) return null;

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
          Leads Funnel
        </Text>
        <TouchableOpacity>
          <Feather
            name="more-vertical"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={{ gap: 12 }}>
        {leadsByStatus.map((stage) => {
          const stageColor = isDark ? stage.color : stage.color;

          return (
            <View
              key={stage.status}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View style={{ width: 40, alignItems: "center" }}>
                <View
                  style={{
                    width: 20,
                    height: 32,
                    backgroundColor: stageColor,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    opacity: isDark ? 0.9 : 0.8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.text,
                    marginTop: 4,
                  }}
                >
                  {stage.count}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: colors.text,
                    marginBottom: 2,
                  }}
                >
                  {stage.status}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: colors.border,
                      flex: 1,
                      marginRight: 8,
                    }}
                  >
                    <View
                      style={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: stageColor,
                        width: `${stage.percentage}%`,
                      }}
                    />
                  </View>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {stage.percentage}%
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default LeadsFunnel;
