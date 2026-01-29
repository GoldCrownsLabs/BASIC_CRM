import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface QuickActionsProps {
  onBulkActions: () => void;
  onRefresh: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onBulkActions,
  onRefresh,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {/* Bulk Actions */}
      <TouchableOpacity
        onPress={onBulkActions}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: colors.primary + "15",
          borderWidth: 1,
          borderColor: colors.primary,
          gap: 6,
        }}
      >
        <Ionicons name="layers" size={14} color={colors.primary} />
        <ThemedText style={{ fontSize: 12, color: colors.primary }}>
          Bulk Actions
        </ThemedText>
      </TouchableOpacity>

      {/* Refresh Button */}
      <TouchableOpacity
        onPress={onRefresh}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 6,
        }}
      >
        <Ionicons name="refresh" size={14} color={colors.textSecondary} />
        <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>
          Refresh
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};
