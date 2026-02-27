import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface ContactsHeaderProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  filters: string[];
}

export default function ContactsHeader({
  selectedFilter,
  onFilterChange,
  selectedSort,
  onSortChange,
  filters,
}: ContactsHeaderProps) {
  const { colors } = useAppTheme();

  // ✅ Only 3 Sort Options
  const sortOptions = ["Recent", "A-Z", "Z-A"];

  return (
    <View
      style={{
        padding: 20,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* Header Title */}
      <View
        style={{
          marginBottom: 15,
        }}
      >
        <ThemedText type="title" style={{ color: colors.text }}>
          Contacts
        </ThemedText>
      </View>

      {/* Quick Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {filters.map((filter) => {
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
          const getSortIcon = () => {
            switch (sort) {
              case "Recent":
                return "time-outline";
              case "A-Z":
                return "arrow-down-outline";
              case "Z-A":
                return "arrow-up-outline";
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
                marginRight: 8,
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
