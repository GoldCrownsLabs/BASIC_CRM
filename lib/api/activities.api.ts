// lib/api/activities.api.ts

import api from "./index";

// ==================== TYPES ====================

// Activity Types
export type ActivityType = "call" | "meeting" | "note" | "task" | "email";
export type PriorityType = "high" | "medium" | "low";
export type StatusType = "pending" | "scheduled" | "completed";

// Contact interface for populated fields
export interface Contact {
  _id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  avatar?: string;
  title?: string;
}

// Lead interface for populated fields
export interface Lead {
  _id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  source?: string;
  value?: number;
}

// Activity interface
export interface Activity {
  _id: string;
  id?: string; // For backward compatibility
  title: string;
  type: ActivityType;
  priority: PriorityType;
  status?: StatusType;
  isCompleted?: boolean;
  contactName?: string;
  company?: string;
  description?: string;
  date: string;
  time: string;
  duration?: string;
  location?: string;
  notes?: string;
  outcome?: string;
  reminders?: {
    enabled: boolean;
    time: string;
    type: "email" | "notification";
  }[];

  // References
  userId?: string;
  contactId?: string;
  leadId?: string;
  dealId?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  lastModified?: string;

  // Populated fields (from API)
  contact?: Contact;
  lead?: Lead;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
}

// API Filters for activities
export interface ActivityFilters {
  // Pagination
  page?: number;
  limit?: number;

  // Filters
  type?: ActivityType;
  status?: StatusType;
  priority?: PriorityType;
  isCompleted?: boolean;

  // Search
  search?: string;

  // Date filters
  date?: string;
  startDate?: string;
  endDate?: string;

  // Related entities
  contactId?: string;
  leadId?: string;
  dealId?: string;
  userId?: string;

  // Sorting
  sortBy?: "date" | "priority" | "createdAt" | "title";
  order?: "asc" | "desc";
}

// Activity Stats
export interface ActivityStats {
  overall: {
    totalActivities: number;
    completedActivities: number;
    pendingActivities: number;
    totalDuration: number;
    completionRate: number;
    avgDuration: number;
  };
  byType: Array<{
    type: string;
    count: number;
    totalDuration: number;
    completed: number;
    completionRate: number;
    avgDuration: number;
  }>;
}

// Dashboard Activities
export interface DashboardActivities {
  todaysActivities: Activity[];
  upcomingActivities: Activity[];
  recentActivities: Activity[];
}

// New Activity Data (for creating/updating)
export interface NewActivityData {
  title: string;
  type: ActivityType;
  priority: PriorityType;
  status?: StatusType;
  contactName?: string;
  company?: string;
  description?: string;
  date: string;
  time: string;
  duration?: string;
  location?: string;
  notes?: string;
  outcome?: string;
  contactId?: string;
  leadId?: string;
  dealId?: string;
  reminders?: {
    enabled: boolean;
    time: string;
    type: "email" | "notification";
  }[];
}

// Update Activity Data
export interface UpdateActivityData {
  title?: string;
  type?: ActivityType;
  priority?: PriorityType;
  status?: StatusType;
  isCompleted?: boolean;
  contactName?: string;
  company?: string;
  description?: string;
  date?: string;
  time?: string;
  duration?: string;
  location?: string;
  notes?: string;
  outcome?: string;
  contactId?: string;
  leadId?: string;
  dealId?: string;
}

// ==================== API FUNCTIONS ====================

// Get all activities with filters
export const fetchActivities = async (
  filters: ActivityFilters = {},
): Promise<PaginatedResponse<Activity>> => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const response = await api.get<PaginatedResponse<Activity>>(
    `/activities?${params.toString()}`,
  );
  return response.data;
};

// Get activity by ID
export const fetchActivityById = async (
  id: string,
): Promise<ApiResponse<Activity>> => {
  const response = await api.get<ApiResponse<Activity>>(`/activities/${id}`);
  return response.data;
};

