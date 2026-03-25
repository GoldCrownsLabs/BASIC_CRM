import api from ".";


export const paymentService = {
  // Create payment intent for one-time payments
  createPaymentIntent: async (data) => {
    const response = await api.post(
      "/api/payments/create-payment-intent",
      data,
    );
    
    return response.data;
  },

  // Create checkout session for subscriptions
  createCheckoutSession: async (data) => {
    const response = await api.post(
      "/api/payments/create-checkout-session",
      data,
    );
    return response.data;
  },

  // Verify payment after completion
  verifyPayment: async (sessionId) => {
    const response = await api.post("/api/payments/verify-payment", {
      sessionId,
    });
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async () => {
    const response = await api.get("/api/payments/history");
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (paymentId) => {
    const response = await api.get(`/api/payments/${paymentId}`);
    return response.data;
  },

  // Apply coupon
  applyCoupon: async (data) => {
    const response = await api.post("/api/payments/apply-coupon", data);
    return response.data;
  },

  // Activate trial
  activateTrial: async (data) => {
    const response = await api.post("/api/payments/activate-trial", data);
    return response.data;
  },

  // Get or create Stripe customer
  getOrCreateCustomer: async () => {
    const response = await api.post("/api/payments/get-or-create-customer");
    return response.data;
  },

  // Get payment methods
  getPaymentMethods: async () => {
    const response = await api.get("/api/payments/payment-methods");
    return response.data;
  },
};
