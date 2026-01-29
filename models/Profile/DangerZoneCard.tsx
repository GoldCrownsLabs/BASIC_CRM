import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

interface DangerZoneCardProps {
  onDeleteAccount: () => void;
}

export const DangerZoneCard: React.FC<DangerZoneCardProps> = ({
  onDeleteAccount,
}) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.error,
          marginBottom: 16,
        }}
      >
        Danger Zone
      </Text>

      <TouchableOpacity
        style={{
          paddingVertical: 16,
          borderRadius: 12,
          backgroundColor: `${colors.error}10`,
          borderWidth: 1,
          borderColor: colors.error,
          alignItems: "center",
        }}
        onPress={onDeleteAccount}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.error,
          }}
        >
          Delete Account
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 12,
          color: colors.textSecondary,
          textAlign: "center",
          marginTop: 12,
        }}
      >
        Once deleted, your account cannot be recovered.
      </Text>
    </View>
  );
};
