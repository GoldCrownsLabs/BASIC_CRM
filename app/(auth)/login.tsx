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
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
                paddingHorizontal: 20,
                paddingVertical: 20,
              }}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View style={{ alignItems: "center", marginBottom: 40 }}>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    color: "#2196F3",
                    marginBottom: 8,
                  }}
                >
                  Welcome Back
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  Sign in to continue to your account
                </Text>
              </View>

              {/* Error Message */}
              {localError && (
                <View
                  style={{
                    backgroundColor: "#FFEBEE",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: "#EF9A9A",
                  }}
                >
                  <Text
                    style={{
                      color: "#D32F2F",
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    {localError}
                  </Text>
                </View>
              )}

              {/* Form */}
              <View style={{ marginBottom: 20 }}>
                <TextInput
                  style={{
                    backgroundColor: "white",
                    padding: 15,
                    borderRadius: 10,
                    marginBottom: 15,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    fontSize: 16,
                    opacity: isLoading ? 0.7 : 1,
                  }}
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#999"
                  editable={!isLoading}
                  returnKeyType="next"
                  // ✅ Password suggestion remove
                  textContentType="username"
                  autoComplete="email"
                />

                <TextInput
                  style={{
                    backgroundColor: "white",
                    padding: 15,
                    borderRadius: 10,
                    marginBottom: 25,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    fontSize: 16,
                    opacity: isLoading ? 0.7 : 1,
                  }}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#999"
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  // ✅ Password suggestion remove
                  textContentType="password"
                  autoComplete="password"
                />

                <TouchableOpacity
                  style={{
                    backgroundColor: "#2196F3",
                    padding: 16,
                    borderRadius: 10,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    opacity: isLoading ? 0.7 : 1,
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                  }}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text
                      style={{
                        color: "white",
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      Sign In
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    padding: 16,
                    alignItems: "center",
                    marginTop: 12,
                    opacity: isLoading ? 0.5 : 1,
                  }}
                  onPress={() => !isLoading && router.push("/(auth)/register")}
                  disabled={isLoading}
                >
                  <Text
                    style={{
                      color: "#2196F3",
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                  >
                    Don&lsquo;t have an account?{" "}
                    <Text
                      style={{
                        color: "#2196F3",
                        fontSize: 22,
                        fontWeight: "600",
                        textDecorationLine: "underline",
                      }}
                    >
                      {" "}
                      Sign Up
                    </Text>
                  </Text>
                </TouchableOpacity>
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
                backgroundColor: "#f5f5f5",
                borderTopWidth: 1,
                borderTopColor: "#ddd",
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
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 25,
              borderRadius: 15,
              alignItems: "center",
              justifyContent: "center",
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
          >
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={{ marginTop: 15, fontSize: 16, color: "#333" }}>
              Signing in...
            </Text>
          </View>
        </View>
      )}

      {/* ✅ Separate Modals for Terms & Privacy */}
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
