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
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";
import leadsApi, { Lead, LeadsResponse } from "@/lib/api/leads.api";

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
  const { colors } = useAppTheme();
  const [hotLeads, setHotLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const screenWidth = Dimensions.get("window").width;

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
        status: "new,contacted,qualified,proposal,negotiation",
        limit: 100,
      });

      // Safe check for response.data
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
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      new: "#2196F3",
      contacted: "#FF9800",
      qualified: "#4CAF50",
      proposal: "#9C27B0",
      negotiation: "#FF5722",
    };
    return statusColors[status] || "#757575";
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
      >
        <View
          style={[styles.modalHeader, { borderBottomColor: colors.border }]}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.modalTitle}>
            Hot Leads ({hotLeadsCount})
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.chartContainer}>
              <PieChart
                data={[
                  {
                    name: "New",
                    population: hotLeads.filter((l) => l.status === "new")
                      .length,
                    color: "#2196F3",
                    legendFontColor: colors.text,
                  },
                  {
                    name: "Contacted",
                    population: hotLeads.filter((l) => l.status === "contacted")
                      .length,
                    color: "#FF9800",
                    legendFontColor: colors.text,
                  },
                  {
                    name: "Qualified",
                    population: hotLeads.filter((l) => l.status === "qualified")
                      .length,
                    color: "#4CAF50",
                    legendFontColor: colors.text,
                  },
                  {
                    name: "Proposal",
                    population: hotLeads.filter((l) => l.status === "proposal")
                      .length,
                    color: "#9C27B0",
                    legendFontColor: colors.text,
                  },
                  {
                    name: "Negotiation",
                    population: hotLeads.filter(
                      (l) => l.status === "negotiation",
                    ).length,
                    color: "#FF5722",
                    legendFontColor: colors.text,
                  },
                ].filter((item) => item.population > 0)}
                width={screenWidth - 32}
                height={220}
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
            </View>

            {hotLeads.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons
                  name="whatshot"
                  size={64}
                  color={colors.textSecondary || "#666"}
                />
                <ThemedText
                  style={[
                    styles.emptyText,
                    { color: colors.textSecondary || "#666" },
                  ]}
                >
                  No hot leads found
                </ThemedText>
              </View>
            ) : (
              hotLeads.map((lead) => (
                <TouchableOpacity
                  key={lead._id}
                  style={[styles.leadItem, { backgroundColor: colors.card }]}
                  activeOpacity={0.7}
                >
                  <View style={styles.leadHeader}>
                    <View style={styles.leadInfo}>
                      <ThemedText style={styles.leadName}>
                        {lead.firstName} {lead.lastName || ""}
                      </ThemedText>
                      <ThemedText style={styles.leadEmail}>
                        {lead.email}
                      </ThemedText>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(lead.status) + "20" },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.statusText,
                          { color: getStatusColor(lead.status) },
                        ]}
                      >
                        {lead.status.replace("_", " ")}
                      </ThemedText>
                    </View>
                  </View>

                  {lead.company && (
                    <View style={styles.detailItem}>
                      <MaterialIcons
                        name="business"
                        size={14}
                        color={colors.textSecondary || "#666"}
                      />
                      <ThemedText style={styles.detailText}>
                        {lead.company}
                      </ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
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
  const { colors } = useAppTheme();
  const screenWidth = Dimensions.get("window").width;

  const totalLeads = leadStats?.totalLeads || 0;
  const closedWon =
    leadStats?.leadsByStatus?.find((s: any) => s._id === "closed_won")?.count ||
    0;
  const closedLost =
    leadStats?.leadsByStatus?.find((s: any) => s._id === "closed_lost")
      ?.count || 0;

  const statusData =
    leadStats?.leadsByStatus?.map((status: any) => ({
      name: status._id.replace("_", " "),
      population: status.count,
      color:
        status._id === "closed_won"
          ? "#4CAF50"
          : status._id === "closed_lost"
            ? "#F44336"
            : "#2196F3",
      legendFontColor: colors.text,
    })) || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
      >
        <View
          style={[styles.modalHeader, { borderBottomColor: colors.border }]}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.modalTitle}>
            Conversion Analysis
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View
            style={[styles.conversionCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.conversionHeader}>
              <MaterialIcons name="trending-up" size={32} color="#4CAF50" />
              <ThemedText style={styles.conversionRateText}>
                {conversionRate}%
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.conversionSubtext,
                { color: colors.textSecondary || "#666" },
              ]}
            >
              Overall Conversion Rate
            </ThemedText>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <ThemedText style={styles.statValue}>{totalLeads}</ThemedText>
              <ThemedText
                style={[
                  styles.statLabel,
                  { color: colors.textSecondary || "#666" },
                ]}
              >
                Total Leads
              </ThemedText>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <ThemedText style={[styles.statValue, { color: "#4CAF50" }]}>
                {closedWon}
              </ThemedText>
              <ThemedText
                style={[
                  styles.statLabel,
                  { color: colors.textSecondary || "#666" },
                ]}
              >
                Closed Won
              </ThemedText>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <ThemedText style={[styles.statValue, { color: "#F44336" }]}>
                {closedLost}
              </ThemedText>
              <ThemedText
                style={[
                  styles.statLabel,
                  { color: colors.textSecondary || "#666" },
                ]}
              >
                Closed Lost
              </ThemedText>
            </View>
          </View>

          {statusData.length > 0 && (
            <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
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
              />
            </View>
          )}
        </ScrollView>
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
  const { colors } = useAppTheme();
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

      // Safe check for response.data
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
            color:
              stage === "new"
                ? "#2196F3"
                : stage === "contacted"
                  ? "#FF9800"
                  : stage === "qualified"
                    ? "#4CAF50"
                    : stage === "proposal"
                      ? "#9C27B0"
                      : stage === "negotiation"
                        ? "#FF5722"
                        : "#4CAF50",
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
      >
        <View
          style={[styles.modalHeader, { borderBottomColor: colors.border }]}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.modalTitle}>
            Pipeline Value
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.valueCard, { backgroundColor: colors.card }]}>
            <ThemedText
              style={[
                styles.totalValueLabel,
                { color: colors.textSecondary || "#666" },
              ]}
            >
              Total Pipeline Value
            </ThemedText>
            <ThemedText style={styles.totalValue}>
              {onFormatCurrency(totalPipelineValue)}
            </ThemedText>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              {stageData.length > 0 && (
                <View
                  style={[styles.chartCard, { backgroundColor: colors.card }]}
                >
                  <ThemedText style={styles.chartTitle}>
                    Value by Stage
                  </ThemedText>
                  <PieChart
                    data={stageData.map((item) => ({
                      name: item.stage,
                      population: item.value,
                      color: item.color,
                      legendFontColor: colors.text,
                    }))}
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
                </View>
              )}

              <View style={styles.stagesContainer}>
                {stageData.length > 0 ? (
                  stageData.map((stage, index) => (
                    <View
                      key={index}
                      style={[
                        styles.stageItem,
                        { backgroundColor: colors.card },
                      ]}
                    >
                      <View style={styles.stageHeader}>
                        <View
                          style={[
                            styles.stageDot,
                            { backgroundColor: stage.color },
                          ]}
                        />
                        <ThemedText style={styles.stageName}>
                          {stage.stage}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.stageValue}>
                        {onFormatCurrency(stage.value)}
                      </ThemedText>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <MaterialIcons
                      name="attach-money"
                      size={64}
                      color={colors.textSecondary || "#666"}
                    />
                    <ThemedText
                      style={[
                        styles.emptyText,
                        { color: colors.textSecondary || "#666" },
                      ]}
                    >
                      No pipeline data available
                    </ThemedText>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

// Common styles (add to the existing styles)
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  leadItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  leadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  leadInfo: {
    flex: 1,
    marginRight: 12,
  },
  leadName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  leadEmail: {
    fontSize: 14,
    color: "#757575",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#757575",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  conversionCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  conversionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  conversionRateText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  conversionSubtext: {
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  chartCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  valueCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  totalValueLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  stagesContainer: {
    gap: 12,
  },
  stageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  stageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stageName: {
    fontSize: 16,
    textTransform: "capitalize",
  },
  stageValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
});
