import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  theme?: string;
  newsletterSubscription?: boolean;
}

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile: ProfileData;
  onProfileChange: (field: keyof ProfileData, value: any) => void;
  onSave: () => void;
  isLoading: boolean;
  isUploadingImage: boolean;
  onImageUpload: () => void;
  colors: any;
  // 🔥 Feature flags props
  canEditName?: boolean;
  canEditEmail?: boolean;
  canEditMobile?: boolean;
  canEditPhoto?: boolean;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  profile,
  onProfileChange,
  onSave,
  isLoading,
  isUploadingImage,
  onImageUpload,
  colors,
  canEditName = true,
  canEditEmail = true,
  canEditMobile = true,
  canEditPhoto = true,
}) => {
  // Name ko split karo (sirf tab jab name edit allowed ho)
  const nameParts = (profile.name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const handleFirstNameChange = (text: string) => {
    const fullName = `${text} ${lastName}`.trim();
    onProfileChange("name", fullName);
  };

  const handleLastNameChange = (text: string) => {
    const fullName = `${firstName} ${text}`.trim();
    onProfileChange("name", fullName);
  };

  // Check if any field is editable
  const isAnyFieldEditable =
    canEditName || canEditEmail || canEditMobile || canEditPhoto;

  if (!isAnyFieldEditable) {
    return null;
  }

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
              style={{ fontSize: 20, fontWeight: "600", color: colors.text }}
            >
              Edit Profile
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 🔥 Profile Image - Conditional */}
            {canEditPhoto && (
              <View style={{ alignItems: "center", marginBottom: 24 }}>
                <View style={{ position: "relative" }}>
                  <Image
                    source={{
                      uri:
                        profile.profileImage ||
                        "https://via.placeholder.com/100",
                    }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      borderWidth: 3,
                      borderColor: colors.primary,
                    }}
                  />
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: colors.primary,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 3,
                      borderColor: colors.card,
                    }}
                    onPress={onImageUpload}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Feather name="camera" size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 🔥 Name Fields - Conditional */}
            {canEditName && (
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
                    First Name
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
                    value={firstName}
                    onChangeText={handleFirstNameChange}
                    placeholder="Enter first name"
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
                    Last Name
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
                    value={lastName}
                    onChangeText={handleLastNameChange}
                    placeholder="Enter last name"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            )}

            {/* 🔥 Email Field - Conditional (Read Only - sirf show karna hai) */}
            {canEditEmail && (
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  Email
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
                    color: colors.textSecondary,
                  }}
                  value={profile.email || ""}
                  editable={false}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            )}

            {/* 🔥 Phone Field - Conditional */}
            {canEditMobile && (
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  Phone Number
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
                  value={profile.phone || ""}
                  onChangeText={(text) => onProfileChange("phone", text)}
                  keyboardType="phone-pad"
                  placeholder="Enter phone number"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            )}

            {/* 🔥 Newsletter Subscription - Sirf tab dikhega jab koi field editable ho */}
            {(canEditName || canEditEmail || canEditMobile || canEditPhoto) && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                  padding: 16,
                  backgroundColor: colors.background,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 16, color: colors.text }}>
                  Subscribe to Newsletter
                </Text>
                <Switch
                  value={profile.newsletterSubscription || false}
                  onValueChange={(value) =>
                    onProfileChange("newsletterSubscription", value)
                  }
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            )}

            {/* Action Buttons */}
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
                    Save Changes
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

export default EditProfileModal;
