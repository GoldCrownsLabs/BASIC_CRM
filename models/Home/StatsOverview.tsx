import React, { useState } from "react";
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

interface StatsOverviewProps {
  loading: boolean;
  leadStats: any;
  totalPipelineValue: number;
  onCalculateConversionRate: () => string;
  onFormatCurrency: (amount: number) => string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  loading,
  leadStats,
  totalPipelineValue,
  onCalculateConversionRate,
  onFormatCurrency,
}) => {
  const { colors } = useAppTheme();
  const [modalVisible, setModalVisible] = useState<string | null>(null);

  const closeModal = () => setModalVisible(null);

  return (
    <>
      <View style={styles.container}>
        <ThemedText
          type="subtitle"
          style={{ marginBottom: 15, color: colors.text }}
        >
          Overview
        </ThemedText>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.cardWrapper}
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

          <TouchableOpacity
            style={styles.cardWrapper}
            onPress={() => setModalVisible("hot")}
            activeOpacity={0.7}
          >
            <StatsCard
              title="Hot Leads"
              value={leadStats?.hotLeads || 0}
              iconName="flame"
              iconColor="#F44336"
              backgroundColor={colors.card}
              loading={loading}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardWrapper}
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

          <TouchableOpacity
            style={styles.cardWrapper}
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

      <TotalLeadsModal
        visible={modalVisible === "total"}
        onClose={closeModal}
      />
      <HotLeadsModal
        visible={modalVisible === "hot"}
        onClose={closeModal}
        hotLeadsCount={leadStats?.hotLeads || 0}
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
    width: "50%", 
    paddingHorizontal: 6,
    marginBottom: 15,
  },
});
