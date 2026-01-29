import React from "react";
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

  const getContactId = (contact: contactAPI.Contact): string => {
    return contact._id || "";
  };

  return (
    <View style={{ paddingHorizontal: 15 }}>
      <View style={{ marginBottom: 15 }}>
        <ThemedText type="subtitle" style={{ color: colors.text }}>
          Contacts ({totalContacts})
        </ThemedText>
      </View>

      {loading && contacts.length === 0 ? (
        <LoadingState />
      ) : filteredContacts.length > 0 ? (
        <>
          <View>
            {filteredContacts.map((contact) => (
              <ContactCard
                key={getContactId(contact)}
                contact={contact}
                onPress={() => onViewContact(contact)}
                onToggleFavorite={async () => onToggleFavorite(contact)}
                onDelete={() => onDeleteContact(contact)}
              />
            ))}
          </View>
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
