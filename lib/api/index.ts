import axios, {
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  RawAxiosRequestHeaders,
  AxiosHeaders,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ REMOVED: import { useAuthStore } from "@/store/auth.store";

// ✅ Properly defined ApiResponse interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  status: number;
  message: string;
  errors?: any[];
  timestamp?: string;
}

// ✅ FIXED: Declare module augmentation for axios
declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    _skipAuth?: boolean;
    metadata?: {
      startTime: Date;
    };
  }
}

// ✅ Now we can use AxiosRequestConfig directly without custom interface
type CustomAxiosRequestConfig = AxiosRequestConfig;
// Server Render URL
// Create axios instance
// const api = axios.create({
//   baseURL: "https://basic-crm-backend-p5tb.onrender.com/api/",
//   timeout: 30000,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// Localhost URL
const api = axios.create({
  baseURL: "http://192.168.1.18:5000/api/",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// =================== TOKEN MANAGEMENT ===================

/**
 * ✅ FIXED: Get token from AsyncStorage only to avoid circular dependency
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    // Only check AsyncStorage, don't use Zustand
    const token = await AsyncStorage.getItem("auth_token");
    if (token) {
      return token;
    }

    // Also check Zustand persistence storage as fallback
    try {
      const authStorage = await AsyncStorage.getItem("auth-storage");
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.token) {
          console.log("💾 Token from Zustand persistence");
          return parsed.state.token;
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }

    // console.warn("⚠️ No authentication token found");
    return null;
  } catch (error) {
    console.error("❌ Error getting auth token:", error);
    return null;
  }
};

/**
 * ✅ FIXED: Save token to AsyncStorage only
 */
const setAuthToken = async (token: string | null): Promise<void> => {
  try {
    if (token) {
      console.log("💾 Saving token to AsyncStorage...");

      // 1. Save to AsyncStorage (primary storage)
      await AsyncStorage.setItem("auth_token", token);

      // 2. Set axios default header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 3. Also update Zustand persistence storage
      try {
        const authStorage = await AsyncStorage.getItem("auth-storage");
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          parsed.state.token = token;
          await AsyncStorage.setItem("auth-storage", JSON.stringify(parsed));
        }
      } catch (e) {
        // Ignore if fails
      }

      console.log("✅ Token saved successfully");
    } else {
      console.log("🗑️ Clearing tokens...");
      await AsyncStorage.removeItem("auth_token");
      delete api.defaults.headers.common["Authorization"];
    }
  } catch (error) {
    console.error("❌ Error setting auth token:", error);
  }
};

/**
 * ✅ FIXED: Clear all tokens without Zustand dependency
 */
const clearAuthToken = async (): Promise<void> => {
  try {
    console.log("🧹 Clearing all auth tokens...");

    // Clear from AsyncStorage
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("token_expiry");

    // Clear axios headers
    delete api.defaults.headers.common["Authorization"];

    console.log("✅ All tokens cleared from API service");
  } catch (error) {
    console.error("❌ Error clearing auth token:", error);
  }
};

// =================== REQUEST INTERCEPTOR ===================

api.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    // Add timing metadata
    config.metadata = { startTime: new Date() };

    // Skip auth for login/register endpoints
    const skipAuthPaths = ["/auth/login", "/auth/register", "/health"];
    const shouldSkipAuth =
      config._skipAuth ||
      skipAuthPaths.some((path) => config.url?.includes(path));

    if (shouldSkipAuth) {
      console.log(`🔓 Skipping auth for: ${config.url}`);
      return config;
    }

    // Add Authorization header for protected endpoints
    try {
      const token = await getAuthToken();

      if (token) {
        console.log(
          `🔑 Adding token to: ${config.method?.toUpperCase()} ${config.url}`,
        );

        // Ensure headers exist
        config.headers = config.headers || {};

        // Set Authorization header
        if (config.headers instanceof AxiosHeaders) {
          config.headers.set("Authorization", `Bearer ${token}`, true);
        } else {
          (config.headers as RawAxiosRequestHeaders)["Authorization"] =
            `Bearer ${token}`;
        }

        // Debug: Log the header being sent
        // console.log(`✅ Authorization header set for ${config.url}`);
      } else {
        console.warn(`⚠️ No token available for: ${config.url}`);

        // ✅ FIXED: Don't throw error, just let the request continue
        // The server will return 401 if authentication is required
        // We'll handle it in response interceptor
      }
    } catch (error) {
      console.error("❌ Request interceptor error:", error);
      // Don't reject, let the request continue
    }

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error("❌ Request interceptor setup error:", error.message);
    return Promise.reject(error);
  },
);

