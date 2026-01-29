import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

export const SyncStatus: React.FC = () => {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 16,
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="cloud-done" size={20} color="#4CAF50" />
        <ThemedText
          type="default"
          style={{ marginLeft: 8, color: colors.textSecondary }}
        >
          Last synced: Just now
        </ThemedText>
      </View>
      <TouchableOpacity>
        <ThemedText type="link" style={{ color: colors.primary }}>
          Sync Now
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};
