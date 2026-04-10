import React, { useState, useMemo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { StatsCard } from "./StatsCard";
import { useAppTheme } from "@/context/ThemeContext";
import { TotalLeadsModal } from "@/components/Modal/TotalLeadsModal";
import {
  ConversionRateModal,
  HotLeadsModal,
  PipelineValueModal,
} from "@/components/Modal/HotLeadsModal";

// 🔥 IMPORT FEATURE FLAGS
import {
  DASHBOARD_TOTAL_LEADS,
  DASHBOARD_TOTAL_TASKS,
  DASHBOARD_TOTAL_CONTACTS,
} from "@/components/constants/FeatureFlags";

interface StatsOverviewProps {
  loading: boolean;
  leadStats: any;
  totalPipelineValue: number;
  onCalculateConversionRate: () => string;
  onFormatCurrency: (amount: number) => string;
  // 🔥 Feature flags props
  showTotalLeads?: boolean;
  showTotalTasks?: boolean;
  showTotalContacts?: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  loading,
  leadStats,
  totalPipelineValue,
  onCalculateConversionRate,
  onFormatCurrency,
  showTotalLeads = DASHBOARD_TOTAL_LEADS,
  showTotalTasks = DASHBOARD_TOTAL_TASKS,
  showTotalContacts = DASHBOARD_TOTAL_CONTACTS,
}) => {
  const { colors } = useAppTheme();
  const [modalVisible, setModalVisible] = useState<string | null>(null);

  const closeModal = () => setModalVisible(null);

  const hotLeadsCount = useMemo(() => {
    if (!leadStats?.byPriority) return 0;
    const highPriorityLead = leadStats.byPriority.find(
      (p: any) => p._id === "high",
    );
    return highPriorityLead?.count || 0;
  }, [leadStats]);

  // 🔥 Calculate which cards to show
  const visibleCards = [
    { id: "total", show: showTotalLeads },
    { id: "hot", show: true }, // Hot leads always shows
    { id: "conversion", show: true }, // Conversion rate always shows
    { id: "pipeline", show: true }, // Pipeline value always shows
  ];

  // 🔥 Count how many cards are visible for layout
  const visibleCount = visibleCards.filter((card) => card.show).length;
  const cardWidth =
    visibleCount === 4 ? "50%" : visibleCount === 2 ? "50%" : "100%";

  return (
    <>
      <View style={styles.container}>
        <View style={styles.row}>
          {/* 🔥 Total Leads Card - Conditional */}
          {showTotalLeads && (
            <TouchableOpacity
              style={[styles.cardWrapper, { width: cardWidth }]}
              onPress={() => setModalVisible("total")}
              activeOpacity={0.7}
            >
              <StatsCard
                title="Total Leads"
                value={leadStats?.totalLeads || 0}
                iconName="trending-up"
                iconColor="#2196F3"
                backgroundColor={colors.card}
                loading={loading}
              />
            </TouchableOpacity>
          )}

          {/* Hot Leads Card - Always Show */}
          <TouchableOpacity
            style={[styles.cardWrapper, { width: cardWidth }]}
            onPress={() => setModalVisible("hot")}
            activeOpacity={0.7}
          >
            <StatsCard
              title="Hot Leads"
              value={hotLeadsCount}
              iconName="flame"
              iconColor="#F44336"
              backgroundColor={colors.card}
              loading={loading}
            />
          </TouchableOpacity>

          {/* 🔥 Total Tasks Card - Conditional */}
          {showTotalTasks && (
            <TouchableOpacity
              style={[styles.cardWrapper, { width: cardWidth }]}
              onPress={() => setModalVisible("tasks")}
              activeOpacity={0.7}
            >
              <StatsCard
                title="Total Tasks"
                value={leadStats?.totalTasks || 0}
                iconName="checkmark-circle"
                iconColor="#FF9800"
                backgroundColor={colors.card}
                loading={loading}
              />
            </TouchableOpacity>
          )}

          {/* 🔥 Total Contacts Card - Conditional */}
          {showTotalContacts && (
            <TouchableOpacity
              style={[styles.cardWrapper, { width: cardWidth }]}
              onPress={() => setModalVisible("contacts")}
              activeOpacity={0.7}
            >
              <StatsCard
                title="Total Contacts"
                value={leadStats?.totalContacts || 0}
                iconName="people"
                iconColor="#00BCD4"
                backgroundColor={colors.card}
                loading={loading}
              />
            </TouchableOpacity>
          )}

          {/* Conversion Rate Card - Always Show */}
          <TouchableOpacity
            style={[styles.cardWrapper, { width: cardWidth }]}
            onPress={() => setModalVisible("conversion")}
            activeOpacity={0.7}
          >
            <StatsCard
              title="Conversion Rate"
              value={`${onCalculateConversionRate()}%`}
              iconName="stats-chart"
              iconColor="#4CAF50"
              backgroundColor={colors.card}
              loading={loading}
            />
          </TouchableOpacity>

          {/* Pipeline Value Card - Always Show */}
          <TouchableOpacity
            style={[styles.cardWrapper, { width: cardWidth }]}
            onPress={() => setModalVisible("pipeline")}
            activeOpacity={0.7}
          >
            <StatsCard
              title="Pipeline Value"
              value={onFormatCurrency(totalPipelineValue).replace("$", "")}
              iconName="cash"
              iconColor="#9C27B0"
              backgroundColor={colors.card}
              loading={loading}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modals - Only show if corresponding card is enabled */}
      {showTotalLeads && (
        <TotalLeadsModal
          visible={modalVisible === "total"}
          onClose={closeModal}
        />
      )}

      <HotLeadsModal
        visible={modalVisible === "hot"}
        onClose={closeModal}
        hotLeadsCount={hotLeadsCount}
      />

      <ConversionRateModal
        visible={modalVisible === "conversion"}
        onClose={closeModal}
        conversionRate={onCalculateConversionRate()}
        leadStats={leadStats}
      />

      <PipelineValueModal
        visible={modalVisible === "pipeline"}
        onClose={closeModal}
        totalPipelineValue={totalPipelineValue}
        onFormatCurrency={onFormatCurrency}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cardWrapper: {
    paddingHorizontal: 6,
    marginBottom: 15,
  },
});
