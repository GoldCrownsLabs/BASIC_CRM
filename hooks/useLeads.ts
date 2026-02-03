import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import leadsApi, {
  Lead,
  LeadFilters,
  LeadStats,
  LeadsResponse,
} from "@/lib/api/leads.api";
import { useAuthStore } from "@/store/auth.store";

// Create a type that extends Lead with UI-specific properties
// Use Omit to exclude email and add it back with optional type
interface UILead extends Omit<Lead, "email"> {
  name?: string; // For full name display
  stage?: string; // Alternative to status
  estimatedValue?: number; // Alternative to budget
  phone?: string;
  company?: string;
  email?: string; // Make optional to match original Lead
}

// Helper function to get full name from Lead
const getLeadFullName = (lead: Lead): string => {
  return `${lead.firstName} ${lead.lastName || ""}`.trim();
};

// Helper function to calculate stats from leads data
const calculateStatsFromLeads = (leads: UILead[]): LeadStats => {
  const statsByStage: Record<string, { count: number; totalValue: number }> =
    {};

  leads.forEach((lead) => {
    const stage = lead.status || lead.stage || "unknown";
    if (!statsByStage[stage]) {
      statsByStage[stage] = { count: 0, totalValue: 0 };
    }
    statsByStage[stage].count += 1;
    statsByStage[stage].totalValue += lead.budget || lead.estimatedValue || 0;
  });

  // Calculate conversion rate
  const wonLeads = leads.filter((lead) => lead.status === "closed_won").length;
  const conversionRatePercentage =
    leads.length > 0 ? ((wonLeads / leads.length) * 100).toFixed(1) : "0.0";

  // Create a complete LeadStats object
  return {
    totalLeads: leads.length,
    leadsByStatus: Object.entries(statsByStage).map(([stage, data]) => ({
      _id: stage,
      count: data.count,
      totalValue: data.totalValue,
    })),
    leadsBySource: [], // Empty for now
    leadsByPriority: [], // Empty for now
    leadsByMonth: [], // Empty for now
    hotLeads: 0,
    conversionRate: `${conversionRatePercentage}%`, // ✅ String format में
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
  const [leadsData, setLeadsData] = useState<UILead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [allLeadsData, setAllLeadsData] = useState<UILead[]>([]);
  const [allStats, setAllStats] = useState<LeadStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  // Initial fetch - ALL data fetch करें
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Function to transform API Lead to UILead
  const transformToUILead = (lead: Lead): UILead => {
    return {
      ...lead,
      name: getLeadFullName(lead),
      stage: lead.status, // Map status to stage
      estimatedValue: lead.budget, // Map budget to estimatedValue
      // Ensure other properties exist (email is already in lead from API)
      phone: lead.phone || "",
      company: lead.company || "",
      // Don't override email, use the one from API
    } as UILead; // Type assertion to handle the Omit
  };

  // सभी data एक साथ fetch करें
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

        // Transform API data to UILead
        const uiData: UILead[] = apiData.map(transformToUILead);

        // Store ALL leads
        setAllLeadsData(uiData);

        // Initially show ALL leads
        setLeadsData(uiData);
        setPagination({
          page: 1,
          pages: Math.ceil(uiData.length / 10),
          total: uiData.length,
          limit: 10,
        });

        // Calculate stats if API stats not available
        if (!statsResponse.success || !statsResponse.data) {
          const calculatedStats = calculateStatsFromLeads(uiData);
          setAllStats(calculatedStats);
          setStats(calculatedStats);
        }
      }

      if (statsResponse.success && statsResponse.data) {
        // Store ALL stats from API
        setAllStats(statsResponse.data);
        setStats(statsResponse.data);
      }
    } catch (error: any) {
      console.error("Error fetching all data:", error);
      Alert.alert("Error", "Failed to fetch leads data");
    } finally {
      setLoading(false);
    }
  };

  // Filtered leads show करें (client-side filtering)
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
          lead.email?.toLowerCase().includes(query) ||
          lead.company?.toLowerCase().includes(query) ||
          lead.phone?.toLowerCase().includes(query),
      );
    }

    // Update pagination and show filtered data
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

  // Apply filters when any filter changes
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
    fetchLeadStats: () => {},
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
