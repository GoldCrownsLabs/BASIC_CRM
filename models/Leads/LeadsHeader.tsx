import React from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface LeadsHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onAddLead: () => void;
}

export const LeadsHeader: React.FC<LeadsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onAddLead,
}) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        padding: 20,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
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
        <ThemedText type="title" style={{ color: colors.text, fontSize: 24 }}>
          Leads Pipeline
        </ThemedText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colors.primary + "15",
            }}
            onPress={() => console.log("Stats")}
          >
            <Ionicons name="stats-chart" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 20,
              backgroundColor: colors.primary,
              gap: 8,
            }}
            onPress={onAddLead}
          >
            <Ionicons name="add" size={20} color="white" />
            <ThemedText
              type="defaultSemiBold"
              style={{ color: "white", fontSize: 14 }}
            >
              Add Lead
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 12,
          backgroundColor: colors.background,
          marginBottom: 15,
        }}
      >
        <Ionicons
          name="search"
          size={20}
          color={colors.textSecondary}
          style={{ marginRight: 10 }}
        />
        <TextInput
          style={{ flex: 1, fontSize: 16, color: colors.text }}
          placeholder="Search leads..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
