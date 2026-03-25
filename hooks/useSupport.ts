// hooks/useSupport.ts

import { useState, useCallback, useEffect } from "react";
import { useSupport } from "@/context/SupportContext";
import type {
  SubmitTicketRequest,
  SubmitFeedbackRequest,
} from "@/types/support.types";

interface UseTicketFormReturn {
  formData: SubmitTicketRequest;
  updateField: <K extends keyof SubmitTicketRequest>(
    field: K,
    value: SubmitTicketRequest[K],
  ) => void;
  resetForm: () => void;
  isSubmitting: boolean;
  error: string | null;
  submit: () => Promise<void>;
}

interface UseFeedbackFormReturn {
  rating: number;
  comment: string;
  setRating: (rating: number) => void;
  setComment: (comment: string) => void;
  resetForm: () => void;
  isSubmitting: boolean;
  error: string | null;
  submit: (name: string, email: string) => Promise<void>;
}

interface UseFAQSearchReturn {
  searchQuery: string;
  selectedCategory: string | null;
  filteredFAQs: any[];
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  loading: boolean;
}

export const useTicketForm = (): UseTicketFormReturn => {
  const { submitTicket, isSubmitting, error, clearError } = useSupport();
  const [formData, setFormData] = useState<SubmitTicketRequest>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const updateField = useCallback(
    <K extends keyof SubmitTicketRequest>(
      field: K,
      value: SubmitTicketRequest[K],
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (error) clearError();
    },
    [error, clearError],
  );

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    clearError();
  }, [clearError]);

  const submit = useCallback(async () => {
    await submitTicket(formData);
  }, [submitTicket, formData]);

  return {
    formData,
    updateField,
    resetForm,
    isSubmitting,
    error,
    submit,
  };
};

export const useFeedbackForm = (): UseFeedbackFormReturn => {
  const { submitFeedback, isSubmitting, error, clearError } = useSupport();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const resetForm = useCallback(() => {
    setRating(0);
    setComment("");
    clearError();
  }, [clearError]);

  const submit = useCallback(
    async (name: string, email: string) => {
      await submitFeedback({
        name,
        email,
        rating,
        comment,
      });
    },
    [submitFeedback, rating, comment],
  );

  return {
    rating,
    comment,
    setRating,
    setComment,
    resetForm,
    isSubmitting,
    error,
    submit,
  };
};

export const useFAQSearch = (): UseFAQSearchReturn => {
  const { faqs, fetchFAQs, loadingFAQs } = useSupport();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFAQs(selectedCategory || undefined, searchQuery || undefined);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [fetchFAQs, selectedCategory, searchQuery]);

  return {
    searchQuery,
    selectedCategory,
    filteredFAQs: faqs,
    setSearchQuery,
    setSelectedCategory,
    loading: loadingFAQs,
  };
};
