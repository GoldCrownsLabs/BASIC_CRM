import React, { useState } from "react";
import { TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { Contact } from "@/lib/api/contact.api";

// Type for valid Ionicons names
type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface ContactCardProps {
  contact: Contact;
  onPress: () => void;
  onToggleFavorite: () => Promise<void>;
  onDelete: () => void;
}

export default function ContactCard({
  contact,
  onPress,
  onToggleFavorite,
  onDelete,
}: ContactCardProps) {
  const { colors } = useAppTheme();
  const [favoriteLoading, setFavoriteLoading] = useState(false);

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

  // Determine contact status based on lastContacted
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

  // Helper function to get status color
  const getStatusColor = (): string => {
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
    return getTags().some(
      (tag) =>
        tag.toLowerCase().includes("hot") || tag.toLowerCase().includes("lead"),
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

  // Handle long press for delete option
  const handleLongPress = () => {
    Alert.alert("Contact Options", "What would you like to do?", [
      { text: "Cancel", style: "cancel" },
      { text: "View Details", onPress: onPress },
      {
        text: contact.isFavorite ? "Remove Favorite" : "Mark as Favorite",
        onPress: handleToggleFavorite,
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: onDelete,
      },
    ]);
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

  // Get status text for display
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
    switch (contact.source) {
      case "website":
        return "globe-outline";
      case "referral":
        return "people-outline";
      case "social":
        return "logo-twitter";
      case "event":
        return "calendar-outline";
      default:
        return "help-outline";
    }
  };

  // Fallback icon for unknown source
  const sourceIcon = getSourceIcon();

  return (
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
        borderLeftColor: getStatusColor(),
      }}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
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
              : getStatusColor(),
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

            {/* Hot Lead Badge */}
            {isHotLead() && !isVIP() && (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 10,
                  backgroundColor: "#FF5252",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Ionicons name="flame" size={10} color="white" />
                <ThemedText
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: "white",
                  }}
                >
                  HOT
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
              color={contact.isFavorite ? colors.primary : colors.textSecondary}
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

        {/* Show message when no contact info */}
        {!contact.email && !contact.phone && (
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
            .slice(0, 3) // Show up to 3 tags
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

      {/* Status Indicator */}
      <View
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          backgroundColor: getStatusColor() + "20",
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: getStatusColor() + "40",
        }}
      >
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: getStatusColor(),
          }}
        />
        <ThemedText
          style={{
            fontSize: 10,
            fontWeight: "600",
            color: getStatusColor(),
          }}
        >
          {getStatusText()}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}
