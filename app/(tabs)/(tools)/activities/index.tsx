// ActivitiesPage.tsx
import CommonHeader from "@/components/common/CommonHeader";
import { useAppTheme } from "@/context/ThemeContext";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Import API functions
import {
  Activity,
  ActivityType,
  ActivityFilters as ApiActivityFilters,
  createActivity,
  deleteActivity,
  fetchActivities,
  markActivityAsCompleted,
  PriorityType,
  searchActivities,
  StatusType,
  updateActivity,
} from "@/lib/api/activities.api";

// Import components
import ActivityDetailModal from "@/models/Activities/ActivityDetailModal";
import ActivityItem from "@/models/Activities/ActivityItem";
import AddActivityModal from "@/models/Activities/AddActivityModal";
import FilterChips from "@/models/Activities/FilterChips";
import SearchBar from "@/models/Activities/SearchBar";

type FilterType = "all" | ActivityType;

const ActivitiesPage = () => {
  const { colors, isDark } = useAppTheme();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [newActivity, setNewActivity] = useState({
    title: "",
    contactName: "",
    company: "",
    description: "",
    type: "call" as ActivityType,
    priority: "medium" as PriorityType,
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    duration: "",
  });

  // Theme-aware colors
  const priorityColors = {
    high: isDark ? "#F87171" : "#DC2626",
    medium: isDark ? "#FBBF24" : "#D97706",
    low: isDark ? "#34D399" : "#059669",
  };

  const statusColors = {
    completed: isDark ? "#34D399" : "#10B981",
    scheduled: isDark ? "#60A5FA" : "#3B82F6",
    pending: isDark ? "#9CA3AF" : "#6B7280",
  };

  // Light theme activity config
  const activityConfig = {
    call: {
      icon: "phone",
      color: "#10B981",
      bg: "#D1FAE5",
      label: "Call",
    },
    meeting: {
      icon: "calendar",
      color: "#3B82F6",
      bg: "#DBEAFE",
      label: "Meeting",
    },
    note: {
      icon: "file-text",
      color: "#8B5CF6",
      bg: "#EDE9FE",
      label: "Note",
    },
    task: {
      icon: "check-square",
      color: "#D97706",
      bg: "#FEF3C7",
      label: "Task",
    },
    email: {
      icon: "mail",
      color: "#DC2626",
      bg: "#FEE2E2",
      label: "Email",
    },
  };

  // Get theme-aware activity config
  const getThemeActivityConfig = useCallback(() => {
    return isDark
      ? {
          call: {
            icon: "phone",
            color: "#34D399",
            bg: "#064E3B",
            label: "Call",
          },
          meeting: {
            icon: "calendar",
            color: "#60A5FA",
            bg: "#1E3A8A",
            label: "Meeting",
          },
          note: {
            icon: "file-text",
            color: "#A78BFA",
            bg: "#5B21B6",
            label: "Note",
          },
          task: {
            icon: "check-square",
            color: "#FBBF24",
            bg: "#92400E",
            label: "Task",
          },
          email: {
            icon: "mail",
            color: "#F87171",
            bg: "#7F1D1D",
            label: "Email",
          },
        }
      : activityConfig;
  }, [isDark]);

  // Load activities from API
  const loadActivities = async (
    pageNum: number = 1,
    refreshing: boolean = false,
  ) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }

      const filters: ApiActivityFilters = {
        page: pageNum,
        limit: 10,
        ...(filter !== "all" && { type: filter }),
        ...(search && { search }),
      };

      const response = await fetchActivities(filters);

      if (pageNum === 1) {
        setActivities(response.data);
      } else {
        setActivities((prev) => [...prev, ...response.data]);
      }

      setTotalPages(response.totalPages || 1);
      setHasMore(response.currentPage < response.totalPages);
    } catch (error: any) {
      console.error("Error loading activities:", error);
      Alert.alert("Error", error.message || "Failed to load activities");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadActivities(1, true);
  };

  // Handle search
  const handleSearch = useCallback(async (searchText: string) => {
    try {
      setLoading(true);
      setSearch(searchText);

      if (!searchText.trim()) {
        loadActivities(1);
        return;
      }

      const response = await searchActivities(searchText);
      setActivities(response.data);
      setTotalPages(1);
      setHasMore(false);
    } catch (error: any) {
      console.error("Error searching activities:", error);
      Alert.alert("Error", error.message || "Failed to search activities");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle add new activity
  const handleAddActivity = async () => {
    if (!newActivity.title.trim() || !newActivity.contactName.trim()) {
      Alert.alert("Validation Error", "Title and Contact Name are required");
      return;
    }

    try {
      setLoading(true);

      const activityData = {
        title: newActivity.title,
        contactName: newActivity.contactName,
        company: newActivity.company,
        description: newActivity.description,
        type: newActivity.type,
        priority: newActivity.priority,
        date: newActivity.date,
        time: newActivity.time,
        duration: newActivity.duration || undefined,
        status: "pending" as StatusType,
      };

      const response = await createActivity(activityData);

      setActivities((prev) => [response.data, ...prev]);
      setNewActivity({
        title: "",
        contactName: "",
        company: "",
        description: "",
        type: "call",
        priority: "medium",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        duration: "",
      });
      setShowAddModal(false);

      Alert.alert("Success", "Activity created successfully");
    } catch (error: any) {
      console.error("Error creating activity:", error);
      Alert.alert("Error", error.message || "Failed to create activity");
    } finally {
      setLoading(false);
    }
  };

  // Update activity status
  const handleUpdateStatus = async (id: string, status: StatusType) => {
    try {
      const updateData =
        status === "completed" ? { status, isCompleted: true } : { status };

      const response = await updateActivity(id, updateData);

      setActivities((prev) =>
        prev.map((act) => (act._id === id ? response.data : act)),
      );
      setSelectedActivity(null);
      setShowDetailModal(false);

      Alert.alert("Success", "Activity status updated");
    } catch (error: any) {
      console.error("Error updating activity:", error);
      Alert.alert("Error", error.message || "Failed to update activity status");
    }
  };

  // Delete activity
  const handleDeleteActivity = async (id: string) => {
    Alert.alert(
      "Delete Activity",
      "Are you sure you want to delete this activity?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteActivity(id);
              setActivities((prev) => prev.filter((act) => act._id !== id));
              setSelectedActivity(null);
              setShowDetailModal(false);
              Alert.alert("Success", "Activity deleted successfully");
            } catch (error: any) {
              console.error("Error deleting activity:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to delete activity",
              );
            }
          },
        },
      ],
    );
  };

  // Mark as completed
  const handleMarkAsCompleted = async (id: string) => {
    try {
      const response = await markActivityAsCompleted(id);
      setActivities((prev) =>
        prev.map((act) => (act._id === id ? response.data : act)),
      );
      Alert.alert("Success", "Activity marked as completed");
    } catch (error: any) {
      console.error("Error marking activity as completed:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to mark activity as completed",
      );
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadActivities(nextPage);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(1);
    setSearch("");
  };

  // Update new activity fields
  const handleUpdateNewActivity = (
    key: keyof typeof newActivity,
    value: string,
  ) => {
    setNewActivity((prev) => ({ ...prev, [key]: value }));
  };

  // Handle search change with debounce
  const handleSearchChange = (text: string) => {
    setSearch(text);
  };

  // Handle search debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search !== "") {
        handleSearch(search);
      } else {
        loadActivities(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Load activities on focus or filter change
  useFocusEffect(
    useCallback(() => {
      loadActivities(1);
    }, [filter]),
  );

  // Render activity item
  const renderItem = ({ item }: { item: Activity }) => {
    const config = getThemeActivityConfig()[item.type];
    const priorityColor = priorityColors[item.priority];
    const status = item.isCompleted ? "completed" : item.status || "pending";
    const statusColor = statusColors[status];

    const contactName =
      item.contactName ||
      (item.contact
        ? `${item.contact.firstName} ${item.contact.lastName}`
        : "");
    const company =
      item.company || item.contact?.company || item.lead?.company || "";

    return (
      <ActivityItem
        item={item}
        config={config}
        priorityColor={priorityColor}
        statusColor={statusColor}
        status={status}
        contactName={contactName}
        company={company}
        colors={colors}
        isDark={isDark}
        onPress={() => {
          setSelectedActivity(item);
          setShowDetailModal(true);
        }}
        onMarkComplete={handleMarkAsCompleted}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.card}
      />

      <CommonHeader title="Activities" showSafeArea={true} />

      {/* Search Bar */}
      <SearchBar
        search={search}
        colors={colors}
        isDark={isDark}
        onSearchChange={handleSearchChange}
        onClearSearch={() => {
          setSearch("");
          loadActivities(1);
        }}
      />

      {/* Filter Chips */}
      <FilterChips
        filter={filter}
        colors={colors}
        isDark={isDark}
        onFilterChange={handleFilterChange}
      />

      {/* Activities List */}
      <FlatList
        data={activities}
        renderItem={renderItem}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && page > 1 ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: colors.textSecondary }}>
                Loading more...
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 60,
              }}
            >
              <AntDesign
                name="calendar"
                size={48}
                color={colors.textSecondary}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginTop: 16,
                  marginBottom: 8,
                  color: colors.text,
                }}
              >
                No activities found
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                {search
                  ? "Try a different search"
                  : "Add your first activity to get started"}
              </Text>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.primary,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
                onPress={() => setShowAddModal(true)}
              >
                <AntDesign name="plus" size={20} color="#FFFFFF" />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#FFFFFF",
                    marginLeft: 8,
                  }}
                >
                  Add Activity
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          left: 20,
          bottom: 30,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          zIndex: 999,
        }}
        onPress={() => setShowAddModal(true)}
      >
        <AntDesign name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modals */}
      <AddActivityModal
        visible={showAddModal}
        colors={colors}
        isDark={isDark}
        loading={loading}
        newActivity={newActivity}
        priorityColors={priorityColors}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddActivity}
        onUpdateNewActivity={handleUpdateNewActivity}
        onUpdateType={(type) => setNewActivity((prev) => ({ ...prev, type }))}
        onUpdatePriority={(priority) =>
          setNewActivity((prev) => ({ ...prev, priority }))
        }
      />

      <ActivityDetailModal
        visible={showDetailModal}
        selectedActivity={selectedActivity}
        colors={colors}
        isDark={isDark}
        priorityColors={priorityColors}
        statusColors={statusColors}
        onClose={() => setShowDetailModal(false)}
        onDelete={handleDeleteActivity}
        onMarkComplete={(id) => handleUpdateStatus(id, "completed")}
      />
    </View>
  );
};

export default ActivitiesPage;
