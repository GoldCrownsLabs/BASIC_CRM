// app/auth-callback.tsx
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator, Text } from "react-native";
import { useAuthStore } from "@/store/auth.store";

export default function AuthCallback() {
  const { completeGoogleLogin, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completeLogin = async () => {
      try {
        console.log("Completing Google login...");

        // Google login complete karo
        const success = await completeGoogleLogin({});

        if (success) {
          console.log("Login successful, redirecting to dashboard...");
          // ✅ Seedha dashboard pe le jao
          router.replace("/(tabs)");
        } else {
          setError("Login failed. Please try again.");
          setTimeout(() => {
            router.replace("/(auth)/login");
          }, 2000);
        }
      } catch (err: any) {
        console.error("Callback error:", err);
        setError(err.message || "Authentication failed");
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 2000);
      }
    };

    completeLogin();
  }, []);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ color: "#DC2626", fontSize: 16, marginBottom: 10 }}>
          ❌ {error}
        </Text>
        <Text style={{ color: "#666" }}>Redirecting to login...</Text>
      </View>
    );
  }

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
      <Text style={{ marginTop: 20, color: "#666", fontSize: 16 }}>
        {isLoading ? "Signing you in..." : "Processing..."}
      </Text>
    </View>
  );
}
