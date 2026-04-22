// lib/api/notification.ts
import {
  NotificationSettings,
  NotificationStats,
} from "@/data/types/notification";
import api from "./index";

// Define Notification interface since it's not exported from types
export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | "task"
    | "lead"
    | "project"
    | "system"
    | "reminder"
    | "success"
    | "error"
    | "info"
    | "order"
    | "payment";
  data?: any;
  read: boolean;
  
  pushSent: boolean;
  pushToken?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  timeAgo?: string;
}

// Define response interfaces
interface FetchNotificationsResponse {
  message?: string;
  success: boolean;
  notifications: Notification[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
    page: number;
    totalPages: number;
  };
  unreadCount: number;
}

interface SingleNotificationResponse {
  message: string;
  success: boolean;
  notification: Notification;
}

interface MessageResponse {
  success: boolean;
  message: string;
}

interface SettingsResponse {
  success: boolean;
  settings: NotificationSettings;
  pushToken?: string;
}

interface TestNotificationResponse {
  success: boolean;
  notification: Notification;
  message: string;
}

interface StatsResponse {
  read: number;
  unread: number;
  total: number;
  success: boolean;
  stats: NotificationStats;
}

// Get all notifications with pagination
export const fetchNotifications = async (
  page: number = 1,
  limit: number = 20,
  unread?: boolean,
  type?: string,
): Promise<FetchNotificationsResponse> => {
  try {
    const params: any = { page, limit };
    if (unread !== undefined) params.unread = unread;
    if (type) params.type = type;

    const response = await api.get("/notifications", { params });

    // Ensure response has the correct structure
    return {
      success: true,
      message: response.data.message || "Notifications fetched successfully",
      notifications: response.data.notifications || [],
      pagination: response.data.pagination || {
        total: 0,
        limit,
        skip: (page - 1) * limit,
        hasMore: false,
        page,
        totalPages: 0,
      },
      unreadCount: response.data.unreadCount || 0,
    };
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      message: error.response?.data?.error || "Failed to fetch notifications",
      notifications: [],
      pagination: {
        total: 0,
        limit,
        skip: (page - 1) * limit,
        hasMore: false,
        page,
        totalPages: 0,
      },
      unreadCount: 0,
    };
  }
};

// Get single notification by ID
export const fetchNotificationById = async (
  id: string,
): Promise<SingleNotificationResponse> => {
  try {
    const response = await api.get(`/notifications/${id}`);
    return {
      success: true,
      message: response.data.message || "Notification fetched successfully",
      notification: response.data.notification,
    };
  } catch (error: any) {
    console.error(`Error fetching notification ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.error || "Failed to fetch notification",
      notification: {} as Notification,
    };
  }
};

// Mark notification as read
export const markAsRead = async (
  id: string,
): Promise<SingleNotificationResponse> => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return {
      success: true,
      message: response.data.message || "Notification marked as read",
      notification: response.data.notification,
    };
  } catch (error: any) {
    console.error(`Error marking notification ${id} as read:`, error);
    return {
      success: false,
      message: error.response?.data?.error || "Failed to mark notification as read",
      notification: {} as Notification,
    };
  }
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<MessageResponse> => {
  try {
    const response = await api.patch("/notifications/mark-all-read");
    return {
      success: true,
      message: response.data.message || "All notifications marked as read",
    };
  } catch (error: any) {
    console.error("Error marking all as read:", error);
    return {
      success: false,
      message: error.response?.data?.error || "Failed to mark all as read",
    };
  }
};

// Delete single notification
export const deleteNotification = async (
  id: string,
): Promise<MessageResponse> => {
  try {
    const response = await api.delete(`/notifications/${id}`);
    return {
      success: true,
      message: response.data.message || "Notification deleted successfully",
    };
  } catch (error: any) {
    console.error(`Error deleting notification ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.error || "Failed to delete notification",
    };
  }
};

