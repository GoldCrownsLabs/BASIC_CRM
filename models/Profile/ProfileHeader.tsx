import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface ProfileHeaderProps {
  activeTab: string;
  onTabChange: (tab: "profile" | "security" | "activity" | "address") => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  activeTab,
  onTabChange,
  onRefresh,
  isRefreshing,
}) => {
  const { colors, isDark } = useAppTheme();

  const tabs = ["profile", "security", "activity", "address"] as const;

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 16,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View>
          <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
            Profile
          </Text>
          <Text
            style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}
          >
            Manage your account settings
          </Text>
        </View>

        <TouchableOpacity onPress={onRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Feather name="refresh-cw" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={{
              flex: 1,
              paddingVertical: 16,
              alignItems: "center",
              borderBottomWidth: 3,
              borderBottomColor:
                activeTab === tab ? colors.primary : "transparent",
            }}
            onPress={() => onTabChange(tab)}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color:
                  activeTab === tab ? colors.primary : colors.textSecondary,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};
