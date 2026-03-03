import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as contactAPI from "@/lib/api/contact.api";

interface PerformanceMetricsProps {
  contacts?: contactAPI.Contact[];
  stats?: contactAPI.StatsResponse["data"];
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  contacts: propContacts,
  stats: propStats,
}) => {
  const { colors, isDark } = useAppTheme();
  const [loading, setLoading] = useState(false);

  const [metrics, setMetrics] = useState({
    hotLeads: 0,
    connected: 0,
    completed: 0,
    totalRevenue: 0,
    conversionRate: 0,
    avgDealValue: 0,
    leadStatusBreakdown: {} as Record<string, number>,
    priorityBreakdown: { high: 0, medium: 0, low: 0 },
    // Contact-specific metrics
    totalContacts: 0,
    vipContacts: 0,
    bySource: [] as { source: string; count: number }[],
    recentActivity: 0,
  });

  useEffect(() => {
    fetchMetrics();
  }, [propContacts, propStats]);

  // Fetch from Contacts API only
  const fetchMetrics = async () => {
    try {
      setLoading(true);

      // Case 1: Stats provided directly
      if (propStats) {
        // ✅ FIXED: Calculate VIP count from contacts if available
        const vipCount = propContacts
          ? propContacts.filter((c) => c.tags?.includes("VIP")).length
          : 0;

        setMetrics((prev) => ({
          ...prev,
          hotLeads: propStats.pipeline?.leadStatus?.hot || 0,
          connected: propStats.pipeline?.connected || 0,
          completed: propStats.pipeline?.completed || 0,
          totalRevenue: propStats.revenue?.total || 0,
          conversionRate: propStats.pipeline?.conversionRate || 0,
          avgDealValue: propStats.revenue?.average || 0,
          leadStatusBreakdown: propStats.pipeline?.leadStatus || {},
          totalContacts: propStats.overview?.total || 0,
          vipContacts: vipCount, // ✅ FIXED: Use calculated value
          bySource: propStats.bySource || [],
          recentActivity: propStats.overview?.recentWeek || 0,
        }));
        return;
      }

      // Case 2: Contacts provided directly
      if (propContacts && propContacts.length > 0) {
        calculateFromContacts(propContacts);
        return;
      }

      // Case 3: Fetch from Contacts API only
      const [contactsResponse, statsResponse] = await Promise.all([
        contactAPI.getContacts({ limit: 100 }),
        contactAPI.getContactStats(),
      ]);

      if (contactsResponse?.success && statsResponse?.success) {
        const contacts = contactsResponse.data || [];
        const stats = statsResponse.data;

        // ✅ FIXED: Calculate VIP count from contacts array
        const vipCount = contacts.filter((c) => c.tags?.includes("VIP")).length;

        setMetrics({
          hotLeads: stats.pipeline?.leadStatus?.hot || 0,
          connected: stats.pipeline?.connected || 0,
          completed: stats.pipeline?.completed || 0,
          totalRevenue: stats.revenue?.total || 0,
          conversionRate: stats.pipeline?.conversionRate || 0,
          avgDealValue: stats.revenue?.average || 0,
          leadStatusBreakdown: stats.pipeline?.leadStatus || {},
          priorityBreakdown: calculatePriorityFromTags(contacts),
          // Contact-specific metrics
          totalContacts: stats.overview?.total || 0,
          vipContacts: vipCount, // ✅ FIXED: Use calculated value
          bySource: stats.bySource || [],
          recentActivity: stats.overview?.recentWeek || 0,
        });
      } else {
        console.error("Failed to fetch contacts data");
        resetMetrics();
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
      resetMetrics();
    } finally {
      setLoading(false);
    }
  };

  // Reset to defaults
  const resetMetrics = () => {
    setMetrics({
      hotLeads: 0,
      connected: 0,
      completed: 0,
      totalRevenue: 0,
      conversionRate: 0,
      avgDealValue: 0,
      leadStatusBreakdown: {},
      priorityBreakdown: { high: 0, medium: 0, low: 0 },
      totalContacts: 0,
      vipContacts: 0,
      bySource: [],
      recentActivity: 0,
    });
  };

  // Calculate from contacts array
  const calculateFromContacts = (contacts: contactAPI.Contact[]) => {
    const hotLeads = contacts.filter((c) => c.leadStatus === "hot").length;
    const connected = contacts.filter((c) => c.connected).length;
    const completed = contacts.filter((c) => c.completed).length;
    const totalRevenue = contacts
      .filter((c) => c.completed)
      .reduce((sum, c) => sum + (c.dealValue || 0), 0);

    // VIP count (from tags)
    const vipContacts = contacts.filter((c) => c.tags?.includes("VIP")).length;

    // Source breakdown
    const sourceCount: Record<string, number> = {};
    contacts.forEach((c) => {
      const source = c.source || "other";
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });
    const bySource = Object.entries(sourceCount).map(([source, count]) => ({
      source,
      count,
    }));

    // Lead status breakdown
    const leadStatusBreakdown: Record<string, number> = {};
    contacts.forEach((contact) => {
      const status = contact.leadStatus || "cold";
      leadStatusBreakdown[status] = (leadStatusBreakdown[status] || 0) + 1;
    });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = contacts.filter((c) => {
      const lastContacted = c.lastContacted ? new Date(c.lastContacted) : null;
      return lastContacted && lastContacted >= sevenDaysAgo;
    }).length;

    const totalLeads = contacts.length;
    const conversionRate = totalLeads > 0 ? (completed / totalLeads) * 100 : 0;
    const completedContacts = contacts.filter((c) => c.completed);
    const avgDealValue =
      completedContacts.length > 0
        ? totalRevenue / completedContacts.length
        : 0;

    setMetrics({
      hotLeads,
      connected,
      completed,
      totalRevenue,
      conversionRate,
      avgDealValue,
      leadStatusBreakdown,
      priorityBreakdown: calculatePriorityFromTags(contacts),
      totalContacts: contacts.length,
      vipContacts,
      bySource,
      recentActivity,
    });
  };

  console.log("📊 Contact Metrics:", metrics);

  // Priority calculation
  const calculatePriorityFromTags = (contacts?: contactAPI.Contact[]) => {
    if (!contacts || contacts.length === 0) {
      return { high: 0, medium: 0, low: 0 };
    }

    const priority = { high: 0, medium: 0, low: 0 };

    contacts.forEach((contact) => {
      if (contact.leadStatus === "hot" || contact.leadStatus === "connected") {
        priority.high++;
      } else if (contact.leadStatus === "warm") {
        priority.medium++;
      } else if (contact.leadStatus === "cold") {
        priority.low++;
      } else {
        const tags = contact.tags || [];
        if (tags.some((tag) => /high|urgent|important|hot/i.test(tag))) {
          priority.high++;
        } else if (tags.some((tag) => /medium|normal|warm/i.test(tag))) {
          priority.medium++;
        } else {
          priority.low++;
        }
      }
    });

    return priority;
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    if (typeof amount !== "number" || isNaN(amount)) amount = 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with K/M suffix
  const formatNumber = (num: number): string => {
    if (typeof num !== "number" || isNaN(num)) num = 0;
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getConversionRateDisplay = (): string => {
    const rate =
      typeof metrics.conversionRate === "number" &&
      !isNaN(metrics.conversionRate)
        ? metrics.conversionRate
        : 0;
    return `${rate.toFixed(1)}%`;
  };

  const getSafeValue = (value: any): string => {
    if (value === undefined || value === null) return "0";
    if (typeof value === "number") return value.toString();
    if (typeof value === "string") return value;
    return "0";
  };

  // Metric items with contacts data only
  const metricItems = [
    {
      label: "Total Contacts",
      value: getSafeValue(metrics.totalContacts),
      icon: "people" as const,
      color: isDark ? "#60A5FA" : "#3B82F6",
      description: "All contacts",
    },
    {
      label: "Hot Leads",
      value: getSafeValue(metrics.hotLeads),
      icon: "flame" as const,
      color: isDark ? "#F87171" : "#EF4444",
      description: "Ready to connect",
    },
    {
      label: "VIP",
      value: getSafeValue(metrics.vipContacts),
      icon: "star" as const,
      color: isDark ? "#FBBF24" : "#F59E0B",
      description: "VIP contacts",
    },
    {
      label: "Connected",
      value: getSafeValue(metrics.connected),
      icon: "call" as const,
      color: isDark ? "#60A5FA" : "#3B82F6",
      description: "In discussion",
    },
    {
      label: "Deals Closed",
      value: getSafeValue(metrics.completed),
      icon: "checkmark-circle" as const,
      color: isDark ? "#34D399" : "#10B981",
      description: "Successfully closed",
    },
    {
      label: "Revenue",
      value: formatNumber(metrics.totalRevenue || 0),
      icon: "cash" as const,
      color: isDark ? "#FBBF24" : "#F59E0B",
      description: "Total deal value",
    },
  ];

  // Lead status distribution from contacts
  const getLeadStatusDistribution = () => {
    const statusOrder = ["cold", "warm", "hot", "connected", "completed"];
    const statusColors: Record<string, string> = {
      cold: isDark ? "#9CA3AF" : "#6B7280",
      warm: isDark ? "#FCD34D" : "#F59E0B",
      hot: isDark ? "#FCA5A5" : "#EF4444",
      connected: isDark ? "#93C5FD" : "#3B82F6",
      completed: isDark ? "#6EE7B7" : "#10B981",
    };

    return statusOrder
      .map((status) => ({
        status,
        count: metrics.leadStatusBreakdown[status] || 0,
        color: statusColors[status],
        label: status.charAt(0).toUpperCase() + status.slice(1),
      }))
      .filter((item) => item.count > 0);
  };

  // Source distribution from contacts
  const getSourceDistribution = () => {
    return metrics.bySource.map((item) => ({
      source: item.source,
      count: item.count,
      color: getSourceColor(item.source),
      label: item.source.charAt(0).toUpperCase() + item.source.slice(1),
    }));
  };

  const getSourceColor = (source: string): string => {
    const colors: Record<string, string> = {
      website: isDark ? "#60A5FA" : "#3B82F6",
      referral: isDark ? "#34D399" : "#10B981",
      social: isDark ? "#F87171" : "#EF4444",
      event: isDark ? "#FBBF24" : "#F59E0B",
      call: isDark ? "#8B5CF6" : "#7C3AED",
      email: isDark ? "#EC4899" : "#DB2777",
      meeting: isDark ? "#F59E0B" : "#D97706",
      other: isDark ? "#9CA3AF" : "#6B7280",
    };
    return colors[source] || colors.other;
  };

  const leadStatusDistribution = getLeadStatusDistribution();
  const sourceDistribution = getSourceDistribution();

  const totalLeads = Object.values(metrics.leadStatusBreakdown).reduce(
    (a, b) => (typeof a === "number" ? a : 0) + (typeof b === "number" ? b : 0),
    0,
  );

  if (loading) {
    return (
      <ThemedView
        style={{
          marginHorizontal: 15,
          marginTop: 15,
          padding: 20,
          borderRadius: 20,
          backgroundColor: colors.card,
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
        }}
      >
        <ThemedText style={{ color: colors.textSecondary }}>
          Loading contact metrics...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
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
      <ThemedText
        type="subtitle"
        style={{ color: colors.text, marginBottom: 20 }}
      >
        Contact Performance
      </ThemedText>

      {/* Main Metrics Grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {metricItems.map((metric, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              minWidth: "45%",
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.02)",
              padding: 16,
              borderRadius: 16,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: metric.color + "20",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Ionicons name={metric.icon} size={20} color={metric.color} />
            </View>
            <ThemedText
              type="title"
              style={{ color: colors.text, fontSize: 20, marginBottom: 4 }}
            >
              {metric.value}
            </ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={{ color: colors.text, fontSize: 14, marginBottom: 4 }}
            >
              {metric.label}
            </ThemedText>
            <ThemedText
              type="default"
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                textAlign: "center",
              }}
            >
              {metric.description}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Pipeline Distribution Bar */}
      {leadStatusDistribution.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <ThemedText
            type="defaultSemiBold"
            style={{ color: colors.text, marginBottom: 12 }}
          >
            Lead Status Distribution
          </ThemedText>
          <View style={{ flexDirection: "row", gap: 4, height: 32 }}>
            {leadStatusDistribution.map((item, index) => {
              const percentage =
                totalLeads > 0 ? (item.count / totalLeads) * 100 : 0;

              return (
                <View
                  key={item.status}
                  style={{
                    flex: percentage,
                    backgroundColor: item.color,
                    borderRadius:
                      index === 0
                        ? 12
                        : index === leadStatusDistribution.length - 1
                          ? 12
                          : 0,
                    borderTopLeftRadius: index === 0 ? 12 : 0,
                    borderBottomLeftRadius: index === 0 ? 12 : 0,
                    borderTopRightRadius:
                      index === leadStatusDistribution.length - 1 ? 12 : 0,
                    borderBottomRightRadius:
                      index === leadStatusDistribution.length - 1 ? 12 : 0,
                    justifyContent: "center",
                    alignItems: "center",
                    minWidth: percentage > 10 ? 40 : 24,
                  }}
                >
                  {percentage > 5 && (
                    <ThemedText
                      type="default"
                      style={{
                        color: "white",
                        fontSize: 10,
                        fontWeight: "700",
                      }}
                    >
                      {item.count}
                    </ThemedText>
                  )}
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginTop: 12,
              gap: 8,
            }}
          >
            {leadStatusDistribution.map((item) => (
              <View
                key={item.status}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: item.color,
                  }}
                />
                <ThemedText
                  type="default"
                  style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                  }}
                >
                  {item.label}: {item.count}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Source Distribution */}
      {sourceDistribution.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <ThemedText
            type="defaultSemiBold"
            style={{ color: colors.text, marginBottom: 12 }}
          >
            Contact Sources
          </ThemedText>
          <View style={{ gap: 8 }}>
            {sourceDistribution.map((item) => (
              <View
                key={item.source}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: item.color,
                  }}
                />
                <ThemedText
                  style={{
                    flex: 1,
                    color: colors.text,
                    fontSize: 13,
                    textTransform: "capitalize",
                  }}
                >
                  {item.label}
                </ThemedText>
                <ThemedText
                  style={{
                    color: colors.textSecondary,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {item.count}
                </ThemedText>
                <View
                  style={{
                    width: 80,
                    height: 6,
                    backgroundColor: isDark ? "#2D3748" : "#E2E8F0",
                    borderRadius: 3,
                  }}
                >
                  <View
                    style={{
                      width: `${(item.count / (metrics.totalContacts || 1)) * 100}%`,
                      height: 6,
                      backgroundColor: item.color,
                      borderRadius: 3,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Activity */}
      {metrics.recentActivity > 0 && (
        <View
          style={{
            marginTop: 20,
            padding: 16,
            backgroundColor: isDark
              ? "rgba(59,130,246,0.1)"
              : "rgba(59,130,246,0.05)",
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Ionicons name="time" size={24} color={colors.primary} />
          <View>
            <ThemedText style={{ fontSize: 12, color: colors.primary }}>
              Recent Activity
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: colors.primary,
              }}
            >
              {metrics.recentActivity} contacts contacted in last 7 days
            </ThemedText>
          </View>
        </View>
      )}

      {/* Revenue Summary */}
      {(metrics.totalRevenue || 0) > 0 && (
        <View
          style={{
            marginTop: 20,
            padding: 16,
            backgroundColor: isDark
              ? "rgba(16,185,129,0.1)"
              : "rgba(16,185,129,0.05)",
            borderRadius: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="wallet" size={24} color={colors.success} />
            <View>
              <ThemedText style={{ fontSize: 12, color: colors.success }}>
                Total Revenue
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: colors.success,
                }}
              >
                {formatCurrency(metrics.totalRevenue)}
              </ThemedText>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <ThemedText style={{ fontSize: 11, color: colors.textSecondary }}>
              Avg. Deal
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: colors.text }}>
              {formatCurrency(metrics.avgDealValue)}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Priority Breakdown */}
      {metrics.priorityBreakdown.high +
        metrics.priorityBreakdown.medium +
        metrics.priorityBreakdown.low >
        0 && (
        <View style={{ marginTop: 20 }}>
          <ThemedText
            type="defaultSemiBold"
            style={{ color: colors.text, marginBottom: 12 }}
          >
            Priority Breakdown
          </ThemedText>
          <View style={{ flexDirection: "row", gap: 8, height: 8 }}>
            <View
              style={{
                flex: metrics.priorityBreakdown.high || 0.1,
                backgroundColor: isDark ? "#F87171" : "#EF4444",
                borderRadius: 4,
              }}
            />
            <View
              style={{
                flex: metrics.priorityBreakdown.medium || 0.1,
                backgroundColor: isDark ? "#FBBF24" : "#F59E0B",
                borderRadius: 4,
              }}
            />
            <View
              style={{
                flex: metrics.priorityBreakdown.low || 0.1,
                backgroundColor: isDark ? "#9CA3AF" : "#6B7280",
                borderRadius: 4,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <ThemedText style={{ fontSize: 11, color: colors.textSecondary }}>
              High: {metrics.priorityBreakdown.high}
            </ThemedText>
            <ThemedText style={{ fontSize: 11, color: colors.textSecondary }}>
              Medium: {metrics.priorityBreakdown.medium}
            </ThemedText>
            <ThemedText style={{ fontSize: 11, color: colors.textSecondary }}>
              Low: {metrics.priorityBreakdown.low}
            </ThemedText>
          </View>
        </View>
      )}
    </ThemedView>
  );
};
