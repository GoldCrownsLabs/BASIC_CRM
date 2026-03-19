// app/payment-success/index.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams();

  // Get all params with proper typing
  const planId = params.planId as string;
  const planName = params.planName as string;
  const amount = params.amount as string;
  const isTrial = params.isTrial === "true";
  const trialDays = params.trialDays as string;
  const paymentId =
    (params.paymentId as string) || `PAY-${Date.now().toString().slice(-8)}`;

  // Remove auto-redirect - no timer needed
  const scaleValue = new Animated.Value(0);

  useEffect(() => {
    // Animation for success icon
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  // Format amount properly
  const formatAmount = (amt: string) => {
    if (!amt) return "₹0";
    if (amt.includes("FREE") || isTrial) return "FREE";

    const numericValue = amt.replace(/[^0-9.]/g, "");
    if (!numericValue) return amt;

    return `₹${parseFloat(numericValue).toLocaleString("en-IN")}`;
  };

  // Get plan display name
  const getPlanDisplayName = () => {
    if (planName) return planName;
    if (planId === "basic") return "Basic Plan";
    if (planId === "pro") return "Pro Plan";
    if (planId === "enterprise") return "Enterprise Plan";
    return "Subscription";
  };

  // Get payment method
  const getPaymentMethod = () => {
    if (isTrial) return "Free Trial";
    return "Credit Card / UPI";
  };

  // Get subscription date
  const getStartDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get trial end date if applicable
  const getTrialEndDate = () => {
    if (!isTrial || !trialDays) return null;

    const date = new Date();
    date.setDate(date.getDate() + parseInt(trialDays));
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const trialEndDate = getTrialEndDate();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Success Animation */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: scaleValue }],
            backgroundColor: isTrial
              ? colors.warning + "20"
              : colors.success + "20",
          },
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: isTrial ? colors.warning : colors.success },
          ]}
        >
          <Ionicons
            name={isTrial ? "gift" : "checkmark"}
            size={60}
            color="#FFFFFF"
          />
        </View>
      </Animated.View>

      <Text style={[styles.title, { color: colors.text }]}>
        {isTrial ? "Trial Activated! 🎁" : "Payment Successful! 🎉"}
      </Text>

      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {isTrial
          ? `Your ${trialDays}-day free trial has been activated`
          : "Your subscription has been activated successfully"}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {/* Plan Name */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Plan
          </Text>
          <Text
            style={[styles.value, { color: colors.text, fontWeight: "600" }]}
          >
            {getPlanDisplayName()}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Payment/Transaction ID */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {isTrial ? "Trial ID" : "Payment ID"}
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {paymentId.slice(0, 12)}...
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Amount */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {isTrial ? "Trial Value" : "Amount Paid"}
          </Text>
          <Text
            style={[
              styles.amount,
              { color: isTrial ? colors.warning : colors.primary },
            ]}
          >
            {formatAmount(amount as string)}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Start Date */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Start Date
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {getStartDate()}
          </Text>
        </View>

        {/* Trial End Date - Only for trial */}
        {isTrial && trialEndDate && (
          <>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Trial Ends
              </Text>
              <Text
                style={[
                  styles.value,
                  { color: colors.warning, fontWeight: "500" },
                ]}
              >
                {trialEndDate}
              </Text>
            </View>
          </>
        )}

        {/* Payment Method */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Method
          </Text>
          <View style={styles.paymentMethod}>
            <Ionicons
              name={isTrial ? "gift-outline" : "card-outline"}
              size={14}
              color={isTrial ? colors.warning : colors.primary}
            />
            <Text style={[styles.value, { color: colors.text, marginLeft: 4 }]}>
              {getPaymentMethod()}
            </Text>
          </View>
        </View>
      </View>

      {/* Next Billing Info for Trial */}
      {isTrial && (
        <View
          style={[styles.trialNote, { backgroundColor: colors.warning + "15" }]}
        >
          <Ionicons
            name="information-circle"
            size={16}
            color={colors.warning}
          />
          <Text style={[styles.trialNoteText, { color: colors.textSecondary }]}>
            Your trial ends on {trialEndDate}. You won&rsquo;t be charged until
            then.
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            router.replace("/(tabs)");
          }}
        >
          <Ionicons
            name={isTrial ? "rocket-outline" : "home-outline"}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.primaryButtonText}>
            {isTrial ? "Start Exploring" : "Go to Dashboard"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.border }]}
          onPress={() => {
            router.push({
              pathname: "/(tabs)/subscription" as any,
              params: {
                planId: planId,
                isTrial: isTrial ? "true" : "false",
              },
            });
          }}
        >
          <Ionicons
            name="document-text-outline"
            size={18}
            color={colors.textSecondary}
          />
          <Text
            style={[
              styles.secondaryButtonText,
              { color: colors.textSecondary },
            ]}
          >
            View Subscription Details
          </Text>
        </TouchableOpacity>
      </View>

      {/* Optional: Add a subtle hint that this page won't auto-redirect */}
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Take your time to review the details above
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
  },
  amount: {
    fontSize: 20,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    width: "100%",
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
  },
  trialNote: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
    width: "100%",
  },
  trialNoteText: {
    fontSize: 12,
    flex: 1,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  hint: {
    fontSize: 12,
    marginTop: 24,
    opacity: 0.5,
    fontStyle: "italic",
  },
});
