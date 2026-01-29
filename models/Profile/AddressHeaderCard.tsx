import React from "react";
// eslint-disable-next-line import/no-duplicates
import { View, TouchableOpacity } from "react-native";
// eslint-disable-next-line import/no-duplicates
import { Text } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

interface AddressHeaderCardProps {
  addresses: any[];
  onAddAddress: () => void;
}

export const AddressHeaderCard: React.FC<AddressHeaderCardProps> = ({
  addresses,
  onAddAddress,
}) => {
  const { colors } = useAppTheme();

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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: colors.text,
          }}
        >
          Addresses
        </Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
          {addresses.length} addresses
        </Text>
      </View>

      <TouchableOpacity
        style={{
          paddingVertical: 16,
          borderRadius: 12,
          backgroundColor: colors.primary,
          alignItems: "center",
        }}
        onPress={onAddAddress}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>
          Add New Address
        </Text>
      </TouchableOpacity>
    </View>
  );
};
