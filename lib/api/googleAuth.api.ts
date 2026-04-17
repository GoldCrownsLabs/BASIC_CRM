// lib/googleAuth.api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse } from "axios";
import { apiService } from ".";


// ==================== INTERFACES ====================

export interface GoogleUserData {
  email: string;
  name: string;
  googleId: string;
  avatar?: string;
  accessToken: string;
  refreshToken?: string;
  metadata?: {
    locale?: string;
    emailVerified?: boolean;
    givenName?: string;
    familyName?: string;
  };
}
// Response from backend after Google login/register

export interface GoogleLoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    profileImage?: string;
    theme?: string;
    role?: string;
    emailVerified?: boolean;
    isActive?: boolean;
    lastLogin?: string | Date; // ✅ Allow both string and Date
    createdAt?: string | Date; // ✅ Allow both string and Date
  };
  googleAuth?: {
    googleId: string;
    loginCount: number;
    lastLoginAt: Date;
  };
  error?: string;
}
// Google auth info for current user
export interface GoogleAuthInfo {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  loginCount: number;
  lastLoginAt: Date;
  linkedAt: Date;
}

// ==================== GOOGLE AUTH API SERVICE ====================

export const googleAuthApi = {
  /**
   * Login or register with Google
   * @param userData Google user data
   * @returns Promise with login response
   */
  googleLogin: async (
    userData: GoogleUserData,
  ): Promise<GoogleLoginResponse> => {
    try {
      console.log("🌐 Sending Google login request to backend...");

      const response = await apiService.post("/auth/google", userData, {
        _skipAuth: true, // Skip token check for login
      });

      console.log("✅ Google login response received:", response.status);

      // Save token if received
      if (response.data?.token) {
        await apiService.setAuthToken(response.data.token);
        console.log("💾 Google auth token saved");
      }

      return {
        success: true,
        message: response.message,
        token: response.data?.token,
        user: response.data?.user,
        googleAuth: response.data?.googleAuth,
      };
    } catch (error: any) {
      console.error("❌ Google login API error:", error);

      return {
        success: false,
        error: error.message || "Google login failed",
        message: error.message,
      };
    }
  },

  /**
   * Get Google auth info for current user
   * @returns Promise with Google auth info
   */
  getGoogleAuthInfo: async (): Promise<{
    success: boolean;
    data?: GoogleAuthInfo;
    error?: string;
  }> => {
    try {
      console.log("🌐 Fetching Google auth info...");

      const response = await apiService.get("/auth/google/info");

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: response.message || "Failed to fetch Google auth info",
      };
    } catch (error: any) {
      console.error("❌ Get Google auth info error:", error);

      return {
        success: false,
        error: error.message || "Failed to fetch Google auth info",
      };
    }
  },

  /**
   * Unlink Google account from user profile
   * @returns Promise with unlink response
   */
  unlinkGoogleAccount: async (): Promise<{
    success: boolean;
    message?: string;
    requiresPasswordSetup?: boolean;
    error?: string;
  }> => {
    try {
      console.log("🌐 Unlinking Google account...");

      const response = await apiService.delete("/auth/google/unlink");

      if (response.success) {
        return {
          success: true,
          message: response.message || "Google account unlinked successfully",
        };
      }

      return {
        success: false,
        error: response.message || "Failed to unlink Google account",
        requiresPasswordSetup: (response.data as any)?.requiresPasswordSetup,
      };
    } catch (error: any) {
      console.error("❌ Unlink Google account error:", error);

      return {
        success: false,
        error: error.message || "Failed to unlink Google account",
      };
    }
  },

  /**
   * Refresh Google access token
   * @returns Promise with new token
   */
  refreshGoogleToken: async (): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    error?: string;
  }> => {
    try {
      console.log("🌐 Refreshing Google token...");

      const response = await apiService.post("/auth/google/refresh-token");

      if (response.success && response.data) {
        return {
          success: true,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        };
      }

      return {
        success: false,
        error: response.message || "Failed to refresh Google token",
      };
    } catch (error: any) {
      console.error("❌ Refresh Google token error:", error);

      return {
        success: false,
        error: error.message || "Failed to refresh Google token",
      };
    }
  },

  /**
   * Check if user has Google account linked
   * @returns Promise with boolean
   */
  hasGoogleLinked: async (): Promise<boolean> => {
    try {
      const result = await googleAuthApi.getGoogleAuthInfo();
      return result.success && !!result.data;
    } catch {
      return false;
    }
  },

  /**
   * Store Google user data locally (for offline use)
   */
  storeGoogleUserData: async (userData: GoogleUserData): Promise<void> => {
    try {
      await AsyncStorage.setItem("google_user_data", JSON.stringify(userData));
      console.log("💾 Google user data stored locally");
    } catch (error) {
      console.error("❌ Error storing Google user data:", error);
    }
  },

  /**
   * Get stored Google user data
   */
  getStoredGoogleUserData: async (): Promise<GoogleUserData | null> => {
    try {
      const data = await AsyncStorage.getItem("google_user_data");
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error("❌ Error getting stored Google user data:", error);
      return null;
    }
  },

  /**
   * Clear stored Google user data
   */
  clearStoredGoogleUserData: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem("google_user_data");
      console.log("🗑️ Google user data cleared");
    } catch (error) {
      console.error("❌ Error clearing Google user data:", error);
    }
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Format Google user data for API
 */
export const formatGoogleUserData = (
  googleData: {
    email: string;
    name: string;
    sub: string;
    picture?: string;
    locale?: string;
    email_verified?: boolean;
    given_name?: string;
    family_name?: string;
  },
  accessToken: string,
  refreshToken?: string,
): GoogleUserData => {
  return {
    email: googleData.email,
    name: googleData.name,
    googleId: googleData.sub,
    avatar: googleData.picture,
    accessToken: accessToken,
    refreshToken: refreshToken,
    metadata: {
      locale: googleData.locale,
      emailVerified: googleData.email_verified,
      givenName: googleData.given_name,
      familyName: googleData.family_name,
    },
  };
};


export default googleAuthApi;
