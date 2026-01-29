import { useState } from "react";
import { Alert } from "react-native";
import { apiService } from "@/lib/api";

export const useProfileActions = (
  profile: any,
  setProfile: (profile: any) => void,
  addresses: any[],
  setAddresses: (addresses: any[]) => void,
  securitySettings: any,
  setSecuritySettings: (settings: any) => void,
  fetchProfile: () => Promise<void>,
  fetchAddresses: () => Promise<void>,
) => {
  const [loading, setLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleProfileUpdate = async (updateData: any) => {
    try {
      setLoading(true);
      const response = await apiService.put("/auth/profile", updateData);

      if (response.success) {
        Alert.alert(
          "Success",
          response.message || "Profile updated successfully!",
        );
        fetchProfile();
        return true;
      } else {
        Alert.alert("Error", response.message || "Failed to update profile");
        return false;
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    try {
      setLoading(true);
      const response = await apiService.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.success) {
        Alert.alert(
          "Success",
          response.message || "Password changed successfully!",
        );
        setSecuritySettings((prev: any) => ({
          ...prev,
          lastPasswordChange: "Just now",
        }));
        return true;
      } else {
        Alert.alert("Error", response.message || "Failed to change password");
        return false;
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      Alert.alert("Error", error.message || "Failed to change password");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (confirmationText: string) => {
    if (confirmationText !== "DELETE") {
      Alert.alert("Error", "Please type DELETE to confirm account deletion");
      return false;
    }

    try {
      setLoading(true);
      const response = await apiService.delete("/auth/delete-profile");

      if (response.success) {
        Alert.alert(
          "Success",
          response.message || "Account deleted successfully!",
        );
        return true;
      } else {
        Alert.alert("Error", response.message || "Failed to delete account");
        return false;
      }
    } catch (error: any) {
      console.error("Error deleting account:", error);
      Alert.alert("Error", error.message || "Failed to delete account");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAddressOperations = {
    add: async (addressData: any) => {
      try {
        setLoading(true);
        const response = await apiService.post("/auth/addresses", addressData);

        if (response.success) {
          Alert.alert(
            "Success",
            response.message || "Address added successfully!",
          );
          fetchAddresses();
          return true;
        } else {
          Alert.alert("Error", response.message || "Failed to add address");
          return false;
        }
      } catch (error: any) {
        console.error("Error adding address:", error);
        Alert.alert("Error", error.message || "Failed to add address");
        return false;
      } finally {
        setLoading(false);
      }
    },

    update: async (addressId: string, addressData: any) => {
      try {
        setLoading(true);
        const response = await apiService.put(
          `/auth/addresses/${addressId}`,
          addressData,
        );

        if (response.success) {
          Alert.alert(
            "Success",
            response.message || "Address updated successfully!",
          );
          fetchAddresses();
          return true;
        } else {
          Alert.alert("Error", response.message || "Failed to update address");
          return false;
        }
      } catch (error: any) {
        console.error("Error updating address:", error);
        Alert.alert("Error", error.message || "Failed to update address");
        return false;
      } finally {
        setLoading(false);
      }
    },

    delete: async (addressId: string) => {
      try {
        setLoading(true);
        const response = await apiService.delete(
          `/auth/addresses/${addressId}`,
        );

        if (response.success) {
          Alert.alert(
            "Success",
            response.message || "Address deleted successfully!",
          );
          fetchAddresses();
          return true;
        } else {
          Alert.alert("Error", response.message || "Failed to delete address");
          return false;
        }
      } catch (error: any) {
        console.error("Error deleting address:", error);
        Alert.alert("Error", error.message || "Failed to delete address");
        return false;
      } finally {
        setLoading(false);
      }
    },

    setDefault: async (addressId: string) => {
      try {
        setLoading(true);
        const response = await apiService.put(
          `/auth/addresses/${addressId}/set-default`,
        );

        if (response.success) {
          Alert.alert(
            "Success",
            response.message || "Default address updated!",
          );
          fetchAddresses();
          return true;
        } else {
          Alert.alert(
            "Error",
            response.message || "Failed to set default address",
          );
          return false;
        }
      } catch (error: any) {
        console.error("Error setting default address:", error);
        Alert.alert("Error", error.message || "Failed to set default address");
        return false;
      } finally {
        setLoading(false);
      }
    },
  };

  const handleImageUpload = () => {
    setIsUploadingImage(true);
    // Mock image upload
    setTimeout(() => {
      setIsUploadingImage(false);
      Alert.alert("Success", "Profile picture updated!");
    }, 1500);
  };

  return {
    loading,
    isUploadingImage,
    handleProfileUpdate,
    handlePasswordChange,
    handleDeleteAccount,
    handleAddressOperations,
    handleImageUpload,
  };
};
