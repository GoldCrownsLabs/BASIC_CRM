import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Plan } from "@/lib/api/plan";

interface PlansBannerProps {
  plans: Plan[];
  onViewAll?: () => void;
}

const PlansBanner: React.FC<PlansBannerProps> = ({ plans, onViewAll }) => {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  // console.log("Rendering PlansBanner with plans:", plans);

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      router.push("/(tabs)/plans" as any);
    }
  };

  const bannerGradient = isDark
    ? (["#1E293B", "#0F172A"] as const)
    : (["#3B82F6", "#1D4ED8"] as const);

  const displayPlans = plans.slice(0, 4);
  const firstRow = displayPlans.slice(0, 2);
  const secondRow = displayPlans.slice(2, 4);

  const renderPlanCard = (plan: Plan) => (
    <TouchableOpacity
      key={plan._id}
      style={[styles.planCard, { backgroundColor: colors.card }]}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/plans" as any,
          params: { selectedPlan: plan._id },
        })
      }
    >
      <View style={styles.planHeader}>
        <Text
          style={[styles.planName, { color: colors.text }]}
          numberOfLines={1}
        >
          {plan.displayName}
        </Text>
        {plan.popular && (
          <View style={styles.miniPopularBadge}>
            <Ionicons name="star" size={8} color="#FFD700" />
          </View>
        )}
      </View>

      {/* ✅ SIRF formattedPrice dikhao - backend se already discount lag ke aaya hai */}
      <Text style={[styles.planPrice, { color: colors.primary }]}>
        {plan.formattedDiscountedPrice}
      </Text>

      {/* ✅ SIRF savingsPercentage dikhao - backend se already calculated aaya hai */}
      {plan.discountPercentage > 0 && (
        <View
          style={[styles.miniSavingsBadge, { backgroundColor: colors.success }]}
        >
          <Text style={styles.miniSavingsText}>
            Save {plan.savingsPercentage}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={bannerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.banner,
          {
            shadowColor: isDark ? "#000" : "#1D4ED8",
          },
        ]}
      >
        <View style={styles.bannerContent}>
          <View style={styles.headerSection}>
            <View style={styles.titleContainer}>
              <Ionicons name="flash" size={24} color="#FFFFFF" />
              <Text style={styles.bannerTitle}>Premium Plans</Text>
            </View>
            <TouchableOpacity
              onPress={handleViewAll}
              style={styles.viewAllLink}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.bannerSubtitle}>
            Unlock advanced features and grow your business
          </Text>

          <View style={styles.plansContainer}>
            <View style={styles.planRow}>
              {firstRow.map((plan) => renderPlanCard(plan))}
            </View>

            {secondRow.length > 0 && (
              <View style={[styles.planRow, styles.secondRow]}>
                {secondRow.map((plan) => renderPlanCard(plan))}
              </View>
            )}

            {plans.length > 4 && (
              <View style={styles.morePlansIndicator}>
                <Text style={styles.morePlansText}>
                  +{plans.length - 4} more plans available
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.ctaButton} onPress={handleViewAll}>
            <Text style={styles.ctaText}>Compare All Plans</Text>
            <Ionicons name="arrow-forward-circle" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 32,
  },
  banner: {
    borderRadius: 20,
    overflow: "hidden",
  },
  bannerContent: {
    padding: 16,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  viewAllLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
    marginBottom: 16,
  },
  plansContainer: {
    marginBottom: 16,
  },
  planRow: {
    flexDirection: "row",
    gap: 8,
  },
  secondRow: {
    marginTop: 8,
  },
  planCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planName: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  miniPopularBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    padding: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  miniSavingsBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  miniSavingsText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "600",
  },
  morePlansIndicator: {
    marginTop: 8,
    alignItems: "center",
  },
  morePlansText: {
    fontSize: 11,
    color: "#FFFFFF",
    opacity: 0.7,
    fontStyle: "italic",
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default PlansBanner;
