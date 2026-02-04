export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: Record<string, any>;
  read: boolean;
  pushSent: boolean;
  pushToken?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  timeAgo?: string;
}

export type NotificationType =
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

export interface NotificationSettings {
  taskNotifications?: boolean;
  leadNotifications?: boolean;
  projectNotifications?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  inAppNotifications?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  [key: string]: boolean | undefined;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Record<string, { total: number; unread: number; read: number }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  notifications: T[];
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
