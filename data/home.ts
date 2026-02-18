// src/data/home.ts

export const dashboardData = {
  stats: {
    totalLeads: 42,
    openTasks: 18,
    totalContacts: 156,
    todayActivities: 7,
    qualifiedLeads: 12,
    revenue: 125000,
  },


  

  recentActivities: [
    {
      id: 1,
      type: "call",
      title: "Call with John Doe",
      time: "10:30 AM",
      contact: "John Doe",
      status: "completed",
    },
    {
      id: 2,
      type: "meeting",
      title: "Meeting with ABC Corp",
      time: "2:00 PM",
      contact: "Sarah Smith",
      status: "upcoming",
    },
    {
      id: 3,
      type: "email",
      title: "Follow-up email sent",
      time: "4:45 PM",
      contact: "Mike Johnson",
      status: "completed",
    },
    {
      id: 4,
      type: "task",
      title: "Prepare proposal",
      time: "11:00 AM",
      contact: "ABC Corp",
      status: "pending",
    },
    {
      id: 5,
      type: "note",
      title: "Meeting notes updated",
      time: "3:30 PM",
      contact: "Emma Wilson",
      status: "completed",
    },
  ],

  topLeads: [
    {
      id: 1,
      name: "ABC Corporation",
      value: 50000,
      stage: "Proposal",
      days: 3,
    },
    {
      id: 2,
      name: "XYZ Enterprises",
      value: 35000,
      stage: "Negotiation",
      days: 5,
    },
    {
      id: 3,
      name: "Tech Solutions Inc",
      value: 25000,
      stage: "Qualified",
      days: 2,
    },
  ],

  performance: {
    conversionRate: 28,
    avgResponseTime: 2.5,
    tasksCompleted: 65,
  },
};

export const activityIcons = {
  call: "call-outline",
  meeting: "people-outline",
  email: "mail-outline",
  task: "checkmark-circle-outline",
  note: "document-text-outline",
};

export const stageColors = {
  New: "#4CAF50",
  Contacted: "#2196F3",
  Qualified: "#FF9800",
  Proposal: "#9C27B0",
  Negotiation: "#FF5722",
  Won: "#4CAF50",
  Lost: "#F44336",
};
