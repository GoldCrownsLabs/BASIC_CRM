import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import CommonHeader from "@/components/common/CommonHeader";
import { useAppTheme } from "@/context/ThemeContext";
import leadsApi, { LeadStats } from "@/lib/api/leads.api";
import { useDashboard } from "@/hooks/useDashboard";
import { getStageLabel } from "@/utils/leads.utils";

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
  }[];
  topContacts: {
    id: string;
    name: string;
    company: string;
    status: string;
    activities: number;
    value: string;
  }[];
}

const AnalyticsPage: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const [selectedRange, setSelectedRange] = useState("month");
  const [showFilter, setShowFilter] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const getMutedBackground = () => {
    return isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  };

  // Prepare leads by status data for funnel
  const prepareLeadsByStatus = (stats: LeadStats) => {
    const statusData = stats.leadsByStatus || [];
    const total = stats.totalLeads || 1;

    const statusConfig = {
      new: { label: "New", color: "#60A5FA" },
      contacted: { label: "Contacted", color: "#34D399" },
      qualified: { label: "Qualified", color: "#FBBF24" },
      proposal: { label: "Proposal", color: "#A78BFA" },
      negotiation: { label: "Negotiation", color: "#F87171" },
      closed_won: { label: "Won", color: "#10B981" },
      closed_lost: { label: "Lost", color: "#9CA3AF" },
    };

    return Object.entries(statusConfig)
      .map(([status, config]) => {
        const statusItem = statusData.find((s) => s._id === status);
        const count = statusItem?.count || 0;
        return {
          status: config.label,
          count,
          percentage: Math.round((count / total) * 100),
          color: config.color,
        };
      })
      .filter((item) => item.count > 0);
  };

  // Prepare activities data from lead stats
  const prepareActivitiesData = (stats: LeadStats) => {
    // Since we don't have actual activities API yet,
    // let's create some data based on lead stats for demonstration
    const activities = [
      {
        type: "calls",
        icon: "phone",
        count: Math.floor(stats.totalLeads * 1.5),
        color: "#34D399",
      },
      {
        type: "emails",
        icon: "mail",
        count: Math.floor(stats.totalLeads * 2),
        color: "#60A5FA",
      },
      {
        type: "meetings",
        icon: "video",
        count: Math.floor(stats.totalLeads * 0.5),
        color: "#F87171",
      },
      {
        type: "tasks",
        icon: "check-square",
        count: Math.floor(stats.totalLeads * 0.8),
        color: "#FBBF24",
      },
    ];

    return activities;
  };

  // Prepare weekly trends data
  const prepareWeeklyTrends = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({
      day,
      activities: Math.floor(Math.random() * 20) + 5,
    }));
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

      // Fetch lead statistics from API
      const statsResponse = await leadsApi.getLeadStats();

      if (statsResponse.success && statsResponse.data) {
        const apiData = statsResponse.data;

        // Prepare all analytics data based on API response
        const analytics: AnalyticsData = {
          leadsByStatus: prepareLeadsByStatus(apiData),
          activitiesByType: prepareActivitiesData(apiData),
          weeklyTrends: prepareWeeklyTrends(),
          topContacts: prepareTopContacts(),
        };

        setAnalyticsData(analytics);
      } else {
        throw new Error(
          statsResponse.message || "Failed to fetch analytics data",
        );
      }
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
          leadStats={leadStats}
          totalPipelineValue={totalPipelineValue}
          onCalculateConversionRate={calculateConversionRate}
          onFormatCurrency={formatCurrency}
        />

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

        {/* Activities Chart - Always show with data */}
        {analyticsData && (
          <ActivitiesChart activitiesByType={analyticsData.activitiesByType} />
        )}

        {/* Weekly Trends - Always show with data */}
        {analyticsData && (
          <WeeklyTrends weeklyTrends={analyticsData.weeklyTrends} />
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
        <PerformanceMetrics leadStats={leadStats} />

        {/* Top Contacts - Always show with data */}
        {analyticsData && <TopContacts topContacts={analyticsData.topContacts} />}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Tabs */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        {["overview", "leads", "activities", "reports"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 8,
              borderBottomWidth: 2,
              borderBottomColor:
                activeTab === tab ? colors.primary : "transparent",
            }}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color:
                  activeTab === tab ? colors.primary : colors.textSecondary,
                textTransform: "capitalize",
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
    </View>
  );
};

export default AnalyticsPage;
