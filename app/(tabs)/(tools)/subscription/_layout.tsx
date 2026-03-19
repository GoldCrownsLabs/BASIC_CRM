// app/subscription/_layout.tsx
import { Stack } from "expo-router";

export default function SubscriptionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "My Subscriptions",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Subscription Details",
        }}
      />
    </Stack>
  );
}
