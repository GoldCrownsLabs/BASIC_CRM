import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";

interface StatsSummaryProps {
  stats: {
    total: number;
    active: number;
    vip: number;
    hotLeads: number;
  };
}

export default function StatsSummary({ stats }: StatsSummaryProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginHorizontal: 15,
        marginTop: 15,
        marginBottom: 15,
        borderRadius: 16,
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <View style={{ flex: 1, alignItems: "center" }}>
        <ThemedText
          type="title"
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: colors.primary,
          }}
        >
          {stats.total.toLocaleString()}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 11,
            marginTop: 4,
            color: colors.textSecondary,
          }}
        >
          Total
        </ThemedText>
      </View>
      <View style={{ width: 1, height: 30, backgroundColor: colors.border }} />
      <View style={{ flex: 1, alignItems: "center" }}>
        <ThemedText
          type="title"
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: colors.success,
          }}
        >
          {stats.active.toLocaleString()}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 11,
            marginTop: 4,
            color: colors.textSecondary,
          }}
        >
          Active
        </ThemedText>
      </View>
      <View style={{ width: 1, height: 30, backgroundColor: colors.border }} />
      <View style={{ flex: 1, alignItems: "center" }}>
        <ThemedText
          type="title"
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: colors.warning,
          }}
        >
          {stats.vip.toLocaleString()}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 11,
            marginTop: 4,
            color: colors.textSecondary,
          }}
        >
          VIP
        </ThemedText>
      </View>
      <View style={{ width: 1, height: 30, backgroundColor: colors.border }} />
      <View style={{ flex: 1, alignItems: "center" }}>
        <ThemedText
          type="title"
          style={{ fontSize: 18, fontWeight: "bold", color: colors.info }}
        >
          {stats.hotLeads.toLocaleString()}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 11,
            marginTop: 4,
            color: colors.textSecondary,
          }}
        >
          Hot Leads
        </ThemedText>
      </View>
    </View>
  );
}
