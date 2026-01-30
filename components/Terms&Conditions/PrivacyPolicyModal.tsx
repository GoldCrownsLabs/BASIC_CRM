// components/PrivacyPolicyModal.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  StyleSheet,
} from "react-native";

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  visible,
  onClose,
}) => {
  const openPrivacyLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err),
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={true}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.introText}>
                This Privacy Policy describes how we collect, use, and protect
                your personal information when you use our services.
              </Text>

              <Text style={styles.sectionTitle}>1. Information We Collect</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.bold}>Personal Information:</Text> Name,
                email address, phone number, and other contact details when you
                register or use our services.
                {"\n\n"}
                <Text style={styles.bold}>Usage Data:</Text> Information about
                how you interact with our services, including IP address, device
                information, and browsing behavior.
              </Text>

              <Text style={styles.sectionTitle}>2. How We Use Information</Text>
              <Text style={styles.sectionText}>
                • To provide, maintain, and improve our services
                {"\n"}• To communicate with you about your account
                {"\n"}• To send important updates and notifications
                {"\n"}• For security purposes and fraud prevention
                {"\n"}• To comply with legal obligations
              </Text>

              <Text style={styles.sectionTitle}>3. Data Sharing</Text>
              <Text style={styles.sectionText}>
                We do not sell your personal data. We may share information
                with:
                {"\n\n"}
                <Text style={styles.bold}>Service Providers:</Text> Trusted
                third parties who assist in operating our services (subject to
                confidentiality agreements).
                {"\n\n"}
                <Text style={styles.bold}>Legal Requirements:</Text> When
                required by law or to protect our rights and safety.
              </Text>

              <Text style={styles.sectionTitle}>4. Data Security</Text>
              <Text style={styles.sectionText}>
                We implement appropriate technical and organizational measures
                to protect your personal data against unauthorized access,
                alteration, or destruction. These include encryption, access
                controls, and regular security assessments.
              </Text>

              <Text style={styles.sectionTitle}>5. Your Rights</Text>
              <Text style={styles.sectionText}>
                You have the right to:
                {"\n"}• Access your personal data
                {"\n"}• Correct inaccurate data
                {"\n"}• Request deletion of your data
                {"\n"}• Object to data processing
                {"\n"}• Withdraw consent at any time
              </Text>

              <Text style={styles.sectionTitle}>6. Cookies & Tracking</Text>
              <Text style={styles.sectionText}>
                We use cookies and similar technologies to enhance user
                experience, analyze usage patterns, and personalize content. You
                can control cookie settings through your browser preferences.
              </Text>

              <Text style={styles.sectionTitle}>7. Data Retention</Text>
              <Text style={styles.sectionText}>
                We retain your personal data only for as long as necessary to
                fulfill the purposes outlined in this policy, unless a longer
                retention period is required by law.
              </Text>

              <Text style={styles.sectionTitle}>
                8. International Transfers
              </Text>
              <Text style={styles.sectionText}>
                Your information may be transferred to and maintained on
                computers located outside of your country, where data protection
                laws may differ.
              </Text>

              <Text style={styles.sectionTitle}>9. Children&#39;s Privacy</Text>
              <Text style={styles.sectionText}>
                Our services are not directed to individuals under 18. We do not
                knowingly collect personal information from children.
              </Text>

              <Text style={styles.sectionTitle}>10. Changes to Policy</Text>
              <Text style={styles.sectionText}>
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the Last Updated date.
              </Text>

              <TouchableOpacity
                style={[styles.linkButton, { backgroundColor: "#4CAF50" }]}
                onPress={() =>
                  openPrivacyLink("https://yourwebsite.com/privacy")
                }
              >
                <Text style={styles.linkButtonText}>
                  View Full Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                <Text style={styles.footerBold}>Last Updated: </Text>
                {new Date().toLocaleDateString()}
                {"\n\n"}
                <Text style={styles.footerBold}>Contact Us: </Text>
                privacy@yourwebsite.com
                {"\n\n"}
                If you have any questions about this Privacy Policy, please
                contact us.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onClose}
              >
                <Text style={styles.secondaryButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  onClose();
                  Linking.openURL("mailto:privacy@yourwebsite.com");
                }}
              >
                <Text style={styles.primaryButtonText}>
                  Contact Privacy Team
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2196F3",
  },
  closeButton: {
    padding: 5,
  },
  closeIcon: {
    fontSize: 24,
    color: "#666",
  },
  content: {
    marginBottom: 20,
  },
  introText: {
    color: "#666",
    lineHeight: 22,
    fontSize: 14,
    marginBottom: 20,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 15,
  },
  sectionText: {
    color: "#666",
    lineHeight: 22,
    fontSize: 14,
  },
  bold: {
    fontWeight: "600",
    color: "#333",
  },
  linkButton: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  linkButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  footer: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  footerText: {
    color: "#666",
    fontSize: 13,
    lineHeight: 20,
  },
  footerBold: {
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 25,
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#666",
    fontWeight: "600",
  },
});

export default PrivacyPolicyModal;
