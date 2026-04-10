import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { Lead } from "@/lib/api/leads.api";
import { LeadCard } from "./LeadCard";

// 🔥 IMPORT FEATURE FLAGS
import {
  LEADS_ASSIGN,
  LEADS_FOLLOWUP_REMINDER,
  LEADS_EXPORT,
} from "@/components/constants/FeatureFlags";

interface LeadsListProps {
  loading: boolean;
  leads: Lead[];
  pagination: {
    page: number;
    pages: number;
  };
  onPageChange: (newPage: number) => void;
  onLeadPress: (lead: Lead) => void;
  getStageColor: (status: string) => string;
  getStageLabel: (status: string) => string;
  getPriorityIcon: (priority: string) => string;
  getPriorityColor: (priority: string) => string;
  formatCurrency: (amount: number) => string;
  calculateDaysToClose: (dateString?: string) => number | null;
  // 🔥 Feature flags props (optional, can come from parent or use directly)
  canAssignLead?: boolean;
  canSetReminder?: boolean;
  canExport?: boolean;
}

export const LeadsList: React.FC<LeadsListProps> = ({
  loading,
  leads,
  pagination,
  onPageChange,
  onLeadPress,
  getStageColor,
  getStageLabel,
  getPriorityIcon,
  getPriorityColor,
  formatCurrency,
  calculateDaysToClose,
  canAssignLead = LEADS_ASSIGN, // 🔥 Default from FeatureFlags
  canSetReminder = LEADS_FOLLOWUP_REMINDER, // 🔥 Default from FeatureFlags
  canExport = LEADS_EXPORT, // 🔥 Default from FeatureFlags
}) => {
  const { colors } = useAppTheme();

  // Handle export leads
  const handleExportLeads = () => {
    console.log("Exporting leads:", leads.length);
    // Add your export logic here
  };

  if (loading) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 50,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={{ color: colors.textSecondary, marginTop: 10 }}>
          Loading leads...
        </ThemedText>
      </View>
    );
  }

  if (leads.length === 0) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 50,
        }}
      >
        <Ionicons
          name="trending-up-outline"
          size={60}
          color={colors.textSecondary}
        />
        <ThemedText
          type="default"
          style={{ color: colors.textSecondary, marginTop: 10 }}
        >
          No leads found
        </ThemedText>
        <ThemedText
          style={{ color: colors.textSecondary, fontSize: 12, marginTop: 5 }}
        >
          Try changing your filters or add a new lead
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {leads.map((lead) => (
        <LeadCard
          key={lead._id}
          lead={lead}
          onPress={() => onLeadPress(lead)}
          getStageColor={getStageColor}
          getStageLabel={getStageLabel}
          getPriorityIcon={getPriorityIcon}
          getPriorityColor={getPriorityColor}
          formatCurrency={formatCurrency}
          calculateDaysToClose={calculateDaysToClose}
          // 🔥 Pass feature flags to LeadCard
          canAssign={canAssignLead}
          canSetReminder={canSetReminder}
        />
      ))}

      {/* Pagination */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TouchableOpacity
            onPress={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            style={{ opacity: pagination.page === 1 ? 0.5 : 1 }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
          </TouchableOpacity>

          <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
            Page {pagination.page} of {pagination.pages}
          </ThemedText>

          <TouchableOpacity
            onPress={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            style={{ opacity: pagination.page === pagination.pages ? 0.5 : 1 }}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* 🔥 Export Button - Conditional */}
        {canExport && leads.length > 0 && (
          <TouchableOpacity
            onPress={handleExportLeads}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: colors.primary + "10",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.primary + "30",
            }}
          >
            <Ionicons
              name="download-outline"
              size={18}
              color={colors.primary}
            />
            <ThemedText
              style={{
                color: colors.primary,
                fontSize: 12,
                fontWeight: "500",
              }}
            >
              Export
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
