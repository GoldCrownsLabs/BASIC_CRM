// welcome-header.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

import { useNotifications } from "@/hooks/useNotifications"; // ✅ Naya hook
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
  const { colors } = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const prevCountRef = useRef(0);

  // ✅ Use custom hook - refreshCount ko refresh mein badal diya
  const { unreadCount, loading, refresh } = useNotifications();

  // Create interpolated value for translateY
  const translateY = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  // Detect new notifications
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      // New notification arrived
      setHasNewNotification(true);
      triggerNotificationAnimation();

      // Reset after 3 seconds
      setTimeout(() => {
        setHasNewNotification(false);
      }, 3000);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  // Trigger animation for new notifications
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

  // Continuous subtle pulse for unread notifications
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
    // Refresh count after modal closes
    setTimeout(() => {
      refresh(); // ✅ refreshCount → refresh
    }, 300);
  };

  const handleNotificationPress = () => {
    // Refresh before opening
    refresh(); // ✅ refreshCount → refresh
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
            <View style={styles.dateContainer}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={colors.textSecondary}
                style={styles.calendarIcon}
              />
              <ThemedText
                style={[styles.dateText, { color: colors.textSecondary }]}
              >
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
                    : colors.primary + "10",
                borderColor:
                  unreadCount > 0 ? colors.primary + "40" : "transparent",
              },
            ]}
          >
            <Ionicons
              name={unreadCount > 0 ? "notifications" : "notifications-outline"}
              size={22}
              color={unreadCount > 0 ? colors.primary : colors.textSecondary}
            />

            {/* Animated Badge */}
            {unreadCount > 0 && !loading && (
              <Animated.View
                style={[
                  styles.badgeContainer,
                  {
                    backgroundColor: hasNewNotification
                      ? colors.error
                      : colors.primary,
                    transform: [{ scale: pulseAnim }],
                    shadowColor: hasNewNotification
                      ? colors.error
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

            {/* Empty State */}
            {unreadCount === 0 && !loading && (
              <View
                style={[
                  styles.emptyDot,
                  { backgroundColor: colors.textSecondary + "40" },
                ]}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Status Bar */}
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Ionicons
              name="notifications"
              size={14}
              color={unreadCount > 0 ? colors.primary : colors.textSecondary}
            />
            <ThemedText
              style={[
                styles.statusText,
                {
                  color:
                    unreadCount > 0 ? colors.primary : colors.textSecondary,
                  fontWeight: unreadCount > 0 ? "600" : "400",
                },
              ]}
            >
              {unreadCount === 0 ? "All caught up" : `${unreadCount} unread`}
            </ThemedText>
          </View>

          {/* ✅ Refresh button bhi update kiya */}
          <TouchableOpacity onPress={refresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

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
    fontWeight: "500",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    marginRight: 6,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "500",
  },
  notificationButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    position: "relative",
  },
  badgeContainer: {
    position: "absolute",
    top: 6,
    right: 6,
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
    elevation: 3,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  badgeGlow: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    zIndex: -1,
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
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
  },
  refreshButton: {
    padding: 4,
  },
  newNotificationDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF0000",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
});
