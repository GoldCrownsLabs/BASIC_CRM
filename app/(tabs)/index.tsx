import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/contaxt/ThemeContext"; // Note: typo in 'context'
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock data for dashboard
const mockData = {
  stats: {
    totalLeads: 42,
    openTasks: 18,
    totalContacts: 156,
    todayActivities: 7,
    qualifiedLeads: 12,
    revenue: 125000,
  },
  recentActivities: [
    {
      id: 1,
      type: "call",
      title: "Call with John Doe",
      time: "10:30 AM",
      contact: "John Doe",
      status: "completed",
    },
    {
      id: 2,
      type: "meeting",
      title: "Meeting with ABC Corp",
      time: "2:00 PM",
      contact: "Sarah Smith",
      status: "upcoming",
    },
    {
      id: 3,
      type: "email",
      title: "Follow-up email sent",
      time: "4:45 PM",
      contact: "Mike Johnson",
      status: "completed",
    },
    {
      id: 4,
      type: "task",
      title: "Prepare proposal",
      time: "11:00 AM",
      contact: "ABC Corp",
      status: "pending",
    },
    {
      id: 5,
      type: "note",
      title: "Meeting notes updated",
      time: "3:30 PM",
      contact: "Emma Wilson",
      status: "completed",
    },
  ],
  topLeads: [
    {
      id: 1,
      name: "ABC Corporation",
      value: 50000,
      stage: "Proposal",
      days: 3,
    },
    {
      id: 2,
      name: "XYZ Enterprises",
      value: 35000,
      stage: "Negotiation",
      days: 5,
    },
    {
      id: 3,
      name: "Tech Solutions Inc",
      value: 25000,
      stage: "Qualified",
      days: 2,
    },
  ],
  performance: {
    conversionRate: 28,
    avgResponseTime: 2.5,
    tasksCompleted: 65,
  },
};

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
  const { colors, isDark } = useAppTheme(); // Added isDark to check theme mode

  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState("");
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Animation on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
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
      <View style={[styles.activityIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={iconName as any} size={20} color={color} />
      </View>
    );
  };

  const renderLeadStage = (stage: string) => {
    const stageColor =
      stageColors[stage as keyof typeof stageColors] || colors.primary;
    return (
      <View style={[styles.stageBadge, { backgroundColor: stageColor + "20" }]}>
        <ThemedText
          type="default"
          style={[styles.stageText, { color: stageColor }]}
        >
          {stage}
        </ThemedText>
      </View>
    );
  };

  // Helper function to get background color for cards with opacity
  const getCardBackground = (opacity: string = "") => {
    return colors.card + opacity;
  };

  // Helper function to get muted background
  const getMutedBackground = () => {
    return isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
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
          style={[
            styles.header,
            {
              backgroundColor: colors.card,
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.headerTop}>
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
              style={[
                styles.notificationBtn,
                { backgroundColor: colors.primary + "15" },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.primary}
              />
              <View
                style={[
                  styles.notificationDot,
                  { backgroundColor: colors.error },
                ]}
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
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { color: colors.text }]}
          >
            Overview
          </ThemedText>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: "#2196F320" }]}>
                <Ionicons name="trending-up" size={24} color="#2196F3" />
              </View>
              <ThemedText
                type="title"
                style={[styles.statNumber, { color: "#2196F3" }]}
              >
                {mockData.stats.totalLeads}
              </ThemedText>
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary }}
              >
                Total Leads
              </ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: "#4CAF5020" }]}>
                <Ionicons name="people" size={24} color="#4CAF50" />
              </View>
              <ThemedText
                type="title"
                style={[styles.statNumber, { color: "#4CAF50" }]}
              >
                {mockData.stats.totalContacts}
              </ThemedText>
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary }}
              >
                Contacts
              </ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: "#FF980020" }]}>
                <Ionicons name="checkmark-circle" size={24} color="#FF9800" />
              </View>
              <ThemedText
                type="title"
                style={[styles.statNumber, { color: "#FF9800" }]}
              >
                {mockData.stats.openTasks}
              </ThemedText>
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary }}
              >
                Open Tasks
              </ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: "#9C27B020" }]}>
                <Ionicons name="cash" size={24} color="#9C27B0" />
              </View>
              <ThemedText
                type="title"
                style={[styles.statNumber, { color: "#9C27B0" }]}
              >
                {formatCurrency(mockData.stats.revenue).replace("$", "")}K
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
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={{ color: colors.text }}>
              Quick Actions
            </ThemedText>
            <TouchableOpacity>
              <ThemedText type="link" style={{ color: colors.primary }}>
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsGrid}>
            <Link href="/(app)/contacts" asChild>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: colors.primary + "15" },
                ]}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Ionicons name="person-add" size={20} color="white" />
                </View>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.actionText, { color: colors.primary }]}
                >
                  Add Contact
                </ThemedText>
              </TouchableOpacity>
            </Link>

            <Link href="/leads/new" asChild>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#4CAF5015" }]}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#4CAF50" }]}
                >
                  <Ionicons name="trending-up" size={20} color="white" />
                </View>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.actionText, { color: "#4CAF50" }]}
                >
                  Add Lead
                </ThemedText>
              </TouchableOpacity>
            </Link>

            <Link href="/(app)/tasks/new" asChild>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#FF980015" }]}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#FF9800" }]}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                </View>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.actionText, { color: "#FF9800" }]}
                >
                  Add Task
                </ThemedText>
              </TouchableOpacity>
            </Link>

            <Link href="/activities" asChild>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#9C27B015" }]}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#9C27B0" }]}
                >
                  <Ionicons name="calendar" size={20} color="white" />
                </View>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.actionText, { color: "#9C27B0" }]}
                >
                  Log Activity
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </ThemedView>

        {/* Recent Activities */}
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
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

          <View style={styles.activitiesList}>
            {mockData.recentActivities.slice(0, 4).map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityItem,
                  { backgroundColor: getMutedBackground() },
                ]}
              >
                {renderActivityIcon(activity.type, activity.status)}
                <View style={styles.activityContent}>
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
                  style={[
                    styles.activityStatus,
                    {
                      backgroundColor:
                        activity.status === "completed"
                          ? "#4CAF5020"
                          : activity.status === "upcoming"
                          ? "#FF980020"
                          : colors.primary + "20",
                    },
                  ]}
                >
                  <ThemedText
                    type="default"
                    style={[
                      styles.statusText,
                      {
                        color:
                          activity.status === "completed"
                            ? "#4CAF50"
                            : activity.status === "upcoming"
                            ? "#FF9800"
                            : colors.primary,
                      },
                    ]}
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
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
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

          <View style={styles.leadsList}>
            {mockData.topLeads.map((lead) => (
              <TouchableOpacity
                key={lead.id}
                style={[
                  styles.leadItem,
                  { backgroundColor: getMutedBackground() },
                ]}
              >
                <View style={styles.leadInfo}>
                  <View style={styles.leadAvatar}>
                    <ThemedText type="title" style={styles.leadInitial}>
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
        <ThemedView style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText type="subtitle" style={{ color: colors.text }}>
            Performance
          </ThemedText>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <ThemedText
                type="title"
                style={[styles.metricValue, { color: "#4CAF50" }]}
              >
                {mockData.performance.conversionRate}%
              </ThemedText>
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary }}
              >
                Conversion Rate
              </ThemedText>
              <View
                style={[styles.metricBar, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.metricFill,
                    {
                      width: `${mockData.performance.conversionRate}%`,
                      backgroundColor: "#4CAF50",
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.metricItem}>
              <ThemedText
                type="title"
                style={[styles.metricValue, { color: "#2196F3" }]}
              >
                {mockData.performance.avgResponseTime}h
              </ThemedText>
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary }}
              >
                Avg Response Time
              </ThemedText>
              <View
                style={[styles.metricBar, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.metricFill,
                    {
                      width: "60%",
                      backgroundColor: "#2196F3",
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.metricItem}>
              <ThemedText
                type="title"
                style={[styles.metricValue, { color: "#FF9800" }]}
              >
                {mockData.performance.tasksCompleted}%
              </ThemedText>
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary }}
              >
                Tasks Completed
              </ThemedText>
              <View
                style={[styles.metricBar, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.metricFill,
                    {
                      width: `${mockData.performance.tasksCompleted}%`,
                      backgroundColor: "#FF9800",
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Sync Status */}
        <View style={[styles.syncStatus, { backgroundColor: colors.card }]}>
          <View style={styles.syncInfo}>
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
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  section: {
    marginHorizontal: 15,
    marginTop: 15,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  actionBtn: {
    width: "48%",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    textAlign: "center",
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  leadsList: {
    gap: 12,
  },
  leadItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
  },
  leadInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  leadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  leadInitial: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  stageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stageText: {
    fontSize: 11,
    fontWeight: "600",
  },
  metricsGrid: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 10,
  },
  metricItem: {
    width: "100%",
    alignItems: "flex-start",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  metricBar: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  metricFill: {
    height: "100%",
    borderRadius: 2,
  },
  syncStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  syncInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomSpacer: {
    height: 100,
  },
});
