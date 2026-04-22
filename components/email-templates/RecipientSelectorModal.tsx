// components/email-templates/components/RecipientSelectorModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { createStyles } from "./styles";
import { getContacts, ContactsResponse } from "@/lib/api/contact.api";
import { leadsApi } from "@/lib/api/leads.api";

// ==================== TYPES ====================

// Contact Interface
interface Contact {
  _id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  tags?: string[];
  isFavorite?: boolean;
  leadStatus?: string;
  [key: string]: any;
}

// Lead Interface
interface Lead {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  status: string;
  priority?: "low" | "medium" | "high";
  source?: string;
  budget?: number;
  assignedTo?: any;
  createdBy?: any;
  notes?: any[];
  lastContacted?: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
  contactName?: string;
  name?: string;
}

// API Response for Leads
interface LeadsResponse {
  success: boolean;
  data: {
    data: Lead[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

// Selected Recipient Interface
interface SelectedRecipient {
  _id: string;
  email: string;
  name: string;
  type: "contact" | "lead";
  company?: string;
  jobTitle?: string;
  phone?: string;
  status?: string;
  priority?: string;
  firstName?: string;
  lastName?: string;
}

// Props Interface
interface Props {
  visible: boolean;
  onClose: () => void;
  onSendEmails: (
    recipients: SelectedRecipient[],
    template: any,
  ) => Promise<void>;
  template: any;
}

type TabType = "contacts" | "leads";

// ==================== MAIN COMPONENT ====================

export const RecipientSelectorModal: React.FC<Props> = ({
  visible,
  onClose,
  onSendEmails,
  template,
}) => {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);

  // State
  const [activeTab, setActiveTab] = useState<TabType>("contacts");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRecipients, setSelectedRecipients] = useState<
    SelectedRecipient[]
  >([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewRecipient, setPreviewRecipient] =
    useState<SelectedRecipient | null>(null);
  const [sending, setSending] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setSending(false);
      setPreviewVisible(false);
      setPreviewRecipient(null);
    };
  }, []);

  // ==================== HELPER FUNCTIONS ====================

  // Safe string getters
  const safeString = (value: any): string => {
    return value || "";
  };

  // Contact helpers
  const getContactEmail = (contact: Contact): string => {
    return contact.email || "";
  };

  const getContactName = (contact: Contact): string => {
    const firstName = contact.firstName || "";
    const lastName = contact.lastName || "";
    return `${firstName} ${lastName}`.trim();
  };

  const getContactInitials = (contact: Contact): string => {
    const first = contact.firstName?.[0] || "";
    const last = contact.lastName?.[0] || "";
    return (first + last).toUpperCase();
  };

  // Lead helpers
  const getLeadEmail = (lead: Lead): string => {
    return lead.email || "";
  };

  const getLeadName = (lead: Lead): string => {
    if (lead.contactName) return lead.contactName;
    if (lead.name) return lead.name;
    const firstName = lead.firstName || "";
    const lastName = lead.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
    return "Unknown Lead";
  };

  const getLeadInitials = (lead: Lead): string => {
    const name = getLeadName(lead);
    const parts = name.split(" ");
    const first = parts[0]?.[0] || "";
    const last = parts[1]?.[0] || "";
    return (first + last).toUpperCase();
  };

  const getLeadCompany = (lead: Lead): string => {
    return lead.company || "";
  };

  const getLeadJobTitle = (lead: Lead): string => {
    return lead.jobTitle || "";
  };

  const getLeadPhone = (lead: Lead): string => {
    return lead.phone || "";
  };

  const getLeadStatus = (lead: Lead): string => {
    return lead.status || "new";
  };

  const getLeadPriority = (lead: Lead): string => {
    return lead.priority || "medium";
  };

  const getLeadFirstName = (lead: Lead): string => {
    if (lead.firstName) return lead.firstName;
    const name = getLeadName(lead);
    return name.split(" ")[0] || "";
  };

  const getLeadLastName = (lead: Lead): string => {
    if (lead.lastName) return lead.lastName;
    const name = getLeadName(lead);
    const parts = name.split(" ");
    return parts.slice(1).join(" ") || "";
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      new: "#2196f3",
      contacted: "#ff9800",
      qualified: "#4caf50",
      proposal: "#9c27b0",
      negotiation: "#f44336",
      closed_won: "#4caf50",
      closed_lost: "#9e9e9e",
      cold: "#9e9e9e",
      warm: "#ff9800",
      hot: "#f44336",
      connected: "#2196f3",
      completed: "#4caf50",
    };
    return colorMap[status] || "#9e9e9e";
  };

  // ==================== LOAD RECIPIENTS ====================

  useEffect(() => {
    if (visible) {
      loadRecipients(1, true);
      setSelectedRecipients([]);
      setPreviewVisible(false);
      setPreviewRecipient(null);
      setSending(false);
      setRetryCount(0);
    }
  }, [visible, activeTab, searchQuery]);

  const loadRecipients = async (pageNum: number, reset: boolean = false) => {
    if (loading) return;

    setLoading(true);
    try {
      if (activeTab === "contacts") {
        const response = (await getContacts({
          page: pageNum,
          limit: 20,
          search: searchQuery,
        })) as ContactsResponse;

        if (response?.success && response?.data) {
          const newContacts = response.data;
          setContacts((prev) =>
            reset ? newContacts : [...prev, ...newContacts],
          );
          setHasMore(response.pagination?.page < response.pagination?.pages);
          setTotalPages(response.pagination?.pages || 1);
          setPage(pageNum);
        }
      } else {
        const response = (await leadsApi.getLeads({
          page: pageNum,
          limit: 20,
          search: searchQuery,
        })) as LeadsResponse;

        if (response?.success && response?.data?.data) {
          const newLeads = response.data.data;
          setLeads((prev) => (reset ? newLeads : [...prev, ...newLeads]));
          setHasMore(
            response.data.pagination?.page < response.data.pagination?.pages,
          );
          setTotalPages(response.data.pagination?.pages || 1);
          setPage(pageNum);
        }
      }
    } catch (error) {
      console.error("Error loading recipients:", error);
      Alert.alert("Error", "Failed to load recipients");
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLERS ====================

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1);
    loadRecipients(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && page < totalPages) {
      loadRecipients(page + 1);
    }
  };

  const toggleRecipient = (recipient: SelectedRecipient) => {
    if (sending) return; // Don't allow selection while sending
    setSelectedRecipients((prev) => {
      const exists = prev.find((r) => r._id === recipient._id);
      if (exists) {
        return prev.filter((r) => r._id !== recipient._id);
      } else {
        return [...prev, recipient];
      }
    });
  };

  const isSelected = (id: string): boolean => {
    return selectedRecipients.some((r) => r._id === id);
  };

  const handleContinue = () => {
    if (selectedRecipients.length === 0) {
      Alert.alert("Error", "Please select at least one recipient");
      return;
    }

    setPreviewRecipient(selectedRecipients[0]);
    setPreviewVisible(true);
    setRetryCount(0);
  };

  const handleSendAll = async () => {
    try {
      setSending(true);

      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Request timeout. Please try again.")),
          30000,
        ),
      );

      // Race between API call and timeout
      await Promise.race([
        onSendEmails(selectedRecipients, template),
        timeoutPromise,
      ]);

      // Success - close everything
      Alert.alert(
        "Success",
        `Emails sent to ${selectedRecipients.length} recipient(s) successfully`,
      );

      // Close preview first, then close main modal
      setPreviewVisible(false);
      setPreviewRecipient(null);
      setSelectedRecipients([]);
      setRetryCount(0);

      // Small delay to ensure smooth transition
      setTimeout(() => {
        setSending(false);
        onClose();
      }, 500);
    } catch (error: any) {
      console.error("Error sending emails:", error);

      setSending(false);
      setRetryCount((prev) => prev + 1);

      // Show error but keep UI interactive
      Alert.alert(
        "Error",
        error?.message || "Failed to send emails. Please try again.",
        [
          {
            text: "Try Again",
            onPress: () => {
              // Keep preview open for retry
              setPreviewVisible(true);
            },
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              setPreviewVisible(false);
              setPreviewRecipient(null);
            },
          },
        ],
      );
    }
  };

  const handleClosePreview = () => {
    if (!sending) {
      setPreviewVisible(false);
      setPreviewRecipient(null);
    }
  };

  const handleMainModalClose = () => {
    if (!sending && !previewVisible) {
      onClose();
    }
  };

  // ==================== RENDER ITEMS ====================

  const renderContactItem = ({ item }: { item: Contact }) => {
    const email = getContactEmail(item);
    const name = getContactName(item);
    const initials = getContactInitials(item);
    const selected = isSelected(item._id);

    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: selected ? colors.primary + "10" : colors.card,
          opacity: sending ? 0.5 : 1,
        }}
        onPress={() =>
          toggleRecipient({
            _id: item._id,
            email,
            name,
            type: "contact",
            company: item.company,
            jobTitle: item.jobTitle,
            phone: item.phone,
            firstName: item.firstName,
            lastName: item.lastName,
          })
        }
        disabled={sending}
      >
        <View style={{ position: "relative" }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.primary + "20",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Text
              style={{ color: colors.primary, fontSize: 18, fontWeight: "600" }}
            >
              {initials}
            </Text>
          </View>
          {selected && (
            <View
              style={{
                position: "absolute",
                top: -2,
                right: 8,
                backgroundColor: colors.primary,
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: colors.card,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>✓</Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "500" }}>
            {name}
          </Text>
          {email ? (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                marginTop: 2,
              }}
            >
              {email}
            </Text>
          ) : null}
          {item.company || item.jobTitle ? (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {[item.company, item.jobTitle].filter(Boolean).join(" • ")}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderLeadItem = ({ item }: { item: Lead }) => {
    const email = getLeadEmail(item);
    const name = getLeadName(item);
    const initials = getLeadInitials(item);
    const company = getLeadCompany(item);
    const jobTitle = getLeadJobTitle(item);
    const phone = getLeadPhone(item);
    const status = getLeadStatus(item);
    const priority = getLeadPriority(item);
    const firstName = getLeadFirstName(item);
    const lastName = getLeadLastName(item);
    const selected = isSelected(item._id);

    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: selected ? "#ff980010" : colors.card,
          opacity: sending ? 0.5 : 1,
        }}
        onPress={() =>
          toggleRecipient({
            _id: item._id,
            email,
            name,
            type: "lead",
            company,
            jobTitle,
            phone,
            status,
            priority,
            firstName,
            lastName,
          })
        }
        disabled={sending}
      >
        <View style={{ position: "relative" }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#ff9800" + "20",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ color: "#ff9800", fontSize: 18, fontWeight: "600" }}>
              {initials}
            </Text>
          </View>
          {selected && (
            <View
              style={{
                position: "absolute",
                top: -2,
                right: 8,
                backgroundColor: "#ff9800",
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: colors.card,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>✓</Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "500" }}>
            {name}
          </Text>
          <Text
            style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}
          >
            {email}
          </Text>
          {company || jobTitle || phone ? (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {[company, jobTitle, phone].filter(Boolean).join(" • ")}
            </Text>
          ) : null}
          <View style={{ flexDirection: "row", marginTop: 4, gap: 4 }}>
            <View
              style={{
                backgroundColor: getStatusColor(status) + "20",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text style={{ color: getStatusColor(status), fontSize: 10 }}>
                {status}
              </Text>
            </View>
            <View
              style={{
                backgroundColor:
                  priority === "high"
                    ? "#f4433620"
                    : priority === "medium"
                      ? "#ff980020"
                      : "#9e9e9e20",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  color:
                    priority === "high"
                      ? "#f44336"
                      : priority === "medium"
                        ? "#ff9800"
                        : "#9e9e9e",
                  fontSize: 10,
                }}
              >
                {priority}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ==================== PREVIEW MODAL ====================

  const PreviewModal = () => {
    // Function to replace all variables in content with curly braces {}
    const getProcessedContent = () => {
      if (!template?.content || !previewRecipient)
        return template?.content || "";

      let processedContent = template.content;

      // Sender name (TODO: Get from auth context)
      const senderName = "Your Name";

      // Replace variables with curly braces {}
      const replacements: Record<string, string> = {
        "{name}": previewRecipient.name || "",
        "{firstName}":
          previewRecipient.firstName ||
          previewRecipient.name?.split(" ")[0] ||
          "",
        "{lastName}":
          previewRecipient.lastName ||
          previewRecipient.name?.split(" ").slice(1).join(" ") ||
          "",
        "{email}": previewRecipient.email || "",
        "{phone}": previewRecipient.phone || "",
        "{mobile}": previewRecipient.phone || "",
        "{company}": previewRecipient.company || "",
        "{jobTitle}": previewRecipient.jobTitle || "",
        "{title}": previewRecipient.jobTitle || "",
        "{sender}": senderName,
        "{senderName}": senderName,
        "{from}": senderName,
      };

      // Replace all variables (case insensitive)
      Object.entries(replacements).forEach(([key, value]) => {
        // Escape special regex characters in the key
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escapedKey, "gi");
        processedContent = processedContent.replace(regex, value);
      });

      return processedContent;
    };

    // Get variable value for display
    const getVariableValue = (variable: string): string => {
      if (!previewRecipient) return "Not specified";

      const varName = variable.replace(/[{}]/g, "").toLowerCase();

      switch (varName) {
        case "name":
          return previewRecipient.name || "Not specified";
        case "firstname":
          return (
            previewRecipient.firstName ||
            previewRecipient.name?.split(" ")[0] ||
            "Not specified"
          );
        case "lastname":
          return (
            previewRecipient.lastName ||
            previewRecipient.name?.split(" ").slice(1).join(" ") ||
            "Not specified"
          );
        case "email":
          return previewRecipient.email || "Not specified";
        case "phone":
        case "mobile":
          return previewRecipient.phone || "Not specified";
        case "company":
          return previewRecipient.company || "Not specified";
        case "jobtitle":
        case "title":
          return previewRecipient.jobTitle || "Not specified";
        case "sender":
        case "sendername":
        case "from":
          return "Your Name";
        default:
          return "Value";
      }
    };

    return (
      <Modal
        visible={previewVisible}
        transparent
        animationType="slide"
        onRequestClose={handleClosePreview}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: "80%" }]}>
            <View
              style={[
                styles.modalHeader,
                {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text style={styles.modalTitle}>Preview Email</Text>
              <TouchableOpacity onPress={handleClosePreview} disabled={sending}>
                <Feather
                  name="x"
                  size={24}
                  color={sending ? colors.textSecondary : colors.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              {/* Recipient Info */}
              <View
                style={{
                  backgroundColor: colors.primary + "10",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                >
                  Sending to{" "}
                  {selectedRecipients.length > 1
                    ? `${selectedRecipients.length} recipients`
                    : "1 recipient"}
                </Text>

                {selectedRecipients.length > 1 && (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                      Showing preview for:
                    </Text>
                  </View>
                )}

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor:
                        previewRecipient?.type === "lead"
                          ? "#ff980020"
                          : colors.primary + "20",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          previewRecipient?.type === "lead"
                            ? "#ff9800"
                            : colors.primary,
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      {previewRecipient?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      {previewRecipient?.name}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                      {previewRecipient?.email}
                    </Text>
                    {(previewRecipient?.company ||
                      previewRecipient?.jobTitle ||
                      previewRecipient?.phone) && (
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: 12,
                          marginTop: 2,
                        }}
                      >
                        {[
                          previewRecipient?.company,
                          previewRecipient?.jobTitle,
                          previewRecipient?.phone,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </Text>
                    )}
                  </View>
                </View>

                {selectedRecipients.length > 1 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                      Other recipients:
                    </Text>
                    <View style={{ marginTop: 4 }}>
                      {selectedRecipients.slice(1, 4).map((r) => (
                        <Text
                          key={r._id}
                          style={{
                            color: colors.text,
                            fontSize: 13,
                            marginVertical: 2,
                          }}
                        >
                          • {r.name} ({r.email})
                        </Text>
                      ))}
                      {selectedRecipients.length > 4 && (
                        <Text
                          style={{ color: colors.textSecondary, fontSize: 13 }}
                        >
                          and {selectedRecipients.length - 4} more...
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>

              {/* Email Preview */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  Subject: {template?.subject || ""}
                </Text>

                <View
                  style={{
                    backgroundColor: isDark ? colors.card : "#f8f9fa",
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}
                  >
                    {getProcessedContent()}
                  </Text>
                </View>
              </View>

              {/* Variables used */}
              {template?.variables && template.variables.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 14,
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    Variables replaced:
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {template.variables.map((v: string) => {
                      // Format variable for display
                      const displayVar = v.startsWith("{") ? v : `{${v}}`;
                      const value = getVariableValue(v);

                      return (
                        <View
                          key={v}
                          style={{
                            backgroundColor: colors.primary + "10",
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            borderRadius: 8,
                          }}
                        >
                          <Text style={{ color: colors.primary, fontSize: 12 }}>
                            {displayVar} → {value}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {retryCount > 0 && !sending && (
                <View style={{ marginBottom: 20, alignItems: "center" }}>
                  <Text style={{ color: colors.warning, fontSize: 12 }}>
                    Retry attempt {retryCount}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View
              style={[
                styles.modalActions,
                {
                  padding: 20,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  flexDirection: "row",
                  gap: 12,
                },
              ]}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: isDark ? colors.card : "#f5f5f5",
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  opacity: sending ? 0.5 : 1,
                }}
                onPress={handleClosePreview}
                disabled={sending}
              >
                <Text
                  style={{
                    color: sending ? colors.textSecondary : colors.text,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 2,
                  backgroundColor: colors.primary,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  opacity: sending ? 0.7 : 1,
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                }}
                onPress={handleSendAll}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text
                      style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}
                    >
                      Sending...
                    </Text>
                  </>
                ) : (
                  <>
                    <Feather name="send" size={20} color="#fff" />
                    <Text
                      style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}
                    >
                      Send to {selectedRecipients.length} Recipient
                      {selectedRecipients.length > 1 ? "s" : ""}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleMainModalClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { height: "90%" }]}>
          {/* Loading Overlay */}
          {sending && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
            >
              <View
                style={{
                  backgroundColor: colors.card,
                  padding: 24,
                  borderRadius: 16,
                  alignItems: "center",
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                }}
              >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  style={{ color: colors.text, marginTop: 16, fontSize: 16 }}
                >
                  Sending emails...
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    marginTop: 4,
                    fontSize: 14,
                  }}
                >
                  {selectedRecipients.length} recipient(s)
                </Text>
              </View>
            </View>
          )}

          <View
            style={[
              styles.modalHeader,
              {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View>
              <Text style={styles.modalTitle}>Select Recipients</Text>
              {selectedRecipients.length > 0 && (
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 13,
                    marginTop: 2,
                  }}
                >
                  {selectedRecipients.length} selected
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={handleMainModalClose} disabled={sending}>
              <Feather
                name="x"
                size={24}
                color={sending ? colors.textSecondary : colors.text}
              />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", padding: 16, gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor:
                  activeTab === "contacts" ? colors.primary : "transparent",
                borderWidth: 1,
                borderColor:
                  activeTab === "contacts" ? colors.primary : colors.border,
                alignItems: "center",
              }}
              onPress={() => !sending && setActiveTab("contacts")}
              disabled={sending}
            >
              <Text
                style={{
                  color: activeTab === "contacts" ? "#fff" : colors.text,
                  fontWeight: "600",
                }}
              >
                Contacts ({contacts.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor:
                  activeTab === "leads" ? colors.primary : "transparent",
                borderWidth: 1,
                borderColor:
                  activeTab === "leads" ? colors.primary : colors.border,
                alignItems: "center",
              }}
              onPress={() => !sending && setActiveTab("leads")}
              disabled={sending}
            >
              <Text
                style={{
                  color: activeTab === "leads" ? "#fff" : colors.text,
                  fontWeight: "600",
                }}
              >
                Leads ({leads.length})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? colors.card : "#f5f5f5",
                borderRadius: 8,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: sending ? 0.5 : 1,
              }}
            >
              <Feather name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 8,
                  color: colors.text,
                }}
                placeholder={`Search ${activeTab}...`}
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
                editable={!sending}
              />
              {searchQuery ? (
                <TouchableOpacity
                  onPress={() => handleSearch("")}
                  disabled={sending}
                >
                  <Feather name="x" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {activeTab === "contacts" ? (
            <FlatList
              data={contacts}
              renderItem={renderContactItem}
              keyExtractor={(item: Contact): string =>
                item._id || `contact-${Date.now()}-${Math.random()}`
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              scrollEnabled={!sending}
              ListEmptyComponent={
                loading ? (
                  <View style={{ padding: 40, alignItems: "center" }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                ) : (
                  <View style={{ padding: 40, alignItems: "center" }}>
                    <Feather
                      name="users"
                      size={48}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={{ color: colors.textSecondary, marginTop: 12 }}
                    >
                      No contacts found
                    </Text>
                  </View>
                )
              }
              ListFooterComponent={
                loading && contacts.length > 0 ? (
                  <View style={{ padding: 20 }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : null
              }
            />
          ) : (
            <FlatList
              data={leads}
              renderItem={renderLeadItem}
              keyExtractor={(item: Lead): string =>
                item._id || `lead-${Date.now()}-${Math.random()}`
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              scrollEnabled={!sending}
              ListEmptyComponent={
                loading ? (
                  <View style={{ padding: 40, alignItems: "center" }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                ) : (
                  <View style={{ padding: 40, alignItems: "center" }}>
                    <Feather
                      name="trending-up"
                      size={48}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={{ color: colors.textSecondary, marginTop: 12 }}
                    >
                      No leads found
                    </Text>
                  </View>
                )
              }
              ListFooterComponent={
                loading && leads.length > 0 ? (
                  <View style={{ padding: 20 }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : null
              }
            />
          )}

          {selectedRecipients.length > 0 && !sending && (
            <View
              style={{
                padding: 16,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                backgroundColor: colors.card,
              }}
            >

              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                }}

                onPress={handleContinue}
              >
                <Feather name="eye" size={20} color="#fff" />
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}
                >
                  Preview & Send ({selectedRecipients.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        

        {/* Preview Modal */}
        {previewRecipient && <PreviewModal />}
      </View>
    </Modal>
  );
};
