import React from "react";
import {
  ScrollView,
  RefreshControl,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useAppTheme } from "@/context/ThemeContext";
import { useContacts } from "@/hooks/useContacts";
import { useContactActions } from "@/hooks/useContactActions";

import AddContactModal from "@/models/Contacts/AddContactModal";
import ContactDetailModal from "@/models/Contacts/ContactDetailModal";
import ContactsHeader from "@/models/Contacts/ContactsHeader";
import StatsSummary from "@/models/Contacts/StatsSummary";
import { ContactsList } from "@/models/Contacts/ContactsList";
import { FloatingAddButton } from "@/models/Contacts/FloatingAddButton";

export default function ContactsScreen() {
  const { colors } = useAppTheme();

  const {
    refreshing,
    // ✅ Search fields available hain but hum use nahi karenge
    // searchQuery,      // ← Available but not used
    // handleSearch,      // ← Available but not used
    selectedFilter,
    selectedSort,
    contacts,
    filteredContacts,
    contactStats,
    loading,
    totalContacts,
    hasMore,
    filters,
    sortOptions,
    onRefresh,
    handleFilter,
    handleSort,
    handleLoadMore,
    loadContacts,
    loadStats,
    getStatusColor,
    getStatusIcon,
    formatCurrency,
    markAsConnected,
    markAsCompleted,
  } = useContacts();

  const {
    selectedContact,
    addContactModalVisible,
    contactDetailModalVisible,
    setAddContactModalVisible,
    setContactDetailModalVisible,
    setSelectedContact,
    handleToggleFavorite,
    handleDeleteContact,
    handleContactAdded,
    handleContactUpdated,
    handleViewContact,
  } = useContactActions(
    contacts,
    () => {},
    filteredContacts,
    () => {},
    loadStats,
  );

  // Handle mark as connected
  const handleMarkAsConnected = async (contactId: string) => {
    try {
      await markAsConnected(contactId);
      await loadContacts(1, true);
      Alert.alert("Success", "Contact marked as connected");
    } catch (error) {
      Alert.alert("Error", "Failed to mark contact as connected");
    }
  };

  // Handle mark as completed
  const handleMarkAsCompleted = async (
    contactId: string,
    dealValue: number,
  ) => {
    try {
      await markAsCompleted(contactId, dealValue);
      await loadContacts(1, true);
      Alert.alert("Success", `Deal completed for ${formatCurrency(dealValue)}`);
    } catch (error) {
      Alert.alert("Error", "Failed to mark deal as completed");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 0,
            paddingBottom: 20,
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
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } =
              nativeEvent;
            const paddingToBottom = 50;
            if (
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom
            ) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {/* ✅ FIXED: Sirf wahi props jo ContactsHeader accept karta hai */}
          <ContactsHeader
            selectedFilter={selectedFilter}
            onFilterChange={handleFilter}
            selectedSort={selectedSort}
            onSortChange={handleSort}
            filters={filters}
            // ❌ NO searchQuery, onSearchChange, sortOptions props
          />

          {/* Stats Summary */}
          <StatsSummary
            stats={{
              ...contactStats,
              formattedRevenue: contactStats.totalRevenue
                ? formatCurrency(contactStats.totalRevenue)
                : "₹0",
            }}
          />

          {/* Contacts List */}
          <ContactsList
            loading={loading}
            contacts={contacts}
            filteredContacts={filteredContacts}
            totalContacts={totalContacts}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onViewContact={handleViewContact}
            onToggleFavorite={handleToggleFavorite}
            onDeleteContact={handleDeleteContact}
            onAddContact={() => setAddContactModalVisible(true)}
            onMarkAsConnected={handleMarkAsConnected}
            onMarkAsCompleted={handleMarkAsCompleted}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            formatCurrency={formatCurrency}
          />

          {/* Bottom Spacer */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Add Button */}
      <FloatingAddButton onPress={() => setAddContactModalVisible(true)} />

      {/* Add Contact Modal */}
      <AddContactModal
        visible={addContactModalVisible}
        onClose={() => setAddContactModalVisible(false)}
        onContactAdded={async () => {
          try {
            await loadContacts(1, true);
            await loadStats();
            setAddContactModalVisible(false);
            Alert.alert("Success", "Contact added successfully!");
          } catch (error) {
            console.error("Error refreshing after contact add:", error);
            Alert.alert(
              "Warning",
              "Contact was added but failed to refresh the list. Please pull down to refresh.",
            );
            setAddContactModalVisible(false);
          }
        }}
      />

      {/* Contact Detail Modal */}
      {selectedContact && (
        <ContactDetailModal
          visible={contactDetailModalVisible}
          contact={selectedContact}
          onClose={() => setContactDetailModalVisible(false)}
          onToggleFavorite={() => handleToggleFavorite(selectedContact)}
          onContactUpdated={handleContactUpdated}
          onMarkAsConnected={() => handleMarkAsConnected(selectedContact._id)}
          onMarkAsCompleted={(dealValue) =>
            handleMarkAsCompleted(selectedContact._id, dealValue)
          }
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          formatCurrency={formatCurrency}
        />
      )}
    </View>
  );
}
