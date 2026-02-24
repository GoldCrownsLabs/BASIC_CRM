// components/modals/TotalLeadsModal.tsx
import React, { useState, useEffect } from "react";
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
    closed_won: 0,
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

  const fetchLeads = async (page = 1, status = selectedStatus) => {
    try {
      setLoading(true);
      const filters: any = {
        page,
        limit: 15,
      };

      if (status !== "all") {
        filters.status = status;
      }

      const response = await leadsApi.getLeads(filters);

      if (response.success && response.data?.data) {
        const responseData = response.data;

        if (page === 1) {
          setLeads(responseData.data);
          // Calculate stats from first page data
          calculateStats(responseData.data);
        } else {
          setLeads((prev) => [...prev, ...responseData.data]);
        }

        const total = responseData.pagination?.total || 0;
        const limit = responseData.pagination?.limit || 15;
        setTotalPages(Math.ceil(total / limit));
        setTotalItems(total);
        setCurrentPage(page);
      } else {
        if (page === 1) {
          setLeads([]);
          setTotalItems(0);
          setStats({
            new: 0,
            contacted: 0,
            qualified: 0,
            closed_won: 0,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      if (page === 1) {
        setLeads([]);
        setTotalItems(0);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (leadsData: Lead[]) => {
    const newStats = {
      new: leadsData.filter((l) => l.status === "new").length,
      contacted: leadsData.filter((l) => l.status === "contacted").length,
      qualified: leadsData.filter((l) => l.status === "qualified").length,
      closed_won: leadsData.filter((l) => l.status === "closed_won").length,
    };
    setStats(newStats);
  };

  useEffect(() => {
    if (visible) {
      fetchLeads(1, selectedStatus);
    }
  }, [visible, selectedStatus]);

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchLeads(1, selectedStatus);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading && !refreshing) {
      fetchLeads(currentPage + 1, selectedStatus);
    }
  };

  const getStatusColor = (status: string) => {
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
  };

  const getStatusIcon = (status: string) => {
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
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const renderLeadItem = ({ item, index }: { item: Lead; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      layout={Layout.springify()}
    >
      <TouchableOpacity
        style={[
          styles.leadItem,
          {
            backgroundColor: isDark ? colors.card : "#ffffff",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 3,
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
                <ThemedText style={styles.leadName}>
                  {item.firstName} {item.lastName || ""}
                </ThemedText>
                <ThemedText style={styles.leadEmail} numberOfLines={1}>
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
              <ThemedText style={styles.detailText}>{item.company}</ThemedText>
            </View>
          )}
          <View style={styles.detailRow}>
            <MaterialIcons
              name="event"
              size={16}
              color={colors.textSecondary}
            />
            <ThemedText style={styles.detailText}>
              {formatDate(item.createdAt)}
            </ThemedText>
          </View>
        </View>

        {item.priority && (
          <View style={styles.priorityContainer}>
            <View
              style={[
                styles.priorityBadge,
                {
                  backgroundColor:
                    item.priority === "high"
                      ? "#ef444420"
                      : item.priority === "medium"
                        ? "#f59e0b20"
                        : "#10b98120",
                },
              ]}
            >
              <MaterialIcons
                name="flag"
                size={12}
                color={
                  item.priority === "high"
                    ? "#ef4444"
                    : item.priority === "medium"
                      ? "#f59e0b"
                      : "#10b981"
                }
              />
              <ThemedText
                style={[
                  styles.priorityText,
                  {
                    color:
                      item.priority === "high"
                        ? "#ef4444"
                        : item.priority === "medium"
                          ? "#f59e0b"
                          : "#10b981",
                  },
                ]}
              >
                {item.priority} priority
              </ThemedText>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
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
                style={[styles.iconButton, { backgroundColor: colors.card }]}
              >
                <MaterialIcons name="close" size={22} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <MaterialIcons name="people" size={24} color={colors.primary} />
                <ThemedText type="subtitle" style={styles.modalTitle}>
                  All Leads
                </ThemedText>
              </View>

              <TouchableOpacity
                onPress={handleRefresh}
                style={[styles.iconButton, { backgroundColor: colors.card }]}
              >
                <MaterialIcons
                  name="refresh"
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.statsContainer}
              contentContainerStyle={styles.statsContent}
            >
              {[
                {
                  label: "Total",
                  value: totalItems,
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
                  label: "Closed",
                  value: stats.closed_won,
                  icon: "emoji-events",
                  color: "#10b981",
                },
              ].map((stat, index) => (
                <Animated.View
                  key={stat.label}
                  entering={FadeInRight.delay(index * 100)}
                  style={[styles.statCard, { backgroundColor: colors.card }]}
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
                    <ThemedText style={styles.statValue}>
                      {stat.value}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>
                      {stat.label}
                    </ThemedText>
                  </View>
                </Animated.View>
              ))}
            </ScrollView>

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              contentContainerStyle={styles.filterContent}
            >
              {statusFilters.map((filter, index) => (
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
                  ]}
                  onPress={() => {
                    setSelectedStatus(filter.id);
                    setCurrentPage(1);
                  }}
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
              <ThemedText style={styles.loadingText}>
                Loading leads...
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={leads}
              renderItem={renderLeadItem}
              keyExtractor={(item) => item._id}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                loading && leads.length > 0 ? (
                  <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <ThemedText style={styles.footerText}>
                      Loading more leads...
                    </ThemedText>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View
                    style={[
                      styles.emptyIconContainer,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    <MaterialIcons
                      name="people-outline"
                      size={48}
                      color={colors.textSecondary}
                    />
                  </View>
                  <ThemedText style={styles.emptyTitle}>
                    No leads found
                  </ThemedText>
                  <ThemedText style={styles.emptySubtitle}>
                    {selectedStatus === "all"
                      ? "No leads available at the moment"
                      : `No leads with ${selectedStatus.replace("_", " ")} status`}
                  </ThemedText>
                </View>
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
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
    padding: 12,
    borderRadius: 16,
    gap: 12,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  },
  nameEmailContainer: {
    flex: 1,
  },
  leadName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  leadEmail: {
    fontSize: 13,
    opacity: 0.6,
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
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
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
});

export default TotalLeadsModal;
