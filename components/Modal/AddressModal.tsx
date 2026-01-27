import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface Address {
  _id?: string;
  type: "home" | "work" | "other";
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  address: Address;
  onAddressChange: (field: keyof Address, value: any) => void;
  onSave: () => void;
  isLoading: boolean;
  isEditing: boolean;
  colors: any;
}

const AddressModal: React.FC<AddressModalProps> = ({
  visible,
  onClose,
  address,
  onAddressChange,
  onSave,
  isLoading,
  isEditing,
  colors,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "90%",
            flexShrink: 1,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "600", color: colors.text }}
            >
              {isEditing ? "Edit Address" : "Add New Address"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardDismissMode="on-drag"
          >
            {/* Address Type Selection */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Address Type
              </Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {["home", "work", "other"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor:
                        address.type === type
                          ? colors.primary
                          : colors.background,
                      borderWidth: 1,
                      borderColor:
                        address.type === type ? colors.primary : colors.border,
                      alignItems: "center",
                    }}
                    onPress={() => onAddressChange("type", type)}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: address.type === type ? "#FFFFFF" : colors.text,
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Street Address */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Street Address
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                }}
                value={address.street || ""}
                onChangeText={(text) => onAddressChange("street", text)}
                placeholder="Enter street address"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* City and State */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  City
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: colors.text,
                  }}
                  value={address.city || ""}
                  onChangeText={(text) => onAddressChange("city", text)}
                  placeholder="Enter city"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  State
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: colors.text,
                  }}
                  value={address.state || ""}
                  onChangeText={(text) => onAddressChange("state", text)}
                  placeholder="Enter state"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            {/* Country and Postal Code */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  Country
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: colors.text,
                  }}
                  value={address.country || ""}
                  onChangeText={(text) => onAddressChange("country", text)}
                  placeholder="Enter country"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  Postal Code
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: colors.text,
                  }}
                  value={address.postalCode || ""}
                  onChangeText={(text) => onAddressChange("postalCode", text)}
                  keyboardType="number-pad"
                  placeholder="Enter postal code"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            {/* Default Address Switch */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Switch
                value={address.isDefault}
                onValueChange={(value) => onAddressChange("isDefault", value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
              <Text
                style={{ fontSize: 14, color: colors.text, marginLeft: 12 }}
              >
                Set as default address
              </Text>
            </View>

            {/* Save/Cancel Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                }}
                onPress={onClose}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  opacity: isLoading ? 0.7 : 1,
                }}
                onPress={onSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#FFFFFF",
                    }}
                  >
                    {isEditing ? "Update Address" : "Add Address"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddressModal;
