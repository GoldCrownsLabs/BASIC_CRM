import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/contaxt/ThemeContext";
import { Contact, contactsData, filters, sortOptions } from "@/data/contact";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContactsScreen() {
  const { colors } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Recent");
  const [filteredContacts, setFilteredContacts] =
    useState<Contact[]>(contactsData);
  const [addContactModalVisible, setAddContactModalVisible] = useState(false);
  const [contactDetailModalVisible, setContactDetailModalVisible] =
    useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Add contact form state
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    confirmPhone: "",
    company: "",
    title: "",
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterAndSortContacts(text, selectedFilter, selectedSort);
  };

  const handleFilter = (filter: string) => {
    setSelectedFilter(filter);
    filterAndSortContacts(searchQuery, filter, selectedSort);
  };

  const handleSort = (sort: string) => {
    setSelectedSort(sort);
    filterAndSortContacts(searchQuery, selectedFilter, sort);
  };

  const filterAndSortContacts = (
    search: string,
    filter: string,
    sort: string
  ) => {
    let filtered = [...contactsData];

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(search.toLowerCase()) ||
          contact.email.toLowerCase().includes(search.toLowerCase()) ||
          contact.company.toLowerCase().includes(search.toLowerCase()) ||
          contact.phone.includes(search)
      );
    }

    // Status filter
    if (filter === "Active") {
      filtered = filtered.filter((contact) => contact.status === "active");
    } else if (filter === "Inactive") {
      filtered = filtered.filter((contact) => contact.status === "inactive");
    } else if (filter === "VIP") {
      filtered = filtered.filter((contact) => contact.tags.includes("VIP"));
    } else if (filter === "Hot Lead") {
      filtered = filtered.filter((contact) =>
        contact.tags.includes("Hot Lead")
      );
    }

    // Sort
    switch (sort) {
      case "A-Z":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Last Contact":
        filtered.sort(
          (a, b) =>
            new Date(b.lastContact).getTime() -
            new Date(a.lastContact).getTime()
        );
        break;
      case "Company":
        filtered.sort((a, b) => a.company.localeCompare(b.company));
        break;
      default: // Recent
        filtered.sort(
          (a, b) =>
            new Date(b.lastContact).getTime() -
            new Date(a.lastContact).getTime()
        );
    }

    setFilteredContacts(filtered);
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setContactDetailModalVisible(true);
  };

  const handleAddContact = () => {
    // Basic validation
    if (!newContact.name.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }

    if (!newContact.email.trim()) {
      Alert.alert("Error", "Please enter an email");
      return;
    }

    if (!newContact.phone.trim()) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }

    if (newContact.phone !== newContact.confirmPhone) {
      Alert.alert("Error", "Phone numbers do not match");
      return;
    }

    // Create new contact
    const contact: Contact = {
      id: (contactsData.length + 1).toString(),
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      company: newContact.company,
      title: newContact.title,
      status: "active",
      lastContact: new Date().toISOString().split("T")[0],
      tags: ["Regular"],
      source: "Manual",
    };

    // Add to contactsData
    contactsData.unshift(contact);

    // Update filtered contacts
    filterAndSortContacts(searchQuery, selectedFilter, selectedSort);

    // Reset form and close modal
    setNewContact({
      name: "",
      email: "",
      phone: "",
      confirmPhone: "",
      company: "",
      title: "",
    });
    setAddContactModalVisible(false);

    Alert.alert("Success", "Contact added successfully!");
  };

  const renderContact = (item: Contact) => (
    <TouchableOpacity
      key={item.id}
      style={{
        borderRadius: 16,
        padding: 16,
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 12,
      }}
      onPress={() => handleViewContact(item)}
      activeOpacity={0.7}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
            backgroundColor: item.status === "active" ? "#4CAF50" : "#FF9800",
          }}
        >
          <ThemedText type="title" style={{ color: "white", fontSize: 18 }}>
            {item.name.charAt(0)}
          </ThemedText>
        </View>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
              {item.name}
            </ThemedText>
            {item.tags.includes("VIP") && (
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#FFD700",
                }}
              >
                <Ionicons name="star" size={12} color="#333" />
              </View>
            )}
          </View>
          <ThemedText style={{ fontSize: 13, color: colors.textSecondary }}>
            {item.title} • {item.company}
          </ThemedText>
        </View>
        <TouchableOpacity style={{ padding: 4 }}>
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 12,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Ionicons
            name="mail-outline"
            size={16}
            color={colors.textSecondary}
          />
          <ThemedText
            style={{ fontSize: 14, color: colors.textSecondary, marginLeft: 8 }}
          >
            {item.email}
          </ThemedText>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="call-outline"
            size={16}
            color={colors.textSecondary}
          />
          <ThemedText
            style={{ fontSize: 14, color: colors.textSecondary, marginLeft: 8 }}
          >
            {item.phone}
          </ThemedText>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {item.tags.slice(0, 2).map((tag: string, index: number) => (
            <View
              key={index}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor: colors.primary + "20",
              }}
            >
              <ThemedText
                style={{
                  fontSize: 11,
                  fontWeight: "500",
                  color: colors.primary,
                }}
              >
                {tag}
              </ThemedText>
            </View>
          ))}
          {item.tags.length > 2 && (
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor: colors.border,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 11,
                  fontWeight: "500",
                  color: colors.textSecondary,
                }}
              >
                +{item.tags.length - 2}
              </ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={{ fontSize: 11, color: colors.textSecondary }}>
          Last contact: {new Date(item.lastContact).toLocaleDateString()}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View
          style={{
            padding: 20,
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <ThemedText type="title" style={{ color: colors.text }}>
              Contacts
            </ThemedText>
          </View>

          {/* Search Bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 12,
              marginBottom: 15,
              backgroundColor: colors.background,
            }}
          >
            <Ionicons
              name="search"
              size={20}
              color={colors.textSecondary}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={{ flex: 1, fontSize: 16, color: colors.text }}
              placeholder="Search contacts..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  marginRight: 8,
                  backgroundColor:
                    selectedFilter === filter
                      ? colors.primary + "20"
                      : colors.background,
                  borderColor:
                    selectedFilter === filter ? colors.primary : colors.border,
                }}
                onPress={() => handleFilter(filter)}
              >
                <ThemedText
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color:
                      selectedFilter === filter
                        ? colors.primary
                        : colors.textSecondary,
                  }}
                >
                  {filter}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sort Options */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <ThemedText
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                marginRight: 8,
              }}
            >
              Sort by:
            </ThemedText>
            {sortOptions.map((sort) => (
              <TouchableOpacity
                key={sort}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor:
                    selectedSort === sort
                      ? colors.primary + "20"
                      : "transparent",
                }}
                onPress={() => handleSort(sort)}
              >
                <ThemedText
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color:
                      selectedSort === sort
                        ? colors.primary
                        : colors.textSecondary,
                  }}
                >
                  {sort}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Summary */}
        <View
          style={{
            flexDirection: "row",
            paddingVertical: 15,
            paddingHorizontal: 20,
            marginHorizontal: 15,
            marginTop: 15,
            marginBottom: 15,
            borderRadius: 16,
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View style={{ flex: 1, alignItems: "center" }}>
            <ThemedText
              type="title"
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.primary,
              }}
            >
              {contactsData.length}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 11,
                marginTop: 4,
                color: colors.textSecondary,
              }}
            >
              Total
            </ThemedText>
          </View>
          <View
            style={{ width: 1, height: 30, backgroundColor: colors.border }}
          />
          <View style={{ flex: 1, alignItems: "center" }}>
            <ThemedText
              type="title"
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.success,
              }}
            >
              {contactsData.filter((c) => c.status === "active").length}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 11,
                marginTop: 4,
                color: colors.textSecondary,
              }}
            >
              Active
            </ThemedText>
          </View>
          <View
            style={{ width: 1, height: 30, backgroundColor: colors.border }}
          />
          <View style={{ flex: 1, alignItems: "center" }}>
            <ThemedText
              type="title"
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.warning,
              }}
            >
              {contactsData.filter((c) => c.tags.includes("VIP")).length}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 11,
                marginTop: 4,
                color: colors.textSecondary,
              }}
            >
              VIP
            </ThemedText>
          </View>
          <View
            style={{ width: 1, height: 30, backgroundColor: colors.border }}
          />
          <View style={{ flex: 1, alignItems: "center" }}>
            <ThemedText
              type="title"
              style={{ fontSize: 18, fontWeight: "bold", color: colors.info }}
            >
              {contactsData.filter((c) => c.tags.includes("Hot Lead")).length}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 11,
                marginTop: 4,
                color: colors.textSecondary,
              }}
            >
              Hot Leads
            </ThemedText>
          </View>
        </View>

        {/* Contacts List */}
        <View style={{ paddingHorizontal: 15 }}>
          <View style={{ marginBottom: 15 }}>
            <ThemedText type="subtitle" style={{ color: colors.text }}>
              Contacts ({filteredContacts.length})
            </ThemedText>
          </View>

          {filteredContacts.length > 0 ? (
            <View>{filteredContacts.map(renderContact)}</View>
          ) : (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 50,
              }}
            >
              <Ionicons
                name="people-outline"
                size={60}
                color={colors.textSecondary}
              />
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary, marginTop: 10 }}
              >
                No contacts found
              </ThemedText>
              <ThemedText
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginTop: 5,
                }}
              >
                Try changing your search or filter
              </ThemedText>
            </View>
          )}
        </View>

        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          right: 20,
          bottom: 30,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        }}
        onPress={() => setAddContactModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Add Contact Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addContactModalVisible}
        onRequestClose={() => setAddContactModalVisible(false)}
      >
        <View style={{ flex: 1 }}>
          {/* Background Overlay */}
          <TouchableWithoutFeedback
            onPress={() => setAddContactModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
              
               
              }}
            >
              {/* Modal Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <ThemedText type="title" style={{ color: colors.text }}>
                  Add New Contact
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setAddContactModalVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Scrollable Form */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={true}
                keyboardShouldPersistTaps="handled"
                style={{ flex: 1 }}
              >
                <View style={{ marginBottom: 15 }}>
                  <ThemedText
                    style={{
                      color: colors.text,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Full Name *
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 10,
                      padding: 12,
                      color: colors.text,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    placeholder="Enter full name"
                    placeholderTextColor={colors.textSecondary}
                    value={newContact.name}
                    onChangeText={(text) =>
                      setNewContact({ ...newContact, name: text })
                    }
                    returnKeyType="next"
                  />
                </View>

                <View style={{ marginBottom: 15 }}>
                  <ThemedText
                    style={{
                      color: colors.text,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Email Address *
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 10,
                      padding: 12,
                      color: colors.text,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    placeholder="Enter email address"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={newContact.email}
                    onChangeText={(text) =>
                      setNewContact({ ...newContact, email: text })
                    }
                    returnKeyType="next"
                  />
                </View>

                <View style={{ marginBottom: 15 }}>
                  <ThemedText
                    style={{
                      color: colors.text,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Phone Number *
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 10,
                      padding: 12,
                      color: colors.text,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                    value={newContact.phone}
                    onChangeText={(text) =>
                      setNewContact({ ...newContact, phone: text })
                    }
                    returnKeyType="next"
                  />
                </View>

                <View style={{ marginBottom: 15 }}>
                  <ThemedText
                    style={{
                      color: colors.text,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Confirm Phone Number *
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 10,
                      padding: 12,
                      color: colors.text,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    placeholder="Confirm phone number"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                    value={newContact.confirmPhone}
                    onChangeText={(text) =>
                      setNewContact({ ...newContact, confirmPhone: text })
                    }
                    returnKeyType="next"
                  />
                </View>

                <View style={{ marginBottom: 15 }}>
                  <ThemedText
                    style={{
                      color: colors.text,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Company
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 10,
                      padding: 12,
                      color: colors.text,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    placeholder="Enter company name"
                    placeholderTextColor={colors.textSecondary}
                    value={newContact.company}
                    onChangeText={(text) =>
                      setNewContact({ ...newContact, company: text })
                    }
                    returnKeyType="next"
                  />
                </View>

                <View style={{ marginBottom: 25 }}>
                  <ThemedText
                    style={{
                      color: colors.text,
                      marginBottom: 8,
                      fontWeight: "600",
                    }}
                  >
                    Job Title
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 10,
                      padding: 12,
                      color: colors.text,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    placeholder="Enter job title"
                    placeholderTextColor={colors.textSecondary}
                    value={newContact.title}
                    onChangeText={(text) =>
                      setNewContact({ ...newContact, title: text })
                    }
                    returnKeyType="done"
                    onSubmitEditing={handleAddContact}
                  />
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: "center",
                    marginBottom: 30, // Increased bottom margin for better scrolling
                  }}
                  onPress={handleAddContact}
                  activeOpacity={0.8}
                >
                  <ThemedText
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Add Contact
                  </ThemedText>
                </TouchableOpacity>

                {/* Extra padding at bottom for iOS safe area */}
                {Platform.OS === "ios" && <View style={{ height: 20 }} />}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Contact Detail Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={contactDetailModalVisible}
        onRequestClose={() => setContactDetailModalVisible(false)}
      >
        {/* Background Overlay */}
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
          {/* Modal Container */}
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <TouchableWithoutFeedback
              onPress={() => setContactDetailModalVisible(false)}
            >
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>

            <View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                maxHeight: "90%",
              }}
            >
              {selectedContact && (
                <>
                  {/* ================= HEADER (FIXED) ================= */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <ThemedText type="title" style={{ color: colors.text }}>
                      Contact Details
                    </ThemedText>

                    <TouchableOpacity
                      onPress={() => setContactDetailModalVisible(false)}
                    >
                      <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  {/* ================= SCROLLABLE CONTENT ================= */}
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 30 }}
                    scrollEnabled={true}
                    bounces={true}
                  >
                    {/* Avatar */}
                    <View style={{ alignItems: "center", marginBottom: 20 }}>
                      <View
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 40,
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: 15,
                          backgroundColor:
                            selectedContact.status === "active"
                              ? colors.success
                              : colors.warning,
                        }}
                      >
                        <ThemedText
                          type="title"
                          style={{ color: "white", fontSize: 32 }}
                        >
                          {selectedContact.name.charAt(0)}
                        </ThemedText>
                      </View>

                      <ThemedText
                        type="title"
                        style={{ fontSize: 22, color: colors.text }}
                      >
                        {selectedContact.name}
                      </ThemedText>

                      <ThemedText
                        style={{
                          color: colors.textSecondary,
                          marginTop: 5,
                        }}
                      >
                        {selectedContact.title} at {selectedContact.company}
                      </ThemedText>
                    </View>

                    {/* Contact Information */}
                    <View style={{ marginBottom: 25 }}>
                      <ThemedText
                        type="subtitle"
                        style={{ marginBottom: 15, color: colors.text }}
                      >
                        Contact Information
                      </ThemedText>

                      {/* Email */}
                      <View
                        style={{
                          flexDirection: "row",
                          marginBottom: 12,
                          alignItems: "center",
                        }}
                      >
                        <Ionicons
                          name="mail-outline"
                          size={20}
                          color={colors.primary}
                          style={{ marginRight: 10 }}
                        />
                        <View>
                          <ThemedText
                            style={{
                              fontSize: 12,
                              color: colors.textSecondary,
                            }}
                          >
                            Email
                          </ThemedText>
                          <ThemedText style={{ color: colors.text }}>
                            {selectedContact.email}
                          </ThemedText>
                        </View>
                      </View>

                      {/* Phone */}
                      <View
                        style={{
                          flexDirection: "row",
                          marginBottom: 12,
                          alignItems: "center",
                        }}
                      >
                        <Ionicons
                          name="call-outline"
                          size={20}
                          color={colors.primary}
                          style={{ marginRight: 10 }}
                        />
                        <View>
                          <ThemedText
                            style={{
                              fontSize: 12,
                              color: colors.textSecondary,
                            }}
                          >
                            Phone
                          </ThemedText>
                          <ThemedText style={{ color: colors.text }}>
                            {selectedContact.phone}
                          </ThemedText>
                        </View>
                      </View>

                      {/* Company */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons
                          name="business-outline"
                          size={20}
                          color={colors.primary}
                          style={{ marginRight: 10 }}
                        />
                        <View>
                          <ThemedText
                            style={{
                              fontSize: 12,
                              color: colors.textSecondary,
                            }}
                          >
                            Company
                          </ThemedText>
                          <ThemedText style={{ color: colors.text }}>
                            {selectedContact.company}
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    {/* Additional Details */}
                    <View style={{ marginBottom: 25 }}>
                      <ThemedText
                        type="subtitle"
                        style={{ marginBottom: 15, color: colors.text }}
                      >
                        Additional Details
                      </ThemedText>

                      {/* Status + Last Contact */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingBottom: 15,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                          marginBottom: 15,
                        }}
                      >
                        <View>
                          <ThemedText
                            style={{
                              fontSize: 12,
                              color: colors.textSecondary,
                            }}
                          >
                            Status
                          </ThemedText>

                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginTop: 6,
                            }}
                          >
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor:
                                  selectedContact.status === "active"
                                    ? colors.success
                                    : colors.warning,
                                marginRight: 6,
                              }}
                            />
                            <ThemedText
                              style={{
                                fontSize: 12,
                                fontWeight: "600",
                                color:
                                  selectedContact.status === "active"
                                    ? colors.success
                                    : colors.warning,
                              }}
                            >
                              {selectedContact.status.toUpperCase()}
                            </ThemedText>
                          </View>
                        </View>

                        <View style={{ alignItems: "flex-end" }}>
                          <ThemedText
                            style={{
                              fontSize: 12,
                              color: colors.textSecondary,
                            }}
                          >
                            Last Contact
                          </ThemedText>
                          <ThemedText style={{ color: colors.text }}>
                            {new Date(
                              selectedContact.lastContact
                            ).toLocaleDateString()}
                          </ThemedText>
                        </View>
                      </View>

                      {/* Tags */}
                      <View style={{ marginBottom: 15 }}>
                        <ThemedText
                          style={{
                            fontSize: 12,
                            color: colors.textSecondary,
                            marginBottom: 8,
                          }}
                        >
                          Tags
                        </ThemedText>

                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          {selectedContact.tags.map((tag, index) => (
                            <View
                              key={index}
                              style={{
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 12,
                                backgroundColor: colors.primary + "20",
                              }}
                            >
                              <ThemedText
                                style={{
                                  fontSize: 12,
                                  fontWeight: "500",
                                  color: colors.primary,
                                }}
                              >
                                {tag}
                              </ThemedText>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Source */}
                      <View>
                        <ThemedText
                          style={{
                            fontSize: 12,
                            color: colors.textSecondary,
                            marginBottom: 8,
                          }}
                        >
                          Source
                        </ThemedText>

                        <View
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 12,
                            backgroundColor: colors.border,
                            alignSelf: "flex-start",
                          }}
                        >
                          <ThemedText
                            style={{
                              fontSize: 12,
                              fontWeight: "600",
                              color: colors.text,
                            }}
                          >
                            {selectedContact.source}
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 12,
                        marginTop: 10,
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: colors.primary,
                          padding: 16,
                          borderRadius: 12,
                          alignItems: "center",
                        }}
                      >
                        <ThemedText
                          style={{
                            color: "white",
                            fontSize: 16,
                            fontWeight: "600",
                          }}
                        >
                          Message
                        </ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: colors.border,
                          padding: 16,
                          borderRadius: 12,
                          alignItems: "center",
                        }}
                      >
                        <ThemedText
                          style={{
                            color: colors.text,
                            fontSize: 16,
                            fontWeight: "600",
                          }}
                        >
                          Call
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
