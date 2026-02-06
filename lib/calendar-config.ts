// lib/calendar-config.ts
export interface EventConfigItem {
  icon: string;
  color: string;
  bg: string;
  label: string;
}

export interface StatusConfigItem {
  label: string;
  color: string;
}

export interface CalendarConfig {
  eventConfig: Record<string, EventConfigItem>;
  statusConfig: Record<string, StatusConfigItem>;
  eventTypes: readonly string[];
  months: string[];
  weekDays: string[];
}

export const calendarConfig: CalendarConfig = {
  eventConfig: {
    meeting: {
      icon: "calendar",
      color: "#3B82F6",
      bg: "#EFF6FF",
      label: "Meeting",
    },
    call: { icon: "phone", color: "#10B981", bg: "#ECFDF5", label: "Call" },
    task: {
      icon: "check-square",
      color: "#F59E0B",
      bg: "#FFFBEB",
      label: "Task",
    },
    deadline: {
      icon: "clock",
      color: "#EF4444",
      bg: "#FEF2F2",
      label: "Deadline",
    },
    reminder: {
      icon: "bell",
      color: "#8B5CF6",
      bg: "#F5F3FF",
      label: "Reminder",
    },
  },

  statusConfig: {
    scheduled: { label: "Scheduled", color: "#3B82F6" },
    "in-progress": { label: "In Progress", color: "#F59E0B" },
    completed: { label: "Completed", color: "#10B981" },
    cancelled: { label: "Cancelled", color: "#EF4444" },
  },

  eventTypes: ["meeting", "call", "task", "deadline", "reminder"] as const,

  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],

  weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

// Helper functions
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const generateMonthDays = (
  year: number,
  month: number,
  events: any[] = [],
) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const days = [];

  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = 0; i < startingDay; i++) {
    const day = prevMonthLastDay - startingDay + i + 1;
    const date = new Date(year, month - 1, day);
    days.push({
      day,
      date: date.toISOString().split("T")[0],
      isCurrentMonth: false,
      isToday: false,
      weekDay: date.getDay(),
      events: [],
    });
  }

  // Current month days
  const today = new Date();
  const todayDateString = today.toISOString().split("T")[0];

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dateString = date.toISOString().split("T")[0];

    days.push({
      day: i,
      date: dateString,
      isCurrentMonth: true,
      isToday: dateString === todayDateString,
      weekDay: date.getDay(),
      events: events.filter((event: any) => event.date === dateString),
    });
  }

  // Next month days
  const totalDays = days.length;
  const remainingDays = 42 - totalDays;

  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    const dateString = date.toISOString().split("T")[0];

    days.push({
      day: i,
      date: dateString,
      isCurrentMonth: false,
      isToday: false,
      weekDay: date.getDay(),
      events: [],
    });
  }

  return days;
};

// Destructure for easy imports
export const { eventConfig, statusConfig, eventTypes, months, weekDays } =
  calendarConfig;
