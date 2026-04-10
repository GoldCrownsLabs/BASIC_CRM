// components/common/SocialLoginButtons.tsx (Fixed Version)
import { FontAwesome } from "@expo/vector-icons";
import React, { memo } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

interface SocialLoginButtonsProps {
  onGooglePress: () => void;
  onFacebookPress: () => void;
  isGoogleLoading?: boolean;
  isFacebookLoading?: boolean;
  disabled?: boolean;
}

export const SocialLoginButtons = memo<SocialLoginButtonsProps>(
  ({
    onGooglePress,
    onFacebookPress,
    isGoogleLoading = false,
    isFacebookLoading = false,
    disabled = false,
  }) => {
    return (
      <View style={styles.container}>
        {/* Google Login */}
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={onGooglePress}
          disabled={disabled || isGoogleLoading}
          activeOpacity={0.8}
        >
          {isGoogleLoading ? (
            <ActivityIndicator color="#374151" size="small" />
          ) : (
            <>
              <View style={styles.iconContainer}>
                <FontAwesome name="google" size={20} color="#DB4437" />
              </View>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Facebook Login */}
        <TouchableOpacity
          style={[styles.button, styles.facebookButton]}
          onPress={onFacebookPress}
          disabled={disabled || isFacebookLoading}
          activeOpacity={0.8}
        >
          {isFacebookLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <View style={styles.iconContainer}>
                <FontAwesome name="facebook" size={20} color="#fff" />
              </View>
              <Text style={styles.facebookButtonText}>
                Continue with Facebook
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  },
);

// Add display name to fix ESLint error
SocialLoginButtons.displayName = "SocialLoginButtons";

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  facebookButton: {
    backgroundColor: "#1877F2",
    shadowColor: "#1877F2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  googleButtonText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "600",
  },
  facebookButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