// =================== RESPONSE INTERCEPTOR ===================

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    const config = response.config;
    const endTime = new Date();

    if (config?.metadata?.startTime) {
      const duration = endTime.getTime() - config.metadata.startTime.getTime();
      console.log(
        `⏱️ ${response.config.url} - ${duration}ms - ${response.status}`,
      );
    }

    // Save token from response if present (for refresh token scenarios)
    const responseData = response.data;
    if (responseData?.token) {
      console.log("🔄 New token received in response, saving...");
      setAuthToken(responseData.token).catch((err) =>
        console.error("Error saving new token:", err),
      );
    }

    return response;
  },
  async (error: AxiosError<ApiError>): Promise<never> => {
    const originalConfig = error.config;

    // Log error details
    console.error("❌ API Error:", {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log("🔐 401 Unauthorized - Token invalid or expired");

      // Clear tokens
      await clearAuthToken();

      // Don't redirect if we're already on login page
      if (!error.config?.url?.includes("/auth/login")) {
        // You can add navigation logic here if needed
        console.log("Redirecting to login...");
      }

      // Return standardized error
      const apiError: ApiResponse = {
        success: false,
        status: 401,
        message: "UNAUTHORIZED LOGIN",
        error: "UNAUTHORIZED",
        data: error.response?.data,
      };

      return Promise.reject(apiError);
    }

    // Handle other errors
    const errorResponse: ApiResponse = {
      success: false,
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        "Network request failed",
      error: error.code || "NETWORK_ERROR",
      data: error.response?.data,
    };

    // Categorize errors
    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorResponse.message = error.response.data?.message || "Bad request";
          errorResponse.error = "BAD_REQUEST";
          break;
        case 403:
          errorResponse.message = "Access forbidden";
          errorResponse.error = "FORBIDDEN";
          break;
        case 404:
          errorResponse.message = "Resource not found";
          errorResponse.error = "NOT_FOUND";
          break;
        case 422:
          errorResponse.message = "Validation error";
          errorResponse.error = "VALIDATION_ERROR";
          break;
        case 500:
          errorResponse.message = "Internal server error";
          errorResponse.error = "SERVER_ERROR";
          break;
        case 503:
          errorResponse.message = "Service unavailable";
          errorResponse.error = "SERVICE_UNAVAILABLE";
          break;
      }
    } else if (error.request) {
      if (error.code === "ECONNABORTED") {
        errorResponse.message = "Request timeout";
        errorResponse.error = "TIMEOUT";
      } else {
        errorResponse.message = "No network response";
        errorResponse.error = "NETWORK_ERROR";
      }
    }

    return Promise.reject(errorResponse);
  },
);

// =================== API SERVICE METHODS ===================

