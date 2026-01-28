import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { leadSources, leadStages, priorities } from "@/data/leads";
import leadsApi, {
  CreateLeadPayload,
  Lead,
  LeadFilters,
  LeadStats,
  LeadsResponse,
} from "@/lib/api/leads.api";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import {
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LeadsScreen() {
  const { colors } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedSource, setSelectedSource] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addLeadModalVisible, setAddLeadModalVisible] = useState(false);
  const [stats, setStats] = useState<LeadStats | null>(null);


  console.log("leadsData leadsData leadsData", leadsData);

  // ✅ Fixed pagination interface
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  // ✅ New lead form state with proper types
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

  // ✅ Fetch leads on component mount
  useEffect(() => {
    fetchLeads();
    fetchLeadStats();
  }, []);

  // ✅ Fetch leads from API
  const fetchLeads = async (filters?: LeadFilters) => {
    try {
      setLoading(true);

      const response = await leadsApi.getLeads({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: "createdAt",
        sortOrder: "desc",
        status: selectedStage !== "All" ? selectedStage : undefined,
        source: selectedSource !== "All" ? selectedSource : undefined,
        priority: selectedPriority !== "All" ? selectedPriority : undefined,
        search: searchQuery || undefined,
        ...filters,
      });

      if (response.success && response.data) {
        const leadsResponse = response.data as LeadsResponse;
        setLeadsData(leadsResponse.data || []);

        if (leadsResponse.pagination) {
          setPagination({
            page: leadsResponse.pagination.page || 1,
            pages: leadsResponse.pagination.pages || 1,
            total: leadsResponse.pagination.total || 0,
            limit: leadsResponse.pagination.limit || 10,
          });
        }
      }
    } catch (error: any) {
      console.error("Error fetching leads:", error);
      Alert.alert("Error", error.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch lead statistics
  const fetchLeadStats = async () => {
    try {
      const response = await leadsApi.getLeadStats();

      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching lead stats:", error);
    }
  };

  // ✅ Refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchLeads(), fetchLeadStats()]);
    setRefreshing(false);
  }, []);

  // ✅ Search handler
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    fetchLeads({ search: text, page: 1 });
  };

  // ✅ Filter handlers
  const handleStageFilter = (stage: string) => {
    setSelectedStage(stage);
    fetchLeads({
      status: stage !== "All" ? stage : undefined,
      page: 1,
    });
  };

  const handleSourceFilter = (source: string) => {
    setSelectedSource(source);
    fetchLeads({
      source: source !== "All" ? source : undefined,
      page: 1,
    });
  };

  const handlePriorityFilter = (priority: string) => {
    setSelectedPriority(priority);
    fetchLeads({
      priority: priority !== "All" ? priority : undefined,
      page: 1,
    });
  };

  // ✅ Get stage color based on status
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

  // ✅ Get stage label from status
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

  // ✅ Priority icons and colors
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

  const getPriorityDisplayLabel = (priority: string) => {
    return getPriorityLabel(priority);
  };

  // ✅ Currency formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // ✅ Date calculations
  const calculateDaysToClose = (dateString?: string) => {
    if (!dateString) return null;

    const today = new Date();
    const closeDate = new Date(dateString);

    if (isNaN(closeDate.getTime())) return null;

    const diffTime = closeDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  // ✅ Add new lead
  const handleAddLead = async () => {
    try {
      if (!newLead.firstName || !newLead.email) {
        Alert.alert("Validation Error", "First name and Email are required");
        return;
      }

      // Ensure proper types
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

        fetchLeads();
        fetchLeadStats();

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
        setAddLeadModalVisible(false);
      } else {
        Alert.alert("Error", response.message || "Failed to create lead");
      }
    } catch (error: any) {
      console.error("Error creating lead:", error);
      Alert.alert("Error", error.message || "Failed to create lead");
    }
  };

  // ✅ Open lead details
  const openLeadDetails = async (lead: Lead) => {
    try {
      const response = await leadsApi.getLeadById(lead._id);

      if (response.success && response.data) {
        setSelectedLead(response.data);
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching lead details:", error);
      setSelectedLead(lead);
      setModalVisible(true);
    }
  };

  // ✅ Fixed update lead status function
  const handleUpdateStatus = async (status: string) => {
    if (!selectedLead) return;

    try {
      const response = await leadsApi.updateLeadStatus(selectedLead._id, {
        status,
      });

      if (response.success && response.data) {
        Alert.alert("Success", "Status updated successfully");

        // ✅ Fixed type issue - create new lead object with correct status type
        const updatedLead: Lead = {
          ...selectedLead,
          status: status as Lead["status"], // Type assertion
        };

        setSelectedLead(updatedLead);

        fetchLeads();
        fetchLeadStats();
      } else {
        Alert.alert("Error", response.message || "Failed to update status");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update status");
    }
  };

  // ✅ Fixed add note to lead function
  const handleAddNote = async () => {
    if (!selectedLead) return;

    Alert.prompt(
      "Add Note",
      "Enter your note:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async (note?: string) => {
            // ✅ Note को optional बनाएं
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

  // ✅ Delete lead
  const handleDeleteLead = async () => {
    if (!selectedLead) return;

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
                setModalVisible(false);

                fetchLeads();
                fetchLeadStats();
              }
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete lead");
            }
          },
        },
      ],
    );
  };

  // ✅ Handle phone call
  const handleCall = (phone?: string) => {
    if (!phone) {
      Alert.alert("Error", "Phone number not available");
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  // ✅ Handle email
  const handleEmail = (email?: string) => {
    if (!email) {
      Alert.alert("Error", "Email not available");
      return;
    }
    Linking.openURL(`mailto:${email}`);
  };

  // ✅ Fixed get stage stats for display

  // ✅ Fixed get stage stats for display
  const getStageStats = () => {
    if (!stats) return [];

    // Create stage mapping with all stages including "All"
    const allStages = [
      { id: "0", label: "All", status: "all", color: colors.primary },
      ...leadStages.map((stage) => ({
        ...stage,
        // Ensure stage has status property
        status: (stage as any).status || stage.label.toLowerCase(),
      })),
    ];

    return allStages.map((stage) => {
      let count = 0;
      let totalValue = 0;

      if (stage.status === "all") {
        // For "All" stage, use total from stats or leadsData length
        count = stats?.totalLeads || leadsData.length;
        totalValue = leadsData.reduce(
          (sum, lead) => sum + (lead.budget || 0),
          0,
        );
      } else {
        // For specific stages
        const stageData = stats?.leadsByStatus?.find(
          (s) => s._id === stage.status,
        );
        count = stageData?.count || 0;

        totalValue = leadsData
          .filter((lead) => lead.status === stage.status)
          .reduce((sum, lead) => sum + (lead.budget || 0), 0);
      }

      return {
        ...stage,
        count,
        totalValue,
      };
    });
  };
  // ✅ Render lead item
  const renderLead = (item: Lead) => {
    const daysToClose = calculateDaysToClose(item.nextFollowUp);
    const stageColor = getStageColor(item.status);
    const priorityColor = getPriorityColor(item.priority);

    return (
      <TouchableOpacity
        key={item._id}
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={() => openLeadDetails(item)}
        activeOpacity={0.7}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <ThemedText
                type="defaultSemiBold"
                style={{ color: colors.text, fontSize: 16 }}
              >
                {item.firstName} {item.lastName || ""}
              </ThemedText>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: priorityColor + "20",
                }}
              >
                <Ionicons
                  name={getPriorityIcon(item.priority) as any}
                  size={14}
                  color={priorityColor}
                />
              </View>
            </View>
            <ThemedText style={{ color: colors.textSecondary, fontSize: 13 }}>
              {item.company || "No company"} • {item.email}
            </ThemedText>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <ThemedText
              type="defaultSemiBold"
              style={{
                color: colors.primary,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {formatCurrency(item.budget || 0)}
            </ThemedText>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <View
            style={{
              alignSelf: "flex-start",
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: stageColor + "15",
            }}
          >
            <ThemedText
              style={{ color: stageColor, fontSize: 12, fontWeight: "600" }}
            >
              {getStageLabel(item.status)}
            </ThemedText>
          </View>

          <View style={{ flexDirection: "row", gap: 16 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Ionicons
                name="business-outline"
                size={14}
                color={colors.textSecondary}
              />
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                Source:{" "}
                {item.source.charAt(0).toUpperCase() + item.source.slice(1)}
              </ThemedText>
            </View>

            {item.nextFollowUp && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <ThemedText
                  style={{
                    color:
                      daysToClose && daysToClose <= 7
                        ? "#F44336"
                        : daysToClose && daysToClose <= 30
                          ? "#FF9800"
                          : colors.textSecondary,
                    fontSize: 12,
                  }}
                >
                  {daysToClose
                    ? `${daysToClose > 0 ? `${daysToClose}d to close` : "Past due"}`
                    : "No follow up"}
                </ThemedText>
              </View>
            )}
          </View>

          {item.jobTitle && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: "#f0f0f0",
              }}
            >
              <Ionicons
                name="briefcase-outline"
                size={14}
                color={colors.textSecondary}
              />
              <ThemedText
                style={{ color: colors.textSecondary, fontSize: 12, flex: 1 }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.jobTitle}
              </ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ✅ Render lead details modal
  const renderLeadDetailsModal = () => {
    if (!selectedLead) return null;

    const stageColor = getStageColor(selectedLead.status);
    const priorityColor = getPriorityColor(selectedLead.priority);
    const daysToClose = calculateDaysToClose(selectedLead.nextFollowUp);

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
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
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons
                    name="close"
                    size={28}
                    color={colors.textSecondary}
                  />
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
                    style={{
                      color: stageColor,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {getStageLabel(selectedLead.status)}
                  </ThemedText>
                </View>

                <View
                  style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}
                >
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
                    <ThemedText
                      style={{ color: colors.textSecondary, flex: 1 }}
                    >
                      Email
                    </ThemedText>
                    <ThemedText
                      style={{
                        color: colors.text,
                        flex: 1,
                        textAlign: "right",
                      }}
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
                    <ThemedText
                      style={{ color: colors.textSecondary, flex: 1 }}
                    >
                      Source
                    </ThemedText>
                    <ThemedText
                      style={{
                        color: colors.text,
                        flex: 1,
                        textAlign: "right",
                      }}
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
                    <ThemedText
                      style={{ color: colors.textSecondary, flex: 1 }}
                    >
                      Created Date
                    </ThemedText>
                    <ThemedText
                      style={{
                        color: colors.text,
                        flex: 1,
                        textAlign: "right",
                      }}
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
                    <ThemedText
                      style={{ color: colors.textSecondary, flex: 1 }}
                    >
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
                        {getPriorityDisplayLabel(selectedLead.priority)}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>

              {selectedLead.notes && selectedLead.notes.length > 0 && (
                <View style={{ marginBottom: 24 }}>
                  <ThemedText
                    type="subtitle"
                    style={{
                      color: colors.text,
                      marginBottom: 12,
                      fontSize: 16,
                    }}
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
                            style={{
                              color: colors.textSecondary,
                              fontSize: 12,
                            }}
                          >
                            By: {note.createdBy?.name || "Unknown"}
                          </ThemedText>
                          <ThemedText
                            style={{
                              color: colors.textSecondary,
                              fontSize: 12,
                            }}
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
                  onPress={() => {
                    Alert.alert(
                      "Info",
                      "Edit functionality will be implemented soon",
                    );
                  }}
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
                  onPress={() => setModalVisible(false)}
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

  // ✅ Render add lead modal
  const renderAddLeadModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addLeadModalVisible}
      onRequestClose={() => setAddLeadModalVisible(false)}
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
              <TouchableOpacity
                onPress={() => {
                  setAddLeadModalVisible(false);
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
                }}
              >
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
                  {priorities.map((priority) => (
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
                        {getPriorityDisplayLabel(priority)}
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
                onPress={() => setAddLeadModalVisible(false)}
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

  // ✅ Calculate total pipeline value
  const totalPipelineValue = leadsData.reduce(
    (sum, lead) => sum + (lead.budget || 0),
    0,
  );

  // ✅ Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchLeads({ page: newPage });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View
          style={{
            padding: 20,
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: "#f0f0f0",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <ThemedText
              type="title"
              style={{ color: colors.text, fontSize: 24 }}
            >
              Leads Pipeline
            </ThemedText>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: colors.primary + "15",
                }}
                onPress={fetchLeadStats}
              >
                <Ionicons name="stats-chart" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: colors.primary,
                  gap: 8,
                }}
                onPress={() => setAddLeadModalVisible(true)}
              >
                <Ionicons name="add" size={20} color="white" />
                <ThemedText
                  type="defaultSemiBold"
                  style={{ color: "white", fontSize: 14 }}
                >
                  Add Lead
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: colors.background,
              marginBottom: 15,
            }}
          >
            <Ionicons
              name="search"
              size={20}
              color={colors.textSecondary}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={{ flex: 1, fontSize: 16, color: colors.text }}
              placeholder="Search leads..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Stage Filter with Stats */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 15,
              padding: 10,
              borderRadius: 12,
              backgroundColor: colors.background,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {getStageStats().map((stage) => (
              <TouchableOpacity
                key={stage.id}
                style={{
                  alignItems: "center",
                  padding: 8,
                  borderRadius: 10,
                  borderWidth: 1,
                  minWidth: 80,
                  backgroundColor:
                    selectedStage === stage.label
                      ? stage.color + "20"
                      : colors.card,
                  borderColor: stage.color,
                }}
                onPress={() => handleStageFilter(stage.label)}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    marginBottom: 6,
                    backgroundColor: stage.color,
                  }}
                />
                <ThemedText
                  style={{
                    color: colors.text,
                    fontSize: 10,
                    fontWeight: "500",
                    marginBottom: 4,
                  }}
                >
                  {stage.label}
                </ThemedText>
                <ThemedText
                  style={{
                    color: stage.color,
                    fontSize: 16,
                    fontWeight: "bold",
                    marginBottom: 2,
                  }}
                >
                  {stage.count}
                </ThemedText>
                <ThemedText
                  style={{ color: colors.textSecondary, fontSize: 9 }}
                >
                  {formatCurrency(stage.totalValue)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Source Filter */}
          <View style={{ marginBottom: 12 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ maxHeight: 40 }}
            >
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  marginRight: 8,
                  backgroundColor:
                    selectedSource === "All"
                      ? colors.primary + "20"
                      : colors.background,
                  borderColor:
                    selectedSource === "All" ? colors.primary : colors.border,
                }}
                onPress={() => handleSourceFilter("All")}
              >
                <ThemedText
                  style={{
                    color:
                      selectedSource === "All"
                        ? colors.primary
                        : colors.textSecondary,
                    fontSize: 13,
                    fontWeight: "500",
                  }}
                >
                  All Sources
                </ThemedText>
              </TouchableOpacity>

              {leadSources.map((source) => (
                <TouchableOpacity
                  key={source}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    marginRight: 8,
                    backgroundColor:
                      selectedSource === source
                        ? colors.primary + "20"
                        : colors.background,
                    borderColor:
                      selectedSource === source
                        ? colors.primary
                        : colors.border,
                  }}
                  onPress={() => handleSourceFilter(source)}
                >
                  <ThemedText
                    style={{
                      color:
                        selectedSource === source
                          ? colors.primary
                          : colors.textSecondary,
                      fontSize: 13,
                      fontWeight: "500",
                    }}
                  >
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Priority Filter */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                borderWidth: 1,
                gap: 6,
                backgroundColor:
                  selectedPriority === "All"
                    ? colors.primary + "20"
                    : colors.background,
                borderColor:
                  selectedPriority === "All" ? colors.primary : colors.border,
              }}
              onPress={() => handlePriorityFilter("All")}
            >
              <Ionicons
                name="flag"
                size={16}
                color={
                  selectedPriority === "All"
                    ? colors.primary
                    : colors.textSecondary
                }
              />
              <ThemedText
                style={{
                  color:
                    selectedPriority === "All"
                      ? colors.primary
                      : colors.textSecondary,
                  fontSize: 12,
                  fontWeight: "500",
                }}
              >
                All
              </ThemedText>
            </TouchableOpacity>

            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderWidth: 1,
                  gap: 6,
                  backgroundColor:
                    selectedPriority === getPriorityDisplayLabel(priority)
                      ? getPriorityColor(priority) + "20"
                      : colors.background,
                  borderColor:
                    selectedPriority === getPriorityDisplayLabel(priority)
                      ? getPriorityColor(priority)
                      : colors.border,
                }}
                onPress={() =>
                  handlePriorityFilter(getPriorityDisplayLabel(priority))
                }
              >
                <Ionicons
                  name={getPriorityIcon(priority) as any}
                  size={16}
                  color={
                    selectedPriority === getPriorityDisplayLabel(priority)
                      ? getPriorityColor(priority)
                      : colors.textSecondary
                  }
                />
                <ThemedText
                  style={{
                    color:
                      selectedPriority === getPriorityDisplayLabel(priority)
                        ? getPriorityColor(priority)
                        : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  {getPriorityDisplayLabel(priority)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pipeline Stats Card */}
        <View
          style={{
            marginHorizontal: 15,
            marginTop: 15,
            marginBottom: 15,
            padding: 16,
            borderRadius: 16,
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="trending-up" size={24} color={colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ThemedText
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginBottom: 2,
                }}
              >
                Total Pipeline Value
              </ThemedText>
              <ThemedText
                type="title"
                style={{
                  color: colors.primary,
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                {formatCurrency(totalPipelineValue)}
              </ThemedText>
            </View>
            {stats && (
              <View style={{ alignItems: "flex-end" }}>
                <ThemedText
                  style={{ color: colors.textSecondary, fontSize: 11 }}
                >
                  {stats.conversionRate}% Conversion
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 11 }}>
            {pagination.total} Leads • Won:{" "}
            {stats?.leadsByStatus?.find((s) => s._id === "closed_won")?.count ||
              0}{" "}
            • Lost:{" "}
            {stats?.leadsByStatus?.find((s) => s._id === "closed_lost")
              ?.count || 0}{" "}
            • Hot: {stats?.hotLeads || 0}
          </ThemedText>
        </View>

        <View style={{ paddingHorizontal: 15 }}>
          <View
            style={{
              marginBottom: 15,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ThemedText
              type="subtitle"
              style={{ color: colors.text, fontSize: 18 }}
            >
              Leads ({leadsData.length})
            </ThemedText>

            {/* Pagination */}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <TouchableOpacity
                onPress={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={{ opacity: pagination.page === 1 ? 0.5 : 1 }}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>

              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                Page {pagination.page} of {pagination.pages}
              </ThemedText>

              <TouchableOpacity
                onPress={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                style={{
                  opacity: pagination.page === pagination.pages ? 0.5 : 1,
                }}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 50,
              }}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <ThemedText
                style={{ color: colors.textSecondary, marginTop: 10 }}
              >
                Loading leads...
              </ThemedText>
            </View>
          ) : leadsData.length > 0 ? (
            <View style={{ gap: 12 }}>{leadsData.map(renderLead)}</View>
          ) : (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 50,
              }}
            >
              <Ionicons
                name="trending-up-outline"
                size={60}
                color={colors.textSecondary}
              />
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary, marginTop: 10 }}
              >
                No leads found
              </ThemedText>
              <ThemedText
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginTop: 5,
                }}
              >
                Try changing your filters or add a new lead
              </ThemedText>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {renderLeadDetailsModal()}
      {renderAddLeadModal()}
    </SafeAreaView>
  );
}
