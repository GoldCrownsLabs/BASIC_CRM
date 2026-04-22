// components/email-templates/types.ts

export interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  description: string;
  category: string;
  categoryColor?: string;
  tags: string[];
  variables: string[];
  isFavorite: boolean;
  useCount: number;
  lastUsed: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };

  // 🔥 NEW FIELDS FOR BETTER FUNCTIONALITY
  // Default recipient settings
  defaultRecipients?: Array<{
    type: "contact" | "lead" | "email";
    id?: string; // For contact/lead ID
    email: string;
    name?: string;
  }>;

  // Template variables mapping - for dynamic replacement
  variableMapping?: Record<string, string>; // e.g., { "[name]": "contact.firstName", "[company]": "contact.company" }

  // Usage tracking
  lastRecipients?: Array<{
    email: string;
    name: string;
    type: "contact" | "lead";
    sentAt: string;
  }>;

  // Email sending options
  emailOptions?: {
    cc?: string[];
    bcc?: string[];
    replyTo?: string;
    attachments?: boolean;
  };

  // Template formatting
  format?: "plain" | "html" | "rich";

  // Sharing settings
  isPublic?: boolean;
  sharedWith?: Array<{
    userId: string;
    email: string;
    permission: "view" | "edit" | "use";
  }>;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface Stats {
  total: number;
  favorites: number;
  totalUses: number;
  dailyLimit: number;
  remainingToday: number;

  // 🔥 NEW STATS FIELDS
  usageByCategory?: Record<string, number>;
  topRecipients?: Array<{
    email: string;
    count: number;
    lastUsed: string;
  }>;
  successRate?: number; // Percentage of emails sent successfully
}

export interface NewTemplateForm {
  name: string;
  subject: string;
  category: string;
  description: string;
  content: string;
  tags: string[];

  // 🔥 NEW FORM FIELDS
  defaultRecipients?: Array<{
    type: "contact" | "lead" | "email";
    email: string;
    name?: string;
  }>;
  variableMapping?: Record<string, string>;
  emailOptions?: {
    cc?: string[];
    bcc?: string[];
  };
  format?: "plain" | "html" | "rich";
}

export interface ApiTemplate {
  _id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
  variables: string[];
  customVariables: any[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
    companyEmail?: string;
  };
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  __v: number;

  // 🔥 API SHOULD ALSO RETURN THESE
  defaultRecipients?: Array<{
    type: string;
    email: string;
    name?: string;
  }>;
  useCount?: number;
  lastUsed?: string;
  isFavorite?: boolean;
}

// 🔥 NEW: Recipient types for better type safety
export type RecipientType = "contact" | "lead" | "email";

export interface Recipient {
  id?: string; // For contact/lead ID
  email: string;
  name: string;
  type: RecipientType;
  avatar?: string;
  company?: string;
  jobTitle?: string;

  // Contact specific
  firstName?: string;
  lastName?: string;
  phone?: string;

  // Lead specific
  status?: string;
  priority?: string;
  budget?: number;
}

// 🔥 NEW: Email send options
export interface EmailSendOptions {
  to: Recipient | Recipient[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string;
  }>;
  templateId?: string;
  scheduledAt?: string;
}

// 🔥 NEW: Email send response
export interface EmailSendResponse {
  success: boolean;
  message: string;
  
  messageId?: string;
  recipients: string[];
  failedRecipients?: Array<{
    email: string;
    reason: string;
  }>;
}

// 🔥 NEW: Template usage analytics
export interface TemplateUsage {

  templateId: string;
  templateName: string;
  totalSends: number;
  uniqueRecipients: number;
  successRate: number;
  lastSent: string;
  usageByDay: Array<{
    date: string;
    count: number;
  }>;
  topRecipients: Array<{
    email: string;
    name: string;
    count: number;
  }>;
}
