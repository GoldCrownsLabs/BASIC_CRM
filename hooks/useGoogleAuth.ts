// hooks/useGoogleAuth.ts
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import googleAuthApi, { formatGoogleUserData } from "@/lib/api/googleAuth.api";
import { normalizeUserDates } from "@/lib/utils/dateUtils"; // ✅ Import date utils

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken, setAuthenticated } = useAuthStore();

 const [request, response, promptAsync] = Google.useAuthRequest({
   androidClientId:
     "784248295671-mjvvpcajaljhoathbmpqntn0a1m91227.apps.googleusercontent.com",
   redirectUri: makeRedirectUri({
     scheme: "basiccrm",
   }),
 });

  useEffect(() => {
    const handleAuthResponse = async () => {
      if (response?.type === "success") {
        setIsLoading(true);
        try {
          const { access_token, refresh_token } = response.params;

          console.log("🔐 Getting user info from Google...");

          // Get user info from Google
          const userInfoResponse = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
              headers: { Authorization: `Bearer ${access_token}` },
            },
          );

          const userData = await userInfoResponse.json();
          console.log("✅ Google user data received:", userData.email);

          // Format data for API
          const formattedData = formatGoogleUserData(
            userData,
            access_token,
            refresh_token,
          );

          // Store locally for offline use
          await googleAuthApi.storeGoogleUserData(formattedData);

          // Send to backend
          const result = await googleAuthApi.googleLogin(formattedData);

          if (result.success && result.token && result.user) {
            // ✅ Normalize dates before saving to store
            const normalizedUser = normalizeUserDates(result.user);

            // Save to auth store
            setUser(normalizedUser);
            setToken(result.token);
            setAuthenticated(true);

            console.log("✅ Google login successful");

            // Navigate to main app
            router.replace("/(tabs)");
          } else {
            Alert.alert("Login Failed", result.error || "Google login failed");
          }
        } catch (error: any) {
          console.error("❌ Google auth error:", error);
          Alert.alert("Error", error.message || "Failed to login with Google");
        } finally {
          setIsLoading(false);
        }
      } else if (response?.type === "error") {
        console.error("❌ Google auth error:", response.error);
        Alert.alert("Error", "Google login cancelled or failed");
        setIsLoading(false);
      }
    };

    handleAuthResponse();
  }, [response]);

  const loginWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error("❌ Login error:", error);
      Alert.alert("Error", "Failed to start Google login");
    }
  };

  return { loginWithGoogle, isLoading };
};

// ✅ Optional: Hook for managing Google account
export const useGoogleAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleInfo, setGoogleInfo] = useState<any>(null);

  const fetchGoogleInfo = async () => {
    setIsLoading(true);
    try {
      const result = await googleAuthApi.getGoogleAuthInfo();
      if (result.success) {
        setGoogleInfo(result.data);
      }
    } catch (error) {
      console.error("Error fetching Google info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const unlinkGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await googleAuthApi.unlinkGoogleAccount();
      if (result.success) {
        await googleAuthApi.clearStoredGoogleUserData();
        setGoogleInfo(null);
        Alert.alert("Success", result.message || "Google account unlinked");
      } else {
        Alert.alert("Error", result.error || "Failed to unlink Google account");
      }
      return result;
    } catch (error) {
      console.error("Error unlinking Google:", error);
      Alert.alert("Error", "Failed to unlink Google account");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    setIsLoading(true);
    try {
      const result = await googleAuthApi.refreshGoogleToken();
      if (result.success) {
        console.log("✅ Google token refreshed");
      }
      return result;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    googleInfo,
    isLoading,
    fetchGoogleInfo,
    unlinkGoogle,
    refreshToken,
    hasGoogleLinked: !!googleInfo,
  };
};
