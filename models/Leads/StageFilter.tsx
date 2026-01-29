import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";

interface Stage {
  id: string;
  label: string;
  color: string;
  count: number;
  totalValue: number;
}

interface StageFilterProps {
  stages: Stage[];
  selectedStage: string;
  onSelectStage: (stage: string) => void;
  formatCurrency: (amount: number) => string;
}

export const StageFilter: React.FC<StageFilterProps> = ({
  stages,
  selectedStage,
  onSelectStage,
  formatCurrency,
}) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        padding: 10,
        borderRadius: 12,
        backgroundColor: colors.background,
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {stages.map((stage) => (
        <TouchableOpacity
          key={stage.id}
          style={{
            alignItems: "center",
            padding: 8,
            borderRadius: 10,
            borderWidth: 1,
            minWidth: 80,
            backgroundColor:
              selectedStage === stage.label ? stage.color + "20" : colors.card,
            borderColor: stage.color,
          }}
          onPress={() => onSelectStage(stage.label)}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginBottom: 6,
              backgroundColor: stage.color,
            }}
          />
          <ThemedText
            style={{
              color: colors.text,
              fontSize: 10,
              fontWeight: "500",
              marginBottom: 4,
            }}
          >
            {stage.label}
          </ThemedText>
          <ThemedText
            style={{
              color: stage.color,
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 2,
            }}
          >
            {stage.count}
          </ThemedText>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 9 }}>
            {formatCurrency(stage.totalValue)}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
};
