import { ApiResponse, apiService } from ".";

// Lead interface based on your schema
export interface Lead {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source:
    | "website"
    | "referral"
    | "social_media"
    | "advertisement"
    | "event"
    | "other";
  status:
    | "new"
    | "contacted"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "closed_won"
    | "closed_lost";
  budget?: number;
  priority: "low" | "medium" | "high";
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  notes: Array<{
    _id: string;
    content: string;
    createdBy: {
      _id: string;
      name: string;
      email: string;
    };
    createdAt: string;
  }>;
  lastContacted?: string;
  nextFollowUp?: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;

  // ✅ ADD THESE MISSING PROPERTIES:
  name?: string; // For display purposes (full name)
  stage?: string; // Alternative to status
  estimatedValue?: number; // Alternative to budget
  // Add any other properties your UI needs
}
// Lead creation payload
export interface CreateLeadPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source?:
    | "website"
    | "referral"
    | "social_media"
    | "advertisement"
    | "event"
    | "other";
  status?:
    | "new"
    | "contacted"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "closed_won"
    | "closed_lost";
  budget?: number;
  priority?: "low" | "medium" | "high";
  assignedTo?: string;
  nextFollowUp?: string;
  customFields?: Record<string, any>;
}

// Lead update payload
export interface UpdateLeadPayload extends Partial<CreateLeadPayload> {}

// Lead filters
export interface LeadFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  source?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Bulk update payload
export interface BulkUpdatePayload {
  leadIds: string[];
  updateFields: {
    status?: string;
    assignedTo?: string;
    priority?: string;
    source?: string;
  };
}

// Add note payload
export interface AddNotePayload {
  content: string;
}

// Update status payload
export interface UpdateStatusPayload {
  status: string;
  note?: string;
}

// ✅ Updated Pagination interface to match backend
export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// ✅ Updated LeadStats interface
export interface LeadStats {
  totalLeads: number;
  leadsByStatus: Array<{ _id: string; count: number }>;
  leadsBySource: Array<{ _id: string; count: number }>;
  leadsByPriority: Array<{ _id: string; count: number }>;
  leadsByMonth: Array<{ month: string; count: number }>;
  hotLeads: number;
  conversionRate: string;
}

// ✅ Updated API response for getLeads
export interface LeadsResponse extends ApiResponse {
  data: Lead[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ✅ Helper function to check authentication
const checkAuth = async (): Promise<boolean> => {
  try {
    const token = await apiService.getAuthToken();
    return !!token;
  } catch (error) {
    console.error("Auth check failed:", error);
    return false;
  }
};

// ✅ Helper function to handle auth errors
const handleAuthError = () => {
  return {
    success: false,
    status: 401,
    message: "Authentication required. Please login.",
    error: "UNAUTHORIZED",
  };
};

// ✅ Helper function to handle API errors
const handleApiError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);

  // If it's already an ApiResponse format, return it
  if (error.success !== undefined) {
    return error;
  }

  // Handle auth errors specifically
  if (error.status === 401 || error.error === "UNAUTHORIZED") {
    return handleAuthError();
  }

  // Return the error as is
  throw error;
};

// Leads API Service
export const leadsApi = {
  /**
   * Create a new lead
   */
  createLead: async (
    payload: CreateLeadPayload,
  ): Promise<ApiResponse<Lead>> => {
    try {
      // Check authentication
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        return handleAuthError();
      }

      const response = await apiService.post<Lead>("/leads", payload);
      return response;
    } catch (error: any) {
      return handleApiError(error, "createLead");
    }
  },

  /**
   * Get all leads with pagination and filters
   */
  getLeads: async (
    filters?: LeadFilters,
  ): Promise<ApiResponse<LeadsResponse>> => {
    try {
      // Check authentication
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        return handleAuthError();
      }

      const params: any = { ...filters };

      // Remove undefined values
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === "") {
          delete params[key];
        }
      });

      const response = await apiService.get<LeadsResponse>("/leads", params);
      return response;
    } catch (error: any) {
      return handleApiError(error, "getLeads");
    }
  },

  /**
   * Get lead by ID
   */
  getLeadById: async (id: string): Promise<ApiResponse<Lead>> => {
    try {
      // Check authentication
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        return handleAuthError();
      }

      const response = await apiService.get<Lead>(`/leads/${id}`);
      return response;
    } catch (error: any) {
      return handleApiError(error, `getLeadById(${id})`);
    }
  },

  /**
   * Update lead
   */
  updateLead: async (
    id: string,
    payload: UpdateLeadPayload,
  ): Promise<ApiResponse<Lead>> => {
    try {
      // Check authentication
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        return handleAuthError();
      }

      const response = await apiService.put<Lead>(`/leads/${id}`, payload);
      return response;
    } catch (error: any) {
      return handleApiError(error, `updateLead(${id})`);
    }
  },

  /**
   * Delete lead
   */
  deleteLead: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      // Check authentication
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        return handleAuthError();
      }

      const response = await apiService.delete<{ message: string }>(
        `/leads/${id}`,
      );
      return response;
    } catch (error: any) {
      return handleApiError(error, `deleteLead(${id})`);
    }
  },

  /**
   * Add note to lead
   */
  addNote: async (
    id: string,
    payload: AddNotePayload,
  ): Promise<ApiResponse<Lead["notes"]>> => {
    try {
      // Check authentication
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        return handleAuthError();
      }

      const response = await apiService.post<Lead["notes"]>(
        `/leads/${id}/notes`,
        payload,
      );
      return response;
    } catch (error: any) {
      return handleApiError(error, `addNote(${id})`);
    }
  },

  /**
   * Update lead status
   */
  updateLeadStatus: async (
    id: string,
    payload: UpdateStatusPayload,
  ): Promise<ApiResponse<Lead>> => {
    try {
      // Check authentication
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        return handleAuthError();
      }

      const response = await apiService.patch<Lead>(
        `/leads/${id}/status`,
        payload,
      );
      return response;
    } catch (error: any) {
      return handleApiError(error, `updateLeadStatus(${id})`);
    }
  },

  /**
   * Get leads assigned to current user
   */
  getMyLeads: async (): Promise<ApiResponse<Lead[]>> => {
    try {
      // Check authentication
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        return handleAuthError();
      }

      const response = await apiService.get<Lead[]>("/leads/assigned/me");
      return response;
    } catch (error: any) {
      return handleApiError(error, "getMyLeads");
    }
  },

  /**
   * Get lead statistics
   */
  getLeadStats: async (): Promise<ApiResponse<LeadStats>> => {
    try {
      // Check authentication
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        return handleAuthError();
      }

      const response = await apiService.get<LeadStats>("/leads/summary/stats");
      return response;
    } catch (error: any) {
      return handleApiError(error, "getLeadStats");
    }
  },

  /**
   * Bulk update leads
   */
  bulkUpdateLeads: async (
    payload: BulkUpdatePayload,
  ): Promise<
    ApiResponse<{
      matched: number;
      modified: number;
    }>
  > => {
    try {
      // Check authentication
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        return handleAuthError();
      }

      const response = await apiService.put<{
        matched: number;
        modified: number;
      }>("/leads/bulk-update", payload);
      return response;
    } catch (error: any) {
      return handleApiError(error, "bulkUpdateLeads");
    }
  },

  /**
   * Check if user can access leads (authentication check)
   */
  checkAccess: async (): Promise<boolean> => {
    return await checkAuth();
  },
};

// Default export
export default leadsApi;
