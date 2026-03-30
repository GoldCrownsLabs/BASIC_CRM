// app/auth-callback.tsx
import { useEffect } from "react";
import { router, useGlobalSearchParams } from "expo-router";
import { View, ActivityIndicator, Text, Alert } from "react-native";
import { useAuthStore } from "@/store/auth.store";
import googleAuthApi from "@/lib/api/googleAuth.api";

export default function AuthCallback() {
  const params = useGlobalSearchParams();
  const { setUser, setToken, setAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("📱 Auth callback received:", params);

        const { access_token, error } = params;

        if (error) {
          console.error("❌ Auth error:", error);
          Alert.alert("Login Failed", "Google login failed");
          router.replace("/(auth)/login");
          return;
        }

        if (access_token) {
          // Get user info from Google
          const userInfoResponse = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
              headers: { Authorization: `Bearer ${access_token}` },
            },
          );

          const userData = await userInfoResponse.json();

          // Send to backend
          const result = await googleAuthApi.googleLogin({
            email: userData.email,
            name: userData.name,
            googleId: userData.sub,
            avatar: userData.picture,
            accessToken: access_token as string,
          });

          if (result.success && result.token && result.user) {
            setUser(result.user);
            setToken(result.token);
            setAuthenticated(true);
            router.replace("/(tabs)");
          } else {
            Alert.alert("Error", result.error || "Login failed");
            router.replace("/(auth)/login");
          }
        } else {
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.error("Callback error:", error);
        Alert.alert("Error", "Failed to complete login");
        router.replace("/(auth)/login");
      }
    };

    handleCallback();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={{ marginTop: 20, color: "#666" }}>Completing login...</Text>
    </View>
  );
}
