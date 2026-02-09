// app/(tabs)/(tools)/analytics/index.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import CommonHeader from "@/components/common/CommonHeader";
import { useAppTheme } from "@/context/ThemeContext";
import leadsApi, { LeadStats } from "@/lib/api/leads.api";
import { useDashboard } from "@/hooks/useDashboard";
import { getStageLabel } from "@/utils/leads.utils";

// Import ActivitiesAPI
import {
  ActivitiesAPI,
  Activity,
  ActivityType,
  fetchActivities,
  fetchActivityStats,
} from "@/lib/api/activities.api";

// Models/Components
import LeadsFunnel from "@/models/Analytics/LeadsFunnel";
import ActivitiesChart from "@/models/Analytics/ActivitiesChart";
import WeeklyTrends from "@/models/Analytics/WeeklyTrends";
import TopContacts from "@/models/Analytics/TopContacts";
import FilterModal from "@/models/Analytics/FilterModal";
import ExportModal from "@/models/Analytics/ExportModal";
import { StatsOverview } from "@/models/Home/StatsOverview";
import { RecentLeads } from "@/models/Home/RecentLeads";
import { PerformanceMetrics } from "@/models/Home/PerformanceMetrics";
import ActivityDetailModal from "@/models/Activities/ActivityDetailModal";

// Interfaces
interface AnalyticsData {
  leadsByStatus: {
    status: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  activitiesByType: {
    type: string;
    icon: string;
    count: number;
    color: string;
  }[];
  weeklyTrends: {
    day: string;
    activities: number;
    leads: number;
  }[];
  topContacts: {
    id: string;
    name: string;
    company: string;
    status: string;
    activities: number;
    value: string;
  }[];
  recentActivities?: Activity[];
}

// API Response Interfaces
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface LeadsApiResponse {
  success: boolean;
  data?: Lead[] | PaginatedResponse<Lead>;
  message?: string;
}

interface ActivitiesApiResponse {
  success: boolean;
  data?: Activity[] | PaginatedResponse<Activity>;
  message?: string;
}

interface Lead {
  _id: string;
  contactName: string;
  company?: string;
  status: string;
  estimatedValue?: number;
  createdAt: string;
  date?: string;
  createdDate?: string;
  updatedAt?: string;
}

// Create a default LeadStats object
const defaultLeadStats: LeadStats = {
  totalLeads: 0,
  leadsByStatus: [],
  leadsBySource: [],
  leadsByPriority: [],
  leadsByMonth: [],
  hotLeads: 0,
  conversionRate: "0.00",
};

const AnalyticsPage: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const [selectedRange, setSelectedRange] = useState("month");
  const [showFilter, setShowFilter] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add state for ActivityDetailModal
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [showActivityModal, setShowActivityModal] = useState(false);

  // Use dashboard hook for shared utilities
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

