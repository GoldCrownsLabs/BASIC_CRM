// components/email-templates/components/TemplateCard.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useAppTheme } from "@/context/ThemeContext";
import { Template } from "./emailtypes";
import { createStyles } from "./styles";


interface Props {
  template: Template;
  onPress: (template: Template) => void;
  onFavoritePress: (id: string) => void;
  categoryColor: string;
}

// Card component for displaying individual email templates in the list

export const TemplateCard: React.FC<Props> = ({
  template,
  onPress,
  onFavoritePress,
  categoryColor,
}) => {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);

  return (
    <TouchableOpacity
      onPress={() => onPress(template)}
      activeOpacity={0.7}
      style={styles.templateCard}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <View
              style={[
                styles.categoryIconContainer,
                { backgroundColor: categoryColor + "20" },
              ]}
            >
              <Feather name="mail" size={14} color={categoryColor} />
            </View>
            <Text style={styles.templateName}>{template.name}</Text>
          </View>

          <Text style={styles.templateDescription} numberOfLines={2}>
            {template.description}
          </Text>

          <Text style={styles.templateSubject} numberOfLines={1}>
            Subject: {template.subject}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onFavoritePress(template.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather
            name="star"
            size={20}
            color={template.isFavorite ? colors.warning : colors.textSecondary}
            fill={template.isFavorite ? colors.warning : "transparent"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.useCountContainer}>
          <Feather name="hash" size={12} color={colors.textSecondary} />
          <Text style={styles.useCountText}>
            Used {template.useCount} times
          </Text>
        </View>

        <View style={styles.tagsContainer}>
          {template.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {template.tags.length > 2 && (
            <Text style={styles.tagText}>+{template.tags.length - 2}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
