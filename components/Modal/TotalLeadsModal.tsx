// components/modals/TotalLeadsModal.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import leadsApi, { Lead } from "@/lib/api/leads.api";
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface TotalLeadsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TotalLeadsModal: React.FC<TotalLeadsModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors, isDark } = useAppTheme();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal: 0,
    negotiation: 0,
    closed_won: 0,
    closed_lost: 0,
  });

  const statusFilters = [
    { id: "all", label: "All Leads", icon: "people", color: "#6366f1" },
    { id: "new", label: "New", icon: "fiber-new", color: "#3b82f6" },
    { id: "contacted", label: "Contacted", icon: "call", color: "#f59e0b" },
    {
      id: "qualified",
      label: "Qualified",
      icon: "check-circle",
      color: "#10b981",
    },
    {
      id: "proposal",
      label: "Proposal",
      icon: "description",
      color: "#8b5cf6",
    },
    {
      id: "negotiation",
      label: "Negotiation",
      icon: "handshake",
      color: "#ec4899",
    },
    {
      id: "closed_won",
      label: "Closed Won",
      icon: "emoji-events",
      color: "#10b981",
    },
    {
      id: "closed_lost",
      label: "Closed Lost",
      icon: "cancel",
      color: "#ef4444",
    },
  ];

  // Calculate stats from all leads
  const calculateStatsFromLeads = useCallback((allLeads: Lead[]) => {
    const newStats = {
      new: allLeads.filter((l) => l.status === "new").length,
      contacted: allLeads.filter((l) => l.status === "contacted").length,
      qualified: allLeads.filter((l) => l.status === "qualified").length,
      proposal: allLeads.filter((l) => l.status === "proposal").length,
      negotiation: allLeads.filter((l) => l.status === "negotiation").length,
      closed_won: allLeads.filter((l) => l.status === "closed_won").length,
      closed_lost: allLeads.filter((l) => l.status === "closed_lost").length,
    };
    setStats(newStats);
    return newStats;
  }, []);

  const fetchLeads = async (page = 1, status = selectedStatus) => {
    try {
      setLoading(true);
      console.log(`📥 Fetching leads - Page: ${page}, Status: ${status}`);

      const filters: any = {
        page,
        limit: 15,
      };

      if (status !== "all") {
        filters.status = status;
      }

      const response = await leadsApi.getLeads(filters);
      console.log("📊 API Response:", response);

      if (response.success && response.data?.data) {
        const responseData = response.data;
        console.log("📄 Pagination:", responseData.pagination);

        const total =
          responseData.pagination?.total ||
          responseData.pagination?.totalItems ||
          0;
        const limit =
          responseData.pagination?.itemsPerPage ||
          responseData.pagination?.limit ||
          15;
        const pages =
          responseData.pagination?.totalPages || Math.ceil(total / limit);

        console.log(`🔢 Total items from API: ${total}, Total pages: ${pages}`);

        setTotalItems(total);
        setTotalPages(pages);
        setCurrentPage(page);

        if (page === 1) {
          // First page - replace all leads
          console.log("📋 Setting first page leads:", responseData.data.length);
          setLeads(responseData.data);
          calculateStatsFromLeads(responseData.data);
        } else {
          // Subsequent pages - append and recalculate stats
          setLeads((prev) => {
            const newLeads = [...prev, ...responseData.data];
            console.log(
              `📋 Appending page ${page}. Total leads now:`,
              newLeads.length,
            );
            calculateStatsFromLeads(newLeads);
            return newLeads;
          });
        }
      } else {
        console.log("⚠️ No data in response");
        if (page === 1) {
          setLeads([]);
          setTotalItems(0);
          setTotalPages(1);
          setCurrentPage(1);
          setStats({
            new: 0,
            contacted: 0,
            qualified: 0,
            proposal: 0,
            negotiation: 0,
            closed_won: 0,
            closed_lost: 0,
          });
        }
      }
    } catch (error) {
      console.error("❌ Error fetching leads:", error);
      if (page === 1) {
        setLeads([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (visible) {
      console.log("👁️ Modal visible, fetching leads...");
      fetchLeads(1, selectedStatus);
    }
  }, [visible]);

  // Log whenever totalItems changes
  useEffect(() => {
    console.log(`🚀 TotalLeadsModal rendered with: ${totalItems}`);
  }, [totalItems]);

  const handleRefresh = useCallback(() => {
    console.log("🔄 Refreshing...");
    setRefreshing(true);
    setCurrentPage(1);
    setLeads([]);
    fetchLeads(1, selectedStatus);
  }, [selectedStatus]);

  const handleLoadMore = useCallback(() => {
    if (currentPage < totalPages && !loading && !refreshing) {
      console.log(`⏩ Loading more: page ${currentPage + 1} of ${totalPages}`);
      fetchLeads(currentPage + 1, selectedStatus);
    }
  }, [currentPage, totalPages, loading, refreshing, selectedStatus]);

  const handleFilterChange = useCallback((filterId: string) => {
    console.log("🔍 Filter changed to:", filterId);
    setSelectedStatus(filterId);
    setCurrentPage(1);
    setLeads([]);
    fetchLeads(1, filterId);
  }, []);

  const getStatusColor = useCallback((status: string) => {
    const statusColors: Record<string, string> = {
      new: "#3b82f6",
      contacted: "#f59e0b",
      qualified: "#10b981",
      proposal: "#8b5cf6",
      negotiation: "#ec4899",
      closed_won: "#10b981",
      closed_lost: "#ef4444",
    };
    return statusColors[status] || "#6b7280";
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const statusIcons: Record<string, string> = {
      new: "fiber-new",
      contacted: "call",
      qualified: "check-circle",
      proposal: "description",
      negotiation: "handshake",
      closed_won: "emoji-events",
      closed_lost: "cancel",
    };
    return statusIcons[status] || "help-outline";
  }, []);

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, []);

  // Memoized stats for display
  const displayStats = useMemo(() => {
    const statsArray = [
      {
        label: "Total",
        value: totalItems, // ✅ अब यह सही 13 होगा
        icon: "people",
        color: "#6366f1",
      },
      {
        label: "New",
        value: stats.new,
        icon: "fiber-new",
        color: "#3b82f6",
      },
      {
        label: "Contacted",
        value: stats.contacted,
        icon: "call",
        color: "#f59e0b",
      },
      {
        label: "Qualified",
        value: stats.qualified,
        icon: "check-circle",
        color: "#10b981",
      },
      {
        label: "Proposal",
        value: stats.proposal,
        icon: "description",
        color: "#8b5cf6",
      },
      {
        label: "Negotiation",
        value: stats.negotiation,
        icon: "handshake",
        color: "#ec4899",
      },
      {
        label: "Closed Won",
        value: stats.closed_won,
        icon: "emoji-events",
        color: "#10b981",
      },
      {
        label: "Closed Lost",
        value: stats.closed_lost,
        icon: "cancel",
        color: "#ef4444",
      },
    ];
    console.log("📊 Display stats:", statsArray);
    return statsArray;
  }, [totalItems, stats]);

  const renderLeadItem = useCallback(
    ({ item, index }: { item: Lead; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
        layout={Layout.springify()}
      >
        <TouchableOpacity
          style={[
            styles.leadItem,
            {
              backgroundColor: isDark ? colors.card : "#ffffff",
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 8,
                },
                android: {
                  elevation: 3,
                },
              }),
            },
          ]}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[getStatusColor(item.status) + "10", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.leadGradient}
          />

          <View style={styles.leadHeader}>
            <View style={styles.leadInfo}>
              <View style={styles.nameContainer}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: getStatusColor(item.status) + "20" },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.avatarText,
                      { color: getStatusColor(item.status) },
                    ]}
                  >
                    {item.firstName?.[0]}
                    {item.lastName?.[0]}
                  </ThemedText>
                </View>
                <View style={styles.nameEmailContainer}>
                  <ThemedText style={[styles.leadName, { color: colors.text }]}>
                    {item.firstName} {item.lastName || ""}
                  </ThemedText>
                  <ThemedText
                    style={[styles.leadEmail, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {item.email}
                  </ThemedText>
                </View>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) + "15" },
              ]}
            >
              <MaterialIcons
                name={getStatusIcon(item.status) as any}
                size={14}
                color={getStatusColor(item.status)}
              />
              <ThemedText
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status.replace("_", " ")}
              </ThemedText>
            </View>
          </View>

          <View style={styles.leadDetails}>
            {item.company && (
              <View style={styles.detailRow}>
                <MaterialIcons
                  name="business"
                  size={16}
                  color={colors.textSecondary}
                />
                <ThemedText
                  style={[styles.detailText, { color: colors.textSecondary }]}
                >
                  {item.company}
                </ThemedText>
              </View>
            )}
            <View style={styles.detailRow}>
              <MaterialIcons
                name="event"
                size={16}
                color={colors.textSecondary}
              />
              <ThemedText
                style={[styles.detailText, { color: colors.textSecondary }]}
              >
                {formatDate(item.createdAt)}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    ),
    [colors, isDark, getStatusColor, getStatusIcon, formatDate],
  );

  const keyExtractor = useCallback((item: Lead) => item._id, []);

  const renderStatCard = useCallback(
    (stat: (typeof displayStats)[0], index: number) => (
      <Animated.View
        key={stat.label}
        entering={FadeInRight.delay(index * 100)}
        style={[
          styles.statCard,
          { backgroundColor: colors.card },
          Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 2,
            },
          }),
        ]}
      >
        <View
          style={[
            styles.statIconContainer,
            { backgroundColor: stat.color + "15" },
          ]}
        >
          <MaterialIcons name={stat.icon as any} size={24} color={stat.color} />
        </View>
        <View>
          <ThemedText style={[styles.statValue, { color: colors.text }]}>
            {stat.value}
          </ThemedText>
          <ThemedText
            style={[styles.statLabel, { color: colors.textSecondary }]}
          >
            {stat.label}
          </ThemedText>
        </View>
      </Animated.View>
    ),
    [colors],
  );

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <View
          style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}
        >
          <MaterialIcons
            name="people-outline"
            size={48}
            color={colors.textSecondary}
          />
        </View>
        <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
          No leads found
        </ThemedText>
        <ThemedText
          style={[styles.emptySubtitle, { color: colors.textSecondary }]}
        >
          {selectedStatus === "all"
            ? "No leads available at the moment"
            : `No leads with ${selectedStatus.replace("_", " ")} status`}
        </ThemedText>
      </View>
    ),
    [colors, selectedStatus],
  );

  const ListFooterComponent = useCallback(
    () =>
      loading && leads.length > 0 ? (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.primary} />
          <ThemedText
            style={[styles.footerText, { color: colors.textSecondary }]}
          >
            Loading more leads...
          </ThemedText>
        </View>
      ) : null,
    [loading, leads.length, colors.primary, colors.textSecondary],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.modalOverlay]}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: isDark ? colors.background : "#f8fafc" },
          ]}
        >
          <LinearGradient
            colors={isDark ? ["#1e293b", "#0f172a"] : ["#ffffff", "#f8fafc"]}
            style={styles.headerGradient}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.iconButton,
                  { backgroundColor: colors.card },
                  Platform.select({
                    ios: {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                    },
                    android: {
                      elevation: 2,
                    },
                  }),
                ]}
              >
                <MaterialIcons name="close" size={22} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <MaterialIcons name="people" size={24} color={colors.primary} />
                <ThemedText
                  type="subtitle"
                  style={[styles.modalTitle, { color: colors.text }]}
                >
                  All Leads ({totalItems}) {/* ✅ यहाँ भी total दिखाएं */}
                </ThemedText>
              </View>

              <TouchableOpacity
                onPress={handleRefresh}
                style={[
                  styles.iconButton,
                  { backgroundColor: colors.card },
                  Platform.select({
                    ios: {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                    },
                    android: {
                      elevation: 2,
                    },
                  }),
                ]}
              >
                <MaterialIcons
                  name="refresh"
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Stats Cards - अब Total: 13 दिखेगा */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.statsContainer}
              contentContainerStyle={styles.statsContent}
            >
              {displayStats.map(renderStatCard)}
            </ScrollView>

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              contentContainerStyle={styles.filterContent}
            >
              {statusFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor:
                        selectedStatus === filter.id
                          ? filter.color
                          : colors.card,
                      borderColor: colors.border,
                    },
                    Platform.select({
                      ios: {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                      },
                      android: {
                        elevation: selectedStatus === filter.id ? 2 : 1,
                      },
                    }),
                  ]}
                  onPress={() => handleFilterChange(filter.id)}
                >
                  <MaterialIcons
                    name={filter.icon as any}
                    size={16}
                    color={
                      selectedStatus === filter.id ? "#ffffff" : filter.color
                    }
                  />
                  <ThemedText
                    style={[
                      styles.filterText,
                      {
                        color:
                          selectedStatus === filter.id
                            ? "#ffffff"
                            : colors.text,
                      },
                    ]}
                  >
                    {filter.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>

          {loading && leads.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <ThemedText
                style={[styles.loadingText, { color: colors.textSecondary }]}
              >
                Loading leads...
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={leads}
              renderItem={renderLeadItem}
              keyExtractor={keyExtractor}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                  progressViewOffset={Platform.OS === "android" ? 0 : 20}
                />
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={ListFooterComponent}
              ListEmptyComponent={ListEmptyComponent}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={Platform.OS === "android"}
              maxToRenderPerBatch={10}
              windowSize={5}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  headerGradient: {
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  iconButton: {
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    ...Platform.select({
      ios: {
        lineHeight: 24,
      },
      android: {
        lineHeight: 24,
        includeFontPadding: false,
      },
    }),
  },
  statsContainer: {
    maxHeight: 100,
    marginBottom: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  statsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 16,
    minWidth: 150,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.7,
  },

  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    ...Platform.select({
      ios: {
        lineHeight: 18,
      },
      android: {
        lineHeight: 18,
        includeFontPadding: false,
      },
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    flexGrow: 1,
  },
  leadItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  leadGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  leadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  leadInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    ...Platform.select({
      ios: {
        lineHeight: 22,
      },
      android: {
        lineHeight: 22,
        includeFontPadding: false,
      },
    }),
  },
  nameEmailContainer: {
    flex: 1,
  },
  leadName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
    ...Platform.select({
      ios: {
        lineHeight: 20,
      },
      android: {
        lineHeight: 20,
        includeFontPadding: false,
      },
    }),
  },
  leadEmail: {
    fontSize: 13,
    opacity: 0.6,
    ...Platform.select({
      ios: {
        lineHeight: 16,
      },
      android: {
        lineHeight: 16,
        includeFontPadding: false,
      },
    }),
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
    ...Platform.select({
      ios: {
        lineHeight: 16,
      },
      android: {
        lineHeight: 16,
        includeFontPadding: false,
      },
    }),
  },
  leadDetails: {
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    opacity: 0.7,
    flex: 1,
    ...Platform.select({
      ios: {
        lineHeight: 18,
      },
      android: {
        lineHeight: 18,
        includeFontPadding: false,
      },
    }),
  },
  priorityContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
    ...Platform.select({
      ios: {
        lineHeight: 16,
      },
      android: {
        lineHeight: 16,
        includeFontPadding: false,
      },
    }),
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
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    ...Platform.select({
      ios: {
        lineHeight: 22,
      },
      android: {
        lineHeight: 22,
        includeFontPadding: false,
      },
    }),
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    ...Platform.select({
      ios: {
        lineHeight: 18,
      },
      android: {
        lineHeight: 18,
        includeFontPadding: false,
      },
    }),
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
    ...Platform.select({
      ios: {
        lineHeight: 16,
      },
      android: {
        lineHeight: 16,
        includeFontPadding: false,
      },
    }),
  },
});

export default TotalLeadsModal;