  // Analytics-specific states
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );

  // Add state for activities data
  const [activitiesData, setActivitiesData] = useState<{
    byType: any[];
    stats: any;
    recent: Activity[];
  } | null>(null);

  // Add state for weekly trends
  const [weeklyTrendsData, setWeeklyTrendsData] = useState<
    { day: string; activities: number; leads: number }[]
  >([]);

  const getMutedBackground = () => {
    return isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  };

  const getStartOfWeek = (): Date => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const getEndOfWeek = (): Date => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() + (day === 0 ? 0 : 7 - day);
    const sunday = new Date(now);
    sunday.setDate(diff);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  };

  // Helper function to extract array from API response
  const extractArrayFromResponse = <T,>(response: any): T[] => {
    if (!response) return [];

    // If response is already an array
    if (Array.isArray(response)) {
      return response;
    }

    // If response has a data property that's an array
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }

    // If response has a specific property that's an array
    const possibleArrayProps = [
      "leads",
      "activities",
      "records",
      "items",
      "results",
    ];
    for (const prop of possibleArrayProps) {
      if (response[prop] && Array.isArray(response[prop])) {
        return response[prop];
      }
    }

    return [];
  };

  // Prepare leads by status data for funnel
  const prepareLeadsByStatus = (stats: LeadStats) => {
    const statusData = stats.leadsByStatus || [];
    const total = stats.totalLeads || 0;

    // console.log("Raw statusData:", statusData);
    // console.log("Total leads:", total);

    const statusConfig = {
      new: { label: "New", color: "#60A5FA" },
      contacted: { label: "Contacted", color: "#34D399" },
      qualified: { label: "Qualified", color: "#FBBF24" },
      proposal: { label: "Proposal", color: "#A78BFA" },
      negotiation: { label: "Negotiation", color: "#F87171" },
      closed_won: { label: "Won", color: "#10B981" },
      closed_lost: { label: "Lost", color: "#9CA3AF" },
    };

    // Create ALL statuses, even with 0 count
    const result = Object.entries(statusConfig).map(([status, config]) => {
      // Find matching status in API data
      const statusItem = statusData.find((s) => s._id === status);
      const count = statusItem?.count || 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

      // console.log(`${status}: count=${count}, percentage=${percentage}%`);

      return {
        status: config.label,
        count,
        percentage,
        color: config.color,
      };
    });

    // console.log("Final result (ALL statuses):", result);
    return result;
  };

  // Add this before the return statement to debug
  useEffect(() => {
    if (leadStats) {
      console.log("=== PERFORMANCE METRICS DEBUG ===");
      console.log("leadStats object:", JSON.stringify(leadStats));
      console.log("leadsByStatus:", leadStats.leadsByStatus);
      console.log("leadsBySource:", leadStats.leadsBySource);
      console.log("leadsByPriority:", leadStats.leadsByPriority);
      console.log("hotLeads:", leadStats.hotLeads);
      console.log("conversionRate:", leadStats.conversionRate);
    }
  }, [leadStats]);

  // Fetch actual activities data from API
  const fetchActivitiesData = async () => {
    try {
      // Fetch activity statistics
      const statsResponse = await fetchActivityStats();

      if (statsResponse.success && statsResponse.data) {
        const stats = statsResponse.data;

        // Format activities by type for the chart
        const activitiesByType = stats.byType.map((activityStat: any) => {
          const type = activityStat.type as ActivityType;
          const config =
            ActivitiesAPI.activityConfig[type] ||
            ActivitiesAPI.activityConfig.call;

          return {
            type: type,
            icon: config.icon,
            count: activityStat.count,
            color: config.color,
          };
        });

        // Fetch recent activities
        const recentResponse = await fetchActivities({
          limit: 50,
          sortBy: "date",
          order: "desc",
        });

        let recentActivities: Activity[] = [];
        if (recentResponse.success && recentResponse.data) {
          recentActivities = extractArrayFromResponse<Activity>(
            recentResponse.data,
          );
        }

        setActivitiesData({
          byType: activitiesByType,
          stats: stats,
          recent: recentActivities,
        });

        return activitiesByType;
      }
    } catch (err: any) {
      console.error("Error fetching activities:", err);
      // Fallback to mock data if API fails
      const mockActivitiesByType = [
        {
          type: "call",
          icon: "phone",
          count: 24,
          color: isDark ? "#34D399" : "#10B981",
        },
        {
          type: "meeting",
          icon: "calendar",
          count: 18,
          color: isDark ? "#60A5FA" : "#3B82F6",
        },
        {
          type: "email",
          icon: "mail",
          count: 42,
          color: isDark ? "#F87171" : "#EF4444",
        },
        {
          type: "task",
          icon: "check-square",
          count: 15,
          color: isDark ? "#FBBF24" : "#F59E0B",
        },
      ];

      setActivitiesData({
        byType: mockActivitiesByType,
        stats: {
          overall: {
            totalActivities: 99,
            completedActivities: 75,
            completionRate: 76,
          },
        },
        recent: [],
      });

      return mockActivitiesByType;
    }
    return [];
  };

  // Prepare weekly trends data
  const fetchWeeklyTrends = async (): Promise<
    { day: string; activities: number; leads: number }[]
  > => {
    try {
      const startDate = getStartOfWeek();
      const endDate = getEndOfWeek();

      // console.log("Fetching weekly trends data...");
      // console.log("Start Date:", startDate.toISOString());
      // console.log("End Date:", endDate.toISOString());

      // Fetch leads data for this week
      const leadsResponse = (await leadsApi.getLeads({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })) as LeadsApiResponse;

      // console.log(
      //   "Leads Response Structure:",
      //   JSON.stringify(leadsResponse).substring(0, 300),
      // );

      // Fetch activities data for this week
      const activitiesResponse = (await fetchActivities({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })) as ActivitiesApiResponse;

      // console.log(
      //   "Activities Response Structure:",
      //   JSON.stringify(activitiesResponse).substring(0, 300),
      // );

      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      // Initialize data structure
      const weeklyData = days.map((day) => ({
        day,
        activities: 0,
        leads: 0,
      }));

      // Process activities data
      if (activitiesResponse.success && activitiesResponse.data) {
        const activitiesArray = extractArrayFromResponse<Activity>(
          activitiesResponse.data,
        );

        // console.log(`Found ${activitiesArray.length} activities for the week`);

        activitiesArray.forEach((activity: Activity) => {
          if (activity.date) {
            try {
              const date = new Date(activity.date);
              const dayIndex = (date.getDay() + 6) % 7; // Monday as index 0
              if (dayIndex >= 0 && dayIndex < 7) {
                weeklyData[dayIndex].activities++;
              }
            } catch (err) {
              console.error("Error parsing activity date:", err, activity.date);
            }
          }
        });
      }

      // Process leads data
      if (leadsResponse.success && leadsResponse.data) {
        const leadsArray = extractArrayFromResponse<Lead>(leadsResponse.data);

        // console.log(`Found ${leadsArray.length} leads for the week`);

        leadsArray.forEach((lead: Lead) => {
          // Try different date fields
          const dateStr =
            lead.createdAt || lead.date || lead.createdDate || lead.updatedAt;

          if (dateStr) {
            try {
              const date = new Date(dateStr);
              const dayIndex = (date.getDay() + 6) % 7;
              if (dayIndex >= 0 && dayIndex < 7) {
                weeklyData[dayIndex].leads++;
              }
            } catch (err) {
              console.error("Error parsing lead date:", err, dateStr);
            }
          }
        });
      }

      // console.log("Final Weekly Data:", weeklyData);

      return weeklyData;
    } catch (err) {
      console.error("Error fetching weekly trends:", err);

      // Fallback to dummy data
      const dummyData = [
        { day: "Mon", activities: 8, leads: 3 },
        { day: "Tue", activities: 12, leads: 5 },
        { day: "Wed", activities: 10, leads: 4 },
        { day: "Thu", activities: 15, leads: 7 },
        { day: "Fri", activities: 7, leads: 2 },
        { day: "Sat", activities: 3, leads: 1 },
        { day: "Sun", activities: 2, leads: 0 },
      ];

      // console.log("Using fallback dummy data:", dummyData);
      return dummyData;
    }
  };

  // Prepare top contacts from recent leads
  const prepareTopContacts = () => {
    if (!recentLeads || recentLeads.length === 0) {
      return [];
    }

    return recentLeads.slice(0, 4).map((lead, index) => ({
      id: lead._id || `temp-${index}`,
      name: lead.contactName || "Unknown Contact",
      company: lead.company || "Unknown Company",
      status: lead.status || "new",
      activities: Math.floor(Math.random() * 10) + 1,
      value: formatCurrency(lead.estimatedValue || 0),
    }));
  };

  // Fetch all analytics data from API
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setIsRefreshing(true);
      setError(null);

      // console.log("📊 Using leadStats from dashboard:", leadStats);

      // Fetch ONLY activities and weekly trends (not leads again)
      const [activitiesByType, weeklyTrends] = await Promise.all([
        fetchActivitiesData(),
        fetchWeeklyTrends(),
      ]);

      // console.log("🔍 Preparing leads from dashboard leadStats...");

      // Use leadStats if available, otherwise use default
      const statsToUse = leadStats || defaultLeadStats;
      const preparedLeads = prepareLeadsByStatus(statsToUse);

      // console.log("✅ Prepared leads:", preparedLeads);

      // Prepare all analytics data
      const analytics: AnalyticsData = {
        leadsByStatus: preparedLeads,
        activitiesByType: activitiesByType,
        weeklyTrends: weeklyTrends,
        topContacts: prepareTopContacts(),
      };

      // console.log("📈 Final analytics data:", analytics);

      setAnalyticsData(analytics);
      setWeeklyTrendsData(weeklyTrends);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      setError(err.message || "Failed to load analytics data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Refresh when recent leads change
  useEffect(() => {
    if (recentLeads && analyticsData) {
      const updatedTopContacts = prepareTopContacts();
      setAnalyticsData((prev) =>
        prev
          ? {
              ...prev,
              topContacts: updatedTopContacts,
            }
          : null,
      );
    }
  }, [recentLeads]);

  // Handle activity click in chart
  const handleActivityClick = (type: string) => {
    // console.log(`Clicked on ${type} activities`);
    if (activitiesData?.recent) {
      const activityOfType = activitiesData.recent.find(
        (activity) => activity.type === type,
      );
      if (activityOfType) {
        setSelectedActivity(activityOfType);
        setShowActivityModal(true);
      }
    }
  };

  // Handle mark complete
  const handleMarkComplete = async (id: string) => {
    try {
      // TODO: Call API to mark as complete
      // await markActivityAsCompleted(id);
      alert(`Activity ${id} marked as complete`);
      setShowActivityModal(false);
      fetchAnalyticsData();
    } catch (err) {
      console.error("Error marking activity as complete:", err);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      // TODO: Call API to delete
      // await deleteActivity(id);
      alert(`Activity ${id} deleted`);
      setShowActivityModal(false);
      fetchAnalyticsData();
    } catch (err) {
      console.error("Error deleting activity:", err);
    }
  };

  // Export function
  const handleExport = async (type: "pdf" | "csv" | "excel") => {
    setShowExport(false);
    // TODO: Implement actual export functionality
    alert(`Exporting data as ${type.toUpperCase()}`);
  };

  // Right header icon
  const RightHeaderIcon = () => (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <TouchableOpacity
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: isDark ? colors.border : "#F9FAFB",
          borderWidth: 1,
          borderColor: colors.border,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => setShowFilter(true)}
      >
        <Feather name="filter" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: isDark ? colors.border : "#F9FAFB",
          borderWidth: 1,
          borderColor: colors.border,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => setShowExport(true)}
      >
        <Feather name="download" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  // Loading state
  if (isLoading && !isRefreshing) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.text }}>
          Loading analytics...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <CommonHeader
          title="Analytics"
          rightIcon={<RightHeaderIcon />}
          showSafeArea={true}
        />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Feather name="alert-circle" size={60} color="#EF4444" />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
              marginTop: 16,
              textAlign: "center",
            }}
          >
            Failed to Load Data
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 24,
              paddingHorizontal: 24,
              paddingVertical: 12,
              backgroundColor: colors.primary,
              borderRadius: 12,
            }}
            onPress={fetchAnalyticsData}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.card}
      />

      <CommonHeader
        title="Analytics"
        rightIcon={<RightHeaderIcon />}
        showSafeArea={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={fetchAnalyticsData}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Stats Overview - Always show */}
        <StatsOverview
          loading={loading}
          leadStats={leadStats || defaultLeadStats}
          totalPipelineValue={totalPipelineValue}
          onCalculateConversionRate={calculateConversionRate}
          onFormatCurrency={formatCurrency}
        />

        {/* Activities Chart - Now with real data */}
        {activitiesData && (
          <ActivitiesChart
            activitiesByType={activitiesData.byType}
            onActivityClick={handleActivityClick}
          />
        )}

        {/* Leads Funnel - Show if data exists */}
        {analyticsData && analyticsData.leadsByStatus.length > 0 ? (
          <LeadsFunnel leadsByStatus={analyticsData.leadsByStatus} />
        ) : (
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
              No leads data available
            </Text>
          </View>
        )}

        {/* Weekly Trends - Always show with data */}
        {weeklyTrendsData.length > 0 && (
          <WeeklyTrends weeklyTrends={weeklyTrendsData} />
        )}

        {/* Recent Leads - Always show */}
        <RecentLeads
          loading={loading}
          recentLeads={recentLeads}
          formatCurrency={formatCurrency}
          getStageLabel={getStageLabel}
          getMutedBackground={getMutedBackground}
        />

        {/* Performance Metrics - Always show */}
        <PerformanceMetrics leadStats={leadStats || defaultLeadStats} />

        {/* Top Contacts - Always show with data */}
        <TopContacts topContacts={analyticsData?.topContacts || []} />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={fetchAnalyticsData}
      />
      <ExportModal
        visible={showExport}
        onClose={() => setShowExport(false)}
        onExport={handleExport}
      />

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal
          visible={showActivityModal}
          selectedActivity={selectedActivity}
          colors={colors}
          isDark={isDark}
          priorityColors={ActivitiesAPI.getThemePriorityColors(isDark)}
          statusColors={ActivitiesAPI.getThemeStatusColors(isDark)}
          onClose={() => {
            setShowActivityModal(false);
            setSelectedActivity(null);
          }}
          onDelete={handleDelete}
          onMarkComplete={handleMarkComplete}
        />
      )}
    </View>
  );
};

export default AnalyticsPage;
