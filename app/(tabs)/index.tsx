import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { useAppTheme } from "@/context/ThemeContext";

import { dashboardData } from "@/data/home";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import leadsApi, {
  CreateLeadPayload,
  Lead,
  LeadFilters,
  LeadStats,
  LeadsResponse,
} from "@/lib/api/leads.api";
import { SafeAreaView } from "react-native-safe-area-context";

const activityIcons = {
  call: "call-outline",
  meeting: "people-outline",
  email: "mail-outline",
  task: "checkmark-circle-outline",
  note: "document-text-outline",
};

// const stageColors = {
//   New: "#4CAF50",
//   Contacted: "#2196F3",
//   Qualified: "#FF9800",
//   Proposal: "#9C27B0",
//   Negotiation: "#FF5722",
//   Won: "#4CAF50",
//   Lost: "#F44336",
// };

const stageColors: Record<string, string> = {
  New: "#4CAF50",
  Contacted: "#2196F3",
  Qualified: "#FF9800",
  Proposal: "#9C27B0",
  Negotiation: "#FF5722",
  Won: "#4CAF50",
  Lost: "#F44336",
};

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { colors, isDark } = useAppTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState("");
  const fadeAnim = useState(new Animated.Value(0))[0];
  //  const { totalLeads, leadStats, loading } = useLeads();
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]); // ✅ Add this
  const [loading, setLoading] = useState(true);

  const totalPipelineValue = recentLeads.reduce(
    (sum, lead) => sum + (lead.budget || 0),
    0,
  );

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    fetchLeadStats();
    fetchRecentLeads();
  }, []);

  const fetchRecentLeads = async () => {
    try {
      const response = await leadsApi.getLeads({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (response.success && response.data) {
        const leadsResponse = response.data as LeadsResponse;
        setRecentLeads(leadsResponse.data || []);
      }
    } catch (error) {
      console.error("Error fetching recent leads:", error);
    }
  };

  const fetchLeadStats = async () => {
    try {
      setLoading(true);
      const response = await leadsApi.getLeadStats();
      console.log("check data response", response);

      const anyResponse = response as any;
      console.log("check data.data", anyResponse.data?.data);

      if (response.success && anyResponse.data) {
        const statsData = anyResponse.data.data
          ? anyResponse.data.data
          : anyResponse.data;
        console.log("Setting leadStats to:", statsData);
        setLeadStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching lead stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchLeadStats(), fetchRecentLeads()]);
    setRefreshing(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderActivityIcon = (type: string, status: string) => {
    const iconName =
      activityIcons[type as keyof typeof activityIcons] || "help-outline";
    const color =
      status === "completed"
        ? "#4CAF50"
        : status === "upcoming"
          ? "#FF9800"
          : colors.primary;

    return (
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
          backgroundColor: color + "20",
        }}
      >
        <Ionicons name={iconName as any} size={20} color={color} />
      </View>
    );
  };

  const renderLeadStage = (stage: string) => {
    const stageColor =
      stageColors[stage as keyof typeof stageColors] || colors.primary;
    return (
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 12,
          backgroundColor: stageColor + "20",
        }}
      >
        <ThemedText
          type="default"
          style={{ color: stageColor, fontSize: 11, fontWeight: "600" }}
        >
          {stage}
        </ThemedText>
      </View>
    );
  };

  const getMutedBackground = () => {
    return isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  };

  const calculateConversionRate = () => {
    if (!leadStats || !leadStats.leadsByStatus) return "0.00";

    const wonLeads =
      leadStats.leadsByStatus.find((stat) => stat._id === "closed_won")
        ?.count || 0;

    const lostLeads =
      leadStats.leadsByStatus.find((stat) => stat._id === "closed_lost")
        ?.count || 0;

    const totalClosed = wonLeads + lostLeads;

    if (totalClosed === 0) return "0.00";

    const conversionRate = (wonLeads / totalClosed) * 100;
    return conversionRate.toFixed(2);
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
      >
        {/* Welcome Header */}
        <Animated.View
          style={{
            padding: 20,
            marginHorizontal: 15,
            marginTop: 15,
            borderRadius: 20,
            backgroundColor: colors.card,
            opacity: fadeAnim,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View>
              <ThemedText
                type="subtitle"
                style={{ color: colors.textSecondary }}
              >
                {greeting}
              </ThemedText>
              <ThemedText
                type="title"
                style={{
                  color: colors.textSecondary,
                  fontSize: 22,
                  fontWeight: "600",
                }}
              >
                {(user?.name?.split(" ")[0] || "User").toUpperCase()}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                backgroundColor: colors.primary + "15",
              }}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.primary}
              />
              <View
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.error,
                }}
              />
            </TouchableOpacity>
          </View>

          <ThemedText
            type="default"
            style={{ color: colors.textSecondary, marginTop: 4 }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </ThemedText>
        </Animated.View>
        {/* Stats Overview */}
        <Animated.View
          style={{
            paddingHorizontal: 15,
            marginTop: 15,
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          }}
        >
          <ThemedText
            type="subtitle"
            style={{ marginBottom: 15, color: colors.text }}
          >
            Overview
          </ThemedText>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {/* Total Leads Card */}
            <View
              style={{
                width: "48%",
                padding: 15,
                borderRadius: 16,
                marginBottom: 12,
                alignItems: "center",
                backgroundColor: colors.card,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 10,
                  backgroundColor: "#2196F320",
                }}
              >
                <Ionicons name="trending-up" size={24} color="#2196F3" />
              </View>

              {/* ✅ Loading state */}
              {loading ? (
                <ActivityIndicator size="small" color="#2196F3" />
              ) : (
                <>
                  <ThemedText
                    type="title"
                    style={{
                      fontSize: 24,
                      fontWeight: "700",
                      marginBottom: 4,
                      color: "#2196F3",
                    }}
                  >
                    {leadStats?.totalLeads || 0}
                  </ThemedText>
                  <ThemedText
                    type="default"
                    style={{ color: colors.textSecondary }}
                  >
                    Total Leads
                  </ThemedText>
                </>
              )}
            </View>

            {/* Hot Leads Card */}
            <View
              style={{
                width: "48%",
                padding: 15,
                borderRadius: 16,
                marginBottom: 12,
                alignItems: "center",
                backgroundColor: colors.card,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 10,
                  backgroundColor: "#F4433620",
                }}
              >
                <Ionicons name="flame" size={24} color="#F44336" />
              </View>

              {loading ? (
                <ActivityIndicator size="small" color="#F44336" />
              ) : (
                <>
                  <ThemedText
                    type="title"
                    style={{
                      fontSize: 24,
                      fontWeight: "700",
                      marginBottom: 4,
                      color: "#F44336",
                    }}
                  >
                    {leadStats?.hotLeads || 0} {/* ✅ Direct from API */}
                  </ThemedText>
                  <ThemedText
                    type="default"
                    style={{ color: colors.textSecondary }}
                  >
                    Hot Leads
                  </ThemedText>
                </>
              )}
            </View>

            <View
              style={{
                width: "48%",
                padding: 15,
                borderRadius: 16,
                marginBottom: 12,
                alignItems: "center",
                backgroundColor: colors.card,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 10,
                  backgroundColor: "#4CAF5020",
                }}
              >
                <Ionicons name="stats-chart" size={24} color="#4CAF50" />
              </View>

              {loading ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <>
                  <ThemedText
                    type="title"
                    style={{
                      fontSize: 24,
                      fontWeight: "700",
                      marginBottom: 4,
                      color: "#4CAF50",
                    }}
                  >
                    {calculateConversionRate()}%{" "}
                    {/* ✅ Calculated conversion rate */}
                  </ThemedText>
                  <ThemedText
                    type="default"
                    style={{ color: colors.textSecondary }}
                  >
                    Conversion Rate
                  </ThemedText>
                </>
              )}
            </View>

            {/* Pipeline Value Card */}
            <View
              style={{
                width: "48%",
                padding: 15,
                borderRadius: 16,
                marginBottom: 12,
                alignItems: "center",
                backgroundColor: colors.card,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 10,
                  backgroundColor: "#9C27B020",
                }}
              >
                <Ionicons name="cash" size={24} color="#9C27B0" />
              </View>

              {loading ? (
                <ActivityIndicator size="small" color="#9C27B0" />
              ) : (
                <>
                  <ThemedText
                    type="title"
                    style={{
                      fontSize: 24,
                      fontWeight: "700",
                      marginBottom: 4,
                      color: "#9C27B0",
                    }}
                  >
                    {formatCurrency(totalPipelineValue).replace("$", "")}{" "}
                    {/* ✅ Actual pipeline value */}
                  </ThemedText>
                  <ThemedText
                    type="default"
                    style={{ color: colors.textSecondary }}
                  >
                    Pipeline Value
                  </ThemedText>
                </>
              )}
            </View>
          </View>
        </Animated.View>
        {/* Quick Actions */}
        <ThemedView
          style={{
            marginHorizontal: 15,
            marginTop: 15,
            padding: 20,
            borderRadius: 20,
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
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
            <ThemedText type="subtitle" style={{ color: colors.text }}>
              Quick Actions
            </ThemedText>
            <TouchableOpacity>
              <ThemedText type="link" style={{ color: colors.primary }}>
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Link href="/(tabs)/contacts" asChild>
              <TouchableOpacity
                style={{
                  width: "48%",
                  padding: 16,
                  borderRadius: 14,
                  alignItems: "center",
                  backgroundColor: colors.primary + "15",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Ionicons name="person-add" size={20} color="white" />
                </View>
                <ThemedText
                  type="defaultSemiBold"
                  style={{
                    fontSize: 13,
                    textAlign: "center",
                    color: colors.primary,
                  }}
                >
                  Add Contact
                </ThemedText>
              </TouchableOpacity>
            </Link>

            <Link href="/(tabs)/leads" asChild>
              <TouchableOpacity
                style={{
                  width: "48%",
                  padding: 16,
                  borderRadius: 14,
                  alignItems: "center",
                  backgroundColor: "#4CAF5015",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                    backgroundColor: "#4CAF50",
                  }}
                >
                  <Ionicons name="trending-up" size={20} color="white" />
                </View>
                <ThemedText
                  type="defaultSemiBold"
                  style={{
                    fontSize: 13,
                    textAlign: "center",
                    color: "#4CAF50",
                  }}
                >
                  Add Lead
                </ThemedText>
              </TouchableOpacity>
            </Link>

            <Link href="/(tabs)/tasks" asChild>
              <TouchableOpacity
                style={{
                  width: "48%",
                  padding: 16,
                  borderRadius: 14,
                  alignItems: "center",
                  backgroundColor: "#FF980015",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                    backgroundColor: "#FF9800",
                  }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                </View>
                <ThemedText
                  type="defaultSemiBold"
                  style={{
                    fontSize: 13,
                    textAlign: "center",
                    color: "#FF9800",
                  }}
                >
                  Add Task
                </ThemedText>
              </TouchableOpacity>
            </Link>

            <Link href="/activities" asChild>
              <TouchableOpacity
                style={{
                  width: "48%",
                  padding: 16,
                  borderRadius: 14,
                  alignItems: "center",
                  backgroundColor: "#9C27B015",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                    backgroundColor: "#9C27B0",
                  }}
                >
                  <Ionicons name="calendar" size={20} color="white" />
                </View>
                <ThemedText
                  type="defaultSemiBold"
                  style={{
                    fontSize: 13,
                    textAlign: "center",
                    color: "#9C27B0",
                  }}
                >
                  Log Activity
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </ThemedView>
        {/* Recent Activities */}
        <ThemedView
          style={{
            marginHorizontal: 15,
            marginTop: 15,
            padding: 20,
            borderRadius: 20,
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
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
            <ThemedText type="subtitle" style={{ color: colors.text }}>
              Recent Activities
            </ThemedText>
            <Link href="/activities" asChild>
              <TouchableOpacity>
                <ThemedText type="link" style={{ color: colors.primary }}>
                  View All
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={{ gap: 12 }}>
            {dashboardData.recentActivities.slice(0, 4).map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: getMutedBackground(),
                }}
              >
                {renderActivityIcon(activity.type, activity.status)}
                <View style={{ flex: 1 }}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: colors.text }}
                  >
                    {activity.title}
                  </ThemedText>
                  <ThemedText
                    type="default"
                    style={{ color: colors.textSecondary, fontSize: 12 }}
                  >
                    {activity.contact} • {activity.time}
                  </ThemedText>
                </View>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor:
                      activity.status === "completed"
                        ? "#4CAF5020"
                        : activity.status === "upcoming"
                          ? "#FF980020"
                          : colors.primary + "20",
                  }}
                >
                  <ThemedText
                    type="default"
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color:
                        activity.status === "completed"
                          ? "#4CAF50"
                          : activity.status === "upcoming"
                            ? "#FF9800"
                            : colors.primary,
                    }}
                  >
                    {activity.status.charAt(0).toUpperCase() +
                      activity.status.slice(1)}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        <ThemedView
          style={{
            marginHorizontal: 15,
            marginTop: 15,
            padding: 20,
            borderRadius: 20,
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
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
            <ThemedText type="subtitle" style={{ color: colors.text }}>
              Top Leads
            </ThemedText>
            <Link href="/(tabs)/leads" asChild>
              <TouchableOpacity>
                <ThemedText type="link" style={{ color: colors.primary }}>
                  View All
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>

          {/* ✅ Check if recentLeads exist */}
          {loading ? (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <ThemedText
                style={{ color: colors.textSecondary, marginTop: 10 }}
              >
                Loading leads...
              </ThemedText>
            </View>
          ) : recentLeads.length > 0 ? (
            <View style={{ gap: 12 }}>
              {recentLeads.slice(0, 5).map(
                (
                  lead, // ✅ Top 5 leads
                ) => (
                  <TouchableOpacity
                    key={lead._id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: getMutedBackground(),
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      {/* Lead Avatar */}
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: "#2196F3",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 12,
                        }}
                      >
                        <ThemedText
                          type="title"
                          style={{
                            color: "white",
                            fontSize: 16,
                            fontWeight: "600",
                          }}
                        >
                          {lead.firstName?.charAt(0)?.toUpperCase() || "L"}
                        </ThemedText>
                      </View>

                      {/* Lead Info */}
                      <View style={{ flex: 1 }}>
                        <ThemedText
                          type="defaultSemiBold"
                          style={{ color: colors.text, fontSize: 14 }}
                          numberOfLines={1}
                        >
                          {lead.firstName} {lead.lastName || ""}
                        </ThemedText>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <ThemedText
                            type="default"
                            style={{
                              color: colors.textSecondary,
                              fontSize: 12,
                            }}
                          >
                            {formatCurrency(lead.budget || 0)}
                          </ThemedText>
                          <ThemedText
                            type="default"
                            style={{
                              color: colors.textSecondary,
                              fontSize: 12,
                            }}
                          >
                            •
                          </ThemedText>
                          <ThemedText
                            type="default"
                            style={{
                              color: colors.textSecondary,
                              fontSize: 12,
                            }}
                          >
                            {lead.company || "No company"}
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    {/* Lead Stage */}
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor:
                          stageColors[getStageLabel(lead.status)] + "20",
                      }}
                    >
                      <ThemedText
                        type="default"
                        style={{
                          color: stageColors[getStageLabel(lead.status)],
                          fontSize: 11,
                          fontWeight: "600",
                        }}
                      >
                        {getStageLabel(lead.status)}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ),
              )}
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <Ionicons
                name="trending-up-outline"
                size={40}
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
                Add your first lead to see them here
              </ThemedText>
            </View>
          )}
        </ThemedView>
        {/* Performance Metrics */}
        <ThemedView
          style={{
            marginHorizontal: 15,
            marginTop: 15,
            padding: 20,
            borderRadius: 20,
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <ThemedText type="subtitle" style={{ color: colors.text }}>
            Performance
          </ThemedText>

          <View
            style={{
              flexDirection: "column",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <View style={{ width: "100%", alignItems: "flex-start" }}>
              <ThemedText
                type="title"
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  marginBottom: 4,
                  color: "#4CAF50",
                }}
              >
                {leadStats?.conversionRate || "0.00"}%{" "}
                {/* ✅ Direct from API */}
              </ThemedText>
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary }}
              >
                Conversion Rate
              </ThemedText>
              <View
                style={{
                  width: "100%",
                  height: 4,
                  borderRadius: 2,
                  marginTop: 8,
                  overflow: "hidden",
                  backgroundColor: colors.border,
                }}
              >
                <View
                  style={{
                    height: "100%",
                    borderRadius: 2,
                    width: `${parseFloat(leadStats?.conversionRate || "0")}%`,
                    backgroundColor: "#4CAF50",
                  }}
                />
              </View>
            </View>
            {/* ... rest same ... */}
          </View>
        </ThemedView>
        {/* Sync Status */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 15,
            marginHorizontal: 15,
            marginTop: 15,
            borderRadius: 16,
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="cloud-done" size={20} color="#4CAF50" />
            <ThemedText
              type="default"
              style={{ marginLeft: 8, color: colors.textSecondary }}
            >
              Last synced: Just now
            </ThemedText>
          </View>
          <TouchableOpacity>
            <ThemedText type="link" style={{ color: colors.primary }}>
              Sync Now
            </ThemedText>
          </TouchableOpacity>
        </View>
        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
