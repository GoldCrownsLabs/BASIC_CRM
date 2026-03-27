// hooks/useGoogleAuth.ts
import { apiService } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken, setAuthenticated } = useAuthStore();

  // ✅ Get Google Client ID - Now it will work
  const androidClientId = Constants.expoConfig?.extra?.GOOGLE_ANDROID_CLIENT_ID;

  // Debug to verify
  console.log("=== Google Auth Debug ===");
  console.log("Platform:", Platform.OS);
  console.log("Android Client ID:", androidClientId);
  console.log("Full extra:", Constants.expoConfig?.extra);
  console.log("=========================");

  // Call hook unconditionally before any conditional logic
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: androidClientId || "",
    scopes: ["profile", "email"],
    redirectUri: makeRedirectUri({
      scheme: "basiccrm",
    }),
  });

  // ✅ If still undefined, return early with disabled login
  if (!androidClientId) {
    console.error("❌ GOOGLE_ANDROID_CLIENT_ID is undefined! Check app.json");
    return {
      loginWithGoogle: async () => {
        console.error("Google login not configured");
      },
      isLoading: false,
    };
  }

  // Handle Google Response
  useEffect(() => {
    const handleResponse = async () => {
      if (!response) return;

      console.log("📱 Google Response Type:", response.type);

      if (response.type === "success") {
        try {
          setIsLoading(true);
          const { authentication } = response;

          if (!authentication?.accessToken) {
            throw new Error("No access token received");
          }

          console.log("✅ Got Google access token");

          const userInfoResponse = await fetch(
            "https://www.googleapis.com/userinfo/v2/me",
            {
              headers: {
                Authorization: `Bearer ${authentication.accessToken}`,
              },
            },
          );

          const googleUser = await userInfoResponse.json();
          console.log("👤 Google User:", googleUser.email);

          const appUser = {
            id: googleUser.id,
            email: googleUser.email,
            name: googleUser.name || googleUser.email?.split("@")[0],
            avatar: googleUser.picture,
            emailVerified: googleUser.verified_email,
          };

          const token = googleUser.id;

          try {
            await apiService.post(
              "/auth/google",
              {
                user: appUser,
                token: token,
                accessToken: authentication.accessToken,
              },
              { _skipAuth: true },
            );
          } catch (backendError) {
            console.log("Backend save failed, using local auth only");
          }

          setUser(appUser);
          setToken(token);
          setAuthenticated(true);
          await apiService.setAuthToken(token);

          console.log("✅ Google login completed successfully");
          router.replace("/(tabs)");
        } catch (error: any) {
          console.error("❌ Error processing Google response:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (response.type === "error") {
        console.error("❌ Google auth error:", response.error);
        setIsLoading(false);
      } else if (response.type === "cancel") {
        console.log("Google login cancelled");
        setIsLoading(false);
      }
    };

    handleResponse();
  }, [response]);

  const loginWithGoogle = async () => {
    if (isLoading || !request) {
      console.log("Google login already in progress or not ready");
      return;
    }

    try {
      console.log("🚀 Starting Google login...");
      await promptAsync();
    } catch (error: any) {
      console.error("❌ Google login error:", error);
      setIsLoading(false);
    }
  };

  return {
    loginWithGoogle,
    isLoading,
  };
};
