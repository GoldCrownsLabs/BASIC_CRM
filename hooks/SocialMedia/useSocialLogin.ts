// hooks/SocialMedia/useSocialLogin.ts
import { Alert } from "react-native";
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useGoogleAuth } from "./useGoogleAuth";


export const useSocialLogin = () => {
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const { isLoading: authLoading } = useAuthStore();

  // ✅ Use the custom Google auth hook
  const { loginWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth();

  const handleGoogleLogin = async () => {
    if (isGoogleLoading || authLoading) return;

    try {
      console.log("Starting Google login...");
      await loginWithGoogle();
    } catch (error: any) {
      console.error("Google login error:", error);
      Alert.alert(
        "Google Login Error",
        error?.message || "Failed to login with Google",
      );
    }
  };

  const handleFacebookLogin = async () => {
    if (isFacebookLoading || authLoading) return;
    try {
      setIsFacebookLoading(true);
      Alert.alert("Facebook Login", "Coming soon!");
    } catch (error: any) {
      Alert.alert(
        "Facebook Login Error",
        error?.message || "Failed to login with Facebook",
      );
    } finally {
      setIsFacebookLoading(false);
    }
  };

  return {
    handleGoogleLogin,
    handleFacebookLogin,
    isGoogleLoading,
    isFacebookLoading,
    isAnySocialLoading: isGoogleLoading || isFacebookLoading,
  };
};
