// app/(tabs)/index.tsx
import React, { useState, useEffect } from "react";
import { ScrollView, RefreshControl, View } from "react-native";
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

import { fetchActivities, Activity } from "@/lib/api/activities.api";
import { MeetingReminder } from "@/models/Home/MeetingReminder";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BannerSession from "@/models/Home/BannerSession";
import { planService, Plan } from "@/lib/api/plan";
import PlansBanner from "@/models/Home/PlanBanner";

// 🔥 IMPORT FEATURE FLAGS
import {
  MODULE_DASHBOARD,
  DASHBOARD_TOTAL_LEADS,
  DASHBOARD_TOTAL_TASKS,
  DASHBOARD_UPCOMING_MEETINGS,
  DASHBOARD_QUICK_ACTIONS,
  DASHBOARD_ANALYTICS_REALTIME,
  DASHBOARD_TOTAL_CONTACTS,
  FEATURE_SYNC_STATUS,
} from "@/components/constants/FeatureFlags";

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  // ✅ ALL HOOKS MUST BE CALLED FIRST (BEFORE ANY CONDITIONAL RETURN)
  const [hasSubscription, setHasSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Activity[]>([]);
  const [fetchingMeetings, setFetchingMeetings] = useState(false);

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

  const getMutedBackground = () => {
    return isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  };

  // ✅ useEffect HOOKS - Called BEFORE conditional return
  useEffect(() => {
    loadData();
    fetchUpcomingMeetings();
  }, []);

  useEffect(() => {
    if (!refreshing) {
      loadData();
      fetchUpcomingMeetings();
    }
  }, [refreshing]);

  // ✅ Function definitions
  const loadData = async () => {
    try {
      setCheckingSubscription(true);
      const hasSub = await planService.checkActiveSubscription();
      setHasSubscription(hasSub);
      const response = await planService.getPlans();
      setPlans(response.data || []);
      console.log("📊 Dashboard Data:", {
        hasSubscription: hasSub,
        plansCount: response.data?.length || 0,
        leadsCount: recentLeads?.length || 0,
      });
    } catch (error) {
      console.error("Error loading subscription data:", error);
      setHasSubscription(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const fetchUpcomingMeetings = async () => {
    try {
      setFetchingMeetings(true);
      const today = new Date();
      const todayString = today.toISOString().split("T")[0];
      const response = await fetchActivities({
        type: "meeting",
        startDate: todayString,
        limit: 5,
        sortBy: "date",
        order: "asc",
      });
      if (response.success && response.data) {
        setUpcomingMeetings(response.data);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setFetchingMeetings(false);
    }
  };

  // 🔥 CONDITIONAL RETURN - At the very end, after all hooks
  if (!MODULE_DASHBOARD) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 0,
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: 20 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || fetchingMeetings || checkingSubscription}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            style={{ backgroundColor: colors.background }}
            progressViewOffset={20}
          />
        }
      >
        {/* Welcome Header - Always Show */}
        <WelcomeHeader
          greeting={greeting}
          userName={user?.name || "User"}
          fadeAnim={fadeAnim}
        />

        {/* PLANS BANNER - Only if NO subscription */}
        {!hasSubscription && !checkingSubscription && plans.length > 0 && (
          <PlansBanner plans={plans} />
        )}

        {/* LEADS BANNER - Only if HAS subscription */}
        {hasSubscription && !checkingSubscription && <BannerSession />}

        {/* Meeting Reminder - Conditional */}
        {DASHBOARD_UPCOMING_MEETINGS && (
          <MeetingReminder
            upcomingMeetings={upcomingMeetings}
            colors={colors}
            isDark={isDark}
            onMeetingPress={(meeting) => {
              console.log("Meeting pressed:", meeting);
              router.push("/(tabs)/(tools)/activities");
            }}
          />
        )}

        {/* Stats Overview - Conditional */}
        {(DASHBOARD_TOTAL_LEADS ||
          DASHBOARD_TOTAL_TASKS ||
          DASHBOARD_TOTAL_CONTACTS) && (
          <StatsOverview
            loading={loading}
            leadStats={leadStats}
            totalPipelineValue={totalPipelineValue}
            onCalculateConversionRate={calculateConversionRate}
            onFormatCurrency={formatCurrency}
            showTotalLeads={DASHBOARD_TOTAL_LEADS}
            showTotalTasks={DASHBOARD_TOTAL_TASKS}
            showTotalContacts={DASHBOARD_TOTAL_CONTACTS}
          />
        )}

        {/* Quick Actions - Conditional */}
        {DASHBOARD_QUICK_ACTIONS && <QuickActions />}

        {/* Recent Leads - Always Show */}
        <RecentLeads
          loading={loading}
          recentLeads={recentLeads}
          formatCurrency={formatCurrency}
          getStageLabel={getStageLabel}
          getMutedBackground={getMutedBackground}
        />

        {/* Performance Metrics - Conditional */}
        {DASHBOARD_ANALYTICS_REALTIME && <PerformanceMetrics />}

        {/* Sync Status - Conditional */}
        {FEATURE_SYNC_STATUS && <SyncStatus />}

        {/* Bottom Spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}
