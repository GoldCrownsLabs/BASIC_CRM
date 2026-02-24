// ActivitiesPage.tsx
import CommonHeader from "@/components/common/CommonHeader";
import { useAppTheme } from "@/context/ThemeContext";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  View,
  TextInput,
  Dimensions,
  ActivityIndicator,
  StyleSheet, // Fixed: Import StyleSheet directly, not StyleSheet.create
  ScrollView, // Added ScrollView import
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

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
import { ThemedText } from "@/components/themed-text";

const { width } = Dimensions.get("window");

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
  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    completed: 0,
    overdue: 0,
  });

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

  // Filter options with icons
  const filterOptions = [
    { id: "all", label: "All", icon: "apps", color: "#6366f1" },
    { id: "call", label: "Calls", icon: "phone", color: "#10b981" },
    { id: "meeting", label: "Meetings", icon: "people", color: "#3b82f6" },
    { id: "task", label: "Tasks", icon: "check-circle", color: "#f59e0b" },
    { id: "email", label: "Emails", icon: "mail", color: "#ef4444" },
    { id: "note", label: "Notes", icon: "note", color: "#8b5cf6" },
  ];

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
    overdue: isDark ? "#F87171" : "#DC2626",
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

  // Calculate stats from activities
  const calculateStats = (activitiesData: Activity[]) => {
    const today = new Date().toISOString().split("T")[0];

    const newStats = {
      today: activitiesData.filter((a) => a.date === today && !a.isCompleted)
        .length,
      upcoming: activitiesData.filter((a) => a.date > today && !a.isCompleted)
        .length,
      completed: activitiesData.filter((a) => a.isCompleted).length,
      overdue: activitiesData.filter((a) => a.date < today && !a.isCompleted)
        .length,
    };
    setStats(newStats);
  };

  // Load activities from API
  const loadActivities = async (pageNum: number = 1) => {
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
        calculateStats(response.data);
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
    loadActivities(1);
  };

  // Handle search with debounce
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

  const handleSearch = async (searchText: string) => {
    try {
      setLoading(true);
      const response = await searchActivities(searchText);
      setActivities(response.data);
      calculateStats(response.data);
      setTotalPages(1);
      setHasMore(false);
    } catch (error: any) {
      console.error("Error searching activities:", error);
      Alert.alert("Error", error.message || "Failed to search activities");
    } finally {
      setLoading(false);
    }
  };

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
      calculateStats([response.data, ...activities]);
      resetNewActivity();
      setShowAddModal(false);

      Alert.alert("Success", "Activity created successfully");
    } catch (error: any) {
      console.error("Error creating activity:", error);
      Alert.alert("Error", error.message || "Failed to create activity");
    } finally {
      setLoading(false);
    }
  };

  // Added missing function: handleUpdateNewActivity
  const handleUpdateNewActivity = (
    key: keyof typeof newActivity,
    value: string,
  ) => {
    setNewActivity((prev) => ({ ...prev, [key]: value }));
  };

  const resetNewActivity = () => {
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
      calculateStats(
        activities.map((act) => (act._id === id ? response.data : act)),
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
              const updatedActivities = activities.filter(
                (act) => act._id !== id,
              );
              setActivities(updatedActivities);
              calculateStats(updatedActivities);
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
      calculateStats(
        activities.map((act) => (act._id === id ? response.data : act)),
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

  // Load activities on focus or filter change
  useFocusEffect(
    useCallback(() => {
      loadActivities(1);
    }, [filter]),
  );

  // Render activity item
  const renderItem = ({ item, index }: { item: Activity; index: number }) => {
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

    const isOverdue = !item.isCompleted && new Date(item.date) < new Date();

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
        layout={Layout.springify()}
      >
        <ActivityItem
          item={item}
          config={config}
          priorityColor={priorityColor}
          statusColor={isOverdue ? statusColors.overdue : statusColor}
          status={isOverdue ? "overdue" : status}
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
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={isDark ? ["#1e293b", "#0f172a"] : ["#ffffff", "#f8fafc"]}
        style={{
          paddingTop: 50,
          paddingBottom: 16,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <CommonHeader title="Activities" showSafeArea={false} />

        {/* Stats Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {[
            {
              label: "Today",
              value: stats.today,
              icon: "today",
              color: "#3b82f6",
            },
            {
              label: "Upcoming",
              value: stats.upcoming,
              icon: "upcoming",
              color: "#10b981",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: "check-circle",
              color: "#8b5cf6",
            },
            {
              label: "Overdue",
              value: stats.overdue,
              icon: "warning",
              color: "#ef4444",
            },
          ].map((stat, index) => (
            <Animated.View
              key={stat.label}
              entering={FadeInRight.delay(index * 100)}
              style={[
                styles.statCard,
                { backgroundColor: isDark ? colors.card : "#ffffff" },
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: stat.color + "15" },
                ]}
              >
                <MaterialIcons
                  name={stat.icon as any}
                  size={20}
                  color={stat.color}
                />
              </View>
              <View>
                <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
                <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
              </View>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Search Bar */}
        {/* <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: isDark ? colors.card : "#ffffff",
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[
                styles.searchInput,
                { color: colors.text, backgroundColor: "transparent" },
              ]}
              placeholder="Search activities..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View> */}

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    filter === option.id
                      ? option.color
                      : isDark
                        ? colors.card
                        : "#ffffff",
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleFilterChange(option.id as FilterType)}
            >
              <MaterialIcons
                name={option.icon as any}
                size={16}
                color={filter === option.id ? "#ffffff" : option.color}
              />
              <ThemedText
                style={[
                  styles.filterText,
                  {
                    color: filter === option.id ? "#ffffff" : colors.text,
                  },
                ]}
              >
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Activities List */}
      <FlatList
        data={activities}
        renderItem={renderItem}
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
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
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
              <ThemedText style={styles.footerText}>
                Loading more activities...
              </ThemedText>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconContainer,
                  { backgroundColor: isDark ? colors.card : "#ffffff" },
                ]}
              >
                <MaterialIcons
                  name="assignment"
                  size={48}
                  color={colors.textSecondary}
                />
              </View>
              <ThemedText style={styles.emptyTitle}>
                No activities found
              </ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                {search
                  ? "Try a different search term"
                  : filter !== "all"
                    ? `No ${filter} activities found`
                    : "Add your first activity to get started"}
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.emptyButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => setShowAddModal(true)}
              >
                <MaterialIcons name="add" size={20} color="#FFFFFF" />
                <ThemedText style={styles.emptyButtonText}>
                  Add Activity
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, isDark ? "#2563eb" : "#1d4ed8"]}
          style={styles.fabGradient}
        >
          <MaterialIcons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Modals */}
      <AddActivityModal
        visible={showAddModal}
        colors={colors}
        isDark={isDark}
        loading={loading}
        newActivity={newActivity}
        priorityColors={priorityColors}
        onClose={() => {
          setShowAddModal(false);
          resetNewActivity();
        }}
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

// Fixed: Use StyleSheet object directly, not StyleSheet.create
const styles = StyleSheet.create({
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    gap: 12,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 2,
    marginBottom: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginTop: 2,
    marginBottom: 3,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ActivitiesPage;