// lib/api/profile.api.ts
// ==================== INTERFACES & TYPES ====================

import { apiService } from ".";

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  addressType: "home" | "work" | "other";
  isDefault: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
  biometricLogin: boolean;
  lastPasswordChange: string;
  lastLogin: string;
  devices: Device[];
}

export interface Device {
  id: string;
  name: string;
  platform: string;
  lastActive: string;
  isCurrentDevice: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  ipAddress?: string;
  device?: string;
  timestamp: string;
}

export interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalActiveUsers: number;
  newUsersToday: number;
  totalAddresses?: number;
  totalActivities?: number;
}

export interface UserProfile {
  id: string; // Required
  _id?: string; // Optional
  name: string; // Required
  email: string; // Required
  phone?: string; // Optional
  profileImage?: string; // Optional
  theme?: "light" | "dark" | "system"; // Optional with specific values
  role?: "user" | "admin" | "manager"; // Optional with specific values
  isActive?: boolean;
  lastLogin?: string;
  lastSync?: string;
  createdAt?: string;
  updatedAt?: string;
  newsletterSubscription?: boolean;
  emailVerified?: boolean;
  addresses?: Address[];
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileUpdateRequest {
  name?: string;
  phone?: string;
  profileImage?: string;
  theme?: "light" | "dark" | "system";
  newsletterSubscription?: boolean;
}

export interface AddressRequest {
  street: string;
  city: string;
  state: string;
  country?: string;
  zipCode: string;
  addressType: "home" | "work" | "other";
  isDefault?: boolean;
}

// ==================== PROFILE API RESPONSE TYPES ====================

export interface ProfileResponse {
  user: UserProfile;
}

export interface AddressesResponse {
  addresses: Address[];
  count: number;
}

export interface StatsResponse {
  stats: UserStats;
}

// ==================== PROFILE API SERVICE ====================

class ProfileAPI {
  /**
   * Get user profile
   * GET /api/auth/profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiService.get<ProfileResponse>("/auth/profile");

      if (response.success && response.data) {
        const userData = response.data.user || response.data;

        // Ensure required fields exist
        return {
          id: userData.id || userData._id || "",
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone,
          profileImage: userData.profileImage,
          theme: (userData.theme as "light" | "dark" | "system") || "light",
          role: (userData.role as "user" | "admin" | "manager") || "user",
          isActive: userData.isActive,
          lastLogin: userData.lastLogin,
          lastSync: userData.lastSync,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          newsletterSubscription: userData.newsletterSubscription,
          emailVerified: userData.emailVerified,
          addresses: userData.addresses,
          _id: userData._id || userData.id,
        };
      }

      throw new Error(response.message || "Failed to fetch profile");
    } catch (error) {
      console.error("❌ ProfileAPI.getProfile error:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<UserProfile> {
    try {
      const response = await apiService.put<UserProfile>("/auth/profile", data);

      if (response.success && response.data) {
        const userData = response.data;

        return {
          id: userData.id || userData._id || "",
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone,
          profileImage: userData.profileImage,
          theme: (userData.theme as "light" | "dark" | "system") || "light",
          role: (userData.role as "user" | "admin" | "manager") || "user",
          isActive: userData.isActive,
          lastLogin: userData.lastLogin,
          lastSync: userData.lastSync,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          newsletterSubscription: userData.newsletterSubscription,
          emailVerified: userData.emailVerified,
          addresses: userData.addresses,
          _id: userData._id || userData.id,
        };
      }

      throw new Error(response.message || "Failed to update profile");
    } catch (error) {
      console.error("❌ ProfileAPI.updateProfile error:", error);
      throw error;
    }
  }

  /**
   * Change password
   * PUT /api/auth/change-password
   */
  async changePassword(
    data: PasswordChangeRequest,
  ): Promise<{ message: string }> {
    try {
      const response = await apiService.put("/auth/change-password", data);

      if (response.success) {
        return { message: response.message || "Password changed successfully" };
      }

      throw new Error(response.message || "Failed to change password");
    } catch (error) {
      console.error("❌ ProfileAPI.changePassword error:", error);
      throw error;
    }
  }

