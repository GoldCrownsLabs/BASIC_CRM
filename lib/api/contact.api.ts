// contact.api.ts
import api from "./index";

// ===================== INTERFACES =====================

export interface Address {
  
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface StatusHistoryItem {
  status: "cold" | "warm" | "hot" | "connected" | "completed";
  changedAt: Date | string;
  changedBy: string;
  notes?: string;
}

export interface Contact {
  _id: string;
  userId: string;
  firstName: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  address?: Address;
  source:
    | "website"
    | "referral"
    | "social"
    | "call"
    | "email"
    | "meeting"
    | "event"
    | "other";

  tags?: string[];
  notes?: string;
  lastContacted?: Date | string;
  isFavorite: boolean;

  // 🔥 NEW FIELDS
  leadStatus: "cold" | "warm" | "hot" | "connected" | "completed";
  connected: boolean;
  connectedAt?: Date | string;
  connectedNotes?: string;
  completed: boolean;
  completedAt?: Date | string;
  completedNotes?: string;
  dealValue: number;
  dealCurrency: "INR" | "USD" | "EUR" | "GBP";
  dealClosedDate?: Date | string;
  statusHistory: StatusHistoryItem[];

  // Soft delete
  isDeleted: boolean;
  deletedAt?: Date | string;

  // Timestamps
  lastModified: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Virtual fields (calculated)
  fullName?: string;
  completionPercentage?: number;
}

export interface ContactPayload {
  firstName: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  address?: Address;
  source?:
    | "website"
    | "referral"
    | "social"
    | "call"
    | "email"
    | "meeting"
    | "event" // 🔥 YEH ADD KARO
    | "other";
  tags?: string[];
  notes?: string;
  lastContacted?: Date | string;
  isFavorite?: boolean;

  leadStatus?: "cold" | "warm" | "hot" | "connected" | "completed";
  connected?: boolean;
  connectedNotes?: string;
  completed?: boolean;
  completedNotes?: string;
  dealValue?: number;
  dealCurrency?: "INR" | "USD" | "EUR" | "GBP";
}

export interface LeadPayload {
  name: string;
  phone: string;
  status: "cold" | "warm" | "hot" | "connected" | "completed";
  source?: string;
  company?: string;
  email?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateContactPayload extends Partial<ContactPayload> {}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  company?: string;
  tag?: string;
  leadStatus?: string; // 🔥 NEW: Filter by lead status
  connected?: boolean | string; // 🔥 NEW: Filter by connected
  completed?: boolean | string; // 🔥 NEW: Filter by completed
  isFavorite?: boolean | string;
  source?: string;
  minDealValue?: number; // 🔥 NEW: Filter by min deal value
  maxDealValue?: number; // 🔥 NEW: Filter by max deal value
  dateFrom?: string; // 🔥 NEW: Filter by date range
  dateTo?: string; // 🔥 NEW: Filter by date range
}

export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
}

export interface FilterStats {
  connected: number;
  completed: number;
  totalRevenue: number;
  averageDealValue: number;
  lifetimeRevenue: number;
  statusBreakdown: Record<string, number>;
}

export interface ContactsResponse {
  message: string;
  success: boolean;
  count: number;
  data: Contact[];
  stats: FilterStats; // 🔥 NEW: Filter stats
  pagination: PaginationResponse;
}

export interface SingleContactResponse {
  message: string;
  success: boolean;
  data: Contact;
}

// 🔥 NEW: Enhanced stats response interface
export interface StatsResponse {
  success: boolean;
  data: {
    overview: {
      total: number;
      recentWeek: number;
      recentMonth: number;
      favorites: number;
      deleted: number;
    };
    bySource: Array<{ source: string; count: number }>;
    pipeline: {
      connected: number;
      completed: number;
      conversionRate: number;
      connectionRate: number;
      leadStatus: Record<string, number>;
    };
    revenue: {
      total: number;
      average: number;
      max: number;
      min: number;
      dealCount: number;
      yearly: number;
    };
    monthlyRevenue: Array<{
      month: string;
      total: number;
      count: number;
    }>;
    topSources: Array<{
      source: string;
      count: number;
      revenue: number;
    }>;
    averageDealSizes: Record<string, { average: number; count: number }>;
    recentCompleted: Array<{
      id: string;
      name: string;
      company?: string;
      dealValue: number;
      completedAt: Date | string;
    }>;
    avgCompletion: number;
  };
}

export interface TagStat {
  tag: string;
  count: number;
  connected: number;
  completed: number;
  revenue: number;
  avgDealValue: number;
  conversionRate: number;
}

