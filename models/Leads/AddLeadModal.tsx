import React, { useState } from "react";
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { leadSources } from "@/data/leads";
import leadsApi, { CreateLeadPayload, Lead } from "@/lib/api/leads.api";

interface AddLeadModalProps {
  visible: boolean;
  onClose: () => void;
  onLeadAdded: () => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  visible,
  onClose,
  onLeadAdded,
}) => {
  const { colors } = useAppTheme();

  const [newLead, setNewLead] = useState<CreateLeadPayload>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    source: "website",
    status: "new",
    budget: 0,
    priority: "medium",
    nextFollowUp: "",
  });

  const getStageColor = (status: string) => {
    const stageMapping: Record<string, string> = {
      new: "#4CAF50",
      contacted: "#2196F3",
      qualified: "#FF9800",
      proposal: "#9C27B0",
      negotiation: "#FF5722",
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

  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const handleAddLead = async () => {
    try {
      if (!newLead.firstName || !newLead.email) {
        Alert.alert("Validation Error", "First name and Email are required");
        return;
      }

      const payload: CreateLeadPayload = {
        firstName: newLead.firstName.trim(),
        lastName: newLead.lastName?.trim(),
        email: newLead.email.trim().toLowerCase(),
        phone: newLead.phone?.trim(),
        company: newLead.company?.trim(),
        jobTitle: newLead.jobTitle?.trim(),
        source: newLead.source,
        status: newLead.status,
        budget: newLead.budget ? Number(newLead.budget) : 0,
        priority: newLead.priority,
        nextFollowUp: newLead.nextFollowUp || undefined,
      };

      const response = await leadsApi.createLead(payload);

      if (response.success && response.data) {
        Alert.alert("Success", "Lead created successfully");
        onLeadAdded();
        resetForm();
      } else {
        Alert.alert("Error", response.message || "Failed to create lead");
      }
    } catch (error: any) {
      console.error("Error creating lead:", error);
      Alert.alert("Error", error.message || "Failed to create lead");
    }
  };

  const resetForm = () => {
    setNewLead({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      jobTitle: "",
      source: "website",
      status: "new",
      budget: 0,
      priority: "medium",
      nextFollowUp: "",
    });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={resetForm}
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
                Add New Lead
              </ThemedText>
              <TouchableOpacity onPress={resetForm}>
                <Ionicons name="close" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 16 }}>
              <View>
                <ThemedText
                  style={{
                    color: colors.text,
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  First Name *
                </ThemedText>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 16,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  placeholder="Enter first name"
                  placeholderTextColor={colors.textSecondary}
                  value={newLead.firstName}
                  onChangeText={(text) =>
                    setNewLead({ ...newLead, firstName: text })
                  }
                />
              </View>

              <View>
                <ThemedText
                  style={{
                    color: colors.text,
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  Last Name
                </ThemedText>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 16,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  placeholder="Enter last name"
                  placeholderTextColor={colors.textSecondary}
                  value={newLead.lastName}
                  onChangeText={(text) =>
                    setNewLead({ ...newLead, lastName: text })
                  }
                />
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={{
                      color: colors.text,
                      marginBottom: 6,
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    Email *
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 16,
                      color: colors.text,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    placeholder="email@company.com"
                    placeholderTextColor={colors.textSecondary}
                    value={newLead.email}
                    onChangeText={(text) =>
                      setNewLead({ ...newLead, email: text })
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={{
                      color: colors.text,
                      marginBottom: 6,
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    Phone
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 16,
                      color: colors.text,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    placeholder="+1234567890"
                    placeholderTextColor={colors.textSecondary}
                    value={newLead.phone}
                    onChangeText={(text) =>
                      setNewLead({ ...newLead, phone: text })
                    }
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View>
                <ThemedText
                  style={{
                    color: colors.text,
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  Company
                </ThemedText>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 16,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  placeholder="Enter company name"
                  placeholderTextColor={colors.textSecondary}
                  value={newLead.company}
                  onChangeText={(text) =>
                    setNewLead({ ...newLead, company: text })
                  }
                />
              </View>

              <View>
                <ThemedText
                  style={{
                    color: colors.text,
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  Job Title
                </ThemedText>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 16,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  placeholder="Enter job title"
                  placeholderTextColor={colors.textSecondary}
                  value={newLead.jobTitle}
                  onChangeText={(text) =>
                    setNewLead({ ...newLead, jobTitle: text })
                  }
                />
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={{
                      color: colors.text,
                      marginBottom: 6,
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    Budget
                  </ThemedText>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ position: "absolute", left: 14, zIndex: 1 }}>
                      <ThemedText
                        style={{ color: colors.textSecondary, fontSize: 16 }}
                      >
                        $
                      </ThemedText>
                    </View>
                    <TextInput
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: 12,
                        padding: 14,
                        paddingLeft: 30,
                        fontSize: 16,
                        color: colors.text,
                        borderWidth: 1,
                        borderColor: colors.border,
                        flex: 1,
                      }}
                      placeholder="50000"
                      placeholderTextColor={colors.textSecondary}
                      value={newLead.budget?.toString() || ""}
                      onChangeText={(text) =>
                        setNewLead({
                          ...newLead,
                          budget: text ? Number(text) : 0,
                        })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={{
                      color: colors.text,
                      marginBottom: 6,
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    Next Follow Up
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 16,
                      color: colors.text,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textSecondary}
                    value={newLead.nextFollowUp}
                    onChangeText={(text) =>
                      setNewLead({ ...newLead, nextFollowUp: text })
                    }
                  />
                </View>
              </View>

              <View>
                <ThemedText
                  style={{
                    color: colors.text,
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  Status
                </ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ maxHeight: 40 }}
                >
                  {[
                    "new",
                    "contacted",
                    "qualified",
                    "proposal",
                    "negotiation",
                  ].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 16,
                        borderWidth: 1,
                        marginRight: 8,
                        backgroundColor:
                          newLead.status === status
                            ? getStageColor(status) + "20"
                            : colors.background,
                        borderColor:
                          newLead.status === status
                            ? getStageColor(status)
                            : colors.border,
                      }}
                      onPress={() =>
                        setNewLead({
                          ...newLead,
                          status: status as Lead["status"],
                        })
                      }
                    >
                      <ThemedText
                        style={{
                          color:
                            newLead.status === status
                              ? getStageColor(status)
                              : colors.textSecondary,
                          fontSize: 12,
                          fontWeight: "500",
                        }}
                      >
                        {getStageLabel(status)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View>
                <ThemedText
                  style={{
                    color: colors.text,
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  Source
                </ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ maxHeight: 40 }}
                >
                  {leadSources.map((source) => (
                    <TouchableOpacity
                      key={source}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 16,
                        borderWidth: 1,
                        marginRight: 8,
                        backgroundColor:
                          newLead.source === source
                            ? colors.primary + "20"
                            : colors.background,
                        borderColor:
                          newLead.source === source
                            ? colors.primary
                            : colors.border,
                      }}
                      onPress={() =>
                        setNewLead({
                          ...newLead,
                          source: source as Lead["source"],
                        })
                      }
                    >
                      <ThemedText
                        style={{
                          color:
                            newLead.source === source
                              ? colors.primary
                              : colors.textSecondary,
                          fontSize: 12,
                          fontWeight: "500",
                        }}
                      >
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View>
                <ThemedText
                  style={{
                    color: colors.text,
                    marginBottom: 6,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  Priority
                </ThemedText>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {["high", "medium", "low"].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 16,
                        borderWidth: 1,
                        gap: 6,
                        backgroundColor:
                          newLead.priority === priority
                            ? getPriorityColor(priority) + "20"
                            : colors.background,
                        borderColor:
                          newLead.priority === priority
                            ? getPriorityColor(priority)
                            : colors.border,
                        flex: 1,
                      }}
                      onPress={() =>
                        setNewLead({
                          ...newLead,
                          priority: priority as Lead["priority"],
                        })
                      }
                    >
                      <Ionicons
                        name={getPriorityIcon(priority) as any}
                        size={16}
                        color={
                          newLead.priority === priority
                            ? getPriorityColor(priority)
                            : colors.textSecondary
                        }
                      />
                      <ThemedText
                        style={{
                          color:
                            newLead.priority === priority
                              ? getPriorityColor(priority)
                              : colors.textSecondary,
                          fontSize: 14,
                          fontWeight: "500",
                        }}
                      >
                        {getPriorityLabel(priority)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginTop: 24,
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                }}
                onPress={handleAddLead}
              >
                <ThemedText
                  style={{ color: "white", fontWeight: "600", fontSize: 16 }}
                >
                  Save Lead
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
                onPress={resetForm}
              >
                <ThemedText
                  style={{
                    color: colors.textSecondary,
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  Cancel
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
