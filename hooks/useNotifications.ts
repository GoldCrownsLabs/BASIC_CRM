// hooks/useNotifications.ts
import { useState, useEffect, useCallback } from "react";
import { useIsFocused } from "@react-navigation/native";
import { AppState, AppStateStatus } from "react-native";
import notificationService from "@/services/NotificationService";

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const prevCountRef = useState(0);

  // Subscribe to notification service
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((count) => {
      setUnreadCount(count);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Handle screen focus
  useEffect(() => {
    if (isFocused) {
      // Screen came into focus - refresh immediately
      notificationService.manualRefresh();
    }
  }, [isFocused]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        notificationService.setAppState("active");
      } else {
        notificationService.setAppState("background");
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, []);

  // Manual refresh function
  const refreshCount = useCallback(async () => {
    setLoading(true);
    const count = await notificationService.manualRefresh();
    setUnreadCount(count);
    setLoading(false);
    return count;
  }, []);

  // Force refresh (bypasses cache)
  const forceRefresh = useCallback(async () => {
    setLoading(true);
    await notificationService.forceRefresh();
    setLoading(false);
  }, []);

  return {
    unreadCount,
    loading,
    refreshCount,
    forceRefresh,
  };
};
