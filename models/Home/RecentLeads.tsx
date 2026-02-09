import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
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
    New: "#4CAF50",
    Contacted: "#2196F3",
    Qualified: "#FF9800",
    Proposal: "#9C27B0",
    Negotiation: "#FF5722",
    Won: "#4CAF50",
    Lost: "#F44336",
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "No phone";

    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Format Indian phone numbers
    if (cleaned.length === 10) {
      return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
    }

    return phone;
  };

  return (
    <ThemedView
      style={{
        marginHorizontal: 15,
        marginTop: 15,
        padding: 20,
        borderRadius: 20,
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0,
        shadowRadius: 4,
        elevation: 0.44,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <ThemedText type="subtitle" style={{ color: colors.text }}>
          Top Leads
        </ThemedText>
        <Link href="/(tabs)/leads" asChild>
          <TouchableOpacity>
            <ThemedText type="link" style={{ color: colors.primary }}>
              View All
            </ThemedText>
          </TouchableOpacity>
        </Link>
      </View>

      {loading ? (
        <View style={{ alignItems: "center", paddingVertical: 20 }}>
          <ActivityIndicator size="small" color={colors.primary} />
          <ThemedText style={{ color: colors.textSecondary, marginTop: 10 }}>
            Loading leads...
          </ThemedText>
        </View>
      ) : recentLeads.length > 0 ? (
        <View style={{ gap: 12 }}>
          {recentLeads.slice(0, 5).map((lead) => (
            <TouchableOpacity
              key={lead._id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 12,
                borderRadius: 12,
                backgroundColor: getMutedBackground(),
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#2196F3",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <ThemedText
                    type="title"
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    {lead.firstName?.charAt(0)?.toUpperCase() || "L"}
                  </ThemedText>
                </View>

                <View style={{ flex: 1, marginRight: 8 }}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: colors.text, fontSize: 14 }}
                    numberOfLines={1}
                  >
                    {lead.firstName} {lead.lastName || ""}
                  </ThemedText>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 2,
                    }}
                  >
                    <Ionicons
                      name="business-outline"
                      size={12}
                      color={colors.textSecondary}
                    />
                    <ThemedText
                      type="default"
                      style={{
                        color: colors.textSecondary,
                        fontSize: 12,
                      }}
                      numberOfLines={1}
                    >
                      {lead.company || "No company"}
                    </ThemedText>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 2,
                    }}
                  >
                    <Ionicons
                      name="call-outline"
                      size={12}
                      color={colors.textSecondary}
                    />
                    <ThemedText
                      type="default"
                      style={{
                        color: colors.textSecondary,
                        fontSize: 12,
                      }}
                      numberOfLines={1}
                    >
                      {/* {formatPhoneNumber(lead.phone)} */}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <View
                  style={{
                    marginBottom: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor:
                      stageColors[getStageLabel(lead.status)] + "20",
                  }}
                >
                  <ThemedText
                    type="default"
                    style={{
                      color: stageColors[getStageLabel(lead.status)],
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    {getStageLabel(lead.status)}
                  </ThemedText>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="cash-outline"
                    size={12}
                    color={colors.textSecondary}
                  />
                  <ThemedText
                    type="defaultSemiBold"
                    style={{
                      color: colors.text,
                      fontSize: 12,
                      marginLeft: 4,
                    }}
                  >
                    ₹{formatCurrency(lead.budget || 0)}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={{ alignItems: "center", paddingVertical: 20 }}>
          <Ionicons
            name="trending-up-outline"
            size={40}
            color={colors.textSecondary}
          />
          <ThemedText
            type="default"
            style={{ color: colors.textSecondary, marginTop: 10 }}
          >
            No leads found
          </ThemedText>
          <ThemedText
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginTop: 5,
            }}
          >
            Add your first lead to see them here
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
};
