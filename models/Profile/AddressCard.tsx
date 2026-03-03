// models/Profile/AddressCard.tsx
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { Address } from "@/lib/api/profile.api";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
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

  // Safe formatter for any value
  const formatData = (value: any, fallback: string = "N/A") => {
    if (!value || value === "" || value === undefined || value === null) {
      return fallback;
    }
    return String(value);
  };

  // Safe address type getter with default
  const getAddressType = (): string => {
    return address?.addressType || "home";
  };

  // Safe address type label
  const getAddressTypeLabel = (): string => {
    const type = getAddressType();
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Get icon based on address type
  const getAddressIcon = (): "home" | "briefcase" | "map-pin" => {
    const type = getAddressType();
    switch (type) {
      case "home":
        return "home";
      case "work":
        return "briefcase";
      default:
        return "map-pin";
    }
  };

  // Safe getter for display fields
  const getStreet = () => formatData(address?.street);
  const getCity = () => formatData(address?.city);
  const getState = () => formatData(address?.state);
  const getCountry = () => formatData(address?.country);
  const getZipCode = () => formatData(address?.zipCode);

  // Check if address is default
  const isDefault = address?.isDefault || false;

  // Get address ID safely - using _id (not id)
  const getAddressId = (): string => {
    return address?._id || ""; // ✅ FIXED: Use _id instead of id
  };

  if (!address) return null;

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: isDefault ? 2 : 1,
        borderColor: isDefault ? colors.primary : colors.border,
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
            <Feather name={getAddressIcon()} size={20} color={colors.primary} />
          </View>
          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              {getAddressTypeLabel()} Address
            </Text>
            {isDefault && (
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
                  DEFAULT
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity onPress={() => onEdit(address)}>
            <Feather name="edit-2" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(getAddressId())}>
            <Feather name="trash-2" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Street Address */}
      <Text
        style={{
          fontSize: 14,
          color: colors.text,
          marginBottom: 4,
        }}
      >
        {getStreet()}
      </Text>

      {/* City, State, Zip */}
      <Text
        style={{
          fontSize: 14,
          color: colors.text,
          marginBottom: 4,
        }}
      >
        {getCity()}
        {getCity() !== "N/A" && (getState() !== "N/A" || getZipCode() !== "N/A")
          ? ", "
          : ""}
        {getState()}
        {getState() !== "N/A" && getZipCode() !== "N/A" ? " " : ""}
        {getZipCode()}
      </Text>

      {/* Country */}
      <Text
        style={{
          fontSize: 14,
          color: colors.text,
          marginBottom: 12,
        }}
      >
        {getCountry()}
      </Text>

      {/* Set Default Button */}
      {!isDefault && (
        <TouchableOpacity
          style={{
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
          }}
          onPress={() => onSetDefault(getAddressId())}
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
