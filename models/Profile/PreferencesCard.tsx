import React from "react";
import { View } from "react-native";
import { Text } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

interface PreferencesCardProps {
  user: any;
}

export const PreferencesCard: React.FC<PreferencesCardProps> = ({ user }) => {
  const { colors } = useAppTheme();

  if (user?.newsletterSubscription === undefined) return null;

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.text,
          marginBottom: 12,
        }}
      >
        Preferences
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 12,
        }}
      >
        <Text style={{ fontSize: 14, color: colors.text }}>
          Newsletter Subscription
        </Text>
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: user.newsletterSubscription
              ? `${colors.success}20`
              : `${colors.error}20`,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: user.newsletterSubscription
                ? colors.success
                : colors.error,
            }}
          >
            {user.newsletterSubscription ? "Subscribed" : "Not Subscribed"}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 14, color: colors.text }}>
          Theme Preference
        </Text>
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: `${colors.primary}20`,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: colors.primary,
            }}
          >
            {user?.theme
              ? user.theme.charAt(0).toUpperCase() + user.theme.slice(1)
              : "Light"}
          </Text>
        </View>
      </View>
    </View>
  );
};
