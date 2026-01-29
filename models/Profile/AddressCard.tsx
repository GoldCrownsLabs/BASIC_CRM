import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface AddressCardProps {
  address: any;
  onEdit: (address: any) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  const { colors } = useAppTheme();

  const formatData = (value: any, fallback: string = "N/A") => {
    if (!value || value === "" || value === undefined || value === null) {
      return fallback;
    }
    return value;
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "home":
        return "home";
      case "work":
        return "briefcase";
      default:
        return "map-pin";
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: `${colors.primary}20`,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Feather
              name={getAddressIcon(address.type)}
              size={20}
              color={colors.primary}
            />
          </View>
          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              {address.type.charAt(0).toUpperCase() + address.type.slice(1)}{" "}
              Address
            </Text>
            {address.isDefault && (
              <View
                style={{
                  alignSelf: "flex-start",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                  backgroundColor: `${colors.success}20`,
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    color: colors.success,
                  }}
                >
                  Default
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity onPress={() => onEdit(address)}>
            <Feather name="edit-2" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(address._id)}>
            <Feather name="trash-2" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <Text
        style={{
          fontSize: 14,
          color: colors.text,
          marginBottom: 4,
        }}
      >
        {formatData(address.street)}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: colors.text,
          marginBottom: 4,
        }}
      >
        {formatData(address.city)}, {formatData(address.state)}{" "}
        {formatData(address.postalCode)}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: colors.text,
          marginBottom: 12,
        }}
      >
        {formatData(address.country)}
      </Text>

      {!address.isDefault && (
        <TouchableOpacity
          style={{
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
          }}
          onPress={() => onSetDefault(address._id)}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.primary,
            }}
          >
            Set as Default
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
