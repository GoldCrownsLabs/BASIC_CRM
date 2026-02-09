import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

interface PerformanceMetricsProps {
  leadStats: any;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  leadStats,
}) => {
  const { colors, isDark } = useAppTheme();

  // Calculate win rate from leadsByStatus
  const calculateWinRate = () => {
    if (!leadStats?.leadsByStatus || !leadStats?.totalLeads) return "0.00";

    const wonLeads = leadStats.leadsByStatus.find(
      (status: any) =>
        status._id === "closed_won" || status.status === "closed_won",
    );
    const wonCount = wonLeads?.count || 0;

    return ((wonCount / leadStats.totalLeads) * 100).toFixed(1);
  };

  // Calculate average deal value (you'll need to fetch this from your API)
  const calculateAverageDealValue = () => {
    // This is a placeholder - you need actual deal values from your API
    return "₹0";
  };

  const metrics = [
    {
      label: "Hot Leads",
      value: leadStats?.hotLeads?.toString() || "0",
      icon: "flame" as const,
      color: isDark ? "#F87171" : "#EF4444",
      description: "Urgent attention needed",
    },
    {
      label: "Conversion Rate",
      value: `${leadStats?.conversionRate || "0.00"}%`,
      icon: "repeat" as const,
      color: isDark ? "#34D399" : "#10B981",
      description: "Leads converted to deals",
    },
    {
      label: "Win Rate",
      value: `${calculateWinRate()}%`,
      icon: "trophy" as const,
      color: isDark ? "#FBBF24" : "#F59E0B",
      description: "Deals won vs total",
    },
    {
      label: "Avg. Deal Value",
      value: calculateAverageDealValue(),
      icon: "cash" as const,
      color: isDark ? "#60A5FA" : "#3B82F6",
      description: "Average closed deal value",
    },
  ];

  return (
    <ThemedView
      style={{
        marginHorizontal: 15,
        marginTop: 15,
        padding: 20,
        borderRadius: 20,
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <ThemedText
        type="subtitle"
        style={{ color: colors.text, marginBottom: 20 }}
      >
        Performance Metrics
      </ThemedText>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {metrics.map((metric, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              minWidth: "45%",
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.02)",
              padding: 16,
              borderRadius: 16,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: metric.color + "20",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Ionicons name={metric.icon} size={20} color={metric.color} />
            </View>
            <ThemedText
              type="title"
              style={{ color: colors.text, fontSize: 20, marginBottom: 4 }}
            >
              {metric.value}
            </ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={{ color: colors.text, fontSize: 14, marginBottom: 4 }}
            >
              {metric.label}
            </ThemedText>
            <ThemedText
              type="default"
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                textAlign: "center",
              }}
            >
              {metric.description}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Priority Distribution Bar */}
      {leadStats?.leadsByPriority && leadStats.leadsByPriority.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <ThemedText
            type="defaultSemiBold"
            style={{ color: colors.text, marginBottom: 12 }}
          >
            Priority Distribution
          </ThemedText>
          <View style={{ flexDirection: "row", gap: 4, height: 24 }}>
            {leadStats.leadsByPriority.map((priority: any, index: number) => {
              const priorityValue = priority.count || 0;
              const totalPriority = leadStats.leadsByPriority.reduce(
                (sum: number, p: any) => sum + (p.count || 0),
                0,
              );
              const percentage =
                totalPriority > 0 ? (priorityValue / totalPriority) * 100 : 0;

              const priorityColor =
                priority._id === "high"
                  ? isDark
                    ? "#F87171"
                    : "#EF4444"
                  : priority._id === "medium"
                    ? isDark
                      ? "#FBBF24"
                      : "#F59E0B"
                    : isDark
                      ? "#34D399"
                      : "#10B981";

              const priorityLabel =
                priority._id === "high"
                  ? "High"
                  : priority._id === "medium"
                    ? "Medium"
                    : "Low";

              return (
                <View
                  key={priority._id}
                  style={{
                    flex: percentage,
                    backgroundColor: priorityColor,
                    borderRadius:
                      index === 0
                        ? 12
                        : index === leadStats.leadsByPriority.length - 1
                          ? 12
                          : 0,
                    borderTopLeftRadius: index === 0 ? 12 : 0,
                    borderBottomLeftRadius: index === 0 ? 12 : 0,
                    borderTopRightRadius:
                      index === leadStats.leadsByPriority.length - 1 ? 12 : 0,
                    borderBottomRightRadius:
                      index === leadStats.leadsByPriority.length - 1 ? 12 : 0,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ThemedText
                    type="default"
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "700",
                    }}
                  >
                    {priorityLabel}: {priorityValue}
                  </ThemedText>
                </View>
              );
            })}
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            {leadStats.leadsByPriority.map((priority: any) => {
              const priorityLabel =
                priority._id === "high"
                  ? "High"
                  : priority._id === "medium"
                    ? "Medium"
                    : "Low";

              const priorityColor =
                priority._id === "high"
                  ? isDark
                    ? "#F87171"
                    : "#EF4444"
                  : priority._id === "medium"
                    ? isDark
                      ? "#FBBF24"
                      : "#F59E0B"
                    : isDark
                      ? "#34D399"
                      : "#10B981";

              return (
                <View
                  key={priority._id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: priorityColor,
                    }}
                  />
                  <ThemedText
                    type="default"
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                    }}
                  >
                    {priorityLabel} ({priority.count || 0})
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ThemedView>
  );
};
