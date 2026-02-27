import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Keyboard,
  Dimensions,
  ActivityIndicator,
  Animated,
  findNodeHandle,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as contactAPI from "@/lib/api/contact.api";

interface AddContactModalProps {
  visible: boolean;
  onClose: () => void;
  onContactAdded: () => Promise<void>;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.9;

export default function AddContactModal({
  visible,
  onClose,
  onContactAdded,
}: AddContactModalProps) {
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollViewContentRef = useRef<View>(null); // Add this ref for the content
  const inputRefs = useRef<{ [key: string]: TextInput }>({});
  const keyboardShowListener = useRef<any>(null);
  const keyboardHideListener = useRef<any>(null);
  const modalTranslateY = useRef(new Animated.Value(0)).current;

  const [newContact, setNewContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    tags: [] as string[],
    notes: "",
    source: "other" as contactAPI.Contact["source"],
    isFavorite: false,
  });

  const [tempTag, setTempTag] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Handle keyboard show/hide with animation
  useEffect(() => {
    keyboardShowListener.current = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardVisible(true);
        Animated.spring(modalTranslateY, {
          toValue: -50,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }).start();
      },
    );

    keyboardHideListener.current = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        setFocusedInput(null);
        Animated.spring(modalTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }).start();
      },
    );

    return () => {
      keyboardShowListener.current?.remove();
      keyboardHideListener.current?.remove();
    };
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setNewContact({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        jobTitle: "",
        tags: [],
        notes: "",
        source: "other",
        isFavorite: false,
      });
      setTempTag("");
      setFocusedInput(null);
      modalTranslateY.setValue(0);
    }
  }, [visible]);

  const validateForm = () => {
    if (!newContact.firstName.trim()) {
      Alert.alert("Error", "Please enter a first name");
      scrollToInput("firstName");
      return false;
    }

    if (newContact.firstName.trim().length < 2) {
      Alert.alert("Error", "First name must be at least 2 characters");
      scrollToInput("firstName");
      return false;
    }

    if (newContact.email && newContact.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newContact.email)) {
        Alert.alert("Error", "Please enter a valid email address");
        scrollToInput("email");
        return false;
      }
    }

    if (newContact.phone && newContact.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
      if (!phoneRegex.test(newContact.phone)) {
        Alert.alert(
          "Error",
          "Please enter a valid phone number (10-20 digits)",
        );
        scrollToInput("phone");
        return false;
      }
    }

    return true;
  };

  const handleAddContact = async () => {
    if (!validateForm()) return;

    setLoading(true);
    Keyboard.dismiss();
    try {
      const contactData: contactAPI.ContactPayload = {
        firstName: newContact.firstName.trim(),
        lastName: newContact.lastName.trim() || undefined,
        email: newContact.email.trim() || undefined,
        phone: newContact.phone.trim() || undefined,
        company: newContact.company.trim() || undefined,
        jobTitle: newContact.jobTitle.trim() || undefined,
        notes: newContact.notes.trim() || undefined,
        source: newContact.source,
        isFavorite: newContact.isFavorite,
        tags: newContact.tags.length > 0 ? newContact.tags : undefined,
      };

      const response = await contactAPI.createContact(contactData);

      if ("success" in response && !response.success) {
        Alert.alert("Error", response.message || "Failed to add contact");
        setLoading(false);
        return;
      }

      await onContactAdded();
    } catch (error: any) {
      console.error("Error adding contact:", error);
      Alert.alert("Error", error.message || "Failed to add contact");
      setLoading(false);
    }
  };

  const handleTextChange = (
    field: keyof typeof newContact,
    value: string | contactAPI.Contact["source"] | boolean | string[],
  ) => {
    setNewContact({ ...newContact, [field]: value });
  };

  const handleAddTag = () => {
    if (!tempTag.trim()) return;

    const tag = tempTag.trim();
    if (!newContact.tags.includes(tag)) {
      setNewContact({
        ...newContact,
        tags: [...newContact.tags, tag],
      });
    }
    setTempTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewContact({
      ...newContact,
      tags: newContact.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const focusNextField = (nextField: string) => {
    inputRefs.current[nextField]?.focus();
  };

  // FIXED: Simplified scrollToInput function without measureLayout
  const scrollToInput = (fieldName: string) => {
    setTimeout(() => {
      // Simple scroll to approximate position based on input index
      const inputOrder = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "company",
        "jobTitle",
        "tagInput",
        "notes",
      ];

      const index = inputOrder.indexOf(fieldName);
      if (index !== -1) {
        // Rough estimate: each input group is about 80px height
        const estimatedY = index * 80;
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, estimatedY - 100),
          animated: true,
        });
      }
    }, 100);
  };

  // FIXED: Simplified handleInputFocus function
  const handleInputFocus = (fieldName: string) => {
    setFocusedInput(fieldName);

    setTimeout(() => {
      // Simple scroll to approximate position
      const inputOrder = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "company",
        "jobTitle",
        "tagInput",
        "notes",
      ];

      const index = inputOrder.indexOf(fieldName);
      if (index !== -1) {
        // Rough estimate: each input group is about 80px height
        const estimatedY = index * 80;
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, estimatedY - 120),
          animated: true,
        });
      }
    }, 100);
  };

  const sourceOptions: {
    value: contactAPI.Contact["source"];
    label: string;
  }[] = [
    { value: "website", label: "Website" },
    { value: "referral", label: "Referral" },
    { value: "social", label: "Social Media" },
    { value: "event", label: "Event" },
    { value: "other", label: "Other" },
  ];

  const tagSuggestions = ["VIP", "Hot Lead", "Client", "Prospect", "Partner"];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        if (!loading) {
          Keyboard.dismiss();
          onClose();
        }
      }}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        {/* Background Overlay with fade animation */}
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: modalTranslateY.interpolate({
                inputRange: [-50, 0],
                outputRange: [0.7, 0.5],
              }),
            },
          ]}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                transform: [{ translateY: modalTranslateY }],
                maxHeight: keyboardVisible
                  ? SCREEN_HEIGHT * 0.85
                  : MODAL_HEIGHT,
              },
            ]}
          >
            {/* Modal Header - Fixed at top */}
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: colors.border + "40" },
              ]}
            >
              <ThemedText type="title" style={{ color: colors.text }}>
                Add New Contact
              </ThemedText>
              <TouchableOpacity
                onPress={() => {
                  if (!loading) {
                    Keyboard.dismiss();
                    onClose();
                  }
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={loading}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={loading ? colors.textSecondary : colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              scrollEventThrottle={16}
            >
              {/* Add a View ref for the content if needed, but not required */}
              <View ref={scrollViewContentRef} style={styles.scrollContent}>
                {/* First Name */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: colors.text }]}>
                    First Name *
                  </ThemedText>
                  <TextInput
                    ref={(ref) => {
                      if (ref) inputRefs.current["firstName"] = ref;
                    }}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor:
                          focusedInput === "firstName"
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                    placeholder="Enter first name"
                    placeholderTextColor={colors.textSecondary}
                    value={newContact.firstName}
                    onChangeText={(text) => handleTextChange("firstName", text)}
                    editable={!loading}
                    returnKeyType="next"
                    onSubmitEditing={() => focusNextField("lastName")}
                    onFocus={() => handleInputFocus("firstName")}
                    blurOnSubmit={false}
                  />
                </View>

                {/* Last Name */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: colors.text }]}>
                    Last Name
                  </ThemedText>
                  <TextInput
                    ref={(ref) => {
                      if (ref) inputRefs.current["lastName"] = ref;
                    }}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor:
                          focusedInput === "lastName"
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                    placeholder="Enter last name"
                    placeholderTextColor={colors.textSecondary}
                    value={newContact.lastName}
                    onChangeText={(text) => handleTextChange("lastName", text)}
                    editable={!loading}
                    returnKeyType="next"
                    onSubmitEditing={() => focusNextField("email")}
                    onFocus={() => handleInputFocus("lastName")}
                    blurOnSubmit={false}
                  />
                </View>

                {/* Email */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: colors.text }]}>
                    Email Address
                  </ThemedText>
                  <TextInput
                    ref={(ref) => {
                      if (ref) inputRefs.current["email"] = ref;
                    }}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor:
                          focusedInput === "email"
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                    placeholder="Enter email address"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={newContact.email}
                    onChangeText={(text) => handleTextChange("email", text)}
                    editable={!loading}
                    returnKeyType="next"
                    onSubmitEditing={() => focusNextField("phone")}
                    onFocus={() => handleInputFocus("email")}
                    blurOnSubmit={false}
                  />
                </View>

                {/* Phone */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: colors.text }]}>
                    Phone Number
                  </ThemedText>
                  <TextInput
                    ref={(ref) => {
                      if (ref) inputRefs.current["phone"] = ref;
                    }}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor:
                          focusedInput === "phone"
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                    value={newContact.phone}
                    onChangeText={(text) => handleTextChange("phone", text)}
                    editable={!loading}
                    returnKeyType="next"
                    onSubmitEditing={() => focusNextField("company")}
                    onFocus={() => handleInputFocus("phone")}
                    blurOnSubmit={false}
                  />
                </View>

                {/* Company */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: colors.text }]}>
                    Company
                  </ThemedText>
                  <TextInput
                    ref={(ref) => {
                      if (ref) inputRefs.current["company"] = ref;
                    }}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor:
                          focusedInput === "company"
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                    placeholder="Enter company name"
                    placeholderTextColor={colors.textSecondary}
                    value={newContact.company}
                    onChangeText={(text) => handleTextChange("company", text)}
                    editable={!loading}
                    returnKeyType="next"
                    onSubmitEditing={() => focusNextField("jobTitle")}
                    onFocus={() => handleInputFocus("company")}
                    blurOnSubmit={false}
                  />
                </View>

                {/* Job Title */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: colors.text }]}>
                    Job Title
                  </ThemedText>
                  <TextInput
                    ref={(ref) => {
                      if (ref) inputRefs.current["jobTitle"] = ref;
                    }}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor:
                          focusedInput === "jobTitle"
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                    placeholder="Enter job title"
                    placeholderTextColor={colors.textSecondary}
                    value={newContact.jobTitle}
                    onChangeText={(text) => handleTextChange("jobTitle", text)}
                    editable={!loading}
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      if (tempTag || newContact.tags.length > 0) {
                        focusNextField("tagInput");
                      } else {
                        focusNextField("notes");
                      }
                    }}
                    onFocus={() => handleInputFocus("jobTitle")}
                    blurOnSubmit={false}
                  />
                </View>

                {/* Source Selection */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: colors.text }]}>
                    Source
                  </ThemedText>
                  <View style={styles.sourceContainer}>
                    {sourceOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.sourceButton,
                          {
                            backgroundColor:
                              newContact.source === option.value
                                ? colors.primary + "20"
                                : colors.background,
                            borderColor:
                              newContact.source === option.value
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                        onPress={() => handleTextChange("source", option.value)}
                        disabled={loading}
                      >
                        <ThemedText
                          style={{
                            color:
                              newContact.source === option.value
                                ? colors.primary
                                : colors.text,
                            fontSize: 13,
                          }}
                        >
                          {option.label}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Tags */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: colors.text }]}>
                    Tags
                  </ThemedText>

                  <View style={styles.tagInputContainer}>
                    <TextInput
                      ref={(ref) => {
                        if (ref) inputRefs.current["tagInput"] = ref;
                      }}
                      style={[
                        styles.tagInput,
                        {
                          backgroundColor: colors.background,
                          color: colors.text,
                          borderColor:
                            focusedInput === "tagInput"
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                      placeholder="Add a tag"
                      placeholderTextColor={colors.textSecondary}
                      value={tempTag}
                      onChangeText={setTempTag}
                      editable={!loading}
                      returnKeyType="done"
                      onSubmitEditing={handleAddTag}
                      onFocus={() => handleInputFocus("tagInput")}
                    />
                    <TouchableOpacity
                      style={[
                        styles.addTagButton,
                        { backgroundColor: colors.primary },
                      ]}
                      onPress={handleAddTag}
                      disabled={loading || !tempTag.trim()}
                    >
                      <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.tagSuggestionsContainer}>
                    {tagSuggestions.map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        style={[
                          styles.tagSuggestion,
                          {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => {
                          if (!newContact.tags.includes(tag)) {
                            handleTextChange("tags", [...newContact.tags, tag]);
                          }
                        }}
                        disabled={loading}
                      >
                        <ThemedText
                          style={{
                            color: newContact.tags.includes(tag)
                              ? colors.primary
                              : colors.text,
                            fontSize: 12,
                          }}
                        >
                          {tag}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {newContact.tags.length > 0 && (
                    <View style={styles.selectedTagsContainer}>
                      {newContact.tags.map((tag) => (
                        <View
                          key={tag}
                          style={[
                            styles.selectedTag,
                            {
                              backgroundColor: colors.primary + "20",
                              borderColor: colors.primary + "40",
                            },
                          ]}
                        >
                          <ThemedText
                            style={{
                              fontSize: 12,
                              color: colors.primary,
                              marginRight: 4,
                            }}
                          >
                            {tag}
                          </ThemedText>
                          <TouchableOpacity
                            onPress={() => handleRemoveTag(tag)}
                            disabled={loading}
                          >
                            <Ionicons
                              name="close-circle"
                              size={14}
                              color={colors.primary}
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Notes */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: colors.text }]}>
                    Notes
                  </ThemedText>
                  <TextInput
                    ref={(ref) => {
                      if (ref) inputRefs.current["notes"] = ref;
                    }}
                    style={[
                      styles.textArea,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor:
                          focusedInput === "notes"
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                    placeholder="Add notes about this contact"
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    value={newContact.notes}
                    onChangeText={(text) => handleTextChange("notes", text)}
                    editable={!loading}
                    textAlignVertical="top"
                    onFocus={() => handleInputFocus("notes")}
                  />
                </View>

                {/* Favorite Toggle */}
                <View style={styles.formGroup}>
                  <TouchableOpacity
                    style={styles.favoriteToggle}
                    onPress={() =>
                      handleTextChange("isFavorite", !newContact.isFavorite)
                    }
                    disabled={loading}
                  >
                    <Ionicons
                      name={newContact.isFavorite ? "star" : "star-outline"}
                      size={20}
                      color={
                        newContact.isFavorite
                          ? colors.primary
                          : colors.textSecondary
                      }
                    />
                    <ThemedText style={{ color: colors.text, marginLeft: 8 }}>
                      Mark as favorite
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    {
                      backgroundColor: colors.primary,
                      opacity: loading ? 0.7 : 1,
                    },
                  ]}
                  onPress={handleAddContact}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <ThemedText style={styles.submitButtonText}>
                      Add Contact
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  scrollView: {
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
  },
  sourceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sourceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tagInput: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    fontSize: 16,
    marginRight: 8,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  tagSuggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  tagSuggestion: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  favoriteToggle: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
