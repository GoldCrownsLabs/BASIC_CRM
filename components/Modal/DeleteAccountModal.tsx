import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  deleteConfirmationText: string;
  onDeleteConfirmationTextChange: (text: string) => void;
  onDelete: () => void;
  isLoading: boolean;
  colors: any;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
  deleteConfirmationText,
  onDeleteConfirmationTextChange,
  onDelete,
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
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            width: width * 0.9,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              padding: 24,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: `${colors.error}20`,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 16,
                }}
              >
                <Feather name="alert-triangle" size={24} color={colors.error} />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: colors.text,
                  flex: 1,
                }}
              >
                Delete Account
              </Text>
            </View>

            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                lineHeight: 20,
              }}
            >
              This action cannot be undone. All your data will be permanently
              deleted.
            </Text>
          </View>

          <View style={{ padding: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Type DELETE to confirm
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
                marginBottom: 24,
              }}
              value={deleteConfirmationText}
              onChangeText={onDeleteConfirmationTextChange}
              placeholder="Type DELETE here"
              placeholderTextColor={colors.textSecondary}
            />

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
                  backgroundColor: colors.error,
                  alignItems: "center",
                  opacity:
                    isLoading || deleteConfirmationText !== "DELETE" ? 0.7 : 1,
                }}
                onPress={onDelete}
                disabled={isLoading || deleteConfirmationText !== "DELETE"}
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
                    Delete Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteAccountModal;
