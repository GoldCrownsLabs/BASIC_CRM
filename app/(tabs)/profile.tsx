// app/profile/ProfilePage.tsx
import React, { useState } from "react";
import {
  ScrollView,
  RefreshControl,
  StatusBar,
  View,
  Alert,
} from "react-native";
import { useAppTheme } from "@/context/ThemeContext";
import { useProfile } from "@/hooks/useProfile";
import { useProfileActions } from "@/hooks/useProfileActions";

// Import Feature Flags
import {
  PROFILE_EDIT_NAME,
  PROFILE_EDIT_EMAIL,
  PROFILE_EDIT_MOBILE,
  PROFILE_EDIT_PHOTO,
  PROFILE_CHANGE_PASSWORD,
  PROFILE_DELETE_ACCOUNT,
  PROFILE_ACTIVITY_LOG,
  PROFILE_ADDRESS_MANAGEMENT,
  PROFILE_DEVICES_LIST,
  PROFILE_STATS_CARD,
  PROFILE_PREFERENCES_CARD,
  PROFILE_PERSONAL_INFO_CARD,
} from "@/components/constants/FeatureFlags";

// Modals
import EditProfileModal from "@/components/Modal/EditProfileModal";
import ChangePasswordModal from "@/components/Modal/ChangePasswordModal";
import DeleteAccountModal from "@/components/Modal/DeleteAccountModal";
import AddressModal from "@/components/Modal/AddressModal";
import { ProfileHeader } from "@/models/Profile/ProfileHeader";
import { ProfileInfoCard } from "@/models/Profile/ProfileInfoCard";
import { PersonalInfoCard } from "@/models/Profile/PersonalInfoCard";
import { PreferencesCard } from "@/models/Profile/PreferencesCard";
import { StatsCard } from "@/models/Profile/StatsCard";
import { PasswordCard } from "@/models/Profile/PasswordCard";
import { ActiveDevicesCard } from "@/models/Profile/ActiveDevicesCard";
import { DangerZoneCard } from "@/models/Profile/DangerZoneCard";
import { ActivityHeaderCard } from "@/models/Profile/ActivityHeaderCard";
import { ActivityTimelineCard } from "@/models/Profile/ActivityTimelineCard";
import { AddressHeaderCard } from "@/models/Profile/AddressHeaderCard";
import { AddressCard } from "@/models/Profile/AddressCard";
import { EmptyAddressCard } from "@/models/Profile/EmptyAddressCard";

// Types
import { Address } from "@/lib/api/profile.api";

interface ProfileFormData {
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  theme?: "light" | "dark" | "system";
  newsletterSubscription?: boolean;
}

interface StatsCardData {
  contacts: number;
  activeLeads: number;
  activities: number;
  meetings: number;
}

