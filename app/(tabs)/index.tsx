import React from "react";
import { ScrollView, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/context/ThemeContext";
import { useAuthStore } from "@/store/auth.store";
import { useDashboard } from "@/hooks/useDashboard";
import { getStageLabel } from "@/utils/dashboard.utils";
import { WelcomeHeader } from "@/models/Home/WelcomeHeader";
import { StatsOverview } from "@/models/Home/StatsOverview";
import { QuickActions } from "@/models/Home/QuickActions";
import { RecentLeads } from "@/models/Home/RecentLeads";
import { PerformanceMetrics } from "@/models/Home/PerformanceMetrics";
import { SyncStatus } from "@/models/Home/SyncStatus";

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { colors, isDark } = useAppTheme(); // ✅ एक ही जगह से सभी values ले लो

  const {
    greeting,
    refreshing,
    leadStats,
    recentLeads,
    loading,
    fadeAnim,
    totalPipelineValue,
    onRefresh,
    calculateConversionRate,
    formatCurrency,
  } = useDashboard();

  // ✅ अब function के inside में hook नहीं है
  const getMutedBackground = () => {
    return isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Welcome Header */}
        <WelcomeHeader
          greeting={greeting}
          userName={user?.name || "User"}
          fadeAnim={fadeAnim}
        />

        {/* Stats Overview */}
        <StatsOverview
          loading={loading}
          leadStats={leadStats}
          totalPipelineValue={totalPipelineValue}
          onCalculateConversionRate={calculateConversionRate}
          onFormatCurrency={formatCurrency}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Leads */}
        <RecentLeads
          loading={loading}
          recentLeads={recentLeads}
          formatCurrency={formatCurrency}
          getStageLabel={getStageLabel}
          getMutedBackground={getMutedBackground}
        />

        {/* Performance Metrics */}
        <PerformanceMetrics leadStats={leadStats} />

        {/* Sync Status */}
        <SyncStatus />

        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
