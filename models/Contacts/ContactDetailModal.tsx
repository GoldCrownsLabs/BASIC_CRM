import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as contactAPI from "@/lib/api/contact.api";
import { Contact, UpdateContactPayload } from "@/lib/api/contact.api";

interface ContactDetailModalProps {
  visible: boolean;
  contact: Contact | null;
  onClose: () => void;
  onToggleFavorite: (contact: Contact) => Promise<void>;
  onContactUpdated: (contact: Contact) => void;
  onMarkAsConnected?: () => void;
  onMarkAsCompleted?: (dealValue: number, paymentMethod?: string) => void;
  getStatusColor?: (status: string) => string;
  getStatusIcon?: (status: string) => string;
  formatCurrency?: (amount: number) => string;
}

export default function ContactDetailModal({
  visible,
  contact,
  onClose,
  onToggleFavorite,
  onContactUpdated,
  onMarkAsConnected,
  onMarkAsCompleted,
  getStatusColor: propGetStatusColor = (status) => {
    const colors: Record<string, string> = {
      cold: "#9e9e9e",
      warm: "#ff9800",
      hot: "#f44336",
      connected: "#2196f3",
      completed: "#4caf50",
    };
    return colors[status] || "#9e9e9e";
  },
  getStatusIcon: propGetStatusIcon = (status) => {
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
}: ContactDetailModalProps) {
  const { colors } = useAppTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedContact, setEditedContact] = useState<Contact | null>(null);
  const [editData, setEditData] = useState<UpdateContactPayload>({});
  const [showDealModal, setShowDealModal] = useState(false);
  const [dealValue, setDealValue] = useState("");
  const [dealNotes, setDealNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");
  const [tempTag, setTempTag] = useState("");
  const [showLeadStatusMenu, setShowLeadStatusMenu] = useState(false);

  const leadStatusOptions: {
    value: "cold" | "warm" | "hot";
    label: string;
    color: string;
    icon: string;
  }[] = [
    { value: "cold", label: "Cold", color: "#9e9e9e", icon: "❄️" },
    { value: "warm", label: "Warm", color: "#ff9800", icon: "🌤️" },
    { value: "hot", label: "Hot", color: "#f44336", icon: "🔥" },
  ];

  const tagSuggestions = ["VIP", "Client", "Prospect", "Partner", "Regular"];

  useEffect(() => {
    if (contact) {
      setEditedContact(contact);
      setEditData({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        jobTitle: contact.jobTitle,
        notes: contact.notes,
        tags: contact.tags || [],
        source: contact.source,
        lastContacted: contact.lastContacted,
        isFavorite: contact.isFavorite,
        leadStatus: contact.leadStatus || "cold",
        connected: contact.connected,
        completed: contact.completed,
        dealValue: contact.dealValue,
        dealCurrency: contact.dealCurrency,
        connectedNotes: contact.connectedNotes,
        completedNotes: contact.completedNotes,
      });
    }
  }, [contact]);

  const handleSave = async () => {
    if (!contact || !editData) return;

    const contactId = contact._id;
    if (!contactId) {
      Alert.alert("Error", "Contact ID not found");
      return;
    }

    setLoading(true);
    try {
      const cleanedData: UpdateContactPayload = {};
      Object.keys(editData).forEach((key) => {
        const value = (editData as any)[key];
        if (value !== undefined && value !== null && value !== "") {
          (cleanedData as any)[key] = value;
        }
      });

      const response = await contactAPI.updateContact(contactId, cleanedData);

      if ("success" in response && !response.success) {
        Alert.alert("Error", response.message || "Failed to update contact");
        return;
      }

      const successResponse = response as contactAPI.SingleContactResponse;
      const updatedContact = successResponse.data;

      onContactUpdated(updatedContact);
      setIsEditing(false);
      Alert.alert("Success", "Contact updated successfully!");
    } catch (error: any) {
      console.error("Error updating contact:", error);
      Alert.alert("Error", error.message || "Failed to update contact");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contact) return;

    Alert.alert(
      "Delete Contact",
      "Are you sure you want to delete this contact?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await contactAPI.deleteContact(contact._id);
              if ("success" in response && response.success) {
                onClose();
                Alert.alert("Success", "Contact deleted successfully!");
              }
            } catch (error) {
              console.error("Error deleting contact:", error);
              Alert.alert("Error", "Failed to delete contact");
            }
          },
        },
      ],
    );
  };

  // 🔥 NEW: Handle lead status change
  const handleLeadStatusChange = async (newStatus: "cold" | "warm" | "hot") => {
    if (!contact) return;

    try {
      const response = await contactAPI.updateContact(contact._id, {
        leadStatus: newStatus,
      });

      if ("success" in response && response.success) {
        const updatedContact = response.data;
        setEditData({ ...editData, leadStatus: newStatus });
        onContactUpdated(updatedContact);
        Alert.alert("Success", `Lead status changed to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating lead status:", error);
      Alert.alert("Error", "Failed to update lead status");
    }
    setShowLeadStatusMenu(false);
  };

  // 🔥 NEW: Handle add tag
  const handleAddTag = () => {
    if (!tempTag.trim()) return;

    const tag = tempTag.trim();
    const currentTags = editData.tags || [];

    if (!currentTags.includes(tag)) {
      setEditData({
        ...editData,
        tags: [...currentTags, tag],
      });
    }
    setTempTag("");
  };

  // 🔥 NEW: Handle remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = editData.tags || [];
    setEditData({
      ...editData,
      tags: currentTags.filter((tag) => tag !== tagToRemove),
    });
  };

  // 🔥 NEW: Handle tag suggestion press
  const handleTagSuggestionPress = (tag: string) => {
    const currentTags = editData.tags || [];
    if (!currentTags.includes(tag)) {
      setEditData({
        ...editData,
        tags: [...currentTags, tag],
      });
    }
  };

  const handleMarkAsConnected = () => {
    if (!contact) return;

    Alert.alert(
      "Mark as Connected",
      `Are you sure you want to mark ${getFullName()} as connected?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Connect",
          onPress: () => {
            onMarkAsConnected?.();
            onClose();
          },
        },
      ],
    );
  };

  // 🔥 NEW: Handle mark as completed with payment method
  const handleMarkAsCompleted = () => {
    if (!dealValue || parseFloat(dealValue) <= 0) {
      Alert.alert("Error", "Please enter a valid deal amount");
      return;
    }

    onMarkAsCompleted?.(parseFloat(dealValue), paymentMethod);
    setShowDealModal(false);
    setDealValue("");
    setDealNotes("");
    setPaymentMethod("cash");
    onClose();
  };

  const handleCall = () => {
    if (contact?.phone) {
      Alert.alert("Call", `Would you like to call ${contact.phone}?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => console.log("Calling", contact.phone) },
      ]);
    }
  };

  const handleMessage = () => {
    if (contact?.phone) {
      Alert.alert("Message", `Would you like to message ${contact.phone}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Message",
          onPress: () => console.log("Messaging", contact.phone),
        },
      ]);
    }
  };

  const handleEmail = () => {
    if (contact?.email) {
      Alert.alert("Email", `Would you like to email ${contact.email}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Email",
          onPress: () => console.log("Emailing", contact.email),
        },
      ]);
    }
  };

  const getFullName = (): string => {
    if (!contact) return "";
    return `${contact.firstName}${contact.lastName ? ` ${contact.lastName}` : ""}`;
  };

  const formatDate = (dateString?: Date | string): string => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getSourceIcon = (
    source?: string,
  ): React.ComponentProps<typeof Ionicons>["name"] => {
    switch (source) {
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
      default:
        return "help-outline";
    }
  };

  const getLeadStatusInfo = () => {
    if (!contact)
      return { status: "cold", color: colors.textSecondary, icon: "❄️" };
    const status = editData.leadStatus || contact.leadStatus || "cold";
    return {
      status,
      color: propGetStatusColor(status),
      icon: propGetStatusIcon(status),
    };
  };

  const getContactStatusColor = () => {
    if (!contact) return colors.textSecondary;
    if (contact.completed) return "#4caf50";
    if (contact.connected) return "#2196f3";
    if (!contact.lastContacted) return colors.warning;
    const lastContacted = new Date(contact.lastContacted);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - lastContacted.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysDiff <= 7) return colors.success;
    if (daysDiff <= 30) return colors.info;
    return colors.warning;
  };

  const getStatusText = () => {
    if (!contact) return "Unknown";
    if (contact.completed) return "Deal Completed ✅";
    if (contact.connected) return "Connected 📞";
    if (!contact.lastContacted) return "Never Contacted";
    const lastContacted = new Date(contact.lastContacted);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - lastContacted.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysDiff === 0) return "Contacted Today";
    if (daysDiff === 1) return "Contacted Yesterday";
    if (daysDiff <= 7) return "Contacted This Week";
    if (daysDiff <= 30) return "Contacted This Month";
    return "Contacted Long Ago";
  };

  if (!contact || !editedContact) return null;

  const leadStatusInfo = getLeadStatusInfo();

  return (
    <>
      <Modal
        animationType="slide"
        transparent
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <TouchableWithoutFeedback onPress={onClose}>
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>

            <View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                maxHeight: "90%",
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <ThemedText type="title" style={{ color: colors.text }}>
                  Contact Details
                </ThemedText>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 15,
                  }}
                >
                  {!contact.completed && (
                    <>
                      {!contact.connected && onMarkAsConnected && (
                        <TouchableOpacity onPress={handleMarkAsConnected}>
                          <Ionicons name="call" size={24} color="#2196f3" />
                        </TouchableOpacity>
                      )}
                      {contact.connected && onMarkAsCompleted && (
                        <TouchableOpacity
                          onPress={() => setShowDealModal(true)}
                        >
                          <Ionicons name="cash" size={24} color="#4caf50" />
                        </TouchableOpacity>
                      )}
                    </>
                  )}

                  <TouchableOpacity onPress={() => onToggleFavorite(contact)}>
                    <Ionicons
                      name={contact.isFavorite ? "star" : "star-outline"}
                      size={24}
                      color={colors.primary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                    <Ionicons
                      name={isEditing ? "close" : "pencil"}
                      size={24}
                      color={colors.text}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
              >
                {/* Avatar and Basic Info */}
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 15,
                      backgroundColor: getContactStatusColor(),
                    }}
                  >
                    <ThemedText
                      type="title"
                      style={{ color: "white", fontSize: 32 }}
                    >
                      {getFullName().charAt(0).toUpperCase()}
                    </ThemedText>
                  </View>

                  {isEditing ? (
                    <>
                      <TextInput
                        style={{
                          fontSize: 22,
                          fontWeight: "bold",
                          color: colors.text,
                          textAlign: "center",
                          borderBottomWidth: 1,
                          borderBottomColor: colors.primary,
                          marginBottom: 5,
                          width: "80%",
                        }}
                        placeholder="First Name"
                        placeholderTextColor={colors.textSecondary}
                        value={editData.firstName || ""}
                        onChangeText={(text) =>
                          setEditData({ ...editData, firstName: text })
                        }
                      />
                      <TextInput
                        style={{
                          fontSize: 18,
                          color: colors.textSecondary,
                          textAlign: "center",
                          borderBottomWidth: 1,
                          borderBottomColor: colors.primary,
                          marginBottom: 5,
                          width: "80%",
                        }}
                        placeholder="Last Name"
                        placeholderTextColor={colors.textSecondary}
                        value={editData.lastName || ""}
                        onChangeText={(text) =>
                          setEditData({ ...editData, lastName: text })
                        }
                      />
                    </>
                  ) : (
                    <ThemedText
                      type="title"
                      style={{ fontSize: 22, color: colors.text }}
                    >
                      {getFullName()}
                    </ThemedText>
                  )}

                  {isEditing ? (
                    <View
                      style={{ alignItems: "center", gap: 5, width: "80%" }}
                    >
                      <TextInput
                        style={{
                          color: colors.textSecondary,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.primary,
                          width: "100%",
                          textAlign: "center",
                        }}
                        placeholder="Job Title"
                        placeholderTextColor={colors.textSecondary}
                        value={editData.jobTitle || ""}
                        onChangeText={(text) =>
                          setEditData({ ...editData, jobTitle: text })
                        }
                      />
                      <TextInput
                        style={{
                          color: colors.textSecondary,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.primary,
                          width: "100%",
                          textAlign: "center",
                        }}
                        placeholder="Company"
                        placeholderTextColor={colors.textSecondary}
                        value={editData.company || ""}
                        onChangeText={(text) =>
                          setEditData({ ...editData, company: text })
                        }
                      />
                    </View>
                  ) : (
                    <ThemedText
                      style={{ color: colors.textSecondary, marginTop: 5 }}
                    >
                      {contact.jobTitle || "No title"}
                      {contact.jobTitle && contact.company ? " at " : ""}
                      {contact.company || ""}
                    </ThemedText>
                  )}

                  {/* 🔥 NEW: Clickable Lead Status Badge */}
                  <TouchableOpacity
                    onPress={() =>
                      !contact.completed && setShowLeadStatusMenu(true)
                    }
                    style={{
                      marginTop: 10,
                      paddingHorizontal: 16,
                      paddingVertical: 6,
                      borderRadius: 20,
                      backgroundColor: leadStatusInfo.color + "20",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      opacity: contact.completed ? 0.5 : 1,
                    }}
                    disabled={contact.completed}
                  >
                    <ThemedText style={{ fontSize: 16 }}>
                      {leadStatusInfo.icon}
                    </ThemedText>
                    <ThemedText
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: leadStatusInfo.color,
                      }}
                    >
                      {leadStatusInfo.status.toUpperCase()}
                    </ThemedText>
                    {!contact.completed && (
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color={leadStatusInfo.color}
                      />
                    )}
                  </TouchableOpacity>

                  {/* 🔥 NEW: Lead Status Menu */}
                  {showLeadStatusMenu && (
                    <View
                      style={{
                        position: "absolute",
                        top: 180,
                        backgroundColor: colors.card,
                        borderRadius: 12,
                        padding: 8,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5,
                        zIndex: 1000,
                      }}
                    >
                      {leadStatusOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => handleLeadStatusChange(option.value)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            padding: 12,
                            borderRadius: 8,
                            minWidth: 150,
                          }}
                        >
                          <ThemedText style={{ fontSize: 16 }}>
                            {option.icon}
                          </ThemedText>
                          <ThemedText
                            style={{ color: option.color, fontWeight: "600" }}
                          >
                            {option.label}
                          </ThemedText>
                          {editData.leadStatus === option.value && (
                            <Ionicons
                              name="checkmark"
                              size={20}
                              color={option.color}
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Deal Value for completed contacts */}
                {contact.completed && contact.dealValue > 0 && (
                  <View
                    style={{
                      backgroundColor: "#4caf5020",
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Ionicons name="cash" size={24} color="#4caf50" />
                      <View>
                        <ThemedText style={{ fontSize: 12, color: "#4caf50" }}>
                          Deal Value
                        </ThemedText>
                        <ThemedText
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "#4caf50",
                          }}
                        >
                          {formatCurrency(contact.dealValue)}
                        </ThemedText>
                      </View>
                    </View>
                    {contact.completedAt && (
                      <ThemedText style={{ fontSize: 11, color: "#4caf50" }}>
                        {formatDate(contact.completedAt)}
                      </ThemedText>
                    )}
                  </View>
                )}

                {/* Contact Information */}
                <View style={{ marginBottom: 25 }}>
                  <ThemedText
                    type="subtitle"
                    style={{ marginBottom: 15, color: colors.text }}
                  >
                    Contact Information
                  </ThemedText>

                  {/* Email */}
                  <View
                    style={{
                      flexDirection: "row",
                      marginBottom: 12,
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={colors.primary}
                      style={{ marginRight: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={{ fontSize: 12, color: colors.textSecondary }}
                      >
                        Email
                      </ThemedText>
                      {isEditing ? (
                        <TextInput
                          style={{
                            color: colors.text,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.primary,
                          }}
                          value={editData.email || ""}
                          onChangeText={(text) =>
                            setEditData({ ...editData, email: text })
                          }
                          keyboardType="email-address"
                        />
                      ) : (
                        <ThemedText style={{ color: colors.text }}>
                          {contact.email || "No email"}
                        </ThemedText>
                      )}
                    </View>
                  </View>

                  {/* Phone */}
                  <View
                    style={{
                      flexDirection: "row",
                      marginBottom: 12,
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={colors.primary}
                      style={{ marginRight: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={{ fontSize: 12, color: colors.textSecondary }}
                      >
                        Phone
                      </ThemedText>
                      {isEditing ? (
                        <TextInput
                          style={{
                            color: colors.text,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.primary,
                          }}
                          value={editData.phone || ""}
                          onChangeText={(text) =>
                            setEditData({ ...editData, phone: text })
                          }
                          keyboardType="phone-pad"
                        />
                      ) : (
                        <ThemedText style={{ color: colors.text }}>
                          {contact.phone || "No phone"}
                        </ThemedText>
                      )}
                    </View>
                  </View>

                  {/* Status */}
                  <View
                    style={{
                      flexDirection: "row",
                      marginBottom: 12,
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={colors.primary}
                      style={{ marginRight: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={{ fontSize: 12, color: colors.textSecondary }}
                      >
                        Last Contacted
                      </ThemedText>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 6,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: getContactStatusColor(),
                            marginRight: 6,
                          }}
                        />
                        <ThemedText
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: getContactStatusColor(),
                          }}
                        >
                          {getStatusText()}
                        </ThemedText>
                      </View>
                      <ThemedText
                        style={{
                          fontSize: 11,
                          color: colors.textSecondary,
                          marginTop: 2,
                        }}
                      >
                        {contact.lastContacted
                          ? formatDate(contact.lastContacted)
                          : "Never contacted"}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Source */}
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name={getSourceIcon(contact.source)}
                      size={20}
                      color={colors.primary}
                      style={{ marginRight: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={{ fontSize: 12, color: colors.textSecondary }}
                      >
                        Source
                      </ThemedText>
                      {isEditing ? (
                        <TextInput
                          style={{
                            color: colors.text,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.primary,
                          }}
                          value={editData.source || ""}
                          onChangeText={(text) => {
                            const validSource = text as Contact["source"];
                            setEditData({ ...editData, source: validSource });
                          }}
                          placeholder="website, referral, social, event, other"
                        />
                      ) : (
                        <ThemedText
                          style={{
                            color: colors.text,
                            textTransform: "capitalize",
                          }}
                        >
                          {contact.source || "Unknown"}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                </View>

                {/* 🔥 NEW: Tags Section with Edit */}
                <View style={{ marginBottom: 25 }}>
                  <ThemedText
                    type="subtitle"
                    style={{ marginBottom: 15, color: colors.text }}
                  >
                    Tags
                  </ThemedText>

                  {isEditing && (
                    <>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 10,
                        }}
                      >
                        <TextInput
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 10,
                            padding: 12,
                            color: colors.text,
                            marginRight: 8,
                          }}
                          placeholder="Add a tag"
                          placeholderTextColor={colors.textSecondary}
                          value={tempTag}
                          onChangeText={setTempTag}
                        />
                        <TouchableOpacity
                          style={{
                            backgroundColor: colors.primary,
                            padding: 12,
                            borderRadius: 10,
                          }}
                          onPress={handleAddTag}
                          disabled={!tempTag.trim()}
                        >
                          <Ionicons name="add" size={20} color="white" />
                        </TouchableOpacity>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 8,
                          marginBottom: 10,
                        }}
                      >
                        {tagSuggestions.map((tag) => (
                          <TouchableOpacity
                            key={tag}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 12,
                              backgroundColor: (editData.tags || []).includes(
                                tag,
                              )
                                ? colors.primary + "40"
                                : colors.background,
                              borderWidth: 1,
                              borderColor: colors.border,
                            }}
                            onPress={() => handleTagSuggestionPress(tag)}
                          >
                            <ThemedText
                              style={{
                                fontSize: 12,
                                color: (editData.tags || []).includes(tag)
                                  ? colors.primary
                                  : colors.text,
                              }}
                            >
                              {tag}
                            </ThemedText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}

                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {(isEditing ? editData.tags : contact.tags)?.map(
                      (tag, index) => (
                        <View
                          key={index}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 12,
                            backgroundColor: colors.primary + "20",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <ThemedText
                            style={{
                              fontSize: 12,
                              fontWeight: "500",
                              color: colors.primary,
                            }}
                          >
                            {tag}
                          </ThemedText>
                          {isEditing && (
                            <TouchableOpacity
                              onPress={() => handleRemoveTag(tag)}
                            >
                              <Ionicons
                                name="close-circle"
                                size={16}
                                color={colors.primary}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      ),
                    )}
                    {(isEditing ? editData.tags : contact.tags)?.length ===
                      0 && (
                      <View
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 12,
                          backgroundColor: colors.border,
                        }}
                      >
                        <ThemedText
                          style={{ fontSize: 12, color: colors.textSecondary }}
                        >
                          No Tags
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>

                {/* Notes */}
                <View style={{ marginBottom: 25 }}>
                  <ThemedText
                    type="subtitle"
                    style={{ marginBottom: 15, color: colors.text }}
                  >
                    Notes
                  </ThemedText>
                  {isEditing ? (
                    <TextInput
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: 10,
                        padding: 12,
                        color: colors.text,
                        borderWidth: 1,
                        borderColor: colors.border,
                        minHeight: 100,
                        textAlignVertical: "top",
                      }}
                      placeholder="Add notes about this contact"
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      value={editData.notes || ""}
                      onChangeText={(text) =>
                        setEditData({ ...editData, notes: text })
                      }
                    />
                  ) : (
                    <ThemedText style={{ color: colors.text }}>
                      {contact.notes || "No notes added"}
                    </ThemedText>
                  )}
                </View>

                {/* Connected/Completed Notes */}
                {contact.connectedNotes && (
                  <View style={{ marginBottom: 25 }}>
                    <ThemedText
                      type="subtitle"
                      style={{ marginBottom: 10, color: colors.text }}
                    >
                      Connected Notes
                    </ThemedText>
                    <View
                      style={{
                        backgroundColor: "#2196f320",
                        padding: 12,
                        borderRadius: 8,
                      }}
                    >
                      <ThemedText style={{ color: "#2196f3" }}>
                        {contact.connectedNotes}
                      </ThemedText>
                    </View>
                  </View>
                )}

                {contact.completedNotes && (
                  <View style={{ marginBottom: 25 }}>
                    <ThemedText
                      type="subtitle"
                      style={{ marginBottom: 10, color: colors.text }}
                    >
                      Deal Notes
                    </ThemedText>
                    <View
                      style={{
                        backgroundColor: "#4caf5020",
                        padding: 12,
                        borderRadius: 8,
                      }}
                    >
                      <ThemedText style={{ color: "#4caf50" }}>
                        {contact.completedNotes}
                      </ThemedText>
                    </View>
                  </View>
                )}

                {/* Dates */}
                <View style={{ marginBottom: 25 }}>
                  <View style={{ marginBottom: 12 }}>
                    <ThemedText
                      style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        marginBottom: 4,
                      }}
                    >
                      Created
                    </ThemedText>
                    <ThemedText style={{ color: colors.text }}>
                      {formatDate(contact.createdAt)}
                    </ThemedText>
                  </View>
                  <View>
                    <ThemedText
                      style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        marginBottom: 4,
                      }}
                    >
                      Last Updated
                    </ThemedText>
                    <ThemedText style={{ color: colors.text }}>
                      {formatDate(contact.updatedAt || contact.lastModified)}
                    </ThemedText>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
                  {isEditing ? (
                    <>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: colors.primary,
                          padding: 16,
                          borderRadius: 12,
                          alignItems: "center",
                          opacity: loading ? 0.7 : 1,
                        }}
                        onPress={handleSave}
                        disabled={loading}
                      >
                        <ThemedText
                          style={{
                            color: "white",
                            fontSize: 16,
                            fontWeight: "600",
                          }}
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: colors.error,
                          padding: 16,
                          borderRadius: 12,
                          alignItems: "center",
                        }}
                        onPress={handleDelete}
                      >
                        <ThemedText
                          style={{
                            color: "white",
                            fontSize: 16,
                            fontWeight: "600",
                          }}
                        >
                          Delete
                        </ThemedText>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: colors.primary,
                          padding: 16,
                          borderRadius: 12,
                          alignItems: "center",
                          flexDirection: "row",
                          justifyContent: "center",
                          gap: 8,
                        }}
                        onPress={handleMessage}
                        disabled={!contact.phone}
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={20}
                          color={contact.phone ? "white" : colors.textSecondary}
                        />
                        <ThemedText
                          style={{
                            color: contact.phone
                              ? "white"
                              : colors.textSecondary,
                            fontSize: 16,
                            fontWeight: "600",
                          }}
                        >
                          Message
                        </ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: colors.success,
                          padding: 16,
                          borderRadius: 12,
                          alignItems: "center",
                          flexDirection: "row",
                          justifyContent: "center",
                          gap: 8,
                        }}
                        onPress={handleCall}
                        disabled={!contact.phone}
                      >
                        <Ionicons
                          name="call-outline"
                          size={20}
                          color={contact.phone ? "white" : colors.textSecondary}
                        />
                        <ThemedText
                          style={{
                            color: contact.phone
                              ? "white"
                              : colors.textSecondary,
                            fontSize: 16,
                            fontWeight: "600",
                          }}
                        >
                          Call
                        </ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: colors.info,
                          padding: 16,
                          borderRadius: 12,
                          alignItems: "center",
                          flexDirection: "row",
                          justifyContent: "center",
                          gap: 8,
                        }}
                        onPress={handleEmail}
                        disabled={!contact.email}
                      >
                        <Ionicons
                          name="mail-outline"
                          size={20}
                          color={contact.email ? "white" : colors.textSecondary}
                        />
                        <ThemedText
                          style={{
                            color: contact.email
                              ? "white"
                              : colors.textSecondary,
                            fontSize: 16,
                            fontWeight: "600",
                          }}
                        >
                          Email
                        </ThemedText>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🔥 NEW: Deal Value Modal with Payment Method */}
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
              width: "90%",
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
              Complete Deal for {getFullName()}
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

            {/* 🔥 NEW: Payment Method Selection */}
            <ThemedText
              style={{ fontSize: 14, color: colors.text, marginBottom: 8 }}
            >
              Payment Method
            </ThemedText>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => setPaymentMethod("cash")}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor:
                    paymentMethod === "cash" ? "#4caf5020" : colors.background,
                  borderWidth: 1,
                  borderColor:
                    paymentMethod === "cash" ? "#4caf50" : colors.border,
                }}
              >
                <Ionicons
                  name="cash"
                  size={20}
                  color={
                    paymentMethod === "cash" ? "#4caf50" : colors.textSecondary
                  }
                />
                <ThemedText
                  style={{
                    color:
                      paymentMethod === "cash"
                        ? "#4caf50"
                        : colors.textSecondary,
                  }}
                >
                  Cash
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPaymentMethod("online")}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor:
                    paymentMethod === "online"
                      ? "#2196f320"
                      : colors.background,
                  borderWidth: 1,
                  borderColor:
                    paymentMethod === "online" ? "#2196f3" : colors.border,
                }}
              >
                <Ionicons
                  name="wifi"
                  size={20}
                  color={
                    paymentMethod === "online"
                      ? "#2196f3"
                      : colors.textSecondary
                  }
                />
                <ThemedText
                  style={{
                    color:
                      paymentMethod === "online"
                        ? "#2196f3"
                        : colors.textSecondary,
                  }}
                >
                  Online
                </ThemedText>
              </TouchableOpacity>
            </View>

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
                  setPaymentMethod("cash");
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
