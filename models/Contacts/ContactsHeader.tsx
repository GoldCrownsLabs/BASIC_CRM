import React, { useState } from "react";
import { View, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface ContactsHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  filters: string[];
  sortOptions: string[];
}

export default function ContactsHeader({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  selectedSort,
  onSortChange,
  filters,
  sortOptions,
}: ContactsHeaderProps) {
  const { colors } = useAppTheme();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
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
          borderWidth: 1,
          borderColor: isSearchFocused ? colors.primary : colors.border,
        }}
      >
        <Ionicons
          name="search"
          size={20}
          color={colors.textSecondary}
          style={{ marginRight: 10 }}
        />
        <TextInput
          style={{
            flex: 1,
            fontSize: 16,
            color: colors.text,
            minHeight: 20,
          }}
          placeholder="Search by name, email, phone, company..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange("")}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
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
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {filters.map((filter) => {
          // Special icons for some filters
          const getFilterIcon = () => {
            switch (filter) {
              case "Favorites":
                return "star";
              case "VIP":
                return "star";
              case "Hot Lead":
                return "flame";
              case "Website":
                return "globe-outline";
              case "Referral":
                return "people-outline";
              case "Social":
                return "logo-twitter";
              case "Event":
                return "calendar-outline";
              default:
                return null;
            }
          };

          const icon = getFilterIcon();

          return (
            <TouchableOpacity
              key={filter}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
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
              onPress={() => onFilterChange(filter)}
            >
              {icon && (
                <Ionicons
                  name={icon as any}
                  size={14}
                  color={
                    selectedFilter === filter
                      ? colors.primary
                      : colors.textSecondary
                  }
                  style={{ marginRight: 4 }}
                />
              )}
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
          );
        })}
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="funnel-outline"
            size={14}
            color={colors.textSecondary}
            style={{ marginRight: 4 }}
          />
          <ThemedText
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              marginRight: 8,
            }}
          >
            Sort by:
          </ThemedText>
        </View>
        {sortOptions.map((sort) => {
          // Special icons for sort options
          const getSortIcon = () => {
            switch (sort) {
              case "Recent":
                return "time-outline";
              case "A-Z":
                return "arrow-down-outline";
              case "Z-A":
                return "arrow-up-outline";
              case "Last Contact":
                return "chatbubble-outline";
              case "Company":
                return "business-outline";
              case "Recently Modified":
                return "create-outline";
              default:
                return null;
            }
          };

          const icon = getSortIcon();

          return (
            <TouchableOpacity
              key={sort}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor:
                  selectedSort === sort ? colors.primary + "20" : "transparent",
              }}
              onPress={() => onSortChange(sort)}
            >
              {icon && (
                <Ionicons
                  name={icon as any}
                  size={12}
                  color={
                    selectedSort === sort
                      ? colors.primary
                      : colors.textSecondary
                  }
                  style={{ marginRight: 4 }}
                />
              )}
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
          );
        })}
      </View>
    </View>
  );
}
