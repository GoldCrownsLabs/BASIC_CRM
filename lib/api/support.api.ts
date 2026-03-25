// services/support.api.ts

import { apiService } from "@/lib/api";
import type {
  ApiResponse,
  PaginatedResponse,
  SupportTicket,
  FAQ,
  FAQCategory,
  SupportStatistics,
  SubmitTicketRequest,
  SubmitFeedbackRequest,
  AddResponseRequest,
  UpdateTicketStatusRequest,
  TrackFAQHelpfulnessRequest,
  GetTicketsQuery,
  DeviceInfo,
} from "@/types/support.types";

class SupportApiService {
  private readonly baseUrl = "/support";

  /**
   * Submit a new support ticket
   */
  async submitTicket(
    data: SubmitTicketRequest,
  ): Promise<ApiResponse<{ ticketId: string; ticket: SupportTicket }>> {
    try {
      const response = await apiService.post(`${this.baseUrl}/tickets`, data);
      return {
        success: response.success,
        data: response.data?.data || response.data,
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error submitting ticket:", error);
      throw error;
    }
  }

  /**
   * Submit feedback
   */
  async submitFeedback(
    data: SubmitFeedbackRequest,
  ): Promise<ApiResponse<{ feedbackId: string }>> {
    try {
      const response = await apiService.post(`${this.baseUrl}/feedback`, data);
      return {
        success: response.success,
        data: response.data?.data || response.data,
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  }

  /**
   * Get user tickets
   */
  async getUserTickets(
    query?: GetTicketsQuery,
  ): Promise<PaginatedResponse<SupportTicket[]>> {
    try {
      const params = new URLSearchParams();
      if (query?.status) params.append("status", query.status);
      if (query?.type) params.append("type", query.type);
      if (query?.page) params.append("page", query.page.toString());
      if (query?.limit) params.append("limit", query.limit.toString());
      if (query?.search) params.append("search", query.search);

      const url = `${this.baseUrl}/tickets${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await apiService.get(url);

      return {
        success: response.success,
        data: this.extractTicketsFromResponse(response.data),
        pagination: this.extractPaginationFromResponse(response.data),
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error fetching user tickets:", error);
      throw error;
    }
  }

  /**
   * Get single ticket
   */
  async getTicket(ticketId: string): Promise<ApiResponse<SupportTicket>> {
    try {
      const response = await apiService.get(
        `${this.baseUrl}/tickets/${ticketId}`,
      );
      return {
        success: response.success,
        data: response.data?.data || response.data,
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error fetching ticket:", error);
      throw error;
    }
  }

  /**
   * Add response to ticket
   */
  async addResponse(
    ticketId: string,
    data: AddResponseRequest,
  ): Promise<ApiResponse<SupportTicket>> {
    try {
      const response = await apiService.post(
        `${this.baseUrl}/tickets/${ticketId}/response`,
        data,
      );
      return {
        success: response.success,
        data: response.data?.data || response.data,
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error adding response:", error);
      throw error;
    }
  }

  /**
   * Get all FAQs
   */
  async getFAQs(
    category?: string,
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponse<FAQ[]>> {
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (search) params.append("search", search);
      if (page) params.append("page", page.toString());
      if (limit) params.append("limit", limit.toString());

      const url = `${this.baseUrl}/faqs${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await apiService.get(url);

      return {
        success: response.success,
        data: this.extractFAQsFromResponse(response.data),
        pagination: this.extractPaginationFromResponse(response.data),
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error fetching FAQs:", error);
      throw error;
    }
  }

  /**
   * Get FAQ categories
   */
  async getFAQCategories(): Promise<ApiResponse<FAQCategory[]>> {
    try {
      const response = await apiService.get(`${this.baseUrl}/faqs/categories`);
      return {
        success: response.success,
        data: this.extractCategoriesFromResponse(response.data),
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error fetching FAQ categories:", error);
      throw error;
    }
  }

  /**
   * Track FAQ helpfulness
   */
  async trackFAQHelpfulness(
    data: TrackFAQHelpfulnessRequest,
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `${this.baseUrl}/faqs/helpful`,
        data,
      );
      return {
        success: response.success,
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error tracking FAQ helpfulness:", error);
      throw error;
    }
  }

  /**
   * Get support statistics (Admin only)
   */
  async getStatistics(): Promise<ApiResponse<SupportStatistics>> {
    try {
      const response = await apiService.get(`${this.baseUrl}/admin/statistics`);
      return {
        success: response.success,
        data: response.data?.data || response.data,
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  }

  /**
   * Get all tickets (Admin only)
   */
  async getAllTickets(
    query?: GetTicketsQuery,
  ): Promise<PaginatedResponse<SupportTicket[]>> {
    try {
      const params = new URLSearchParams();
      if (query?.status) params.append("status", query.status);
      if (query?.type) params.append("type", query.type);
      if (query?.page) params.append("page", query.page.toString());
      if (query?.limit) params.append("limit", query.limit.toString());
      if (query?.search) params.append("search", query.search);

      const url = `${this.baseUrl}/admin/tickets${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await apiService.get(url);

      return {
        success: response.success,
        data: this.extractTicketsFromResponse(response.data),
        pagination: this.extractPaginationFromResponse(response.data),
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error fetching all tickets:", error);
      throw error;
    }
  }

  /**
   * Update ticket status (Admin only)
   */
  async updateTicketStatus(
    ticketId: string,
    data: UpdateTicketStatusRequest,
  ): Promise<ApiResponse<SupportTicket>> {
    try {
      const response = await apiService.put(
        `${this.baseUrl}/admin/tickets/${ticketId}`,
        data,
      );
      return {
        success: response.success,
        data: response.data?.data || response.data,
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error updating ticket status:", error);
      throw error;
    }
  }

  // ============ PRIVATE HELPER METHODS ============

  /**
   * Extract FAQs from different response structures
   */
  private extractFAQsFromResponse(data: any): FAQ[] {
    if (!data) return [];

    // Direct array
    if (Array.isArray(data)) return data;

    // Nested in data property
    if (data.data && Array.isArray(data.data)) return data.data;

    // Nested in faqs property
    if (data.faqs && Array.isArray(data.faqs)) return data.faqs;

    // Nested in results property
    if (data.results && Array.isArray(data.results)) return data.results;

    console.warn("⚠️ Unknown FAQ response structure:", data);
    return [];
  }

  /**
   * Extract categories from different response structures
   */
  private extractCategoriesFromResponse(data: any): FAQCategory[] {
    if (!data) return [];

    // Direct array
    if (Array.isArray(data)) return data;

    // Nested in data property
    if (data.data && Array.isArray(data.data)) return data.data;

    // Nested in categories property
    if (data.categories && Array.isArray(data.categories))
      return data.categories;

    console.warn("⚠️ Unknown categories response structure:", data);
    return [];
  }

  /**
   * Extract tickets from different response structures
   */
  private extractTicketsFromResponse(data: any): SupportTicket[] {
    if (!data) return [];

    // Direct array
    if (Array.isArray(data)) return data;

    // Nested in data property
    if (data.data && Array.isArray(data.data)) return data.data;

    // Nested in tickets property
    if (data.tickets && Array.isArray(data.tickets)) return data.tickets;

    // Nested in results property
    if (data.results && Array.isArray(data.results)) return data.results;

    return [];
  }

  /**
   * Extract pagination from response
   */
  private extractPaginationFromResponse(data: any): any {
    if (!data) return undefined;

    if (data.pagination) return data.pagination;
    if (data.meta) return data.meta;

    return undefined;
  }

  /**
   * Get device info helper
   */
  getDeviceInfo(): DeviceInfo {
    return {
      platform: "mobile",
      appVersion: "1.0.0",
      osVersion: "unknown",
      deviceModel: "unknown",
    };
  }
}

export const supportApi = new SupportApiService();
