import { Platform } from "react-native";
import { io, Socket } from "socket.io-client";

// ========================
// TYPE DEFINITIONS
// ========================

export type SocketNotification = {
  _id: string;
  title: string;
  message: string;
  type:
    | "task"
    | "lead"
    | "contact"
    | "profile"
    | "order"
    | "payment"
    | "calendar"
    | "system";
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  timeAgo?: string;
};

export type CalendarEvent = {
  _id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  status?: string;
};

export type CalendarEventResponse = {
  event: CalendarEvent;
  type: "created" | "updated" | "deleted" | "assigned";
  timestamp: string;
  updatedBy?: string;
  deletedBy?: string;
};

export type ConnectionResponse = {
  success: boolean;
  userId: string;
  timestamp: string;
  message: string;
};

export type MarkReadResponse = {
  success: boolean;
  notificationId: string;
  readAt: string;
};

export type UnreadCountResponse = {
  success: boolean;
  count: number;
};

export type CalendarStatusUpdate = {
  eventId: string;
  status: string;
  event: {
    id: string;
    title: string;
    type: string;
  };
  updatedBy: string;
  timestamp: string;
};

export type CalendarDeleteEvent = {
  eventId: string;
  type: string;
  deletedBy: string;
  timestamp: string;
};

export type AllReadResponse = {
  success: boolean;
  count: number;
  message: string;
};

export type ReminderData = {
  message: string;
  eventId?: string;
  title?: string;
  time?: string;
};

export type DailyAgendaData = {
  message: string;
  date?: string;
  events?: any[];
  count?: number;
};

// ========================
// SOCKET SERVICE CLASS
// ========================

class WebSocketService {
  private socket: Socket | null = null;
  private notificationCallbacks: ((
    notification: SocketNotification,
  ) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private calendarCallbacks: ((event: CalendarEventResponse) => void)[] = [];
  private messageCallbacks: ((data: any) => void)[] = []; // ✅ Added for onMessage

  // Get correct server URL based on platform
  private getServerUrl(): string {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl) return envUrl;

    if (Platform.OS === "android") {
      return "http://10.0.2.2:5000";
    } else if (Platform.OS === "ios") {
      return "http://localhost:5000";
    } else {
      return "http://localhost:5000";
    }
  }

