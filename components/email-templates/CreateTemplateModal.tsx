// components/email-templates/components/CreateTemplateModal.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { useTemplateForm } from "@/data/types/email-templates/useTemplateForm";
import { templateCategories, templateVariables } from "./constants";
import { createStyles } from "./styles";


interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (form: any) => Promise<void>;
}

export const CreateTemplateModal: React.FC<Props> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);
  const {
    form,
    showVariables,
    setShowVariables,
    updateField,
    insertVariable,
    resetForm,
    validate,
  } = useTemplateForm();

  const handleCreate = async () => {
    if (!validate()) {
      alert("Please fill all required fields");
      return;
    }
    await onCreate(form);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Template</Text>
            <TouchableOpacity onPress={handleClose}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Name */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Template Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter template name"
                placeholderTextColor={colors.textSecondary}
                value={form.name}
                onChangeText={(text) => updateField("name", text)}
              />
            </View>

            {/* Category */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {templateCategories
                    .filter((c) => c.id !== "all")
                    .map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categorySelector,
                          {
                            borderColor:
                              form.category === category.id
                                ? category.color
                                : colors.border,
                            backgroundColor:
                              form.category === category.id
                                ? category.color + "20"
                                : "transparent",
                          },
                        ]}
                        onPress={() => updateField("category", category.id)}
                      >
                        <Feather
                          name={category.icon as any}
                          size={16}
                          color={
                            form.category === category.id
                              ? category.color
                              : colors.textSecondary
                          }
                        />
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color:
                              form.category === category.id
                                ? category.color
                                : colors.textSecondary,
                            marginTop: 4,
                          }}
                        >
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </ScrollView>
            </View>

            {/* Subject */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Subject *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email subject"
                placeholderTextColor={colors.textSecondary}
                value={form.subject}
                onChangeText={(text) => updateField("subject", text)}
              />
            </View>

            {/* Description */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Brief description of template"
                placeholderTextColor={colors.textSecondary}
                value={form.description}
                onChangeText={(text) => updateField("description", text)}
              />
            </View>

            {/* Variables Helper */}
            <TouchableOpacity
              style={styles.variablesHelper}
              onPress={() => setShowVariables(!showVariables)}
            >
              <View>
                <Text style={styles.variablesHelperTitle}>
                  Available Variables
                </Text>
                <Text style={styles.variablesHelperText}>
                  Click to insert variables like {templateVariables[0]}
                </Text>
              </View>
              <Feather
                name={showVariables ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {showVariables && (
              <View style={{ marginBottom: 12 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}
                  >
                    {templateVariables.map((variable) => (
                      <TouchableOpacity
                        key={variable}
                        style={styles.variableTag}
                        onPress={() => insertVariable(variable)}
                      >
                        <Text style={styles.variableTagText}>{variable}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Content */}
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.inputLabel}>Template Content *</Text>
              <TextInput
                style={styles.contentInput}
                placeholder="Enter email content..."
                placeholderTextColor={colors.textSecondary}
                value={form.content}
                onChangeText={(text) => updateField("content", text)}
                multiline
                numberOfLines={10}
              />
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={handleClose}
            >
              <Text style={[styles.actionText, styles.secondaryActionText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={handleCreate}
            >
              <Text style={[styles.actionText, styles.primaryActionText]}>
                Create
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
