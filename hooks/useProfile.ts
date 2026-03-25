// hooks/useProfile.ts - Complete Fixed Version

import { useState, useEffect, useCallback } from "react";
import { Alert, Platform } from "react-native";
import { useAuthStore } from "@/store/auth.store";
import profileApi, {
  Address,
  SecuritySettings,
  UserProfile,
} from "@/lib/api/profile.api";

// Define the User type expected by auth store
interface AuthStoreUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  theme?: string;
  role?: string;
  isActive?: boolean;
  lastLogin?: string;
  lastSync?: string;
  createdAt?: string;
  updatedAt?: string;
  newsletterSubscription?: boolean;
  emailVerified?: boolean;
  addresses?: Address[];
  [key: string]: any;
}

// Bridge interface that combines both
interface ProfileState extends UserProfile {
  id: string;
}

export const useProfile = () => {
  const { user: authUser, logout, setUser } = useAuthStore();
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [securitySettings, setSecuritySettings] =
    useState<SecuritySettings | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalActiveUsers: 0,
    newUsersToday: 0,
  });

  // Helper: Ensure user has an id and all required fields
  const ensureUserId = (userData: UserProfile): ProfileState => {
    const id = userData.id || userData._id || "";

    return {
      id,
      _id: userData._id || id,
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone,
      profileImage: userData.profileImage,
      theme: userData.theme || "light",
      role: userData.role || "user",
      isActive: userData.isActive ?? true,
      lastLogin: userData.lastLogin,
      lastSync: userData.lastSync,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      newsletterSubscription: userData.newsletterSubscription ?? true,
      emailVerified: userData.emailVerified ?? false,
      addresses: userData.addresses || [],
    };
  };

  // Helper: Convert to auth store format (only used when needed)
  const toAuthStoreUser = (userData: ProfileState): AuthStoreUser => {
    return {
      id: userData.id,
      _id: userData._id || userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      profileImage: userData.profileImage,
      theme: userData.theme,
      role: userData.role,
      isActive: userData.isActive,
      lastLogin: userData.lastLogin,
      lastSync: userData.lastSync,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      newsletterSubscription: userData.newsletterSubscription,
      emailVerified: userData.emailVerified,
      addresses: userData.addresses || addresses,
    };
  };

  // Fetch profile - FIXED: No setUser call
  const fetchProfile = useCallback(async (): Promise<void> => {
    try {
      setRefreshing(true);
      const userData = await profileApi.getProfile();
      const profileWithId = ensureUserId(userData);

      setProfile(profileWithId);

      // ❌ REMOVED setUser call - This was causing the redirect
      // const authUserData = toAuthStoreUser(profileWithId);
      // setUser(authUserData);
    } catch (error) {
      console.error("Error fetching profile:", error);

      if (authUser) {
        const fallbackProfile: ProfileState = {
          id: authUser.id,
          _id: authUser._id || authUser.id,
          name: authUser.name || "",
          email: authUser.email || "",
          phone: authUser.phone,
          profileImage: authUser.profileImage,
          theme: (authUser.theme as "light" | "dark" | "system") || "light",
          role: (authUser.role as "user" | "admin" | "manager") || "user",
          isActive: authUser.isActive ?? true,
          lastLogin: authUser.lastLogin,
          lastSync: authUser.lastSync,
          createdAt: authUser.createdAt,
          updatedAt: authUser.updatedAt,
          newsletterSubscription: authUser.newsletterSubscription ?? true,
          emailVerified: authUser.emailVerified ?? false,
          addresses: authUser.addresses || [],
        };
        setProfile(fallbackProfile);
      }
    } finally {
      setRefreshing(false);
    }
  }, [authUser]); // ✅ Removed setUser from dependencies

  // Fetch addresses
  const fetchAddresses = useCallback(async (): Promise<void> => {
    try {
      const addressesData = await profileApi.getAddresses();
      setAddresses(addressesData);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setAddresses([]);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      if (authUser?.role === "admin") {
        const statsData = await profileApi.getStats();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [authUser]);

  // Fetch activity logs
  const fetchActivityLogs = useCallback(async (): Promise<void> => {
    try {
      setActivityLogs([
        {
          id: "1",
          action: "Profile Updated",
          details: "Changed profile picture",
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          action: "Login",
          details: "Logged in successfully",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      setActivityLogs([]);
    }
  }, []);

  // Fetch security settings
  const fetchSecuritySettings = useCallback(async (): Promise<void> => {
    try {
      const lastPasswordChange = profile?.updatedAt
        ? new Date(profile.updatedAt).toLocaleDateString()
        : "Never";

      const lastLogin = profile?.lastLogin
        ? new Date(profile.lastLogin).toLocaleString()
        : new Date().toLocaleString();

      setSecuritySettings({
        twoFactorAuth: false,
        emailNotifications: true,
        pushNotifications: true,
        smsAlerts: false,
        biometricLogin: false,
        lastPasswordChange,
        lastLogin,
        devices: [
          {
            id: "1",
            name: "Current Device",
            platform: Platform.OS === "ios" ? "iOS" : "Android",
            lastActive: "Now",
            isCurrentDevice: true,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching security settings:", error);
    }
  }, [profile]);

  // Update profile - FIXED: No setUser call
  const updateProfile = useCallback(
    async (
      data: Partial<UserProfile>,
    ): Promise<{ success: boolean; user?: ProfileState; error?: string }> => {
      try {
        setLoading(true);
        const updatedUser = await profileApi.updateProfile(data);
        const profileWithId = ensureUserId(updatedUser);

        setProfile(profileWithId);

        // ❌ REMOVED setUser call - This was causing the redirect
        // const authUserData = toAuthStoreUser(profileWithId);
        // setUser(authUserData);

        return { success: true, user: profileWithId };
      } catch (error: any) {
        console.error("Error updating profile:", error);
        return {
          success: false,
          error: error.message || "Failed to update profile",
        };
      } finally {
        setLoading(false);
      }
    },
    [], // ✅ Removed setUser from dependencies
  );

  // Change password
  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        setLoading(true);
        await profileApi.changePassword({ currentPassword, newPassword });
        return { success: true };
      } catch (error: any) {
        console.error("Error changing password:", error);
        return {
          success: false,
          error: error.message || "Failed to change password",
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Delete account
  const deleteAccount = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      setLoading(true);
      await profileApi.deleteAccount();
      await logout();
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting account:", error);
      return {
        success: false,
        error: error.message || "Failed to delete account",
      };
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Address operations
  interface AddressOperationResult {
    success: boolean;
    addresses?: Address[];
    error?: string;
  }

  const addressOperations = {
    add: useCallback(
      async (
        addressData: Omit<Address, "_id">,
      ): Promise<AddressOperationResult> => {
        try {
          setLoading(true);
          const updatedAddresses = await profileApi.addAddress(addressData);
          setAddresses(updatedAddresses);
          return { success: true, addresses: updatedAddresses };
        } catch (error: any) {
          console.error("Error adding address:", error);
          return { success: false, error: error.message };
        } finally {
          setLoading(false);
        }
      },
      [],
    ),

    update: useCallback(
      async (
        addressId: string,
        addressData: Partial<Address>,
      ): Promise<AddressOperationResult> => {
        try {
          setLoading(true);
          const updatedAddresses = await profileApi.updateAddress(
            addressId,
            addressData,
          );
          setAddresses(updatedAddresses);
          return { success: true, addresses: updatedAddresses };
        } catch (error: any) {
          console.error("Error updating address:", error);
          return { success: false, error: error.message };
        } finally {
          setLoading(false);
        }
      },
      [],
    ),

    delete: useCallback(
      async (addressId: string): Promise<AddressOperationResult> => {
        try {
          setLoading(true);
          const updatedAddresses = await profileApi.deleteAddress(addressId);
          setAddresses(updatedAddresses);
          return { success: true, addresses: updatedAddresses };
        } catch (error: any) {
          console.error("Error deleting address:", error);

          // Extract error message from backend response
          let errorMessage = "Failed to delete address";

          if (error?.message) {
            errorMessage = error.message;
          } else if (error?.data?.error) {
            errorMessage = error.data.error;
          } else if (typeof error === "string") {
            errorMessage = error;
          }

          return {
            success: false,
            error: errorMessage,
          };
        } finally {
          setLoading(false);
        }
      },
      [],
    ),

    setDefault: useCallback(
      async (addressId: string): Promise<AddressOperationResult> => {
        try {
          setLoading(true);
          const updatedAddresses =
            await profileApi.setDefaultAddress(addressId);
          setAddresses(updatedAddresses);
          return { success: true, addresses: updatedAddresses };
        } catch (error: any) {
          console.error("Error setting default address:", error);
          return { success: false, error: error.message };
        } finally {
          setLoading(false);
        }
      },
      [],
    ),
  };

  // Update last sync
  const updateLastSync = useCallback(async (): Promise<void> => {
    try {
      const { lastSync } = await profileApi.updateLastSync();
      if (profile) {
        setProfile({ ...profile, lastSync });
      }
    } catch (error) {
      console.error("Error updating last sync:", error);
    }
  }, [profile]);

  // Refresh all data
  const refreshAll = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await Promise.all([
      fetchProfile(),
      fetchAddresses(),
      fetchStats(),
      fetchActivityLogs(),
      fetchSecuritySettings(),
    ]);
    setRefreshing(false);
  }, [
    fetchProfile,
    fetchAddresses,
    fetchStats,
    fetchActivityLogs,
    fetchSecuritySettings,
  ]);

  // Initial data fetch
  useEffect(() => {
    refreshAll();
  }, []);

  // Computed properties
  const getFormattedName = useCallback((): string => {
    return profile?.name || "";
  }, [profile]);

  const getUserInitials = useCallback((): string => {
    if (!profile?.name) return "?";
    return profile.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, [profile]);

  return {
    // Data
    user: profile,
    profile,
    securitySettings,
    activityLogs,
    addresses,
    stats,

    // Computed
    userName: getFormattedName(),
    userInitials: getUserInitials(),
    isAdmin: profile?.role === "admin",
    isActive: profile?.isActive || false,
    hasAddresses: addresses.length > 0,
    defaultAddress: addresses.find((addr) => addr.isDefault),

    // States
    loading,
    refreshing,

    // Methods
    fetchProfile,
    fetchAddresses,
    fetchActivityLogs,
    fetchStats,
    fetchSecuritySettings,
    refreshAll,
    updateProfile,
    changePassword,
    deleteAccount,
    updateLastSync,
    addressOperations,

    // Setters
    setProfile,
    setSecuritySettings,
    setAddresses,

    // Logout
    logout,
  };
};

export default useProfile;