// Clear all notifications
export const clearAllNotifications = async (): Promise<MessageResponse> => {
  try {
    const response = await api.delete("/notifications");
    return {
      success: true,
      message: response.data.message || "All notifications cleared",
    };
  } catch (error: any) {
    console.error("Error clearing all notifications:", error);
    return {
      success: false,
      message:
        error.response?.data?.error || "Failed to clear all notifications",
    };
  }
};

// Update push token (for mobile notifications)
export const updatePushToken = async (
  pushToken: string,
): Promise<MessageResponse> => {
  try {
    const response = await api.post("/notifications/push-token", { pushToken });
    return {
      success: true,
      message: response.data.message || "Push token updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating push token:", error);
    return {
      success: false,
      message: error.response?.data?.error || "Failed to update push token",
    };
  }
};

// Get notification settings
export const fetchNotificationSettings =
  async (): Promise<SettingsResponse> => {
    try {
      const response = await api.get("/notifications/settings");
      return {
        success: true,
        settings: response.data.settings || {},
        pushToken: response.data.pushToken,
      };
    } catch (error: any) {
      console.error("Error fetching notification settings:", error);
      return {
        success: false,
        settings: {},
        pushToken: undefined,
      };
    }
  };

// Update notification settings
export const updateNotificationSettings = async (
  settings: NotificationSettings,
): Promise<MessageResponse> => {
  try {
    const response = await api.put("/notifications/settings", { settings });
    return {
      success: true,
      message:
        response.data.message || "Notification settings updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating notification settings:", error);
    return {
      success: false,
      message:
        error.response?.data?.error || "Failed to update notification settings",
    };
  }
};

// Send test notification
export const sendTestNotification =
  async (): Promise<TestNotificationResponse> => {
    try {
      const response = await api.post("/notifications/test");
      return {
        success: true,
        notification: response.data.notification,
        message: response.data.message || "Test notification sent successfully",
      };
    } catch (error: any) {
      console.error("Error sending test notification:", error);
      return {
        success: false,
        notification: {} as Notification,
        message:
          error.response?.data?.error || "Failed to send test notification",
      };
    }
  };

// Get notification statistics
export const fetchNotificationStats = async (): Promise<StatsResponse> => {
  try {
    const response = await api.get("/notifications/stats");
    const stats = response.data.stats || {
      total: 0,
      unread: 0,
      read: 0,
      byType: {},
    };
    return {
      success: true,
      read: stats.read || 0,
      unread: stats.unread || 0,
      total: stats.total || 0,
      stats: stats,
    };
  } catch (error: any) {
    console.error("Error fetching notification stats:", error);
    return {
      success: false,
      read: 0,
      unread: 0,
      total: 0,
      stats: {
        total: 0,
        unread: 0,
        read: 0,
        byType: {},
      },
    };
  }
};

// Get unread notifications count (for badge)
export const fetchUnreadCount = async (): Promise<number> => {
  try {
    const response = await api.get("/notifications", {
      params: { limit: 1, unread: true },
    });

    if (response.data.success !== false) {
      return response.data.unreadCount || 0;
    }
    return 0;
  } catch (error: any) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
};

// Alternative: Get unread count from regular notifications endpoint
export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await fetchNotifications(1, 1);
    return response.unreadCount;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};

// Real-time notification functions (WebSocket)
export const setupNotificationSocket = (
  token: string,
  onNotification: (notification: Notification) => void,
  onError?: (error: any) => void,
) => {
  try {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000";
    const socket = new WebSocket(`${wsUrl}?token=${token}`);

    socket.onopen = () => {
      console.log("🔌 Connected to notification WebSocket");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new-notification" && data.notification) {
          onNotification(data.notification);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        if (onError) onError(error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (onError) onError(error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  } catch (error) {
    console.error("Error setting up WebSocket:", error);
    if (onError) onError(error);
    return () => {}; // Return empty cleanup function
  }
};

// Export types for use in other files
export type { NotificationSettings, NotificationStats };
export type { Notification as NotificationType };