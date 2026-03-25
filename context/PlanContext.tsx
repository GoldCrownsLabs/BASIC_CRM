// context/PlanContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { planService, Subscription } from "@/lib/api/plan";

interface PlanContextType {
  hasActivePlan: boolean;
  isLoading: boolean;
  subscription: Subscription | null;
  checkPlan: () => Promise<void>;
  refreshPlan: () => Promise<void>;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within PlanProvider");
  }
  return context;
};

interface PlanProviderProps {
  children: React.ReactNode;
}

export const PlanProvider: React.FC<PlanProviderProps> = ({ children }) => {
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const checkPlan = async () => {
    try {
      setIsLoading(true);
      const sub = await planService.getCurrentSubscription();
      const hasPlan =
        sub !== null && (sub.status === "active" || sub.status === "trial");

      setSubscription(sub);
      setHasActivePlan(hasPlan);
    } catch (error) {
      console.error("Error checking plan:", error);
      setHasActivePlan(false);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPlan = async () => {
    await checkPlan();
  };

  useEffect(() => {
    checkPlan();
  }, []);

  return (
    <PlanContext.Provider
      value={{
        hasActivePlan,
        isLoading,
        subscription,
        checkPlan,
        refreshPlan,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};
