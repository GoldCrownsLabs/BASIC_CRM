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

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

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
  const [showMeetingAlert, setShowMeetingAlert] = useState(false);
  const [alertMeeting, setAlertMeeting] = useState<Activity | null>(null);
  const [fetchingMeetings, setFetchingMeetings] = useState(false);

  const getMutedBackground = () => {
    return isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  };

  // Fetch upcoming meetings
  const fetchUpcomingMeetings = async () => {
    try {
      setFetchingMeetings(true);
      const today = new Date();
      const todayString = today.toISOString().split("T")[0];

      // Fetch meetings for next 7 days
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

  // Handle meeting press
  const handleMeetingPress = (meeting: Activity) => {
    // Navigate to activity details or show modal
    console.log("Meeting pressed:", meeting);
    // You can implement navigation here
  };

  // Handle join meeting
  const handleJoinMeeting = (meeting: Activity) => {
    setShowMeetingAlert(false);
    console.log("Join meeting:", meeting);
    // Implement join meeting logic
  };

  // Check for meetings that are starting soon
  const checkUpcomingMeetings = () => {
    if (!upcomingMeetings.length) return;

    const now = new Date();

    upcomingMeetings.forEach((meeting) => {
      try {
        const meetingTime = new Date(meeting.date);
        if (meeting.time) {
          const [hours, minutes] = meeting.time.split(":");
          meetingTime.setHours(parseInt(hours), parseInt(minutes));
        }

        const diffMs = meetingTime.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));

        // Show alert 15 minutes before meeting
        if (diffMins > 0 && diffMins <= 15 && !showMeetingAlert) {
          setAlertMeeting(meeting);
          setShowMeetingAlert(true);
        }
      } catch (error) {
        console.error("Error checking meeting time:", error);
      }
    });
  };

  // Initial fetch
  useEffect(() => {
    fetchUpcomingMeetings();
  }, []);

  // Check for upcoming meetings periodically
  useEffect(() => {
    if (upcomingMeetings.length === 0) return;

    checkUpcomingMeetings();
    const interval = setInterval(checkUpcomingMeetings, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [upcomingMeetings]);

  // Refresh meetings when dashboard refreshes
  useEffect(() => {
    if (!refreshing) {
      fetchUpcomingMeetings();
    }
  }, [refreshing]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 0, // ✅ Remove top padding
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 0, // ✅ Remove top padding from scrollview
          paddingBottom: 20 + insets.bottom, // ✅ Add bottom safe area
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || fetchingMeetings}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            // ✅ Adjust refresh control position
            style={{ backgroundColor: colors.background }}
            progressViewOffset={20} // Adjust this value as needed
          />
        }
      >
        {/* Welcome Header */}
        <WelcomeHeader
          greeting={greeting}
          userName={user?.name || "User"}
          fadeAnim={fadeAnim}
        />

        {/* Banner Session Ad */}

        <BannerSession />

        {/* Meeting Reminder */}
        <MeetingReminder
          upcomingMeetings={upcomingMeetings}
          colors={colors}
          isDark={isDark}
          onMeetingPress={(meeting) => {
            // Navigate to activity details or show modal
            console.log("Meeting pressed:", meeting);
            // Or navigate to activities page
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
        <PerformanceMetrics leadStats={leadStats} />

        {/* Sync Status */}
        <SyncStatus />

        {/* Bottom Spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}