// Create new activity
export const createActivity = async (
  activityData: Partial<Activity>,
): Promise<ApiResponse<Activity>> => {
  const response = await api.post<ApiResponse<Activity>>(
    "/activities",
    activityData,
  );
  return response.data;
};

// Update activity
export const updateActivity = async (
  id: string,
  activityData: Partial<Activity>,
): Promise<ApiResponse<Activity>> => {
  const response = await api.put<ApiResponse<Activity>>(
    `/activities/${id}`,
    activityData,
  );
  return response.data;
};

// Delete activity
export const deleteActivity = async (
  id: string,
): Promise<ApiResponse<{ id: string }>> => {
  const response = await api.delete<ApiResponse<{ id: string }>>(
    `/activities/${id}`,
  );
  return response.data;
};

// Mark activity as completed
export const markActivityAsCompleted = async (
  id: string,
): Promise<ApiResponse<Activity>> => {
  const response = await api.patch<ApiResponse<Activity>>(
    `/activities/${id}/complete`,
  );
  return response.data;
};

// Get activity statistics
export const fetchActivityStats = async (
  startDate?: string,
  endDate?: string,
): Promise<ApiResponse<ActivityStats>> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await api.get<ApiResponse<ActivityStats>>(
    `/activities/stats?${params.toString()}`,
  );
  return response.data;
};

// Get upcoming activities
export const fetchUpcomingActivities = async (
  days: number = 7,
): Promise<ApiResponse<Activity[]>> => {
  const response = await api.get<ApiResponse<Activity[]>>(
    `/activities/upcoming?days=${days}`,
  );
  return response.data;
};

// Get dashboard activities
export const fetchDashboardActivities = async (): Promise<
  ApiResponse<DashboardActivities>
> => {
  const response = await api.get<ApiResponse<DashboardActivities>>(
    "/activities/dashboard",
  );
  return response.data;
};

// Search activities
export const searchActivities = async (
  query: string,
  type?: string,
  isCompleted?: boolean,
): Promise<ApiResponse<Activity[]>> => {
  const params = new URLSearchParams();
  params.append("query", query);
  if (type) params.append("type", type);
  if (isCompleted !== undefined)
    params.append("isCompleted", String(isCompleted));

  const response = await api.get<ApiResponse<Activity[]>>(
    `/activities/search?${params.toString()}`,
  );
  return response.data;
};

// ==================== CONSTANTS & UTILITIES ====================

// Activity types array for runtime use
export const activityTypes: ActivityType[] = [
  "call",
  "meeting",
  "note",
  "task",
  "email",
];

export interface ActivityConfig {
  icon: string;
  color: string;
  bg: string;
  label: string;
}
// Activity configuration for icons, colors, etc. (Light theme)
export const activityConfig: Record<ActivityType, ActivityConfig> = {
  call: {
    icon: "phone" as const,
    color: "#10B981",
    bg: "#D1FAE5",
    label: "Call",
  },
  meeting: {
    icon: "calendar" as const,
    color: "#3B82F6",
    bg: "#DBEAFE",
    label: "Meeting",
  },
  note: {
    icon: "file-text" as const,
    color: "#8B5CF6",
    bg: "#EDE9FE",
    label: "Note",
  },
  task: {
    icon: "check-square" as const,
    color: "#F59E0B",
    bg: "#FEF3C7",
    label: "Task",
  },
  email: {
    icon: "mail" as const,
    color: "#EF4444",
    bg: "#FEE2E2",
    label: "Email",
  },
};

// Dark theme activity configuration
export const darkActivityConfig: Record<ActivityType, ActivityConfig> = {
  call: {
    icon: "phone" as const,
    color: "#34D399",
    bg: "#064E3B",
    label: "Call",
  },
  meeting: {
    icon: "calendar" as const,
    color: "#60A5FA",
    bg: "#1E3A8A",
    label: "Meeting",
  },
  
  note: {
    icon: "file-text" as const,
    color: "#A78BFA",
    bg: "#5B21B6",
    label: "Note",
  },
  task: {
    icon: "check-square" as const,
    color: "#FBBF24",
    bg: "#92400E",
    label: "Task",
  },
  email: {
    icon: "mail" as const,
    color: "#F87171",
    bg: "#7F1D1D",
    label: "Email",
  },
};

