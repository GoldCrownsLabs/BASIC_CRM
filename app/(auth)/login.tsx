// app/(auth)/login.tsx - With Scroll Animations
import PrivacyPolicyModal from "@/components/Terms&Conditions/PrivacyPolicyModal";
import TermsAndConditionsModal from "@/components/Terms&Conditions/TermsAndConditionsModal";
import TermsPrivacyFooter from "@/components/Terms&Conditions/TermsPrivacyFooter";
import { SocialLoginButtons } from "@/components/common/SocialLoginButtons";
import { useFacebookAuth } from "@/hooks/SocialMedia/useFacebookAuth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useAuthStore } from "@/store/auth.store";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
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
  StyleSheet,
  Animated,
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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const { login, isLoading, error, clearError } = useAuthStore();
  const { loginWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth();
  const { loginWithFacebook, isLoading: isFacebookLoading } = useFacebookAuth();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (error) {
      Alert.alert("Login Error", error);
      clearError();
    }
  }, [error, clearError]);

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

  const isAnyLoading = useMemo(
    () => isLoading || isGoogleLoading || isFacebookLoading,
    [isLoading, isGoogleLoading, isFacebookLoading],
  );

  // Header animation based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const logoScale = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.8],
    extrapolate: "clamp",
  });

  const logoTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.flex}>
          {/* Animated Header that appears on scroll */}
          <Animated.View
            style={[styles.animatedHeader, { opacity: headerOpacity }]}
          >
            <LinearGradient
              colors={["#2196F3", "#1976D2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerGradient}
            >
              <Text style={styles.headerTitle}>Welcome CRM </Text>
            </LinearGradient>
          </Animated.View>

          <Animated.ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            bounces={true}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={Platform.OS === "android"}
            scrollEventThrottle={16}
            decelerationRate="fast"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
          >
            {/* Animated Logo Section */}
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim },
                    { translateY: logoTranslateY },
                    { scale: logoScale },
                  ],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.logoWrapper,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <Text style={styles.logoText}>✨</Text>
              </Animated.View>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitleText}>
                Sign in to continue your journey
              </Text>
            </Animated.View>

            {/* Animated Error Message */}
            {localError && (
              <Animated.View
                style={[
                  styles.errorContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }],
                  },
                ]}
              >
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{localError}</Text>
              </Animated.View>
            )}

            {/* Form with Staggered Animation */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <View style={styles.formContainer}>
                {/* Email Input */}
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    { transform: [{ translateX: 0 }] },
                  ]}
                >
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View
                    style={[
                      styles.inputField,
                      isFocusedEmail && styles.inputFieldFocused,
                    ]}
                  >
                    <Text style={styles.inputIcon}>📧</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="you@example.com"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
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
                </Animated.View>

                {/* Password Input */}
                <Animated.View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View
                    style={[
                      styles.inputField,
                      isFocusedPassword && styles.inputFieldFocused,
                    ]}
                  >
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
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
                </Animated.View>

                {/* Forgot Password */}
                <TouchableOpacity
                  style={styles.forgotPasswordButton}
                  onPress={() => {
                    Alert.alert(
                      "Forgot Password",
                      "Password reset will be implemented soon!",
                    );
                  }}
                  disabled={isAnyLoading}
                >
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                {/* Sign In Button with Hover/Scale Animation */}
                <Animated.View>
                  <TouchableOpacity
                    activeOpacity={0.8}
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
                      style={styles.loginButton}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text style={styles.loginButtonText}>Sign In</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                  <View style={styles.dividerLine} />
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
                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>
                    Don&apos;t have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      !isAnyLoading && router.push("/(auth)/register")
                    }
                    disabled={isAnyLoading}
                  >
                    <Text style={styles.signupLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </Animated.ScrollView>

          <TermsPrivacyFooter
            onTermsPress={() => setShowTermsModal(true)}
            onPrivacyPress={() => setShowPrivacyModal(true)}
            style={styles.footer}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Loading Overlay with Animation */}
      {isAnyLoading && (
        <Animated.View
          style={[
            styles.loadingOverlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.loadingCard,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>
              {isGoogleLoading
                ? "Signing in with Google..."
                : isFacebookLoading
                  ? "Signing in with Facebook..."
                  : "Signing in..."}
            </Text>
          </Animated.View>
        </Animated.View>
      )}

      {/* Modals */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: Platform.OS === "ios" ? 120 : 100,
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 100,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  headerGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoWrapper: {
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
  },
  logoText: {
    fontSize: 40,
    color: "white",
    fontWeight: "bold",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    flex: 1,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
  },
  inputFieldFocused: {
    borderColor: "#2196F3",
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 28,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "500",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  signupText: {
    color: "#6B7280",
    fontSize: 14,
  },
  signupLink: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "700",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  loadingCard: {
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#4B5563",
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingVertical: 16,
  },
});
