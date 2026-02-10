import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import leadsApi, {
  Lead,
  LeadFilters,
  LeadStats,
  LeadsResponse,
} from "@/lib/api/leads.api";
import { useAuthStore } from "@/store/auth.store";

// ✅ Helper function to get full name from Lead
const getLeadFullName = (lead: Lead): string => {
  return `${lead.firstName} ${lead.lastName || ""}`.trim();
};

// ✅ Helper function to enhance Lead with UI properties
const enhanceLeadForUI = (lead: Lead): Lead => {
  return {
    ...lead,
    // Ensure email is always a string (not undefined)
    email: lead.email || "",
    // Add UI-specific properties
    name: getLeadFullName(lead),
    stage: lead.status, 
    estimatedValue: lead.budget, 
    // Ensure other optional fields have defaults
    phone: lead.phone || "",
    company: lead.company || "",
    jobTitle: lead.jobTitle || "",
  };
};

// ✅ Helper function to calculate stats from leads data
const calculateStatsFromLeads = (leads: Lead[]): LeadStats => {
  const statsByStage: Record<string, { count: number; totalValue: number }> =
    {};
  const statsBySource: Record<string, number> = {};
  const statsByPriority: Record<string, number> = {};

  leads.forEach((lead) => {
    const stage = lead.status || "unknown";
    if (!statsByStage[stage]) {
      statsByStage[stage] = { count: 0, totalValue: 0 };
    }
    statsByStage[stage].count += 1;
    statsByStage[stage].totalValue += lead.budget || 0;

    // Count by source
    const source = lead.source || "unknown";
    statsBySource[source] = (statsBySource[source] || 0) + 1;

    // Count by priority
    const priority = lead.priority || "medium";
    statsByPriority[priority] = (statsByPriority[priority] || 0) + 1;
  });

  // Calculate conversion rate
  const wonLeads = leads.filter((lead) => lead.status === "closed_won").length;
  const conversionRatePercentage =
    leads.length > 0 ? ((wonLeads / leads.length) * 100).toFixed(1) : "0.0";

  // Calculate hot leads (leads with high priority)
  const hotLeads = leads.filter((lead) => lead.priority === "high").length;

  // Create a complete LeadStats object
  return {
    totalLeads: leads.length,
    leadsByStatus: Object.entries(statsByStage).map(([stage, data]) => ({
      _id: stage,
      count: data.count,
      totalValue: data.totalValue,
    })),
    leadsBySource: Object.entries(statsBySource).map(([source, count]) => ({
      _id: source,
      count,
    })),
    leadsByPriority: Object.entries(statsByPriority).map(
      ([priority, count]) => ({
        _id: priority,
        count,
      }),
    ),
    leadsByMonth: [], 
    hotLeads,
    conversionRate: `${conversionRatePercentage}%`,
  };
};

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
  const [allLeadsData, setAllLeadsData] = useState<Lead[]>([]);
  const [allStats, setAllStats] = useState<LeadStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch ALL leads (no filters)
      const allLeadsResponse = await leadsApi.getLeads({
        page: 1,
        limit: 1000,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      // Fetch ALL stats
      const statsResponse = await leadsApi.getLeadStats();

      if (allLeadsResponse.success && allLeadsResponse.data) {
        const allLeads = allLeadsResponse.data as LeadsResponse;
        const apiData = allLeads.data || [];

        // ✅ Transform API data to enhanced Lead
        const enhancedData: Lead[] = apiData.map(enhanceLeadForUI);

        // Store ALL leads
        setAllLeadsData(enhancedData);

        // Initially show ALL leads
        setLeadsData(enhancedData);
        setPagination({
          page: 1,
          pages: Math.ceil(enhancedData.length / 10),
          total: enhancedData.length,
          limit: 10,
        });
      }

      if (statsResponse.success && statsResponse.data) {
        // Store ALL stats from API
        setAllStats(statsResponse.data);
        setStats(statsResponse.data);
      } else if (allLeadsResponse.success && allLeadsResponse.data) {
        // Calculate stats if API stats not available
        const allLeads = allLeadsResponse.data as LeadsResponse;
        const apiData = allLeads.data || [];
        const enhancedData: Lead[] = apiData.map(enhanceLeadForUI);
        const calculatedStats = calculateStatsFromLeads(enhancedData);
        setAllStats(calculatedStats);
        setStats(calculatedStats);
      }
    } catch (error: any) {
      console.error("Error fetching all data:", error);
      Alert.alert("Error", "Failed to fetch leads data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!allLeadsData.length) {
      setLeadsData([]);
      return;
    }

    let filteredLeads = [...allLeadsData];

    // Apply stage filter
    if (selectedStage !== "All") {
      filteredLeads = filteredLeads.filter(
        (lead) =>
          lead.status?.toLowerCase() === selectedStage.toLowerCase() ||
          lead.stage?.toLowerCase() === selectedStage.toLowerCase(),
      );
    }

    // Apply source filter
    if (selectedSource !== "All") {
      filteredLeads = filteredLeads.filter(
        (lead) => lead.source?.toLowerCase() === selectedSource.toLowerCase(),
      );
    }

    // Apply priority filter
    if (selectedPriority !== "All") {
      filteredLeads = filteredLeads.filter(
        (lead) =>
          lead.priority?.toLowerCase() === selectedPriority.toLowerCase(),
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredLeads = filteredLeads.filter(
        (lead) =>
          lead.firstName?.toLowerCase().includes(query) ||
          lead.lastName?.toLowerCase().includes(query) ||
          (lead.firstName + " " + (lead.lastName || ""))
            .toLowerCase()
            .includes(query) ||
          lead.name?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.company?.toLowerCase().includes(query) ||
          lead.phone?.toLowerCase().includes(query) ||
          lead.jobTitle?.toLowerCase().includes(query),
      );
    }

    const total = filteredLeads.length;
    const pages = Math.ceil(total / pagination.limit);

    // Get current page data
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const pageData = filteredLeads.slice(startIndex, endIndex);

    setLeadsData(pageData);
    setPagination((prev) => ({
      ...prev,
      total,
      pages,
    }));
  };

  useEffect(() => {
    if (isAuthenticated && allLeadsData.length > 0) {
      applyFilters();
    }
  }, [
    selectedStage,
    selectedSource,
    selectedPriority,
    searchQuery,
    pagination.page,
  ]);

  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) return;

    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, [isAuthenticated]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStageFilter = (stage: string) => {
    setSelectedStage(stage);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSourceFilter = (source: string) => {
    setSelectedSource(source);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePriorityFilter = (priority: string) => {
    setSelectedPriority(priority);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
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
    stats: allStats,
    pagination,
    totalPipelineValue,
    allLeadsData,
    fetchLeads: fetchAllData,
    fetchLeadStats: () => leadsApi.getLeadStats(),
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