export interface TagStatsResponse {
  success: boolean;
  data: TagStat[];
}

export interface BatchSyncItem {
  _id?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  tags?: string[];
  notes?: string;
  source?:
    | "website"
    | "referral"
    | "social"
    | "call"
    | "email"
    | "meeting"
    | "event"
    | "other";
  isFavorite?: boolean;
  lastContacted?: Date | string;
  leadStatus?: string; // 🔥 NEW
  connected?: boolean; // 🔥 NEW
  completed?: boolean; // 🔥 NEW
  dealValue?: number; // 🔥 NEW
  dealCurrency?: string; // 🔥 NEW
}

export interface BatchSyncPayload {
  contacts: BatchSyncItem[];
  options?: {
    overwriteExisting?: boolean;
    skipDuplicates?: boolean;
  };
}

export interface BatchSyncResponse {
  success: boolean;
  data: {
    created: Array<{ id: string; email?: string }>;
    updated: Array<{ id: string; email?: string }>;
    skipped: Array<{ id: string; email?: string; reason: string }>;
    errors: Array<{
      contact: string;
      error: string;
    }>;
  };
  summary: {
    totalProcessed: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  message: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: string[];
  error?: string;
}

// 🔥 NEW: Performance report interface
export interface PerformanceReportResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar?: string;
      department?: string;
    };
    period: {
      from: Date | string;
      to: Date | string;
    };
    performance: {
      connected: {
        count: number;
        firstConnection?: Date | string;
        lastConnection?: Date | string;
      };
      completed: {
        count: number;
        totalRevenue: number;
        avgDealValue: number;
        maxDealValue: number;
        minDealValue: number;
        firstDeal?: Date | string;
        lastDeal?: Date | string;
      };
      lifetime: {
        totalDeals: number;
        totalRevenue: number;
        avgDealValue: number;
      };
      conversionRate: number;
      daily: Array<{
        date: string;
        deals: number;
        revenue: number;
      }>;
      sourcePerformance: Array<{
        source: string;
        count: number;
        revenue: number;
      }>;
    };
  };
}

// ===================== API FUNCTIONS =====================

/**
 * Get all contacts with pagination and filters
 */
export const getContacts = async (
  params?: PaginationParams,
): Promise<ContactsResponse> => {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });
  }

  const response = await api.get<ContactsResponse>(
    `/contacts${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
  return response.data;
};

/**
 * Get single contact by ID
 */
export const getContactById = async (
  id: string,
): Promise<SingleContactResponse> => {
  const response = await api.get<SingleContactResponse>(`/contacts/${id}`);
  return response.data;
};

/**
 * Create new contact
 */
export const createContact = async (
  payload: ContactPayload,
): Promise<SingleContactResponse> => {
  const response = await api.post<SingleContactResponse>("/contacts", payload);
  return response.data;
};

/**
 * Create lead (compatibility function - updated)
 */
export const createLead = async (
  payload: LeadPayload,
): Promise<SingleContactResponse> => {
  // Convert lead payload to contact payload
  const nameParts = payload.name.split(" ");
  const contactPayload: ContactPayload = {
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || undefined,
    phone: payload.phone,
    email: payload.email,
    company: payload.company,
    source: (payload.source as any) || "website",
    tags: ["lead", payload.status],
    notes: `Lead from ${payload.source || "website"} - Status: ${payload.status}`,
    isFavorite: false,
    leadStatus: payload.status, // 🔥 NEW: Set lead status
  };

  return createContact(contactPayload);
};

/**
 * Update contact
 */
export const updateContact = async (
  id: string,
  payload: UpdateContactPayload,
): Promise<SingleContactResponse> => {
  const response = await api.put<SingleContactResponse>(
    `/contacts/${id}`,
    payload,
  );
  return response.data;
};

/**
 * Toggle favorite status
 */
export const toggleFavorite = async (
  id: string,
): Promise<SingleContactResponse> => {
  const response = await api.patch<SingleContactResponse>(
    `/contacts/${id}/favorite`,
  );
  return response.data;
};

// 🔥 NEW: Mark contact as connected
export const markAsConnected = async (
  id: string,
  notes?: string,
): Promise<SingleContactResponse> => {
  const response = await api.patch<SingleContactResponse>(
    `/contacts/${id}/connected`,
    { notes },
  );
  return response.data;
};

// 🔥 NEW: Mark contact as completed (deal closed)
export const markAsCompleted = async (
  id: string,
  dealValue: number,
  notes?: string,
  currency: string = "INR",
): Promise<SingleContactResponse> => {
  const response = await api.patch<SingleContactResponse>(
    `/contacts/${id}/completed`,
    { dealValue, notes, currency },
  );
  return response.data;
};

// 🔥 NEW: Get user performance report
export const getUserPerformance = async (params?: {
  from?: string;
  to?: string;
  userId?: string;
}): Promise<PerformanceReportResponse> => {
  const queryParams = new URLSearchParams();

  if (params) {
    if (params.from) queryParams.append("from", params.from);
    if (params.to) queryParams.append("to", params.to);
    if (params.userId) queryParams.append("userId", params.userId);
  }

  const response = await api.get<PerformanceReportResponse>(
    `/contacts/performance${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
  );
  return response.data;
};

