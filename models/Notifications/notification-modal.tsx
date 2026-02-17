import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { useNotifications } from "@/context/NotificationContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState, useMemo } from "react";
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
import { deleteNotification as deleteNotificationApi } from "@/lib/api/notifications";

// Import Notification type
import { Notification } from "@/lib/api/notifications";
import leadsApi, { Lead } from "@/lib/api/leads.api";

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

interface NotificationDetailModalProps {
  visible: boolean;
  notification: Notification | null;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

// Detail Modal Component with Lead Details
const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  visible,
  notification,
  onClose,
  onMarkAsRead,
}) => {
  const { colors } = useAppTheme();
  const [leadData, setLeadData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch lead data when notification is a lead
  useEffect(() => {
    if (!notification || notification.type !== "lead" || !visible) return;

    const fetchLeadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const leadId = notification.data?.leadId;
        if (!leadId) {
          setError("No lead ID found in notification");
          setLoading(false);
          return;
        }

        console.log("🔍 Fetching lead with ID:", leadId);

        // ✅ Use leadsApi.getLeadById
        const response = await leadsApi.getLeadById(leadId);

        // console.log("✅ Lead API Response:", response);

        // ✅ Extract data properly - response.data.data contains the lead
        if (response.success && response.data) {
          // The actual lead data is in response.data.data
          const lead = response.data.data || response.data;
          setLeadData(lead);
        } else {
          setError(response.message || "Failed to fetch lead details");
        }
      } catch (error: any) {
        console.error("❌ Error fetching lead data:", error?.message || error);
        setError(error?.message || "Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeadData();
  }, [notification, visible]);

  if (!notification) return null;

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "new":
        return "#3B82F6";
      case "contacted":
        return "#8B5CF6";
      case "qualified":
        return "#10B981";
      case "proposal":
        return "#F59E0B";
      case "negotiation":
        return "#F97316";
      case "closed_won":
        return "#10B981";
      case "closed_lost":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  // Render Lead Details with exact API fields
  // Render Lead Details with exact API fields
  const renderLeadDetails = () => {
    if (!leadData) return null;

    return (
      <>
        {/* Lead Details Section */}
        <View style={[styles.sectionContainer, { marginTop: 20 }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
            Lead Details
          </ThemedText>

          <View
            style={[styles.detailCard, { backgroundColor: colors.background }]}
          >
            {/* ID */}
            <View style={styles.detailRow}>
              <Ionicons name="pricetag" size={18} color={colors.primary} />
              <ThemedText
                style={[styles.detailLabel, { color: colors.textSecondary }]}
              >
                ID:
              </ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                {leadData._id || leadData.id || "N/A"}
              </ThemedText>
            </View>

            {/* Full Name */}
            <View style={styles.detailRow}>
              <Ionicons name="person" size={18} color={colors.primary} />
              <ThemedText
                style={[styles.detailLabel, { color: colors.textSecondary }]}
              >
                Name:
              </ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                {leadData.fullName ||
                  `${leadData.firstName || ""} ${leadData.lastName || ""}`.trim() ||
                  "N/A"}
              </ThemedText>
            </View>

            {/* Email */}
            <View style={styles.detailRow}>
              <Ionicons name="mail" size={18} color={colors.primary} />
              <ThemedText
                style={[styles.detailLabel, { color: colors.textSecondary }]}
              >
                Email:
              </ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                {leadData.email || "N/A"}
              </ThemedText>
            </View>

            {/* Phone */}
            <View style={styles.detailRow}>
              <Ionicons name="call" size={18} color={colors.primary} />
              <ThemedText
                style={[styles.detailLabel, { color: colors.textSecondary }]}
              >
                Phone:
              </ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                {leadData.phone || "N/A"}
              </ThemedText>
            </View>

            {/* Company */}
            <View style={styles.detailRow}>
              <Ionicons name="business" size={18} color={colors.primary} />
              <ThemedText
                style={[styles.detailLabel, { color: colors.textSecondary }]}
              >
                Company:
              </ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                {leadData.company || "N/A"}
              </ThemedText>
            </View>

            {/* Job Title */}
            <View style={styles.detailRow}>
              <Ionicons name="briefcase" size={18} color={colors.primary} />
              <ThemedText
                style={[styles.detailLabel, { color: colors.textSecondary }]}
              >
                Job Title:
              </ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                {leadData.jobTitle || "N/A"}
              </ThemedText>
            </View>

            {/* Status and Priority Badges */}
            <View style={styles.badgesContainer}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(leadData.status) + "20" },
                ]}
              >
                <ThemedText
                  style={[
                    styles.statusText,
                    { color: getStatusColor(leadData.status) },
                  ]}
                >
                  {leadData.status || "N/A"}
                </ThemedText>
              </View>

              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor: getPriorityColor(leadData.priority) + "20",
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.priorityText,
                    { color: getPriorityColor(leadData.priority) },
                  ]}
                >
                  {leadData.priority || "N/A"}
                </ThemedText>
              </View>
            </View>

            {/* Budget */}
            {leadData.budget && (
              <View style={styles.detailRow}>
                <Ionicons name="cash" size={18} color={colors.success} />
                <ThemedText
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Budget:
                </ThemedText>
                <ThemedText
                  style={[
                    styles.detailValue,
                    { color: colors.success, fontWeight: "600" },
                  ]}
                >
                  {formatCurrency(leadData.budget)}
                </ThemedText>
              </View>
            )}

            {/* Source */}
            <View style={styles.detailRow}>
              <Ionicons name="globe" size={18} color={colors.primary} />
              <ThemedText
                style={[styles.detailLabel, { color: colors.textSecondary }]}
              >
                Source:
              </ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                {leadData.source || "N/A"}
              </ThemedText>
            </View>

            {/* Age In Days */}
            {leadData.ageInDays !== undefined && (
              <View style={styles.detailRow}>
                <Ionicons name="time" size={18} color={colors.primary} />
                <ThemedText
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Age:
                </ThemedText>
                <ThemedText
                  style={[styles.detailValue, { color: colors.text }]}
                >
                  {leadData.ageInDays} day{leadData.ageInDays !== 1 ? "s" : ""}
                </ThemedText>
              </View>
            )}

            {/* Created By */}
            {leadData.createdBy && (
              <View style={styles.detailRow}>
                <Ionicons name="person-add" size={18} color={colors.primary} />
                <ThemedText
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Created By:
                </ThemedText>
                <ThemedText
                  style={[styles.detailValue, { color: colors.text }]}
                >
                  {typeof leadData.createdBy === "object"
                    ? leadData.createdBy.name ||
                      leadData.createdBy.email ||
                      JSON.stringify(leadData.createdBy)
                    : leadData.createdBy}
                </ThemedText>
              </View>
            )}

            {/* Created At */}
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={18} color={colors.primary} />
              <ThemedText
                style={[styles.detailLabel, { color: colors.textSecondary }]}
              >
                Created:
              </ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                {formatDate(leadData.createdAt)}
              </ThemedText>
            </View>

            {/* Updated At */}
            <View style={styles.detailRow}>
              <Ionicons name="refresh" size={18} color={colors.primary} />
              <ThemedText
                style={[styles.detailLabel, { color: colors.textSecondary }]}
              >
                Updated:
              </ThemedText>
              <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                {formatDate(leadData.updatedAt)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Notes Section */}
        {leadData.notes && leadData.notes.length > 0 && (
          <View style={[styles.sectionContainer, { marginTop: 16 }]}>
            <ThemedText
              style={[styles.sectionTitle, { color: colors.primary }]}
            >
              Notes ({leadData.notes.length})
            </ThemedText>
            {leadData.notes.map((note: any, index: number) => (
              <View
                key={note._id || index}
                style={[
                  styles.noteCard,
                  { backgroundColor: colors.background },
                ]}
              >
                <ThemedText style={[styles.noteText, { color: colors.text }]}>
                  {note.content || JSON.stringify(note)}
                </ThemedText>
                <View style={styles.noteMeta}>
                  <ThemedText
                    style={[styles.noteAuthor, { color: colors.primary }]}
                  >
                    {note.createdBy?.name || note.createdBy || "System"}
                  </ThemedText>
                  <ThemedText
                    style={[styles.noteTime, { color: colors.textSecondary }]}
                  >
                    {formatDate(note.createdAt)}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        )}
      </>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.detailOverlay}>
          <View
            style={[
              styles.detailContainer,
              {
                backgroundColor: colors.card,
                alignItems: "center",
                padding: 40,
              },
            ]}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={{ color: colors.textSecondary, marginTop: 16 }}>
              Loading lead details...
            </ThemedText>
          </View>
        </View>
      </Modal>
    );
  }

  // Render error state
  if (error) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.detailOverlay}>
          <View
            style={[
              styles.detailContainer,
              { backgroundColor: colors.card, alignItems: "center" },
            ]}
          >
            <Ionicons name="alert-circle" size={64} color={colors.error} />
            <ThemedText
              style={[styles.errorText, { color: colors.error, marginTop: 16 }]}
            >
              {error}
            </ThemedText>
            <View style={styles.errorActions}>
              <TouchableOpacity
                style={[
                  styles.errorButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => {
                  setError(null);
                  setLoading(true);
                  // Refetch will happen automatically due to useEffect
                }}
              >
                <ThemedText style={{ color: colors.background }}>
                  Retry
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.errorButton,
                  {
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={onClose}
              >
                <ThemedText style={{ color: colors.primary }}>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Render lead details
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.detailOverlay}>
        <ScrollView
          style={[styles.detailContainer, { backgroundColor: colors.card }]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Header with Icon */}
          <View style={styles.detailHeader}>
            <View
              style={[
                styles.detailIcon,
                {
                  backgroundColor:
                    getNotificationColor(notification.type) + "20",
                },
              ]}
            >
              <Ionicons
                name={getNotificationIcon(notification.type) as any}
                size={32}
                color={getNotificationColor(notification.type)}
              />
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.detailCloseButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Notification Title */}
          <ThemedText style={[styles.detailTitle, { color: colors.text }]}>
            {notification.title}
          </ThemedText>

          {/* Notification Message */}
          <ThemedText
            style={[styles.detailMessage, { color: colors.textSecondary }]}
          >
            {notification.message}
          </ThemedText>

          {/* Time */}
          <View style={styles.detailMeta}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <ThemedText
              style={[styles.detailTime, { color: colors.textSecondary }]}
            >
              {formatTime(notification.createdAt)}
            </ThemedText>
          </View>

          {/* Render Lead Details */}
          {notification.type === "lead" && renderLeadDetails()}

          {/* Original notification data (fallback for other types) */}
          {notification.type !== "lead" &&
            notification.data &&
            typeof notification.data === "object" &&
            !Array.isArray(notification.data) &&
            Object.keys(notification.data).length > 0 && (
              <View
                style={[
                  styles.detailData,
                  { backgroundColor: colors.background, marginTop: 20 },
                ]}
              >
                <ThemedText
                  style={[
                    styles.sectionTitle,
                    { color: colors.primary, marginBottom: 10 },
                  ]}
                >
                  Additional Info
                </ThemedText>

                {Object.entries(notification.data).map(([key, value]) => (
                  <View key={key} style={styles.detailDataRow}>
                    <ThemedText
                      style={[
                        styles.detailDataKey,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {key}:
                    </ThemedText>

                    <ThemedText
                      style={[styles.detailDataValue, { color: colors.text }]}
                    >
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}

          {/* Action Button - Only show if notification is unread */}
          {!notification.read && (
            <TouchableOpacity
              style={[
                styles.detailButton,
                { backgroundColor: colors.primary, marginTop: 20 },
              ]}
              onPress={() => {
                onMarkAsRead(notification._id);
                onClose();
              }}
            >
              <ThemedText style={styles.detailButtonText}>
                Mark as Read
              </ThemedText>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};;

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useAppTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const processingIds = useRef<Set<string>>(new Set());
  const notificationVersion = useRef<number>(0);

  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    hasMore,
    loadMore,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Smooth animation for modal open/close
  useEffect(() => {
    if (visible) {
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Deduplicate notifications
  const uniqueNotifications = useMemo(() => {
    const seen = new Map<string, Notification>();
    [...notifications].reverse().forEach((notification) => {
      seen.set(notification._id, notification);
    });
    return Array.from(seen.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [notifications, notificationVersion.current]);

  const handleNotificationPress = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailVisible(true);
  };

  const handleMarkAsRead = async (id: string) => {
    if (processingIds.current.has(id)) return;
    processingIds.current.add(id);

    try {
      await markAsRead(id);
      notificationVersion.current += 1;

      // Smoothly update the UI
      setTimeout(() => {
        processingIds.current.delete(id);
      }, 300);
    } catch (error) {
      processingIds.current.delete(id);
      console.error("Error marking as read:", error);
    }
  };

  const handleDetailClose = () => {
    // Smooth close animation for detail modal
    setDetailVisible(false);
    setTimeout(() => {
      setSelectedNotification(null);
    }, 200);
  };

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
                refreshNotifications();
              } else {
                Alert.alert(
                  "Error",
                  response.message || "Failed to delete notification",
                );
              }
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete notification");
            }
          },
        },
      ],
    );
  };

  return (
    <>
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
                onPress={markAllAsRead}
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
                    color:
                      unreadCount === 0 ? colors.textSecondary : colors.text,
                    fontSize: 14,
                    marginLeft: 6,
                  }}
                >
                  Mark all read
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <ScrollView
              style={styles.notificationsList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshNotifications}
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
                  loadMore();
                }
              }}
              scrollEventThrottle={400}
            >
              {loading && uniqueNotifications.length === 0 ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <ThemedText
                    style={{ color: colors.textSecondary, marginTop: 16 }}
                  >
                    Loading notifications...
                  </ThemedText>
                </View>
              ) : uniqueNotifications.length === 0 ? (
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
                    You&rsquo;re all caught up!
                  </ThemedText>
                </View>
              ) : (
                <>
                  {uniqueNotifications.map(
                    (notification: Notification, index: number) => {
                      const uniqueKey = `notif-${notification._id}-${notification.read ? "read" : "unread"}-${index}`;

                      return (
                        <TouchableOpacity
                          key={uniqueKey}
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
                          onPress={() => handleNotificationPress(notification)}
                          onLongPress={() =>
                            handleDeleteNotification(notification._id)
                          }
                          disabled={processingIds.current.has(notification._id)}
                        >
                          <View style={styles.notificationContent}>
                            <View style={styles.notificationHeader}>
                              <View style={styles.titleContainer}>
                                <Ionicons
                                  name={
                                    getNotificationIcon(
                                      notification.type,
                                    ) as any
                                  }
                                  size={20}
                                  color={getNotificationColor(
                                    notification.type,
                                  )}
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
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    },
                  )}

                  {loading && hasMore && (
                    <View style={styles.loadingMoreContainer}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <ThemedText
                        style={{ color: colors.textSecondary, marginLeft: 8 }}
                      >
                        Loading more...
                      </ThemedText>
                    </View>
                  )}

                  {!hasMore && uniqueNotifications.length > 0 && (
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

      {/* Detail Modal */}
      <NotificationDetailModal
        visible={detailVisible}
        notification={selectedNotification}
        onClose={handleDetailClose}
        onMarkAsRead={handleMarkAsRead}
      />
    </>
  );
};

// Helper functions
const formatTime = (createdAt: string): string => {
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

const getNotificationIcon = (type: string): string => {
  switch (type) {
    case "task":
      return "checkbox-outline";
    case "lead":
      return "person-outline";
    case "contact":
      return "people-outline";
    case "profile":
      return "person-circle-outline";
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

const getNotificationColor = (type: string): string => {
  switch (type) {
    case "success":
      return "#10B981";
    case "error":
      return "#EF4444";
    case "warning":
      return "#F59E0B";
    case "task":
      return "#3B82F6";
    case "lead":
      return "#8B5CF6";
    case "contact":
      return "#EC4899";
    case "profile":
      return "#F59E0B";
    case "project":
      return "#10B981";
    case "reminder":
      return "#F59E0B";
    case "order":
      return "#8B5CF6";
    case "payment":
      return "#10B981";
    default:
      return "#3B82F6";
  }
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

  // Detail Modal Styles
  detailOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  detailContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: "90%",
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  detailIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  detailCloseButton: {
    padding: 8,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  detailMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  detailMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  detailTime: {
    fontSize: 14,
    marginLeft: 8,
  },
  detailData: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailDataRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailDataKey: {
    fontSize: 14,
    fontWeight: "600",
    width: 100,
  },
  detailDataValue: {
    fontSize: 14,
    flex: 1,
  },
  detailButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  detailButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // New styles for lead details
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  detailCard: {
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    width: 70,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  noteCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    marginBottom: 4,
  },
  noteMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  noteAuthor: {
    fontSize: 12,
    fontWeight: "500",
  },
  noteTime: {
    fontSize: 12,
  },
  // Error styles
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  errorActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  errorButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
});