const ProfilePage = () => {
  const { colors, isDark } = useAppTheme();

  // TABS - Sirf enabled features ke according
  const getAvailableTabs = () => {
    const tabs = ["profile"];

    if (
      PROFILE_CHANGE_PASSWORD ||
      PROFILE_DELETE_ACCOUNT ||
      PROFILE_DEVICES_LIST
    ) {
      tabs.push("security");
    }

    if (PROFILE_ACTIVITY_LOG) {
      tabs.push("activity");
    }

    if (PROFILE_ADDRESS_MANAGEMENT) {
      tabs.push("address");
    }

    return tabs;
  };

  const availableTabs = getAvailableTabs();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "activity" | "address"
  >(availableTabs[0] as any);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  // Form states
  const [profileForm, setProfileForm] = useState<ProfileFormData>({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Address form
  const [addressForm, setAddressForm] = useState<Address>({
    addressType: "home",
    street: "",
    city: "",
    state: "",
    country: "India",
    zipCode: "",
    isDefault: false,
  });

  // Custom hooks
  const {
    user,
    profile,
    securitySettings,
    activityLogs,
    addresses,
    stats,
    refreshing,
    loading: profileLoading,
    fetchProfile,
    fetchAddresses,
    fetchActivityLogs,
    fetchStats,
    fetchSecuritySettings,
    updateProfile,
    changePassword,
    deleteAccount,
    addressOperations,
  } = useProfile();

  const {
    loading: actionsLoading,
    isUploadingImage,
    handleImageUpload,
  } = useProfileActions(
    profile,
    () => {},
    addresses,
    () => {},
    securitySettings,
    () => {},
    fetchProfile,
    fetchAddresses,
  );

  const isLoading = profileLoading || actionsLoading;

  const transformedStats: StatsCardData = {
    contacts: stats?.totalUsers || 0,
    activeLeads: stats?.totalActiveUsers || 0,
    activities: activityLogs?.length || 0,
    meetings: 0,
  };

  // Handlers
  const onRefresh = async () => {
    if (activeTab === "profile") {
      await Promise.all([fetchProfile(), fetchStats()]);
    } else if (activeTab === "address" && PROFILE_ADDRESS_MANAGEMENT) {
      await fetchAddresses();
    } else if (activeTab === "activity" && PROFILE_ACTIVITY_LOG) {
      await fetchActivityLogs();
    } else if (activeTab === "security") {
      await fetchSecuritySettings();
    }
  };

  const handleEditProfile = () => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        profileImage: user.profileImage || "",
        theme: user.theme || "light",
        newsletterSubscription: user.newsletterSubscription || false,
      });
      setShowEditProfile(true);
    }
  };

  const handleEditProfileSave = async () => {
    const formDataToSend: any = {};

    if (PROFILE_EDIT_NAME && profileForm.name !== undefined) {
      formDataToSend.name = profileForm.name;
    }
    if (PROFILE_EDIT_EMAIL && profileForm.email !== undefined) {
      formDataToSend.email = profileForm.email;
    }
    if (PROFILE_EDIT_MOBILE && profileForm.phone !== undefined) {
      formDataToSend.phone = profileForm.phone;
    }
    if (PROFILE_EDIT_PHOTO && profileForm.profileImage !== undefined) {
      formDataToSend.profileImage = profileForm.profileImage;
    }

    const result = await updateProfile(formDataToSend);
    if (result.success) {
      setShowEditProfile(false);
      setProfileForm({});
      Alert.alert("Success", "Profile updated successfully");
    } else {
      Alert.alert("Error", result.error || "Failed to update profile");
    }
  };

  const handleChangePasswordSave = async () => {
    if (!PROFILE_CHANGE_PASSWORD) {
      Alert.alert("Error", "Change password feature is disabled");
      return;
    }

    if (!passwordForm.currentPassword) {
      Alert.alert("Error", "Please enter current password");
      return;
    }
    if (!passwordForm.newPassword) {
      Alert.alert("Error", "Please enter new password");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    const result = await changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword,
    );

    if (result.success) {
      setShowChangePassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      Alert.alert("Success", "Password changed successfully");
    } else {
      Alert.alert("Error", result.error || "Failed to change password");
    }
  };

  const handleDeleteAccountSave = async () => {
    if (!PROFILE_DELETE_ACCOUNT) {
      Alert.alert("Error", "Delete account feature is disabled");
      return;
    }

    if (deleteConfirmationText.toLowerCase() !== "delete") {
      Alert.alert("Error", 'Please type "delete" to confirm');
      return;
    }

    const result = await deleteAccount();
    if (result.success) {
      setShowDeleteAccount(false);
      setDeleteConfirmationText("");
    } else {
      Alert.alert("Error", result.error || "Failed to delete account");
    }
  };

  const handleAddressSave = async () => {
    if (!PROFILE_ADDRESS_MANAGEMENT) return;

    if (editingAddress) {
      const result = await addressOperations.update(
        editingAddress._id!,
        editingAddress,
      );
      if (result.success) {
        setEditingAddress(null);
        setShowAddAddress(false);
        Alert.alert("Success", "Address updated successfully");
      } else {
        Alert.alert("Error", result.error || "Failed to update address");
      }
    } else {
      const result = await addressOperations.add(addressForm);
      if (result.success) {
        setShowAddAddress(false);
        resetAddressForm();
        Alert.alert("Success", "Address added successfully");
      } else {
        Alert.alert("Error", result.error || "Failed to add address");
      }
    }
  };

  const handleAddressDelete = (addressId: string) => {
    if (!PROFILE_ADDRESS_MANAGEMENT) return;

    if (addresses.length === 1) {
      Alert.alert(
        "Cannot Delete",
        "You cannot delete your last address. Please add another address first.",
        [{ text: "OK" }],
      );
      return;
    }

    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await addressOperations.delete(addressId);
            if (result.success) {
              Alert.alert("Success", "Address deleted successfully");
            } else {
              Alert.alert("Error", result.error || "Failed to delete address");
            }
          },
        },
      ],
    );
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!PROFILE_ADDRESS_MANAGEMENT) return;

    const result = await addressOperations.setDefault(addressId);
    if (result.success) {
      Alert.alert("Success", "Default address updated");
    } else {
      Alert.alert("Error", result.error || "Failed to set default address");
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setShowAddAddress(true);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    resetAddressForm();
    setShowAddAddress(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      addressType: "home",
      street: "",
      city: "",
      state: "",
      country: "India",
      zipCode: "",
      isDefault: false,
    });
  };

  const handleImageUploadWrapper = async () => {
    if (!PROFILE_EDIT_PHOTO) return;

    try {
      await handleImageUpload();
      if (profile?.profileImage) {
        Alert.alert("Success", "Profile image updated");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image");
    }
  };

  const handleAddressModalClose = () => {
    setShowAddAddress(false);
    setEditingAddress(null);
    resetAddressForm();
  };

  const handleAddressChange = (field: keyof Address, value: any) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 0,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <ProfileHeader
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        onRefresh={onRefresh}
        isRefreshing={refreshing}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            style={{ backgroundColor: colors.background }}
            progressViewOffset={20}
          />
        }
      >
        {/* Profile Tab */}
        {activeTab === "profile" && user && (
          <View style={{ padding: 16 }}>
            <ProfileInfoCard user={user} onEditProfile={handleEditProfile} />

            {PROFILE_PERSONAL_INFO_CARD && <PersonalInfoCard user={user} />}

            {PROFILE_PREFERENCES_CARD && <PreferencesCard user={user} />}

            {PROFILE_STATS_CARD && (
              <StatsCard user={user} stats={transformedStats} />
            )}
          </View>
        )}

        {/* Security Tab */}
        {activeTab === "security" && securitySettings && (
          <View style={{ padding: 16 }}>
            {PROFILE_CHANGE_PASSWORD && (
              <PasswordCard
                securitySettings={securitySettings}
                onChangePassword={() => setShowChangePassword(true)}
              />
            )}

            {PROFILE_DEVICES_LIST && (
              <ActiveDevicesCard securitySettings={securitySettings} />
            )}

            {PROFILE_DELETE_ACCOUNT && (
              <DangerZoneCard
                onDeleteAccount={() => setShowDeleteAccount(true)}
              />
            )}
          </View>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && PROFILE_ACTIVITY_LOG && (
          <View
            style={{
              paddingTop: 10,
              paddingLeft: 10,
              paddingRight: 10,
            }}
          >
            <ActivityHeaderCard
              activityLogs={activityLogs || []}
              securitySettings={securitySettings}
            />
            <ActivityTimelineCard activityLogs={activityLogs || []} />
          </View>
        )}

        {/* Address Tab */}
        {activeTab === "address" && PROFILE_ADDRESS_MANAGEMENT && (
          <View
            style={{
              paddingTop: 10,
              paddingLeft: 10,
              paddingRight: 10,
            }}
          >
            <AddressHeaderCard
              addresses={addresses}
              onAddAddress={handleAddNewAddress}
            />

            {addresses.length > 0 ? (
              addresses.map((address) => (
                <AddressCard
                  key={address._id}
                  address={address}
                  onEdit={handleEditAddress}
                  onDelete={handleAddressDelete}
                  onSetDefault={handleSetDefaultAddress}
                />
              ))
            ) : (
              <EmptyAddressCard onAddAddress={handleAddNewAddress} />
            )}
          </View>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      {(PROFILE_EDIT_NAME ||
        PROFILE_EDIT_EMAIL ||
        PROFILE_EDIT_MOBILE ||
        PROFILE_EDIT_PHOTO) && (
        <EditProfileModal
          visible={showEditProfile}
          onClose={() => {
            setShowEditProfile(false);
            setProfileForm({});
          }}
          profile={profileForm}
          onProfileChange={(field, value) =>
            setProfileForm({ ...profileForm, [field]: value })
          }
          onSave={handleEditProfileSave}
          isLoading={isLoading}
          isUploadingImage={isUploadingImage}
          onImageUpload={handleImageUploadWrapper}
          colors={colors}
          canEditName={PROFILE_EDIT_NAME}
          canEditEmail={PROFILE_EDIT_EMAIL}
          canEditMobile={PROFILE_EDIT_MOBILE}
          canEditPhoto={PROFILE_EDIT_PHOTO}
        />
      )}

      {/* Change Password Modal */}
      {PROFILE_CHANGE_PASSWORD && (
        <ChangePasswordModal
          visible={showChangePassword}
          onClose={() => {
            setShowChangePassword(false);
            setPasswordForm({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
          }}
          passwordForm={passwordForm}
          onPasswordFormChange={(field, value) =>
            setPasswordForm({ ...passwordForm, [field]: value })
          }
          onSave={handleChangePasswordSave}
          isLoading={isLoading}
          colors={colors}
        />
      )}

      {/* Delete Account Modal */}
      {PROFILE_DELETE_ACCOUNT && (
        <DeleteAccountModal
          visible={showDeleteAccount}
          onClose={() => {
            setShowDeleteAccount(false);
            setDeleteConfirmationText("");
          }}
          deleteConfirmationText={deleteConfirmationText}
          onDeleteConfirmationTextChange={setDeleteConfirmationText}
          onDelete={handleDeleteAccountSave}
          isLoading={isLoading}
          colors={colors}
        />
      )}

      {/* Address Modal */}
      {PROFILE_ADDRESS_MANAGEMENT && (
        <AddressModal
          visible={showAddAddress}
          onClose={handleAddressModalClose}
          address={addressForm}
          onAddressChange={handleAddressChange}
          onSave={handleAddressSave}
          isLoading={isLoading}
          isEditing={!!editingAddress}
          colors={colors}
        />
      )}
    </View>
  );
};

export default ProfilePage;
