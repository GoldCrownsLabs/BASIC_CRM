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
  const scrollViewContentRef = useRef<View>(null);
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
    // FIXED: Two separate sections
    leadStatus: "cold" as "cold" | "warm" | "hot", // Section 1: Lead Status
    tags: [] as string[], // Section 2: Regular tags (VIP, Client, etc.)
    notes: "",
    source: "other" as contactAPI.Contact["source"],
    isFavorite: false,
  });

  const [tempTag, setTempTag] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Debug logs
  useEffect(() => {
    console.log("📌 Current tags:", newContact.tags);
    console.log("🔥 Current leadStatus:", newContact.leadStatus);
  }, [newContact.tags, newContact.leadStatus]);

  // Handle keyboard show/hide with animation
  useEffect(() => {
    keyboardShowListener.current = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
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
        leadStatus: "cold",
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

  const handleTextChange = (
    field: keyof typeof newContact,
    value:
      | string
      | contactAPI.Contact["source"]
      | boolean
      | string[]
      | "cold"
      | "warm"
      | "hot",
  ) => {
    setNewContact((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle tag addition (for regular tags only)
  const handleAddTag = () => {
    if (!tempTag.trim()) return;

    const tag = tempTag.trim();
    console.log("➕ Adding tag:", tag);

    setNewContact((prev) => {
      if (!prev.tags.includes(tag)) {
        return {
          ...prev,
          tags: [...prev.tags, tag],
        };
      }
      return prev;
    });
    setTempTag("");
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    console.log("➖ Removing tag:", tagToRemove);
    setNewContact((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Handle tag suggestion click
  const handleTagSuggestionPress = (tag: string) => {
    console.log("💡 Adding tag from suggestion:", tag);
    setNewContact((prev) => {
      if (!prev.tags.includes(tag)) {
        return {
          ...prev,
          tags: [...prev.tags, tag],
        };
      }
      return prev;
    });
  };

  const focusNextField = (nextField: string) => {
    inputRefs.current[nextField]?.focus();
  };

  const scrollToInput = (fieldName: string) => {
    setTimeout(() => {
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
        const estimatedY = index * 80;
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, estimatedY - 100),
          animated: true,
        });
      }
    }, 100);
  };

  const handleInputFocus = (fieldName: string) => {
    setFocusedInput(fieldName);

    setTimeout(() => {
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

  // FIXED: Lead Status Options - Section 1
  const leadStatusOptions: {
    value: "cold" | "warm" | "hot";
    label: string;
    color: string;
  }[] = [
    { value: "cold", label: "Cold", color: "#94A3B8" },
    { value: "warm", label: "Warm", color: "#F59E0B" },
    { value: "hot", label: "Hot", color: "#EF4444" },
  ];

  // FIXED: Tag Suggestions - Section 2 (Regular tags only, no lead status tags)
  const tagSuggestions = ["VIP", "Client", "Prospect", "Partner", "Regular"];

  const handleAddContact = async () => {
    if (!validateForm()) return;

    setLoading(true);
    Keyboard.dismiss();

    try {
      // Filter out empty tags
      const tags = newContact.tags.filter((tag) => tag.trim() !== "");

      console.log("🏷️ Final tags being sent:", tags);
      console.log("🔥 Final leadStatus being sent:", newContact.leadStatus);

      const contactData = {
        firstName: newContact.firstName.trim(),
        lastName: newContact.lastName.trim() || undefined,
        email: newContact.email.trim() || undefined,
        phone: newContact.phone.trim() || undefined,
        company: newContact.company.trim() || undefined,
        jobTitle: newContact.jobTitle.trim() || undefined,
        notes: newContact.notes.trim() || undefined,
        source: newContact.source,
        isFavorite: newContact.isFavorite,
        // FIXED: Two separate fields
        leadStatus: newContact.leadStatus, // Section 1
        tags: tags.length > 0 ? tags : undefined, // Section 2

        // Default values
        address: undefined,
        lastContacted: undefined,
        connected: false,
        completed: false,
        dealValue: 0,
        dealCurrency: "INR" as const,
        connectedNotes: "",
        completedNotes: "",
      };

      console.log("📤 Sending payload:", JSON.stringify(contactData, null, 2));

      const response = await contactAPI.createContact(contactData);

      console.log("✅ API Response:", response);

      if (response && typeof response === "object") {
        if ("success" in response && !response.success) {
          Alert.alert("Error", response.message || "Failed to add contact");
          setLoading(false);
          return;
        }
      }

      await onContactAdded();
      onClose();
    } catch (error: any) {
      console.error("❌ Error adding contact:", error);

      let errorMessage = "Failed to add contact";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(
        "Error",
        `${errorMessage}\n\nStatus: ${error.response?.status || error.status || 500}`,
        [
          { text: "OK" },
          {
            text: "Retry",
            onPress: () => handleAddContact(),
          },
        ],
      );

      setLoading(false);
    }
  };

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
            {/* Modal Header */}
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

            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              scrollEventThrottle={16}
            >
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
                    onSubmitEditing={() => focusNextField("tagInput")}
                    onFocus={() => handleInputFocus("jobTitle")}
                    blurOnSubmit={false}
                  />
                </View>

                {/* SECTION 1: Lead Status - Hot/Warm/Cold */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: colors.text }]}>
                    Lead Status
                  </ThemedText>
                  <View style={styles.sourceContainer}>
                    {leadStatusOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.sourceButton,
                          {
                            backgroundColor:
                              newContact.leadStatus === option.value
                                ? option.color + "20"
                                : colors.background,
                            borderColor:
                              newContact.leadStatus === option.value
                                ? option.color
                                : colors.border,
                          },
                        ]}
                        onPress={() =>
                          handleTextChange("leadStatus", option.value)
                        }
                        disabled={loading}
                      >
                        <ThemedText
                          style={{
                            color:
                              newContact.leadStatus === option.value
                                ? option.color
                                : colors.text,
                            fontSize: 13,
                            fontWeight:
                              newContact.leadStatus === option.value
                                ? "600"
                                : "400",
                          }}
                        >
                          {option.label}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* SECTION 2: Regular Tags - VIP, Client, etc. */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: colors.text }]}>
                    Tags (VIP, Client, etc.)
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
                        onPress={() => handleTagSuggestionPress(tag)}
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
