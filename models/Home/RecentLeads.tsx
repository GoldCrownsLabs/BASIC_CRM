import React from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useAppTheme } from "@/context/ThemeContext";
import { Lead } from "@/lib/api/leads.api";

interface RecentLeadsProps {
  loading: boolean;
  recentLeads: Lead[];
  formatCurrency: (amount: number) => string;
  getStageLabel: (status: string) => string;
  getMutedBackground: () => string;
}

export const RecentLeads: React.FC<RecentLeadsProps> = ({
  loading,
  recentLeads,
  formatCurrency,
  getStageLabel,
  getMutedBackground,
}) => {
  const { colors } = useAppTheme();

  const stageColors: Record<string, string> = {
    New: "#3b82f6",
    Contacted: "#f59e0b",
    Qualified: "#10b981",
    Proposal: "#8b5cf6",
    Negotiation: "#ec4899",
    Won: "#10b981",
    Lost: "#ef4444",
  };

  // Simple phone formatter
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "No phone";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
    }
    return phone;
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>Top Leads</ThemedText>
        <Link href="/(tabs)/leads" asChild>
          <TouchableOpacity>
            <ThemedText style={[styles.viewAll, { color: colors.primary }]}>
              View All
            </ThemedText>
          </TouchableOpacity>
        </Link>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <ThemedText
            style={[styles.loadingText, { color: colors.textSecondary }]}
          >
            Loading leads...
          </ThemedText>
        </View>
      ) : recentLeads.length > 0 ? (
        <View style={styles.leadsList}>
          {recentLeads.slice(0, 5).map((lead) => {
            const stageLabel = getStageLabel(lead.status);
            const stageColor = stageColors[stageLabel] || "#6b7280";

            return (
              <TouchableOpacity
                key={lead._id}
                style={[
                  styles.leadCard,
                  {
                    backgroundColor: getMutedBackground(),
                  },
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.leadContent}>
                  {/* Avatar */}
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: stageColor + "20" },
                    ]}
                  >
                    <ThemedText
                      style={[styles.avatarText, { color: stageColor }]}
                    >
                      {lead.firstName?.charAt(0)?.toUpperCase() || "L"}
                    </ThemedText>
                  </View>

                  {/* Lead Info */}
                  <View style={styles.leadInfo}>
                    <ThemedText style={styles.leadName} numberOfLines={1}>
                      {lead.firstName} {lead.lastName || ""}
                    </ThemedText>

                    <View style={styles.detailsRow}>
                      {lead.company && (
                        <View style={styles.detailItem}>
                          <MaterialIcons
                            name="business"
                            size={12}
                            color={colors.textSecondary}
                          />
                          <ThemedText
                            style={styles.detailText}
                            numberOfLines={1}
                          >
                            {lead.company}
                          </ThemedText>
                        </View>
                      )}

                      {lead.phone && (
                        <View style={styles.detailItem}>
                          <MaterialIcons
                            name="phone"
                            size={12}
                            color={colors.textSecondary}
                          />
                          <ThemedText
                            style={styles.detailText}
                            numberOfLines={1}
                          >
                            {formatPhoneNumber(lead.phone)}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Status & Budget */}
                  <View style={styles.rightSection}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: stageColor + "15" },
                      ]}
                    >
                      <ThemedText
                        style={[styles.statusText, { color: stageColor }]}
                      >
                        {stageLabel}
                      </ThemedText>
                    </View>

                    <View style={styles.budgetContainer}>
                      <MaterialIcons
                        name="currency-rupee"
                        size={12}
                        color={colors.textSecondary}
                      />
                      <ThemedText style={styles.budgetText}>
                        {formatCurrency(lead.budget || 0)}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="people-outline"
            size={40}
            color={colors.textSecondary}
          />
          <ThemedText
            style={[styles.emptyText, { color: colors.textSecondary }]}
          >
            No leads found
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  leadsList: {
    gap: 8,
  },
  leadCard: {
    borderRadius: 12,
    padding: 12,
  },
  leadContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
  },
  leadInfo: {
    flex: 1,
    gap: 4,
  },
  leadName: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailsRow: {
    gap: 4,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    opacity: 0.7,
  },
  rightSection: {
    alignItems: "flex-end",
    gap: 6,
    minWidth: 70,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  budgetContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  budgetText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});

export default RecentLeads;
