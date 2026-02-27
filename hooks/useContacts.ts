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
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalContacts, setTotalContacts] = useState(0);

  const filters = [
    "All",
    "Favorites",
    "VIP",
    "Hot Lead",
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

      if (selectedFilter === "VIP") {
        apiParams.tag = "VIP";
      } else if (selectedFilter === "Hot Lead") {
        apiParams.tag = "Hot Lead";
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

  const loadStats = async () => {
    try {
      // Get total contacts stats
      const statsResponse = await contactAPI.getContactStats();

      if ("success" in statsResponse && !statsResponse.success) {
        console.error("Failed to load stats:", statsResponse.message);
        return;
      }

      const stats = statsResponse as contactAPI.StatsResponse;
      const statsData = stats.data;

      // Get tag statistics
      const tagStatsResponse = await contactAPI.getTagStats();
      let vipCount = 0;
      let hotLeadCount = 0;

      if ("success" in tagStatsResponse && tagStatsResponse.success) {
        const tagStats = tagStatsResponse as contactAPI.TagStatsResponse;

        // Debug: Log raw tag data
        console.log("🔍 RAW TAG DATA FROM API:");
        tagStats.data.forEach((tag) => {
          console.log(
            `  Tag: "${tag.tag}" (${typeof tag.tag}), Count: ${tag.count}`,
          );
        });

        // Check for VIP tag - exact match first
        const exactVipTag = tagStats.data.find(
          (tag) => tag.tag.toLowerCase().trim() === "vip",
        );

        if (exactVipTag) {
          vipCount = exactVipTag.count;
          console.log(
            `✅ Found exact VIP tag: "${exactVipTag.tag}" with count: ${exactVipTag.count}`,
          );
        } else {
          // Try to find any tag containing "vip"
          const vipLikeTags = tagStats.data.filter((tag) =>
            tag.tag.toLowerCase().includes("vip"),
          );
          if (vipLikeTags.length > 0) {
            vipCount = vipLikeTags.reduce((total, tag) => total + tag.count, 0);
            console.log(
              `⚠️ Found VIP-like tags:`,
              vipLikeTags.map((t) => t.tag),
            );
          } else {
            console.log("❌ No VIP tag found");
          }
        }

        // Check for Hot Lead tag - try different variations
        const exactHotLeadTag = tagStats.data.find((tag) => {
          const tagLower = tag.tag.toLowerCase().trim();
          return (
            tagLower === "hot lead" ||
            tagLower === "hot" ||
            tagLower === "lead" ||
            tagLower === "hotlead" ||
            tagLower === "hot_lead" ||
            tagLower === "hot-lead"
          );
        });

        if (exactHotLeadTag) {
          hotLeadCount = exactHotLeadTag.count;
          console.log(
            `✅ Found exact Hot Lead tag: "${exactHotLeadTag.tag}" with count: ${exactHotLeadTag.count}`,
          );
        } else {
          // Try to find any tags containing "hot" or "lead"
          const hotLikeTags = tagStats.data.filter((tag) => {
            const tagLower = tag.tag.toLowerCase();
            return tagLower.includes("hot") || tagLower.includes("lead");
          });

          if (hotLikeTags.length > 0) {
            // For Hot Lead, we want to count contacts that have EITHER "hot" OR "lead" tags
            // But avoid double-counting if a contact has both tags
            hotLeadCount = hotLikeTags.reduce(
              (total, tag) => total + tag.count,
              0,
            );
            console.log(
              `⚠️ Found Hot/Lead-like tags:`,
              hotLikeTags.map((t) => `${t.tag} (${t.count})`),
            );
          } else {
            console.log("❌ No Hot Lead tag found");
          }
        }

        // Alternative: Calculate from actual contacts if tag stats don't work
        if (vipCount === 0 || hotLeadCount === 0) {
          console.log("📊 Calculating stats from contacts array...");

          // Get fresh contacts for accurate calculation
          const contactsResponse = await contactAPI.getContacts({
            limit: 100,
            page: 1,
          });

          if ("success" in contactsResponse && contactsResponse.success) {
            const allContacts =
              (contactsResponse as contactAPI.ContactsResponse).data || [];

            if (vipCount === 0) {
              vipCount = allContacts.filter((contact) =>
                contact.tags?.some((tag) => tag.toLowerCase().includes("vip")),
              ).length;
              console.log(`✅ Calculated VIP from contacts: ${vipCount}`);
            }

            if (hotLeadCount === 0) {
              hotLeadCount = allContacts.filter((contact) =>
                contact.tags?.some(
                  (tag) =>
                    tag.toLowerCase().includes("hot") ||
                    tag.toLowerCase().includes("lead"),
                ),
              ).length;
              console.log(
                `✅ Calculated Hot Leads from contacts: ${hotLeadCount}`,
              );
            }
          }
        }
      }

      const newStats = {
        total: statsData.total || 0,
        active: statsData.recentWeek || 0,
        vip: vipCount,
        hotLeads: hotLeadCount,
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
      default:
        return "-createdAt";
    }
  };

  const getFullName = (contact: contactAPI.Contact): string => {
    return `${contact.firstName}${contact.lastName ? ` ${contact.lastName}` : ""}`;
  };

  const applyLocalFilteringAndSorting = (
    contactsList: contactAPI.Contact[],
    search: string,
    filter: string,
    sort: string,
  ) => {
    let filtered = [...contactsList];

    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((contact) => {
        const fullName = getFullName(contact).toLowerCase();
        const email = contact.email?.toLowerCase() || "";
        const company = contact.company?.toLowerCase() || "";
        const phone = contact.phone || "";
        const notes = contact.notes?.toLowerCase() || "";

        return (
          fullName.includes(searchLower) ||
          email.includes(searchLower) ||
          company.includes(searchLower) ||
          phone.includes(searchLower) ||
          notes.includes(searchLower) ||
          contact.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      });
    }

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
          filtered = filtered.filter((contact) =>
            contact.tags?.some(
              (tag) =>
                tag.toLowerCase().includes("hot") ||
                tag.toLowerCase().includes("lead"),
            ),
          );
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
        default:
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
  };
};