/**
 * Soft delete contact
 */
export const deleteContact = async (
  id: string,
): Promise<{ success: boolean; message: string; data: { id: string } }> => {
  const response = await api.delete<{
    success: boolean;
    message: string;
    data: { id: string };
  }>(`/contacts/${id}`);
  return response.data;
};

/**
 * Get contact statistics (enhanced)
 */
export const getContactStats = async (): Promise<StatsResponse> => {
  const response = await api.get<StatsResponse>("/contacts/stats/count");
  return response.data;
};

/**
 * Get tag statistics (enhanced)
 */
export const getTagStats = async (): Promise<TagStatsResponse> => {
  const response = await api.get<TagStatsResponse>("/contacts/stats/tags");
  return response.data;
};

/**
 * Batch sync contacts (enhanced)
 */
export const batchSyncContacts = async (
  payload: BatchSyncPayload,
): Promise<BatchSyncResponse> => {
  const response = await api.post<BatchSyncResponse>(
    "/contacts/batch",
    payload,
  );
  return response.data;
};

/**
 * Get unique companies for autocomplete
 */
export const getCompanies = async (
  search?: string,
): Promise<{ success: boolean; data: string[] }> => {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await api.get<{ success: boolean; data: string[] }>(
    `/contacts/companies${params}`,
  );
  return response.data;
};

/**
 * Get unique tags for autocomplete
 */
export const getTags = async (
  search?: string,
): Promise<{ success: boolean; data: string[] }> => {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await api.get<{ success: boolean; data: string[] }>(
    `/contacts/tags${params}`,
  );
  return response.data;
};

/**
 * Export contacts (CSV/Excel) - includes new fields
 */
export const exportContacts = async (
  format: "csv" | "excel" = "csv",
  filters?: PaginationParams,
): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  queryParams.append("format", format);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });
  }

  const response = await api.get(`/contacts/export?${queryParams.toString()}`, {
    responseType: "blob",
  });
  return response.data;
};

// ===================== UTILITY FUNCTIONS =====================

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone?: string): string => {
  if (!phone) return "";

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  } else if (cleaned.length > 10) {
    return `+${cleaned.substring(0, cleaned.length - 10)} (${cleaned.substring(cleaned.length - 10, cleaned.length - 7)}) ${cleaned.substring(cleaned.length - 7, cleaned.length - 4)}-${cleaned.substring(cleaned.length - 4)}`;
  }

  return phone;
};

/**
 * Get full name from contact
 */
export const getFullName = (
  contact: Pick<Contact, "firstName" | "lastName">,
): string => {
  return `${contact.firstName}${contact.lastName ? ` ${contact.lastName}` : ""}`;
};

/**
 * Format address for display
 */
export const formatAddress = (address?: Address): string => {
  if (!address) return "";

  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ].filter(Boolean);

  return parts.join(", ");
};

// 🔥 NEW: Format currency
export const formatCurrency = (
  amount: number,
  currency: string = "INR",
): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// 🔥 NEW: Get status color for UI
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    cold: "#9e9e9e", // Grey
    warm: "#ff9800", // Orange
    hot: "#f44336", // Red
    connected: "#2196f3", // Blue
    completed: "#4caf50", // Green
  };
  return colors[status] || "#9e9e9e";
};

// 🔥 NEW: Get status icon
export const getStatusIcon = (status: string): string => {
  const icons: Record<string, string> = {
    cold: "❄️",
    warm: "🌤️",
    hot: "🔥",
    connected: "📞",
    completed: "✅",
  };
  return icons[status] || "📌";
};

/**
 * Sort contacts by various criteria (updated)
 */
