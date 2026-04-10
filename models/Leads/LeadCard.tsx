import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { Lead } from "@/lib/api/leads.api";

// 🔥 IMPORT FEATURE FLAGS
import {
  LEADS_ASSIGN,
  LEADS_FOLLOWUP_REMINDER,
} from "@/components/constants/FeatureFlags";

interface LeadCardProps {
  lead: Lead;
  onPress: () => void;
  getStageColor: (status: string) => string;
  getStageLabel: (status: string) => string;
  getPriorityIcon: (priority: string) => string;
  getPriorityColor: (priority: string) => string;
  formatCurrency: (amount: number) => string;
  calculateDaysToClose: (dateString?: string) => number | null;
  // 🔥 Feature flags props
  canAssign?: boolean;
  canSetReminder?: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onPress,
  getStageColor,
  getStageLabel,
  getPriorityIcon,
  getPriorityColor,
  formatCurrency,
  calculateDaysToClose,
  canAssign = LEADS_ASSIGN, // 🔥 Default from FeatureFlags
  canSetReminder = LEADS_FOLLOWUP_REMINDER, // 🔥 Default from FeatureFlags
}) => {
  const { colors } = useAppTheme();

  const daysToClose = calculateDaysToClose(lead.nextFollowUp);
  const stageColor = getStageColor(lead.status);
  const priorityColor = getPriorityColor(lead.priority);

  // 🔥 Handler for assign button
  const handleAssign = (e: any) => {
    e.stopPropagation();
    console.log("Assign lead:", lead._id, lead.firstName, lead.lastName);
    // Add your assign logic here
  };

  // 🔥 Handler for reminder button
  const handleSetReminder = (e: any) => {
    e.stopPropagation();
    console.log(
      "Set reminder for lead:",
      lead._id,
      lead.firstName,
      lead.lastName,
    );
    // Add your reminder logic here
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header Row with Name and Value */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <ThemedText
              type="defaultSemiBold"
              style={{ color: colors.text, fontSize: 16 }}
            >
              {lead.firstName} {lead.lastName || ""}
            </ThemedText>

            {/* Priority Badge */}
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: priorityColor + "20",
              }}
            >
              <Ionicons
                name={getPriorityIcon(lead.priority) as any}
                size={14}
                color={priorityColor}
              />
            </View>
          </View>

          <ThemedText style={{ color: colors.textSecondary, fontSize: 13 }}>
            {lead.company || "No company"} • {lead.email}
          </ThemedText>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <ThemedText
            type="defaultSemiBold"
            style={{ color: colors.primary, fontSize: 16, fontWeight: "bold" }}
          >
            {formatCurrency(lead.budget || 0).replace("$", "₹")}
          </ThemedText>
        </View>
      </View>

      {/* 🔥 Action Buttons Row - Conditional */}
      {(canAssign || canSetReminder) && (
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginBottom: 12,
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.border + "40",
          }}
        >
          {/* 🔥 Assign Button - Conditional */}
          {canAssign && (
            <TouchableOpacity
              onPress={handleAssign}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: colors.primary + "10",
                borderRadius: 20,
              }}
            >
              <Ionicons
                name="person-add-outline"
                size={14}
                color={colors.primary}
              />
              <ThemedText
                style={{
                  color: colors.primary,
                  fontSize: 12,
                  fontWeight: "500",
                }}
              >
                Assign
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* 🔥 Reminder Button - Conditional */}
          {canSetReminder && (
            <TouchableOpacity
              onPress={handleSetReminder}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: colors.warning + "10",
                borderRadius: 20,
              }}
            >
              <Ionicons
                name="notifications-outline"
                size={14}
                color={colors.warning || "#FF9800"}
              />
              <ThemedText
                style={{
                  color: colors.warning || "#FF9800",
                  fontSize: 12,
                  fontWeight: "500",
                }}
              >
                Reminder
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Stage Badge */}
      <View style={{ gap: 8 }}>
        <View
          style={{
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: stageColor + "15",
          }}
        >
          <ThemedText
            style={{ color: stageColor, fontSize: 12, fontWeight: "600" }}
          >
            {getStageLabel(lead.status)}
          </ThemedText>
        </View>

        {/* Source and Follow Up Info */}
        <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons
              name="business-outline"
              size={14}
              color={colors.textSecondary}
            />
            <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
              Source:{" "}
              {lead.source
                ? lead.source.charAt(0).toUpperCase() + lead.source.slice(1)
                : "N/A"}
            </ThemedText>
          </View>

          {lead.nextFollowUp && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Ionicons
                name="calendar-outline"
                size={14}
                color={colors.textSecondary}
              />
              <ThemedText
                style={{
                  color:
                    daysToClose && daysToClose <= 7
                      ? "#F44336"
                      : daysToClose && daysToClose <= 30
                        ? "#FF9800"
                        : colors.textSecondary,
                  fontSize: 12,
                }}
              >
                {daysToClose
                  ? `${daysToClose > 0 ? `${daysToClose}d to close` : "Past due"}`
                  : "No follow up"}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Job Title - Optional */}
        {lead.jobTitle && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: colors.border + "40",
            }}
          >
            <Ionicons
              name="briefcase-outline"
              size={14}
              color={colors.textSecondary}
            />
            <ThemedText
              style={{ color: colors.textSecondary, fontSize: 12, flex: 1 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {lead.jobTitle}
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
