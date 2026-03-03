import React, { useState } from "react";
import {
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { Contact } from "@/lib/api/contact.api";

// Extend Contact type to include 'event' source
declare global {
  interface Contact {
    source?: "call" | "website" | "referral" | "social" | "email" | "meeting" | "event" | "other";
  }
}

// Type for valid Ionicons names
type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface ContactCardProps {
  contact: Contact;
  onPress: () => void;
  onToggleFavorite: () => Promise<void>;
  onDelete: () => void;
  // 🔥 NEW: Pipeline action props
  onMarkAsConnected?: () => void;
  onMarkAsCompleted?: (dealValue: number) => void;
  // 🔥 NEW: Helper functions
  getStatusColor?: (status: string) => string;
  getStatusIcon?: (status: string) => string;
  formatCurrency?: (amount: number) => string;
}

export default function ContactCard({
  contact,
  onPress,
  onToggleFavorite,
  onDelete,
  // 🔥 NEW props with defaults
  onMarkAsConnected,
  onMarkAsCompleted,
  getStatusColor = (status) => {
    const colors: Record<string, string> = {
      cold: "#9e9e9e",
      warm: "#ff9800",
      hot: "#f44336",
      connected: "#2196f3",
      completed: "#4caf50",
    };
    return colors[status] || "#9e9e9e";
  },
  getStatusIcon = (status) => {
    const icons: Record<string, string> = {
      cold: "❄️",
      warm: "🌤️",
      hot: "🔥",
      connected: "📞",
      completed: "✅",
    };
    return icons[status] || "📌";
  },
  formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  },
}: ContactCardProps) {
  const { colors } = useAppTheme();
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [dealValue, setDealValue] = useState("");
  const [dealNotes, setDealNotes] = useState("");

  // Helper function to get full name
  const getFullName = (): string => {
    return `${contact.firstName}${contact.lastName ? ` ${contact.lastName}` : ""}`;
  };

  // Helper function to get job title
  const getJobTitle = (): string => {
    return contact.jobTitle || "";
  };

  // Helper function to get tags array
  const getTags = (): string[] => {
    return contact.tags || [];
  };

  // Helper function to get last contact date
  const getLastContactDate = (): Date | string => {
    return (
      contact.lastContacted ||
      contact.updatedAt ||
      contact.createdAt ||
      new Date()
    );
  };

  // 🔥 NEW: Get lead status display
  const getLeadStatusDisplay = (): {
    text: string;
    color: string;
    icon: string;
  } => {
    const status = contact.leadStatus || "cold";
    return {
      text: status.charAt(0).toUpperCase() + status.slice(1),
      color: getStatusColor(status),
      icon: getStatusIcon(status),
    };
  };

  // 🔥 NEW: Get pipeline progress
  const getPipelineProgress = (): number => {
    const stages = ["cold", "warm", "hot", "connected", "completed"];
    const currentIndex = stages.indexOf(contact.leadStatus || "cold");
    return ((currentIndex + 1) / stages.length) * 100;
  };

  // Determine contact status based on lastContacted (legacy)
  const getStatus = (): string => {
    if (!contact.lastContacted) return "new";

    const lastContacted = new Date(contact.lastContacted);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - lastContacted.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff <= 7) return "active";
    if (daysDiff <= 30) return "warm";
    return "cold";
  };

  // Helper function to get status color (legacy)
  const getLegacyStatusColor = (): string => {
    const status = getStatus();
    switch (status) {
      case "active":
        return "#4CAF50"; // Green
      case "warm":
        return "#FF9800"; // Orange
      case "cold":
        return "#F44336"; // Red
      default:
        return "#9E9E9E"; // Gray for new
    }
  };

  // Check if contact is VIP
  const isVIP = (): boolean => {
    return getTags().some((tag) => tag.toLowerCase() === "vip");
  };

  // Check if contact is Hot Lead
  const isHotLead = (): boolean => {
    return (
      contact.leadStatus === "hot" ||
      getTags().some(
        (tag) =>
          tag.toLowerCase().includes("hot") ||
          tag.toLowerCase().includes("lead"),
      )
    );
  };

  // Handle favorite toggle with loading state
  const handleToggleFavorite = async () => {
    if (favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      await onToggleFavorite();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", "Failed to update favorite status");
    } finally {
      setFavoriteLoading(false);
    }
  };

  // 🔥 NEW: Handle mark as connected
  const handleMarkAsConnected = () => {
    Alert.alert(
      "Mark as Connected",
      `Are you sure you want to mark ${getFullName()} as connected?`,
      [
        { text: "Cancel", style: "cancel" as const }, // ✅ FIXED: Added 'as const'
        {
          text: "Connect",
          onPress: () => {
            onMarkAsConnected?.();
            setShowActions(false);
          },
        },
      ],
    );
  };

  // 🔥 NEW: Handle mark as completed
  const handleMarkAsCompleted = () => {
    if (!dealValue || parseFloat(dealValue) <= 0) {
      Alert.alert("Error", "Please enter a valid deal amount");
      return;
    }

    onMarkAsCompleted?.(parseFloat(dealValue));
    setShowDealModal(false);
    setDealValue("");
    setDealNotes("");
    setShowActions(false);
  };

  // Handle long press for options
  const handleLongPress = () => {
    // ✅ FIXED: Create options with correct types
    const options: {
      text: string;
      onPress?: () => void;
      style?: "cancel" | "destructive" | "default";
    }[] = [
      { text: "Cancel", style: "cancel" as const },
      { text: "View Details", onPress: onPress },
      {
        text: contact.isFavorite ? "Remove Favorite" : "Mark as Favorite",
        onPress: handleToggleFavorite,
      },
    ];

    // 🔥 NEW: Add pipeline actions if not already completed
    if (!contact.completed) {
      if (!contact.connected && onMarkAsConnected) {
        options.push({
          text: "Mark as Connected",
          onPress: () => setShowActions(true),
        });
      }

      if (contact.connected && onMarkAsCompleted) {
        options.push({
          text: "Mark as Completed",
          onPress: () => setShowDealModal(true),
        });
      }
    }

    options.push({
      text: "Delete",
      style: "destructive" as const, // ✅ FIXED: Added 'as const'
      onPress: onDelete,
    });

    Alert.alert("Contact Options", "What would you like to do?", options);
  };

  // Get badge color based on tag type
  const getTagColor = (tag: string): string => {
    const tagLower = tag.toLowerCase();
    switch (true) {
      case tagLower === "vip":
        return "#FFD700"; // Gold
      case tagLower.includes("hot") || tagLower.includes("lead"):
        return "#FF5252"; // Red
      case tagLower.includes("client"):
        return "#2196F3"; // Blue
      case tagLower.includes("prospect"):
        return "#9C27B0"; // Purple
      default:
        return colors.primary;
    }
  };

  // Get status text for display (legacy)
  const getStatusText = (): string => {
    const status = getStatus();
    switch (status) {
      case "active":
        return "Active";
      case "warm":
        return "Warm";
      case "cold":
        return "Cold";
      default:
        return "New";
    }
  };

  // Format date for display
  const formatDate = (date: Date | string): string => {
    const dateObj = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;

    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get first letter of first name for avatar
  const getAvatarLetter = (): string => {
    return contact.firstName?.charAt(0).toUpperCase() || "?";
  };

  // Get source icon - returns a valid Ionicons name
  const getSourceIcon = (): IconName => {
    // ✅ FIXED: Added 'call' case and handled all source types
    switch (contact.source) {
      case "website":
        return "globe-outline";
      case "referral":
        return "people-outline";
      case "social":
        return "logo-twitter";
      case "event":
        return "calendar-outline";
      case "call":
        return "call-outline";
      case "email":
        return "mail-outline";
      case "meeting":
        return "people-outline";
      case "other":
        return "help-outline";
      default:
        return "help-outline";
    }
  };

  // Fallback icon for unknown source
  const sourceIcon = getSourceIcon();

  // 🔥 NEW: Get lead status info
  const leadStatus = getLeadStatusDisplay();

  return (
    <>
      <TouchableOpacity
        style={{
          borderRadius: 16,
          padding: 16,
          backgroundColor: colors.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          marginBottom: 12,
          borderLeftWidth: 4,
          borderLeftColor: contact.completed
            ? "#4caf50"
            : contact.connected
              ? "#2196f3"
              : getLegacyStatusColor(),
        }}
        onPress={onPress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
              backgroundColor: contact.isFavorite
                ? colors.primary
                : contact.completed
                  ? "#4caf50"
                  : contact.connected
                    ? "#2196f3"
                    : getLegacyStatusColor(),
              position: "relative",
            }}
          >
            <ThemedText type="title" style={{ color: "white", fontSize: 18 }}>
              {getAvatarLetter()}
            </ThemedText>

            {/* Source indicator */}
            <View
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: colors.background,
                borderWidth: 2,
                borderColor: colors.card,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name={sourceIcon}
                size={10}
                color={colors.textSecondary}
              />
            </View>
          </View>

          {/* Contact Info */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
                flexWrap: "wrap",
              }}
            >
              <ThemedText
                type="defaultSemiBold"
                style={{
                  color: colors.text,
                  flexShrink: 1,
                }}
                numberOfLines={1}
              >
                {getFullName()}
              </ThemedText>

              {/* 🔥 NEW: Lead Status Badge */}
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 10,
                  backgroundColor: leadStatus.color + "20",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: leadStatus.color,
                  }}
                >
                  {leadStatus.icon} {leadStatus.text}
                </ThemedText>
              </View>

              {/* VIP Badge */}
              {isVIP() && (
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 10,
                    backgroundColor: "#FFD700",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Ionicons name="star" size={10} color="#333" />
                  <ThemedText
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: "#333",
                    }}
                  >
                    VIP
                  </ThemedText>
                </View>
              )}

              {/* Favorite Indicator (small) */}
              {contact.isFavorite && (
                <Ionicons name="star" size={14} color={colors.primary} />
              )}
            </View>

            <ThemedText
              style={{
                fontSize: 13,
                color: colors.textSecondary,
              }}
              numberOfLines={1}
            >
              {getJobTitle()}
              {getJobTitle() && contact.company ? " • " : ""}
              {contact.company || ""}
            </ThemedText>
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={{
              padding: 4,
              minWidth: 32,
              minHeight: 32,
              justifyContent: "center",
              alignItems: "center",
            }}
            disabled={favoriteLoading}
          >
            {favoriteLoading ? (
              <ActivityIndicator size={20} color={colors.primary} />
            ) : (
              <Ionicons
                name={contact.isFavorite ? "star" : "star-outline"}
                size={20}
                color={
                  contact.isFavorite ? colors.primary : colors.textSecondary
                }
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Contact Details */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 12,
            marginBottom: 12,
          }}
        >
          {/* Email */}
          {contact.email && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Ionicons
                name="mail-outline"
                size={16}
                color={colors.textSecondary}
                style={{ minWidth: 20 }}
              />
              <ThemedText
                style={{
                  fontSize: 14,
                  color: colors.text,
                  marginLeft: 8,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {contact.email}
              </ThemedText>
            </View>
          )}

          {/* Phone */}
          {contact.phone && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="call-outline"
                size={16}
                color={colors.textSecondary}
                style={{ minWidth: 20 }}
              />
              <ThemedText
                style={{
                  fontSize: 14,
                  color: colors.text,
                  marginLeft: 8,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {contact.phone}
              </ThemedText>
            </View>
          )}

          {/* 🔥 NEW: Deal Value for completed contacts */}
          {contact.completed && contact.dealValue > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
                backgroundColor: "#4caf5020",
                padding: 8,
                borderRadius: 8,
              }}
            >
              <Ionicons name="cash-outline" size={16} color="#4caf50" />
              <ThemedText
                style={{
                  fontSize: 14,
                  color: "#4caf50",
                  marginLeft: 8,
                  fontWeight: "bold",
                }}
              >
                Deal: {formatCurrency(contact.dealValue)}
              </ThemedText>
            </View>
          )}

          {/* Show message when no contact info */}
          {!contact.email && !contact.phone && !contact.completed && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.textSecondary}
                style={{ minWidth: 20 }}
              />
              <ThemedText
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginLeft: 8,
                  flex: 1,
                  fontStyle: "italic",
                }}
              >
                No contact information
              </ThemedText>
            </View>
          )}
        </View>

        {/* Tags and Last Contacted */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Tags */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
              flex: 1,
              marginRight: 8,
            }}
          >
            {getTags()
              .slice(0, 3)
              .map((tag: string, index: number) => (
                <View
                  key={index}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: getTagColor(tag) + "20",
                    borderWidth: 1,
                    borderColor: getTagColor(tag) + "40",
                  }}
                >
                  <ThemedText
                    style={{
                      fontSize: 10,
                      fontWeight: "600",
                      color: getTagColor(tag),
                    }}
                  >
                    {tag}
                  </ThemedText>
                </View>
              ))}

            {/* Show count if more than 3 tags */}
            {getTags().length > 3 && (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: colors.border,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 10,
                    fontWeight: "500",
                    color: colors.textSecondary,
                  }}
                >
                  +{getTags().length - 3}
                </ThemedText>
              </View>
            )}

            {/* No Tags */}
            {getTags().length === 0 && (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: colors.border,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 10,
                    fontWeight: "500",
                    color: colors.textSecondary,
                  }}
                >
                  No Tags
                </ThemedText>
              </View>
            )}
          </View>

          {/* Last Contacted */}
          <View style={{ alignItems: "flex-end" }}>
            <ThemedText
              style={{
                fontSize: 10,
                color: colors.textSecondary,
                marginBottom: 2,
              }}
            >
              Last Contact
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 10,
                color: colors.text,
                fontWeight: "500",
              }}
            >
              {formatDate(getLastContactDate())}
            </ThemedText>
          </View>
        </View>

        {/* 🔥 NEW: Pipeline Progress Bar */}
        {!contact.completed && (
          <View style={{ marginTop: 12 }}>
            <View
              style={{
                height: 4,
                backgroundColor: colors.border,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: 4,
                  width: `${getPipelineProgress()}%`,
                  backgroundColor: leadStatus.color,
                  borderRadius: 2,
                }}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* 🔥 NEW: Deal Value Modal */}
      <Modal
        visible={showDealModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDealModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              width: "80%",
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <ThemedText
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.text,
                marginBottom: 20,
              }}
            >
              Complete Deal
            </ThemedText>

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: colors.text,
                marginBottom: 16,
              }}
              placeholder="Deal Amount (₹)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={dealValue}
              onChangeText={setDealValue}
            />

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: colors.text,
                marginBottom: 20,
                height: 80,
                textAlignVertical: "top",
              }}
              placeholder="Notes (optional)"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              value={dealNotes}
              onChangeText={setDealNotes}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowDealModal(false);
                  setDealValue("");
                  setDealNotes("");
                }}
                style={{ padding: 12 }}
              >
                <ThemedText style={{ color: colors.textSecondary }}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleMarkAsCompleted}
                style={{
                  padding: 12,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                }}
              >
                <ThemedText style={{ color: "white", fontWeight: "bold" }}>
                  Complete Deal
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
