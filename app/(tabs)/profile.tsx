import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  StatusBar,
  View,
  Alert,
} from "react-native";
import { useAppTheme } from "@/context/ThemeContext";
import { useProfile } from "@/hooks/useProfile";
import { useProfileActions } from "@/hooks/useProfileActions";



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
import { SecuritySettingsCard } from "@/models/Profile/SecuritySettingsCard";
import { PasswordCard } from "@/models/Profile/PasswordCard";
import { ActiveDevicesCard } from "@/models/Profile/ActiveDevicesCard";
import { DangerZoneCard } from "@/models/Profile/DangerZoneCard";
import { ActivityHeaderCard } from "@/models/Profile/ActivityHeaderCard";
import { ActivityTimelineCard } from "@/models/Profile/ActivityTimelineCard";
import { AddressHeaderCard } from "@/models/Profile/AddressHeaderCard";
import { AddressCard } from "@/models/Profile/AddressCard";
import { EmptyAddressCard } from "@/models/Profile/EmptyAddressCard";

const ProfilePage = () => {
  const { colors, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "activity" | "address"
  >("profile");

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  // Form states
  const [profileForm, setProfileForm] = useState<any>({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [addressForm, setAddressForm] = useState({
    type: "home",
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
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
    fetchProfile,
    fetchAddresses,
    fetchActivityLogs,
    fetchStats,
    fetchSecuritySettings,
    setProfile,
    setSecuritySettings,
    setAddresses,
    logout,
  } = useProfile();

  const {
    loading,
    isUploadingImage,
    handleProfileUpdate,
    handlePasswordChange,
    handleDeleteAccount,
    handleAddressOperations,
    handleImageUpload,
  } = useProfileActions(
    profile,
    setProfile,
    addresses,
    setAddresses,
    securitySettings,
    setSecuritySettings,
    fetchProfile,
    fetchAddresses,
  );

  // Handlers
  const onRefresh = () => {
    if (activeTab === "profile") {
      fetchProfile();
      fetchStats();
    } else if (activeTab === "address") {
      fetchAddresses();
    } else if (activeTab === "activity") {
      fetchActivityLogs();
    } else if (activeTab === "security") {
      fetchSecuritySettings();
    }
  };

  const handleEditProfileSave = async () => {
    const success = await handleProfileUpdate(profileForm);
    if (success) {
      setShowEditProfile(false);
      setProfileForm({});
    }
  };

  const handleChangePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    const success = await handlePasswordChange(
      passwordForm.currentPassword,
      passwordForm.newPassword,
    );

    if (success) {
      setShowChangePassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const handleDeleteAccountSave = async () => {
    const success = await handleDeleteAccount(deleteConfirmationText);
    if (success) {
      setShowDeleteAccount(false);
      setDeleteConfirmationText("");
      await logout();
    }
  };

  const handleAddressSave = async () => {
    if (editingAddress) {
      const success = await handleAddressOperations.update(
        editingAddress._id,
        editingAddress,
      );
      if (success) {
        setEditingAddress(null);
      }
    } else {
      const success = await handleAddressOperations.add(addressForm);
      if (success) {
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
      }
    }
  };

  const handleAddressDelete = (addressId: string) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleAddressOperations.delete(addressId),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <ProfileHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={onRefresh}
        isRefreshing={refreshing}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <View style={{ padding: 20 }}>
            <ProfileInfoCard
              user={user}
              onEditProfile={() => {
                setProfileForm(profile || {});
                setShowEditProfile(true);
              }}
            />

            <PersonalInfoCard user={user} />

            <PreferencesCard user={user} />

            <StatsCard user={user} stats={stats} />
          </View>
        )}

        {/* Security Tab */}
        {activeTab === "security" && securitySettings && (
          <View style={{ padding: 20 }}>
            <SecuritySettingsCard
              securitySettings={securitySettings}
              onSecuritySettingChange={(key, value) =>
                setSecuritySettings({ ...securitySettings, [key]: value })
              }
            />

            <PasswordCard
              securitySettings={securitySettings}
              onChangePassword={() => setShowChangePassword(true)}
            />

            <ActiveDevicesCard securitySettings={securitySettings} />

            <DangerZoneCard
              onDeleteAccount={() => setShowDeleteAccount(true)}
            />
          </View>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <View style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10 }}>
            <ActivityHeaderCard
              activityLogs={activityLogs}
              securitySettings={securitySettings}
            />

            <ActivityTimelineCard activityLogs={activityLogs} />
          </View>
        )}

        {/* Address Tab */}
        {activeTab === "address" && (
          <View style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10 }}>
            <AddressHeaderCard
              addresses={addresses}
              onAddAddress={() => setShowAddAddress(true)}
            />

            {addresses.length > 0 ? (
              addresses.map((address) => (
                <AddressCard
                  key={address._id}
                  address={address}
                  onEdit={(addr) => setEditingAddress(addr)}
                  onDelete={handleAddressDelete}
                  onSetDefault={handleAddressOperations.setDefault}
                />
              ))
            ) : (
              <EmptyAddressCard onAddAddress={() => setShowAddAddress(true)} />
            )}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        profile={profileForm}
        onProfileChange={(field, value) =>
          setProfileForm({ ...profileForm, [field]: value })
        }
        onSave={handleEditProfileSave}
        isLoading={loading}
        isUploadingImage={isUploadingImage}
        onImageUpload={handleImageUpload}
        colors={colors}
      />

      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        passwordForm={passwordForm}
        onPasswordFormChange={(field, value) =>
          setPasswordForm({ ...passwordForm, [field]: value })
        }
        onSave={handleChangePasswordSave}
        isLoading={loading}
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
        onDelete={handleDeleteAccountSave}
        isLoading={loading}
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
        onAddressChange={(field, value) => {
          if (editingAddress) {
            setEditingAddress({ ...editingAddress, [field]: value });
          } else {
            setAddressForm({ ...addressForm, [field]: value });
          }
        }}
        onSave={handleAddressSave}
        isLoading={loading}
        isEditing={!!editingAddress}
        colors={colors}
      />
    </SafeAreaView>
  );
};

export default ProfilePage;
