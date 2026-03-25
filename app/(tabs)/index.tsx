// app/(tabs)/index.tsx - Updated with proper navigation

import React, { useState, useEffect } from "react";
import {
  ScrollView,
  RefreshControl,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
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
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BannerSession from "@/models/Home/BannerSession";
import { planService, Plan } from "@/lib/api/plan";
import PlansBanner from "@/models/Home/PlanBanner";
import WelcomeScreen from "./(tools)/welcome";


export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // States for subscription and plans
  const [hasSubscription, setHasSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);

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

  // State for meetings
  const [upcomingMeetings, setUpcomingMeetings] = useState<Activity[]>([]);
  const [fetchingMeetings, setFetchingMeetings] = useState(false);

  const getMutedBackground = () => {
    return isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  };

  // Check subscription status and load plans
  const loadData = async () => {
    try {
      setCheckingSubscription(true);

      // Check if user has active subscription
      const hasSub = await planService.checkActiveSubscription();
      setHasSubscription(hasSub);

      // Load all available plans
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

  // Fetch upcoming meetings
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

  // Initial fetch
  useEffect(() => {
    loadData();
    fetchUpcomingMeetings();
  }, []);

  // Refresh on pull
  useEffect(() => {
    if (!refreshing) {
      loadData();
      fetchUpcomingMeetings();
    }
  }, [refreshing]);

  // Show loading while checking subscription
  if (checkingSubscription) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>
          Loading...
        </Text>
      </View>
    );
  }

  // ✅ If NO subscription, show welcome banner inside dashboard (not redirect)
  if (!hasSubscription) {
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
              refreshing={refreshing || fetchingMeetings}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              style={{ backgroundColor: colors.background }}
              progressViewOffset={20}
            />
          }
        >
          {/* Welcome Header */}
          {/* <WelcomeHeader
            greeting={greeting}
            userName={user?.name || "User"}
            fadeAnim={fadeAnim}
          /> */}

          {/* 🎯 WELCOME BANNER - Show full welcome screen as component */}
          <WelcomeScreen
            isInline={true}
            onPlanSelect={() => {
              router.push("/(tabs)/(tools)/plans");
            }}
          />

          {/* Bottom Spacer */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    );
  }

  // If HAS subscription, show actual dashboard
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
            refreshing={refreshing || fetchingMeetings}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            style={{ backgroundColor: colors.background }}
            progressViewOffset={20}
          />
        }
      >
        {/* <WelcomeHeader
          greeting={greeting}
          userName={user?.name || "User"}
          fadeAnim={fadeAnim}
        /> */}
        {/* Welcome Header */}
        <WelcomeHeader
          greeting={greeting}
          userName={user?.name || "User"}
          fadeAnim={fadeAnim}
        />

        {/* LEADS BANNER - Only when HAS subscription */}
        <BannerSession />

        {/* Meeting Reminder */}
        <MeetingReminder
          upcomingMeetings={upcomingMeetings}
          colors={colors}
          isDark={isDark}
          onMeetingPress={(meeting) => {
            console.log("Meeting pressed:", meeting);
            router.push("/(tabs)/(tools)/activities");
          }}
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
        <PerformanceMetrics />

        {/* Sync Status */}
        <SyncStatus />

        {/* Bottom Spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}
