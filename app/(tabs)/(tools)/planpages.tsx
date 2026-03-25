// app/(tabs)/(tools)/plans.tsx

import WithPlanCheck from "@/components/common/WithPlanCheck";
import React from "react";
import { View, Text } from "react-native";

const PlansScreen = () => {
  return (
    <WithPlanCheck requiredPlanLevel="basic">
      {/* This content will only show if user has plan */}
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Plans</Text>
        <Text>Your plan details will appear here</Text>
      </View>
    </WithPlanCheck>
  );
};

export default PlansScreen;
