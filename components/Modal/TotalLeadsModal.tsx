// components/modals/TotalLeadsModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import leadsApi, { Lead } from "@/lib/api/leads.api";

interface TotalLeadsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TotalLeadsModal: React.FC<TotalLeadsModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useAppTheme();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [totalItems, setTotalItems] = useState(0);

  const statusFilters = [
    "all",
    "new",
    "contacted",
    "qualified",
    "proposal",
    "negotiation",
    "closed_won",
    "closed_lost",
  ];

  const fetchLeads = async (page = 1, status = selectedStatus) => {
    try {
      setLoading(true);
      const filters: any = {
        page,
        limit: 20,
        search: searchQuery || undefined,
      };

      if (status !== "all") {
        filters.status = status;
      }

      const response = await leadsApi.getLeads(filters);

      // Safe check for response.data
      if (response.success && response.data?.data) {
        const responseData = response.data;

        if (page === 1) {
          setLeads(responseData.data);
        } else {
          setLeads((prev) => [...prev, ...responseData.data]);
        }

        // Calculate total pages from pagination
        const total = responseData.pagination?.total || 0;
        const limit = responseData.pagination?.limit || 20;
        setTotalPages(Math.ceil(total / limit));
        setTotalItems(total);
        setCurrentPage(page);
      } else {
        // Handle empty response
        if (page === 1) {
          setLeads([]);
          setTotalItems(0);
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

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLeads(1, selectedStatus);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      new: "#2196F3",
      contacted: "#FF9800",
      qualified: "#4CAF50",
      proposal: "#9C27B0",
      negotiation: "#FF5722",
      closed_won: "#4CAF50",
      closed_lost: "#F44336",
    };
    return statusColors[status] || "#757575";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const renderLeadItem = ({ item }: { item: Lead }) => (
    <TouchableOpacity
      style={[styles.leadItem, { backgroundColor: colors.card }]}
      activeOpacity={0.7}
    >
      <View style={styles.leadHeader}>
        <View style={styles.leadInfo}>
          <ThemedText style={styles.leadName}>
            {item.firstName} {item.lastName || ""}
          </ThemedText>
          <ThemedText style={styles.leadEmail}>{item.email}</ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <ThemedText
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.replace("_", " ")}
          </ThemedText>
        </View>
      </View>

      <View style={styles.leadDetails}>
        {item.company && (
          <View style={styles.detailItem}>
            <MaterialIcons
              name="business"
              size={14}
              color={colors.textSecondary || "#666"}
            />
            <ThemedText style={styles.detailText}>{item.company}</ThemedText>
          </View>
        )}
        {item.phone && (
          <View style={styles.detailItem}>
            <MaterialIcons
              name="phone"
              size={14}
              color={colors.textSecondary || "#666"}
            />
            <ThemedText style={styles.detailText}>{item.phone}</ThemedText>
          </View>
        )}
        <View style={styles.detailItem}>
          <MaterialIcons
            name="date-range"
            size={14}
            color={colors.textSecondary || "#666"}
          />
          <ThemedText style={styles.detailText}>
            {formatDate(item.createdAt)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.priorityContainer}>
        <View
          style={[
            styles.priorityBadge,
            {
              backgroundColor:
                item.priority === "high"
                  ? "#F4433620"
                  : item.priority === "medium"
                    ? "#FF980020"
                    : "#4CAF5020",
            },
          ]}
        >
          <MaterialIcons
            name="flag"
            size={12}
            color={
              item.priority === "high"
                ? "#F44336"
                : item.priority === "medium"
                  ? "#FF9800"
                  : "#4CAF50"
            }
          />
          <ThemedText
            style={[
              styles.priorityText,
              {
                color:
                  item.priority === "high"
                    ? "#F44336"
                    : item.priority === "medium"
                      ? "#FF9800"
                      : "#4CAF50",
              },
            ]}
          >
            {item.priority}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
      >
        <View
          style={[styles.modalHeader, { borderBottomColor: colors.border }]}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.modalTitle}>
            Total Leads ({totalItems})
          </ThemedText>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.refreshButton}
          >
            <MaterialIcons name="refresh" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBox,
            //   { backgroundColor: colors.input || colors.card },
            ]}
          >
            <MaterialIcons
              name="search"
              size={20}
              color={colors.textSecondary || "#666"}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search leads..."
              placeholderTextColor={colors.textSecondary || "#666"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {statusFilters.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedStatus === status ? colors.primary : colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                setSelectedStatus(status);
                setCurrentPage(1);
              }}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  {
                    color: selectedStatus === status ? "#fff" : colors.text,
                  },
                ]}
              >
                {status === "all" ? "All" : status.replace("_", " ")}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading && leads.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
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
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons
                  name="people-outline"
                  size={64}
                  color={colors.textSecondary || "#666"}
                />
                <ThemedText
                  style={[
                    styles.emptyText,
                    { color: colors.textSecondary || "#666" },
                  ]}
                >
                  No leads found
                </ThemedText>
              </View>
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    padding: 0,
  },
  filterContainer: {
    maxHeight: 50,
    marginBottom: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  leadItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  leadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  leadInfo: {
    flex: 1,
    marginRight: 12,
  },
  leadName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  leadEmail: {
    fontSize: 14,
    color: "#757575",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  leadDetails: {
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#757575",
  },
  priorityContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
