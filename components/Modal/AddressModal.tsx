import React, { useEffect, useRef } from "react";
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
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface Address {
  _id?: string;
  type: "home" | "work" | "other";
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
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
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Smooth animation when modal opens/closes
  useEffect(() => {
    if (visible) {
      // Open animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 1,
          damping: 15,
          mass: 0.8,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Close animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Handle close with animation
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Memoize type selection to prevent re-renders
  const renderTypeButton = (type: string) => (
    <TouchableOpacity
      key={type}
      style={[
        {
          flex: 1,
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: "center",
          borderWidth: 1,
        },
        address.type === type
          ? {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }
          : {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
      ]}
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
  );

  // Memoize input fields to prevent re-renders
  const renderInput = (
    field: keyof Address,
    placeholder: string,
    keyboardType: any = "default",
    isRequired: boolean = true,
  ) => (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {placeholder}
        {isRequired && <Text style={{ color: colors.error }}> *</Text>}
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
        value={address[field] as string}
        onChangeText={(text) => onAddressChange(field, text)}
        placeholder={`Enter ${placeholder.toLowerCase()}`}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
      />
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
            opacity: fadeAnim,
          }}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                maxHeight: "90%",
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              }}
            >
              {/* Header */}
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
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  {isEditing ? "Edit Address" : "Add New Address"}
                </Text>
                <TouchableOpacity onPress={handleClose}>
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
                    Address Type <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    {["home", "work", "other"].map(renderTypeButton)}
                  </View>
                </View>

                {/* Street Address */}
                {renderInput("street", "Street Address")}

                {/* City and State */}
                <View
                  style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.text,
                        marginBottom: 8,
                      }}
                    >
                      City <Text style={{ color: colors.error }}>*</Text>
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
                      value={address.city}
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
                      State <Text style={{ color: colors.error }}>*</Text>
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
                      value={address.state}
                      onChangeText={(text) => onAddressChange("state", text)}
                      placeholder="Enter state"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>

                {/* Country and Zip Code */}
                <View
                  style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}
                >
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
                      value={address.country}
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
                      Zip Code <Text style={{ color: colors.error }}>*</Text>
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
                      value={address.zipCode}
                      onChangeText={(text) => onAddressChange("zipCode", text)}
                      keyboardType="number-pad"
                      placeholder="Enter zip code"
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
                    onValueChange={(value) =>
                      onAddressChange("isDefault", value)
                    }
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
                    onPress={handleClose}
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
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AddressModal;
