import React from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
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
  const { colors, isDark } = useAppTheme();

  // Helper function for consistent opacity
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

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
      {/* Header - Using ThemedText without color override */}
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" style={[styles.title, { color: colors.text }]}>
          Top Leads
        </ThemedText>
        <Link href="/(tabs)/leads" asChild>
          <TouchableOpacity>
            <ThemedText type="default" style={[styles.viewAll, { color: colors.primary }]}>
              View All
            </ThemedText>
          </TouchableOpacity>
        </Link>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <ThemedText type="default" style={[styles.loadingText, { color: colors.primary }]}>
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
                  {/* Avatar - using rgba for consistent opacity */}
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: hexToRgba(stageColor, 0.12),
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.avatarText,
                        {
                          color: stageColor,
                        },
                      ]}
                    >
                      {lead.firstName?.charAt(0)?.toUpperCase() || "L"}
                    </ThemedText>
                  </View>

                  {/* Lead Info - Using ThemedText with appropriate types */}
                  <View style={styles.leadInfo}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={[styles.leadName, { color: colors.text }]}
                      numberOfLines={1}
                    >
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
                            type="default"
                            style={[styles.detailText, { color: colors.textSecondary }]}
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
                            type="default"
                            style={[styles.detailText, { color: colors.textSecondary }]}
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
                        { backgroundColor: hexToRgba(stageColor, 0.08) },
                      ]}
                    >
                      <ThemedText
                        type="default"
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
                      <ThemedText
                        type="defaultSemiBold"
                        style={[styles.budgetText, { color: colors.textSecondary }]}
                      >
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
          <ThemedText type="default" style={styles.emptyText}>
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
  },
  viewAll: {
    fontSize: 14,
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
    fontWeight: Platform.select({ ios: "500", android: "600" }),
  },
  leadInfo: {
    flex: 1,
    gap: 4,
  },
  leadName: {
    fontSize: 14,
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
