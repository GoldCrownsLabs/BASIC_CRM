// components/notification-modal.tsx
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

// Import ALL notification APIs from your file
import {
  fetchNotifications,
  markAsRead as markAsReadApi,
  markAllAsRead as markAllAsReadApi,
  deleteNotification as deleteNotificationApi,
  clearAllNotifications as clearAllNotificationsApi,
  sendTestNotification as sendTestNotificationApi,
  fetchUnreadCount,
  type Notification as ApiNotification,
} from "@/lib/api/notifications";

// Use the imported ApiNotification type
interface Notification extends ApiNotification {
  // Add any additional fields if needed
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load notifications from API
  const loadNotifications = async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setPage(1);
      } else if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Call the API
      const response = await fetchNotifications(
        refresh ? 1 : page,
        20,
      );

      // Check if response has success property
      if (response.success) {
        const notificationsData = response.notifications || [];
        const totalUnread = response.unreadCount || 0;
        const hasMoreData = response.pagination?.hasMore || false;

        if (refresh) {
          setNotifications(notificationsData);
        } else {
          setNotifications((prev) => [...prev, ...notificationsData]);
        }

        setUnreadCount(totalUnread);
        setHasMore(hasMoreData);

        if (!refresh && hasMoreData) {
          setPage((prev) => prev + 1);
        }
      } else {
        Alert.alert("Error", "Failed to load notifications");
      }
    } catch (error: any) {
      console.error("Failed to load notifications:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to load notifications. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Load unread count separately
  const loadUnreadCount = async () => {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await markAsReadApi(id);

      if (response.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === id
              ? { ...notification, read: true }
              : notification,
          ),
        );
        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        Alert.alert("Error", response.message || "Failed to mark as read");
      }
    } catch (error: any) {
      console.error("Failed to mark as read:", error);
      Alert.alert("Error", "Failed to mark notification as read");
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllAsReadApi();

      if (response.success) {
        // Update all notifications to read
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true })),
        );
        // Reset unread count
        setUnreadCount(0);
        Alert.alert(
          "Success",
          response.message || "All notifications marked as read",
        );
      } else {
        Alert.alert("Error", response.message || "Failed to mark all as read");
      }
    } catch (error: any) {
      console.error("Failed to mark all as read:", error);
      Alert.alert("Error", "Failed to mark all as read");
    }
  };

  // Delete single notification
  const handleDeleteNotification = async (id: string) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await deleteNotificationApi(id);

              if (response.success) {
                // Remove from local state
                setNotifications((prev) =>
                  prev.filter((notification) => notification._id !== id),
                );

                // Update unread count if deleted notification was unread
                const deletedNotif = notifications.find((n) => n._id === id);
                if (deletedNotif && !deletedNotif.read) {
                  setUnreadCount((prev) => Math.max(0, prev - 1));
                }

                Alert.alert(
                  "Success",
                  response.message || "Notification deleted",
                );
              } else {
                Alert.alert(
                  "Error",
                  response.message || "Failed to delete notification",
                );
              }
            } catch (error: any) {
              console.error("Failed to delete notification:", error);
              Alert.alert("Error", "Failed to delete notification");
            }
          },
        },
      ],
    );
  };

  // Clear all notifications
  const handleClearAll = async () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to delete all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await clearAllNotificationsApi();

              if (response.success) {
                setNotifications([]);
                setUnreadCount(0);
                setPage(1);
                setHasMore(true);
                Alert.alert(
                  "Success",
                  response.message || "All notifications cleared",
                );
              } else {
                Alert.alert(
                  "Error",
                  response.message || "Failed to clear all notifications",
                );
              }
            } catch (error: any) {
              console.error("Failed to clear all:", error);
              Alert.alert("Error", "Failed to clear all notifications");
            }
          },
        },
      ],
    );
  };

  // Send test notification
  // const handleSendTest = async () => {
  //   try {
  //     const response = await sendTestNotificationApi();

  //     if (response.success) {
  //       Alert.alert("Success", response.message || "Test notification sent");
  //       // Refresh notifications to show the new test notification
  //       loadNotifications(true);
  //       loadUnreadCount();
  //     } else {
  //       Alert.alert(
  //         "Error",
  //         response.message || "Failed to send test notification",
  //       );
  //     }
  //   } catch (error: any) {
  //     console.error("Failed to send test:", error);
  //     Alert.alert("Error", "Failed to send test notification");
  //   }
  // };

  // Format time
  const formatTime = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      if (diffMins > 0) return `${diffMins}m ago`;
      return "Just now";
    } catch (error) {
      return "Recently";
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task":
        return "checkbox-outline";
      case "lead":
        return "person-outline";
      case "project":
        return "folder-outline";
      case "success":
        return "checkmark-circle";
      case "error":
        return "alert-circle";
      case "warning":
        return "warning";
      case "reminder":
        return "time-outline";
      case "order":
        return "cart-outline";
      case "payment":
        return "cash-outline";
      case "system":
      case "info":
      default:
        return "information-circle";
    }
  };

  // Get notification color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return colors.success || "#10B981";
      case "error":
        return colors.error || "#EF4444";
      case "warning":
        return colors.warning || "#F59E0B";
      case "task":
        return colors.primary || "#3B82F6";
      case "lead":
        return "#8B5CF6";
      case "project":
        return "#10B981";
      case "reminder":
        return "#F59E0B";
      case "order":
        return "#8B5CF6";
      case "payment":
        return "#10B981";
      default:
        return colors.primary || "#3B82F6";
    }
  };

  // Animation effect
  useEffect(() => {
    if (visible) {
      loadNotifications(true);
      loadUnreadCount();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  // Handle refresh
  const onRefresh = () => {
    loadNotifications(true);
    loadUnreadCount();
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadNotifications(false);
    }
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
              {unreadCount > 0 && (
                <View
                  style={[styles.badge, { backgroundColor: colors.primary }]}
                >
                  <ThemedText
                    style={{
                      color: colors.background,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </ThemedText>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.card,
                  opacity: unreadCount === 0 ? 0.5 : 1,
                },
              ]}
            >
              <Ionicons
                name="checkmark-done"
                size={20}
                color={unreadCount === 0 ? colors.textSecondary : colors.text}
              />
              <ThemedText
                style={{
                  color: unreadCount === 0 ? colors.textSecondary : colors.text,
                  fontSize: 14,
                  marginLeft: 6,
                }}
              >
                Mark all read
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClearAll}
              disabled={notifications.length === 0}
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.card,
                  opacity: notifications.length === 0 ? 0.5 : 1,
                },
              ]}
            >
              <Ionicons
                name="trash"
                size={20}
                color={
                  notifications.length === 0
                    ? colors.textSecondary
                    : colors.error
                }
              />
              <ThemedText
                style={{
                  color:
                    notifications.length === 0
                      ? colors.textSecondary
                      : colors.error,
                  fontSize: 14,
                  marginLeft: 6,
                }}
              >
                Clear all
              </ThemedText>
            </TouchableOpacity>

            {/* <TouchableOpacity
              onPress={handleSendTest}
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.card,
                  flex: 0.3,
                },
              ]}
            >
              <Ionicons name="notifications" size={20} color={colors.primary} />
            </TouchableOpacity> */}
          </View>

          {/* Notifications List */}
          <ScrollView
            style={styles.notificationsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } =
                nativeEvent;
              const paddingToBottom = 20;
              if (
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - paddingToBottom
              ) {
                handleLoadMore();
              }
            }}
            scrollEventThrottle={400}
          >
            {loading && notifications.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <ThemedText
                  style={{ color: colors.textSecondary, marginTop: 16 }}
                >
                  Loading notifications...
                </ThemedText>
              </View>
            ) : notifications.length === 0 ? (
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
                  You&lsquo;re all caught up!
                </ThemedText>
                {/* <TouchableOpacity
                  onPress={handleSendTest}
                  style={[
                    styles.testButton,
                    { backgroundColor: colors.primary, marginTop: 20 },
                  ]}
                >
                  <Ionicons name="notifications" size={20} color="#FFFFFF" />
                  <ThemedText
                    style={{
                      color: "#FFFFFF",
                      fontSize: 14,
                      marginLeft: 8,
                      fontWeight: "600",
                    }}
                  >
                    Send Test
                  </ThemedText>
                </TouchableOpacity> */}
              </View>
            ) : (
              <>
                {notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification._id}
                    style={[
                      styles.notificationItem,
                      {
                        backgroundColor: colors.card,
                        borderLeftColor: getNotificationColor(
                          notification.type,
                        ),
                        opacity: notification.read ? 0.7 : 1,
                      },
                    ]}
                    onPress={() => handleMarkAsRead(notification._id)}
                    onLongPress={() =>
                      handleDeleteNotification(notification._id)
                    }
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
                                fontWeight: notification.read
                                  ? "normal"
                                  : "600",
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
                          {notification.timeAgo ||
                            formatTime(notification.createdAt)}
                        </ThemedText>
                        <View style={styles.notificationActions}>
                          {!notification.read && (
                            <TouchableOpacity
                              onPress={() => handleMarkAsRead(notification._id)}
                              style={styles.readButton}
                            >
                              <ThemedText
                                style={{
                                  color: colors.primary,
                                  fontSize: 12,
                                  fontWeight: "600",
                                }}
                              >
                                Mark read
                              </ThemedText>
                            </TouchableOpacity>
                          )}
                          {notification.data && (
                            <TouchableOpacity
                              onPress={() => {
                                // Handle navigation based on notification type
                                if (notification.data?.taskId) {
                                  // Navigate to task
                                  Alert.alert(
                                    "Info",
                                    `Task ID: ${notification.data.taskId}`,
                                  );
                                } else if (notification.data?.leadId) {
                                  // Navigate to lead
                                  Alert.alert(
                                    "Info",
                                    `Lead ID: ${notification.data.leadId}`,
                                  );
                                }
                              }}
                              style={styles.viewButton}
                            >
                              <ThemedText
                                style={{
                                  color: colors.primary,
                                  fontSize: 12,
                                  fontWeight: "600",
                                }}
                              >
                                View
                              </ThemedText>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

                {loadingMore && (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <ThemedText
                      style={{ color: colors.textSecondary, marginLeft: 8 }}
                    >
                      Loading more...
                    </ThemedText>
                  </View>
                )}

                {!hasMore && notifications.length > 0 && (
                  <View style={styles.noMoreContainer}>
                    <ThemedText
                      style={{
                        color: colors.textSecondary,
                        textAlign: "center",
                      }}
                    >
                      No more notifications
                    </ThemedText>
                  </View>
                )}
              </>
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
    height: "90%",
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
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
  },
  notificationsList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
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
  notificationActions: {
    flexDirection: "row",
    gap: 8,
  },
  readButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  loadingMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  noMoreContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
