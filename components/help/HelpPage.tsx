// components/help/HelpPage.tsx

import React, { useState, useEffect } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Linking,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import CommonHeader from "@/components/common/CommonHeader";
import { useAppTheme } from "@/context/ThemeContext";
import { useSupport } from "@/context/SupportContext";
import {
  useTicketForm,
  useFeedbackForm,
  useFAQSearch,
} from "@/hooks/useSupport";
import ChatSupport from "./ChatSupport";

const HelpPage = () => {
  const { colors: themeColors, isDark } = useAppTheme();

  // Fallback colors if theme not loaded
  const colors = themeColors || {
    background: isDark ? "#000000" : "#FFFFFF",
    card: isDark ? "#1F2937" : "#F9FAFB",
    text: isDark ? "#FFFFFF" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    border: isDark ? "#374151" : "#E5E7EB",
    primary: "#4F46E5",
    info: "#3B82F6",
    warning: "#F59E0B",
    error: "#EF4444",
  };

  // Get all needed functions from useSupport hook
  const {
    faqCategories,
    fetchFAQCategories,
    loadingFAQs: loadingCategories,
    trackFAQHelpfulness,
  } = useSupport();

  // Local UI State
  const [showContactModal, setShowContactModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showChatSupport, setShowChatSupport] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<number | null>(null);

  // Custom Hooks
  const {
    formData: contactForm,
    updateField: updateContactField,
    resetForm: resetContactForm,
    isSubmitting: isSubmittingTicket,
    error: ticketError,
    submit: submitTicket,
  } = useTicketForm();

  const {
    rating,
    comment,
    setRating,
    setComment,
    resetForm: resetFeedbackForm,
    isSubmitting: isSubmittingFeedback,
    error: feedbackError,
    submit: submitFeedback,
  } = useFeedbackForm();

  const {
    searchQuery,
    selectedCategory,
    filteredFAQs,
    setSearchQuery,
    setSelectedCategory,
    loading: loadingFAQs,
  } = useFAQSearch();

  // Load FAQ categories on mount
  useEffect(() => {
    fetchFAQCategories();
  }, [fetchFAQCategories]);

  // Handle contact form submission
  const handleContactSubmit = async () => {
    if (
      !contactForm.name ||
      !contactForm.email ||
      !contactForm.subject ||
      !contactForm.message
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      await submitTicket();
      Alert.alert(
        "Message Sent",
        "Our support team will get back to you within 24 hours.",
        [
          {
            text: "OK",
            onPress: () => {
              setShowContactModal(false);
              resetContactForm();
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        ticketError || error?.message || "Failed to send message",
      );
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    try {
      await submitFeedback(
        contactForm.name || "Anonymous",
        contactForm.email || "anonymous@example.com",
      );
      Alert.alert("Thank You!", "Your feedback has been submitted.", [
        {
          text: "OK",
          onPress: () => {
            setShowFeedbackModal(false);
            resetFeedbackForm();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        feedbackError || error?.message || "Failed to submit feedback",
      );
    }
  };

  // Handle FAQ helpfulness using the function from useSupport
  const handleHelpfulFeedback = async (faqId: number, helpful: boolean) => {
    await trackFAQHelpfulness(faqId, helpful);
  };

  // Quick Actions
  const quickActions = [
    {
      id: 1,
      title: "Watch Tutorial",
      description: "Step-by-step video guides",
      icon: "video",
      action: () => Linking.openURL("https://example.com/tutorials"),
    },
    {
      id: 2,
      title: "User Guide",
      description: "Detailed documentation",
      icon: "book",
      action: () => Linking.openURL("https://example.com/docs"),
    },
    {
      id: 3,
      title: "Chat with Support",
      description: "Get instant help",
      icon: "message-circle",
      action: () => setShowChatSupport(true),
    },
    {
      id: 4,
      title: "Give Feedback",
      description: "Help us improve",
      icon: "message-square",
      action: () => setShowFeedbackModal(true),
    },
  ];

  // Prepare categories for display
  const displayCategories =
    faqCategories && faqCategories.length > 0
      ? faqCategories
      : [
          {
            id: "getting-started",
            name: "Getting Started",
            icon: "play-circle",
            count: 0,
          },
          { id: "contacts", name: "Contacts & Leads", icon: "users", count: 0 },
          {
            id: "calendar",
            name: "Calendar & Events",
            icon: "calendar",
            count: 0,
          },
          { id: "activities", name: "Activities", icon: "activity", count: 0 },
          {
            id: "tasks",
            name: "Tasks & Reminders",
            icon: "check-square",
            count: 0,
          },
          { id: "analytics", name: "Analytics", icon: "bar-chart-2", count: 0 },
          { id: "settings", name: "Settings", icon: "settings", count: 0 },
          {
            id: "troubleshooting",
            name: "Troubleshooting",
            icon: "tool",
            count: 0,
          },
        ];

  // Contact Modal Component
  const ContactModalComponent = () => (
    <Modal
      visible={showContactModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowContactModal(false)}
    >
      <View
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
              Contact Support
            </Text>
            <TouchableOpacity onPress={() => setShowContactModal(false)}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 24,
              }}
            >
              Our team typically responds within 24 hours.
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
                Your Name
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
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
                value={contactForm.name}
                onChangeText={(text) => updateContactField("name", text)}
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
                Email Address
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
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                value={contactForm.email}
                onChangeText={(text) => updateContactField("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
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
                Subject
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
                placeholder="What do you need help with?"
                placeholderTextColor={colors.textSecondary}
                value={contactForm.subject}
                onChangeText={(text) => updateContactField("subject", text)}
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
                Message
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
                  height: 120,
                  textAlignVertical: "top",
                }}
                placeholder="Describe your issue in detail..."
                placeholderTextColor={colors.textSecondary}
                value={contactForm.message}
                onChangeText={(text) => updateContactField("message", text)}
                multiline
                numberOfLines={5}
              />
            </View>

            {ticketError && (
              <Text
                style={{
                  color: colors.error,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {ticketError}
              </Text>
            )}

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
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
                onPress={() => setShowContactModal(false)}
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
                }}
                onPress={handleContactSubmit}
                disabled={isSubmittingTicket}
              >
                {isSubmittingTicket ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#FFFFFF",
                    }}
                  >
                    Send Message
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Feedback Modal Component
  const FeedbackModalComponent = () => (
    <Modal
      visible={showFeedbackModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFeedbackModal(false)}
    >
      <View
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
              Give Feedback
            </Text>
            <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 16,
              }}
            >
              How would you rate your experience?
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  style={{ marginHorizontal: 8 }}
                  onPress={() => setRating(star)}
                >
                  <Feather
                    name={star <= rating ? "star" : "star"}
                    size={40}
                    color={star <= rating ? colors.warning : colors.border}
                  />
                </TouchableOpacity>
              ))}
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
                Additional Comments (Optional)
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
                  height: 100,
                  textAlignVertical: "top",
                }}
                placeholder="Tell us what you think..."
                placeholderTextColor={colors.textSecondary}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
              />
            </View>

            {feedbackError && (
              <Text
                style={{
                  color: colors.error,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {feedbackError}
              </Text>
            )}

            <TouchableOpacity
              style={{
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: "center",
                marginBottom: 24,
              }}
              onPress={handleFeedbackSubmit}
              disabled={isSubmittingFeedback}
            >
              {isSubmittingFeedback ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}
                >
                  Submit Feedback
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <CommonHeader title="Help Center" />
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Search Bar */}
        <View
          style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 12,
            }}
          >
            <Feather name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 8,
                fontSize: 16,
                color: colors.text,
              }}
              placeholder="Search for help..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ padding: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Quick Help
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginHorizontal: -6,
            }}
          >
            {quickActions.map((action) => (
              <View key={action.id} style={{ width: "50%", padding: 6 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  onPress={action.action}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: `${colors.primary}20`,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Feather
                      name={action.icon as any}
                      size={20}
                      color={colors.primary}
                    />
                  </View>

                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {action.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      lineHeight: 16,
                    }}
                  >
                    {action.description}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Help Categories */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Browse by Category
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginHorizontal: -6,
            }}
          >
            {displayCategories.map((category) => (
              <View key={category.id} style={{ width: "50%", padding: 6 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor:
                      selectedCategory === category.name
                        ? `${colors.primary}20`
                        : colors.card,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor:
                      selectedCategory === category.name
                        ? colors.primary
                        : colors.border,
                    minHeight: 100,
                  }}
                  onPress={() => {
                    if (selectedCategory === category.name) {
                      setSelectedCategory(null);
                    } else {
                      setSelectedCategory(category.name);
                    }
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
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
                      <Feather
                        name={category.icon as any}
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.text,
                        flexShrink: 1,
                      }}
                    >
                      {category.name}
                    </Text>
                  </View>

                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {category.count} articles
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "600", color: colors.text }}
            >
              Frequently Asked Questions
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              {filteredFAQs?.length || 0} questions
            </Text>
          </View>

          {loadingFAQs ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 40,
                backgroundColor: colors.card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 12,
                }}
              >
                Loading FAQs...
              </Text>
            </View>
          ) : filteredFAQs && filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                onPress={() =>
                  setSelectedFAQ(selectedFAQ === faq.id ? null : faq.id)
                }
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  marginBottom: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                          backgroundColor: `${colors.info}20`,
                          marginRight: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: colors.info,
                            fontWeight: "600",
                          }}
                        >
                          {faq.category}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: colors.text,
                        marginBottom: 8,
                      }}
                    >
                      {faq.question}
                    </Text>
                  </View>
                  <Feather
                    name={
                      selectedFAQ === faq.id ? "chevron-up" : "chevron-down"
                    }
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>

                {selectedFAQ === faq.id && (
                  <View
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.textSecondary,
                        lineHeight: 20,
                      }}
                    >
                      {faq.answer}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        marginTop: 12,
                        gap: 12,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleHelpfulFeedback(faq.id, true)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Feather
                          name="thumbs-up"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={{ fontSize: 12, color: colors.textSecondary }}
                        >
                          Helpful ({faq.helpful || 0})
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleHelpfulFeedback(faq.id, false)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Feather
                          name="thumbs-down"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={{ fontSize: 12, color: colors.textSecondary }}
                        >
                          Not Helpful ({faq.notHelpful || 0})
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 40,
                backgroundColor: colors.card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Feather name="search" size={48} color={colors.textSecondary} />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: colors.text,
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                No results found
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Try a different search term
              </Text>
            </View>
          )}
        </View>

        {/* Contact Section */}
        <View
          style={{
            margin: 20,
            padding: 20,
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Still need help?
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: 20,
              lineHeight: 20,
            }}
          >
            Our support team is here to assist you
          </Text>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.primary,
                alignItems: "center",
              }}
              onPress={() => setShowChatSupport(true)}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}
              >
                Chat with Support
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
              onPress={() => setShowContactModal(true)}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: colors.text }}
              >
                Contact Form
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <ContactModalComponent />
      <FeedbackModalComponent />
      <ChatSupport
        visible={showChatSupport}
        onClose={() => setShowChatSupport(false)}
      />
    </SafeAreaView>
  );
};

export default HelpPage;
