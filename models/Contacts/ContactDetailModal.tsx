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
import {
  Contact,
  UpdateContactPayload,
} from "@/lib/api/contact.api";

interface ContactDetailModalProps {
  visible: boolean;
  contact: Contact | null;
  onClose: () => void;
  onToggleFavorite: (contact: Contact) => Promise<void>;
  onContactUpdated: (contact: Contact) => void;
}

export default function ContactDetailModal({
  visible,
  contact,
  onClose,
  onToggleFavorite,
  onContactUpdated,
}: ContactDetailModalProps) {
  const { colors } = useAppTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedContact, setEditedContact] = useState<Contact | null>(null);
  const [editData, setEditData] = useState<UpdateContactPayload>({});

  useEffect(() => {
    if (contact) {
      setEditedContact(contact);
      // Initialize edit data with current contact values
      setEditData({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        jobTitle: contact.jobTitle,
        notes: contact.notes,
        tags: contact.tags,
        source: contact.source,
        lastContacted: contact.lastContacted,
        isFavorite: contact.isFavorite,
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
      // Remove undefined values
      const cleanedData: UpdateContactPayload = {};
      Object.keys(editData).forEach((key) => {
        const value = (editData as any)[key];
        if (value !== undefined && value !== null && value !== "") {
          (cleanedData as any)[key] = value;
        }
      });

      const response = await contactAPI.updateContact(contactId, cleanedData);

      // Check if response is error
      if ("success" in response && !response.success) {
        Alert.alert("Error", response.message || "Failed to update contact");
        return;
      }

      // Now we know it's SingleContactResponse
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

    const contactId = contact._id;
    if (!contactId) {
      Alert.alert("Error", "Contact ID not found");
      return;
    }

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
              const response = await contactAPI.deleteContact(contactId);

              if ("success" in response && response.success) {
                onClose();
                Alert.alert("Success", "Contact deleted successfully!");
              } else if ("success" in response) {
                Alert.alert(
                  "Error",
                  response.message || "Failed to delete contact",
                );
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

  const handleCall = () => {
    if (contact?.phone) {
      Alert.alert("Call", `Would you like to call ${contact.phone}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => {
            // You can use Linking to make a call
            // Linking.openURL(`tel:${contact.phone}`);
            console.log("Calling", contact.phone);
          },
        },
      ]);
    }
  };

  const handleMessage = () => {
    if (contact?.phone) {
      Alert.alert("Message", `Would you like to message ${contact.phone}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Message",
          onPress: () => {
            // You can use Linking to send SMS
            // Linking.openURL(`sms:${contact.phone}`);
            console.log("Messaging", contact.phone);
          },
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
          onPress: () => {
            // You can use Linking to send email
            // Linking.openURL(`mailto:${contact.email}`);
            console.log("Emailing", contact.email);
          },
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

  const getSourceIcon = (source?: string) => {
    switch (source) {
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

  const getStatusColor = () => {
    if (!contact) return colors.textSecondary;

    // Determine status based on lastContacted
    if (!contact.lastContacted) return colors.warning;

    const lastContacted = new Date(contact.lastContacted);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - lastContacted.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff <= 7) return colors.success; // Contacted within a week
    if (daysDiff <= 30) return colors.info; // Contacted within a month
    return colors.warning; // Not contacted for a month
  };

  const getStatusText = () => {
    if (!contact) return "Unknown";

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

  return (
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
                style={{ flexDirection: "row", alignItems: "center", gap: 15 }}
              >
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
                    backgroundColor: getStatusColor(),
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
                  <View style={{ alignItems: "center", gap: 5, width: "80%" }}>
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
                    style={{
                      color: colors.textSecondary,
                      marginTop: 5,
                    }}
                  >
                    {contact.jobTitle || "No title"}
                    {contact.jobTitle && contact.company ? " at " : ""}
                    {contact.company || ""}
                  </ThemedText>
                )}
              </View>

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
                      style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                      }}
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
                      style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                      }}
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
                      style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                      }}
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
                          backgroundColor: getStatusColor(),
                          marginRight: 6,
                        }}
                      />
                      <ThemedText
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color: getStatusColor(),
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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name={getSourceIcon(contact.source)}
                    size={20}
                    color={colors.primary}
                    style={{ marginRight: 10 }}
                  />
                  <View style={{ flex: 1 }}>
                    <ThemedText
                      style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                      }}
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
                        onChangeText={(text) =>
                          setEditData({
                            ...editData,
                            source: text as contactAPI.Contact["source"],
                          })
                        }
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

              {/* Tags */}
              <View style={{ marginBottom: 25 }}>
                <ThemedText
                  type="subtitle"
                  style={{ marginBottom: 15, color: colors.text }}
                >
                  Tags
                </ThemedText>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {contact.tags?.map((tag, index) => (
                    <View
                      key={index}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                        backgroundColor: colors.primary + "20",
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
                    </View>
                  ))}
                  {(contact.tags?.length === 0 || !contact.tags) && (
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                        backgroundColor: colors.border,
                      }}
                    >
                      <ThemedText
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color: colors.textSecondary,
                        }}
                      >
                        No Tags
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>

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
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  marginTop: 10,
                }}
              >
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
                          color: contact.phone ? "white" : colors.textSecondary,
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
                          color: contact.phone ? "white" : colors.textSecondary,
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
                          color: contact.email ? "white" : colors.textSecondary,
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
  );
}
