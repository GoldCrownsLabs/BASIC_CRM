import PrivacyPolicyModal from "@/components/Terms&Conditions/PrivacyPolicyModal";
import TermsAndConditionsModal from "@/components/Terms&Conditions/TermsAndConditionsModal";
import TermsPrivacyFooter from "@/components/Terms&Conditions/TermsPrivacyFooter";

import { useAuthStore } from "@/store/auth.store";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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

  useEffect(() => {
    clearError();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert("Login Error", error);
      clearError();
    }
  }, [error]);

  const handleLogin = async () => {
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
  };

  // Dummy handlers for social login
  const handleGoogleLogin = async () => {
    try {
      Alert.alert("Google Login", "Google login will be implemented soon!");
    } catch (error) {
      Alert.alert("Google Login Error", "Failed to login with Google");
    }
  };

  const handleFacebookLogin = async () => {
    try {
      Alert.alert("Facebook Login", "Facebook login will be implemented soon!");
    } catch (error) {
      Alert.alert("Facebook Login Error", "Failed to login with Facebook");
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

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
                      transitionDuration: "200ms",
                    }}
                  >
                    <Text style={{ fontSize: 18, marginRight: 12 }}>📧</Text>
                    <TextInput
                      style={{
                        flex: 1,
                        paddingVertical: 16,
                        fontSize: 16,
                        color: "#1F2937",
                        opacity: isLoading ? 0.7 : 1,
                      }}
                      placeholder="you@example.com"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setIsFocusedEmail(true)}
                      onBlur={() => setIsFocusedEmail(false)}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!isLoading}
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
                        opacity: isLoading ? 0.7 : 1,
                      }}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setIsFocusedPassword(true)}
                      onBlur={() => setIsFocusedPassword(false)}
                      secureTextEntry
                      editable={!isLoading}
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
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={
                      isLoading
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
                      opacity: isLoading ? 0.8 : 1,
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
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  {/* Google Login Button */}
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: "#FFFFFF",
                      paddingVertical: 14,
                      borderRadius: 16,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                    onPress={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <View style={{ width: 24, height: 24, marginRight: 12 }}>
                      <Text style={{ fontSize: 20 }}>G</Text>
                    </View>
                    <Text
                      style={{
                        color: "#374151",
                        fontSize: 15,
                        fontWeight: "600",
                      }}
                    >
                      Google
                    </Text>
                  </TouchableOpacity>

                  {/* Facebook Login Button */}
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: "#1877F2",
                      paddingVertical: 14,
                      borderRadius: 16,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                      shadowColor: "#1877F2",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                    onPress={handleFacebookLogin}
                    disabled={isLoading}
                  >
                    <View style={{ width: 24, height: 24, marginRight: 12 }}>
                      <Text style={{ fontSize: 20, color: "white" }}>f</Text>
                    </View>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 15,
                        fontWeight: "600",
                      }}
                    >
                      Facebook
                    </Text>
                  </TouchableOpacity>
                </View>

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
                      !isLoading && router.push("/(auth)/register")
                    }
                    disabled={isLoading}
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
      {isLoading && (
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
            backdropFilter: "blur(4px)",
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
              Signing in...
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
