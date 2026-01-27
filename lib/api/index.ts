import axios, {
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  RawAxiosRequestHeaders,
  AxiosHeaders,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ FIXED: Properly defined ApiResponse interface
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

// ✅ FIXED: Properly extend AxiosRequestConfig with type assertion
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _skipAuth?: boolean;
  metadata?: {
    startTime: Date;
  };
}

const api = axios.create({
  baseURL: "https://basic-crm-backend-p5tb.onrender.com/api/",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Token management functions
const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

const setAuthToken = async (token: string | null): Promise<void> => {
  try {
    if (token) {
      await AsyncStorage.setItem("auth_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      await AsyncStorage.removeItem("auth_token");
      delete api.defaults.headers.common["Authorization"];
    }
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
};

const clearAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("refresh_token");
    delete api.defaults.headers.common["Authorization"];
  } catch (error) {
    console.error("Error clearing auth token:", error);
  }
};

// ✅ FIXED: Request interceptor with proper headers handling
api.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    const modifiedConfig = { ...config };

    // Add timing metadata
    const customConfig = modifiedConfig as CustomAxiosRequestConfig;
    customConfig.metadata = { startTime: new Date() };

    // Skip auth check if flag is set
    if (customConfig._skipAuth) {
      return modifiedConfig;
    }

    // Validate token before adding to headers
    try {
      const token = await getAuthToken();

      if (token) {
        // Check token expiry locally
        const tokenExpiry = await AsyncStorage.getItem("token_expiry");
        if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
          console.log("Token expired locally, clearing...");
          await clearAuthToken();
        } else {
          // ✅ FIXED: Proper headers assignment
          modifiedConfig.headers = modifiedConfig.headers || {};

          // Handle both AxiosHeaders and plain object
          if (modifiedConfig.headers instanceof AxiosHeaders) {
            modifiedConfig.headers.set(
              "Authorization",
              `Bearer ${token}`,
              true,
            );
          } else {
            // For plain object headers
            (modifiedConfig.headers as RawAxiosRequestHeaders)[
              "Authorization"
            ] = `Bearer ${token}`;
          }
        }
      }
    } catch (error) {
      console.error("Error in request interceptor:", error);
    }

    return modifiedConfig;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error("Request interceptor error:", error.message);
    return Promise.reject(error);
  },
);

// ✅ FIXED: Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    const config = response.config as CustomAxiosRequestConfig;
    const endTime = new Date();

    if (config?.metadata?.startTime) {
      const duration = endTime.getTime() - config.metadata.startTime.getTime();
      console.log(`API call to ${response.config.url} took ${duration}ms`);
    }

    // Save token if present in response
    const responseData = response.data;
    if (responseData && responseData.token) {
      setAuthToken(responseData.token).catch((error) => {
        console.error("Error saving token from response:", error);
      });
    }

    return response;
  },
  async (error: AxiosError<ApiError>): Promise<never> => {
    const originalConfig = error.config as CustomAxiosRequestConfig;
    const endTime = new Date();

    if (originalConfig?.metadata?.startTime) {
      const duration =
        endTime.getTime() - originalConfig.metadata.startTime.getTime();
      console.error(`API call failed after ${duration}ms`);
    }

    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      console.log("401 Error - Clearing auth token");
      await clearAuthToken();

      // Create clean error object
      const apiError: ApiResponse = {
        success: false,
        status: 401,
        message:
          error.response?.data?.message ||
          "Session expired. Please login again.",
        error: "ERR_BAD_REQUEST",
        data: error.response?.data,
      };

      return Promise.reject(apiError);
    }

    // Transform other errors
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

    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorResponse.message = error.response.data?.message || "Bad request";
          errorResponse.error = "ERR_BAD_REQUEST";
          break;
        case 403:
          errorResponse.message =
            "You don't have permission to access this resource.";
          errorResponse.error = "ERR_FORBIDDEN";
          break;
        case 404:
          errorResponse.message = "The requested resource was not found.";
          errorResponse.error = "ERR_NOT_FOUND";
          break;
        case 422:
          errorResponse.message = "Validation error occurred.";
          errorResponse.data = error.response.data?.errors;
          errorResponse.error = "ERR_VALIDATION";
          break;
        case 500:
          errorResponse.message =
            "Internal server error. Please try again later.";
          errorResponse.error = "ERR_SERVER";
          break;
        case 503:
          errorResponse.message =
            "Service temporarily unavailable. Please try again later.";
          errorResponse.error = "ERR_SERVICE_UNAVAILABLE";
          break;
      }
    } else if (error.request) {
      if (error.code === "ECONNABORTED") {
        errorResponse.message =
          "Request timeout. Please check your internet connection.";
        errorResponse.error = "ERR_TIMEOUT";
      } else {
        errorResponse.message =
          "No response received from server. Please check your network.";
        errorResponse.error = "ERR_NETWORK";
      }
    }

    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: errorResponse.message,
      error: errorResponse.error,
    });

    return Promise.reject(errorResponse);
  },
);

