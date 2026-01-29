import { useState, useEffect, useRef } from "react";
import { Animated } from "react-native";
import leadsApi, { LeadStats, LeadsResponse, Lead } from "@/lib/api/leads.api";
import {
  getGreeting,
  calculateConversionRate,
  formatCurrency,
} from "@/utils/dashboard.utils";

export const useDashboard = () => {
  const [greeting, setGreeting] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // FIX: Use useRef to persist the animated value across renders
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const totalPipelineValue = recentLeads.reduce(
    (sum, lead) => sum + (lead.budget || 0),
    0,
  );

  useEffect(() => {
    setGreeting(getGreeting());

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    fetchData();
  }, []);

  const fetchRecentLeads = async () => {
    try {
      const response = await leadsApi.getLeads({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (response.success && response.data) {
        const leadsResponse = response.data as LeadsResponse;
        setRecentLeads(leadsResponse.data || []);
      }
    } catch (error) {
      console.error("Error fetching recent leads:", error);
    }
  };

  const fetchLeadStats = async () => {
    try {
      setLoading(true);
      const response = await leadsApi.getLeadStats();
      const anyResponse = response as any;

      if (response.success && anyResponse.data) {
        const statsData = anyResponse.data.data
          ? anyResponse.data.data
          : anyResponse.data;
        setLeadStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching lead stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    await Promise.all([fetchLeadStats(), fetchRecentLeads()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return {
    greeting,
    refreshing,
    leadStats,
    recentLeads,
    loading,
    fadeAnim,
    totalPipelineValue,
    onRefresh,
    fetchData,
    calculateConversionRate: () => calculateConversionRate(leadStats),
    formatCurrency,
  };
};
