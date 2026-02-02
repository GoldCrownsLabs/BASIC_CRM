// components/TermsAndConditionsModal.tsx
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

interface TermsAndConditionsModalProps {
  visible: boolean;
  onClose: () => void;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  visible,
  onClose,
}) => {
  const openTermsLink = (url: string) => {
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
              <Text style={styles.modalTitle}>Terms & Conditions</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.sectionText}>
                By accessing and using our services, you acknowledge that you
                have read, understood, and agree to be bound by these Terms and
                Conditions.
              </Text>

              <Text style={styles.sectionTitle}>2. User Responsibilities</Text>
              <Text style={styles.sectionText}>
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activities that occur under your
                account.
              </Text>

              <Text style={styles.sectionTitle}>3. Account Registration</Text>
              <Text style={styles.sectionText}>
                To access certain features, you must register for an account.
                You agree to provide accurate and complete information during
                registration.
              </Text>

              <Text style={styles.sectionTitle}>4. Service Usage</Text>
              <Text style={styles.sectionText}>
                The service is provided as is without warranties of any kind.
                We reserve the right to modify or discontinue the service at any
                time.
              </Text>

              <Text style={styles.sectionTitle}>5. Prohibited Activities</Text>
              <Text style={styles.sectionText}>
                You agree not to engage in any unlawful activities, attempt to
                gain unauthorized access, or interfere with the service&#39;s
                operation.
              </Text>

              <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
              <Text style={styles.sectionText}>
                All content, features, and functionality are owned by us and are
                protected by copyright, trademark, and other intellectual
                property laws.
              </Text>

              <Text style={styles.sectionTitle}>
                7. Limitation of Liability
              </Text>
              <Text style={styles.sectionText}>
                We shall not be liable for any indirect, incidental, special,
                consequential or punitive damages resulting from your use of or
                inability to use the service.
              </Text>

              <Text style={styles.sectionTitle}>8. Termination</Text>
              <Text style={styles.sectionText}>
                We may terminate or suspend your account immediately, without
                prior notice, for conduct that we believe violates these Terms.
              </Text>

              <Text style={styles.sectionTitle}>9. Governing Law</Text>
              <Text style={styles.sectionText}>
                These Terms shall be governed by the laws of India, without
                regard to its conflict of law provisions.
              </Text>

              <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
              <Text style={styles.sectionText}>
                We reserve the right to modify these terms at any time. We will
                notify users of any changes by updating the date at the bottom
                of these terms.
              </Text>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => openTermsLink("https://yourwebsite.com/terms")}
              >
                <Text style={styles.linkButtonText}>
                  View Full Terms & Conditions
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                <Text style={styles.footerBold}>Last Updated: </Text>
                {new Date().toLocaleDateString()}
                {"\n\n"}
                By using our services, you acknowledge that you have read and
                agree to these Terms & Conditions.
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
                  // Optionally navigate to contact page or support
                }}
              >
                <Text style={styles.primaryButtonText}>Contact Support</Text>
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
    width: "95%",
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
    backgroundColor: "#2196F3",
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

export default TermsAndConditionsModal;