// ✅ FIXED: API service functions
export const apiService = {
  // Generic GET method
  get: async <T = any>(
    url: string,
    params?: object,
    config?: CustomAxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await api.get<T>(url, { params, ...config });

      const responseData = response.data as any;
      const result: ApiResponse<T> = {
        success: response.status >= 200 && response.status < 300,
        data: response.data,
        status: response.status,
        message: responseData?.message || "Request successful",
      };

      return result;
    } catch (error: any) {
      if (error.success !== undefined) {
        throw error;
      }

      const apiError: ApiResponse<T> = {
        success: false,
        status: error.response?.status,
        message: error.message || "Request failed",
        error: error.code || "UNKNOWN_ERROR",
        data: error.response?.data,
      };

      throw apiError;
    }
  },

  // Generic POST method
  post: async <T = any>(
    url: string,
    data?: object,
    config?: CustomAxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await api.post<T>(url, data, config);

      const responseData = response.data as any;
      const result: ApiResponse<T> = {
        success: response.status >= 200 && response.status < 300,
        data: response.data,
        status: response.status,
        message: responseData?.message || "Request successful",
      };

      return result;
    } catch (error: any) {
      if (error.success !== undefined) {
        throw error;
      }

      const apiError: ApiResponse<T> = {
        success: false,
        status: error.response?.status,
        message: error.message || "Request failed",
        error: error.code || "UNKNOWN_ERROR",
        data: error.response?.data,
      };

      throw apiError;
    }
  },

  // ✅ FIXED: Login specific method with proper config
  login: async (email: string, password: string): Promise<ApiResponse> => {
    try {
      // Clear any existing token before login
      await clearAuthToken();

      // ✅ FIXED: Proper config object
      const config: CustomAxiosRequestConfig = {
        _skipAuth: true,
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = await api.post(
        "/auth/login",
        { email, password },
        config,
      );

      const responseData = response.data;

      // Save token if received
      if (responseData.token) {
        await setAuthToken(responseData.token);

        if (responseData.expiresIn) {
          const expiryDate = new Date();
          expiryDate.setSeconds(
            expiryDate.getSeconds() + responseData.expiresIn,
          );
          await AsyncStorage.setItem("token_expiry", expiryDate.toISOString());
        }
      }

      const result: ApiResponse = {
        success: true,
        data: responseData,
        status: response.status,
        message: responseData.message || "Login successful",
      };

      return result;
    } catch (error: any) {
      // Transform axios error to our ApiResponse format
      const apiError: ApiResponse = {
        success: false,
        status: error.response?.status,
        message: error.response?.data?.message || "Login failed",
        error: error.code || "LOGIN_ERROR",
        data: error.response?.data,
      };

      throw apiError;
    }
  },

  // PUT method
  put: async <T = any>(
    url: string,
    data?: object,
    config?: CustomAxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await api.put<T>(url, data, config);

      const responseData = response.data as any;
      const result: ApiResponse<T> = {
        success: response.status >= 200 && response.status < 300,
        data: response.data,
        status: response.status,
        message: responseData?.message || "Request successful",
      };

      return result;
    } catch (error: any) {
      if (error.success !== undefined) {
        throw error;
      }

      const apiError: ApiResponse<T> = {
        success: false,
        status: error.response?.status,
        message: error.message || "Request failed",
        error: error.code || "UNKNOWN_ERROR",
        data: error.response?.data,
      };

      throw apiError;
    }
  },

  // PATCH method
  patch: async <T = any>(
    url: string,
    data?: object,
    config?: CustomAxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await api.patch<T>(url, data, config);

      const responseData = response.data as any;
      const result: ApiResponse<T> = {
        success: response.status >= 200 && response.status < 300,
        data: response.data,
        status: response.status,
        message: responseData?.message || "Request successful",
      };

      return result;
    } catch (error: any) {
      if (error.success !== undefined) {
        throw error;
      }

      const apiError: ApiResponse<T> = {
        success: false,
        status: error.response?.status,
        message: error.message || "Request failed",
        error: error.code || "UNKNOWN_ERROR",
        data: error.response?.data,
      };

      throw apiError;
    }
  },

  // DELETE method
  delete: async <T = any>(
    url: string,
    config?: CustomAxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await api.delete<T>(url, config);

      const responseData = response.data as any;
      const result: ApiResponse<T> = {
        success: response.status >= 200 && response.status < 300,
        data: response.data,
        status: response.status,
        message: responseData?.message || "Request successful",
      };

      return result;
    } catch (error: any) {
      if (error.success !== undefined) {
        throw error;
      }

      const apiError: ApiResponse<T> = {
        success: false,
        status: error.response?.status,
        message: error.message || "Request failed",
        error: error.code || "UNKNOWN_ERROR",
        data: error.response?.data,
      };

      throw apiError;
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
      if (!token) return false;

      const tokenExpiry = await AsyncStorage.getItem("token_expiry");
      if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
        await clearAuthToken();
        return false;
      }

      return true;
    } catch {
      return false;
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
    const response = await fetch("https://www.google.com", {
      method: "HEAD",
      mode: "no-cors",
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Default export
export default api;
