// welcome-header.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, Animated } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { NotificationModal } from "../Notifications/notification-modal";


interface WelcomeHeaderProps {
  greeting: string;
  userName: string;
  fadeAnim: Animated.Value;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  greeting,
  userName,
  fadeAnim,
}) => {
  const { colors } = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Create interpolated value for translateY
  const translateY = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <>
      <Animated.View
        style={{
          padding: 20,
          marginHorizontal: 15,
          marginTop: 15,
          borderRadius: 20,
          backgroundColor: colors.card,
          opacity: fadeAnim,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          transform: [{ translateY }],
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View>
            <ThemedText type="subtitle" style={{ color: colors.textSecondary }}>
              {greeting}
            </ThemedText>
            <ThemedText
              type="title"
              style={{
                color: colors.textSecondary,
                fontSize: 22,
                fontWeight: "600",
              }}
            >
              {(userName?.split(" ")[0] || "User").toUpperCase()}
            </ThemedText>
          </View>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              backgroundColor: colors.primary + "15",
            }}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.primary}
            />
            <View
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.error,
              }}
            />
          </TouchableOpacity>
        </View>

        <ThemedText
          type="default"
          style={{ color: colors.textSecondary, marginTop: 4 }}
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </ThemedText>
      </Animated.View>

      <NotificationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};