  /**
   * Delete account
   * DELETE /api/auth/delete-profile
   */
  async deleteAccount(): Promise<{ message: string }> {
    try {
      const response = await apiService.delete("/auth/delete-profile");

      if (response.success) {
        return { message: response.message || "Account deleted successfully" };
      }

      throw new Error(response.message || "Failed to delete account");
    } catch (error) {
      console.error("❌ ProfileAPI.deleteAccount error:", error);
      throw error;
    }
  }

  /**
   * Get all addresses
   * GET /api/auth/addresses
   */
  async getAddresses(): Promise<Address[]> {
    try {
      const response =
        await apiService.get<AddressesResponse>("/auth/addresses");

      if (response.success && response.data) {
        const addressesData = response.data.addresses || response.data;
        return Array.isArray(addressesData) ? addressesData : [];
      }

      return [];
    } catch (error) {
      console.error("❌ ProfileAPI.getAddresses error:", error);
      throw error;
    }
  }

  /**
   * Add new address
   * POST /api/auth/addresses
   */
  async addAddress(data: AddressRequest): Promise<Address[]> {
    try {
      const response = await apiService.post<{ addresses: Address[] }>(
        "/auth/addresses",
        data,
      );

      if (response.success && response.data) {
        return response.data.addresses || [];
      }

      throw new Error(response.message || "Failed to add address");
    } catch (error) {
      console.error("❌ ProfileAPI.addAddress error:", error);
      throw error;
    }
  }

  /**
   * Update address
   * PUT /api/auth/addresses/:addressId
   */
  async updateAddress(
    addressId: string,
    data: Partial<AddressRequest>,
  ): Promise<Address[]> {
    try {
      const response = await apiService.put<{ addresses: Address[] }>(
        `/auth/addresses/${addressId}`,
        data,
      );

      if (response.success && response.data) {
        return response.data.addresses || [];
      }

      throw new Error(response.message || "Failed to update address");
    } catch (error) {
      console.error("❌ ProfileAPI.updateAddress error:", error);
      throw error;
    }
  }

  /**
   * Delete address
   * DELETE /api/auth/addresses/:addressId
   */
  async deleteAddress(addressId: string): Promise<Address[]> {
    try {
      const response = await apiService.delete<{ addresses: Address[] }>(
        `/auth/addresses/${addressId}`,
      );

      if (response.success && response.data) {
        return response.data.addresses || [];
      }

      throw new Error(response.message || "Failed to delete address");
    } catch (error) {
      console.error("❌ ProfileAPI.deleteAddress error:", error);
      throw error;
    }
  }

  /**
   * Set default address
   * PUT /api/auth/addresses/:addressId/set-default
   */
  async setDefaultAddress(addressId: string): Promise<Address[]> {
    try {
      const response = await apiService.put<{ addresses: Address[] }>(
        `/auth/addresses/${addressId}/set-default`,
        {},
      );

      if (response.success && response.data) {
        return response.data.addresses || [];
      }

      throw new Error(response.message || "Failed to set default address");
    } catch (error) {
      console.error("❌ ProfileAPI.setDefaultAddress error:", error);
      throw error;
    }
  }

  /**
   * Update last sync
   * PUT /api/auth/update-last-sync
   */
  async updateLastSync(): Promise<{ lastSync: string }> {
    try {
      const response = await apiService.put("/auth/update-last-sync", {});

      if (response.success && response.data) {
        return { lastSync: response.data.lastSync || new Date().toISOString() };
      }

      throw new Error(response.message || "Failed to update last sync");
    } catch (error) {
      console.error("❌ ProfileAPI.updateLastSync error:", error);
      throw error;
    }
  }

  /**
   * Get stats (Admin only)
   * GET /api/auth/stats
   */
  async getStats(): Promise<UserStats> {
    try {
      const response = await apiService.get<StatsResponse>("/auth/stats");

      if (response.success && response.data) {
        const statsData = response.data.stats || response.data;
        return {
          totalUsers: statsData.totalUsers || 0,
          totalAdmins: statsData.totalAdmins || 0,
          totalActiveUsers: statsData.totalActiveUsers || 0,
          newUsersToday: statsData.newUsersToday || 0,
        };
      }

      return {
        totalUsers: 0,
        totalAdmins: 0,
        totalActiveUsers: 0,
        newUsersToday: 0,
      };
    } catch (error) {
      console.error("❌ ProfileAPI.getStats error:", error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const profileApi = new ProfileAPI();

// Also export default for convenience
export default profileApi;
