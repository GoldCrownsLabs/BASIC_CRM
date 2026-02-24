// components/modals/HotLeadsModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PieChart } from "react-native-chart-kit";
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
} from "react-native-reanimated";
import leadsApi, { Lead } from "@/lib/api/leads.api";

const { width } = Dimensions.get("window");

interface HotLeadsModalProps {
  visible: boolean;
  onClose: () => void;
  hotLeadsCount: number;
}

export const HotLeadsModal: React.FC<HotLeadsModalProps> = ({
  visible,
  onClose,
  hotLeadsCount,
}) => {
  const { colors, isDark } = useAppTheme();
  const [hotLeads, setHotLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const screenWidth = Dimensions.get("window").width;

  const statusFilters = [
    { id: "all", label: "All Hot", icon: "whatshot", color: "#f59e0b" },
    { id: "new", label: "New", icon: "fiber-new", color: "#3b82f6" },
    { id: "contacted", label: "Contacted", icon: "call", color: "#f59e0b" },
    {
      id: "qualified",
      label: "Qualified",
      icon: "check-circle",
      color: "#10b981",
    },
    {
      id: "proposal",
      label: "Proposal",
      icon: "description",
      color: "#8b5cf6",
    },
    {
      id: "negotiation",
      label: "Negotiation",
      icon: "handshake",
      color: "#ec4899",
    },
  ];

  useEffect(() => {
    if (visible) {
      fetchHotLeads();
    }
  }, [visible]);

  const fetchHotLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsApi.getLeads({
        priority: "high",
        limit: 100,
      });

      if (response.success && response.data?.data) {
        setHotLeads(response.data.data);
      } else {
        setHotLeads([]);
      }
    } catch (error) {
      console.error("Error fetching hot leads:", error);
      setHotLeads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHotLeads();
  };

  const getFilteredLeads = () => {
    if (selectedStatus === "all") {
      return hotLeads;
    }
    return hotLeads.filter((lead) => lead.status === selectedStatus);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      new: "#3b82f6",
      contacted: "#f59e0b",
      qualified: "#10b981",
      proposal: "#8b5cf6",
      negotiation: "#ec4899",
      closed_won: "#10b981",
      closed_lost: "#ef4444",
    };
    return statusColors[status] || "#6b7280";
  };

  const getStatusIcon = (status: string) => {
    const statusIcons: Record<string, string> = {
      new: "fiber-new",
      contacted: "call",
      qualified: "check-circle",
      proposal: "description",
      negotiation: "handshake",
      closed_won: "emoji-events",
      closed_lost: "cancel",
    };
    return statusIcons[status] || "help-outline";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const chartData = [
    {
      name: "New",
      population: hotLeads.filter((l) => l.status === "new").length,
      color: "#3b82f6",
      legendFontColor: colors.text,
    },
    {
      name: "Contacted",
      population: hotLeads.filter((l) => l.status === "contacted").length,
      color: "#f59e0b",
      legendFontColor: colors.text,
    },
    {
      name: "Qualified",
      population: hotLeads.filter((l) => l.status === "qualified").length,
      color: "#10b981",
      legendFontColor: colors.text,
    },
    {
      name: "Proposal",
      population: hotLeads.filter((l) => l.status === "proposal").length,
      color: "#8b5cf6",
      legendFontColor: colors.text,
    },
    {
      name: "Negotiation",
      population: hotLeads.filter((l) => l.status === "negotiation").length,
      color: "#ec4899",
      legendFontColor: colors.text,
    },
  ].filter((item) => item.population > 0);

  const renderLeadItem = ({ item, index }: { item: Lead; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      layout={Layout.springify()}
    >
      <TouchableOpacity
        style={[
          styles.leadItem,
          {
            backgroundColor: isDark ? colors.card : "#ffffff",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 3,
          },
        ]}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[getStatusColor(item.status) + "10", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.leadGradient}
        />

        <View style={styles.leadHeader}>
          <View style={styles.leadInfo}>
            <View style={styles.nameContainer}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: getStatusColor(item.status) + "20" },
                ]}
              >
                <MaterialIcons
                  name="whatshot"
                  size={20}
                  color={getStatusColor(item.status)}
                />
              </View>
              <View style={styles.nameEmailContainer}>
                <ThemedText style={styles.leadName}>
                  {item.firstName} {item.lastName || ""}
                </ThemedText>
                <ThemedText style={styles.leadEmail} numberOfLines={1}>
                  {item.email}
                </ThemedText>
              </View>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + "15" },
            ]}
          >
            <MaterialIcons
              name={getStatusIcon(item.status) as any}
              size={14}
              color={getStatusColor(item.status)}
            />
            <ThemedText
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status.replace("_", " ")}
            </ThemedText>
          </View>
        </View>

        <View style={styles.leadDetails}>
          {item.company && (
            <View style={styles.detailRow}>
              <MaterialIcons
                name="business"
                size={16}
                color={colors.textSecondary}
              />
              <ThemedText style={styles.detailText}>{item.company}</ThemedText>
            </View>
          )}
          <View style={styles.detailRow}>
            <MaterialIcons
              name="event"
              size={16}
              color={colors.textSecondary}
            />
            <ThemedText style={styles.detailText}>
              {formatDate(item.createdAt)}
            </ThemedText>
          </View>
          {item.budget ? (
            <View style={styles.detailRow}>
              <MaterialIcons
                name="attach-money"
                size={16}
                color={colors.textSecondary}
              />
              <ThemedText style={styles.detailText}>
                ${item.budget.toLocaleString()}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.priorityContainer}>
          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor: "#ef444420",
              },
            ]}
          >
            <MaterialIcons name="whatshot" size={12} color="#ef4444" />
            <ThemedText
              style={[
                styles.priorityText,
                {
                  color: "#ef4444",
                },
              ]}
            >
              Hot Lead
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const filteredLeads = getFilteredLeads();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.modalOverlay]}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: isDark ? colors.background : "#f8fafc" },
          ]}
        >
          <LinearGradient
            colors={isDark ? ["#1e293b", "#0f172a"] : ["#ffffff", "#f8fafc"]}
            style={styles.headerGradient}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.iconButton, { backgroundColor: colors.card }]}
              >
                <MaterialIcons name="close" size={22} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <MaterialIcons name="whatshot" size={24} color="#ef4444" />
                <ThemedText type="subtitle" style={styles.modalTitle}>
                  Hot Leads ({hotLeadsCount})
                </ThemedText>
              </View>

              <TouchableOpacity
                onPress={handleRefresh}
                style={[styles.iconButton, { backgroundColor: colors.card }]}
              >
                <MaterialIcons
                  name="refresh"
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.statsContainer}
              contentContainerStyle={styles.statsContent}
            >
              {[
                {
                  label: "Total Hot",
                  value: hotLeads.length,
                  icon: "whatshot",
                  color: "#ef4444",
                },
                {
                  label: "New",
                  value: hotLeads.filter((l) => l.status === "new").length,
                  icon: "fiber-new",
                  color: "#3b82f6",
                },
                {
                  label: "Contacted",
                  value: hotLeads.filter((l) => l.status === "contacted")
                    .length,
                  icon: "call",
                  color: "#f59e0b",
                },
                {
                  label: "Qualified",
                  value: hotLeads.filter((l) => l.status === "qualified")
                    .length,
                  icon: "check-circle",
                  color: "#10b981",
                },
                {
                  label: "Negotiation",
                  value: hotLeads.filter((l) => l.status === "negotiation")
                    .length,
                  icon: "handshake",
                  color: "#ec4899",
                },
              ].map((stat, index) => (
                <Animated.View
                  key={stat.label}
                  entering={FadeInRight.delay(index * 100)}
                  style={[styles.statCard, { backgroundColor: colors.card }]}
                >
                  <View
                    style={[
                      styles.statIconContainer,
                      { backgroundColor: stat.color + "15" },
                    ]}
                  >
                    <MaterialIcons
                      name={stat.icon as any}
                      size={20}
                      color={stat.color}
                    />
                  </View>
                  <View>
                    <ThemedText style={styles.statValue}>
                      {stat.value}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>
                      {stat.label}
                    </ThemedText>
                  </View>
                </Animated.View>
              ))}
            </ScrollView>

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              contentContainerStyle={styles.filterContent}
            >
              {statusFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor:
                        selectedStatus === filter.id
                          ? filter.color
                          : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setSelectedStatus(filter.id)}
                >
                  <MaterialIcons
                    name={filter.icon as any}
                    size={16}
                    color={
                      selectedStatus === filter.id ? "#ffffff" : filter.color
                    }
                  />
                  <ThemedText
                    style={[
                      styles.filterText,
                      {
                        color:
                          selectedStatus === filter.id
                            ? "#ffffff"
                            : colors.text,
                      },
                    ]}
                  >
                    {filter.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ef4444" />
              <ThemedText style={styles.loadingText}>
                Loading hot leads...
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={filteredLeads}
              renderItem={renderLeadItem}
              keyExtractor={(item) => item._id}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={["#ef4444"]}
                  tintColor="#ef4444"
                />
              }
              ListHeaderComponent={
                chartData.length > 0 ? (
                  <View
                    style={[styles.chartCard, { backgroundColor: colors.card }]}
                  >
                    <ThemedText style={styles.chartTitle}>
                      Hot Leads by Status
                    </ThemedText>
                    <PieChart
                      data={chartData}
                      width={screenWidth - 64}
                      height={200}
                      chartConfig={{
                        color: (opacity = 1) =>
                          `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => colors.text,
                        backgroundGradientFrom: colors.background,
                        backgroundGradientTo: colors.background,
                        decimalPlaces: 0,
                      }}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      absolute
                    />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View
                    style={[
                      styles.emptyIconContainer,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    <MaterialIcons
                      name="whatshot"
                      size={48}
                      color={colors.textSecondary}
                    />
                  </View>
                  <ThemedText style={styles.emptyTitle}>
                    No hot leads found
                  </ThemedText>
                  <ThemedText style={styles.emptySubtitle}>
                    {selectedStatus === "all"
                      ? "No high priority leads available"
                      : `No hot leads with ${selectedStatus} status`}
                  </ThemedText>
                </View>
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

// components/modals/ConversionRateModal.tsx
interface ConversionRateModalProps {
  visible: boolean;
  onClose: () => void;
  conversionRate: string;
  leadStats: any;
}

export const ConversionRateModal: React.FC<ConversionRateModalProps> = ({
  visible,
  onClose,
  conversionRate,
  leadStats,
}) => {
  const { colors, isDark } = useAppTheme();
  const screenWidth = Dimensions.get("window").width;

  const totalLeads = leadStats?.totalLeads || 0;
  const closedWon =
    leadStats?.leadsByStatus?.find((s: any) => s._id === "closed_won")?.count ||
    0;
  const closedLost =
    leadStats?.leadsByStatus?.find((s: any) => s._id === "closed_lost")
      ?.count || 0;

  const statusData =
    leadStats?.leadsByStatus
      ?.filter((status: any) => status.count > 0)
      .map((status: any) => ({
        name: status._id.replace("_", " "),
        population: status.count,
        color:
          status._id === "closed_won"
            ? "#10b981"
            : status._id === "closed_lost"
              ? "#ef4444"
              : status._id === "new"
                ? "#3b82f6"
                : status._id === "contacted"
                  ? "#f59e0b"
                  : status._id === "qualified"
                    ? "#10b981"
                    : status._id === "proposal"
                      ? "#8b5cf6"
                      : status._id === "negotiation"
                        ? "#ec4899"
                        : "#6b7280",
        legendFontColor: colors.text,
      })) || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.modalOverlay]}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: isDark ? colors.background : "#f8fafc" },
          ]}
        >
          <LinearGradient
            colors={isDark ? ["#1e293b", "#0f172a"] : ["#ffffff", "#f8fafc"]}
            style={styles.headerGradient}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.iconButton, { backgroundColor: colors.card }]}
              >
                <MaterialIcons name="close" size={22} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <MaterialIcons name="trending-up" size={24} color="#10b981" />
                <ThemedText type="subtitle" style={styles.modalTitle}>
                  Conversion Analysis
                </ThemedText>
              </View>

              <View style={{ width: 40 }} />
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInDown.delay(100)}>
              <LinearGradient
                colors={["#10b98120", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.conversionCard,
                  { backgroundColor: colors.card },
                ]}
              >
                <View style={styles.conversionHeader}>
                  <View
                    style={[
                      styles.conversionIconContainer,
                      { backgroundColor: "#10b98115" },
                    ]}
                  >
                    <MaterialIcons
                      name="trending-up"
                      size={32}
                      color="#10b981"
                    />
                  </View>
                  <ThemedText style={styles.conversionRateText}>
                    {conversionRate}%
                  </ThemedText>
                </View>
                <ThemedText style={styles.conversionSubtext}>
                  Overall Conversion Rate
                </ThemedText>
              </LinearGradient>
            </Animated.View>

            <View style={styles.statsGrid}>
              {[
                {
                  label: "Total Leads",
                  value: totalLeads,
                  icon: "people",
                  color: "#6366f1",
                },
                {
                  label: "Closed Won",
                  value: closedWon,
                  icon: "emoji-events",
                  color: "#10b981",
                },
                {
                  label: "Closed Lost",
                  value: closedLost,
                  icon: "cancel",
                  color: "#ef4444",
                },
              ].map((stat, index) => (
                <Animated.View
                  key={stat.label}
                  entering={FadeInDown.delay(200 + index * 100)}
                  style={[styles.statBox, { backgroundColor: colors.card }]}
                >
                  <View
                    style={[
                      styles.statIconContainerSmall,
                      { backgroundColor: stat.color + "15" },
                    ]}
                  >
                    <MaterialIcons
                      name={stat.icon as any}
                      size={20}
                      color={stat.color}
                    />
                  </View>
                  <ThemedText style={[styles.statValue, { color: stat.color }]}>
                    {stat.value}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
                </Animated.View>
              ))}
            </View>

            {statusData.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(300)}
                style={[styles.chartCard, { backgroundColor: colors.card }]}
              >
                <ThemedText style={styles.chartTitle}>
                  Lead Status Distribution
                </ThemedText>
                <PieChart
                  data={statusData}
                  width={screenWidth - 64}
                  height={200}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => colors.text,
                    backgroundGradientFrom: colors.background,
                    backgroundGradientTo: colors.background,
                    decimalPlaces: 0,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </Animated.View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// components/modals/PipelineValueModal.tsx
interface PipelineValueModalProps {
  visible: boolean;
  onClose: () => void;
  totalPipelineValue: number;
  onFormatCurrency: (amount: number) => string;
}

export const PipelineValueModal: React.FC<PipelineValueModalProps> = ({
  visible,
  onClose,
  totalPipelineValue,
  onFormatCurrency,
}) => {
  const { colors, isDark } = useAppTheme();
  const [stageData, setStageData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    if (visible) {
      fetchPipelineData();
    }
  }, [visible]);

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      const response = await leadsApi.getLeads({ limit: 100 });

      if (response.success && response.data?.data) {
        const stages = [
          "new",
          "contacted",
          "qualified",
          "proposal",
          "negotiation",
          "closed_won",
        ];

        const data = stages.map((stage) => {
          const stageLeads = response.data!.data.filter(
            (lead) => lead.status === stage && lead.budget,
          );
          const total = stageLeads.reduce(
            (sum, lead) => sum + (lead.budget || 0),
            0,
          );
          return {
            stage: stage.replace("_", " "),
            value: total,
            count: stageLeads.length,
            color:
              stage === "new"
                ? "#3b82f6"
                : stage === "contacted"
                  ? "#f59e0b"
                  : stage === "qualified"
                    ? "#10b981"
                    : stage === "proposal"
                      ? "#8b5cf6"
                      : stage === "negotiation"
                        ? "#ec4899"
                        : "#10b981",
          };
        });
        setStageData(data.filter((item) => item.value > 0));
      } else {
        setStageData([]);
      }
    } catch (error) {
      console.error("Error fetching pipeline data:", error);
      setStageData([]);
    } finally {
      setLoading(false);
    }
  };

  const chartData = stageData.map((item) => ({
    name: item.stage,
    population: item.value,
    color: item.color,
    legendFontColor: colors.text,
  }));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.modalOverlay]}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: isDark ? colors.background : "#f8fafc" },
          ]}
        >
          <LinearGradient
            colors={isDark ? ["#1e293b", "#0f172a"] : ["#ffffff", "#f8fafc"]}
            style={styles.headerGradient}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.iconButton, { backgroundColor: colors.card }]}
              >
                <MaterialIcons name="close" size={22} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <MaterialIcons name="attach-money" size={24} color="#10b981" />
                <ThemedText type="subtitle" style={styles.modalTitle}>
                  Pipeline Value
                </ThemedText>
              </View>

              <TouchableOpacity
                onPress={fetchPipelineData}
                style={[styles.iconButton, { backgroundColor: colors.card }]}
              >
                <MaterialIcons
                  name="refresh"
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInDown.delay(100)}>
              <LinearGradient
                colors={["#10b98120", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.valueCard, { backgroundColor: colors.card }]}
              >
                <ThemedText style={styles.totalValueLabel}>
                  Total Pipeline Value
                </ThemedText>
                <ThemedText style={styles.totalValue}>
                  {onFormatCurrency(totalPipelineValue)}
                </ThemedText>
              </LinearGradient>
            </Animated.View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10b981" />
                <ThemedText style={styles.loadingText}>
                  Loading pipeline data...
                </ThemedText>
              </View>
            ) : (
              <>
                {chartData.length > 0 && (
                  <Animated.View
                    entering={FadeInDown.delay(200)}
                    style={[styles.chartCard, { backgroundColor: colors.card }]}
                  >
                    <ThemedText style={styles.chartTitle}>
                      Value by Stage
                    </ThemedText>
                    <PieChart
                      data={chartData}
                      width={screenWidth - 64}
                      height={200}
                      chartConfig={{
                        color: (opacity = 1) =>
                          `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => colors.text,
                        backgroundGradientFrom: colors.background,
                        backgroundGradientTo: colors.background,
                        decimalPlaces: 0,
                      }}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      absolute
                    />
                  </Animated.View>
                )}

                <View style={styles.stagesContainer}>
                  {stageData.length > 0 ? (
                    stageData.map((stage, index) => (
                      <Animated.View
                        key={index}
                        entering={FadeInDown.delay(300 + index * 100)}
                      >
                        <TouchableOpacity
                          style={[
                            styles.stageItem,
                            { backgroundColor: colors.card },
                          ]}
                          activeOpacity={0.7}
                        >
                          <View style={styles.stageHeader}>
                            <View
                              style={[
                                styles.stageDot,
                                { backgroundColor: stage.color },
                              ]}
                            />
                            <View>
                              <ThemedText style={styles.stageName}>
                                {stage.stage}
                              </ThemedText>
                              <ThemedText style={styles.stageCount}>
                                {stage.count} leads
                              </ThemedText>
                            </View>
                          </View>
                          <ThemedText style={styles.stageValue}>
                            {onFormatCurrency(stage.value)}
                          </ThemedText>
                        </TouchableOpacity>
                      </Animated.View>
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <View
                        style={[
                          styles.emptyIconContainer,
                          { backgroundColor: colors.card },
                        ]}
                      >
                        <MaterialIcons
                          name="attach-money"
                          size={48}
                          color={colors.textSecondary}
                        />
                      </View>
                      <ThemedText style={styles.emptyTitle}>
                        No pipeline data
                      </ThemedText>
                      <ThemedText style={styles.emptySubtitle}>
                        Add budgets to leads to see pipeline value
                      </ThemedText>
                    </View>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  headerGradient: {
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  iconButton: {
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  statsContainer: {
    maxHeight: 100,
    marginBottom: 16,
  },
  statsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    gap: 12,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 2,
    marginBottom: 6,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconContainerSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 20,
   
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    flexGrow: 1,
  },
  leadItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  leadGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  leadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  leadInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  nameEmailContainer: {
    flex: 1,
  },
  leadName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  leadEmail: {
    fontSize: 13,
    opacity: 0.6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  leadDetails: {
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    opacity: 0.7,
    flex: 1,
  },
  priorityContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  chartCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  conversionCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  conversionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  conversionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  conversionRateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10b981",
  },
  conversionSubtext: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  valueCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  totalValueLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10b981",
  },
  stagesContainer: {
    gap: 12,
  },
  stageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stageName: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
    marginBottom: 2,
  },
  stageCount: {
    fontSize: 12,
    opacity: 0.6,
  },
  stageValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
  },
});

export default {
  HotLeadsModal,
  ConversionRateModal,
  PipelineValueModal,
};
