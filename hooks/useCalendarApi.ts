// hooks/useCalendarApi.ts
import { useState, useCallback } from "react";
import { Alert } from "react-native";
import {
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
  fetchUpcomingEvents,
  setEventReminder,
  moveEvent,
  addEventNote,
  searchCalendarEvents,
} from "@/lib/api/calender.api"; 

import type {
  CalendarEvent,
  CalendarFilters,
  CreateEventPayload,
  UpdateEventStatusPayload,
  QuickAddEventPayload,
  CalendarStats,
  EventType,
  ApiResponse,
  PaginatedResponse,
} from "@/lib/api/calender.api";

export const useCalendarApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Error handler
  const handleError = (error: any, defaultMessage: string) => {
    console.error(defaultMessage, error);
    setError(error.response?.data?.message || defaultMessage);
    Alert.alert("Error", error.response?.data?.message || defaultMessage);
    throw error;
  };

  // Fetch calendar events
  const fetchCalendarEventsApi = useCallback(
    async (filters?: CalendarFilters): Promise<CalendarEvent[]> => {
      setLoading(true);
      try {
        const response = await fetchCalendarEvents(filters);
        return response.data;
      } catch (error) {
        return handleError(error, "Failed to fetch calendar events");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch paginated events
  const fetchPaginatedCalendarEventsApi = useCallback(
    async (
      page: number = 1,
      limit: number = 20,
      filters?: Omit<CalendarFilters, "page" | "limit">,
    ): Promise<PaginatedResponse<CalendarEvent>> => {
      setLoading(true);
      try {
        return await fetchPaginatedCalendarEvents(page, limit, filters);
      } catch (error) {
        return handleError(error, "Failed to fetch paginated events");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch events by date
  const fetchEventsByDateApi = useCallback(
    async (date: string): Promise<CalendarEvent[]> => {
      setLoading(true);
      try {
        const response = await fetchEventsByDate(date);
        return response.data;
      } catch (error) {
        return handleError(error, "Failed to fetch events by date");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch agenda view
  const fetchAgendaViewApi = useCallback(
    async (limit?: number): Promise<CalendarEvent[]> => {
      setLoading(true);
      try {
        const response = await fetchAgendaView(limit);
        return response.data;
      } catch (error) {
        return handleError(error, "Failed to fetch agenda view");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch single event
  const fetchEventByIdApi = useCallback(
    async (eventId: string): Promise<CalendarEvent> => {
      setLoading(true);
      try {
        const response = await fetchEventById(eventId);
        return response.data;
      } catch (error) {
        return handleError(error, "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Create event
  const createEventApi = useCallback(
    async (eventData: CreateEventPayload): Promise<CalendarEvent> => {
      setLoading(true);
      try {
        const response = await createEvent(eventData);
        Alert.alert("Success", "Event created successfully");
        return response.data;
      } catch (error) {
        return handleError(error, "Failed to create event");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Quick add event
  const quickAddEventApi = useCallback(
    async (eventData: QuickAddEventPayload): Promise<CalendarEvent> => {
      setLoading(true);
      try {
        const response = await quickAddEvent(eventData);
        Alert.alert("Success", "Event added successfully");
        return response.data;
      } catch (error) {
        return handleError(error, "Failed to quick add event");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Update event status
  const updateEventStatusApi = useCallback(
    async (
      eventId: string,
      statusData: UpdateEventStatusPayload,
    ): Promise<CalendarEvent> => {
      setLoading(true);
      try {
        const response = await updateEventStatus(eventId, statusData);
        Alert.alert("Success", "Event status updated");
        return response.data;
      } catch (error) {
        return handleError(error, "Failed to update event status");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Update entire event
  const updateEventApi = useCallback(
    async (
      eventId: string,
      eventData: Partial<CreateEventPayload>,
    ): Promise<CalendarEvent> => {
      setLoading(true);
      try {
        const response = await updateEvent(eventId, eventData);
        Alert.alert("Success", "Event updated successfully");
        return response.data;
      } catch (error) {
        return handleError(error, "Failed to update event");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Delete event
  const deleteEventApi = useCallback(async (eventId: string): Promise<void> => {
    setLoading(true);
    try {
      await deleteEvent(eventId);
      Alert.alert("Success", "Event deleted successfully");
    } catch (error) {
      return handleError(error, "Failed to delete event");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch calendar stats
  const fetchCalendarStatsApi =
    useCallback(async (): Promise<CalendarStats> => {
      setLoading(true);
      try {
        const response = await fetchCalendarStats();
        return response.data;
      } catch (error) {
        return handleError(error, "Failed to fetch calendar stats");
      } finally {
        setLoading(false);
      }
    }, []);

  // Fetch event types
  const fetchEventTypesApi = useCallback(async (): Promise<EventType[]> => {
    setLoading(true);
    try {
      const response = await fetchEventTypes();
      return response.data;
    } catch (error) {
      return handleError(error, "Failed to fetch event types");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch upcoming events
  const fetchUpcomingEventsApi = useCallback(
    async (limit: number = 5): Promise<CalendarEvent[]> => {
      setLoading(true);
      try {
        const response = await fetchUpcomingEvents(limit);
        return response.data;
      } catch (error) {
        return handleError(error, "Failed to fetch upcoming events");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Set event reminder
  const setEventReminderApi = useCallback(
    async (
      eventId: string,
      minutesBefore: number,
      notificationType: "push" | "email" | "both" = "push",
    ): Promise<void> => {
      setLoading(true);
      try {
        await setEventReminder(eventId, minutesBefore, notificationType);
        Alert.alert("Success", "Reminder set successfully");
      } catch (error) {
        return handleError(error, "Failed to set reminder");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Move event
  const moveEventApi = useCallback(
    async (
      eventId: string,
      newDate: string,
      newTime: string,
    ): Promise<CalendarEvent> => {
      setLoading(true);
      try {
        const response = await moveEvent(eventId, newDate, newTime);
        Alert.alert("Success", "Event moved successfully");
        return response.data;
      } catch (error) {
        return handleError(error, "Failed to move event");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Add event note
  const addEventNoteApi = useCallback(
    async (eventId: string, note: string): Promise<CalendarEvent> => {
      setLoading(true);
      try {
        const response = await addEventNote(eventId, note);
        Alert.alert("Success", "Note added successfully");
        return response.data;
      } catch (error) {
        return handleError(error, "Failed to add note");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Search events
  const searchCalendarEventsApi = useCallback(
    async (
      query: string,
      filters?: CalendarFilters,
    ): Promise<CalendarEvent[]> => {
      setLoading(true);
      try {
        const response = await searchCalendarEvents(query, filters);
        return response.data;
      } catch (error) {
        return handleError(error, "Failed to search events");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    fetchCalendarEvents: fetchCalendarEventsApi,
    fetchPaginatedCalendarEvents: fetchPaginatedCalendarEventsApi,
    fetchEventsByDate: fetchEventsByDateApi,
    fetchAgendaView: fetchAgendaViewApi,
    fetchEventById: fetchEventByIdApi,
    createEvent: createEventApi,
    quickAddEvent: quickAddEventApi,
    updateEventStatus: updateEventStatusApi,
    updateEvent: updateEventApi,
    deleteEvent: deleteEventApi,
    fetchCalendarStats: fetchCalendarStatsApi,
    fetchEventTypes: fetchEventTypesApi,
    fetchUpcomingEvents: fetchUpcomingEventsApi,
    setEventReminder: setEventReminderApi,
    moveEvent: moveEventApi,
    addEventNote: addEventNoteApi,
    searchCalendarEvents: searchCalendarEventsApi,
  };
};
