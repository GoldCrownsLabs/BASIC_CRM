// components/notification-modal.tsx
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useAppTheme();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Welcome to the App!",
      message: "Thank you for joining us. Start exploring features.",
      time: "2 hours ago",
      read: false,
      type: "info",
    },
    {
      id: "2",
      title: "Profile Updated",
      message: "Your profile information has been successfully updated.",
      time: "1 day ago",
      read: true,
      type: "success",
    },
    {
      id: "3",
      title: "Meeting Reminder",
      message: "Team meeting scheduled for tomorrow at 10:00 AM.",
      time: "2 days ago",
      read: false,
      type: "warning",
    },
    {
      id: "4",
      title: "Payment Received",
      message: "Your payment of $299 has been confirmed.",
      time: "3 days ago",
      read: true,
      type: "success",
    },
    {
      id: "5",
      title: "System Maintenance",
      message: "Scheduled maintenance on Sunday from 2:00 AM to 4:00 AM.",
      time: "1 week ago",
      read: true,
      type: "info",
    },
  ]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "warning":
        return "warning";
      case "error":
        return "alert-circle";
      default:
        return "information-circle";
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return colors.success;
      case "warning":
        return colors.warning;
      case "error":
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.background,
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleContainer}>
              <ThemedText type="title" style={{ color: colors.text }}>
                Notifications
              </ThemedText>
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <ThemedText
                  style={{
                    color: colors.background,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {notifications.filter((n) => !n.read).length}
                </ThemedText>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={markAllAsRead}
              style={[styles.actionButton, { backgroundColor: colors.card }]}
            >
              <Ionicons name="checkmark-done" size={20} color={colors.text} />
              <ThemedText
                style={{
                  color: colors.text,
                  fontSize: 14,
                  marginLeft: 6,
                }}
              >
                Mark all read
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={clearAll}
              style={[styles.actionButton, { backgroundColor: colors.card }]}
            >
              <Ionicons name="trash" size={20} color={colors.error} />
              <ThemedText
                style={{
                  color: colors.error,
                  fontSize: 14,
                  marginLeft: 6,
                }}
              >
                Clear all
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Notifications List */}
          <ScrollView
            style={styles.notificationsList}
            showsVerticalScrollIndicator={false}
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="notifications-off"
                  size={64}
                  color={colors.textSecondary}
                  style={styles.emptyIcon}
                />
                <ThemedText
                  type="subtitle"
                  style={{ color: colors.textSecondary, textAlign: "center" }}
                >
                  No notifications
                </ThemedText>
                <ThemedText
                  style={{
                    color: colors.textSecondary,
                    textAlign: "center",
                    marginTop: 8,
                  }}
                >
                  You&apos;re all caught up!
                </ThemedText>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    {
                      backgroundColor: colors.card,
                      borderLeftColor: getNotificationColor(notification.type),
                      opacity: notification.read ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => markAsRead(notification.id)}
                >
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <View style={styles.titleContainer}>
                        <Ionicons
                          name={getNotificationIcon(notification.type)}
                          size={20}
                          color={getNotificationColor(notification.type)}
                          style={styles.notificationIcon}
                        />
                        <ThemedText
                          style={[
                            styles.notificationTitle,
                            {
                              color: colors.text,
                              fontWeight: notification.read ? "normal" : "600",
                            },
                          ]}
                        >
                          {notification.title}
                        </ThemedText>
                      </View>
                      {!notification.read && (
                        <View
                          style={[
                            styles.unreadDot,
                            { backgroundColor: colors.primary },
                          ]}
                        />
                      )}
                    </View>

                    <ThemedText
                      style={[
                        styles.notificationMessage,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={2}
                    >
                      {notification.message}
                    </ThemedText>

                    <View style={styles.notificationFooter}>
                      <ThemedText
                        style={[
                          styles.notificationTime,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {notification.time}
                      </ThemedText>
                      <TouchableOpacity
                        style={styles.moreButton}
                        onPress={() => markAsRead(notification.id)}
                      >
                        <ThemedText
                          style={{
                            color: colors.primary,
                            fontSize: 14,
                            fontWeight: "600",
                          }}
                        >
                          {notification.read ? "Read" : "Mark as read"}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "85%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 0.48,
    justifyContent: "center",
  },
  notificationsList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.5,
  },
  notificationItem: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  notificationIcon: {
    marginRight: 10,
  },
  notificationTitle: {
    fontSize: 16,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 6,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationTime: {
    fontSize: 12,
  },
  moreButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
