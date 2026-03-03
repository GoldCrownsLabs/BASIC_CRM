import React, { useEffect, useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

import * as contactAPI from "@/lib/api/contact.api";
import ContactCard from "./ContactCard";

interface ContactsListProps {
  loading: boolean;
  contacts: contactAPI.Contact[];
  filteredContacts: contactAPI.Contact[];
  totalContacts: number;
  hasMore: boolean;
  onLoadMore: () => void;
  onViewContact: (contact: contactAPI.Contact) => void;
  onToggleFavorite: (contact: contactAPI.Contact) => void;
  onDeleteContact: (contact: contactAPI.Contact) => void;
  onAddContact: () => void;
  // 🔥 NEW: Pipeline action props
  onMarkAsConnected?: (contactId: string) => void;
  onMarkAsCompleted?: (contactId: string, dealValue: number) => void;
  // 🔥 NEW: Helper functions for UI
  getStatusColor?: (status: string) => string;
  getStatusIcon?: (status: string) => string;
  formatCurrency?: (amount: number) => string;
}

export const ContactsList: React.FC<ContactsListProps> = ({
  loading,
  contacts,
  filteredContacts,
  totalContacts,
  hasMore,
  onLoadMore,
  onViewContact,
  onToggleFavorite,
  onDeleteContact,
  onAddContact,
  // 🔥 NEW props with defaults
  onMarkAsConnected,
  onMarkAsCompleted,
  getStatusColor = (status) => {
    const colors: Record<string, string> = {
      cold: "#9e9e9e",
      warm: "#ff9800",
      hot: "#f44336",
      connected: "#2196f3",
      completed: "#4caf50",
    };
    return colors[status] || "#9e9e9e";
  },
  getStatusIcon = (status) => {
    const icons: Record<string, string> = {
      cold: "❄️",
      warm: "🌤️",
      hot: "🔥",
      connected: "📞",
      completed: "✅",
    };
    return icons[status] || "📌";
  },
  formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  },
}) => {
  const { colors } = useAppTheme();

  // Debug: Check for duplicate IDs
  useEffect(() => {
    const ids = filteredContacts.map((c) => c._id);
    const duplicates = ids.filter(
      (id, index) => id && ids.indexOf(id) !== index,
    );
    if (duplicates.length > 0) {
      console.warn(
        `⚠️ Found ${duplicates.length} duplicate _id values:`,
        duplicates,
      );
    }

    // Check for contacts without _id
    const withoutId = filteredContacts.filter((c) => !c._id);
    if (withoutId.length > 0) {
      console.warn(
        `⚠️ ${withoutId.length} contacts missing _id:`,
        withoutId.map((c) => ({
          name: `${c.firstName} ${c.lastName || ""}`,
          email: c.email,
        })),
      );
    }
  }, [filteredContacts]);

  // Generate a guaranteed unique key for each contact
  const getContactKey = (
    contact: contactAPI.Contact,
    index: number,
  ): string => {
    if (contact._id && contact._id.trim() !== "") {
      return `contact-${contact._id}-${index}`;
    }

    const uniqueParts = [
      contact.email || "no-email",
      contact.phone || "no-phone",
      contact.firstName || "no-firstname",
      contact.lastName || "no-lastname",
      Date.now().toString(),
      index.toString(),
      Math.random().toString(36).substring(7),
    ];

    const uniqueString = uniqueParts
      .join("-")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .substring(0, 100);

    return `temp-${uniqueString}-${index}`;
  };

  // Memoize the list with enhanced props
  const contactList = useMemo(() => {
    return filteredContacts.map((contact, index) => (
      <ContactCard
        key={getContactKey(contact, index)}
        contact={contact}
        onPress={() => onViewContact(contact)}
        onToggleFavorite={async () => onToggleFavorite(contact)}
        onDelete={() => onDeleteContact(contact)}
        // 🔥 NEW: Pass pipeline actions
        onMarkAsConnected={
          onMarkAsConnected ? () => onMarkAsConnected(contact._id) : undefined
        }
        onMarkAsCompleted={
          onMarkAsCompleted
            ? (dealValue) => onMarkAsCompleted(contact._id, dealValue)
            : undefined
        }
        // 🔥 NEW: Pass helper functions
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        formatCurrency={formatCurrency}
      />
    ));
  }, [
    filteredContacts,
    onViewContact,
    onToggleFavorite,
    onDeleteContact,
    onMarkAsConnected,
    onMarkAsCompleted,
    getStatusColor,
    getStatusIcon,
    formatCurrency,
  ]);

  // 🔥 NEW: Calculate summary stats for the list
  const summaryStats = useMemo(() => {
    const total = filteredContacts.length;
    const connected = filteredContacts.filter((c) => c.connected).length;
    const completed = filteredContacts.filter((c) => c.completed).length;
    const totalRevenue = filteredContacts
      .filter((c) => c.completed)
      .reduce((sum, c) => sum + (c.dealValue || 0), 0);

    return {
      total,
      connected,
      completed,
      totalRevenue,
    };
  }, [filteredContacts]);

  return (
    <View style={{ paddingHorizontal: 15 }}>
      {/* 🔥 NEW: Optional summary header */}
      {filteredContacts.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
            paddingHorizontal: 5,
          }}
        >
          <ThemedText
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.textSecondary,
            }}
          >
            {filteredContacts.length} of {totalContacts} contacts
          </ThemedText>

          {/* Quick stats pills */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {summaryStats.connected > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.primary + "20",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <ThemedText style={{ fontSize: 11, color: colors.primary }}>
                  📞 {summaryStats.connected}
                </ThemedText>
              </View>
            )}
            {summaryStats.completed > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.success + "20",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <ThemedText style={{ fontSize: 11, color: colors.success }}>
                  ✅ {summaryStats.completed}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      )}

      {loading && contacts.length === 0 ? (
        <LoadingState />
      ) : filteredContacts.length > 0 ? (
        <>
          <View>{contactList}</View>

          {/* 🔥 NEW: Show total revenue if any */}
          {summaryStats.totalRevenue > 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                paddingHorizontal: 10,
                paddingVertical: 8,
                marginTop: 5,
                backgroundColor: colors.background,
                borderRadius: 8,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontWeight: "500",
                }}
              >
                Total Revenue: {formatCurrency(summaryStats.totalRevenue)}
              </ThemedText>
            </View>
          )}

          <LoadMoreIndicator
            hasMore={hasMore}
            loading={loading}
            onLoadMore={onLoadMore}
          />
        </>
      ) : (
        <EmptyState onAddContact={onAddContact} />
      )}
    </View>
  );
};

