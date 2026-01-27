import { useAppTheme } from "@/context/ThemeContext";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuthStore } from "@/store/auth.store";
import { apiService } from "@/lib/api";
import EditProfileModal from "@/components/Modal/EditProfileModal";
import ChangePasswordModal from "@/components/Modal/ChangePasswordModal";
import DeleteAccountModal from "@/components/Modal/DeleteAccountModal";
import AddressModal from "@/components/Modal/AddressModal";

const { width } = Dimensions.get("window");

// Interfaces
interface ProfileData {
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  department?: string;
  location?: string;
  bio?: string;
  joinDate?: string;
  status?: string;
  avatar?: string;
  role?: string;
  isActive?: boolean;
  lastSync?: string;
  createdAt?: string;
  lastLogin?: string;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
  biometricLogin: boolean;
  lastPasswordChange: string;
  lastLogin: string;
  devices: Array<{
    id: string;
    name: string;
    os: string;
    lastActive: string;
  }>;
}

interface ActivityLog {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: string;
}

interface Address {
  _id?: string;
  type: "home" | "work" | "other";
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage = () => {
  const { colors, isDark } = useAppTheme();
  const { user, logout } = useAuthStore();
  console.log("data response:    ", user);

  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "activity" | "address"
  >("profile");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  // User profile data from API
  const [profile, setProfile] = useState<ProfileData>({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    company: "",
    position: "",
    department: "",
    location: "",
    bio: "",
    joinDate: user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "N/A",
    status: user?.isActive ? "Active" : "Inactive",
    avatar:
      user?.profileImage ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=2196F3&color=fff`,
  });

  // Security settings (local state - some can be synced with backend)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    biometricLogin: false,
    lastPasswordChange: "Never",
    lastLogin: "Just now",
    devices: [],
  });

  // Activity logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Address form
  const [addressForm, setAddressForm] = useState<Address>({
    type: "home",
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    isDefault: false,
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Stats
  const [stats, setStats] = useState({
    contacts: 0,
    activeLeads: 0,
    activities: 0,
    meetings: 0,
  });

  // ✅ Format data function - show N/A if empty
  const formatData = (value: any, fallback: string = "N/A") => {
    if (!value || value === "" || value === undefined || value === null) {
      return fallback;
    }
    return value;
  };

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setIsRefreshing(true);
      console.log("Fetching profile data from:", "/auth/profile");
      const response = await apiService.get<ProfileData>("/auth/profile");

      console.log("Profile API Full Response:", response);

      if (response.success && response.data) {
        const profileData = response.data;
        const firstName =
          profileData.firstName || profileData.name?.split(" ")[0] || "";
        const lastName =
          profileData.lastName ||
          profileData.name?.split(" ").slice(1).join(" ") ||
          "";

        const updatedProfile: ProfileData = {
          firstName,
          lastName,
          name: profileData.name,
          email: profileData.email || user?.email || "",
          phone: profileData.phone || "",
          company: profileData.company || "",
          position: profileData.position || "",
          department: profileData.department || "",
          location: profileData.location || "",
          bio: profileData.bio || "",
          joinDate: profileData.createdAt
            ? new Date(profileData.createdAt).toLocaleDateString()
            : "N/A",
          status: profileData.isActive ? "Active" : "Inactive",
          avatar:
            profileData.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + " " + lastName)}&background=2196F3&color=fff`,
          role: profileData.role,
          isActive: profileData.isActive,
          lastSync: profileData.lastSync,
          createdAt: profileData.createdAt,
          lastLogin: profileData.lastLogin,
        };

        setProfile(updatedProfile);
      } else {
        console.log("Profile API returned empty or error:", response);
        // Use user store data
        if (user) {
          const userProfile: ProfileData = {
            firstName: user.name?.split(" ")[0] || "",
            lastName: user.name?.split(" ").slice(1).join(" ") || "",
            email: user.email || "",
            joinDate: user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "N/A",
            status: user.isActive ? "Active" : "Inactive",
            avatar:
              user.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=2196F3&color=fff`,
            role: user.role,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
          };
          setProfile(userProfile);
        }
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      // Use user store data as fallback
      if (user) {
        const userProfile: ProfileData = {
          firstName: user.name?.split(" ")[0] || "",
          lastName: user.name?.split(" ").slice(1).join(" ") || "",
          email: user.email || "",
          joinDate: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : "N/A",
          status: user.isActive ? "Active" : "Inactive",
          avatar:
            user.profileImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=2196F3&color=fff`,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
        };
        setProfile(userProfile);
      }
      Alert.alert("Error", error.message || "Failed to load profile data");
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    try {
      console.log("Fetching addresses...");
      const response = await apiService.get<Address[]>("/auth/addresses");

      console.log("Addresses API Response:", response);

      if (response.success && response.data) {
        setAddresses(response.data);
      } else {
        setAddresses([]);
      }
    } catch (error: any) {
      console.error("Error fetching addresses:", error);
      setAddresses([]);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      // Mock stats for now - replace with real API calls
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

  // Fetch activity logs
  const fetchActivityLogs = useCallback(async () => {
    try {
      // For now, set empty array - you can implement real API later
      setActivityLogs([]);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      setActivityLogs([]);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchProfile();
    fetchAddresses();
    fetchStats();
    fetchActivityLogs();
  }, [fetchProfile, fetchAddresses, fetchStats, fetchActivityLogs]);

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true);

      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email,
        phone: profile.phone || "",
        company: profile.company || "",
        position: profile.position || "",
        department: profile.department || "",
        location: profile.location || "",
        bio: profile.bio || "",
      };

      console.log("Updating profile with data:", updateData);

      const response = await apiService.put("/auth/profile", updateData);

      console.log("Update profile response:", response);

      if (response.success) {
        Alert.alert(
          "Success",
          response.message || "Profile updated successfully!",
        );
        setShowEditProfile(false);

        // Refresh profile data
        fetchProfile();
      } else {
        Alert.alert("Error", response.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);

      const response = await apiService.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      console.log("Change password response:", response);

      if (response.success) {
        Alert.alert(
          "Success",
          response.message || "Password changed successfully!",
        );
        setShowChangePassword(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // Update security settings
        setSecuritySettings((prev) => ({
          ...prev,
          lastPasswordChange: "Just now",
        }));
      } else {
        Alert.alert("Error", response.message || "Failed to change password");
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      Alert.alert("Error", error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== "DELETE") {
      Alert.alert("Error", "Please type DELETE to confirm account deletion");
      return;
    }

    try {
      setIsLoading(true);

      const response = await apiService.delete("/auth/delete-profile");

      console.log("Delete account response:", response);

      if (response.success) {
        Alert.alert(
          "Account Deleted",
          response.message || "Your account has been deleted successfully.",
        );
        setShowDeleteAccount(false);
        setDeleteConfirmationText("");

        // Logout user
        await logout();
      } else {
        Alert.alert("Error", response.message || "Failed to delete account");
      }
    } catch (error: any) {
      console.error("Error deleting account:", error);
      Alert.alert("Error", error.message || "Failed to delete account");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle address operations
  const handleAddAddress = async () => {
    try {
      setIsLoading(true);

      const response = await apiService.post("/auth/addresses", addressForm);

      console.log("Add address response:", response);

      if (response.success) {
        Alert.alert(
          "Success",
          response.message || "Address added successfully!",
        );
        setShowAddAddress(false);
        setAddressForm({
          type: "home",
          street: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
          isDefault: false,
        });

        // Refresh addresses
        fetchAddresses();
      } else {
        Alert.alert("Error", response.message || "Failed to add address");
      }
    } catch (error: any) {
      console.error("Error adding address:", error);
      Alert.alert("Error", error.message || "Failed to add address");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAddress = async (addressId: string) => {
    if (!editingAddress?._id) return;

    try {
      setIsLoading(true);

      const response = await apiService.put(
        `/auth/addresses/${addressId}`,
        editingAddress,
      );

      console.log("Update address response:", response);

      if (response.success) {
        Alert.alert(
          "Success",
          response.message || "Address updated successfully!",
        );
        setEditingAddress(null);

        // Refresh addresses
        fetchAddresses();
      } else {
        Alert.alert("Error", response.message || "Failed to update address");
      }
    } catch (error: any) {
      console.error("Error updating address:", error);
      Alert.alert("Error", error.message || "Failed to update address");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);

              const response = await apiService.delete(
                `/auth/addresses/${addressId}`,
              );

              console.log("Delete address response:", response);

              if (response.success) {
                Alert.alert(
                  "Success",
                  response.message || "Address deleted successfully!",
                );

                // Refresh addresses
                fetchAddresses();
              } else {
                Alert.alert(
                  "Error",
                  response.message || "Failed to delete address",
                );
              }
            } catch (error: any) {
              console.error("Error deleting address:", error);
              Alert.alert("Error", error.message || "Failed to delete address");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      setIsLoading(true);

      const response = await apiService.put(
        `/auth/addresses/${addressId}/set-default`,
      );

      console.log("Set default address response:", response);

      if (response.success) {
        Alert.alert("Success", response.message || "Default address updated!");

        // Refresh addresses
        fetchAddresses();
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to set default address",
        );
      }
    } catch (error: any) {
      console.error("Error setting default address:", error);
      Alert.alert("Error", error.message || "Failed to set default address");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Modal text input handling functions
  const handleEditProfileChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordFormChange = (
    field: keyof PasswordForm,
    value: string,
  ) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressFormChange = (field: keyof Address, value: any) => {
    if (editingAddress) {
      setEditingAddress({ ...editingAddress, [field]: value });
    } else {
      setAddressForm({ ...addressForm, [field]: value });
    }
  };

  // Simulate image upload
  const handleImageUpload = () => {
    setIsUploadingImage(true);

    // Mock implementation
    setTimeout(() => {
      setIsUploadingImage(false);
      Alert.alert("Success", "Profile picture updated!");

      // Update avatar URL
      setProfile((prev) => ({
        ...prev,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent((prev.firstName || "") + " " + (prev.lastName || ""))}&background=2196F3&color=fff&bold=true`,
      }));
    }, 1500);
  };

  // Pull to refresh
  const onRefresh = useCallback(() => {
    if (activeTab === "profile") {
      fetchProfile();
      fetchStats();
    } else if (activeTab === "address") {
      fetchAddresses();
    } else if (activeTab === "activity") {
      fetchActivityLogs();
    }
  }, [activeTab, fetchProfile, fetchAddresses, fetchStats, fetchActivityLogs]);


  // Render Info Item
  const InfoItem = ({ icon, label, value }: any) => (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: `${colors.primary}20`,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
        }}
      >
        <Feather name={icon} size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}
        >
          {label}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
          {formatData(value)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 16,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View>
          <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
            Profile
          </Text>
          <Text
            style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}
          >
            Manage your account settings
          </Text>
        </View>

        <TouchableOpacity onPress={onRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Feather name="refresh-cw" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {["profile", "security", "activity", "address"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={{
              flex: 1,
              paddingVertical: 16,
              alignItems: "center",
              borderBottomWidth: 3,
              borderBottomColor:
                activeTab === tab ? colors.primary : "transparent",
            }}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color:
                  activeTab === tab ? colors.primary : colors.textSecondary,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <View style={{ padding: 20 }}>
            {/* Profile Header */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 24,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <View style={{ position: "relative", marginRight: 20 }}>
                  <Image
                    source={{
                      uri:
                        user?.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=2196F3&color=fff`,
                    }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      borderWidth: 3,
                      borderColor: colors.primary,
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: user?.isActive
                        ? colors.success
                        : colors.error,
                      borderWidth: 2,
                      borderColor: colors.card,
                    }}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "700",
                      color: colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {formatData(user?.name || "N/A")}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                      marginBottom: 8,
                    }}
                  >
                    {user?.email || "N/A"}
                  </Text>
                  <View
                    style={{
                      alignSelf: "flex-start",
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: user?.isActive
                        ? `${colors.success}20`
                        : `${colors.error}20`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: user?.isActive ? colors.success : colors.error,
                      }}
                    >
                      {user?.isActive ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={{
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                }}
                onPress={() => setShowEditProfile(true)}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}
                >
                  Edit Profile
                </Text>
              </TouchableOpacity>
            </View>

            {/* Personal Information */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 20,
                }}
              >
                Personal Information
              </Text>

              <InfoItem icon="mail" label="Email" value={user?.email} />
              <InfoItem icon="shield" label="Role" value={user?.role} />
              <InfoItem
                icon="check-circle"
                label="Email Verified"
                value={user?.emailVerified ? "Verified" : "Not Verified"}
              />
              <InfoItem
                icon="calendar"
                label="Member Since"
                value={
                  user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"
                }
              />
              <InfoItem
                icon="clock"
                label="Last Login"
                value={
                  user?.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "N/A"
                }
              />
            </View>

            {/* Additional Information */}
            {user?.newsletterSubscription !== undefined && (
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 12,
                  }}
                >
                  Preferences
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{ fontSize: 14, color: colors.text }}>
                    Newsletter Subscription
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: user.newsletterSubscription
                        ? `${colors.success}20`
                        : `${colors.error}20`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: user.newsletterSubscription
                          ? colors.success
                          : colors.error,
                      }}
                    >
                      {user.newsletterSubscription
                        ? "Subscribed"
                        : "Not Subscribed"}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 14, color: colors.text }}>
                    Theme Preference
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: `${colors.primary}20`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: colors.primary,
                      }}
                    >
                      {user?.theme
                        ? user.theme.charAt(0).toUpperCase() +
                          user.theme.slice(1)
                        : "Light"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Stats */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 20,
                }}
              >
                Stats
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ alignItems: "center", flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "700",
                      color: colors.primary,
                      marginBottom: 4,
                    }}
                  >
                    {formatData(user?.addresses?.length || 0, "0")}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    Addresses
                  </Text>
                </View>

                <View style={{ alignItems: "center", flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "700",
                      color: colors.success,
                      marginBottom: 4,
                    }}
                  >
                    {user?.emailVerified ? "1" : "0"}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    Verified
                  </Text>
                </View>

                <View style={{ alignItems: "center", flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "700",
                      color: colors.warning,
                      marginBottom: 4,
                    }}
                  >
                    {formatData(stats.activities, "0")}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    Activities
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <View style={{ padding: 20 }}>
            {/* Security Settings */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 20,
                }}
              >
                Security Settings
              </Text>

              {Object.entries({
                twoFactorAuth: "Two-Factor Authentication",
                emailNotifications: "Email Notifications",
                pushNotifications: "Push Notifications",
                smsAlerts: "SMS Alerts",
                biometricLogin: "Biometric Login",
              }).map(([key, label]) => (
                <View
                  key={key}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 16,
                    borderBottomWidth: key !== "biometricLogin" ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 16, color: colors.text }}>
                    {label}
                  </Text>
                  <Switch
                    value={
                      securitySettings[
                        key as keyof typeof securitySettings
                      ] as boolean
                    }
                    onValueChange={(value) =>
                      setSecuritySettings({ ...securitySettings, [key]: value })
                    }
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ))}
            </View>

            {/* Password Section */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Password
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 20,
                }}
              >
                Last changed:{" "}
                {formatData(securitySettings.lastPasswordChange, "Never")}
              </Text>

              <TouchableOpacity
                style={{
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                }}
                onPress={() => setShowChangePassword(true)}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.primary,
                  }}
                >
                  Change Password
                </Text>
              </TouchableOpacity>
            </View>

            {/* Active Devices */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  Active Devices
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  {securitySettings.devices.length} devices
                </Text>
              </View>

              {securitySettings.devices.length > 0 ? (
                securitySettings.devices.map((device) => (
                  <View
                    key={device.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: `${colors.primary}20`,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 16,
                      }}
                    >
                      <MaterialIcons
                        name={device.os === "iOS" ? "phone-iphone" : "computer"}
                        size={20}
                        color={colors.primary}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: colors.text,
                        }}
                      >
                        {device.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textSecondary,
                          marginTop: 2,
                        }}
                      >
                        {device.os} • Last active: {device.lastActive}
                      </Text>
                    </View>

                    {device.lastActive === "Now" && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: colors.success,
                        }}
                      />
                    )}
                  </View>
                ))
              ) : (
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    textAlign: "center",
                    paddingVertical: 20,
                  }}
                >
                  No active devices found
                </Text>
              )}
            </View>

            {/* Danger Zone */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: colors.error,
                  marginBottom: 16,
                }}
              >
                Danger Zone
              </Text>

              <TouchableOpacity
                style={{
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: `${colors.error}10`,
                  borderWidth: 1,
                  borderColor: colors.error,
                  alignItems: "center",
                }}
                onPress={() => setShowDeleteAccount(true)}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.error,
                  }}
                >
                  Delete Account
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  textAlign: "center",
                  marginTop: 12,
                }}
              >
                Once deleted, your account cannot be recovered.
              </Text>
            </View>
          </View>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <View style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10 }}>
            {/* Activity Header */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  Recent Activity
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  Last 30 days
                </Text>
              </View>

              <View style={{ alignItems: "center", marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "700",
                    color: colors.primary,
                  }}
                >
                  {activityLogs.length}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  activities this month
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Last login: {formatData(securitySettings.lastLogin)}
              </Text>
            </View>

            {/* Activity Timeline */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 20,
                }}
              >
                Activity Timeline
              </Text>

              {activityLogs.length > 0 ? (
                activityLogs.map((activity, index) => (
                  <View
                    key={activity.id}
                    style={{
                      flexDirection: "row",
                      paddingVertical: 16,
                      borderBottomWidth:
                        index < activityLogs.length - 1 ? 1 : 0,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <View style={{ marginRight: 16 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor:
                            activity.type === "login"
                              ? `${colors.info}20`
                              : activity.type === "contact"
                                ? `${colors.success}20`
                                : activity.type === "task"
                                  ? `${colors.warning}20`
                                  : activity.type === "meeting"
                                    ? `${colors.primary}20`
                                    : activity.type === "export"
                                      ? `${colors.info}20`
                                      : activity.type === "password"
                                        ? `${colors.error}20`
                                        : `${colors.primary}20`,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Feather
                          name={activity.icon as any}
                          size={20}
                          color={
                            activity.type === "login"
                              ? colors.info
                              : activity.type === "contact"
                                ? colors.success
                                : activity.type === "task"
                                  ? colors.warning
                                  : activity.type === "meeting"
                                    ? colors.primary
                                    : activity.type === "export"
                                      ? colors.info
                                      : activity.type === "password"
                                        ? colors.error
                                        : colors.primary
                          }
                        />
                      </View>

                      {index < activityLogs.length - 1 && (
                        <View
                          style={{
                            flex: 1,
                            width: 2,
                            backgroundColor: colors.border,
                            alignSelf: "center",
                            marginTop: 4,
                          }}
                        />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: colors.text,
                          marginBottom: 4,
                        }}
                      >
                        {activity.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.textSecondary,
                          marginBottom: 8,
                        }}
                      >
                        {activity.description}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: colors.textSecondary }}
                      >
                        {activity.time}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <Feather
                    name="activity"
                    size={48}
                    color={colors.textSecondary}
                    style={{ marginBottom: 16 }}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: colors.text,
                      marginBottom: 8,
                    }}
                  >
                    No Activity Logs
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                      textAlign: "center",
                    }}
                  >
                    Your activity logs will appear here
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Address Tab */}
        {activeTab === "address" && (
          <View style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10 }}>
            {/* Address Header */}
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  Addresses
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  {addresses.length} addresses
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                }}
                onPress={() => setShowAddAddress(true)}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}
                >
                  Add New Address
                </Text>
              </TouchableOpacity>
            </View>

            {/* Address List */}
            {addresses.length > 0 ? (
              addresses.map((address) => (
                <View
                  key={address._id}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: `${colors.primary}20`,
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 12,
                        }}
                      >
                        <Feather
                          name={
                            address.type === "home"
                              ? "home"
                              : address.type === "work"
                                ? "briefcase"
                                : "map-pin"
                          }
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                      <View>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: colors.text,
                          }}
                        >
                          {address.type.charAt(0).toUpperCase() +
                            address.type.slice(1)}{" "}
                          Address
                        </Text>
                        {address.isDefault && (
                          <View
                            style={{
                              alignSelf: "flex-start",
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 8,
                              backgroundColor: `${colors.success}20`,
                              marginTop: 4,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: "600",
                                color: colors.success,
                              }}
                            >
                              Default
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <TouchableOpacity
                        onPress={() => setEditingAddress(address)}
                      >
                        <Feather
                          name="edit-2"
                          size={18}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteAddress(address._id!)}
                      >
                        <Feather
                          name="trash-2"
                          size={18}
                          color={colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {formatData(address.street)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {formatData(address.city)}, {formatData(address.state)}{" "}
                    {formatData(address.postalCode)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.text,
                      marginBottom: 12,
                    }}
                  >
                    {formatData(address.country)}
                  </Text>

                  {!address.isDefault && (
                    <TouchableOpacity
                      style={{
                        paddingVertical: 8,
                        borderRadius: 8,
                        backgroundColor: colors.background,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: "center",
                      }}
                      onPress={() => handleSetDefaultAddress(address._id!)}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.primary,
                        }}
                      >
                        Set as Default
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  padding: 40,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Feather
                  name="map-pin"
                  size={48}
                  color={colors.textSecondary}
                  style={{ marginBottom: 16 }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  No Addresses Added
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    textAlign: "center",
                    marginBottom: 24,
                  }}
                >
                  Add your first address to get started
                </Text>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                  }}
                  onPress={() => setShowAddAddress(true)}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#FFFFFF",
                    }}
                  >
                    Add Address
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <EditProfileModal
          visible={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          profile={profile}
          onProfileChange={handleEditProfileChange}
          onSave={handleProfileUpdate}
          isLoading={isLoading}
          isUploadingImage={isUploadingImage}
          onImageUpload={handleImageUpload}
          colors={colors}
        />
        <ChangePasswordModal
          visible={showChangePassword}
          onClose={() => setShowChangePassword(false)}
          passwordForm={passwordForm}
          onPasswordFormChange={handlePasswordFormChange}
          onSave={handlePasswordChange}
          isLoading={isLoading}
          colors={colors}
        />
        <DeleteAccountModal
          visible={showDeleteAccount}
          onClose={() => {
            setShowDeleteAccount(false);
            setDeleteConfirmationText("");
          }}
          deleteConfirmationText={deleteConfirmationText}
          onDeleteConfirmationTextChange={setDeleteConfirmationText}
          onDelete={handleDeleteAccount}
          isLoading={isLoading}
          colors={colors}
        />
        <AddressModal
          visible={showAddAddress || !!editingAddress}
          onClose={() => {
            setShowAddAddress(false);
            setEditingAddress(null);
            setAddressForm({
              type: "home",
              street: "",
              city: "",
              state: "",
              country: "",
              postalCode: "",
              isDefault: false,
            });
          }}
          address={editingAddress || addressForm}
          onAddressChange={handleAddressFormChange}
          onSave={() => {
            if (editingAddress && editingAddress._id) {
              handleUpdateAddress(editingAddress._id);
            } else {
              handleAddAddress();
            }
          }}
          isLoading={isLoading}
          isEditing={!!editingAddress}
          colors={colors}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfilePage;
