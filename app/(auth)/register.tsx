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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const { register, isLoading, error, clearError } = useAuthStore();
  const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, []);


  
  // Handle store errors
  useEffect(() => {
    if (error) {
      Alert.alert("Registration Error", error);
      clearError();
    }
  }, [error]);

  const validateForm = () => {
    setLocalError(null);

    // Required fields
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setLocalError("Please fill all fields");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    const success = await register(name, email, password);
    if (success) {
      // Navigate directly to tabs on success
      router.replace("/(tabs)");
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleBack = () => {
    if (isLoading) return;
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
            <View style={{ alignItems: "center", marginBottom: 30 }}>
              <TouchableOpacity
                onPress={handleBack}
                style={{
                  alignSelf: "flex-start",
                  marginBottom: 20,
                  padding: 8,
                  opacity: isLoading ? 0.5 : 1,
                }}
                disabled={isLoading}
              >
                <Text
                  style={{ fontSize: 18, color: "#2196F3", fontWeight: "500" }}
                >
                  ← Back
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: "#2196F3",
                  marginBottom: 8,
                }}
              >
                Create Account
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#666",
                  textAlign: "center",
                  paddingHorizontal: 20,
                }}
              >
                Join our CRM platform to manage your business efficiently
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

            {/* Form Section */}
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
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholderTextColor="#999"
                editable={!isLoading}
                returnKeyType="next"
              />

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
              />

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
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#999"
                editable={!isLoading}
                returnKeyType="next"
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
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholderTextColor="#999"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                editable={!isLoading}
              />

              <TouchableOpacity
                style={{
                  backgroundColor: "#4CAF50",
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
                  shadowRadius: 4,
                }}
                onPress={handleRegister}
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
                    Create Account
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
                onPress={() => !isLoading && router.push("/(auth)/login")}
                disabled={isLoading}
              >
                <Text
                  style={{
                    color: "#2196F3",
                    fontSize: 18,
                    fontWeight: "500",
                  }}
                >
                  Already have an account?{" "}
                  <Text
                    style={{
                      color: "#2196F3",
                      fontSize: 22,
                      fontWeight: "600",
                      textDecorationLine: "underline",
                    }}
                  >
                    {" "}
                    Sign In
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Info Box */}
            {/* <View
              style={{
                padding: 15,
                backgroundColor: "#E8F5E9",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#C8E6C9",
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  color: "#2E7D32",
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Password Requirements:
              </Text>
              <Text
                style={{
                  color: "#2E7D32",
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                • Minimum 6 characters
              </Text>
              <Text
                style={{
                  color: "#2E7D32",
                  fontSize: 13,
                }}
              >
                • Use a combination of letters and numbers for better security
              </Text>
            </View> */}

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
          </ScrollView>
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
              minWidth: 150,
              minHeight: 150,
            }}
          >
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text
              style={{
                marginTop: 15,
                fontSize: 16,
                color: "#333",
                fontWeight: "500",
              }}
            >
              Creating account...
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
