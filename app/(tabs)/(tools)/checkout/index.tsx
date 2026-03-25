import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { planService } from "@/lib/api/plan";
import { paymentService } from "@/lib/api/payment";
import CommonHeader from "@/components/common/CommonHeader";
import { BlurView } from "expo-blur";

interface Plan {
  _id: string;
  displayName: string;
  description: string;
  price: number;
  discountedPrice: number;
  formattedPrice: string;
  formattedDiscountedPrice: string;
  discountPercentage: number;
  duration: number;
  hasTrial: boolean;
  trialDays: number;
}

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export default function CheckoutScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const params = useLocalSearchParams();

  const planId = params.planId as string;
  const planName = params.planName as string;
  const price = params.price as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"trial" | "pay">("pay");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!planId) {
      Alert.alert("Error", "No plan selected. Please go back and try again.");
    } else {
      loadPlanDetails();
    }
  }, []);

  const loadPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await planService.getPlans();
      const selectedPlan = response.data?.find((p: Plan) => p._id === planId);

      if (!selectedPlan) {
        Alert.alert("Error", "Plan not found");
        router.back();
        return;
      }

      setPlan(selectedPlan);
      if (selectedPlan.hasTrial) {
        setSelectedOption("trial");
      }
    } catch (error) {
      console.error("Error loading plan:", error);
      Alert.alert("Error", "Failed to load plan details");
    } finally {
      setLoading(false);
    }
  };

  const handleTrialActivation = async () => {
    if (!plan || !planId) return;

    try {
      setProcessing(true);
      setShowPaymentModal(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await paymentService.activateTrial({
        planId: planId,
      });

      setShowPaymentModal(false);

      if (response.success) {
        router.replace({
          pathname: "/(tabs)/payment-success" as any,
          params: {
            planId: planId,
            planName: plan.displayName,
            isTrial: "true",
            trialDays: plan.trialDays?.toString() || "0",
          },
        });
      } else {
        Alert.alert("Error", response.message || "Failed to activate trial");
      }
    } catch (error: any) {
      setShowPaymentModal(false);
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!termsAccepted) {
      Alert.alert("Terms & Conditions", "Please accept terms to continue");
      return;
    }

    if (selectedOption === "trial" && plan?.hasTrial) {
      handleTrialActivation();
    } else {
      setProcessing(true);
      setShowPaymentModal(true);
      
      // Simulate payment processing
      setTimeout(() => {
        setShowPaymentModal(false);
        setProcessing(false);
        router.replace({
          pathname: "/(tabs)/payment-success" as any,
          params: {
            planId: planId,
            planName: plan?.displayName,
            amount: plan?.formattedDiscountedPrice || plan?.formattedPrice,
          },
        });
      }, 2500);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <View style={[styles.loadingCard, { backgroundColor: colors.card }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text, marginTop: 16 }]}>
            Preparing your checkout...
          </Text>
          <Text style={[styles.loadingSubText, { color: colors.textSecondary }]}>
            Just a moment please
          </Text>
        </View>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <View style={[styles.errorCard, { backgroundColor: colors.card }]}>
          <View style={[styles.errorIconContainer, { backgroundColor: colors.error + '15' }]}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          </View>
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Plan Not Found
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            The selected plan could not be found. Please go back and try again.
          </Text>
          <TouchableOpacity
            style={[styles.errorButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CommonHeader
        title="Checkout"
        showSafeArea={true}
        showBackButton={true}
      />

      {/* Payment Processing Modal */}
      <Modal visible={showPaymentModal} transparent={true} animationType="fade">
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Image
              source={require("@/assets/images/payment-processing.mp4")}
              style={styles.processingGif}
              resizeMode="contain"
            />
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedOption === "trial"
                ? "Activating Your Trial"
                : "Processing Payment"}
            </Text>
            <Text
              style={[styles.modalMessage, { color: colors.textSecondary }]}
            >
              {selectedOption === "trial"
                ? "Please wait while we set up your free trial..."
                : "Please wait while we securely process your payment..."}
            </Text>
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.modalLoader}
            />
          </View>
        </BlurView>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressStep, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="cart" size={14} color="#FFFFFF" />
          </View>
          <View
            style={[styles.progressLine, { backgroundColor: colors.border }]}
          />
          <View
            style={[styles.progressStep, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.progressStepText}>2</Text>
          </View>
          <View
            style={[styles.progressLine, { backgroundColor: colors.border }]}
          />
          <View
            style={[styles.progressStep, { backgroundColor: colors.border }]}
          >
            <Text
              style={[styles.progressStepText, { color: colors.textSecondary }]}
            >
              3
            </Text>
          </View>
        </View>

        {/* Plan Summary Card */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <LinearGradient
            colors={[colors.primary + "10", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryGradient}
          />

          <View style={styles.planHeader}>
            <View
              style={[
                styles.planIcon,
                { backgroundColor: colors.primary + "15" },
              ]}
            >
              <Ionicons name="rocket" size={28} color={colors.primary} />
            </View>
            <View style={styles.planTitleContainer}>
              <Text style={[styles.planName, { color: colors.text }]}>
                {plan.displayName}
              </Text>
              <Text
                style={[
                  styles.planDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {plan.description}
              </Text>
            </View>
          </View>

          <View style={styles.priceBreakdown}>
            {plan.discountPercentage > 0 ? (
              <>
                <View style={styles.priceRow}>
                  <Text
                    style={[styles.priceLabel, { color: colors.textSecondary }]}
                  >
                    Regular Price
                  </Text>
                  <Text
                    style={[
                      styles.originalPrice,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {plan.price}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text
                    style={[styles.priceLabel, { color: colors.textSecondary }]}
                  >
                    Discount
                  </Text>
                  <View
                    style={[
                      styles.discountBadge,
                      { backgroundColor: colors.success + "15" },
                    ]}
                  >
                    <Text
                      style={[styles.discountText, { color: colors.success }]}
                    >
                      -{plan.discountPercentage}%
                    </Text>
                  </View>
                </View>
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
                <View style={styles.priceRow}>
                  <Text style={[styles.finalLabel, { color: colors.text }]}>
                    Final Price
                  </Text>
                  <Text style={[styles.finalPrice, { color: colors.primary }]}>
                    {plan.formattedDiscountedPrice}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.priceRow}>
                <Text style={[styles.finalLabel, { color: colors.text }]}>
                  Price
                </Text>
                <Text style={[styles.finalPrice, { color: colors.primary }]}>
                  {plan.price}
                </Text>
              </View>
            )}
          </View>

          {plan.hasTrial && (
            <View
              style={[
                styles.trialChip,
                { backgroundColor: colors.warning + "15" },
              ]}
            >
              <Ionicons name="gift" size={14} color={colors.warning} />
              <Text style={[styles.trialChipText, { color: colors.warning }]}>
                {plan.trialDays}-day free trial available
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Payment Options */}
        {plan.hasTrial && (
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.optionsContainer}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Select Payment Method
            </Text>

            <TouchableOpacity
              style={[
                styles.optionCard,
                { backgroundColor: colors.card },
                selectedOption === "trial" && styles.optionCardSelected,
                selectedOption === "trial" && { borderColor: colors.warning },
              ]}
              onPress={() => setSelectedOption("trial")}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: colors.warning + "15" },
                  ]}
                >
                  <Ionicons name="gift" size={22} color={colors.warning} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    Start with {plan.trialDays} Days Free
                  </Text>
                  <Text
                    style={[
                      styles.optionSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    No payment required • Cancel anytime
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  { borderColor: colors.border },
                  selectedOption === "trial" && { borderColor: colors.warning },
                ]}
              >
                {selectedOption === "trial" && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: colors.warning },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                { backgroundColor: colors.card },
                selectedOption === "pay" && styles.optionCardSelected,
                selectedOption === "pay" && { borderColor: colors.primary },
              ]}
              onPress={() => setSelectedOption("pay")}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: colors.primary + "15" },
                  ]}
                >
                  <Ionicons name="card" size={22} color={colors.primary} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    Pay {plan.formattedDiscountedPrice || plan.formattedPrice}
                  </Text>
                  <Text
                    style={[
                      styles.optionSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Instant access • Secure payment
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  { borderColor: colors.border },
                  selectedOption === "pay" && { borderColor: colors.primary },
                ]}
              >
                {selectedOption === "pay" && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* What's Included */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={[styles.includedCard, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            ✨ What`&apos;s Included
          </Text>
          <View style={styles.featuresGrid}>
            {[
              {
                icon: "flash",
                label: "Full access",
                desc: "All features unlocked",
              },
              {
                icon: "headset",
                label: "Priority support",
                desc: "24/7 assistance",
              },
              {
                icon: "sync",
                label: "Regular updates",
                desc: "Always improving",
              },
              {
                icon: "shield",
                label: "Secure storage",
                desc: "Bank-level security",
              },
            ].map((feature, index) => (
              <View key={index} style={styles.featureGridItem}>
                <View
                  style={[
                    styles.featureGridIcon,
                    { backgroundColor: colors.primary + "10" },
                  ]}
                >
                  <Ionicons
                    name={feature.icon as any}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={[styles.featureGridLabel, { color: colors.text }]}>
                  {feature.label}
                </Text>
                <Text
                  style={[
                    styles.featureGridDesc,
                    { color: colors.textSecondary },
                  ]}
                >
                  {feature.desc}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Terms and Security */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.footerSection}
        >
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View
              style={[
                styles.checkbox,
                { borderColor: colors.border },
                termsAccepted && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
            >
              {termsAccepted && (
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              )}
            </View>
            <Text style={[styles.termsText, { color: colors.textSecondary }]}>
              I agree to the{" "}
              <Text style={{ color: colors.primary, fontWeight: "600" }}>
                Terms
              </Text>{" "}
              and{" "}
              <Text style={{ color: colors.primary, fontWeight: "600" }}>
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.securityBadges}>
            <View
              style={[styles.securityBadge, { backgroundColor: colors.card }]}
            >
              <Ionicons name="lock-closed" size={12} color={colors.success} />
              <Text
                style={[
                  styles.securityBadgeText,
                  { color: colors.textSecondary },
                ]}
              >
                SSL Secure
              </Text>
            </View>
            <View
              style={[styles.securityBadge, { backgroundColor: colors.card }]}
            >
              <Ionicons
                name="shield-checkmark"
                size={12}
                color={colors.success}
              />
              <Text
                style={[
                  styles.securityBadgeText,
                  { color: colors.textSecondary },
                ]}
              >
                256-bit Encryption
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <BlurView
        intensity={80}
        tint={isDark ? "dark" : "light"}
        style={[styles.bottomBar, { borderTopColor: colors.border }]}
      >
        <View style={styles.bottomContent}>
          <View style={styles.priceSummary}>
            <Text
              style={[styles.payableLabel, { color: colors.textSecondary }]}
            >
              {selectedOption === "trial" ? "Pay after trial" : "Total"}
            </Text>
            <Text
              style={[
                styles.payableAmount,
                {
                  color:
                    selectedOption === "trial"
                      ? colors.warning
                      : colors.primary,
                },
              ]}
            >
              {selectedOption === "trial"
                ? "FREE"
                : plan.formattedDiscountedPrice || plan.formattedPrice}
            </Text>
            {selectedOption === "trial" && (
              <Text style={[styles.trialNote, { color: colors.textSecondary }]}>
                then {plan.formattedDiscountedPrice || plan.formattedPrice}
                /period
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton,
              (!termsAccepted || processing) && styles.actionButtonDisabled,
              selectedOption === "trial" && { backgroundColor: colors.warning },
            ]}
            onPress={handlePayment}
            disabled={!termsAccepted || processing}
          >
            <LinearGradient
              colors={
                selectedOption === "trial"
                  ? [colors.warning, colors.warning + "dd"]
                  : [colors.primary, colors.primary + "dd"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <Text style={styles.actionButtonText}>
                {selectedOption === "trial"
                  ? `Try ${plan.trialDays} Days Free`
                  : "Complete Payment"}
              </Text>
              <Ionicons
                name={
                  selectedOption === "trial" ? "gift-outline" : "lock-closed"
                }
                size={16}
                color="#FFFFFF"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  loadingSubText: {
    fontSize: 13,
    marginTop: 4,
  },
  errorCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    maxWidth: 320,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 320,
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  processingGif: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  modalLoader: {
    marginTop: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  summaryCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  summaryGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  planIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  planTitleContainer: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  planDescription: {
    fontSize: 13,
  },
  priceBreakdown: {
    gap: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 13,
  },
  originalPrice: {
    fontSize: 13,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  finalLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  finalPrice: {
    fontSize: 22,
    fontWeight: "700",
  },
  trialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  trialChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  optionCardSelected: {
    borderWidth: 2,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 11,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  includedCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureGridItem: {
    width: '48%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  featureGridIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureGridLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureGridDesc: {
    fontSize: 11,
  },
  footerSection: {
    marginBottom: 16,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  termsText: {
    fontSize: 12,
    flex: 1,
  },
  securityBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  securityBadgeText: {
    fontSize: 11,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  bottomContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceSummary: {
    flex: 1,
  },
  payableLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  payableAmount: {
    fontSize: 20,
    fontWeight: "700",
  },
  trialNote: {
    fontSize: 10,
    marginTop: 2,
  },
  actionButton: {
    borderRadius: 30,
    overflow: 'hidden',
    minWidth: 160,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
});