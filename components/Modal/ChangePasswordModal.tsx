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
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  passwordForm: PasswordForm;
  onPasswordFormChange: (field: keyof PasswordForm, value: string) => void;
  onSave: () => void;
  isLoading: boolean;
  colors: any;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
  passwordForm,
  onPasswordFormChange,
  onSave,
  isLoading,
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
            maxHeight: "80%",
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
              Change Password
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
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 24,
              }}
            >
              Enter your current password and choose a new one.
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Current Password
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
                value={passwordForm.currentPassword}
                onChangeText={(text) =>
                  onPasswordFormChange("currentPassword", text)
                }
                secureTextEntry
                placeholder="Enter current password"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                New Password
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
                value={passwordForm.newPassword}
                onChangeText={(text) =>
                  onPasswordFormChange("newPassword", text)
                }
                secureTextEntry
                placeholder="Enter new password"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Confirm New Password
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
                value={passwordForm.confirmPassword}
                onChangeText={(text) =>
                  onPasswordFormChange("confirmPassword", text)
                }
                secureTextEntry
                placeholder="Confirm new password"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View
              style={{
                backgroundColor: `${colors.info}10`,
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: `${colors.info}30`,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <Feather
                  name="shield"
                  size={16}
                  color={colors.info}
                  style={{ marginRight: 8, marginTop: 2 }}
                />
                <Text style={{ fontSize: 12, color: colors.text, flex: 1 }}>
                  Password must be at least 6 characters with one uppercase
                  letter and one number.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={{
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
                  style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}
                >
                  Change Password
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ChangePasswordModal;
