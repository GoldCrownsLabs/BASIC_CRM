import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/context/ThemeContext";

interface PerformanceMetricsProps {
  leadStats: any;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  leadStats,
}) => {
  const { colors } = useAppTheme();

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
      <ThemedText type="subtitle" style={{ color: colors.text }}>
        Performance
      </ThemedText>

      <View
        style={{
          flexDirection: "column",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <View style={{ width: "100%", alignItems: "flex-start" }}>
          <ThemedText
            type="title"
            style={{
              fontSize: 20,
              fontWeight: "700",
              marginBottom: 4,
              color: "#4CAF50",
            }}
          >
            {leadStats?.conversionRate || "0.00"}%
          </ThemedText>
          <ThemedText type="default" style={{ color: colors.textSecondary }}>
            Conversion Rate
          </ThemedText>
          <View
            style={{
              width: "100%",
              height: 4,
              borderRadius: 2,
              marginTop: 8,
              overflow: "hidden",
              backgroundColor: colors.border,
            }}
          >
            <View
              style={{
                height: "100%",
                borderRadius: 2,
                width: `${parseFloat(leadStats?.conversionRate || "0")}%`,
                backgroundColor: "#4CAF50",
              }}
            />
          </View>
        </View>
      </View>
    </ThemedView>
  );
};