// Get theme-aware activity config
export const getThemeActivityConfig = (isDark: boolean) => {
  return isDark ? darkActivityConfig : activityConfig;
};

// Priority colors
export const priorityColors = {
  high: "#DC2626",
  medium: "#D97706",
  low: "#059669",
};

// Dark theme priority colors
export const darkPriorityColors = {
  high: "#F87171",
  medium: "#FBBF24",
  low: "#34D399",
};

// Get theme-aware priority colors
export const getThemePriorityColors = (isDark: boolean) => {
  return isDark ? darkPriorityColors : priorityColors;
};

// Status colors
export const statusColors = {
  completed: "#10B981",
  scheduled: "#3B82F6",
  pending: "#6B7280",
};

// Dark theme status colors
export const darkStatusColors = {
  completed: "#34D399",
  scheduled: "#60A5FA",
  pending: "#9CA3AF",
};

// Get theme-aware status colors
export const getThemeStatusColors = (isDark: boolean) => {
  return isDark ? darkStatusColors : statusColors;
};

// Helper functions
export const formatActivityDate = (date: string): string => {
  if (!date) return "";

  try {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  } catch {
    return date;
  }
};

export const formatActivityTime = (time: string, date: string): string => {
  if (!time) return "";

  // If time is already in AM/PM format, return as is
  if (time.includes("AM") || time.includes("PM")) {
    return time;
  }

  try {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
};

export const getActivityTypeLabel = (type: ActivityType): string => {
  return activityConfig[type]?.label || type;
};

export const getPriorityLabel = (priority: PriorityType): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

export const getStatusLabel = (status: StatusType): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// ==================== EXPORTS ====================

// Remove default export if not needed, or create a proper object with runtime values

// Option 1: No default export (recommended)
// Just use named exports

// Option 2: Create a namespace object for convenience
export const ActivitiesAPI = {
  // Constants
  activityTypes,
  activityConfig,
  darkActivityConfig,
  priorityColors,
  darkPriorityColors,
  statusColors,
  darkStatusColors,

  // Helper Functions
  getThemeActivityConfig,
  getThemePriorityColors,
  getThemeStatusColors,
  formatActivityDate,
  formatActivityTime,
  getActivityTypeLabel,
  getPriorityLabel,
  getStatusLabel,

  // API Functions
  fetchActivities,
  fetchActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  markActivityAsCompleted,
  fetchActivityStats,
  fetchUpcomingActivities,
  fetchDashboardActivities,
  searchActivities,

  // Type guards (if needed)
  isActivityType: (value: string): value is ActivityType => {
    return activityTypes.includes(value as ActivityType);
  },
  isPriorityType: (value: string): value is PriorityType => {
    return ["high", "medium", "low"].includes(value);
  },
  isStatusType: (value: string): value is StatusType => {
    return ["pending", "scheduled", "completed"].includes(value);
  },
};


export const formatIndianDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return "";

  try {
    const date = new Date(dateTimeString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateTimeString;
    }

    // Format date using existing formatIndianDate logic
    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    // Format time (12-hour format with AM/PM)
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    const formattedTime = `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;

    return `${day} ${month} ${year} at ${formattedTime}`;
  } catch (error) {
    console.error("Error formatting date time:", error, dateTimeString);
    return dateTimeString;
  }
};


export const formatDuration = (
  duration: number | string | undefined,
): string => {
  if (!duration && duration !== 0) return "";

  if (typeof duration === "number") {
    if (duration < 60) {
      return `${duration} min${duration !== 1 ? "s" : ""}`;
    } else {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      if (minutes === 0) {
        return `${hours} hour${hours !== 1 ? "s" : ""}`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    }
  }

  return String(duration);
};


