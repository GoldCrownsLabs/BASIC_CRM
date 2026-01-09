// data/emailTemplates.ts
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: "welcome" | "followup" | "promotional" | "notification" | "other";
  description: string;
  content: string;
  isFavorite: boolean;
  lastUsed: string;
  useCount: number;
  tags: string[];
  variables: string[]; // Available variables like {{name}}, {{company}}, etc.
}

export const templateVariables = [
  "{{contact_name}}",
  "{{company_name}}",
  "{{date}}",
  "{{time}}",
  "{{product_name}}",
  "{{price}}",
  "{{discount}}",
  "{{meeting_date}}",
  "{{meeting_time}}",
  "{{call_to_action}}",
  "{{signature}}",
];

export const templateCategories = [
  { id: "all", label: "All Templates", icon: "grid" },
  { id: "welcome", label: "Welcome", icon: "user-plus", color: "#10B981" },
  { id: "followup", label: "Follow-up", icon: "refresh-cw", color: "#3B82F6" },
  {
    id: "promotional",
    label: "Promotional",
    icon: "trending-up",
    color: "#8B5CF6",
  },
  { id: "notification", label: "Notification", icon: "bell", color: "#F59E0B" },
  { id: "other", label: "Other", icon: "file-text", color: "#6B7280" },
];

// Sample email templates
export const emailTemplates: EmailTemplate[] = [
  {
    id: "1",
    name: "Welcome Email",
    subject: "Welcome to Our Platform, {{contact_name}}!",
    category: "welcome",
    description: "Send to new customers after signup",
    content: `Hi {{contact_name}},

Welcome to our platform! We're excited to have you on board.

At {{company_name}}, we're committed to helping you achieve your goals. Here's what you can do next:
1. Complete your profile
2. Explore our features
3. Schedule a demo call

Best regards,
The {{company_name}} Team

{{signature}}`,
    isFavorite: true,
    lastUsed: "2024-01-15",
    useCount: 42,
    tags: ["onboarding", "welcome", "new-user"],
    variables: ["{{contact_name}}", "{{company_name}}", "{{signature}}"],
  },
  {
    id: "2",
    name: "Follow-up After Meeting",
    subject: "Following up on our meeting",
    category: "followup",
    description: "Send after meetings or calls",
    content: `Dear {{contact_name}},

It was great speaking with you on {{date}} regarding {{product_name}}. As discussed, here's a summary:

Key Points:
- {{product_name}} features that match your needs
- Next steps for implementation
- Pricing details shared

Next Steps:
1. Review the proposal
2. Schedule follow-up call
3. Begin implementation

Please let me know if you have any questions.

Best regards,
Your Name
{{company_name}}

{{signature}}`,
    isFavorite: true,
    lastUsed: "2024-01-14",
    useCount: 28,
    tags: ["meeting", "followup", "sales"],
    variables: [
      "{{contact_name}}",
      "{{date}}",
      "{{product_name}}",
      "{{company_name}}",
      "{{signature}}",
    ],
  },
  {
    id: "3",
    name: "Product Launch Announcement",
    subject: "New Feature Launch: {{product_name}}",
    category: "promotional",
    description: "Announce new features or products",
    content: `Hello {{contact_name}},

We're excited to announce the launch of {{product_name}}! This new feature includes:

🎯 Key Benefits:
- Improved efficiency by 40%
- Enhanced user experience
- Better integration options

💰 Special Offer:
Get {{discount}}% off for the first 3 months!

📅 Next Steps:
1. Learn more about {{product_name}}
2. Schedule a personalized demo
3. Start your free trial

Click here to learn more: {{call_to_action}}

Best,
{{company_name}} Team

{{signature}}`,
    isFavorite: false,
    lastUsed: "2024-01-10",
    useCount: 15,
    tags: ["launch", "promotion", "feature"],
    variables: [
      "{{contact_name}}",
      "{{product_name}}",
      "{{discount}}",
      "{{call_to_action}}",
      "{{company_name}}",
      "{{signature}}",
    ],
  },
  {
    id: "4",
    name: "Meeting Reminder",
    subject: "Reminder: Meeting on {{meeting_date}} at {{meeting_time}}",
    category: "notification",
    description: "Send meeting reminders",
    content: `Hi {{contact_name}},

This is a friendly reminder about our scheduled meeting.

📅 Meeting Details:
Date: {{meeting_date}}
Time: {{meeting_time}}
Topic: {{product_name}} Discussion

📍 Location/Join Link:
[Meeting link will be shared]

Agenda:
1. Review current progress
2. Discuss next steps
3. Q&A session

Please let me know if you need to reschedule.

Looking forward to our discussion!

Best regards,
Your Name
{{company_name}}

{{signature}}`,
    isFavorite: true,
    lastUsed: "2024-01-12",
    useCount: 36,
    tags: ["reminder", "meeting", "schedule"],
    variables: [
      "{{contact_name}}",
      "{{meeting_date}}",
      "{{meeting_time}}",
      "{{product_name}}",
      "{{company_name}}",
      "{{signature}}",
    ],
  },
  {
    id: "5",
    name: "Proposal Submission",
    subject: "Proposal for {{company_name}}",
    category: "other",
    description: "Send business proposals",
    content: `Dear {{contact_name}},

Thank you for the opportunity to submit this proposal for {{company_name}}.

📋 Proposal Overview:
- Service: {{product_name}}
- Duration: 6 months
- Investment: {{price}}

🎯 Value Proposition:
- Increased efficiency
- Cost savings
- Improved results

📅 Proposed Timeline:
- Week 1-2: Planning & Setup
- Week 3-8: Implementation
- Week 9-12: Optimization

Next Steps:
1. Review the attached proposal
2. Schedule discussion call
3. Finalize agreement

Please find the detailed proposal attached.

Sincerely,
Your Name
{{company_name}}

{{signature}}`,
    isFavorite: false,
    lastUsed: "2024-01-08",
    useCount: 22,
    tags: ["proposal", "business", "sales"],
    variables: [
      "{{contact_name}}",
      "{{company_name}}",
      "{{product_name}}",
      "{{price}}",
      "{{signature}}",
    ],
  },
  {
    id: "6",
    name: "Thank You Email",
    subject: "Thank You, {{contact_name}}!",
    category: "other",
    description: "Send after purchases or meetings",
    content: `Hi {{contact_name}},

Thank you for your time and for choosing to work with {{company_name}}.

We truly appreciate:
- Your valuable insights during our meeting
- The opportunity to serve {{company_name}}
- Your trust in our services

Next Steps:
We'll follow up with the agreed action items within 24 hours.

If you have any immediate questions, please don't hesitate to reach out.

Warm regards,
Your Name
{{company_name}}

{{signature}}`,
    isFavorite: false,
    lastUsed: "2024-01-05",
    useCount: 18,
    tags: ["thankyou", "appreciation", "followup"],
    variables: ["{{contact_name}}", "{{company_name}}", "{{signature}}"],
  },
];
