// app/(tabs)/leads.tsx - Complete Fixed Code
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  RefreshControl,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import { useAppTheme } from "@/context/ThemeContext";
import { useLeads } from "@/hooks/useLeads";
import { useAuthStore } from "@/store/auth.store";
import { Redirect } from "expo-router";
import {
  getStageColor,
  getStageLabel,
  getPriorityIcon,
  getPriorityColor,
  getPriorityDisplayLabel,
  formatCurrency,
  calculateDaysToClose,
  getStageStats,
} from "@/utils/leads.utils";
import { LeadsHeader } from "@/models/Leads/LeadsHeader";
import { StageFilter } from "@/models/Leads/StageFilter";
import { SourceFilter } from "@/models/Leads/SourceFilter";
import { PriorityFilter } from "@/models/Leads/PriorityFilter";
import { PipelineStats } from "@/models/Leads/PipelineStats";
import { LeadsList } from "@/models/Leads/LeadsList";
import { LeadDetailModal } from "@/models/Leads/LeadDetailModal";
import { AddLeadModal } from "@/models/Leads/AddLeadModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// IMPORT FEATURE FLAGS - SAHI PATH
import {
  MODULE_LEADS,
  LEADS_ASSIGN,
  LEADS_FOLLOWUP_REMINDER,
  LEADS_EXPORT,
  LEADS_FILTER_PERSISTENT,
  LEADS_SEARCH_CASE_SENSITIVE,
} from "@/components/constants/FeatureFlags";

export default function LeadsScreen() {
  const { colors } = useAppTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);
  const insets = useSafeAreaInsets();

  // ✅ HOOKS PEHLE CALL KARO (CONDITION SE PEHLE)
  const {
    refreshing,
    loading,
    searchQuery,
    selectedStage,
    selectedSource,
    selectedPriority,
    leadsData,
    stats,
    pagination,
    totalPipelineValue,
    onRefresh,
    handleSearch,
    handleStageFilter,
    handleSourceFilter,
    handlePriorityFilter,
    handlePageChange,
    fetchLeads,
    fetchLeadStats,
  } = useLeads();

  const [selectedLead, setSelectedLead] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addLeadModalVisible, setAddLeadModalVisible] = useState(false);

  // ✅ CHECK AUTHENTICATION
  useEffect(() => {
    if (!authLoading) {
      setAuthChecked(true);
    }
  }, [authLoading]);

  // 🔥 MODULE DISABLED CHECK - LAST MEIN
  if (!MODULE_LEADS) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.text, fontSize: 16 }}>
          Leads module is disabled
        </Text>
      </View>
    );
  }

  // Redirect if not authenticated
  if (authChecked && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Show loading while checking auth
  if (authLoading || !authChecked) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.text }}>
          Checking authentication...
        </Text>
      </View>
    );
  }

  const handleLeadPress = async (lead: any) => {
    try {
      setSelectedLead(lead);
      setModalVisible(true);
    } catch (error) {
      console.error("Error opening lead details:", error);
      setSelectedLead(lead);
      setModalVisible(true);
    }
  };

  const handleLeadAdded = () => {
    fetchLeads();
    fetchLeadStats();
    setAddLeadModalVisible(false);
  };

  const stageStats = getStageStats(stats, leadsData, colors);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 0,
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: 20 + insets.bottom,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            style={{ backgroundColor: colors.background }}
            progressViewOffset={20}
          />
        }
      >
        {/* Header with Search */}
        <LeadsHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onAddLead={() => setAddLeadModalVisible(true)}
        />

        {/* Stage Filter */}
        <StageFilter
          stages={stageStats}
          selectedStage={selectedStage}
          onSelectStage={handleStageFilter}
          formatCurrency={formatCurrency}
        />

        {/* Source Filter */}
        <SourceFilter
          selectedSource={selectedSource}
          onSelectSource={handleSourceFilter}
        />

        {/* Priority Filter */}
        <PriorityFilter
          selectedPriority={selectedPriority}
          onSelectPriority={handlePriorityFilter}
          getPriorityIcon={getPriorityIcon}
          getPriorityColor={getPriorityColor}
          getPriorityDisplayLabel={getPriorityDisplayLabel}
        />

        {/* Pipeline Stats */}
        <PipelineStats
          totalPipelineValue={totalPipelineValue}
          stats={stats}
          totalLeads={pagination.total}
          formatCurrency={formatCurrency}
        />

        {/* Leads List */}
        <View style={{ paddingHorizontal: 15 }}>
          <LeadsList
            loading={loading}
            leads={leadsData}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLeadPress={handleLeadPress}
            getStageColor={getStageColor}
            getStageLabel={getStageLabel}
            getPriorityIcon={getPriorityIcon}
            getPriorityColor={getPriorityColor}
            formatCurrency={formatCurrency}
            calculateDaysToClose={calculateDaysToClose}
            canAssignLead={LEADS_ASSIGN}
            canSetReminder={LEADS_FOLLOWUP_REMINDER}
            canExport={LEADS_EXPORT}
          />
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          visible={modalVisible}
          lead={selectedLead}
          onClose={() => setModalVisible(false)}
          onLeadUpdated={() => {
            fetchLeads();
            fetchLeadStats();
          }}
          canAssignLead={LEADS_ASSIGN}
          canSetReminder={LEADS_FOLLOWUP_REMINDER}
        />
      )}

      {/* Add Lead Modal */}
      <AddLeadModal
        visible={addLeadModalVisible}
        onClose={() => setAddLeadModalVisible(false)}
        onLeadAdded={handleLeadAdded}
      />
    </View>
  );
}
