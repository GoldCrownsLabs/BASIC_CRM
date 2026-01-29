import { useState } from "react";
import { Alert } from "react-native";
import * as contactAPI from "@/lib/api/contact.api";

export const useContactActions = (
  contacts: contactAPI.Contact[],
  setContacts: React.Dispatch<React.SetStateAction<contactAPI.Contact[]>>,
  filteredContacts: contactAPI.Contact[],
  setFilteredContacts: React.Dispatch<
    React.SetStateAction<contactAPI.Contact[]>
  >,
  loadStats: () => Promise<void>,
) => {
  const [selectedContact, setSelectedContact] =
    useState<contactAPI.Contact | null>(null);
  const [addContactModalVisible, setAddContactModalVisible] = useState(false);
  const [contactDetailModalVisible, setContactDetailModalVisible] =
    useState(false);

  const handleToggleFavorite = async (contact: contactAPI.Contact) => {
    try {
      const contactId = contact._id;
      if (!contactId) {
        Alert.alert("Error", "Contact ID not found");
        return;
      }

      const response = await contactAPI.toggleFavorite(contactId);

      if ("success" in response && !response.success) {
        Alert.alert("Error", response.message || "Failed to update favorite");
        return;
      }

      const successResponse = response as contactAPI.SingleContactResponse;
      const updatedContact = successResponse.data;

      setContacts((prev) =>
        prev.map((c) => (c._id === contactId ? updatedContact : c)),
      );

      setFilteredContacts((prev) =>
        prev.map((c) => (c._id === contactId ? updatedContact : c)),
      );

      if (selectedContact && selectedContact._id === contactId) {
        setSelectedContact(updatedContact);
      }

      Alert.alert(
        "Success",
        updatedContact.isFavorite
          ? "Added to favorites"
          : "Removed from favorites",
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", "Failed to update favorite status");
    }
  };

  const handleDeleteContact = async (contact: contactAPI.Contact) => {
    Alert.alert(
      "Delete Contact",
      "Are you sure you want to delete this contact?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const contactId = contact._id;
              if (!contactId) {
                Alert.alert("Error", "Contact ID not found");
                return;
              }

              const response = await contactAPI.deleteContact(contactId);

              if ("success" in response && response.success) {
                setContacts((prev) => prev.filter((c) => c._id !== contactId));
                setFilteredContacts((prev) =>
                  prev.filter((c) => c._id !== contactId),
                );

                loadStats();
                Alert.alert("Success", "Contact deleted successfully");
              } else if ("success" in response) {
                Alert.alert(
                  "Error",
                  response.message || "Failed to delete contact",
                );
              }
            } catch (error) {
              console.error("Error deleting contact:", error);
              Alert.alert("Error", "Failed to delete contact");
            }
          },
        },
      ],
    );
  };

  const handleContactAdded = (
    loadContacts: (page: number, refresh: boolean) => Promise<void>,
  ) => {
    loadContacts(1, true);
    loadStats();
    setAddContactModalVisible(false);
  };

  const handleContactUpdated = (updatedContact: contactAPI.Contact) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact._id === updatedContact._id ? updatedContact : contact,
      ),
    );

    setFilteredContacts((prev) =>
      prev.map((contact) =>
        contact._id === updatedContact._id ? updatedContact : contact,
      ),
    );

    if (selectedContact && selectedContact._id === updatedContact._id) {
      setSelectedContact(updatedContact);
    }
  };

  const handleViewContact = (contact: contactAPI.Contact) => {
    setSelectedContact(contact);
    setContactDetailModalVisible(true);
  };

  return {
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
  };
};
