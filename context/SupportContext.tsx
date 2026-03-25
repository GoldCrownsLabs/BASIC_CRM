// context/SupportContext.tsx

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

import type {
  FAQ,
  FAQCategory,
  SupportTicket,
  SubmitTicketRequest,
  SubmitFeedbackRequest,
  GetTicketsQuery,
} from '@/types/support.types';
import { supportApi } from '@/lib/api/support.api';

interface SupportContextType {
  // FAQs
  faqs: FAQ[];
  faqCategories: FAQCategory[];
  loadingFAQs: boolean;
  fetchFAQs: (category?: string, search?: string) => Promise<void>;
  fetchFAQCategories: () => Promise<void>;
  trackFAQHelpfulness: (faqId: number, helpful: boolean) => Promise<void>;

  // Tickets
  tickets: SupportTicket[];
  currentTicket: SupportTicket | null;
  loadingTickets: boolean;
  fetchUserTickets: (query?: GetTicketsQuery) => Promise<void>;
  fetchTicket: (ticketId: string) => Promise<void>;
  submitTicket: (data: SubmitTicketRequest) => Promise<any>;
  addResponse: (ticketId: string, message: string) => Promise<void>;

  // Feedback
  submitFeedback: (data: SubmitFeedbackRequest) => Promise<any>;

  // UI State
  isSubmitting: boolean;
  error: string | null;
  clearError: () => void;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export const useSupport = () => {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error('useSupport must be used within SupportProvider');
  }
  return context;
};

interface SupportProviderProps {
  children: ReactNode;
}

