// hooks/useGoogleAuth.ts
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { useState, useEffect, useCallback, useRef } from "react";
import { Alert, Platform } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";

// Initialize WebBrowser once outside component
if (Platform.OS !== "web") {
  WebBrowser.maybeCompleteAuthSession();
}

// Cache redirect URI - calculated once
const REDIRECT_URI = makeRedirectUri();

// Google client config - defined outside to prevent recreation
const GOOGLE_CONFIG = {
  webClientId:
    "784248295671-9kod75itnncrhklb88k3hpp4kpdbrgpd.apps.googleusercontent.com",
  androidClientId:
    "784248295671-mjvvpcajaljhoathbmpqntn0a1m91227.apps.googleusercontent.com",
  iosClientId:
    "784248295671-ac5vg31nphrbvg806l36vrf9i71gj3mh.apps.googleusercontent.com",
  redirectUri: REDIRECT_URI,
  scopes: ["profile", "email"],
};

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { socialLogin } = useAuthStore();
  const isProcessing = useRef(false);

  // Remove console.log that was spamming
  // console.log("Redirect URI:", REDIRECT_URI); // ✅ REMOVED

  const [request, response, promptAsync] = Google.useAuthRequest(GOOGLE_CONFIG);

  // Handle auth response with useCallback to prevent recreation
  const handleAuthResponse = useCallback(async () => {
    if (!response || isProcessing.current) return;

    if (response?.type === "success") {
      isProcessing.current = true;
      setIsLoading(true);

      try {
        const { access_token } = response.params;

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

        // Prepare data for social login
        const socialLoginData = {
          id: userData.sub,
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
          accessToken: access_token,
          provider: "google" as const,
        };

        const success = await socialLogin(socialLoginData, "google");

        if (success) {
          router.replace("/(tabs)");
        } else {
          Alert.alert("Login Failed", "Could not authenticate with Google");
        }
      } catch (error: any) {
        console.error("Google auth error:", error);
        Alert.alert("Error", error.message || "Failed to login with Google");
      } finally {
        setIsLoading(false);
        isProcessing.current = false;
      }
    } else if (response?.type === "error") {
      console.error("Google auth error:", response.error);
      Alert.alert("Error", "Google login cancelled or failed");
      setIsLoading(false);
      isProcessing.current = false;
    }
  }, [response, socialLogin]);

  useEffect(() => {
    handleAuthResponse();
  }, [handleAuthResponse]);

  const loginWithGoogle = useCallback(async () => {
    if (!request) {
      Alert.alert("Error", "Google login is not initialized");
      return;
    }

    if (isLoading || isProcessing.current) return;

    try {
      await promptAsync();
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Failed to start Google login");
    }
  }, [request, promptAsync, isLoading]);

  return { loginWithGoogle, isLoading };
};