export const apiService = {
  // ✅ FIXED: Generic GET method
  get: async <T = any>(
    url: string,
    params?: object,
    config?: CustomAxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
    try {
      console.log(`📞 GET ${url}`, params || "");

      const response = await api.get<T>(url, { params, ...config });

      const result: ApiResponse<T> = {
        success: response.status >= 200 && response.status < 300,
        data: response.data,
        status: response.status,
        message: (response.data as any)?.message || "Request successful",
      };

      return result;
    } catch (error: any) {
      console.error(`❌ GET ${url} failed:`, error.message);

      // If error is already in ApiResponse format, re-throw it
      if (error.success !== undefined) {
        throw error;
      }

      // Convert to ApiResponse format
      throw {
        success: false,
        status: error.response?.status,
        message: error.message || "Request failed",
        error: error.code || "UNKNOWN_ERROR",
        data: error.response?.data,
      };
    }
  },

  // ✅ FIXED: Generic POST method
  post: async <T = any>(
    url: string,
    data?: object,
    config?: CustomAxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
    try {
      console.log(`📞 POST ${url}`);

      const response = await api.post<T>(url, data, config);

      const result: ApiResponse<T> = {
        success: response.status >= 200 && response.status < 300,
        data: response.data,
        status: response.status,
        message: (response.data as any)?.message || "Request successful",
      };

      return result;
    } catch (error: any) {
      console.error(`❌ POST ${url} failed:`, error.message);

      if (error.success !== undefined) {
        throw error;
      }

      throw {
        success: false,
        status: error.response?.status,
        message: error.message || "Request failed",
        error: error.code || "UNKNOWN_ERROR",
        data: error.response?.data,
      };
    }
  },

  // ✅ FIXED: Login method with detailed logging
  login: async (email: string, password: string): Promise<ApiResponse> => {
    try {
      console.log("🔐 Attempting login...", { email });

      // Clear old tokens
      await clearAuthToken();

      const config: CustomAxiosRequestConfig = {
        _skipAuth: true,
        timeout: 15000,
      };

      const response = await api.post(
        "/auth/login",
        { email, password },
        config,
      );

      console.log(
        "✅ Login raw response:",
        JSON.stringify(response.data, null, 2),
      );

      const responseData = response.data;

      // Extract token from various possible locations
      let token =
        responseData.token ||
        responseData.accessToken ||
        responseData.data?.token ||
        responseData.access_token;

      let user = responseData.user ||
        responseData.data?.user || {
          email,
          id: responseData.userId || Date.now().toString(),
        };

      if (!token) {
        console.error("❌ No token found in login response");
        throw new Error("Authentication failed: No token received");
      }

      // Save token
      await setAuthToken(token);
      console.log("✅ Token saved successfully, length:", token.length);

      const result: ApiResponse = {
        success: true,
        data: { user, token },
        status: response.status,
        message: responseData.message || "Login successful",
      };

      console.log("🎉 Login successful!");
      return result;
    } catch (error: any) {
      console.error("❌ Login failed:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      throw {
        success: false,
        status: error.response?.status,
        message:
          error.response?.data?.message ||
          error.message ||
          "Login failed. Please check your credentials.",
        error: error.code || "LOGIN_ERROR",
        data: error.response?.data,
      };
    }
  },

  // PUT method
  put: async <T = any>(
    url: string,
    data?: object,
    config?: CustomAxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
    try {
      console.log(`📞 PUT ${url}`);
      const response = await api.put<T>(url, data, config);

      return {
        success: response.status >= 200 && response.status < 300,
        data: response.data,
        status: response.status,
        message: (response.data as any)?.message || "Request successful",
      };
    } catch (error: any) {
      console.error(`❌ PUT ${url} failed:`, error.message);
      throw error;
    }
  },

  // PATCH method
  patch: async <T = any>(
    url: string,
    data?: object,
    config?: CustomAxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
    try {
      console.log(`📞 PATCH ${url}`);
      const response = await api.patch<T>(url, data, config);

      return {
        success: response.status >= 200 && response.status < 300,
        data: response.data,
        status: response.status,
        message: (response.data as any)?.message || "Request successful",
      };
    } catch (error: any) {
      console.error(`❌ PATCH ${url} failed:`, error.message);
      throw error;
    }
  },

  // DELETE method
  delete: async <T = any>(
    url: string,
    config?: CustomAxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
    try {
      console.log(`📞 DELETE ${url}`);
      const response = await api.delete<T>(url, config);

      return {
        success: response.status >= 200 && response.status < 300,
        data: response.data,
        status: response.status,
        message: (response.data as any)?.message || "Request successful",
      };
    } catch (error: any) {
      console.error(`❌ DELETE ${url} failed:`, error.message);
      throw error;
    }
  },

  // Direct axios methods
  getRaw: api.get,
  postRaw: api.post,
  putRaw: api.put,
  deleteRaw: api.delete,

  // Token management
  setAuthToken,
  getAuthToken,
  clearAuthToken,

  // Check auth status
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      return !!token;
    } catch {
      return false;
    }
  },

  // Health check
  healthCheck: async (): Promise<ApiResponse> => {
    try {
      const response = await api.get("/health", { _skipAuth: true });

      return {
        success: true,
        data: response.data,
        status: response.status,
        message: "Service is healthy",
      };
    } catch (error: any) {
      return {
        success: false,
        status: error.response?.status,
        message: "Service unavailable",
        error: "HEALTH_CHECK_FAILED",
      };
    }
  },
};

// Utility functions
export const clearApiHeaders = (): void => {
  api.defaults.headers.common = {};
};

export const setBaseURL = (url: string): void => {
  api.defaults.baseURL = url;
};

// Network check utility
export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    await fetch("https://www.google.com", { method: "HEAD", mode: "no-cors" });
    return true;
  } catch {
    return false;
  }
};

// Default export
export default api;
