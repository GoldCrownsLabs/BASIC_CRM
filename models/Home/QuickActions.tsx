import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { Link, Href } from "expo-router"; // Import Href type
import { useAppTheme } from "@/context/ThemeContext";

export const QuickActions: React.FC = () => {
  const { colors } = useAppTheme();

  const actions: Array<{
    title: string;
    icon: string;
    color: string;
    href: Href; // Use Href type
  }> = [
    {
      title: "Add Contact",
      icon: "person-add",
      color: colors.primary,
      href: "/(tabs)/contacts",
    },
    {
      title: "Add Lead",
      icon: "trending-up",
      color: "#4CAF50",
      href: "/(tabs)/leads",
    },
    {
      title: "Add Task",
      icon: "checkmark-circle",
      color: "#FF9800",
      href: "/(tabs)/tasks",
    },
    {
      title: "Log Activity",
      icon: "calendar",
      color: "#9C27B0",
      href: "/activities",
    },
  ];

  return (
    <ThemedView
      style={{
        marginHorizontal: 15,
        marginTop: 15,
        padding: 20,
        borderRadius: 20,
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
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
        <ThemedText type="subtitle" style={{ color: colors.text }}>
          Quick Actions
        </ThemedText>
        <TouchableOpacity>
          <ThemedText type="link" style={{ color: colors.primary }}>
            View All
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {actions.map((action) => (
          <Link href={action.href} asChild key={action.title}>
            <TouchableOpacity
              style={{
                width: "48%",
                padding: 16,
                borderRadius: 14,
                alignItems: "center",
                backgroundColor: action.color + "15",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 8,
                  backgroundColor: action.color,
                }}
              >
                <Ionicons name={action.icon as any} size={20} color="white" />
              </View>
              <ThemedText
                type="defaultSemiBold"
                style={{
                  fontSize: 13,
                  textAlign: "center",
                  color: action.color,
                }}
              >
                {action.title}
              </ThemedText>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </ThemedView>
  );
};
