// components/common/WithPlanCheck.tsx

import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/store/auth.store";
import { planService } from "@/lib/api/plan";
import PlanRequirementModal from "./PlanRequirementModal";

interface WithPlanCheckProps {
  children: React.ReactNode;
  requiredPlanLevel?: "basic" | "premium" | "pro" | "enterprise";
  fallbackComponent?: React.ReactNode;
  showModal?: boolean;
  onPlanSelect?: (planId: string) => void;
}

const WithPlanCheck: React.FC<WithPlanCheckProps> = ({
  children,
  requiredPlanLevel = "basic",
  fallbackComponent,
  showModal = true,
  onPlanSelect,
}) => {
  const { user } = useAuthStore();
  const [hasRequiredPlan, setHasRequiredPlan] = useState<boolean | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkUserPlan();
  }, [user]);

  const checkUserPlan = async () => {
    try {
      setIsChecking(true);

      // Get user's current subscription
      const subscription = await planService.getCurrentSubscription();

      // Check if user has active subscription
      const hasActivePlan =
        subscription !== null &&
        (subscription.status === "active" || subscription.status === "trial");

      // Here you can add more logic to check plan level if needed
      // For now, we just check if they have any active plan
      setHasRequiredPlan(hasActivePlan);

      if (!hasActivePlan && showModal) {
        setShowPlanModal(true);
      }
    } catch (error) {
      console.error("Error checking plan:", error);
      setHasRequiredPlan(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    if (onPlanSelect) {
      onPlanSelect(planId);
    }
    setShowPlanModal(false);
  };

  // Show loading while checking
  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // If user has plan, show children
  if (hasRequiredPlan) {
    return <>{children}</>;
  }

  // If no plan and fallback component provided, show fallback
  if (fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  // Otherwise show nothing (modal will handle)
  return (
    <>
      {showPlanModal && (
        <PlanRequirementModal
          visible={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          onPlanSelect={handlePlanSelect}
          requiredPlanLevel={requiredPlanLevel}
        />
      )}
      {/* Show placeholder or nothing */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {/* Optional: You can show a placeholder here */}
      </View>
    </>
  );
};

export default WithPlanCheck;
