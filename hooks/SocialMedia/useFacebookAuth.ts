// hooks/useFacebookAuth.ts
import { useState } from "react";
import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useAuthStore } from "@/store/auth.store";

WebBrowser.maybeCompleteAuthSession();

export const useFacebookAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socialLogin } = useAuthStore(); // ✅ Use the socialLogin method

  const facebookConfig = {
    clientId: "YOUR_FACEBOOK_APP_ID",
    scopes: ["public_profile", "email"],
    redirectUri: AuthSession.makeRedirectUri({
      scheme: "yourapp",
      path: "auth/facebook",
    }),
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: facebookConfig.clientId,
      scopes: facebookConfig.scopes,
      redirectUri: facebookConfig.redirectUri,
    },
    {
      authorizationEndpoint: "https://www.facebook.com/v18.0/dialog/oauth",
      tokenEndpoint: "https://graph.facebook.com/v18.0/oauth/access_token",
    },
  );

  // Handle the OAuth response
  useState(() => {
    const handleResponse = async () => {
      if (response?.type === "success") {
        const { access_token } = response.params;
        if (access_token) {
          await getUserDataAndLogin(access_token);
        }
      }
    };
    handleResponse();
  });

  const getUserDataAndLogin = async (accessToken: string) => {
    setIsLoading(true);
    try {
      // Fetch user data from Facebook
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

      // ✅ Use the store's socialLogin method
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
        // Navigate to main app
        const { router } = require("expo-router");
        router.replace("/(tabs)");
      }

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      const errorMessage =
        err instanceof Error ? err.message : "Facebook login failed";
      setError(errorMessage);
      Alert.alert("Login Error", errorMessage);
    }
  };

  const loginWithFacebook = async () => {
    if (!request) {
      Alert.alert("Error", "Facebook login is not configured properly");
      return;
    }

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
  };

  return {
    loginWithFacebook,
    isLoading,
    error,
  };
};