export const sortContacts = (
  contacts: Contact[],
  field: keyof Contact = "lastModified",
  direction: "asc" | "desc" = "desc",
): Contact[] => {
  return [...contacts].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];

    // Handle undefined/null values - put them at the end
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    // Handle date fields specifically
    const dateFields: (keyof Contact)[] = [
      "createdAt",
      "updatedAt",
      "lastModified",
      "lastContacted",
      "connectedAt",
      "completedAt",
      "dealClosedDate",
    ];

    if (dateFields.includes(field)) {
      const aTimestamp = new Date(aValue as Date | string).getTime();
      const bTimestamp = new Date(bValue as Date | string).getTime();

      if (aTimestamp < bTimestamp) return direction === "asc" ? -1 : 1;
      if (aTimestamp > bTimestamp) return direction === "asc" ? 1 : -1;
      return 0;
    }

    // Handle string comparison
    if (typeof aValue === "string" && typeof bValue === "string") {
      const aStr = aValue.toLowerCase();
      const bStr = bValue.toLowerCase();

      if (aStr < bStr) return direction === "asc" ? -1 : 1;
      if (aStr > bStr) return direction === "asc" ? 1 : -1;
      return 0;
    }

    // Handle number comparison (for dealValue)
    if (typeof aValue === "number" && typeof bValue === "number") {
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Handle boolean comparison
    if (typeof aValue === "boolean" && typeof bValue === "boolean") {
      const aNum = aValue ? 1 : 0;
      const bNum = bValue ? 1 : 0;
      return direction === "asc" ? aNum - bNum : bNum - aNum;
    }

    return 0;
  });
};

/**
 * Filter contacts by search term (updated)
 */
export const filterContacts = (
  contacts: Contact[],
  searchTerm: string,
): Contact[] => {
  if (!searchTerm.trim()) return contacts;

  const term = searchTerm.toLowerCase();
  return contacts.filter((contact) => {
    return (
      contact.firstName.toLowerCase().includes(term) ||
      (contact.lastName && contact.lastName.toLowerCase().includes(term)) ||
      (contact.email && contact.email.toLowerCase().includes(term)) ||
      (contact.company && contact.company.toLowerCase().includes(term)) ||
      (contact.phone && contact.phone.includes(term)) ||
      (contact.leadStatus && contact.leadStatus.toLowerCase().includes(term)) ||
      (contact.tags &&
        contact.tags.some((tag) => tag.toLowerCase().includes(term))) ||
      (contact.connectedNotes &&
        contact.connectedNotes.toLowerCase().includes(term)) ||
      (contact.completedNotes &&
        contact.completedNotes.toLowerCase().includes(term))
    );
  });
};

// 🔥 NEW: Calculate pipeline conversion
export const calculatePipelineConversion = (
  contacts: Contact[],
): {
  coldToWarm: number;
  warmToHot: number;
  hotToConnected: number;
  connectedToCompleted: number;
  overall: number;
} => {
  const cold = contacts.filter((c) => c.leadStatus === "cold").length;
  const warm = contacts.filter((c) => c.leadStatus === "warm").length;
  const hot = contacts.filter((c) => c.leadStatus === "hot").length;
  const connected = contacts.filter((c) => c.leadStatus === "connected").length;
  const completed = contacts.filter((c) => c.leadStatus === "completed").length;

  return {
    coldToWarm: cold > 0 ? (warm / cold) * 100 : 0,
    warmToHot: warm > 0 ? (hot / warm) * 100 : 0,
    hotToConnected: hot > 0 ? (connected / hot) * 100 : 0,
    connectedToCompleted: connected > 0 ? (completed / connected) * 100 : 0,
    overall: contacts.length > 0 ? (completed / contacts.length) * 100 : 0,
  };
};

// 🔥 NEW: Calculate total revenue
export const calculateTotalRevenue = (contacts: Contact[]): number => {
  return contacts
    .filter((c) => c.completed)
    .reduce((sum, c) => sum + (c.dealValue || 0), 0);
};

// Default export all API functions
export default {
  // Core CRUD
  getContacts,
  getContactById,
  createContact,
  updateContact,
  toggleFavorite,
  deleteContact,

  // New status operations
  markAsConnected,
  markAsCompleted,

  // Stats & Reports
  getContactStats,
  getTagStats,
  getUserPerformance,

  // Batch operations
  batchSyncContacts,

  // Utility endpoints
  getCompanies,
  getTags,
  exportContacts,

  // Lead compatibility
  createLead,

  // Utility functions
  formatPhoneNumber,
  getFullName,
  formatAddress,
  formatCurrency,
  getStatusColor,
  getStatusIcon,
  sortContacts,
  filterContacts,
  calculatePipelineConversion,
  calculateTotalRevenue,
};
