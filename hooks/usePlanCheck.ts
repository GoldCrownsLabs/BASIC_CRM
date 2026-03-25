// hooks/usePlanCheck.ts

import { useState, useEffect } from "react";
import { planService } from "@/lib/api/plan";

interface UsePlanCheckResult {
  hasPlan: boolean | null;
  isLoading: boolean;
  showPlanModal: boolean;
  setShowPlanModal: (show: boolean) => void;
  checkPlan: () => Promise<void>;
}

export const usePlanCheck = (
  autoShowModal: boolean = true,
): UsePlanCheckResult => {
  const [hasPlan, setHasPlan] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const checkPlan = async () => {
    try {
      setIsLoading(true);
      const subscription = await planService.getCurrentSubscription();
      const hasActivePlan =
        subscription !== null &&
        (subscription.status === "active" || subscription.status === "trial");

      setHasPlan(hasActivePlan);

      if (autoShowModal && !hasActivePlan) {
        setShowPlanModal(true);
      }
    } catch (error) {
      console.error("Error checking plan:", error);
      setHasPlan(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPlan();
  }, []);

  return {
    hasPlan,
    isLoading,
    showPlanModal,
    setShowPlanModal,
    checkPlan,
  };
};
