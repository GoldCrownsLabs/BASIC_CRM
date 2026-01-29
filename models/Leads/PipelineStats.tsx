import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { LeadStats } from "@/lib/api/leads.api";

interface PipelineStatsProps {
  totalPipelineValue: number;
  stats: LeadStats | null;
  totalLeads: number;
  formatCurrency: (amount: number) => string;
}

export const PipelineStats: React.FC<PipelineStatsProps> = ({
  totalPipelineValue,
  stats,
  totalLeads,
  formatCurrency,
}) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        marginHorizontal: 15,
        marginTop: 15,
        marginBottom: 15,
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Ionicons name="trending-up" size={24} color={colors.primary} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <ThemedText
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginBottom: 2,
            }}
          >
            Total Pipeline Value
          </ThemedText>
          <ThemedText
            type="title"
            style={{ color: colors.primary, fontSize: 20, fontWeight: "bold" }}
          >
            {formatCurrency(totalPipelineValue)}
          </ThemedText>
        </View>
        {stats && (
          <View style={{ alignItems: "flex-end" }}>
            <ThemedText style={{ color: colors.textSecondary, fontSize: 11 }}>
              {stats.conversionRate}% Conversion
            </ThemedText>
          </View>
        )}
      </View>
      <ThemedText style={{ color: colors.textSecondary, fontSize: 11 }}>
        {totalLeads} Leads • Won:{" "}
        {stats?.leadsByStatus?.find((s) => s._id === "closed_won")?.count || 0}{" "}
        • Lost:{" "}
        {stats?.leadsByStatus?.find((s) => s._id === "closed_lost")?.count || 0}{" "}
        • Hot: {stats?.hotLeads || 0}
      </ThemedText>
    </View>
  );
};
