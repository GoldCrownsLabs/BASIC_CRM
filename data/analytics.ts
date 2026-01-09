// data/analytics.ts
export interface AnalyticsData {
  overview: {
    totalLeads: number;
    activeLeads: number;
    conversionRate: string;
    totalActivities: number;
    pendingTasks: number;
    completedTasks: number;
    pipelineValue: string;
    avgResponseTime: string;
  };
  leadsByStatus: Array<{
    status: string;
    count: number;
    color: string;
    percentage: number;
  }>;
  activitiesByType: Array<{
    type: string;
    count: number;
    icon: string;
    color: string;
  }>;
  monthlyPerformance: Array<{
    month: string;
    leads: number;
    conversions: number;
  }>;
  topContacts: Array<{
    id: string;
    name: string;
    company: string;
    activities: number;
    value: string;
    status: 'hot' | 'warm' | 'cold';
  }>;
  weeklyTrends: Array<{
    day: string;
    leads: number;
    activities: number;
  }>;
}

export const analyticsData: AnalyticsData = {
  overview: {
    totalLeads: 156,
    activeLeads: 42,
    conversionRate: '28%',
    totalActivities: 289,
    pendingTasks: 18,
    completedTasks: 234,
    pipelineValue: '$80,500',
    avgResponseTime: '4.2h'
  },
  leadsByStatus: [
    { status: 'New', count: 42, color: '#3B82F6', percentage: 27 },
    { status: 'Contacted', count: 36, color: '#8B5CF6', percentage: 23 },
    { status: 'Qualified', count: 28, color: '#10B981', percentage: 18 },
    { status: 'Proposal', count: 24, color: '#F59E0B', percentage: 15 },
    { status: 'Negotiation', count: 16, color: '#EF4444', percentage: 10 },
    { status: 'Won', count: 10, color: '#059669', percentage: 6 },
  ],
  activitiesByType: [
    { type: 'Calls', count: 89, icon: 'phone', color: '#10B981' },
    { type: 'Meetings', count: 56, icon: 'calendar', color: '#3B82F6' },
    { type: 'Emails', count: 78, icon: 'mail', color: '#EF4444' },
    { type: 'Tasks', count: 42, icon: 'check-square', color: '#F59E0B' },
    { type: 'Notes', count: 24, icon: 'file-text', color: '#8B5CF6' },
  ],
  monthlyPerformance: [
    { month: 'Jan', leads: 42, conversions: 12 },
    { month: 'Feb', leads: 38, conversions: 10 },
    { month: 'Mar', leads: 52, conversions: 15 },
    { month: 'Apr', leads: 45, conversions: 13 },
    { month: 'May', leads: 48, conversions: 14 },
    { month: 'Jun', leads: 56, conversions: 16 },
  ],
  topContacts: [
    { id: '1', name: 'John Doe', company: 'TechCorp', activities: 24, value: '$25,000', status: 'hot' },
    { id: '2', name: 'Sarah Smith', company: 'Innovate Sol', activities: 18, value: '$18,500', status: 'hot' },
    { id: '3', name: 'Mike Johnson', company: 'Global Tech', activities: 16, value: '$15,000', status: 'warm' },
    { id: '4', name: 'Emma Wilson', company: 'StartUp Labs', activities: 14, value: '$12,000', status: 'warm' },
    { id: '5', name: 'Robert Chen', company: 'Digital Dyn', activities: 12, value: '$10,500', status: 'cold' },
  ],
  weeklyTrends: [
    { day: 'Mon', leads: 8, activities: 24 },
    { day: 'Tue', leads: 12, activities: 32 },
    { day: 'Wed', leads: 10, activities: 28 },
    { day: 'Thu', leads: 14, activities: 36 },
    { day: 'Fri', leads: 9, activities: 26 },
    { day: 'Sat', leads: 4, activities: 12 },
    { day: 'Sun', leads: 2, activities: 8 },
  ]
};

export const timeRanges = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'This Quarter' },
  { id: 'year', label: 'This Year' },
];

export const metrics = [
  { 
    key: 'totalLeads', 
    label: 'Total Leads', 
    value: 156,
    icon: 'users',
    color: '#3B82F6',
    change: '+12%',
    trend: 'up'
  },
  { 
    key: 'activeLeads', 
    label: 'Active Leads', 
    value: 42,
    icon: 'activity',
    color: '#10B981',
    change: '+8%',
    trend: 'up'
  },
  { 
    key: 'conversionRate', 
    label: 'Conversion Rate', 
    value: '28%',
    icon: 'trending-up',
    color: '#8B5CF6',
    change: '+3%',
    trend: 'up'
  },
  { 
    key: 'pipelineValue', 
    label: 'Pipeline Value', 
    value: '$80.5K',
    icon: 'dollar-sign',
    color: '#059669',
    change: '+15%',
    trend: 'up'
  },
];