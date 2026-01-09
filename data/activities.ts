// data/activities.ts
export interface Activity {
  id: string;
  type: 'call' | 'meeting' | 'note' | 'task' | 'email';
  title: string;
  contactName: string;
  company: string;
  description: string;
  date: string;
  time: string;
  duration: string | null;
  status: 'completed' | 'scheduled' | 'pending';
  priority: 'high' | 'medium' | 'low';
}

export const activityTypes = ['call', 'meeting', 'note', 'task', 'email'] as const;

export const activitiesData: Activity[] = [
  {
    id: '1',
    type: 'call',
    title: 'Follow-up Call',
    contactName: 'John Doe',
    company: 'TechCorp Inc.',
    description: 'Discussed product demo and pricing. Client showed interest in enterprise plan.',
    date: '2024-01-15',
    time: '10:30 AM',
    duration: '15 min',
    status: 'completed',
    priority: 'high'
  },
  {
    id: '2',
    type: 'meeting',
    title: 'Product Demo',
    contactName: 'Sarah Smith',
    company: 'Innovate Solutions',
    description: 'Live demo of premium features. Scheduled follow-up for next week.',
    date: '2024-01-15',
    time: '2:00 PM',
    duration: '1 hour',
    status: 'scheduled',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'note',
    title: 'Meeting Notes',
    contactName: 'Mike Johnson',
    company: 'Global Tech',
    description: 'Client expressed interest in enterprise plan. Need to send proposal.',
    date: '2024-01-14',
    time: '4:15 PM',
    duration: null,
    status: 'completed',
    priority: 'low'
  },
  {
    id: '4',
    type: 'task',
    title: 'Send Proposal',
    contactName: 'Emma Wilson',
    company: 'StartUp Labs',
    description: 'Prepare and send detailed proposal with pricing.',
    date: '2024-01-16',
    time: '11:00 AM',
    duration: null,
    status: 'pending',
    priority: 'high'
  },
  {
    id: '5',
    type: 'email',
    title: 'Follow-up Email',
    contactName: 'Robert Chen',
    company: 'Digital Dynamics',
    description: 'Sent product brochure and case studies. Awaiting response.',
    date: '2024-01-13',
    time: '3:45 PM',
    duration: null,
    status: 'completed',
    priority: 'medium'
  },
];