// hooks/useGoogleAuth.ts
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { useState, useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import googleAuthApi, { formatGoogleUserData } from "@/lib/api/googleAuth.api";
import { normalizeUserDates } from "@/lib/utils/dateUtils";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken, setAuthenticated } = useAuthStore();

  // ✅ Sirf itna - Expo auth proxy automatically handle karega
  const redirectUri = useMemo(() => {
    return makeRedirectUri();
  }, []);

  console.log("Redirect URI:", redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      "784248295671-9kod75itnncrhklb88k3hpp4kpdbrgpd.apps.googleusercontent.com",
    androidClientId:
      "784248295671-mjvvpcajaljhoathbmpqntn0a1m91227.apps.googleusercontent.com",
    redirectUri,
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    const handleAuthResponse = async () => {
      if (response?.type === "success") {
        setIsLoading(true);
        try {
          const { access_token } = response.params;

          console.log("🔐 Getting user info from Google...");

          const userInfoResponse = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
              headers: { Authorization: `Bearer ${access_token}` },
            },
          );

          if (!userInfoResponse.ok) {
            throw new Error("Failed to fetch user info");
          }

          const userData = await userInfoResponse.json();
          console.log("✅ Google user data received:", userData.email);

          const formattedData = formatGoogleUserData(
            userData,
            access_token,
            response.params.refresh_token,
          );

          await googleAuthApi.storeGoogleUserData(formattedData);

          const result = await googleAuthApi.googleLogin(formattedData);

          if (result.success && result.token && result.user) {
            const normalizedUser = normalizeUserDates(result.user);

            setUser(normalizedUser);
            setToken(result.token);
            setAuthenticated(true);

            console.log("✅ Google login successful");
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