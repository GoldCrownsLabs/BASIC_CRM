// contact.ts
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  status: 'active' | 'inactive';
  lastContact: string;
  tags: string[];
  source: string;
}

export const contactsData: Contact[] = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'john@example.com', 
    phone: '+1234567890', 
    company: 'ABC Corp',
    title: 'CEO',
    status: 'active',
    lastContact: '2024-01-15',
    tags: ['VIP', 'Regular'],
    source: 'Referral'
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    phone: '+0987654321', 
    company: 'XYZ Inc',
    title: 'Marketing Director',
    status: 'active',
    lastContact: '2024-01-14',
    tags: ['Hot Lead'],
    source: 'Website'
  },
  { 
    id: '3', 
    name: 'Bob Johnson', 
    email: 'bob@example.com', 
    phone: '+1122334455', 
    company: 'Tech Solutions',
    title: 'CTO',
    status: 'inactive',
    lastContact: '2024-01-10',
    tags: ['Cold'],
    source: 'Conference'
  },
  { 
    id: '4', 
    name: 'Alice Brown', 
    email: 'alice@example.com', 
    phone: '+5566778899', 
    company: 'Global Ltd',
    title: 'Sales Manager',
    status: 'active',
    lastContact: '2024-01-13',
    tags: ['VIP', 'Decision Maker'],
    source: 'Referral'
  },
  { 
    id: '5', 
    name: 'Charlie Wilson', 
    email: 'charlie@example.com', 
    phone: '+6677889900', 
    company: 'Startup Co',
    title: 'Founder',
    status: 'active',
    lastContact: '2024-01-12',
    tags: ['Hot Lead'],
    source: 'Social Media'
  },
  { 
    id: '6', 
    name: 'Diana Miller', 
    email: 'diana@example.com', 
    phone: '+7788990011', 
    company: 'Innovate LLC',
    title: 'Product Manager',
    status: 'inactive',
    lastContact: '2024-01-05',
    tags: ['Follow-up'],
    source: 'Email Campaign'
  },
  { 
    id: '7', 
    name: 'Edward Davis', 
    email: 'edward@example.com', 
    phone: '+8899001122', 
    company: 'Future Inc',
    title: 'VP Sales',
    status: 'active',
    lastContact: '2024-01-14',
    tags: ['VIP'],
    source: 'Referral'
  },
  { 
    id: '8', 
    name: 'Fiona Garcia', 
    email: 'fiona@example.com', 
    phone: '+9900112233', 
    company: 'Next Gen',
    title: 'CEO',
    status: 'active',
    lastContact: '2024-01-15',
    tags: ['Hot Lead', 'Decision Maker'],
    source: 'Website'
  },
  { 
    id: '9', 
    name: 'George Wilson', 
    email: 'george@example.com', 
    phone: '+1234567891', 
    company: 'Tech Corp',
    title: 'Developer',
    status: 'active',
    lastContact: '2024-01-14',
    tags: ['Regular'],
    source: 'Referral'
  },
  { 
    id: '10', 
    name: 'Helen Taylor', 
    email: 'helen@example.com', 
    phone: '+1234567892', 
    company: 'Design Studio',
    title: 'Designer',
    status: 'active',
    lastContact: '2024-01-13',
    tags: ['VIP'],
    source: 'Website'
  },
];

export const filters = ['All', 'Active', 'Inactive', 'VIP', 'Hot Lead'];
export const sortOptions = ['Recent', 'A-Z', 'Last Contact', 'Company'];