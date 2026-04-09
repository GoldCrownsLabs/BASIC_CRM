// app/(auth)/login.tsx
import PrivacyPolicyModal from "@/components/Terms&Conditions/PrivacyPolicyModal";
import TermsAndConditionsModal from "@/components/Terms&Conditions/TermsAndConditionsModal";
import TermsPrivacyFooter from "@/components/Terms&Conditions/TermsPrivacyFooter";
import { SocialLoginButtons } from "@/components/common/SocialLoginButtons";
import { useFacebookAuth } from "@/hooks/SocialMedia/useFacebookAuth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useAuthStore } from "@/store/auth.store";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();

  // Use both auth hooks
  const { loginWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth();
  const { loginWithFacebook, isLoading: isFacebookLoading } = useFacebookAuth();

  // Clear error on mount - only once
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert("Login Error", error);
      clearError();
    }
  }, [error, clearError]);

  // Memoized handlers
  const handleLogin = useCallback(async () => {
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError("Please fill all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("Please enter a valid email address");
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.replace("/(tabs)");
    }
  }, [email, password, login]);

  const handleGoogleLogin = useCallback(() => {
    if (!isGoogleLoading && !isLoading && !isFacebookLoading) {
      loginWithGoogle();
    }
  }, [loginWithGoogle, isGoogleLoading, isLoading, isFacebookLoading]);

  const handleFacebookLogin = useCallback(() => {
    if (!isFacebookLoading && !isLoading && !isGoogleLoading) {
      loginWithFacebook();
    }
  }, [loginWithFacebook, isFacebookLoading, isLoading, isGoogleLoading]);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const handleEmailChange = useCallback((text: string) => setEmail(text), []);
  const handlePasswordChange = useCallback(
    (text: string) => setPassword(text),
    [],
  );

  // Memoize loading state
  const isAnyLoading = useMemo(
    () => isLoading || isGoogleLoading || isFacebookLoading,
    [isLoading, isGoogleLoading, isFacebookLoading],
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 24,
                paddingTop: Platform.OS === "ios" ? 60 : 40,
                paddingBottom: Platform.OS === "ios" ? 120 : 100,
              }}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              {/* Logo/Brand Section */}
              <View style={{ alignItems: "center", marginBottom: 48 }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    backgroundColor: "#2196F3",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 24,
                    shadowColor: "#2196F3",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Text
                    style={{ fontSize: 40, color: "white", fontWeight: "bold" }}
                  >
                    ✨
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#1a1a1a",
                    marginBottom: 8,
                  }}
                >
                  Welcome Back
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  Sign in to continue your journey
                </Text>
              </View>

              {/* Error Message */}
              {localError && (
                <View
                  style={{
                    backgroundColor: "#FEE2E2",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: "#FECACA",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 16, marginRight: 8 }}>⚠️</Text>
                  <Text
                    style={{
                      color: "#DC2626",
                      fontSize: 14,
                      flex: 1,
                    }}
                  >
                    {localError}
                  </Text>
                </View>
              )}

              {/* Form */}
              <View style={{ marginBottom: 24 }}>
                {/* Email Input */}
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: 8,
                      marginLeft: 4,
                    }}
                  >
                    Email Address
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#F9FAFB",
                      borderRadius: 16,
                      borderWidth: 1.5,
                      borderColor: isFocusedEmail ? "#2196F3" : "#E5E7EB",
                      paddingHorizontal: 16,
                    }}
                  >
                    <Text style={{ fontSize: 18, marginRight: 12 }}>📧</Text>
                    <TextInput
                      style={{
                        flex: 1,
                        paddingVertical: 16,
                        fontSize: 16,
                        color: "#1F2937",
                        opacity: isAnyLoading ? 0.7 : 1,
                      }}
                      placeholder="you@example.com"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={handleEmailChange}
                      onFocus={() => setIsFocusedEmail(true)}
                      onBlur={() => setIsFocusedEmail(false)}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!isAnyLoading}
                      returnKeyType="next"
                      textContentType="username"
                      autoComplete="email"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: 8,
                      marginLeft: 4,
                    }}
                  >
                    Password
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#F9FAFB",
                      borderRadius: 16,
                      borderWidth: 1.5,
                      borderColor: isFocusedPassword ? "#2196F3" : "#E5E7EB",
                      paddingHorizontal: 16,
                    }}
                  >
                    <Text style={{ fontSize: 18, marginRight: 12 }}>🔒</Text>
                    <TextInput
                      style={{
                        flex: 1,
                        paddingVertical: 16,
                        fontSize: 16,
                        color: "#1F2937",
                        opacity: isAnyLoading ? 0.7 : 1,
                      }}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={handlePasswordChange}
                      onFocus={() => setIsFocusedPassword(true)}
                      onBlur={() => setIsFocusedPassword(false)}
                      secureTextEntry
                      editable={!isAnyLoading}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      textContentType="password"
                      autoComplete="password"
                    />
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                  style={{
                    alignSelf: "flex-end",
                    marginBottom: 28,
                    paddingVertical: 4,
                  }}
                  onPress={() => {
                    Alert.alert(
                      "Forgot Password",
                      "Password reset will be implemented soon!",
                    );
                  }}
                  disabled={isAnyLoading}
                >
                  <Text
                    style={{
                      color: "#2196F3",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleLogin}
                  disabled={isAnyLoading}
                >
                  <LinearGradient
                    colors={
                      isAnyLoading
                        ? ["#90CAF9", "#64B5F6"]
                        : ["#2196F3", "#1976D2"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: 16,
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isAnyLoading ? 0.8 : 1,
                      shadowColor: "#2196F3",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 5,
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontWeight: "700",
                        }}
                      >
                        Sign In
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 32,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: "#E5E7EB",
                    }}
                  />
                  <Text
                    style={{
                      marginHorizontal: 16,
                      color: "#9CA3AF",
                      fontSize: 13,
                      fontWeight: "500",
                    }}
                  >
                    OR CONTINUE WITH
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: "#E5E7EB",
                    }}
                  />
                </View>

                {/* Social Login Buttons */}
                <SocialLoginButtons
                  onGooglePress={handleGoogleLogin}
                  onFacebookPress={handleFacebookLogin}
                  isGoogleLoading={isGoogleLoading}
                  isFacebookLoading={isFacebookLoading}
                  disabled={isLoading}
                />

                {/* Sign Up Link */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 32,
                  }}
                >
                  <Text
                    style={{
                      color: "#6B7280",
                      fontSize: 14,
                    }}
                  >
                    Don&apos;t have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      !isAnyLoading && router.push("/(auth)/register")
                    }
                    disabled={isAnyLoading}
                  >
                    <Text
                      style={{
                        color: "#2196F3",
                        fontSize: 14,
                        fontWeight: "700",
                      }}
                    >
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <TermsPrivacyFooter
              onTermsPress={() => setShowTermsModal(true)}
              onPrivacyPress={() => setShowPrivacyModal(true)}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "#FFFFFF",
                borderTopWidth: 1,
                borderTopColor: "#F3F4F6",
                paddingVertical: 16,
              }}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {isAnyLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 28,
              borderRadius: 24,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <ActivityIndicator size="large" color="#2196F3" />
            <Text
              style={{
                marginTop: 16,
                fontSize: 15,
                color: "#4B5563",
                fontWeight: "500",
              }}
            >
              {isGoogleLoading
                ? "Signing in with Google..."
                : isFacebookLoading
                  ? "Signing in with Facebook..."
                  : "Signing in..."}
            </Text>
          </View>
        </View>
      )}

      {/* Separate Modals for Terms & Privacy */}
      <TermsAndConditionsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      <PrivacyPolicyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </View>
  );
}
