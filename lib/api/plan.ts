// lib/api/plan.ts
import api, { apiService } from "./index";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Plan {
  _id: string;
  name: "monthly" | "quarterly" | "half_yearly" | "yearly";
  displayName: string;
  duration: number;
  price: number;
  currency: string;
  discountPercentage: number;
  discountedPrice?: number | null;
  formattedPrice: string;
  formattedDiscountedPrice?: string | null;
  savingsPercentage: number;
  features: Array<{
    name: string;
    included: boolean;
    limit?: number;
  }>;
  featureAccess: {
    maxUsers: number;
    maxLeads: number;
    maxContacts: number;
    maxTasks: number;
    maxProjects: number;
    maxStorage: number;
    advancedReports: boolean;
    apiAccess: boolean;
    emailCampaigns: boolean;
    customFields: boolean;
    bulkOperations: boolean;
    prioritySupport: boolean;
    dataExport: boolean;
    teamCollaboration: boolean;
  };
  trialDays: number;
  hasTrial: boolean;
  popular: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface Subscription {
  _id: string;
  userId: string;
  planId: Plan;
  razorpaySubscriptionId: string;
  status: "pending" | "trial" | "active" | "expired" | "cancelled" | "failed";
  startDate: string;
  endDate: string;
  trialEndDate?: string;
  amount: number;
  autoRenew: boolean;
  paymentHistory: Array<{
    amount: number;
    status: string;
    date: string;
  }>;
}

export interface PaymentVerification {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  razorpay_subscription_id: string;
}

export interface CouponResponse {
  couponCode: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountAmount: number;
  originalPrice: number;
  finalPrice: number;
}

export const planService = {
  // Get all active plans
  getPlans: async () => {
    try {
      const response = await apiService.get("/payments/plans");
      console.log("📊 Plans response:", response);

      // ✅ FIX: Handle response correctly
      if (response.success && response.data) {
        // Check if data is array
        if (Array.isArray(response.data)) {
          return { data: response.data };
        }
        // If data has 'data' property (nested response)
        else if (response.data.data && Array.isArray(response.data.data)) {
          return { data: response.data.data };
        }
      }

      // Return empty array if no data
      return { data: [] };
    } catch (error) {
      console.error("❌ Error fetching plans:", error);
      return { data: [] };
    }
  },

  // Get single plan by ID
  getPlanById: async (planId: string) => {
    try {
      const response = await apiService.get(`/payments/plan/${planId}`);
      return response;
    } catch (error) {
      console.error("❌ Error fetching plan:", error);
      throw error;
    }
  },

  // Create subscription
  createSubscription: async (planId: string, trialDays: number = 0) => {
    try {
      console.log("📝 Creating subscription for plan:", planId);
      const response = await apiService.post("/payments/create-subscription", {
        planId,
        trialDays,
      });
      return response;
    } catch (error) {
      console.error("❌ Error creating subscription:", error);
      throw error;
    }
  },

  // Verify payment
  verifyPayment: async (paymentData: PaymentVerification) => {
    try {
      console.log("✅ Verifying payment...");
      const response = await apiService.post(
        "/payments/verify-payment",
        paymentData,
      );
      return response;
    } catch (error) {
      console.error("❌ Error verifying payment:", error);
      throw error;
    }
  },

  // Get user subscriptions
  getUserSubscriptions: async () => {
    try {
      const response = await apiService.get("/payments/my-subscriptions");
      console.log("📋 Subscriptions response:", response);

      // ✅ FIX: Handle response correctly
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          return { data: response.data };
        } else if (response.data.data && Array.isArray(response.data.data)) {
          return { data: response.data.data };
        }
      }
      return { data: [] };
    } catch (error) {
      console.error("❌ Error fetching subscriptions:", error);
      return { data: [] };
    }
  },

  // Get subscription details
  getSubscriptionDetails: async (subscriptionId: string) => {
    try {
      const response = await apiService.get(
        `/payments/subscription/${subscriptionId}`,
      );
      return response;
    } catch (error) {
      console.error("❌ Error fetching subscription details:", error);
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string, reason?: string) => {
    try {
      const response = await apiService.post(
        `/payments/cancel/${subscriptionId}`,
        { reason },
      );
      return response;
    } catch (error) {
      console.error("❌ Error cancelling subscription:", error);
      throw error;
    }
  },

  // Get payment history
  getPaymentHistory: async () => {
    try {
      const response = await apiService.get("/payments/history");

      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          return { data: response.data };
        } else if (response.data.data && Array.isArray(response.data.data)) {
          return { data: response.data.data };
        }
      }
      return { data: [] };
    } catch (error) {
      console.error("❌ Error fetching payment history:", error);
      return { data: [] };
    }
  },

  // Apply coupon
  applyCoupon: async (code: string, planId: string) => {
    try {
      const response = await apiService.post("/payments/apply-coupon", {
        code,
        planId,
      });
      return response;
    } catch (error) {
      console.error("❌ Error applying coupon:", error);
      throw error;
    }
  },

  // Check if user has active subscription
  checkActiveSubscription: async (): Promise<boolean> => {
    try {
      const response = await planService.getUserSubscriptions();
      const subscriptions = response.data || [];

      // ✅ FIX: Check if subscriptions is array
      if (!Array.isArray(subscriptions)) {
        console.log("⚠️ Subscriptions is not an array:", subscriptions);
        return false;
      }

      const activeSubscription = subscriptions.find(
        (sub: Subscription) =>
          sub.status === "active" && new Date(sub.endDate) > new Date(),
      );

      return !!activeSubscription;
    } catch (error) {
      console.error("❌ Error checking subscription:", error);
      return false;
    }
  },

  // Get current active subscription
  getCurrentSubscription: async (): Promise<Subscription | null> => {
    try {
      const response = await planService.getUserSubscriptions();
      const subscriptions = response.data || [];

      // ✅ FIX: Check if subscriptions is array
      if (!Array.isArray(subscriptions)) {
        console.log("⚠️ Subscriptions is not an array:", subscriptions);
        return null;
      }

      const activeSubscription = subscriptions.find(
        (sub: Subscription) =>
          (sub.status === "active" || sub.status === "trial") &&
          new Date(sub.endDate) > new Date(),
      );

      return activeSubscription || null;
    } catch (error) {
      console.error("❌ Error getting current subscription:", error);
      return null;
    }
  },
};
