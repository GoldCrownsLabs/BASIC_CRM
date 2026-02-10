import React from "react";
import {
  ScrollView,
  RefreshControl,
  View,
  KeyboardAvoidingView,
  Platform,
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
    searchQuery,
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
    handleSearch,
    handleFilter,
    handleSort,
    handleLoadMore,
    loadContacts,
    loadStats,
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
            paddingTop: 0, // ✅ Remove top padding
            paddingBottom: 20,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              style={{ backgroundColor: colors.background }}
              progressViewOffset={20} // ✅ Adjust refresh indicator position
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
          {/* Header */}
          <ContactsHeader
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            selectedFilter={selectedFilter}
            onFilterChange={handleFilter}
            selectedSort={selectedSort}
            onSortChange={handleSort}
            filters={filters}
            sortOptions={sortOptions}
          />
          {/* Stats Summary */}
          <StatsSummary stats={contactStats} />
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
          />
          {/* Bottom Spacer */}
          <View style={{ height: 80 }} /> {/* ✅ Reduced from 100 to 80 */}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Add Button */}
      <FloatingAddButton onPress={() => setAddContactModalVisible(true)} />

      {/* Add Contact Modal */}
      <AddContactModal
        visible={addContactModalVisible}
        onClose={() => setAddContactModalVisible(false)}
        onContactAdded={() => handleContactAdded(loadContacts)}
      />

      {/* Contact Detail Modal */}
      {selectedContact && (
        <ContactDetailModal
          visible={contactDetailModalVisible}
          contact={selectedContact}
          onClose={() => setContactDetailModalVisible(false)}
          onToggleFavorite={() => handleToggleFavorite(selectedContact)}
          onContactUpdated={handleContactUpdated}
        />
      )}
    </View>
  );
}
