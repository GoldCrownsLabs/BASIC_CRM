// data/importData.ts
export const importOptions = [
  {
    id: 'contacts',
    title: 'Import Contacts',
    description: 'Add multiple contacts from CSV or Excel files',
    icon: 'users',
    supportedFormats: ['CSV', 'XLSX', 'XLS'],
    maxFileSize: '5 MB',
    steps: [
      'Download the template file',
      'Fill in contact details',
      'Upload your file',
      'Map columns if needed',
      'Review and import'
    ],
    templateUrl: 'https://example.com/templates/contacts.csv'
  },
  {
    id: 'leads',
    title: 'Import Leads',
    description: 'Import leads from external sources',
    icon: 'trending-up',
    supportedFormats: ['CSV', 'JSON'],
    maxFileSize: '5 MB',
    steps: [
      'Prepare lead data',
      'Ensure required fields are present',
      'Upload your file',
      'Map status fields',
      'Import leads'
    ],
    templateUrl: 'https://example.com/templates/leads.csv'
  },
  {
    id: 'companies',
    title: 'Import Companies',
    description: 'Add multiple companies at once',
    icon: 'briefcase',
    supportedFormats: ['CSV', 'XLSX'],
    maxFileSize: '5 MB',
    steps: [
      'Use provided template',
      'Add company details',
      'Upload file',
      'Verify data',
      'Complete import'
    ],
    templateUrl: 'https://example.com/templates/companies.csv'
  },
  {
    id: 'activities',
    title: 'Import Activities',
    description: 'Import past activities and interactions',
    icon: 'activity',
    supportedFormats: ['CSV'],
    maxFileSize: '10 MB',
    steps: [
      'Download activity template',
      'Add activity logs',
      'Upload for processing',
      'Review timeline',
      'Import activities'
    ],
    templateUrl: 'https://example.com/templates/activities.csv'
  }
];

export const exportOptions = [
  {
    id: 'contacts',
    title: 'Export Contacts',
    description: 'Download all contacts with details',
    icon: 'download',
    formats: ['CSV', 'Excel', 'PDF'],
    includes: ['Name, Email, Phone, Company, Position, Created Date'],
    estimatedTime: 'Instant'
  },
  {
    id: 'leads',
    title: 'Export Leads',
    description: 'Export leads with status and values',
    icon: 'trending-up',
    formats: ['CSV', 'Excel'],
    includes: ['Lead Name, Status, Value, Source, Created Date'],
    estimatedTime: 'Instant'
  },
  {
    id: 'activities',
    title: 'Export Activities',
    description: 'Download activity history and logs',
    icon: 'clock',
    formats: ['CSV', 'PDF'],
    includes: ['Activity Type, Contact, Date, Duration, Notes'],
    estimatedTime: 'Instant'
  },
  {
    id: 'reports',
    title: 'Export Reports',
    description: 'Generate and export detailed reports',
    icon: 'bar-chart',
    formats: ['PDF', 'Excel'],
    includes: ['Sales Summary, Activity Reports, Performance Metrics'],
    estimatedTime: '2-5 minutes'
  },
  {
    id: 'all-data',
    title: 'Export All Data',
    description: 'Complete backup of your CRM data',
    icon: 'database',
    formats: ['ZIP (JSON Files)'],
    includes: ['Everything: Contacts, Leads, Activities, Tasks, Settings'],
    estimatedTime: '5-10 minutes'
  }
];

export const recentActivities = [
  {
    id: '1',
    type: 'export',
    title: 'Contacts exported',
    description: 'CSV file with 245 contacts',
    date: '2 hours ago',
    status: 'completed',
    fileSize: '1.2 MB'
  },
  {
    id: '2',
    type: 'import',
    title: 'Leads imported',
    description: '50 new leads added',
    date: 'Yesterday',
    status: 'completed',
    fileSize: '0.8 MB'
  },
  {
    id: '3',
    type: 'export',
    title: 'Monthly report',
    description: 'PDF sales report for March',
    date: '3 days ago',
    status: 'completed',
    fileSize: '2.5 MB'
  },
  {
    id: '4',
    type: 'import',
    title: 'Contacts import failed',
    description: 'Invalid file format',
    date: '1 week ago',
    status: 'failed',
    fileSize: '3.1 MB'
  }
];

export const fileRequirements = {
  csv: {
    maxSize: '10 MB',
    requiredFields: {
      contacts: ['Name', 'Email'],
      leads: ['Name', 'Email', 'Status'],
      companies: ['Company Name', 'Industry']
    },
    tips: [
      'Use UTF-8 encoding for special characters',
      'Keep column headers exactly as in template',
      'Remove empty rows before uploading',
      'Dates should be in YYYY-MM-DD format'
    ]
  },
  excel: {
    maxSize: '20 MB',
    maxRows: '50,000',
    sheets: 'First sheet will be processed'
  }
};