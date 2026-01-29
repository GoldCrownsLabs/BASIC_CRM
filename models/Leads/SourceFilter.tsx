import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { leadSources } from "@/data/leads";

interface SourceFilterProps {
  selectedSource: string;
  onSelectSource: (source: string) => void;
}

export const SourceFilter: React.FC<SourceFilterProps> = ({
  selectedSource,
  onSelectSource,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={{ marginBottom: 12 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 40 }}
      >
        <TouchableOpacity
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            marginRight: 8,
            backgroundColor:
              selectedSource === "All"
                ? colors.primary + "20"
                : colors.background,
            borderColor:
              selectedSource === "All" ? colors.primary : colors.border,
          }}
          onPress={() => onSelectSource("All")}
        >
          <ThemedText
            style={{
              color:
                selectedSource === "All"
                  ? colors.primary
                  : colors.textSecondary,
              fontSize: 13,
              fontWeight: "500",
            }}
          >
            All Sources
          </ThemedText>
        </TouchableOpacity>

        {leadSources.map((source) => (
          <TouchableOpacity
            key={source}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              marginRight: 8,
              backgroundColor:
                selectedSource === source
                  ? colors.primary + "20"
                  : colors.background,
              borderColor:
                selectedSource === source ? colors.primary : colors.border,
            }}
            onPress={() => onSelectSource(source)}
          >
            <ThemedText
              style={{
                color:
                  selectedSource === source
                    ? colors.primary
                    : colors.textSecondary,
                fontSize: 13,
                fontWeight: "500",
              }}
            >
              {source.charAt(0).toUpperCase() + source.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