export const SupportProvider: React.FC<SupportProviderProps> = ({ children }) => {
  // FAQ States
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqCategories, setFaqCategories] = useState<FAQCategory[]>([]);
  const [loadingFAQs, setLoadingFAQs] = useState(false);

  // Ticket States
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<SupportTicket | null>(null);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // ============ FAQ METHODS ============
  
  const fetchFAQs = useCallback(async (category?: string, search?: string) => {
    try {
      setLoadingFAQs(true);
      setError(null);
      const response = await supportApi.getFAQs(category, search);
      
      if (response.success && response.data) {
        setFaqs(response.data);
        console.log(`✅ Loaded ${response.data.length} FAQs`);
      } else {
        setFaqs([]);
        console.warn("⚠️ No FAQs in response");
      }
    } catch (err: any) {
      console.error("❌ Error fetching FAQs:", err);
      setError(err.message || 'Failed to fetch FAQs');
      setFaqs([]);
    } finally {
      setLoadingFAQs(false);
    }
  }, []);

  const fetchFAQCategories = useCallback(async () => {
    try {
      setLoadingFAQs(true);
      setError(null);
      const response = await supportApi.getFAQCategories();
      
      if (response.success && response.data) {
        setFaqCategories(response.data);
        console.log(`✅ Loaded ${response.data.length} FAQ categories`);
      } else {
        // Set default categories if API fails
        const defaultCategories = [
          { id: "getting-started", name: "Getting Started", icon: "play-circle", count: 0 },
          { id: "contacts", name: "Contacts & Leads", icon: "users", count: 0 },
          { id: "calendar", name: "Calendar & Events", icon: "calendar", count: 0 },
          { id: "activities", name: "Activities", icon: "activity", count: 0 },
          { id: "tasks", name: "Tasks & Reminders", icon: "check-square", count: 0 },
          { id: "analytics", name: "Analytics", icon: "bar-chart-2", count: 0 },
          { id: "settings", name: "Settings", icon: "settings", count: 0 },
          { id: "troubleshooting", name: "Troubleshooting", icon: "tool", count: 0 },
        ];
        setFaqCategories(defaultCategories);
        console.log("📋 Using default categories");
      }
    } catch (err: any) {
      console.error("❌ Error fetching categories:", err);
      setError(err.message || 'Failed to fetch FAQ categories');
      // Set default categories on error
      const defaultCategories = [
        { id: "getting-started", name: "Getting Started", icon: "play-circle", count: 0 },
        { id: "contacts", name: "Contacts & Leads", icon: "users", count: 0 },
        { id: "calendar", name: "Calendar & Events", icon: "calendar", count: 0 },
        { id: "activities", name: "Activities", icon: "activity", count: 0 },
        { id: "tasks", name: "Tasks & Reminders", icon: "check-square", count: 0 },
        { id: "analytics", name: "Analytics", icon: "bar-chart-2", count: 0 },
        { id: "settings", name: "Settings", icon: "settings", count: 0 },
        { id: "troubleshooting", name: "Troubleshooting", icon: "tool", count: 0 },
      ];
      setFaqCategories(defaultCategories);
    } finally {
      setLoadingFAQs(false);
    }
  }, []);

  const trackFAQHelpfulness = useCallback(async (faqId: number, helpful: boolean) => {
    try {
      setError(null);
      await supportApi.trackFAQHelpfulness({ faqId, helpful });
      
      // Update local state
      setFaqs(prev => prev.map(faq => 
        faq.id === faqId 
          ? { 
              ...faq, 
              helpful: helpful ? (faq.helpful || 0) + 1 : faq.helpful,
              notHelpful: !helpful ? (faq.notHelpful || 0) + 1 : faq.notHelpful
            }
          : faq
      ));
    } catch (err: any) {
      console.error("Error tracking FAQ helpfulness:", err);
      setError(err.message || 'Failed to track feedback');
    }
  }, []);

  // ============ TICKET METHODS ============
  
  const fetchUserTickets = useCallback(async (query?: GetTicketsQuery) => {
    try {
      setLoadingTickets(true);
      setError(null);
      const response = await supportApi.getUserTickets(query);
      
      if (response.success && response.data) {
        setTickets(response.data);
        console.log(`✅ Loaded ${response.data.length} tickets`);
      } else {
        setTickets([]);
      }
    } catch (err: any) {
      console.error("Error fetching tickets:", err);
      setError(err.message || 'Failed to fetch tickets');
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  const fetchTicket = useCallback(async (ticketId: string) => {
    try {
      setLoadingTickets(true);
      setError(null);
      const response = await supportApi.getTicket(ticketId);
      
      if (response.success && response.data) {
        setCurrentTicket(response.data);
      } else {
        setCurrentTicket(null);
      }
    } catch (err: any) {
      console.error("Error fetching ticket:", err);
      setError(err.message || 'Failed to fetch ticket');
      setCurrentTicket(null);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  const submitTicket = useCallback(async (data: SubmitTicketRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const deviceInfo = supportApi.getDeviceInfo();
      const response = await supportApi.submitTicket({ ...data, deviceInfo });
      
      if (response.success) {
        console.log("✅ Ticket submitted successfully");
        await fetchUserTickets();
        return response;
      } else {
        throw new Error(response.message || 'Failed to submit ticket');
      }
    } catch (err: any) {
      console.error("Error submitting ticket:", err);
      setError(err.message || 'Failed to submit ticket');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchUserTickets]);

  const addResponse = useCallback(async (ticketId: string, message: string) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await supportApi.addResponse(ticketId, { message });
      
      if (response.success && response.data) {
        setCurrentTicket(response.data);
        await fetchUserTickets();
      }
    } catch (err: any) {
      console.error("Error adding response:", err);
      setError(err.message || 'Failed to add response');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchUserTickets]);

  // ============ FEEDBACK METHODS ============
  
  const submitFeedback = useCallback(async (data: SubmitFeedbackRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const deviceInfo = supportApi.getDeviceInfo();
      const response = await supportApi.submitFeedback({ ...data, deviceInfo });
      
      if (response.success) {
        console.log("✅ Feedback submitted successfully");
        return response;
      } else {
        throw new Error(response.message || 'Failed to submit feedback');
      }
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      setError(err.message || 'Failed to submit feedback');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const value: SupportContextType = {
    faqs,
    faqCategories,
    loadingFAQs,
    fetchFAQs,
    fetchFAQCategories,
    trackFAQHelpfulness,
    tickets,
    currentTicket,
    loadingTickets,
    fetchUserTickets,
    fetchTicket,
    submitTicket,
    addResponse,
    submitFeedback,
    isSubmitting,
    error,
    clearError,
  };

  return (
    <SupportContext.Provider value={value}>
      {children}
    </SupportContext.Provider>
  );
};