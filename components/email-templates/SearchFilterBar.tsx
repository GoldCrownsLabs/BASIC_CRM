// components/email-templates/components/SearchFilterBar.tsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { templateCategories } from "./constants";
import { createStyles } from "./styles";


interface Props {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  favoritesOnly: boolean;
  onFavoritesToggle: () => void;
  onCreatePress: () => void;
}

export const SearchFilterBar: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  favoritesOnly,
  onFavoritesToggle,
  onCreatePress,
}) => {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Feather name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search templates..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <Feather name="x" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            {templateCategories.map((category) => {
              const isSelected = selectedCategory === category.id;
              const bgColor = isSelected
                ? category.color
                : isDark
                  ? colors.border
                  : "#f0f0f0";

              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: bgColor,
                      borderWidth: isSelected ? 0 : 1,
                    },
                  ]}
                  onPress={() => onCategoryChange(category.id)}
                >
                  {category.id !== "all" && (
                    <Feather
                      name={category.icon as any}
                      size={14}
                      color={isSelected ? "#fff" : category.color}
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: isSelected ? "#fff" : colors.textSecondary,
                    }}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.favoriteFilterButton,
            {
              backgroundColor: favoritesOnly
                ? colors.warning + "20"
                : isDark
                  ? colors.border
                  : "#f0f0f0",
              borderColor: favoritesOnly ? colors.warning : colors.border,
            },
          ]}
          onPress={onFavoritesToggle}
        >
          <Feather
            name="star"
            size={18}
            color={favoritesOnly ? colors.warning : colors.textSecondary}
            fill={favoritesOnly ? colors.warning : "transparent"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.createButton} onPress={onCreatePress}>
          <Feather name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