  async connect(token: string): Promise<boolean> {
    if (this.socket?.connected) {
      console.log("🔌 Socket already connected");
      return true;
    }

    const serverUrl = this.getServerUrl();
    console.log(`🔌 Connecting to socket at: ${serverUrl}`);

    try {
      // Clean up existing socket
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }

      this.socket = io(serverUrl, {
        transports: ["websocket", "polling"],
        auth: { token },
        query: { token },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000,
        forceNew: true,
      });

      this.setupEventListeners();

      // Wait for connection
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.log("⚠️ Socket connection timeout");
          resolve(false);
        }, 5000);

        if (this.socket) {
          this.socket.once("connect", () => {
            clearTimeout(timeout);
            resolve(true);
          });

          this.socket.once("connect_error", () => {
            clearTimeout(timeout);
            resolve(false);
          });
        }
      });
    } catch (error) {
      console.error("❌ Failed to create socket connection:", error);
      return false;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", this.handleConnect.bind(this));
    this.socket.on("disconnect", this.handleDisconnect.bind(this));
    this.socket.on("connect_error", this.handleConnectError.bind(this));
    this.socket.on("error", this.handleError.bind(this));

    // Notification events
    this.socket.on("new-notification", this.handleNewNotification.bind(this));
    this.socket.on(
      "notification:read-confirmed",
      this.handleReadConfirmed.bind(this),
    );
    this.socket.on("notification:all-read", this.handleAllRead.bind(this));
    this.socket.on(
      "notification:unread-count",
      this.handleUnreadCount.bind(this),
    );

    // Calendar events
    this.socket.on("calendar:new-event", this.handleCalendarEvent.bind(this));
    this.socket.on(
      "calendar:event-assigned",
      this.handleCalendarEvent.bind(this),
    );
    this.socket.on(
      "calendar:event-changed",
      this.handleCalendarEvent.bind(this),
    );
    this.socket.on(
      "calendar:event-removed",
      this.handleCalendarDelete.bind(this),
    );
    this.socket.on(
      "calendar:status-changed",
      this.handleStatusChange.bind(this),
    );
    this.socket.on(
      "calendar:your-event-status-changed",
      this.handleStatusChange.bind(this),
    );
    this.socket.on("calendar:reminder", this.handleReminder.bind(this));
    this.socket.on("calendar:daily-agenda", this.handleDailyAgenda.bind(this));

    // Connection confirmation
    this.socket.on("connected", this.handleConnected.bind(this));

    // Ping/Pong
    this.socket.on("pong", () => {
      // Silent pong
    });
  }

  // ========================
  // EVENT HANDLERS
  // ========================

  private handleConnect(): void {
    console.log("✅ Socket connected successfully");
    this.connectionCallbacks.forEach((cb) => cb(true));
    this.getUnreadCount();
  }

  private handleDisconnect(reason: string): void {
    console.log("❌ Socket disconnected:", reason);
    this.connectionCallbacks.forEach((cb) => cb(false));
  }

  private handleConnectError(error: Error): void {
    console.error("❌ Socket connection error:", error.message);
  }

  private handleError(error: Error): void {
    console.error("❌ Socket error:", error);
  }

  private handleConnected(data: ConnectionResponse): void {
    console.log("🟢 Server confirmed connection:", data);
    // Also trigger message callbacks
    this.messageCallbacks.forEach((cb) => cb({ type: "connected", data }));
  }

  private handleNewNotification(notification: SocketNotification): void {
    console.log("📨 New notification received:", notification.title);
    this.notificationCallbacks.forEach((cb) => cb(notification));
    // Also trigger message callbacks
    this.messageCallbacks.forEach((cb) =>
      cb({ type: "new-notification", notification }),
    );
  }

  private handleReadConfirmed(data: MarkReadResponse): void {
    console.log("✅ Notification marked as read:", data.notificationId);
    this.messageCallbacks.forEach((cb) =>
      cb({ type: "notification:read-confirmed", data }),
    );
  }

  private handleAllRead(data: AllReadResponse): void {
    console.log("✅ All notifications marked as read:", data.count);
    this.messageCallbacks.forEach((cb) =>
      cb({ type: "notification:all-read", data }),
    );
  }

  private handleUnreadCount(data: UnreadCountResponse): void {
    if (data.success) {
      console.log("📊 Unread count:", data.count);
      this.messageCallbacks.forEach((cb) =>
        cb({ type: "notification:unread-count", data }),
      );
    }
  }

  private handleCalendarEvent(data: CalendarEventResponse): void {
    console.log(`📅 Calendar event ${data.type}:`, data.event?.title);
    this.calendarCallbacks.forEach((cb) => cb(data));
    this.messageCallbacks.forEach((cb) => cb({ type: "calendar:event", data }));
  }

  private handleCalendarDelete(data: CalendarDeleteEvent): void {
    console.log("🗑️ Calendar event deleted:", data.eventId);
    const response: CalendarEventResponse = {
      event: { _id: data.eventId } as CalendarEvent,
      type: "deleted",
      timestamp: data.timestamp,
      deletedBy: data.deletedBy,
    };
    this.calendarCallbacks.forEach((cb) => cb(response));
    this.messageCallbacks.forEach((cb) =>
      cb({ type: "calendar:event-removed", data }),
    );
  }

  private handleStatusChange(data: CalendarStatusUpdate): void {
    console.log(`🔄 Event status changed to ${data.status}:`, data.eventId);
    this.messageCallbacks.forEach((cb) =>
      cb({ type: "calendar:status-changed", data }),
    );
  }

  private handleReminder(data: ReminderData): void {
    console.log("⏰ Event reminder:", data.message);
    this.messageCallbacks.forEach((cb) =>
      cb({ type: "calendar:reminder", data }),
    );
  }

  private handleDailyAgenda(data: DailyAgendaData): void {
    console.log("📋 Daily agenda:", data.message);
    this.messageCallbacks.forEach((cb) =>
      cb({ type: "calendar:daily-agenda", data }),
    );
  }

  // ========================
  // PUBLIC METHODS
  // ========================

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      console.log("🔌 Socket disconnected manually");
    }
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("notification:read", { notificationId });
    } else {
      console.log("⚠️ Socket not connected, cannot mark as read");
    }
  }

  // Mark all as read
  markAllAsRead(): void {
    if (this.socket?.connected) {
      this.socket.emit("notification:read-all");
    } else {
      console.log("⚠️ Socket not connected, cannot mark all as read");
    }
  }

  // Get unread count
  getUnreadCount(): void {
    if (this.socket?.connected) {
      this.socket.emit("notification:unread-count");
    }
  }

  // Calendar subscriptions
  subscribeToEvent(eventId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("calendar:subscribe", { eventId });
      console.log(`📅 Subscribed to event: ${eventId}`);
    }
  }

  subscribeToDate(date: string): void {
    if (this.socket?.connected) {
      this.socket.emit("calendar:subscribe", { date });
      console.log(`📅 Subscribed to date: ${date}`);
    }
  }

  // Update event status
  updateEventStatus(eventId: string, status: string): void {
    if (this.socket?.connected) {
      this.socket.emit("calendar:update-status", { eventId, status });
    }
  }

  // Send ping (keep alive)
  sendPing(): void {
    if (this.socket?.connected) {
      this.socket.emit("ping");
    }
  }

  // ========================
  // CALLBACK REGISTRATION
  // ========================

  onNotification(
    callback: (notification: SocketNotification) => void,
  ): () => void {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }

  onCalendarEvent(
    callback: (event: CalendarEventResponse) => void,
  ): () => void {
    this.calendarCallbacks.push(callback);
    return () => {
      this.calendarCallbacks = this.calendarCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }

  // ✅ NEW: onMessage method for general message handling
  onMessage(callback: (data: any) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }

  // ========================
  // UTILITY METHODS
  // ========================

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  reconnect(): void {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
