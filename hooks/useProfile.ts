import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useAuthStore } from "@/store/auth.store";
import { apiService } from "@/lib/api";

export const useProfile = () => {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [securitySettings, setSecuritySettings] = useState<any>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  // const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>({
    contacts: 0,
    activeLeads: 0,
    activities: 0,
    meetings: 0,
  });

  const fetchProfile = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await apiService.get("/auth/profile");

      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        // Use user store data as fallback
        if (user) {
          setProfile({
            firstName: user.name?.split(" ")[0] || "",
            lastName: user.name?.split(" ").slice(1).join(" ") || "",
            email: user.email || "",
            joinDate: user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "N/A",
            status: user.isActive ? "Active" : "Inactive",
            avatar: user.profileImage,
            role: user.role,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await apiService.get("/auth/addresses");
      if (response.success && response.data) {
        setAddresses(response.data);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setAddresses([]);
    }
  }, []);

  const fetchActivityLogs = useCallback(async () => {
    try {
      // For now, set empty array
      setActivityLogs([]);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      setActivityLogs([]);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      // Mock stats for now
      setStats({
        contacts: 0,
        activeLeads: 0,
        activities: 0,
        meetings: 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        contacts: 0,
        activeLeads: 0,
        activities: 0,
        meetings: 0,
      });
    }
  }, []);

  const fetchSecuritySettings = useCallback(async () => {
    try {
      // Mock security settings
      setSecuritySettings({
        twoFactorAuth: false,
        emailNotifications: true,
        pushNotifications: true,
        smsAlerts: false,
        biometricLogin: false,
        lastPasswordChange: "Never",
        lastLogin: "Just now",
        devices: [],
      });
    } catch (error) {
      console.error("Error fetching security settings:", error);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
    fetchActivityLogs();
    fetchStats();
    fetchSecuritySettings();
  }, [
    fetchProfile,
    fetchAddresses,
    fetchActivityLogs,
    fetchStats,
    fetchSecuritySettings,
  ]);

  return {
    user,
    profile,
    securitySettings,
    activityLogs,
    addresses,
    stats,
    loading,
    refreshing,
    fetchProfile,
    fetchAddresses,
    fetchActivityLogs,
    fetchStats,
    fetchSecuritySettings,
    setProfile,
    setSecuritySettings,
    setAddresses,
    logout,
  };
};
