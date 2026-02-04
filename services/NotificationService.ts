// services/NotificationService.ts
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NotificationCallback = (count: number) => void;

class NotificationService {
  private static instance: NotificationService;
  private pollingInterval: number | null = null; // Change to number
  private ws: WebSocket | null = null;
  private subscribers: Set<NotificationCallback> = new Set();
  private currentCount: number = 0;
  private isConnected: boolean = true;
  private appState: "active" | "background" | "inactive" = "active";
  private fastPollAttempts: number = 0;
  private maxFastAttempts: number = 3;

  private constructor() {
    this.setupNetworkListener();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Subscribe to count updates
  subscribe(callback: NotificationCallback): () => void {
    this.subscribers.add(callback);
    // Immediately send current count
    callback(this.currentCount);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Update count and notify all subscribers
  updateCount(count: number): void {
    if (this.currentCount !== count) {
      const wasIncrease = count > this.currentCount;
      this.currentCount = count;
      this.notifySubscribers();

      if (wasIncrease) {
        // You could trigger a local notification here
        console.log("New notification received!");
      }
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => {
      callback(this.currentCount);
    });
  }

  // Setup network listener
  private setupNetworkListener(): void {
    NetInfo.addEventListener((state) => {
      this.isConnected = state.isConnected ?? false;

      if (this.isConnected) {
        this.startPolling();
        this.tryConnectWebSocket();
      } else {
        this.stopPolling();
        this.disconnectWebSocket();
      }
    });
  }

  // Smart polling strategy
  startPolling(): void {
    if (this.pollingInterval !== null) {
      return; // Already polling
    }

    this.fastPollAttempts = 0;

    // Start with fast polling (5 seconds)
    this.startFastPolling();
  }

  private startFastPolling(): void {
    if (this.pollingInterval !== null) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(() => {
      this.fetchCount();
      this.fastPollAttempts++;

      // After 3 fast polls, switch to normal polling
      if (this.fastPollAttempts >= this.maxFastAttempts) {
        this.switchToNormalPolling();
      }
    }, 5000) as unknown as number;
  }

  private switchToNormalPolling(): void {
    if (this.pollingInterval !== null) {
      clearInterval(this.pollingInterval);
    }

    const interval = this.appState === "active" ? 15000 : 60000;
    this.pollingInterval = setInterval(() => {
      this.fetchCount();
    }, interval) as unknown as number;
  }

  stopPolling(): void {
    if (this.pollingInterval !== null) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Manual refresh
  async manualRefresh(): Promise<number> {
    return await this.fetchCount();
  }

  private async fetchCount(): Promise<number> {
    try {
      const { fetchUnreadCount } = await import("@/lib/api/notifications");
      const count = await fetchUnreadCount();
      this.updateCount(count);
      return count;
    } catch (error) {
      console.error("Failed to fetch count:", error);
      return this.currentCount;
    }
  }

  // WebSocket connection
  private async tryConnectWebSocket(): Promise<void> {
    // Check if WebSocket is supported and user prefers real-time
    try {
      const useWebSocket = await AsyncStorage.getItem("use_websocket");
      if (useWebSocket === "true") {
        this.connectWebSocket();
      }
    } catch (error) {
      console.error("Error reading WebSocket preference:", error);
    }
  }

  private connectWebSocket(): void {
    // Implementation depends on your backend
    // For now, we'll keep it empty
  }

  private disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  setAppState(state: "active" | "background" | "inactive"): void {
    this.appState = state;

    if (state === "active") {
      // App came to foreground - refresh immediately and start fast polling
      this.fetchCount();
      this.startFastPolling();
    } else {
      // App went to background - switch to slow polling
      this.switchToNormalPolling();
    }
  }

  // Get current count without fetching
  getCurrentCount(): number {
    return this.currentCount;
  }

  // Force refresh (for when user pulls to refresh)
  async forceRefresh(): Promise<void> {
    await this.fetchCount();
  }
}

// Create and export singleton instance
const notificationService = NotificationService.getInstance();
export default notificationService;
