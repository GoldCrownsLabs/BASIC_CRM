import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { planService } from "@/lib/api/plan";
import CommonHeader from "@/components/common/CommonHeader";

interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number;
  _id: string;
  id: string;
}

interface FeatureAccess {
  maxUsers: number;
  maxLeads: number;
  maxContacts: number;
  maxTasks: number;
  maxProjects: number;
  maxStorage: number;
  advancedReports: boolean;
  apiAccess: boolean;
  emailCampaigns: boolean;
  customFields: boolean;
  bulkOperations: boolean;
  prioritySupport: boolean;
  dataExport: boolean;
  teamCollaboration: boolean;
}

interface Plan {
  _id: string;
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  discountPercentage: number;
  discountedPrice: number;
  formattedPrice: string;
  formattedDiscountedPrice: string;
  savingsPercentage: number;
  duration: number;
  billingCycle: number;
  billingPeriod: string;
  features: PlanFeature[];
  featureAccess: FeatureAccess;
  hasTrial: boolean;
  trialDays: number;
  popular: boolean;
  recommended: boolean;
  isActive: boolean;
  sortOrder: number;
  icon: string;
  colorCode: string;
}

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export default function PlansScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await planService.getPlans();
      const sortedPlans = (response.data || []).sort(
        (a: Plan, b: Plan) => a.sortOrder - b.sortOrder,
      );
      setPlans(sortedPlans);
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    router.push({
      pathname: "/(tabs)/checkout" as any, // Type assertion for Expo Router
      params: {
        planId: plan._id,
        planName: plan.displayName,
        price: plan.formattedDiscountedPrice || plan.formattedPrice,
      },
    });
  };

  const formatStorage = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(0)}GB`;
    }
    return `${mb}MB`;
  };

  const PlanCard = ({ plan, index }: { plan: Plan; index: number }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    // Define icons with proper typing
    const keyFeatures = [
      {
        icon: "people-outline" as IconName,
        label: `${plan.featureAccess.maxUsers} Users`,
        show: plan.featureAccess.maxUsers > 0,
      },
      {
        icon: "folder-outline" as IconName,
        label: `${plan.featureAccess.maxProjects} Projects`,
        show: plan.featureAccess.maxProjects > 0,
      },
      {
        icon: "cloud-outline" as IconName,
        label: formatStorage(plan.featureAccess.maxStorage),
        show: plan.featureAccess.maxStorage > 0,
      },
      {
        icon: "people-outline" as IconName,
        label: `${plan.featureAccess.maxLeads} Leads`,
        show: plan.featureAccess.maxLeads > 0,
      },
    ].filter((f) => f.show);

    const getPlanIcon = (): IconName => {
      if (plan.popular) return "star";
      if (plan.name === "basic") return "leaf";
      if (plan.name === "pro") return "rocket";
      if (plan.name === "enterprise") return "business";
      return "cube";
    };

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        style={[styles.cardWrapper, animatedStyle]}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => handleSelectPlan(plan)}
          onPressIn={() => (scale.value = withSpring(0.98))}
          onPressOut={() => (scale.value = withSpring(1))}
        >
          <View
            style={[
              styles.planCard,
              {
                backgroundColor: colors.card,
                borderColor: plan.popular ? colors.primary : colors.border,
                ...(plan.popular && {
                  shadowColor: colors.primary,
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 5,
                }),
              },
            ]}
          >
            {/* Header with Icon */}
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.primary + "15" },
                ]}
              >
                <Ionicons
                  name={getPlanIcon()}
                  size={24}
                  color={colors.primary}
                />
              </View>

              <View style={styles.titleContainer}>
                <Text style={[styles.planName, { color: colors.text }]}>
                  {plan.displayName.replace(" Plan", "")}
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

            {/* Price Section */}
            <View style={styles.priceSection}>
              <View style={styles.priceRow}>
                <Text
                  style={[styles.currency, { color: colors.textSecondary }]}
                >
                  ₹
                </Text>
                <Text style={[styles.price, { color: colors.text }]}>
                  {plan.discountedPrice
                    ? Math.round(plan.discountedPrice).toLocaleString()
                    : Math.round(plan.price).toLocaleString()}
                </Text>
                <Text
                  style={[
                    styles.billingPeriod,
                    { color: colors.textSecondary },
                  ]}
                >
                  /{plan.billingPeriod === "month" ? "mo" : "yr"}
                </Text>
              </View>

              {plan.discountPercentage > 0 && (
                <View style={styles.discountBadge}>
                  <Text
                    style={[styles.discountText, { color: colors.success }]}
                  >
                    Save {plan.discountPercentage}%
                  </Text>
                  <Text
                    style={[
                      styles.originalPrice,
                      { color: colors.textSecondary },
                    ]}
                  >
                    ₹{Math.round(plan.price).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>

            {/* Key Features */}
            <View style={styles.keyFeaturesGrid}>
              {keyFeatures.map((feature, idx) => (
                <View key={idx} style={styles.keyFeatureItem}>
                  <Ionicons
                    name={feature.icon}
                    size={16}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      styles.keyFeatureText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {feature.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Divider */}
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />

            {/* Features List */}
            <View style={styles.featuresList}>
              {plan.features.slice(0, 4).map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <View
                    style={[
                      styles.checkCircle,
                      { backgroundColor: colors.success + "20" },
                    ]}
                  >
                    <Ionicons
                      name="checkmark"
                      size={12}
                      color={colors.success}
                    />
                  </View>
                  <Text style={[styles.featureText, { color: colors.text }]}>
                    {feature.name}
                    {feature.limit && (
                      <Text
                        style={[styles.featureLimit, { color: colors.primary }]}
                      >
                        {" "}
                        {feature.limit}
                      </Text>
                    )}
                  </Text>
                </View>
              ))}
            </View>

            {/* Trial Badge */}
            {plan.hasTrial && (
              <View
                style={[
                  styles.trialBadge,
                  { backgroundColor: colors.warning + "15" },
                ]}
              >
                <Ionicons
                  name="gift-outline"
                  size={14}
                  color={colors.warning}
                />
                <Text style={[styles.trialText, { color: colors.warning }]}>
                  {plan.trialDays} days free trial
                </Text>
              </View>
            )}

            {/* Select Button */}
            <TouchableOpacity
              style={[
                styles.selectButton,
                {
                  backgroundColor: plan.popular
                    ? colors.primary
                    : colors.primary + "15",
                },
              ]}
              onPress={() => handleSelectPlan(plan)}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  { color: plan.popular ? "#FFFFFF" : colors.primary },
                ]}
              >
                {plan.hasTrial ? "Start Free Trial" : "Choose Plan"}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={plan.popular ? "#FFFFFF" : colors.primary}
              />
            </TouchableOpacity>

            {/* Popular Badge */}
            {plan.popular && (
              <View
                style={[
                  styles.popularBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <MaterialCommunityIcons
                  name="crown"
                  size={12}
                  color="#FFFFFF"
                />
                <Text style={styles.popularText}>BEST VALUE</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading plans...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CommonHeader title="Subscription Plans" showSafeArea={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Choose your plan
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Simple, transparent pricing for teams of all sizes
          </Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan, index) => (
            <PlanCard key={plan._id} plan={plan} index={index} />
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.trustItem}>
            <Ionicons
              name="shield-checkmark"
              size={16}
              color={colors.success}
            />
            <Text style={[styles.trustText, { color: colors.textSecondary }]}>
              7-day money back
            </Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="lock-closed" size={16} color={colors.success} />
            <Text style={[styles.trustText, { color: colors.textSecondary }]}>
              Secure payment
            </Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="headset" size={16} color={colors.success} />
            <Text style={[styles.trustText, { color: colors.textSecondary }]}>
              24/7 support
            </Text>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.8,
  },
  plansContainer: {
    paddingHorizontal: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    position: "relative",
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  planDescription: {
    fontSize: 13,
  },
  priceSection: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  currency: {
    fontSize: 16,
    fontWeight: "500",
  },
  price: {
    fontSize: 28,
    fontWeight: "700",
    marginLeft: 2,
  },
  billingPeriod: {
    fontSize: 14,
    marginLeft: 4,
  },
  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  discountText: {
    fontSize: 13,
    fontWeight: "600",
  },
  originalPrice: {
    fontSize: 13,
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  keyFeaturesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  keyFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  keyFeatureText: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  featuresList: {
    gap: 10,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  featureLimit: {
    fontSize: 12,
    fontWeight: "500",
  },
  trialBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
    alignSelf: "flex-start",
  },
  trialText: {
    fontSize: 12,
    fontWeight: "500",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  selectButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    zIndex: 1,
  },
  popularText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    flexWrap: "wrap",
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trustText: {
    fontSize: 12,
  },
});
