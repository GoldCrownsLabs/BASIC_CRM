// types/support.types.ts

export interface DeviceInfo {
  platform?: string;
  appVersion?: string;
  osVersion?: string;
  deviceModel?: string;
}

export interface Attachment {
  filename: string;
  url: string;
  size: number;
  type: string;
}

export interface Response {
  message: string;
  sentBy: "user" | "support";
  senderId?: string;
  attachments?: string[];
  timestamp: Date;
}

export interface SupportTicket {
  _id?: string;
  ticketId: string;
  type: "support" | "feedback" | "faq-feedback" | "general";
  userId?: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  rating?: number;
  feedbackComment?: string;
  faqCategory?: string;
  faqId?: number;
  helpful?: boolean;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority?: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
  deviceInfo?: DeviceInfo;
  attachments?: Attachment[];
  responses: Response[];
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  icon: string;
  order: number;
  helpful: number;
  notHelpful: number;
  isActive: boolean;
  tags: string[];
  metadata: {
    views: number;
    lastViewed?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface SupportStatistics {
  totalTickets: { count: number }[];
  openTickets: { count: number }[];
  resolvedToday: { count: number }[];
  averageResponseTime: { avgResponseTime: number }[];
  feedbackStats: {
    averageRating: number;
    totalFeedback: number;
    ratingDistribution: number[];
  };
  ticketsByCategory: { _id: string; count: number }[];
  faqStats: {
    totalViews: number;
    totalHelpful: number;
    totalNotHelpful: number;
  };
}

export interface SubmitTicketRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  faqCategory?: string;
  deviceInfo?: DeviceInfo;
}

export interface SubmitFeedbackRequest {
  name: string;
  email: string;
  rating: number;
  comment?: string;
  deviceInfo?: DeviceInfo;
}

export interface AddResponseRequest {
  message: string;
  attachments?: string[];
}

export interface UpdateTicketStatusRequest {
  status?: "open" | "in-progress" | "resolved" | "closed";
  priority?: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
}

export interface TrackFAQHelpfulnessRequest {
  faqId: number;
  helpful: boolean;
}

export interface GetTicketsQuery {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: PaginationInfo;
  totalPages?: number;
  currentPage?: number;
  total?: number;
}
