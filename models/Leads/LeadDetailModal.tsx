import React, { useState } from "react";
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { Lead } from "@/lib/api/leads.api";
import leadsApi from "@/lib/api/leads.api";

interface LeadDetailModalProps {
  visible: boolean;
  lead: Lead;
  onClose: () => void;
  onLeadUpdated: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  visible,
  lead,
  onClose,
  onLeadUpdated,
}) => {
  const { colors } = useAppTheme();
  const [selectedLead, setSelectedLead] = useState(lead);

  const getStageColor = (status: string) => {
    const stageMapping: Record<string, string> = {
      new: "#4CAF50",
      contacted: "#2196F3",
      qualified: "#FF9800",
      proposal: "#9C27B0",
      negotiation: "#FF5722",
      closed_won: "#4CAF50",
      closed_lost: "#F44336",
    };
    return stageMapping[status] || colors.textSecondary;
  };

  const getStageLabel = (status: string) => {
    const labelMapping: Record<string, string> = {
      new: "New",
      contacted: "Contacted",
      qualified: "Qualified",
      proposal: "Proposal",
      negotiation: "Negotiation",
      closed_won: "Won",
      closed_lost: "Lost",
    };
    return labelMapping[status] || status;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "flag";
      case "medium":
        return "flag-outline";
      case "low":
        return "flag-sharp";
      default:
        return "flag";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#F44336";
      case "medium":
        return "#FF9800";
      case "low":
        return "#4CAF50";
      default:
        return colors.textSecondary;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDaysToClose = (dateString?: string) => {
    if (!dateString) return null;
    const today = new Date();
    const closeDate = new Date(dateString);
    if (isNaN(closeDate.getTime())) return null;
    const diffTime = closeDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      const response = await leadsApi.updateLeadStatus(selectedLead._id, {
        status,
      });

      if (response.success && response.data) {
        Alert.alert("Success", "Status updated successfully");
        setSelectedLead({
          ...selectedLead,
          status: status as Lead["status"],
        });
        onLeadUpdated();
      } else {
        Alert.alert("Error", response.message || "Failed to update status");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update status");
    }
  };

  const handleAddNote = async () => {
    Alert.prompt(
      "Add Note",
      "Enter your note:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async (note?: string) => {
            if (!note || note.trim() === "") return;
            try {
              const response = await leadsApi.addNote(selectedLead._id, {
                content: note,
              });

              if (response.success) {
                Alert.alert("Success", "Note added successfully");
                const leadResponse = await leadsApi.getLeadById(
                  selectedLead._id,
                );
                if (leadResponse.success && leadResponse.data) {
                  setSelectedLead(leadResponse.data);
                }
              }
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to add note");
            }
          },
        },
      ],
      "plain-text",
    );
  };

  const handleDeleteLead = async () => {
    Alert.alert(
      "Delete Lead",
      `Are you sure you want to delete ${selectedLead.firstName} ${selectedLead.lastName || ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await leadsApi.deleteLead(selectedLead._id);
              if (response.success) {
                Alert.alert("Success", "Lead deleted successfully");
                onClose();
                onLeadUpdated();
              }
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete lead");
            }
          },
        },
      ],
    );
  };

  const handleCall = (phone?: string) => {
    if (!phone) {
      Alert.alert("Error", "Phone number not available");
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email?: string) => {
    if (!email) {
      Alert.alert("Error", "Email not available");
      return;
    }
    Linking.openURL(`mailto:${email}`);
  };

  const stageColor = getStageColor(selectedLead.status);
  const priorityColor = getPriorityColor(selectedLead.priority);
  const daysToClose = calculateDaysToClose(selectedLead.nextFollowUp);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
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
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "90%",
          }}
        >
          <ScrollView style={{ padding: 20 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <ThemedText
                type="title"
                style={{ color: colors.text, fontSize: 24 }}
              >
                Lead Details
              </ThemedText>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText
                    type="title"
                    style={{
                      color: colors.text,
                      fontSize: 20,
                      marginBottom: 4,
                    }}
                  >
                    {selectedLead.firstName} {selectedLead.lastName || ""}
                  </ThemedText>
                  <ThemedText
                    type="subtitle"
                    style={{
                      color: colors.primary,
                      fontSize: 16,
                      marginBottom: 8,
                    }}
                  >
                    {formatCurrency(selectedLead.budget || 0)}
                  </ThemedText>
                </View>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: priorityColor + "20",
                  }}
                >
                  <Ionicons
                    name={getPriorityIcon(selectedLead.priority) as any}
                    size={16}
                    color={priorityColor}
                  />
                </View>
              </View>

              <View
                style={{
                  alignSelf: "flex-start",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 16,
                  backgroundColor: stageColor + "15",
                  marginBottom: 16,
                }}
              >
                <ThemedText
                  style={{ color: stageColor, fontSize: 14, fontWeight: "600" }}
                >
                  {getStageLabel(selectedLead.status)}
                </ThemedText>
              </View>

              <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: colors.primary + "15",
                    flex: 1,
                  }}
                  onPress={() => handleCall(selectedLead.phone)}
                >
                  <Ionicons name="call" size={20} color={colors.primary} />
                  <ThemedText
                    style={{ color: colors.primary, fontWeight: "500" }}
                  >
                    Call
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: colors.primary + "15",
                    flex: 1,
                  }}
                  onPress={() => handleEmail(selectedLead.email)}
                >
                  <Ionicons name="mail" size={20} color={colors.primary} />
                  <ThemedText
                    style={{ color: colors.primary, fontWeight: "500" }}
                  >
                    Email
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: colors.primary + "15",
                    flex: 1,
                  }}
                  onPress={handleAddNote}
                >
                  <Ionicons name="add" size={20} color={colors.primary} />
                  <ThemedText
                    style={{ color: colors.primary, fontWeight: "500" }}
                  >
                    Note
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <ThemedText
                type="subtitle"
                style={{ color: colors.text, marginBottom: 12, fontSize: 16 }}
              >
                Contact Information
              </ThemedText>

              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  gap: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <ThemedText style={{ color: colors.textSecondary, flex: 1 }}>
                    Email
                  </ThemedText>
                  <ThemedText
                    style={{ color: colors.text, flex: 1, textAlign: "right" }}
                  >
                    {selectedLead.email}
                  </ThemedText>
                </View>

                {selectedLead.phone && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <ThemedText
                      style={{ color: colors.textSecondary, flex: 1 }}
                    >
                      Phone
                    </ThemedText>
                    <ThemedText
                      style={{
                        color: colors.text,
                        flex: 1,
                        textAlign: "right",
                      }}
                    >
                      {selectedLead.phone}
                    </ThemedText>
                  </View>
                )}

                {selectedLead.company && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <ThemedText
                      style={{ color: colors.textSecondary, flex: 1 }}
                    >
                      Company
                    </ThemedText>
                    <ThemedText
                      style={{
                        color: colors.text,
                        flex: 1,
                        textAlign: "right",
                      }}
                    >
                      {selectedLead.company}
                    </ThemedText>
                  </View>
                )}

                {selectedLead.jobTitle && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <ThemedText
                      style={{ color: colors.textSecondary, flex: 1 }}
                    >
                      Job Title
                    </ThemedText>
                    <ThemedText
                      style={{
                        color: colors.text,
                        flex: 1,
                        textAlign: "right",
                      }}
                    >
                      {selectedLead.jobTitle}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <ThemedText
                type="subtitle"
                style={{ color: colors.text, marginBottom: 12, fontSize: 16 }}
              >
                Lead Information
              </ThemedText>

              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 16,
                  gap: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <ThemedText style={{ color: colors.textSecondary, flex: 1 }}>
                    Source
                  </ThemedText>
                  <ThemedText
                    style={{ color: colors.text, flex: 1, textAlign: "right" }}
                  >
                    {selectedLead.source.charAt(0).toUpperCase() +
                      selectedLead.source.slice(1)}
                  </ThemedText>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <ThemedText style={{ color: colors.textSecondary, flex: 1 }}>
                    Created Date
                  </ThemedText>
                  <ThemedText
                    style={{ color: colors.text, flex: 1, textAlign: "right" }}
                  >
                    {formatDate(selectedLead.createdAt)}
                  </ThemedText>
                </View>

                {selectedLead.nextFollowUp && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <ThemedText
                      style={{ color: colors.textSecondary, flex: 1 }}
                    >
                      Next Follow Up
                    </ThemedText>
                    <View style={{ flex: 1, alignItems: "flex-end" }}>
                      <ThemedText
                        style={{
                          color:
                            daysToClose && daysToClose <= 7
                              ? "#F44336"
                              : daysToClose && daysToClose <= 30
                                ? "#FF9800"
                                : colors.text,
                          textAlign: "right",
                        }}
                      >
                        {formatDate(selectedLead.nextFollowUp)}
                        {daysToClose &&
                          ` (${daysToClose > 0 ? `${daysToClose} days` : "Past due"})`}
                      </ThemedText>
                    </View>
                  </View>
                )}

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <ThemedText style={{ color: colors.textSecondary, flex: 1 }}>
                    Priority
                  </ThemedText>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Ionicons
                      name={getPriorityIcon(selectedLead.priority) as any}
                      size={14}
                      color={priorityColor}
                    />
                    <ThemedText
                      style={{
                        color: priorityColor,
                        flex: 1,
                        textAlign: "right",
                      }}
                    >
                      {selectedLead.priority.charAt(0).toUpperCase() +
                        selectedLead.priority.slice(1)}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>

            {selectedLead.notes && selectedLead.notes.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <ThemedText
                  type="subtitle"
                  style={{ color: colors.text, marginBottom: 12, fontSize: 16 }}
                >
                  Notes ({selectedLead.notes.length})
                </ThemedText>

                <View style={{ gap: 8 }}>
                  {selectedLead.notes.map((note, index) => (
                    <View
                      key={note._id || index}
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: 12,
                        padding: 16,
                        borderLeftWidth: 3,
                        borderLeftColor: colors.primary,
                      }}
                    >
                      <ThemedText
                        style={{
                          color: colors.text,
                          lineHeight: 20,
                          marginBottom: 8,
                        }}
                      >
                        {note.content}
                      </ThemedText>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <ThemedText
                          style={{ color: colors.textSecondary, fontSize: 12 }}
                        >
                          By: {note.createdBy?.name || "Unknown"}
                        </ThemedText>
                        <ThemedText
                          style={{ color: colors.textSecondary, fontSize: 12 }}
                        >
                          {formatDate(note.createdAt)}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={{ marginBottom: 24 }}>
              <ThemedText
                type="subtitle"
                style={{ color: colors.text, marginBottom: 12, fontSize: 16 }}
              >
                Update Status
              </ThemedText>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
              >
                {[
                  "new",
                  "contacted",
                  "qualified",
                  "proposal",
                  "negotiation",
                  "closed_won",
                  "closed_lost",
                ].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      marginRight: 8,
                      backgroundColor:
                        selectedLead.status === status
                          ? getStageColor(status) + "20"
                          : colors.background,
                      borderColor:
                        selectedLead.status === status
                          ? getStageColor(status)
                          : colors.border,
                    }}
                    onPress={() => handleUpdateStatus(status)}
                  >
                    <ThemedText
                      style={{
                        color:
                          selectedLead.status === status
                            ? getStageColor(status)
                            : colors.textSecondary,
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      {getStageLabel(status)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                }}
                onPress={() =>
                  Alert.alert(
                    "Info",
                    "Edit functionality will be implemented soon",
                  )
                }
              >
                <ThemedText style={{ color: "white", fontWeight: "600" }}>
                  Edit Lead
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: "#F44336",
                  alignItems: "center",
                }}
                onPress={handleDeleteLead}
              >
                <ThemedText style={{ color: "white", fontWeight: "600" }}>
                  Delete
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: colors.background,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={onClose}
              >
                <ThemedText
                  style={{ color: colors.textSecondary, fontWeight: "600" }}
                >
                  Close
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
