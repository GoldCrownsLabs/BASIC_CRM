import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { StatsCard } from "./StatsCard";
import { useAppTheme } from "@/context/ThemeContext";

interface StatsOverviewProps {
  loading: boolean;
  leadStats: any;
  totalPipelineValue: number;
  onCalculateConversionRate: () => string;
  onFormatCurrency: (amount: number) => string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  loading,
  leadStats,
  totalPipelineValue,
  onCalculateConversionRate,
  onFormatCurrency,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={{ paddingHorizontal: 15, marginTop: 15 }}>
      <ThemedText
        type="subtitle"
        style={{ marginBottom: 15, color: colors.text }}
      >
        Overview
      </ThemedText>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <StatsCard
          title="Total Leads"
          value={leadStats?.totalLeads || 0}
          iconName="trending-up"
          iconColor="#2196F3"
          backgroundColor={colors.card}
          loading={loading}
        />

        <StatsCard
          title="Hot Leads"
          value={leadStats?.hotLeads || 0}
          iconName="flame"
          iconColor="#F44336"
          backgroundColor={colors.card}
          loading={loading}
        />

        <StatsCard
          title="Conversion Rate"
          value={`${onCalculateConversionRate()}%`}
          iconName="stats-chart"
          iconColor="#4CAF50"
          backgroundColor={colors.card}
          loading={loading}
        />

        <StatsCard
          title="Pipeline Value"
          value={onFormatCurrency(totalPipelineValue).replace("$", "")}
          iconName="cash"
          iconColor="#9C27B0"
          backgroundColor={colors.card}
          loading={loading}
        />
      </View>
    </View>
  );
};
