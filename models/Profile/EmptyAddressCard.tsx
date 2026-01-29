import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface EmptyAddressCardProps {
  onAddAddress: () => void;
}

export const EmptyAddressCard: React.FC<EmptyAddressCardProps> = ({
  onAddAddress,
}) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 40,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Feather
        name="map-pin"
        size={48}
        color={colors.textSecondary}
        style={{ marginBottom: 16 }}
      />
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: colors.text,
          marginBottom: 8,
        }}
      >
        No Addresses Added
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        Add your first address to get started
      </Text>
      <TouchableOpacity
        style={{
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: colors.primary,
        }}
        onPress={onAddAddress}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#FFFFFF",
          }}
        >
          Add Address
        </Text>
      </TouchableOpacity>
    </View>
  );
};
