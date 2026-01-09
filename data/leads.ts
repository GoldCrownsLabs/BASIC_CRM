// data/leads.ts

// Mock data for leads
export const leadsData = [
  {
    id: '1',
    name: 'ABC Corporation',
    contact: 'John Smith',
    email: 'john@abccorp.com',
    phone: '+1234567890',
    value: 50000,
    stage: 'New',
    source: 'Website',
    created: '2024-01-15',
    expectedClose: '2024-02-28',
    priority: 'High',
    notes: 'Interested in enterprise solution'
  },
  {
    id: '2',
    name: 'XYZ Enterprises',
    contact: 'Sarah Johnson',
    email: 'sarah@xyz.com',
    phone: '+0987654321',
    value: 35000,
    stage: 'Contacted',
    source: 'Referral',
    created: '2024-01-14',
    expectedClose: '2024-03-15',
    priority: 'Medium',
    notes: 'Scheduled demo next week'
  },
  {
    id: '3',
    name: 'Tech Solutions Inc',
    contact: 'Mike Brown',
    email: 'mike@techsolutions.com',
    phone: '+1122334455',
    value: 25000,
    stage: 'Qualified',
    source: 'Conference',
    created: '2024-01-10',
    expectedClose: '2024-02-20',
    priority: 'High',
    notes: 'Decision maker identified'
  },
  {
    id: '4',
    name: 'Global Trading Co',
    contact: 'Emma Wilson',
    email: 'emma@globaltrading.com',
    phone: '+5566778899',
    value: 75000,
    stage: 'Proposal',
    source: 'LinkedIn',
    created: '2024-01-13',
    expectedClose: '2024-03-10',
    priority: 'High',
    notes: 'Proposal sent, waiting for feedback'
  },
  {
    id: '5',
    name: 'Innovate Labs',
    contact: 'David Lee',
    email: 'david@innovatelabs.com',
    phone: '+6677889900',
    value: 42000,
    stage: 'Negotiation',
    source: 'Email Campaign',
    created: '2024-01-12',
    expectedClose: '2024-02-15',
    priority: 'Medium',
    notes: 'Finalizing contract terms'
  },
  {
    id: '6',
    name: 'Digital Minds',
    contact: 'Lisa Chen',
    email: 'lisa@digitalminds.com',
    phone: '+7788990011',
    value: 18000,
    stage: 'Won',
    source: 'Website',
    created: '2024-01-05',
    expectedClose: '2024-01-31',
    priority: 'Low',
    notes: 'Deal closed successfully'
  },
  {
    id: '7',
    name: 'NextGen Systems',
    contact: 'Robert Taylor',
    email: 'robert@nextgen.com',
    phone: '+8899001122',
    value: 92000,
    stage: 'Lost',
    source: 'Referral',
    created: '2024-01-08',
    expectedClose: '2024-02-10',
    priority: 'Medium',
    notes: 'Went with competitor'
  },
  {
    id: '8',
    name: 'Future Enterprises',
    contact: 'Sophia Martinez',
    email: 'sophia@future.com',
    phone: '+9900112233',
    value: 31000,
    stage: 'Qualified',
    source: 'Trade Show',
    created: '2024-01-15',
    expectedClose: '2024-03-05',
    priority: 'High',
    notes: 'Strong interest shown'
  },
  {
    id: '9',
    name: 'Tech Giants Inc',
    contact: 'Alex Turner',
    email: 'alex@techgiants.com',
    phone: '+1122334466',
    value: 68000,
    stage: 'Contacted',
    source: 'LinkedIn',
    created: '2024-01-16',
    expectedClose: '2024-03-20',
    priority: 'High',
    notes: 'Initial meeting scheduled'
  },
  {
    id: '10',
    name: 'Cloud Solutions',
    contact: 'Maria Garcia',
    email: 'maria@cloud.com',
    phone: '+2233445566',
    value: 45000,
    stage: 'Proposal',
    source: 'Website',
    created: '2024-01-14',
    expectedClose: '2024-02-25',
    priority: 'Medium',
    notes: 'Waiting for budget approval'
  },
];

// Lead stages with colors and order
export const leadStages = [
  { id: 'new', label: 'New', color: '#4CAF50' },
  { id: 'contacted', label: 'Contacted', color: '#2196F3' },
  { id: 'qualified', label: 'Qualified', color: '#FF9800' },
  { id: 'proposal', label: 'Proposal', color: '#9C27B0' },
  { id: 'negotiation', label: 'Negotiation', color: '#FF5722' },
  { id: 'won', label: 'Won', color: '#4CAF50' },
  { id: 'lost', label: 'Lost', color: '#F44336' },
];

export const leadSources = ['Website', 'Referral', 'Conference', 'LinkedIn', 'Email Campaign', 'Trade Show', 'Social Media'];
export const priorities = ['High', 'Medium', 'Low'];