import React from "react";
import { View, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";

interface StatsCardProps {
  title: string;
  value: string | number;
  iconName: any;
  iconColor: string;
  backgroundColor: string;
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  iconName,
  iconColor,
  backgroundColor,
  loading = false,
}) => {
  return (
    <View
      style={{
        width: "100%",
        padding: 15,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: "center",
        backgroundColor: backgroundColor,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 10,
          backgroundColor: iconColor + "20",
        }}
      >
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <>
          <ThemedText
            type="title"
            style={{
              fontSize: 24,
              fontWeight: "700",
              marginBottom: 4,
              color: iconColor,
            }}
          >
            {value}
          </ThemedText>
          <ThemedText type="default" style={{ color: "rgba(0,0,0,0.6)" }}>
            {title}
          </ThemedText>
        </>
      )}
    </View>
  );
};
