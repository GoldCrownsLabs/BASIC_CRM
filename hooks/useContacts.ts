import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import * as contactAPI from "@/lib/api/contact.api";

export const useContacts = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Recent");
  const [contacts, setContacts] = useState<contactAPI.Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<
    contactAPI.Contact[]
  >([]);
  const [contactStats, setContactStats] = useState({
    total: 0,
    active: 0,
    vip: 0,
    hotLeads: 0,
    connected: 0, // 🔥 NEW: Connected contacts count
    completed: 0, // 🔥 NEW: Completed deals count
    totalRevenue: 0, // 🔥 NEW: Total revenue
    conversionRate: 0, // 🔥 NEW: Conversion rate
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalContacts, setTotalContacts] = useState(0);

  // 🔥 NEW: Updated filters with pipeline stages
  const filters = [
    "All",
    "Favorites",
    "VIP",
    "Hot Lead",
    "Connected", // 🔥 NEW
    "Completed", // 🔥 NEW
    "Website",
    "Referral",
    "Social",
    "Event",
  ];

  const sortOptions = [
    "Recent",
    "A-Z",
    "Z-A",
    "Last Contact",
    "Company",
    "Recently Modified",
    "Deal Value", // 🔥 NEW
    "Lead Status", // 🔥 NEW
  ];

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
    loadStats();
  }, []);

  const loadContacts = async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (shouldRefresh) {
        setLoading(true);
      }

      const apiParams: contactAPI.PaginationParams = {
        page: pageNum,
        limit: 20,
        search: searchQuery || undefined,
        sort: getSortParam(selectedSort),
        isFavorite: selectedFilter === "Favorites" ? true : undefined,
        source:
          selectedFilter === "All"
            ? undefined
            : ["Website", "Referral", "Social", "Event"].includes(
                  selectedFilter,
                )
              ? (selectedFilter.toLowerCase() as contactAPI.Contact["source"])
              : undefined,
      };

      // 🔥 NEW: Handle pipeline filters
      if (selectedFilter === "VIP") {
        apiParams.tag = "VIP";
      } else if (selectedFilter === "Hot Lead") {
        apiParams.tag = "Hot Lead";
      } else if (selectedFilter === "Connected") {
        apiParams.connected = true; // Filter by connected status
      } else if (selectedFilter === "Completed") {
        apiParams.completed = true; // Filter by completed status
      }

      const response = await contactAPI.getContacts(apiParams);

      if ("success" in response && !response.success) {
        Alert.alert("Error", response.message || "Failed to load contacts");
        return;
      }

      const contactsResponse = response as contactAPI.ContactsResponse;
      const newContacts = contactsResponse.data || [];
      setTotalContacts(contactsResponse.pagination?.total || 0);

      if (shouldRefresh) {
        setContacts(newContacts);
        setPage(1);
      } else {
        const existingIds = new Set(contacts.map((c) => c._id));
        const uniqueNewContacts = newContacts.filter(
          (c) => !existingIds.has(c._id),
        );
        setContacts((prev) => [...prev, ...uniqueNewContacts]);
        setPage(pageNum);
      }

      setHasMore(contactsResponse.pagination?.hasMore || false);
      applyLocalFilteringAndSorting(
        shouldRefresh ? newContacts : [...contacts, ...(newContacts || [])],
        searchQuery,
        selectedFilter,
        selectedSort,
      );
    } catch (error) {
      console.error("Error loading contacts:", error);
      Alert.alert("Error", "Failed to load contacts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔥 NEW: Enhanced stats loading with new fields
 const loadStats = async () => {
   try {
     // Get enhanced stats from new backend
     const statsResponse = await contactAPI.getContactStats();

     // 🔥 FIX: Check if response is valid without using 'message' property
     if (!statsResponse || !statsResponse.success) {
       console.error("Failed to load stats:", statsResponse);
       return;
     }

     const statsData = statsResponse.data;

     // Get tag statistics for VIP and Hot Leads
     const tagStatsResponse = await contactAPI.getTagStats();
     let vipCount = 0;
     let hotLeadCount = 0;

     if (tagStatsResponse && tagStatsResponse.success) {
       const tagStats = tagStatsResponse;

       // VIP count
       const exactVipTag = tagStats.data.find(
         (tag) => tag.tag.toLowerCase().trim() === "vip",
       );
       vipCount = exactVipTag?.count || 0;

       // Alternative: Check for any tag containing "vip"
       if (vipCount === 0) {
         const vipLikeTags = tagStats.data.filter((tag) =>
           tag.tag.toLowerCase().includes("vip"),
         );
         vipCount = vipLikeTags.reduce((total, tag) => total + tag.count, 0);
       }

       // Hot Lead count - from leadStatus (better approach)
       if (!hotLeadCount) {
         // Get contacts with leadStatus = "hot"
         const contactsResponse = await contactAPI.getContacts({
           limit: 100,
           page: 1,
           leadStatus: "hot", // 🔥 NEW: Filter by lead status
         });

         if (contactsResponse && contactsResponse.success) {
           hotLeadCount = contactsResponse.pagination?.total || 0;
         }
       }
     }

     // 🔥 FIX: Safely access nested properties with optional chaining
     const newStats = {
       total: statsData?.overview?.total || 0,
       active: statsData?.overview?.recentWeek || 0,
       vip: vipCount,
       hotLeads: hotLeadCount,
       connected: statsData?.pipeline?.connected || 0,
       completed: statsData?.pipeline?.completed || 0,
       totalRevenue: statsData?.revenue?.total || 0,
       conversionRate: statsData?.pipeline?.conversionRate || 0,
     };

     console.log("📊 FINAL STATS:", newStats);
     setContactStats(newStats);
   } catch (error) {
     console.error("❌ Error loading stats:", error);
   }
 };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadContacts(1, true);
    loadStats();
  }, [searchQuery, selectedFilter, selectedSort]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length >= 2 || text.length === 0) {
      loadContacts(1, true);
    } else {
      applyLocalFilteringAndSorting(
        contacts,
        text,
        selectedFilter,
        selectedSort,
      );
    }
  };

  const handleFilter = (filter: string) => {
    setSelectedFilter(filter);
    loadContacts(1, true);
  };

  const handleSort = (sort: string) => {
    setSelectedSort(sort);
    applyLocalFilteringAndSorting(contacts, searchQuery, selectedFilter, sort);
  };

  // 🔥 NEW: Enhanced sort param with new fields
  const getSortParam = (sort: string): string => {
    switch (sort) {
      case "A-Z":
        return "firstName";
      case "Z-A":
        return "-firstName";
      case "Last Contact":
        return "-lastContacted";
      case "Company":
        return "company";
      case "Recently Modified":
        return "-lastModified";
      case "Deal Value":
        return "-dealValue"; // Sort by deal value (highest first)
      case "Lead Status":
        return "leadStatus"; // Sort by lead status
      default:
        return "-createdAt";
    }
  };

  const getFullName = (contact: contactAPI.Contact): string => {
    return `${contact.firstName}${contact.lastName ? ` ${contact.lastName}` : ""}`;
  };

  // 🔥 NEW: Get status color for UI
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      cold: "#9e9e9e",
      warm: "#ff9800",
      hot: "#f44336",
      connected: "#2196f3",
      completed: "#4caf50",
    };
    return colors[status] || "#9e9e9e";
  };

  // 🔥 NEW: Get status icon
  const getStatusIcon = (status: string): string => {
    const icons: Record<string, string> = {
      cold: "❄️",
      warm: "🌤️",
      hot: "🔥",
      connected: "📞",
      completed: "✅",
    };
    return icons[status] || "📌";
  };

  // 🔥 NEW: Format currency
  const formatCurrency = (amount: number, currency: string = "INR"): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // 🔥 NEW: Enhanced filtering with new fields
  const applyLocalFilteringAndSorting = (
    contactsList: contactAPI.Contact[],
    search: string,
    filter: string,
    sort: string,
  ) => {
    let filtered = [...contactsList];

    // Search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((contact) => {
        const fullName = getFullName(contact).toLowerCase();
        const email = contact.email?.toLowerCase() || "";
        const company = contact.company?.toLowerCase() || "";
        const phone = contact.phone || "";
        const notes = contact.notes?.toLowerCase() || "";
        const leadStatus = contact.leadStatus?.toLowerCase() || "";
        const connectedNotes = contact.connectedNotes?.toLowerCase() || "";
        const completedNotes = contact.completedNotes?.toLowerCase() || "";

        return (
          fullName.includes(searchLower) ||
          email.includes(searchLower) ||
          company.includes(searchLower) ||
          phone.includes(searchLower) ||
          notes.includes(searchLower) ||
          leadStatus.includes(searchLower) ||
          connectedNotes.includes(searchLower) ||
          completedNotes.includes(searchLower) ||
          contact.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      });
    }

    // 🔥 NEW: Enhanced filter logic with pipeline stages
    if (filter !== "All") {
      switch (filter) {
        case "Favorites":
          filtered = filtered.filter((contact) => contact.isFavorite);
          break;
        case "VIP":
          filtered = filtered.filter((contact) =>
            contact.tags?.some((tag) => tag.toLowerCase().includes("vip")),
          );
          break;
        case "Hot Lead":
          filtered = filtered.filter((contact) => contact.leadStatus === "hot");
          break;
        case "Connected":
          filtered = filtered.filter((contact) => contact.connected === true);
          break;
        case "Completed":
          filtered = filtered.filter((contact) => contact.completed === true);
          break;
        case "Website":
        case "Referral":
        case "Social":
        case "Event":
          filtered = filtered.filter(
            (contact) => contact.source?.toLowerCase() === filter.toLowerCase(),
          );
          break;
      }
    }

    // 🔥 NEW: Enhanced sorting with new fields
    filtered.sort((a, b) => {
      switch (sort) {
        case "A-Z":
          return getFullName(a).localeCompare(getFullName(b));
        case "Z-A":
          return getFullName(b).localeCompare(getFullName(a));
        case "Last Contact":
          const aLastContact = a.lastContacted
            ? new Date(a.lastContacted).getTime()
            : 0;
          const bLastContact = b.lastContacted
            ? new Date(b.lastContacted).getTime()
            : 0;
          return bLastContact - aLastContact;
        case "Company":
          const aCompany = a.company || "";
          const bCompany = b.company || "";
          return aCompany.localeCompare(bCompany);
        case "Recently Modified":
          const aModified = new Date(
            a.lastModified || a.updatedAt || a.createdAt,
          ).getTime();
          const bModified = new Date(
            b.lastModified || b.updatedAt || b.createdAt,
          ).getTime();
          return bModified - aModified;
        case "Deal Value":
          const aValue = a.dealValue || 0;
          const bValue = b.dealValue || 0;
          return bValue - aValue; // Highest first
        case "Lead Status":
          const statusOrder: Record<string, number> = {
            completed: 5,
            connected: 4,
            hot: 3,
            warm: 2,
            cold: 1,
          };
          const aOrder = statusOrder[a.leadStatus || "cold"] || 0;
          const bOrder = statusOrder[b.leadStatus || "cold"] || 0;
          return bOrder - aOrder;
        default: // Recent
          const aCreated = new Date(a.createdAt).getTime();
          const bCreated = new Date(b.createdAt).getTime();
          return bCreated - aCreated;
      }
    });

    setFilteredContacts(filtered);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && filteredContacts.length > 0) {
      loadContacts(page + 1);
    }
  };

  // 🔥 NEW: Mark contact as connected
  const markAsConnected = async (contactId: string, notes?: string) => {
    try {
      const response = await contactAPI.markAsConnected(contactId, notes);
      if (response.success) {
        // Update local state
        setContacts((prev) =>
          prev.map((c) => (c._id === contactId ? response.data : c)),
        );
        applyLocalFilteringAndSorting(
          contacts.map((c) => (c._id === contactId ? response.data : c)),
          searchQuery,
          selectedFilter,
          selectedSort,
        );
        loadStats(); // Refresh stats
        Alert.alert("Success", "Contact marked as connected");
      }
    } catch (error) {
      console.error("Error marking as connected:", error);
      Alert.alert("Error", "Failed to mark contact as connected");
    }
  };

  // 🔥 NEW: Mark contact as completed
  const markAsCompleted = async (
    contactId: string,
    dealValue: number,
    notes?: string,
  ) => {
    try {
      const response = await contactAPI.markAsCompleted(
        contactId,
        dealValue,
        notes,
      );
      if (response.success) {
        // Update local state
        setContacts((prev) =>
          prev.map((c) => (c._id === contactId ? response.data : c)),
        );
        applyLocalFilteringAndSorting(
          contacts.map((c) => (c._id === contactId ? response.data : c)),
          searchQuery,
          selectedFilter,
          selectedSort,
        );
        loadStats(); // Refresh stats
        Alert.alert(
          "Success",
          `Deal completed for ${formatCurrency(dealValue)}`,
        );
      }
    } catch (error) {
      console.error("Error marking as completed:", error);
      Alert.alert("Error", "Failed to mark deal as completed");
    }
  };

  return {
    refreshing,
    searchQuery,
    selectedFilter,
    selectedSort,
    contacts,
    filteredContacts,
    contactStats,
    loading,
    page,
    hasMore,
    totalContacts,
    filters,
    sortOptions,
    onRefresh,
    handleSearch,
    handleFilter,
    handleSort,
    handleLoadMore,
    loadContacts,
    loadStats,
    applyLocalFilteringAndSorting,
    getFullName,
    getSortParam,
    // 🔥 NEW: Helper functions
    getStatusColor,
    getStatusIcon,
    formatCurrency,
    markAsConnected,
    markAsCompleted,
  };
};
