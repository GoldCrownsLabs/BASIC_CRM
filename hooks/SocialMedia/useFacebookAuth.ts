// hooks/SocialMedia/useFacebookAuth.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { Alert, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";

// Initialize WebBrowser once
if (Platform.OS !== "web") {
  WebBrowser.maybeCompleteAuthSession();
}

// Facebook config - defined outside
const FACEBOOK_CONFIG = {
  clientId:
    process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_ID || "YOUR_FACEBOOK_APP_ID",
  scopes: ["public_profile", "email"],
  redirectUri: AuthSession.makeRedirectUri({
    scheme: "yourapp",
    path: "auth/facebook",
  }),
};

export const useFacebookAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socialLogin } = useAuthStore();
  const isProcessing = useRef(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: FACEBOOK_CONFIG.clientId,
      scopes: FACEBOOK_CONFIG.scopes,
      redirectUri: FACEBOOK_CONFIG.redirectUri,
    },
    {
      authorizationEndpoint: "https://www.facebook.com/v18.0/dialog/oauth",
      tokenEndpoint: "https://graph.facebook.com/v18.0/oauth/access_token",
    },
  );

  const getUserDataAndLogin = useCallback(
    async (accessToken: string) => {
      if (isProcessing.current) return;

      isProcessing.current = true;
      setIsLoading(true);

      try {
        const fbResponse = await fetch(
          `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`,
        );

        const userData = await fbResponse.json();

        if (userData.error) {
          throw new Error(userData.error.message);
        }

        if (!userData.email) {
          throw new Error("Email not provided by Facebook");
        }

        const success = await socialLogin(
          {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            picture: userData.picture?.data?.url,
            accessToken: accessToken,
            provider: "facebook",
          },
          "facebook",
        );

        if (success) {
          router.replace("/(tabs)");
        }

        setIsLoading(false);
        isProcessing.current = false;
      } catch (err) {
        setIsLoading(false);
        isProcessing.current = false;
        const errorMessage =
          err instanceof Error ? err.message : "Facebook login failed";
        setError(errorMessage);
        Alert.alert("Login Error", errorMessage);
      }
    },
    [socialLogin],
  );

  // Handle response with proper useEffect
  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === "success") {
        const { access_token } = response.params;
        if (access_token) {
          await getUserDataAndLogin(access_token);
        }
      } else if (response?.type === "error") {
        console.error("Facebook auth error:", response.error);
        Alert.alert("Error", "Facebook login cancelled or failed");
        setIsLoading(false);
      }
    };

    handleResponse();
  }, [response, getUserDataAndLogin]);

  const loginWithFacebook = useCallback(async () => {
    if (!request) {
      Alert.alert("Error", "Facebook login is not configured properly");
      return;
    }

    if (isLoading || isProcessing.current) return;

    setIsLoading(true);
    setError(null);

    try {
      await promptAsync();
    } catch (err) {
      setIsLoading(false);
      const errorMessage =
        err instanceof Error ? err.message : "Facebook login failed";
      setError(errorMessage);
      Alert.alert("Login Error", "Failed to initialize Facebook login");
    }
  }, [request, promptAsync, isLoading]);

  return {
    loginWithFacebook,
    isLoading,
    error,
  };
};
