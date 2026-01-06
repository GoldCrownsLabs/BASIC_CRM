import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/contaxt/ThemeContext";

import { dashboardData } from "@/data/home";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const activityIcons = {
  call: "call-outline",
  meeting: "people-outline",
  email: "mail-outline",
  task: "checkmark-circle-outline",
  note: "document-text-outline",
};

const stageColors = {
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
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
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
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        backgroundColor: color + "20",
      }}>
        <Ionicons name={iconName as any} size={20} color={color} />
      </View>
    );
  };

  const renderLeadStage = (stage: string) => {
    const stageColor =
      stageColors[stage as keyof typeof stageColors] || colors.primary;
    return (
      <View style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: stageColor + "20",
      }}>
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
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}>
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

          <View style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}>
            <View style={{
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
            }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
                backgroundColor: "#2196F320",
              }}>
                <Ionicons name="trending-up" size={24} color="#2196F3" />
              </View>
              <ThemedText
                type="title"
                style={{ fontSize: 24, fontWeight: "700", marginBottom: 4, color: "#2196F3" }}
              >
                {dashboardData.stats.totalLeads}
              </ThemedText>
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary }}
              >
                Total Leads
              </ThemedText>
            </View>

            <View style={{
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
            }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
                backgroundColor: "#4CAF5020",
              }}>
                <Ionicons name="people" size={24} color="#4CAF50" />
              </View>
              <ThemedText
                type="title"
                style={{ fontSize: 24, fontWeight: "700", marginBottom: 4, color: "#4CAF50" }}
              >
                {dashboardData.stats.totalContacts}
              </ThemedText>
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary }}
              >
                Contacts
              </ThemedText>
            </View>

            <View style={{
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
            }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
                backgroundColor: "#FF980020",
              }}>
                <Ionicons name="checkmark-circle" size={24} color="#FF9800" />
              </View>
              <ThemedText
                type="title"
                style={{ fontSize: 24, fontWeight: "700", marginBottom: 4, color: "#FF9800" }}
              >
                {dashboardData.stats.openTasks}
              </ThemedText>
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary }}
              >
                Open Tasks
              </ThemedText>
            </View>

            <View style={{
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
            }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
                backgroundColor: "#9C27B020",
              }}>
                <Ionicons name="cash" size={24} color="#9C27B0" />
              </View>
              <ThemedText
                type="title"
                style={{ fontSize: 24, fontWeight: "700", marginBottom: 4, color: "#9C27B0" }}
              >
                {formatCurrency(dashboardData.stats.revenue).replace("$", "")}K
              </ThemedText>
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary }}
              >
                Pipeline Value
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <ThemedView style={{
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
        }}>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
          }}>
            <ThemedText type="subtitle" style={{ color: colors.text }}>
              Quick Actions
            </ThemedText>
            <TouchableOpacity>
              <ThemedText type="link" style={{ color: colors.primary }}>
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 12,
          }}>
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
                  style={{ fontSize: 13, textAlign: "center", color: colors.primary }}
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
                  style={{ fontSize: 13, textAlign: "center", color: "#4CAF50" }}
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
                  style={{ fontSize: 13, textAlign: "center", color: "#FF9800" }}
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
                  style={{ fontSize: 13, textAlign: "center", color: "#9C27B0" }}
                >
                  Log Activity
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </ThemedView>

        {/* Recent Activities */}
        <ThemedView style={{
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
        }}>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
          }}>
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

        {/* Top Leads */}
        <ThemedView style={{
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
        }}>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
          }}>
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

          <View style={{ gap: 12 }}>
            {dashboardData.topLeads.map((lead) => (
              <TouchableOpacity
                key={lead.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: getMutedBackground(),
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#2196F3",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}>
                    <ThemedText type="title" style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                      {lead.name.charAt(0)}
                    </ThemedText>
                  </View>
                  <View>
                    <ThemedText
                      type="defaultSemiBold"
                      style={{ color: colors.text }}
                    >
                      {lead.name}
                    </ThemedText>
                    <ThemedText
                      type="default"
                      style={{ color: colors.textSecondary, fontSize: 12 }}
                    >
                      {formatCurrency(lead.value)} • {lead.days} days ago
                    </ThemedText>
                  </View>
                </View>
                {renderLeadStage(lead.stage)}
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* Performance Metrics */}
        <ThemedView style={{
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
        }}>
          <ThemedText type="subtitle" style={{ color: colors.text }}>
            Performance
          </ThemedText>

          <View style={{
            flexDirection: "column",
            justifyContent: "space-between",
            marginTop: 10,
          }}>
            <View style={{ width: "100%", alignItems: "flex-start" }}>
              <ThemedText
                type="title"
                style={{ fontSize: 20, fontWeight: "700", marginBottom: 4, color: "#4CAF50" }}
              >
                {dashboardData.performance.conversionRate}%
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
                    width: `${dashboardData.performance.conversionRate}%`,
                    backgroundColor: "#4CAF50",
                  }}
                />
              </View>
            </View>

            <View style={{ width: "100%", alignItems: "flex-start", marginTop: 20 }}>
              <ThemedText
                type="title"
                style={{ fontSize: 20, fontWeight: "700", marginBottom: 4, color: "#2196F3" }}
              >
                {dashboardData.performance.avgResponseTime}h
              </ThemedText>
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary }}
              >
                Avg Response Time
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
                    width: "60%",
                    backgroundColor: "#2196F3",
                  }}
                />
              </View>
            </View>

            <View style={{ width: "100%", alignItems: "flex-start", marginTop: 20 }}>
              <ThemedText
                type="title"
                style={{ fontSize: 20, fontWeight: "700", marginBottom: 4, color: "#FF9800" }}
              >
                {dashboardData.performance.tasksCompleted}%
              </ThemedText>
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary }}
              >
                Tasks Completed
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
                    width: `${dashboardData.performance.tasksCompleted}%`,
                    backgroundColor: "#FF9800",
                  }}
                />
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Sync Status */}
        <View style={{
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
        }}>
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