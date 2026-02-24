// calendar.api.ts

import api from "./index";



// TypeScript Interfaces for Calendar Events
export interface CalendarEvent {
  _id: string;
  title: string;
  type: string;
  date: string;
  startTime: string;
  endTime?: string;
  contactId?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    company?: string;
  };
  contactName?: string;
  company?: string;
  description?: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  assignedTo: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  location?: string;
  notes?: string[];
  reminder?: {
    enabled: boolean;
    minutesBefore: number;
  };
  metadata?: {
    createdVia: string;
    lastUpdated: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventType {
  _id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
  isActive: boolean;
  order: number;
}

export interface CalendarStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  pendingEvents: number;
  eventsByType: Record<string, number>;
  eventsByStatus: Record<string, number>;
}

export interface CreateEventPayload {
  title: string;
  type: string;
  date: string;
  startTime: string;
  endTime?: string;
  contactId?: string;
  contactName?: string;
  company?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  location?: string;
  reminder?: {
    enabled: boolean;
    minutesBefore: number;
  };
}

export interface UpdateEventStatusPayload {
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  notes?: string;
}

export interface QuickAddEventPayload {
  title: string;
  date: string;
  time: string;
  type?: string;
  priority?: "low" | "medium" | "high";
}

export interface BulkUpdatePayload {
  eventIds: string[];
  updates: {
    status?: string;
    priority?: string;
    type?: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

// Filter interface for calendar events
export interface CalendarFilters {
  month?: number;
  year?: number;
  type?: string;
  status?: string;
  priority?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Fetch all calendar events with filters
export const fetchCalendarEvents = async (
  filters?: CalendarFilters,
): Promise<ApiResponse<CalendarEvent[]>> => {
  try {
    const params = new URLSearchParams();

    if (filters?.month !== undefined)
      params.append("month", filters.month.toString());
    if (filters?.year !== undefined)
      params.append("year", filters.year.toString());
    if (filters?.type) params.append("type", filters.type);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.priority) params.append("priority", filters.priority);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await api.get(`/calendar?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
};

// Fetch paginated calendar events
export const fetchPaginatedCalendarEvents = async (
  page: number = 1,
  limit: number = 20,
  filters?: Omit<CalendarFilters, "page" | "limit">,
): Promise<PaginatedResponse<CalendarEvent>> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (filters?.month !== undefined)
      params.append("month", filters.month.toString());
    if (filters?.year !== undefined)
      params.append("year", filters.year.toString());
    if (filters?.type) params.append("type", filters.type);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.priority) params.append("priority", filters.priority);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(`/calendar/paginated?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching paginated calendar events:", error);
    throw error;
  }
};

// Fetch events for a specific date
export const fetchEventsByDate = async (
  date: string,
): Promise<ApiResponse<CalendarEvent[]>> => {
  try {
    const response = await api.get(`/calendar/date/${date}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching events by date:", error);
    throw error;
  }
};

// Fetch agenda view (all events sorted by date)
export const fetchAgendaView = async (
  limit?: number,
): Promise<ApiResponse<CalendarEvent[]>> => {
  try {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());

    const response = await api.get(`/calendar/agenda?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching agenda view:", error);
    throw error;
  }
};

// Fetch single event by ID
export const fetchEventById = async (
  eventId: string,
): Promise<ApiResponse<CalendarEvent>> => {
  try {
    // ❌ Pehle: `/calendar/event/${eventId}`
    // ✅ Ab: `/calendar/event/${eventId}` - WAISE HI SAHI HAI!
    const response = await api.get(`/calendar/event/${eventId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching event:", error);

    // ✅ Add specific error handling for 403/404
    if (error.response?.status === 403) {
      throw new Error("You don't have permission to view this event");
    }
    if (error.response?.status === 404) {
      throw new Error("Event not found");
    }
    throw error;
  }
};
// Create new event
export const createEvent = async (
  eventData: CreateEventPayload,
): Promise<ApiResponse<CalendarEvent>> => {
  try {
    const response = await api.post("/calendar", eventData);
    return response.data;
  } catch (error: any) {
    console.error("Error creating event:", error);
    throw error;
  }
};

// Quick add event
export const quickAddEvent = async (
  eventData: QuickAddEventPayload,
): Promise<ApiResponse<CalendarEvent>> => {
  try {
    const response = await api.post("/calendar/quick-add", eventData);
    return response.data;
  } catch (error: any) {
    console.error("Error quick adding event:", error);
    throw error;
  }
};

// Update event status
export const updateEventStatus = async (
  eventId: string,
  statusData: UpdateEventStatusPayload,
): Promise<ApiResponse<CalendarEvent>> => {
  try {
    // ✅ Consistent URL pattern
    const response = await api.patch(
      `/calendar/event/${eventId}/status`,
      statusData,
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating event status:", error);
    throw error;
  }
};


// Update entire event
export const updateEvent = async (
  eventId: string,
  eventData: Partial<CreateEventPayload>,
): Promise<ApiResponse<CalendarEvent>> => {
  try {
    // ❌ Pehle: `/calendar/${eventId}`
    // ✅ Ab: `/calendar/event/${eventId}` - Consistent URL
    const response = await api.put(`/calendar/event/${eventId}`, eventData);
    return response.data;
  } catch (error: any) {
    console.error("Error updating event:", error);

    // ✅ Handle 403 Forbidden
    if (error.response?.status === 403) {
      throw new Error("You don't have permission to update this event");
    }
    throw error;
  }
};

// Delete event
export const deleteEvent = async (
  eventId: string,
): Promise<ApiResponse<{ message: string }>> => {
  try {
    // ❌ Pehle: `/calendar/${eventId}`
    // ✅ Ab: `/calendar/event/${eventId}`
    const response = await api.delete(`/calendar/event/${eventId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting event:", error);

    if (error.response?.status === 403) {
      throw new Error("You don't have permission to delete this event");
    }
    throw error;
  }
};
  //  markEventAsComplete

export const markEventAsCompleted = async (
  eventId: string,
): Promise<ApiResponse<CalendarEvent>> => {
  try {
    const response = await api.patch(`/calendar/event/${eventId}/complete`);
    return response.data;
  } catch (error: any) {
    console.error("Error marking event as completed:", error);
    throw error;
  }
};

// Fetch calendar statistics
export const fetchCalendarStats = async (): Promise<
  ApiResponse<CalendarStats>
> => {
  try {
    const response = await api.get("/calendar/stats");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching calendar stats:", error);
    throw error;
  }
};

// Fetch event types
export const fetchEventTypes = async (): Promise<ApiResponse<EventType[]>> => {
  try {
    const response = await api.get("/calendar/types");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching event types:", error);
    throw error;
  }
};

// Send test notification
export const sendTestNotification = async (
  message?: string,
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post("/calendar/test-notification", { message });
    return response.data;
  } catch (error: any) {
    console.error("Error sending test notification:", error);
    throw error;
  }
};

// Bulk update events
export const bulkUpdateEvents = async (
  eventIds: string[],
  updates: {
    status?: string;
    priority?: string;
    type?: string;
  },
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.put("/calendar/bulk-update", {
      eventIds,
      updates,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error bulk updating events:", error);
    throw error;
  }
};

// Get upcoming events (for dashboard)
export const fetchUpcomingEvents = async (
  limit: number = 5,
): Promise<ApiResponse<CalendarEvent[]>> => {
  try {
    const response = await api.get(`/calendar/upcoming?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching upcoming events:", error);
    throw error;
  }
};

// Sync calendar events (for offline support)
export const syncCalendarEvents = async (
  localEvents: Partial<CalendarEvent>[],
  lastSyncedAt: string,
): Promise<
  ApiResponse<{
    syncedEvents: CalendarEvent[];
    conflicts: any[];
    serverTimestamp: string;
  }>
> => {
  try {
    const response = await api.post("/calendar/sync", {
      localEvents,
      lastSyncedAt,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error syncing calendar events:", error);
    throw error;
  }
};

// Export calendar events
export const exportCalendarEvents = async (
  format: "csv" | "pdf" | "excel" = "csv",
  filters?: CalendarFilters,
): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    params.append("format", format);

    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.type) params.append("type", filters.type);

    const response = await api.get(`/calendar/export?${params.toString()}`, {
      responseType: "blob",
    });

    return response.data;
  } catch (error: any) {
    console.error("Error exporting calendar events:", error);
    throw error;
  }
};

// Import calendar events
export const importCalendarEvents = async (
  file: File,
  conflictResolution: "skip" | "replace" | "merge" = "skip",
): Promise<
  ApiResponse<{
    imported: number;
    skipped: number;
    failed: number;
    errors: string[];
  }>
> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conflictResolution", conflictResolution);

    const response = await api.post("/calendar/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error importing calendar events:", error);
    throw error;
  }
};

// Get calendar sharing settings
export const getCalendarSharingSettings = async (): Promise<
  ApiResponse<{
    isShared: boolean;
    sharedWith: Array<{
      userId: string;
      email: string;
      permissions: string[];
    }>;
    shareToken?: string;
  }>
> => {
  try {
    const response = await api.get("/calendar/sharing");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching calendar sharing settings:", error);
    throw error;
  }
};

// Share calendar with others
export const shareCalendar = async (
  userEmails: string[],
  permissions: string[] = ["view"],
): Promise<ApiResponse<{ shareToken?: string }>> => {
  try {
    const response = await api.post("/calendar/share", {
      userEmails,
      permissions,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error sharing calendar:", error);
    throw error;
  }
};

// Get recurring event templates
export const getRecurringEventTemplates = async (): Promise<
  ApiResponse<
    Array<{
      _id: string;
      title: string;
      description?: string;
      type: string;
      startTime: string;
      duration: number;
      recurrence: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        interval: number;
        daysOfWeek?: number[];
        dayOfMonth?: number;
        month?: number;
        endDate?: string;
        occurrences?: number;
      };
    }>
  >
> => {
  try {
    const response = await api.get("/calendar/templates/recurring");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching recurring event templates:", error);
    throw error;
  }
};

// Create recurring event from template
export const createRecurringEvent = async (
  templateId: string,
  startDate: string,
  endDate?: string,
): Promise<
  ApiResponse<{
    createdEvents: CalendarEvent[];
    skippedDates: string[];
  }>
> => {
  try {
    const response = await api.post("/calendar/templates/recurring/create", {
      templateId,
      startDate,
      endDate,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating recurring event:", error);
    throw error;
  }
};

// Analytics and reporting
export const getCalendarAnalytics = async (
  period: "day" | "week" | "month" | "year" = "month",
  startDate?: string,
  endDate?: string,
): Promise<
  ApiResponse<{
    period: string;
    totalEvents: number;
    completedEvents: number;
    cancelledEvents: number;
    averageDuration: number;
    busiestDay: {
      date: string;
      eventCount: number;
    };
    eventTypeDistribution: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    statusDistribution: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    monthlyTrend: Array<{
      month: string;
      events: number;
      completed: number;
    }>;
  }>
> => {
  try {
    const params = new URLSearchParams();
    params.append("period", period);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/calendar/analytics?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching calendar analytics:", error);
    throw error;
  }
};

// Get calendar reminders
export const getCalendarReminders = async (): Promise<
  ApiResponse<
    Array<{
      eventId: string;
      eventTitle: string;
      eventDate: string;
      eventTime: string;
      reminderTime: string;
      status: "pending" | "sent" | "failed";
    }>
  >
> => {
  try {
    const response = await api.get("/calendar/reminders");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching calendar reminders:", error);
    throw error;
  }
};

// Set event reminder
export const setEventReminder = async (
  eventId: string,
  minutesBefore: number,
  notificationType: "push" | "email" | "both" = "push",
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post(`/calendar/${eventId}/reminder`, {
      minutesBefore,
      notificationType,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error setting event reminder:", error);
    throw error;
  }
};

// Search calendar events
export const searchCalendarEvents = async (
  query: string,
  filters?: CalendarFilters,
): Promise<ApiResponse<CalendarEvent[]>> => {
  try {
    const params = new URLSearchParams();
    params.append("query", query);

    if (filters?.type) params.append("type", filters.type);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.priority) params.append("priority", filters.priority);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(`/calendar/search?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error("Error searching calendar events:", error);
    throw error;
  }
};

// Get calendar availability
export const getCalendarAvailability = async (
  date: string,
  duration: number = 60, // minutes
): Promise<
  ApiResponse<
    Array<{
      startTime: string;
      endTime: string;
      available: boolean;
      conflictingEvent?: {
        id: string;
        title: string;
      };
    }>
  >
> => {
  try {
    const params = new URLSearchParams();
    params.append("date", date);
    params.append("duration", duration.toString());

    const response = await api.get(
      `/calendar/availability?${params.toString()}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching calendar availability:", error);
    throw error;
  }
};

// Duplicate event
export const duplicateEvent = async (
  eventId: string,
  newDate?: string,
  newTime?: string,
): Promise<ApiResponse<CalendarEvent>> => {
  try {
    const response = await api.post(`/calendar/${eventId}/duplicate`, {
      newDate,
      newTime,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error duplicating event:", error);
    throw error;
  }
};

// Move event to different date/time
export const moveEvent = async (
  eventId: string,
  newDate: string,
  newTime: string,
): Promise<ApiResponse<CalendarEvent>> => {
  try {
    const response = await api.put(`/calendar/${eventId}/move`, {
      newDate,
      newTime,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error moving event:", error);
    throw error;
  }
};

// Add event note
export const addEventNote = async (
  eventId: string,
  note: string,
): Promise<ApiResponse<CalendarEvent>> => {
  try {
    const response = await api.post(`/calendar/event/${eventId}/notes`, {
      note,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error adding event note:", error);

    if (error.response?.status === 403) {
      throw new Error("You don't have permission to add notes to this event");
    }
    throw error;
  }
};


// Get event notes
export const getEventNotes = async (
  eventId: string,
): Promise<
  ApiResponse<
    Array<{
      id: string;
      note: string;
      createdBy: {
        id: string;
        name: string;
        avatar?: string;
      };
      createdAt: string;
    }>
  >
> => {
  try {
    const response = await api.get(`/calendar/${eventId}/notes`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching event notes:", error);
    throw error;
  }
};

// Update event note
export const updateEventNote = async (
  eventId: string,
  noteId: string,
  note: string,
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.put(`/calendar/${eventId}/notes/${noteId}`, {
      note,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error updating event note:", error);
    throw error;
  }
};

// Delete event note
export const deleteEventNote = async (
  eventId: string,
  noteId: string,
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.delete(`/calendar/${eventId}/notes/${noteId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting event note:", error);
    throw error;
  }
};

// Get calendar color schemes
export const getCalendarColorSchemes = async (): Promise<
  ApiResponse<
    Array<{
      id: string;
      name: string;
      colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
      };
      isDark: boolean;
    }>
  >
> => {
  try {
    const response = await api.get("/calendar/settings/color-schemes");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching color schemes:", error);
    throw error;
  }
};

// Update calendar settings
export const updateCalendarSettings = async (settings: {
  defaultView?: "month" | "week" | "day" | "agenda";
  startOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  timeFormat?: "12h" | "24h";
  defaultEventDuration?: number;
  enableReminders?: boolean;
  reminderTime?: number;
  colorSchemeId?: string;
  showWeekends?: boolean;
  showCompletedEvents?: boolean;
  enableDragDrop?: boolean;
}): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.put("/calendar/settings", settings);
    return response.data;
  } catch (error: any) {
    console.error("Error updating calendar settings:", error);
    throw error;
  }
};

// Get calendar settings
export const getCalendarSettings = async (): Promise<
  ApiResponse<{
    defaultView: "month" | "week" | "day" | "agenda";
    startOfWeek: number;
    timeFormat: "12h" | "24h";
    defaultEventDuration: number;
    enableReminders: boolean;
    reminderTime: number;
    colorSchemeId: string;
    showWeekends: boolean;
    showCompletedEvents: boolean;
    enableDragDrop: boolean;
    createdAt: string;
    updatedAt: string;
  }>
> => {
  try {
    const response = await api.get("/calendar/settings");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching calendar settings:", error);
    throw error;
  }
};

// Reset calendar settings to default
export const resetCalendarSettings = async (): Promise<
  ApiResponse<{ message: string }>
> => {
  try {
    const response = await api.post("/calendar/settings/reset");
    return response.data;
  } catch (error: any) {
    console.error("Error resetting calendar settings:", error);
    throw error;
  }
};

// Get calendar integrations
export const getCalendarIntegrations = async (): Promise<
  ApiResponse<
    Array<{
      id: string;
      name: string;
      type: "google" | "outlook" | "apple" | "other";
      isConnected: boolean;
      lastSynced?: string;
      syncStatus: "idle" | "syncing" | "error";
    }>
  >
> => {
  try {
    const response = await api.get("/calendar/integrations");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching calendar integrations:", error);
    throw error;
  }
};

// Connect calendar integration
export const connectCalendarIntegration = async (
  integrationType: string,
  authData: any,
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post("/calendar/integrations/connect", {
      integrationType,
      authData,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error connecting calendar integration:", error);
    throw error;
  }
};

// Disconnect calendar integration
export const disconnectCalendarIntegration = async (
  integrationId: string,
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.post("/calendar/integrations/disconnect", {
      integrationId,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error disconnecting calendar integration:", error);
    throw error;
  }
};

// Sync with external calendar
export const syncExternalCalendar = async (
  integrationId: string,
): Promise<
  ApiResponse<{
    syncedEvents: number;
    newEvents: number;
    updatedEvents: number;
    deletedEvents: number;
  }>
> => {
  try {
    const response = await api.post(
      `/calendar/integrations/${integrationId}/sync`,
    );
    return response.data;
  } catch (error: any) {
    console.error("Error syncing external calendar:", error);
    throw error;
  }
};

// Get calendar widget data for dashboard
export const getCalendarWidgetData = async (): Promise<
  ApiResponse<{
    todayEvents: CalendarEvent[];
    upcomingEvents: CalendarEvent[];
    recentEvents: CalendarEvent[];
    stats: {
      todayCount: number;
      weekCount: number;
      monthCount: number;
    };
  }>
> => {
  try {
    const response = await api.get("/calendar/widget");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching calendar widget data:", error);
    throw error;
  }
};

// Generate calendar share link
export const generateCalendarShareLink = async (
  expiresIn?: number, // hours
): Promise<
  ApiResponse<{
    shareLink: string;
    expiresAt: string;
  }>
> => {
  try {
    const params = new URLSearchParams();
    if (expiresIn) params.append("expiresIn", expiresIn.toString());

    const response = await api.get(`/calendar/share/link?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error("Error generating share link:", error);
    throw error;
  }
};

// Validate event data before submission
export const validateEventData = async (
  eventData: Partial<CreateEventPayload>,
): Promise<
  ApiResponse<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>
> => {
  try {
    const response = await api.post("/calendar/validate", eventData);
    return response.data;
  } catch (error: any) {
    console.error("Error validating event data:", error);
    throw error;
  }
};

// Get calendar event suggestions
export const getEventSuggestions = async (
  basedOn?: "history" | "contacts" | "templates",
): Promise<
  ApiResponse<
    Array<{
      title: string;
      type: string;
      suggestedTime: string;
      suggestedDate: string;
      confidence: number;
      reason: string;
    }>
  >
> => {
  try {
    const params = new URLSearchParams();
    if (basedOn) params.append("basedOn", basedOn);

    const response = await api.get(
      `/calendar/suggestions?${params.toString()}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching event suggestions:", error);
    throw error;
  }
};

// Rate limit info
export const getCalendarRateLimitInfo = async (): Promise<
  ApiResponse<{
    limit: number;
    remaining: number;
    reset: string;
  }>
> => {
  try {
    const response = await api.get("/calendar/rate-limit");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching rate limit info:", error);
    throw error;
  }
};

// Health check for calendar service
export const checkCalendarHealth = async (): Promise<
  ApiResponse<{
    status: "healthy" | "degraded" | "unhealthy";
    services: {
      database: boolean;
      cache: boolean;
      notifications: boolean;
    };
    uptime: number;
    version: string;
  }>
> => {
  try {
    const response = await api.get("/calendar/health");
    return response.data;
  } catch (error: any) {
    console.error("Error checking calendar health:", error);
    throw error;
  }
};

export default {
  fetchCalendarEvents,
  fetchPaginatedCalendarEvents,
  fetchEventsByDate,
  fetchAgendaView,
  fetchEventById,
  createEvent,
  quickAddEvent,
  updateEventStatus,
  updateEvent,
  deleteEvent,
  fetchCalendarStats,
  fetchEventTypes,
  sendTestNotification,
  bulkUpdateEvents,
  fetchUpcomingEvents,
  syncCalendarEvents,
  exportCalendarEvents,
  importCalendarEvents,
  getCalendarSharingSettings,
  shareCalendar,
  getRecurringEventTemplates,
  createRecurringEvent,
  getCalendarAnalytics,
  getCalendarReminders,
  setEventReminder,
  searchCalendarEvents,
  getCalendarAvailability,
  duplicateEvent,
  moveEvent,
  addEventNote,
  getEventNotes,
  updateEventNote,
  deleteEventNote,
  getCalendarColorSchemes,
  updateCalendarSettings,
  getCalendarSettings,
  resetCalendarSettings,
  getCalendarIntegrations,
  connectCalendarIntegration,
  disconnectCalendarIntegration,
  syncExternalCalendar,
  getCalendarWidgetData,
  generateCalendarShareLink,
  validateEventData,
  getEventSuggestions,
  getCalendarRateLimitInfo,
  checkCalendarHealth,
};
