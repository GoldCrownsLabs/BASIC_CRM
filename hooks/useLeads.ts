import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import leadsApi, {
  Lead,
  LeadFilters,
  LeadStats,
  LeadsResponse,
  CreateLeadPayload,
} from "@/lib/api/leads.api";
import { useAuthStore } from "@/store/auth.store";

export const useLeads = () => {
  const { isAuthenticated } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedSource, setSelectedSource] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
      fetchLeadStats();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchLeads = async (filters?: LeadFilters) => {
    // ✅ CHECK: Don't fetch if not authenticated
    if (!isAuthenticated) {
      // console.log("useLeads: Skipping fetch - not authenticated");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await leadsApi.getLeads({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: "createdAt",
        sortOrder: "desc",
        status: selectedStage !== "All" ? selectedStage : undefined,
        source: selectedSource !== "All" ? selectedSource : undefined,
        priority: selectedPriority !== "All" ? selectedPriority : undefined,
        search: searchQuery || undefined,
        ...filters,
      });

      if (response.success && response.data) {
        const leadsResponse = response.data as LeadsResponse;
        setLeadsData(leadsResponse.data || []);

        if (leadsResponse.pagination) {
          setPagination({
            page: leadsResponse.pagination.page || 1,
            pages: leadsResponse.pagination.pages || 1,
            total: leadsResponse.pagination.total || 0,
            limit: leadsResponse.pagination.limit || 10,
          });
        }
      }
    } catch (error: any) {
      console.error("Error fetching leads:", error);
      // Only show alert for actual API errors, not auth errors
      if (
        !error.message?.includes("Session expired") &&
        !error.message?.includes("Not authorized")
      ) {
        Alert.alert("Error", error.message || "Failed to fetch leads");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadStats = async () => {
    // ✅ CHECK: Don't fetch if not authenticated
    if (!isAuthenticated) {
      // console.log("useLeads: Skipping stats fetch - not authenticated");
      return;
    }

    try {
      const response = await leadsApi.getLeadStats();

      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching lead stats:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    // ✅ CHECK: Don't refresh if not authenticated
    if (!isAuthenticated) {
      // console.log("useLeads: Skipping refresh - not authenticated");
      return;
    }

    setRefreshing(true);
    await Promise.all([fetchLeads(), fetchLeadStats()]);
    setRefreshing(false);
  }, [
    isAuthenticated,
    searchQuery,
    selectedStage,
    selectedSource,
    selectedPriority,
  ]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (isAuthenticated) {
      fetchLeads({ search: text, page: 1 });
    }
  };

  const handleStageFilter = (stage: string) => {
    setSelectedStage(stage);
    if (isAuthenticated) {
      fetchLeads({
        status: stage !== "All" ? stage : undefined,
        page: 1,
      });
    }
  };

  const handleSourceFilter = (source: string) => {
    setSelectedSource(source);
    if (isAuthenticated) {
      fetchLeads({
        source: source !== "All" ? source : undefined,
        page: 1,
      });
    }
  };

  const handlePriorityFilter = (priority: string) => {
    setSelectedPriority(priority);
    if (isAuthenticated) {
      fetchLeads({
        priority: priority !== "All" ? priority : undefined,
        page: 1,
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (isAuthenticated && newPage >= 1 && newPage <= pagination.pages) {
      fetchLeads({ page: newPage });
    }
  };

  const totalPipelineValue = leadsData.reduce(
    (sum, lead) => sum + (lead.budget || 0),
    0,
  );

  return {
    refreshing,
    loading,
    searchQuery,
    selectedStage,
    selectedSource,
    selectedPriority,
    leadsData,
    stats,
    pagination,
    totalPipelineValue,
    fetchLeads,
    fetchLeadStats,
    onRefresh,
    handleSearch,
    handleStageFilter,
    handleSourceFilter,
    handlePriorityFilter,
    handlePageChange,
    setLeadsData,
    setStats,
  };
};
