import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

interface PasswordCardProps {
  securitySettings: any;
  onChangePassword: () => void;
}

export const PasswordCard: React.FC<PasswordCardProps> = ({
  securitySettings,
  onChangePassword,
}) => {
  const { colors } = useAppTheme();

  const formatData = (value: any, fallback: string = "Never") => {
    if (!value || value === "" || value === undefined || value === null) {
      return fallback;
    }
    return value;
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.text,
          marginBottom: 12,
        }}
      >
        Password
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          marginBottom: 20,
        }}
      >
        Last changed: {formatData(securitySettings.lastPasswordChange, "Never")}
      </Text>

      <TouchableOpacity
        style={{
          paddingVertical: 16,
          borderRadius: 12,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
        }}
        onPress={onChangePassword}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.primary,
          }}
        >
          Change Password
        </Text>
      </TouchableOpacity>
    </View>
  );
};
