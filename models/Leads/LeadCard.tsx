import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { Lead } from "@/lib/api/leads.api";

interface LeadCardProps {
  lead: Lead;
  onPress: () => void;
  getStageColor: (status: string) => string;
  getStageLabel: (status: string) => string;
  getPriorityIcon: (priority: string) => string;
  getPriorityColor: (priority: string) => string;
  formatCurrency: (amount: number) => string;
  calculateDaysToClose: (dateString?: string) => number | null;
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
}) => {
  const { colors } = useAppTheme();

  const daysToClose = calculateDaysToClose(lead.nextFollowUp);
  const stageColor = getStageColor(lead.status);
  const priorityColor = getPriorityColor(lead.priority);

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
            }}
          >
            <ThemedText
              type="defaultSemiBold"
              style={{ color: colors.text, fontSize: 16 }}
            >
              {lead.firstName} {lead.lastName || ""}
            </ThemedText>
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
            {formatCurrency(lead.budget || 0)}
          </ThemedText>
        </View>
      </View>

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

        <View style={{ flexDirection: "row", gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons
              name="business-outline"
              size={14}
              color={colors.textSecondary}
            />
            <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
              Source:{" "}
              {lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}
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

        {lead.jobTitle && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: "#f0f0f0",
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
