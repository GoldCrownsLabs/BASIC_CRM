// data/calendar.ts

// Interfaces पहले define करें
export interface CalendarEvent {
  id: string;
  title: string;
  type: 'meeting' | 'call' | 'task' | 'deadline' | 'reminder';
  date: string; // YYYY-MM-DD
  time: string;
  endTime?: string;
  duration: string;
  contactName: string;
  company?: string;
  description: string;
  location?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  reminder?: string; 
}

export interface CalendarDay {
  date: string;
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

// Constants
export const eventTypes = ['meeting', 'call', 'task', 'deadline', 'reminder'] as const;

export const eventConfig = {
  meeting: { icon: 'calendar' as const, color: '#3B82F6', bg: '#DBEAFE', label: 'Meeting' },
  call: { icon: 'phone' as const, color: '#10B981', bg: '#D1FAE5', label: 'Call' },
  task: { icon: 'check-square' as const, color: '#F59E0B', bg: '#FEF3C7', label: 'Task' },
  deadline: { icon: 'flag' as const, color: '#EF4444', bg: '#FEE2E2', label: 'Deadline' },
  reminder: { icon: 'bell' as const, color: '#8B5CF6', bg: '#EDE9FE', label: 'Reminder' },
};

export const statusConfig = {
  scheduled: { color: '#3B82F6', bg: '#DBEAFE', label: 'Scheduled' },
  'in-progress': { color: '#F59E0B', bg: '#FEF3C7', label: 'In Progress' },
  completed: { color: '#10B981', bg: '#D1FAE5', label: 'Completed' },
  cancelled: { color: '#6B7280', bg: '#E5E7EB', label: 'Cancelled' },
};

export const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Generate sample events
const generateEvents = (): CalendarEvent[] => [
  {
    id: '1',
    title: 'Product Demo',
    type: 'meeting',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    endTime: '11:30 AM',
    duration: '1.5h',
    contactName: 'John Doe',
    company: 'TechCorp Inc.',
    description: 'Live demo of premium features for enterprise client',
    location: 'Conference Room A',
    status: 'scheduled',
    priority: 'high',
    reminder: '30m'
  },
  {
    id: '2',
    title: 'Follow-up Call',
    type: 'call',
    date: new Date().toISOString().split('T')[0],
    time: '2:30 PM',
    duration: '30m',
    contactName: 'Sarah Smith',
    company: 'Innovate Solutions',
    description: 'Discuss proposal feedback and next steps',
    status: 'scheduled',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Send Proposal',
    type: 'task',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    duration: '1h',
    contactName: 'Mike Johnson',
    company: 'Global Tech',
    description: 'Prepare and send detailed proposal',
    status: 'in-progress',
    priority: 'high',
    reminder: '1h'
  },
  {
    id: '4',
    title: 'Quarterly Review',
    type: 'meeting',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: '3:00 PM',
    endTime: '4:30 PM',
    duration: '1.5h',
    contactName: 'Emma Wilson',
    company: 'StartUp Labs',
    description: 'Quarterly performance review meeting',
    location: 'Virtual - Zoom',
    status: 'scheduled',
    priority: 'medium',
    reminder: '1d'
  },
  {
    id: '5',
    title: 'Project Deadline',
    type: 'deadline',
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Day after tomorrow
    time: '5:00 PM',
    duration: '',
    contactName: 'Robert Chen',
    company: 'Digital Dynamics',
    description: 'Final project submission deadline',
    status: 'scheduled',
    priority: 'high'
  },
  {
    id: '6',
    title: 'Team Sync',
    type: 'meeting',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    time: '9:00 AM',
    endTime: '10:00 AM',
    duration: '1h',
    contactName: 'Team',
    description: 'Daily team sync meeting',
    status: 'completed',
    priority: 'low'
  },
];

// Export events
export const calendarEvents: CalendarEvent[] = generateEvents();

// Generate calendar days
export const generateCalendarDays = (year: number, month: number): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // First day of current month
  const firstDay = new Date(year, month, 1);
  // Last day of current month
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Day of week for first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDay.getDay();
  
  // Days in previous month
  const prevMonth = new Date(year, month, 0);
  const daysInPrevMonth = prevMonth.getDate();
  
  // Previous month's days (to fill calendar grid)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(year, month - 1, day);
    const dateStr = date.toISOString().split('T')[0];
    
    days.push({
      date: dateStr,
      day,
      month: month - 1,
      year,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      events: calendarEvents.filter(event => event.date === dateStr)
    });
  }
  
  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    
    days.push({
      date: dateStr,
      day,
      month,
      year,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      events: calendarEvents.filter(event => event.date === dateStr)
    });
  }
  
  // Next month's days (to complete 6 weeks = 42 days)
  const totalDays = 42; // 6 weeks
  const remainingDays = totalDays - days.length;
  
  for (let day = 1; day <= remainingDays; day++) {
    const nextMonth = month + 1 > 11 ? 0 : month + 1;
    const nextYear = month + 1 > 11 ? year + 1 : year;
    const date = new Date(nextYear, nextMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    
    days.push({
      date: dateStr,
      day,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      events: calendarEvents.filter(event => event.date === dateStr)
    });
  }
  
  return days;
};

// Format date to readable string
export const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    return dateStr;
  }
};

// Format time
export const formatTime = (timeStr: string): string => {
  // Simple time formatter
  return timeStr;
};

// Helper function to update event status
export const updateEventStatus = (id: string, status: CalendarEvent['status']): string => {
  console.log(`Event ${id} status updated to: ${status}`);
  return `Status updated to ${status}`;
};

// Get events for a specific date
export const getEventsForDate = (dateStr: string): CalendarEvent[] => {
  return calendarEvents.filter(event => event.date === dateStr);
};

// Filter events by type
export const filterEventsByType = (events: CalendarEvent[], type: string): CalendarEvent[] => {
  if (type === 'all') return events;
  return events.filter(event => event.type === type);
};

// Search events
export const searchEvents = (events: CalendarEvent[], query: string): CalendarEvent[] => {
  if (!query.trim()) return events;
  
  const searchTerm = query.toLowerCase();
  return events.filter(event => 
    event.title.toLowerCase().includes(searchTerm) ||
    event.contactName.toLowerCase().includes(searchTerm) ||
    (event.company?.toLowerCase() || '').includes(searchTerm) ||
    event.description.toLowerCase().includes(searchTerm)
  );
};

// Get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Check if date has events
export const hasEventsOnDate = (dateStr: string): boolean => {
  return calendarEvents.some(event => event.date === dateStr);
};

// Get events count for date
export const getEventCountForDate = (dateStr: string): number => {
  return calendarEvents.filter(event => event.date === dateStr).length;
};

// Generate month days (alias for generateCalendarDays for compatibility)
export const generateMonthDays = generateCalendarDays;

// Get current month and year
export const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth(),
    year: now.getFullYear()
  };
};

// Add new event
export const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>): CalendarEvent => {
  const newEvent: CalendarEvent = {
    ...event,
    id: Date.now().toString()
  };
  
  // In real app, you would update state or database here
  console.log('New event added:', newEvent);
  return newEvent;
};

// Delete event
export const deleteCalendarEvent = (id: string): boolean => {
  console.log(`Event ${id} deleted`);
  return true;
};

// Update event
export const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>): CalendarEvent | null => {
  console.log(`Event ${id} updated:`, updates);
  
  // In real app, find and update the event
  const event = calendarEvents.find(e => e.id === id);
  if (event) {
    return { ...event, ...updates };
  }
  return null;
};