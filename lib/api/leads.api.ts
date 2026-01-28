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

// Leads API Service
export const leadsApi = {
  /**
   * Create a new lead
   */
  createLead: async (
    payload: CreateLeadPayload,
  ): Promise<ApiResponse<Lead>> => {
    try {
      const response = await apiService.post<Lead>("/leads", payload);
      return response;
    } catch (error) {
      console.error("Error creating lead:", error);
      throw error;
    }
  },

  /**
   * Get all leads with pagination and filters
   */
  getLeads: async (
    filters?: LeadFilters,
  ): Promise<ApiResponse<LeadsResponse>> => {
    try {
      const params: any = { ...filters };

      // Remove undefined values
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === "") {
          delete params[key];
        }
      });

      const response = await apiService.get<LeadsResponse>("/leads", params);
      return response;
    } catch (error) {
      console.error("Error fetching leads:", error);
      throw error;
    }
  },

  /**
   * Get lead by ID
   */
  getLeadById: async (id: string): Promise<ApiResponse<Lead>> => {
    try {
      const response = await apiService.get<Lead>(`/leads/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching lead ${id}:`, error);
      throw error;
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
      const response = await apiService.put<Lead>(`/leads/${id}`, payload);
      return response;
    } catch (error) {
      console.error(`Error updating lead ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete lead
   */
  deleteLead: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await apiService.delete<{ message: string }>(
        `/leads/${id}`,
      );
      return response;
    } catch (error) {
      console.error(`Error deleting lead ${id}:`, error);
      throw error;
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
      const response = await apiService.post<Lead["notes"]>(
        `/leads/${id}/notes`,
        payload,
      );
      return response;
    } catch (error) {
      console.error(`Error adding note to lead ${id}:`, error);
      throw error;
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
      const response = await apiService.patch<Lead>(
        `/leads/${id}/status`,
        payload,
      );
      return response;
    } catch (error) {
      console.error(`Error updating lead status ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get leads assigned to current user
   */
  getMyLeads: async (): Promise<ApiResponse<Lead[]>> => {
    try {
      const response = await apiService.get<Lead[]>("/leads/assigned/me");
      return response;
    } catch (error) {
      console.error("Error fetching my leads:", error);
      throw error;
    }
  },

  /**
   * Get lead statistics
   */
  getLeadStats: async (): Promise<ApiResponse<LeadStats>> => {
    try {
      const response = await apiService.get<LeadStats>("/leads/summary/stats");
      return response;
    } catch (error) {
      console.error("Error fetching lead stats:", error);
      throw error;
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
      const response = await apiService.put<{
        matched: number;
        modified: number;
      }>("/leads/bulk-update", payload);
      return response;
    } catch (error) {
      console.error("Error bulk updating leads:", error);
      throw error;
    }
  },
};

// Default export
export default leadsApi;
