import { useState, useEffect, useCallback } from "react";
import { useNotifications as useNotificationsContext } from "@/context/NotificationContext";
import { websocketService } from "@/lib/utils/websocket";
import { fetchUnreadCount } from "@/lib/api/notifications";

interface UseNotificationsOptions {
  initialFetch?: boolean;
  onNewNotification?: (notification: any) => void;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { initialFetch = true } = options;

  // ✅ Context se data le lo
  const context = useNotificationsContext();

  const [isConnected, setIsConnected] = useState(
    websocketService.isConnected(),
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  // 🔥 WebSocket connection status track karo
  useEffect(() => {
    const unsubscribe = websocketService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    return unsubscribe;
  }, []);

  // 🔥 Initial fetch (agar needed ho)
  useEffect(() => {
    if (initialFetch && context.notifications.length === 0) {
      context.refreshNotifications();
    }
  }, [initialFetch]);

  // 🔥 Manual refresh with timestamp
  const refresh = useCallback(async () => {
    setLocalLoading(true);
    await context.refreshNotifications();
    setLastUpdated(new Date());
    setLocalLoading(false);
  }, [context]);

  // 🔥 Load more with pagination
  const loadMore = useCallback(async () => {
    if (!context.loading && context.hasMore) {
      await context.loadMore();
      setLastUpdated(new Date());
    }
  }, [context]);

  // 🔥 Mark as read with optimistic update
  const markAsRead = useCallback(
    async (id: string) => {
      await context.markAsRead(id);
    },
    [context],
  );

  // 🔥 Mark all as read
  const markAllAsRead = useCallback(async () => {
    await context.markAllAsRead();
  }, [context]);

  // 🔥 Get unread count (from context or fetch)
  const getUnreadCount = useCallback(async () => {
    if (isConnected) {
      // WebSocket connected hai to context se le lo
      return context.unreadCount;
    } else {
      // WebSocket disconnected hai to API se fetch karo
      const count = await fetchUnreadCount();
      return count;
    }
  }, [isConnected, context.unreadCount]);

  return {
    // 🔥 From Context
    notifications: context.notifications,
    unreadCount: context.unreadCount,
    loading: context.loading || localLoading,
    refreshing: context.refreshing,
    hasMore: context.hasMore,

    // 🔥 WebSocket Status
    isConnected,

    // 🔥 Timestamps
    lastUpdated,

    // 🔥 Actions
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    getUnreadCount,

    // 🔥 Utilities
    isEmpty: context.notifications.length === 0,
    hasNotifications: context.notifications.length > 0,
  };
};

// 🔥 Optional: Hook for unread count only (lightweight)
export const useUnreadCount = () => {
  const { unreadCount } = useNotificationsContext();
  const [isConnected, setIsConnected] = useState(
    websocketService.isConnected(),
  );

  useEffect(() => {
    const unsubscribe = websocketService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });
    return unsubscribe;
  }, []);

  return {
    unreadCount,
    isConnected,
  };
};

// 🔥 Optional: Hook for real-time badge updates
export const useNotificationBadge = () => {
  const { unreadCount } = useNotificationsContext();

  // Update app icon badge (for iOS)
  useEffect(() => {
    // Agar app icon badge set karna ho to
    // Notifications.setBadgeCount?.(unreadCount);
  }, [unreadCount]);

  return unreadCount;
};
