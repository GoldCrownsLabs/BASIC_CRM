// screens/CalendarPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  StatusBar,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { useCalendarApi } from "@/hooks/useCalendarApi";

import {
  eventConfig,
  statusConfig,
  months,
  weekDays,
  generateMonthDays,
  formatDate,
} from "@/data/calendar";
// ✅ Spelling fixed: "calendar.api" not "calender.api"

import CommonHeader from "@/components/common/CommonHeader";
import {
  CalendarEvent,
  CreateEventPayload,
  EventType,
} from "@/lib/api/calender.api";
import { CalendarDayCell } from "@/models/Calender/CalendarDayCell";
import { EventCard } from "@/models/Calender/EventCard";
import { CalendarHeader } from "@/models/Calender/CalendarHeader";
import { CalendarModal } from "@/models/Calender/CalendarModal";
import { EventDetailModal } from "@/models/Calender/EventDetailModal";
import { AddEventModal } from "@/models/Calender/AddEventModal";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const CalendarPage = () => {
  const { colors, isDark } = useAppTheme();
  const calendarApi = useCalendarApi();

  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"month" | "agenda">("agenda");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [agendaEvents, setAgendaEvents] = useState<CalendarEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showMonthCalendar, setShowMonthCalendar] = useState(true);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentMonthName = months[currentMonth];

  // Initialize calendar and fetch data
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const days = generateMonthDays(currentYear, currentMonth);
    setCalendarDays(days);
    loadEventsForMonth();
  }, [currentDate]);

  useEffect(() => {
    loadEventsForSelectedDate();
  }, [selectedDate, filterType, searchQuery]);

  useEffect(() => {
    loadAgendaEvents();
  }, [viewMode]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadEventTypes(),
        loadEventsForMonth(),
        loadEventsForSelectedDate(),
      ]);
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
  };

  const loadEventTypes = async () => {
    try {
      const types = await calendarApi.fetchEventTypes();
      setEventTypes(types);
    } catch (error) {
      console.error("Failed to load event types:", error);
      // ✅ Fallback event types
      const fallbackTypes: EventType[] = [
        {
          _id: "1",
          name: "meeting",
          color: "#3B82F6",
          icon: "calendar",
          description: "Business meetings",
          isActive: true,
          order: 1,
        },
        {
          _id: "2",
          name: "call",
          color: "#10B981",
          icon: "phone",
          description: "Phone calls",
          isActive: true,
          order: 2,
        },
        {
          _id: "3",
          name: "task",
          color: "#F59E0B",
          icon: "check-square",
          description: "Tasks to complete",
          isActive: true,
          order: 3,
        },
        {
          _id: "4",
          name: "deadline",
          color: "#EF4444",
          icon: "clock",
          description: "Important deadlines",
          isActive: true,
          order: 4,
        },
        {
          _id: "5",
          name: "reminder",
          color: "#8B5CF6",
          icon: "bell",
          description: "Reminders",
          isActive: true,
          order: 5,
        },
      ];
      setEventTypes(fallbackTypes);
    }
  };

  const loadEventsForMonth = async () => {
    try {
      const monthEvents = await calendarApi.fetchCalendarEvents({
        month: currentMonth + 1,
        year: currentYear,
      });

      // Update calendar days with events
      const updatedDays = calendarDays.map((day) => ({
        ...day,
        events: monthEvents.filter((event) => event.date === day.date),
      }));

      setCalendarDays(updatedDays);
      setEvents(monthEvents);
    } catch (error) {
      console.error("Failed to load month events:", error);
    }
  };

  const loadEventsForSelectedDate = async () => {
    try {
      const dateEvents = await calendarApi.fetchEventsByDate(selectedDate);
      const filteredEvents = dateEvents.filter((event) => {
        const matchesType = filterType === "all" || event.type === filterType;
        const matchesSearch =
          searchQuery === "" ||
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (event.contactName || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
      });
      setEvents(filteredEvents);
    } catch (error) {
      console.error("Failed to load date events:", error);
    }
  };

  const loadAgendaEvents = async () => {
    if (viewMode === "agenda") {
      try {
        const agenda = await calendarApi.fetchAgendaView(50);
        const filteredEvents = agenda.filter((event) => {
          const matchesType = filterType === "all" || event.type === filterType;
          const matchesSearch =
            searchQuery === "" ||
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (event.contactName || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          return matchesType && matchesSearch;
        });
        setAgendaEvents(filteredEvents);
      } catch (error) {
        console.error("Failed to load agenda events:", error);
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split("T")[0]);
  };

  // Event handlers
  const handleCreateEvent = async (eventData: CreateEventPayload) => {
    try {
      const newEvent = await calendarApi.createEvent(eventData);
      setEvents((prev) => [...prev, newEvent]);
      setShowAddModal(false);
      await loadEventsForMonth();
      await loadAgendaEvents();
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  const handleUpdateEventStatus = async (eventId: string, status: string) => {
    try {
      await calendarApi.updateEventStatus(eventId, { status: status as any });
      setEvents((prev) =>
        prev.map((event) =>
          event._id === eventId ? { ...event, status: status as any } : event,
        ),
      );
      setAgendaEvents((prev) =>
        prev.map((event) =>
          event._id === eventId ? { ...event, status: status as any } : event,
        ),
      );
      setShowEventModal(false);
    } catch (error) {
      console.error("Failed to update event status:", error);
    }
  };

  const handleSetReminder = async (eventId: string, minutesBefore: number) => {
    try {
      await calendarApi.setEventReminder(eventId, minutesBefore);
    } catch (error) {
      console.error("Failed to set reminder:", error);
    }
  };

  const handleMoveEvent = async (
    eventId: string,
    newDate: string,
    newTime: string,
  ) => {
    try {
      await calendarApi.moveEvent(eventId, newDate, newTime);
      await loadEventsForMonth();
      await loadEventsForSelectedDate();
      await loadAgendaEvents();
    } catch (error) {
      console.error("Failed to move event:", error);
    }
  };

  const handleEditEvent = () => {
    setShowEventModal(false);
    setTimeout(() => setShowAddModal(true), 300);
  };

  // ✅ Fixed: WeekDaysHeader से CommonHeader remove करें
  const WeekDaysHeader = () => (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: isDark ? colors.border + "80" : "#F8FAFC",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginTop: 4,
      }}
    >
      {weekDays.map((day) => (
        <View key={day} style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "900",
              color:
                day === "Sun" || day === "Sat"
                  ? isDark
                    ? "#F87171"
                    : "#EF4444"
                  : colors.textSecondary,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {day}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderMonthView = () => (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {showMonthCalendar && (
        <>
          <WeekDaysHeader />
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              backgroundColor: colors.card,
              paddingHorizontal: 4,
              paddingTop: 8,
              paddingBottom: 20,
            }}
          >
            {calendarDays.map((day, index) => (
              <CalendarDayCell
                key={index}
                day={day}
                isSelected={day.date === selectedDate}
                onPress={() => setSelectedDate(day.date)}
                width={width}
              />
            ))}
          </View>
        </>
      )}

      <View
        style={{
          backgroundColor: colors.background,
          paddingHorizontal: 20,
          paddingTop: showMonthCalendar ? 20 : 0,
          paddingBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            paddingHorizontal: 4,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 20, // ✅ Reduced from 24
                fontWeight: "700", // ✅ Changed from 900
                color: colors.text,
                letterSpacing: -0.5,
              }}
            >
              Events for {formatDate(selectedDate)}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 6,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: colors.primary,
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                {events.length} scheduled events
              </Text>
            </View>
          </View>
        </View>

        {calendarApi.loading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 12, color: colors.textSecondary }}>
              Loading events...
            </Text>
          </View>
        ) : events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onPress={(event) => {
                setSelectedEvent(event);
                setShowEventModal(true);
              }}
              eventConfig={eventConfig}
              statusConfig={statusConfig}
            />
          ))
        ) : (
          <EmptyState
            title="No Events for This Date"
            description={`Select a different date or add events for ${formatDate(selectedDate)}`}
            onAddEvent={() => setShowAddModal(true)}
          />
        )}
      </View>
    </ScrollView>
  );

  const renderAgendaView = () => (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View
        style={{
          backgroundColor: colors.background,
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            paddingHorizontal: 4,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 20, // ✅ Reduced from 24
                fontWeight: "700", // ✅ Changed from 900
                color: colors.text,
                letterSpacing: -0.5,
              }}
            >
              All Events (Agenda)
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 6,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: colors.primary,
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                {agendaEvents.length} total events
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: isDark ? colors.border : "#F3F4F6",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={() => setShowCalendarModal(true)}
            >
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: colors.text }}
              >
                Filter by Date
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {calendarApi.loading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 12, color: colors.textSecondary }}>
              Loading agenda...
            </Text>
          </View>
        ) : agendaEvents.length > 0 ? (
          agendaEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onPress={(event) => {
                setSelectedEvent(event);
                setShowEventModal(true);
              }}
              eventConfig={eventConfig}
              statusConfig={statusConfig}
            />
          ))
        ) : (
          <EmptyState
            title="No Events Scheduled"
            description="Add some events to see them in your agenda"
            onAddEvent={() => setShowAddModal(true)}
          />
        )}
      </View>
    </ScrollView>
  );

  const EmptyState = ({ title, description, onAddEvent }: any) => (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        backgroundColor: colors.card,
        borderRadius: 28,
        paddingHorizontal: 20,
        marginTop: 20,
        borderWidth: 2,
        borderColor: isDark ? colors.border + "50" : colors.border,
        borderStyle: "dashed",
      }}
    >
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: isDark
            ? colors.primary + "20"
            : colors.primary + "10",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
          borderWidth: 3,
          borderColor: colors.primary + "30",
        }}
      >
        <Feather name="calendar" size={48} color={colors.primary} />
      </View>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "900",
          color: colors.text,
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: colors.textSecondary,
          textAlign: "center",
          marginBottom: 32,
          lineHeight: 22,
          paddingHorizontal: 20,
        }}
      >
        {description}
      </Text>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.primary,
          paddingHorizontal: 28,
          paddingVertical: 16,
          borderRadius: 16,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }}
        onPress={onAddEvent}
      >
        <Feather name="plus-circle" size={22} color="#FFFFFF" />
        <Text
          style={{
            fontSize: 17,
            fontWeight: "800",
            color: "#FFFFFF",
            marginLeft: 12,
          }}
        >
          Schedule New Event
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ✅ Floating Action Button
  const FloatingActionButton = () => (
    <TouchableOpacity
      style={{
        position: "absolute",
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1000,
      }}
      onPress={() => setShowAddModal(true)}
    >
      <Feather name="plus" size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
  return (
    <>
      <CommonHeader title="Calendar" showSafeArea={true} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={colors.card}
        />

        <CalendarHeader
          viewMode={viewMode}
          currentMonthName={currentMonthName}
          currentYear={currentYear}
          onToggleViewMode={() =>
            setViewMode(viewMode === "month" ? "agenda" : "month")
          }
          onGoToToday={goToToday}
          onToggleCalendar={() => {
            if (viewMode === "month") {
              setShowMonthCalendar(!showMonthCalendar);
            } else {
              setShowCalendarModal(true);
            }
          }}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onOpenCalendarPicker={() => setShowCalendarModal(true)}
          onAddEvent={() => setShowAddModal(true)}
          showMonthCalendar={showMonthCalendar}
        />

        {viewMode === "month" ? renderMonthView() : renderAgendaView()}

        <FloatingActionButton />

        <CalendarModal
          visible={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          onSelectDate={setSelectedDate}
          currentDate={currentDate}
          selectedDate={selectedDate}
          calendarDays={calendarDays}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onGoToToday={goToToday}
        />

        <EventDetailModal
          visible={showEventModal}
          event={selectedEvent}
          onClose={() => setShowEventModal(false)}
          onEditEvent={handleEditEvent}
          onUpdateStatus={handleUpdateEventStatus}
          onSetReminder={handleSetReminder}
          onMoveEvent={handleMoveEvent}
          eventConfig={eventConfig}
          statusConfig={statusConfig}
        />

        <AddEventModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateEvent}
          selectedDate={selectedDate}
          onOpenCalendar={() => setShowCalendarModal(true)}
          eventTypes={eventTypes}
          loading={calendarApi.loading}
        />
      </SafeAreaView>
    </>
  );
};

export default CalendarPage;
