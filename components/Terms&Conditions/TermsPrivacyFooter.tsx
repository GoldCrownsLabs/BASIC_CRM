// components/TermsPrivacyFooter.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface TermsPrivacyFooterProps {
  onTermsPress: () => void;
  onPrivacyPress: () => void;
  style?: any;
}

const TermsPrivacyFooter: React.FC<TermsPrivacyFooterProps> = ({
  onTermsPress,
  onPrivacyPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>
        By continuing, you agree to our{" "}
        <Text style={styles.link} onPress={onTermsPress}>
          Terms & Conditions
        </Text>{" "}
        and{" "}
        <Text style={styles.link} onPress={onPrivacyPress}>
          Privacy Policy
        </Text>
      </Text>

      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={onTermsPress}>
          <Text style={styles.linkText}>View Terms</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPrivacyPress}>
          <Text style={styles.linkText}>View Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  text: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  link: {
    color: "#2196F3",
    fontWeight: "500",
  },
  linksContainer: {
    flexDirection: "row",
    marginTop: 8,
    gap: 15,
  },
  linkText: {
    color: "#666",
    fontSize: 11,
    textDecorationLine: "underline",
  },
});

export default TermsPrivacyFooter;
