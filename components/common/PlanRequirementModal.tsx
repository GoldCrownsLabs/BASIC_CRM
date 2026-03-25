// components/common/PlanRequirementModal.tsx - Updated with navigation

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/context/ThemeContext";
import { useAuthStore } from "@/store/auth.store";
import { planService, Plan, Subscription } from "@/lib/api/plan";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface PlanRequirementModalProps {
  visible: boolean;
  onClose: () => void;
  onPlanSelect?: (planId: string) => void;
  requiredPlanLevel?: "basic" | "premium" | "pro" | "enterprise";
}

const PlanRequirementModal: React.FC<PlanRequirementModalProps> = ({
  visible,
  onClose,
  onPlanSelect,
  requiredPlanLevel = "basic",
}) => {
  const { colors, isDark } = useAppTheme();
  const { user } = useAuthStore();
  const router = useRouter(); // ✅ Add router for navigation
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(
    null,
  );

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch plans and user subscription in parallel
      const [plansResponse, subscriptionResponse] = await Promise.all([
        planService.getPlans(),
        planService.getCurrentSubscription(),
      ]);

      // Handle plans
      if (plansResponse && plansResponse.data) {
        const plansData = Array.isArray(plansResponse.data)
          ? plansResponse.data
          : [];
        setPlans(plansData);
      }

      // Handle subscription
      setUserSubscription(subscriptionResponse);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    if (onPlanSelect) {
      onPlanSelect(planId);
    }
    onClose();
  };

  // ✅ Handle View All Plans button click
  const handleViewAllPlans = () => {
    onClose(); // Close the modal first
    // Navigate to plans page
    router.push("/(tabs)/(tools)/plans");
  };

  const formatPrice = (plan: Plan) => {
    if (plan.formattedDiscountedPrice) {
      return plan.formattedDiscountedPrice;
    }
    return plan.formattedPrice || `₹${plan.price}`;
  };

  const getRequiredPlanMessage = () => {
    const messages = {
      basic: "This feature requires a Basic plan",
      premium: "This feature requires a Premium plan",
      pro: "This feature requires a Pro plan",
      enterprise: "This feature requires an Enterprise plan",
    };
    return (
      messages[requiredPlanLevel] || "This feature requires a subscription plan"
    );
  };

  const getPlanLevelBadge = (planName: string) => {
    const lowerName = planName.toLowerCase();
    if (lowerName.includes("monthly") || lowerName.includes("basic")) {
      return { text: "Basic", color: "#3B82F6" };
    }
    if (lowerName.includes("quarterly") || lowerName.includes("premium")) {
      return { text: "Premium", color: "#8B5CF6" };
    }
    if (lowerName.includes("half") || lowerName.includes("pro")) {
      return { text: "Pro", color: "#EC4899" };
    }
    if (lowerName.includes("yearly") || lowerName.includes("enterprise")) {
      return { text: "Enterprise", color: "#F59E0B" };
    }
    return { text: "Plan", color: colors.secondary };
  };

  // Check if user already has subscription
  const hasActiveSubscription =
    userSubscription &&
    (userSubscription.status === "active" ||
      userSubscription.status === "trial");

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: colors.primary + "15" },
                ]}
              >
                <Ionicons name="star" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {hasActiveSubscription ? "Upgrade Required" : "Plan Required"}
              </Text>
              <Text style={[styles.subtitle, { color: colors.secondary }]}>
                {hasActiveSubscription
                  ? `Your current plan doesn't include this feature. ${getRequiredPlanMessage()}`
                  : getRequiredPlanMessage()}
              </Text>
            </View>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.secondary }]}>
                  Loading plans...
                </Text>
              </View>
            ) : plans.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color={colors.secondary}
                />
                <Text style={[styles.emptyText, { color: colors.secondary }]}>
                  No plans available at the moment
                </Text>
                <TouchableOpacity
                  style={[
                    styles.retryButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={fetchData}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {hasActiveSubscription && userSubscription?.planId && (
                  <View
                    style={[
                      styles.currentPlanCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.currentPlanHeader}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.success}
                      />
                      <Text
                        style={[
                          styles.currentPlanTitle,
                          { color: colors.text },
                        ]}
                      >
                        Current Plan
                      </Text>
                    </View>
                    <Text
                      style={[styles.currentPlanName, { color: colors.text }]}
                    >
                      {typeof userSubscription.planId === "object"
                        ? userSubscription.planId.displayName
                        : "Active Plan"}
                    </Text>
                    <Text
                      style={[
                        styles.currentPlanStatus,
                        { color: colors.secondary },
                      ]}
                    >
                      Status:{" "}
                      {userSubscription.status === "trial" ? "Trial" : "Active"}
                    </Text>
                    {userSubscription.endDate && (
                      <Text
                        style={[
                          styles.currentPlanExpiry,
                          { color: colors.secondary },
                        ]}
                      >
                        Valid until:{" "}
                        {new Date(
                          userSubscription.endDate,
                        ).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                )}

                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {hasActiveSubscription
                    ? "Recommended Upgrades"
                    : "Choose a Plan"}
                </Text>

                {plans.map((plan) => {
                  const planLevel = getPlanLevelBadge(
                    plan.displayName || plan.name,
                  );
                  const isCurrentPlan =
                    userSubscription?.planId &&
                    typeof userSubscription.planId === "object" &&
                    userSubscription.planId._id === plan._id;

                  return (
                    <TouchableOpacity
                      key={plan._id}
                      style={[
                        styles.planCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: isCurrentPlan
                            ? colors.primary
                            : colors.border,
                          borderWidth: isCurrentPlan ? 2 : 1,
                        },
                      ]}
                      onPress={() =>
                        !isCurrentPlan && handleSelectPlan(plan._id)
                      }
                      disabled={isCurrentPlan}
                    >
                      <View style={styles.planHeader}>
                        <View style={styles.planNameContainer}>
                          <View
                            style={[
                              styles.planBadge,
                              { backgroundColor: planLevel.color + "20" },
                            ]}
                          >
                            <Text
                              style={[
                                styles.planBadgeText,
                                { color: planLevel.color },
                              ]}
                            >
                              {planLevel.text}
                            </Text>
                          </View>
                          <Text
                            style={[styles.planName, { color: colors.text }]}
                          >
                            {plan.displayName || plan.name}
                          </Text>
                          {plan.popular && (
                            <View
                              style={[
                                styles.popularBadge,
                                { backgroundColor: colors.success },
                              ]}
                            >
                              <Text style={styles.popularText}>Popular</Text>
                            </View>
                          )}
                          {isCurrentPlan && (
                            <View
                              style={[
                                styles.currentBadge,
                                { backgroundColor: colors.primary },
                              ]}
                            >
                              <Text style={styles.currentBadgeText}>
                                Current
                              </Text>
                            </View>
                          )}
                        </View>
                        {!isCurrentPlan && (
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={colors.secondary}
                          />
                        )}
                      </View>

                      <Text
                        style={[styles.planPrice, { color: colors.primary }]}
                      >
                        {formatPrice(plan)}
                      </Text>

                      {plan.discountPercentage > 0 && (
                        <View
                          style={[
                            styles.savingsBadge,
                            { backgroundColor: colors.success },
                          ]}
                        >
                          <Text style={styles.savingsText}>
                            Save{" "}
                            {plan.savingsPercentage || plan.discountPercentage}%
                          </Text>
                        </View>
                      )}

                      {/* Show plan duration */}
                      <Text
                        style={[
                          styles.planDuration,
                          { color: colors.secondary },
                        ]}
                      >
                        {plan.duration} days access
                      </Text>

                      {/* Show key features */}
                      {plan.features && plan.features.length > 0 && (
                        <View style={styles.featuresContainer}>
                          {plan.features.slice(0, 2).map(
                            (feature, index) =>
                              feature.included && (
                                <View key={index} style={styles.featureItem}>
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={12}
                                    color={colors.success}
                                  />
                                  <Text
                                    style={[
                                      styles.featureText,
                                      { color: colors.secondary },
                                    ]}
                                  >
                                    {feature.name}
                                  </Text>
                                </View>
                              ),
                          )}
                          {plan.features.filter((f) => f.included).length >
                            2 && (
                            <Text
                              style={[
                                styles.moreFeatures,
                                { color: colors.secondary },
                              ]}
                            >
                              +
                              {plan.features.filter((f) => f.included).length -
                                2}{" "}
                              more features
                            </Text>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}

                <View style={styles.footerNote}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={colors.secondary}
                  />
                  <Text style={[styles.noteText, { color: colors.secondary }]}>
                    All plans come with 14-day trial. Cancel anytime.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text
                style={[styles.cancelButtonText, { color: colors.secondary }]}
              >
                Maybe Later
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.upgradeButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleViewAllPlans} // ✅ Updated to use handleViewAllPlans
            >
              <Text style={styles.upgradeButtonText}>
                {hasActiveSubscription ? "Browse Plans" : "View All Plans"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    height: SCREEN_HEIGHT * 0.85,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 4,
  },
  headerContent: {
    alignItems: "center",
    marginTop: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  currentPlanCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  currentPlanHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  currentPlanTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  currentPlanName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  currentPlanStatus: {
    fontSize: 12,
    marginBottom: 2,
  },
  currentPlanExpiry: {
    fontSize: 11,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  planCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  planNameContainer: {
    flex: 1,
    gap: 6,
  },
  planBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  planName: {
    fontSize: 16,
    fontWeight: "600",
  },
  popularBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  popularText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "600",
  },
  currentBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  currentBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "600",
  },
  planPrice: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  savingsBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  savingsText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  planDuration: {
    fontSize: 11,
    marginBottom: 10,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  featureText: {
    fontSize: 11,
  },
  moreFeatures: {
    fontSize: 11,
    fontStyle: "italic",
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 12,
  },
  noteText: {
    fontSize: 11,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  upgradeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PlanRequirementModal;