const LoadingState: React.FC = () => {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 50,
      }}
    >
      <Ionicons name="refresh-outline" size={60} color={colors.textSecondary} />
      <ThemedText
        type="default"
        style={{ color: colors.textSecondary, marginTop: 10 }}
      >
        Loading contacts...
      </ThemedText>
    </View>
  );
};

const EmptyState: React.FC<{ onAddContact: () => void }> = ({
  onAddContact,
}) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 50,
      }}
    >
      <Ionicons name="people-outline" size={60} color={colors.textSecondary} />
      <ThemedText
        type="default"
        style={{ color: colors.textSecondary, marginTop: 10 }}
      >
        No contacts found
      </ThemedText>
      <ThemedText
        style={{ color: colors.textSecondary, fontSize: 12, marginTop: 5 }}
      >
        Try changing your search or filter
      </ThemedText>
      <TouchableOpacity
        style={{
          marginTop: 15,
          paddingHorizontal: 20,
          paddingVertical: 10,
          backgroundColor: colors.primary,
          borderRadius: 8,
        }}
        onPress={onAddContact}
      >
        <ThemedText style={{ color: "white" }}>Add First Contact</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const LoadMoreIndicator: React.FC<{
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}> = ({ hasMore, loading, onLoadMore }) => {
  const { colors } = useAppTheme();

  if (!hasMore) return null;

  return (
    <TouchableOpacity
      style={{ alignItems: "center", paddingVertical: 20 }}
      onPress={onLoadMore}
      disabled={loading}
    >
      <Ionicons name="reload-outline" size={24} color={colors.primary} />
      <ThemedText style={{ color: colors.primary, marginTop: 8, fontSize: 12 }}>
        {loading ? "Loading..." : "Load More"}
      </ThemedText>
    </TouchableOpacity>
  );
};
