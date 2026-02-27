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
  source: "website" | "referral" | "social" | "event" | "other";
  tags?: string[];
  notes?: string;
  lastContacted?: Date | string;
  isFavorite: boolean;
  syncStatus?: "synced" | "pending" | "error";
  isDeleted: boolean;
  lastModified: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ContactPayload {
  firstName: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  address?: Address;
  source?: "website" | "referral" | "social" | "event" | "other";
  tags?: string[];
  notes?: string;
  lastContacted?: Date | string;
  isFavorite?: boolean;
}

export interface LeadPayload {
  name: string;
  phone: string;
  status: string;
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
  isFavorite?: boolean | string;
  source?: string;
}

export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
}

export interface ContactsResponse {
  message: string;
  success: boolean;
  count: number;
  data: Contact[];
  pagination: PaginationResponse;
}

export interface SingleContactResponse {
  message: string;
  success: boolean;
  data: Contact;
}

export interface StatsCount {
  total: number;
  recentWeek: number;
  recentMonth: number;
  favorites: number;
  // eslint-disable-next-line @typescript-eslint/array-type
  bySource: Array<{ source: string; count: number }>;
}

export interface StatsResponse {
  message(arg0: string, message: any): unknown;
  success: boolean;
  data: StatsCount;
}

export interface TagStat {
  tag: string;
  count: number;
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
  source?: "website" | "referral" | "social" | "event" | "other";
  isFavorite?: boolean;
  lastContacted?: Date | string;
}

export interface BatchSyncPayload {
  contacts: BatchSyncItem[];
}

export interface BatchSyncResponse {
  success: boolean;
  data: {
    created: string[];
    updated: string[];
    // eslint-disable-next-line @typescript-eslint/array-type
    errors: Array<{
      contact: string;
      error: string;
    }>;
    summary: {
      totalProcessed: number;
      successful: number;
      failed: number;
    };
  };
  message: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: string[];
  error?: string;
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
 * Create lead (compatibility function)
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
    source: "website",
    tags: ["lead", payload.status],
    notes: `Lead from website - Status: ${payload.status}`,
    isFavorite: false,
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
 * Get contact statistics
 */
export const getContactStats = async (): Promise<StatsResponse> => {
  const response = await api.get<StatsResponse>("/contacts/stats/count");
  return response.data;
};

/**
 * Get tag statistics
 */
export const getTagStats = async (): Promise<TagStatsResponse> => {
  const response = await api.get<TagStatsResponse>("/contacts/stats/tags");
  return response.data;
};

/**
 * Batch sync contacts
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
 * Export contacts (CSV/Excel)
 */
export const exportContacts = async (
  format: "csv" | "excel" = "csv",
): Promise<Blob> => {
  const response = await api.get(`/contacts/export?format=${format}`, {
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

/**
 * Sort contacts by various criteria
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
    ];

    if (dateFields.includes(field)) {
      // Both values should be Date or string, convert to timestamp
      const aTimestamp = new Date(aValue as Date | string).getTime();
      const bTimestamp = new Date(bValue as Date | string).getTime();

      if (aTimestamp < bTimestamp) return direction === "asc" ? -1 : 1;
      if (aTimestamp > bTimestamp) return direction === "asc" ? 1 : -1;
      return 0;
    }

    // Handle string comparison for string fields
    if (typeof aValue === "string" && typeof bValue === "string") {
      const aStr = aValue.toLowerCase();
      const bStr = bValue.toLowerCase();

      if (aStr < bStr) return direction === "asc" ? -1 : 1;
      if (aStr > bStr) return direction === "asc" ? 1 : -1;
      return 0;
    }

    // Handle number comparison for boolean or number fields
    // Convert boolean to number for comparison
    if (typeof aValue === "boolean" && typeof bValue === "boolean") {
      const aNum = aValue ? 1 : 0;
      const bNum = bValue ? 1 : 0;

      if (aNum < bNum) return direction === "asc" ? -1 : 1;
      if (aNum > bNum) return direction === "asc" ? 1 : -1;
      return 0;
    }

    // Fallback - use default comparison
    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

// Alternative: More type-safe version with field-specific handling
export const sortContactsSafely = (
  contacts: Contact[],
  field: keyof Contact = "lastModified",
  direction: "asc" | "desc" = "desc",
): Contact[] => {
  return [...contacts].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    // Handle undefined/null values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Handle different field types
    switch (field) {
      case "createdAt":
      case "updatedAt":
      case "lastModified":
      case "lastContacted":
        // These are date fields
        const aDate = new Date(aValue as Date | string).getTime();
        const bDate = new Date(bValue as Date | string).getTime();
        return direction === "asc" ? aDate - bDate : bDate - aDate;

      case "isFavorite":
      case "isDeleted":
        // Boolean fields - true comes first when descending
        const aBool = aValue as boolean;
        const bBool = bValue as boolean;
        if (aBool === bBool) return 0;
        return direction === "desc" ? (aBool ? -1 : 1) : aBool ? 1 : -1;

      case "firstName":
      case "lastName":
      case "email":
      case "company":
      case "jobTitle":
      case "phone":
      case "notes":
      case "source":
      case "syncStatus":
        // String fields
        const aStr = (aValue as string).toLowerCase();
        const bStr = (bValue as string).toLowerCase();
        if (aStr === bStr) return 0;
        return direction === "asc"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);

      default:
        // For other fields (like tags array, address object), we can't sort meaningfully
        // So sort by createdAt as fallback
        const aCreated = new Date(a.createdAt).getTime();
        const bCreated = new Date(b.createdAt).getTime();
        return bCreated - aCreated;
    }
  });
};
/**
 * Filter contacts by search term
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
      (contact.tags &&
        contact.tags.some((tag) => tag.toLowerCase().includes(term)))
    );
  });
};

// Default export all API functions
export default {
  getContacts,
  getContactById,
  createContact,
  createLead,
  updateContact,
  toggleFavorite,
  deleteContact,
  getContactStats,
  getTagStats,
  batchSyncContacts,
  getCompanies,
  getTags,
  exportContacts,
  // Utility functions
  formatPhoneNumber,
  getFullName,
  formatAddress,
  sortContacts,
  filterContacts,
};