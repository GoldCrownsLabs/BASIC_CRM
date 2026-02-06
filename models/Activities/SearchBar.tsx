import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SearchBarProps {
  search: string;
  colors: any;
  isDark: boolean;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  search,
  colors,
  isDark,
  onSearchChange,
  onClearSearch,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: isDark ? colors.card : "#F9FAFB",
      }}
    >
      <Feather
        name="search"
        size={20}
        color={colors.textSecondary}
        style={{ marginRight: 12 }}
      />
      <TextInput
        style={{
          flex: 1,
          fontSize: 16,
          padding: 0,
          color: colors.text,
        }}
        placeholder="Search by title, contact, or company..."
        placeholderTextColor={colors.textSecondary}
        value={search}
        onChangeText={onSearchChange}
      />
      {search.length > 0 && (
        <TouchableOpacity onPress={onClearSearch}>
          <Feather name="x" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
