// components/email-templates/components/TemplateDetailModal.tsx
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { Template } from "./emailtypes";
import { createStyles } from "./styles";
import { RecipientSelectorModal } from "./RecipientSelectorModal";

const { height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  template: Template | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onSend: (template: Template) => void;
  onDelete: (id: string) => void;
  onPreview: (template: Template) => void;
  categoryColor: string;
}

export const TemplateDetailModal: React.FC<Props> = ({
  visible,
  template,
  onClose,
  onToggleFavorite,
  onSend,
  onDelete,
  onPreview,
  categoryColor,
}) => {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);

  const [showRecipientSelector, setShowRecipientSelector] = useState(false);

  if (!template) return null;

  const handleSendPress = () => {
    setShowRecipientSelector(true);
  };

  const handleSendEmails = async (recipients: any[], template: Template) => {
    // Sirf tracking ke liye original onSend call
    onSend(template);
    setShowRecipientSelector(false);
    onClose();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: height * 0.9 }]}>
            {/* Header */}
            <View
              style={[
                styles.modalHeader,
                {
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              >
                <View
                  style={[
                    styles.categoryIconContainer,
                    {
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: categoryColor + "20",
                      marginRight: 14,
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                >
                  <Feather name="mail" size={22} color={categoryColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.modalTitle,
                      { fontSize: 18, fontWeight: "600" },
                    ]}
                  >
                    {template.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    {template.description}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: isDark ? colors.border : "#f5f5f5",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 12,
                }}
              >
                <Feather name="x" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <View style={{ padding: 20 }}>
                {/* Info Card */}
                <View
                  style={[
                    styles.infoCard,
                    {
                      padding: 16,
                      borderRadius: 16,
                      backgroundColor: isDark ? colors.card : "#f8f9fa",
                      marginBottom: 20,
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.infoLabel,
                          { fontSize: 12, marginBottom: 4 },
                        ]}
                      >
                        Subject
                      </Text>
                      <Text
                        style={[
                          styles.infoValue,
                          { fontSize: 15, fontWeight: "500" },
                        ]}
                      >
                        {template.subject}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", marginLeft: 16 }}>
                      <Text
                        style={[
                          styles.infoLabel,
                          { fontSize: 12, marginBottom: 4 },
                        ]}
                      >
                        Used
                      </Text>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Feather name="hash" size={14} color={colors.primary} />
                        <Text
                          style={[
                            styles.infoValue,
                            {
                              color: colors.primary,
                              marginLeft: 4,
                              fontWeight: "600",
                            },
                          ]}
                        >
                          {template.useCount}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.infoLabel,
                          { fontSize: 12, marginBottom: 4 },
                        ]}
                      >
                        Created
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.text,
                          fontWeight: "500",
                        }}
                      >
                        {new Date(template.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", marginLeft: 16 }}>
                      <Text
                        style={[
                          styles.infoLabel,
                          { fontSize: 12, marginBottom: 4 },
                        ]}
                      >
                        Last Used
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.text,
                          fontWeight: "500",
                        }}
                      >
                        {template.lastUsed}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Variables */}
                {template.variables.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <Feather name="code" size={16} color={colors.primary} />
                      <Text
                        style={[
                          styles.variableTitle,
                          { marginLeft: 8, fontSize: 15, fontWeight: "600" },
                        ]}
                      >
                        Available Variables
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                    >
                      {template.variables.map((v) => (
                        <TouchableOpacity
                          key={v}
                          style={[
                            styles.variableTag,
                            {
                              backgroundColor: colors.primary + "10",
                              borderColor: colors.primary + "30",
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 8,
                              borderWidth: 1,
                            },
                          ]}
                          onPress={() =>
                            Alert.alert("Copied", `${v} copied to clipboard`)
                          }
                        >
                          <Text
                            style={[
                              styles.variableTagText,
                              { color: colors.primary, fontSize: 13 },
                            ]}
                          >
                            {v}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Content */}
                <View style={{ marginBottom: 20 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Feather name="file-text" size={16} color={colors.text} />
                      <Text
                        style={[
                          styles.contentContainerTitle,
                          { marginLeft: 8, fontSize: 15, fontWeight: "600" },
                        ]}
                      >
                        Template Content
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => onPreview(template)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.primary + "10",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Feather name="eye" size={14} color={colors.primary} />
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.primary,
                          fontWeight: "600",
                          marginLeft: 4,
                        }}
                      >
                        Preview
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[
                      styles.contentPreview,
                      {
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: isDark ? colors.card : "#f8f9fa",
                        borderWidth: 1,
                        borderColor: colors.border,
                        maxHeight: 200,
                      },
                    ]}
                  >
                    <ScrollView>
                      <Text
                        style={[
                          styles.contentTextMonospace,
                          { fontSize: 14, lineHeight: 20 },
                        ]}
                      >
                        {template.content}
                      </Text>
                    </ScrollView>
                  </View>
                </View>

                {/* Tags */}
                {template.tags.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <Text
                      style={[
                        styles.contentContainerTitle,
                        { marginBottom: 12, fontSize: 15, fontWeight: "600" },
                      ]}
                    >
                      Tags
                    </Text>
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                    >
                      {template.tags.map((tag) => (
                        <View
                          key={tag}
                          style={[
                            styles.tag,
                            {
                              backgroundColor: isDark
                                ? colors.border
                                : "#f0f0f0",
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 8,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.tagText,
                              { fontSize: 13, color: colors.textSecondary },
                            ]}
                          >
                            #{tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View
              style={[
                styles.modalActions,
                {
                  padding: 20,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  flexDirection: "row",
                  gap: 12,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    flex: 1,
                    backgroundColor: "#ff3b30",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 14,
                    borderRadius: 12,
                    gap: 8,
                  },
                ]}
                onPress={() => {
                  Alert.alert(
                    "Delete Template",
                    `Are you sure you want to delete "${template.name}"?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => onDelete(template.id),
                      },
                    ],
                  );
                }}
              >
                <Feather name="trash-2" size={20} color="#fff" />
                <Text
                  style={[
                    styles.actionText,
                    { color: "#fff", fontSize: 16, fontWeight: "600" },
                  ]}
                >
                  Delete
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.primaryAction,
                  {
                    flex: 1,
                    backgroundColor: colors.primary,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 14,
                    borderRadius: 12,
                    gap: 8,
                  },
                ]}
                onPress={handleSendPress}
              >
                <Feather name="send" size={20} color="#fff" />
                <Text
                  style={[
                    styles.actionText,
                    { color: "#fff", fontSize: 16, fontWeight: "600" },
                  ]}
                >
                  Send To
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Recipient Selector Modal */}
      {template && (
        <RecipientSelectorModal
          visible={showRecipientSelector}
          onClose={() => setShowRecipientSelector(false)}
          onSendEmails={handleSendEmails}
          template={template}
        />
      )}
    </>
  );
};
