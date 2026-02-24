// components/email-templates/components/EmptyState.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { createStyles } from "./styles";


interface Props {
  onReset: () => void;
}

export const EmptyState: React.FC<Props> = ({ onReset }) => {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIcon}>
        <Feather name="mail" size={36} color={colors.textSecondary} />
      </View>
      <Text style={styles.emptyStateTitle}>No templates found</Text>
      <Text style={styles.emptyStateText}>
        Try changing your search or filter criteria
      </Text>
      <TouchableOpacity style={styles.resetButton} onPress={onReset}>
        <Feather name="refresh-cw" size={18} color="#ffffff" />
        <Text style={styles.resetButtonText}>Reset Filters</Text>
      </TouchableOpacity>
    </View>
  );
};
