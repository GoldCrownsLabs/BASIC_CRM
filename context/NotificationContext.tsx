import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { AppState } from "react-native";

import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead as markAsReadApi,
  markAllAsRead as markAllAsReadApi,
  type Notification,
} from "@/lib/api/notifications";
import { websocketService } from "@/lib/utils/websocket";
import { useAuthStore } from "@/store/auth.store";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addRealTimeNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, token } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const appState = useRef(AppState.currentState);
  const initialLoadDone = useRef(false);
  const mounted = useRef(true);
  const webSocketConnected = useRef(false);
  const lastRefreshTime = useRef(0); // ✅ Track last refresh time

  const loadNotifications = async (refresh: boolean = false) => {
    if (!mounted.current) return;

    // 🛑 THROTTLE - 3 sec mein ek baar
    const now = Date.now();
    if (now - lastRefreshTime.current < 3000) {
      console.log("⏱️ Throttling - too many requests");
      return;
    }
    lastRefreshTime.current = now;

    try {
      if (refresh) {
        setRefreshing(true);
        setPage(1);
      } else if (page === 1 && !initialLoadDone.current) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetchNotifications(refresh ? 1 : page, 20);

      if (!mounted.current) return;

      if (response.success) {
        const newNotifications = response.notifications || [];
        const totalUnread = response.unreadCount || 0;

        if (refresh) {
          setNotifications(newNotifications);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
        }

        setUnreadCount(totalUnread);
        setHasMore(response.pagination?.hasMore || false);

        if (!refresh && response.pagination?.hasMore) {
          setPage((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        initialLoadDone.current = true;
      }
    }
  };

  useEffect(() => {
    mounted.current = true;

    if (!token) return;

    console.log("🔌 Setting up WebSocket connection...");

    const connectWebSocket = async () => {
      const connected = await websocketService.connect(token);
      if (connected && mounted.current) {
        console.log("✅ WebSocket connected successfully");
        webSocketConnected.current = true;
      }
    };

    connectWebSocket();

    const unsubscribe = websocketService.onMessage((data) => {
      if (!mounted.current) return;
      console.log("📨 WebSocket message received:", data.type);

      if (data.type === "new-notification" && data.notification) {
        const newNotification = data.notification;
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }

      if (data.type === "notification:unread-count" && data.data) {
        setUnreadCount(data.data.count);
      }
    });

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("📱 App came to foreground");

        // 🛑 Don't refresh if last refresh was within 10 seconds
        if (Date.now() - lastRefreshTime.current > 10000) {
          console.log("📱 Refreshing after foreground");
          loadNotifications(true);
        } else {
          console.log("📱 Skipping refresh - too soon");
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      mounted.current = false;
      unsubscribe();
      subscription.remove();
    };
  }, []); // ✅ EMPTY DEPENDENCY - SIRF EK BAAR

  // 🔥 Initial load - SIRF EK BAAR
  useEffect(() => {
    if (user && !initialLoadDone.current) {
      console.log("📱 Initial load - once");
      loadNotifications(true);
    }
  }, []); // ✅ EMPTY DEPENDENCY - SIRF EK BAAR

  const refreshNotifications = async () => {
    console.log("🔄 Manual refresh");
    await loadNotifications(true);
  };

  const loadMore = async () => {
    if (!loadingMore && hasMore) {
      console.log("📄 Loading more...");
      await loadNotifications(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    const response = await markAsReadApi(id);
    if (response.success && mounted.current) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      websocketService.markNotificationAsRead(id);
    }
  };

  const handleMarkAllAsRead = async () => {
    const response = await markAllAsReadApi();
    if (response.success && mounted.current) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      websocketService.markAllAsRead();
    }
  };

  const addRealTimeNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refreshing,
        hasMore,
        loadMore,
        refreshNotifications,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        addRealTimeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );

};
