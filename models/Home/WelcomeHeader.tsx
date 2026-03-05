// welcome-header.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

import { useNotifications } from "@/hooks/useNotifications";
import { NotificationModal } from "../Notifications/Notification-modal";

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
  const { colors, theme } = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const prevCountRef = useRef(0);

  const { unreadCount, loading, refresh } = useNotifications();

  const translateY = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setHasNewNotification(true);
      triggerNotificationAnimation();

      setTimeout(() => {
        setHasNewNotification(false);
      }, 3000);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  const triggerNotificationAnimation = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (unreadCount > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [unreadCount]);

  const handleModalClose = () => {
    setModalVisible(false);
    setTimeout(() => {
      refresh();
    }, 300);
  };

  const handleNotificationPress = () => {
    refresh();
    setModalVisible(true);
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Gradient Overlay for better look */}
        <LinearGradient
          colors={
            theme === "dark"
              ? ["rgba(98,0,234,0.1)", "transparent"]
              : ["rgba(98,0,234,0.05)", "transparent"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientOverlay}
        />

        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <ThemedText
              style={[styles.greetingText, { color: colors.textSecondary }]}
            >
              {greeting}
            </ThemedText>

            <ThemedText style={[styles.userName, { color: colors.text }]}>
              {userName?.split(" ")[0] || "User"}
            </ThemedText>

            <View
              style={[
                styles.dateContainer,
                {
                  backgroundColor:
                    theme === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(98,0,234,0.1)",
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={14}
                color={colors.primary}
                style={styles.calendarIcon}
              />
              <ThemedText style={[styles.dateText, { color: colors.primary }]}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </ThemedText>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleNotificationPress}
            activeOpacity={0.7}
            style={[
              styles.notificationButton,
              {
                backgroundColor:
                  unreadCount > 0
                    ? colors.primary + "20"
                    : theme === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : colors.primary + "10",
                borderColor:
                  unreadCount > 0 ? colors.primary + "40" : "transparent",
              },
            ]}
          >
            <Ionicons
              name={unreadCount > 0 ? "notifications" : "notifications-outline"}
              size={24}
              color={unreadCount > 0 ? colors.primary : colors.textSecondary}
            />

            {/* Animated Badge */}
            {unreadCount > 0 && !loading && (
              <Animated.View
                style={[
                  styles.badgeContainer,
                  {
                    backgroundColor: hasNewNotification
                      ? colors.error || "#FF3B30"
                      : colors.primary,
                    transform: [{ scale: pulseAnim }],
                    shadowColor: hasNewNotification
                      ? colors.error || "#FF3B30"
                      : colors.primary,
                  },
                ]}
              >
                <ThemedText style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </ThemedText>

                {/* New Notification Indicator */}
                {hasNewNotification && (
                  <View style={styles.newNotificationDot} />
                )}
              </Animated.View>
            )}

            {/* Loading Indicator */}
            {loading && (
              <View
                style={[
                  styles.loadingIndicator,
                  {
                    borderColor: colors.primary,
                    borderTopColor: "transparent",
                  },
                ]}
              />
            )}

            {/* Empty State Dot */}
            {unreadCount === 0 && !loading && (
              <View style={[styles.emptyDot, { backgroundColor: "#4CD964" }]} />
            )}
          </TouchableOpacity>
        </View>

        {/* Status Bar */}
        <View
          style={[
            styles.statusContainer,
            {
              borderTopColor:
                theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            },
          ]}
        >
          <View style={styles.statusItem}>
            <Ionicons
              name={
                unreadCount > 0 ? "notifications-circle" : "checkmark-circle"
              }
              size={16}
              color={unreadCount > 0 ? colors.primary : "#4CD964"}
            />
            <ThemedText
              style={[
                styles.statusText,
                {
                  color: unreadCount > 0 ? colors.primary : "#4CD964",
                  fontWeight: unreadCount > 0 ? "600" : "500",
                },
              ]}
            >
              {unreadCount === 0 ? "✨ All caught up" : `${unreadCount} unread`}
            </ThemedText>
          </View>

          <TouchableOpacity
            onPress={refresh}
            style={[
              styles.refreshButton,
              {
                backgroundColor:
                  theme === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(98,0,234,0.1)",
              },
            ]}
          >
            <Ionicons name="refresh" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Notification Modal - Exactly as original */}
      <NotificationModal visible={modalVisible} onClose={handleModalClose} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
    position: "relative",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    borderRadius: 24,
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  greetingText: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  userName: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  calendarIcon: {
    marginRight: 6,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "600",
  },
  notificationButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeContainer: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  loadingIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  emptyDot: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    marginLeft: 6,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
  },
  newNotificationDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
