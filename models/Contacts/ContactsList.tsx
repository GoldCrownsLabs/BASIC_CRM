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
    // 1. If _id exists and is not empty, use it
    if (contact._id && contact._id.trim() !== "") {
      // ✅ Add index to ensure uniqueness even if backend still sends duplicates
      return `contact-${contact._id}-${index}`;
    }

    // 2. Create a unique key using multiple fields
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

  // Memoize the list to prevent unnecessary re-renders
  const contactList = useMemo(() => {
    return filteredContacts.map((contact, index) => (
      <ContactCard
        key={getContactKey(contact, index)}
        contact={contact}
        onPress={() => onViewContact(contact)}
        onToggleFavorite={async () => onToggleFavorite(contact)}
        onDelete={() => onDeleteContact(contact)}
      />
    ));
  }, [filteredContacts, onViewContact, onToggleFavorite, onDeleteContact]);

  return (
    <View style={{ paddingHorizontal: 15 }}>
      {/* <View style={{ marginBottom: 15 }}>
        <ThemedText type="subtitle" style={{ color: colors.text }}>
          Contacts ({totalContacts})
        </ThemedText>
      </View> */}

      {loading && contacts.length === 0 ? (
        <LoadingState />
      ) : filteredContacts.length > 0 ? (
        <>
          <View>{contactList}</View>
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
};;

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
