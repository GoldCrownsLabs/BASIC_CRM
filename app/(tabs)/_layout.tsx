// app/(tabs)/_layout.tsx - Fixed Profile Navigation

import { HapticTab } from "@/components/haptic-tab";
import { useAppTheme } from "@/context/ThemeContext";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { router, Tabs, Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View, ActivityIndicator } from "react-native";
import { planService } from "@/lib/api/plan";
import PlanRequirementModal from "@/components/common/PlanRequirementModal";

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const navigation = useAppNavigation();
  const [authChecked, setAuthChecked] = useState(false);

  // Plan related states
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [isCheckingPlan, setIsCheckingPlan] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    verifyAuth();
  }, []);

  // Check user's plan after authentication
  useEffect(() => {
    const checkUserPlan = async () => {
      if (isAuthenticated && user) {
        try {
          setIsCheckingPlan(true);
          const subscription = await planService.getCurrentSubscription();
          const hasPlan =
            subscription !== null &&
            (subscription.status === "active" ||
              subscription.status === "trial");
          setHasActivePlan(hasPlan);
          console.log("✅ Plan status:", hasPlan ? "Active" : "No active plan");
        } catch (error) {
          console.error("Error checking plan:", error);
          setHasActivePlan(false);
        } finally {
          setIsCheckingPlan(false);
        }
      } else {
        setIsCheckingPlan(false);
      }
    };

    if (authChecked && isAuthenticated) {
      checkUserPlan();
    }
  }, [authChecked, isAuthenticated, user]);

  // Handle tab press with plan check
  const handleTabPress = (tabName: string, requiresPlan: boolean = false) => {
    if (requiresPlan && !hasActivePlan) {
      setSelectedTab(tabName);
      setShowPlanModal(true);
      return false; // Prevent navigation
    }
    return true; // Allow navigation
  };

  const handlePlanSelect = (planId: string) => {
    setShowPlanModal(false);
    // Navigate to plans screen
    router.push({
      pathname: "/(tabs)/(tools)/planpages",
      params: { selectedPlan: planId },
    });
  };

  // ✅ Fixed Profile Navigation
  const handleProfilePress = () => {
    console.log("🔍 Navigating to profile...");
    // Try different paths based on your folder structure
    router.push("/(tabs)/profile"); // If profile is directly in tabs
    // OR
    // router.push("/profile"); // If profile is outside tabs
    // OR
    // router.push("/(tabs)/profile/index"); // If profile is in a folder
  };

  // Show loading while checking auth and plan
  if (isLoading || !authChecked || isCheckingPlan) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarButton: HapticTab,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          headerStyle: {
            backgroundColor: colors.card,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
          headerTitle: () => null,
          headerLeft: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 15,
              }}
            >
              <Ionicons
                name="menu"
                size={32}
                color={colors.primary}
                onPress={() => navigation.openDrawer()}
                style={{ marginRight: 12 }}
              />
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  Hi, {user?.name?.split(" ")[0] || "User"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {user?.role || "User"}
                  </Text>
                  {!hasActivePlan && (
                    <View
                      style={{
                        backgroundColor: colors.warning + "20",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        marginLeft: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color: colors.warning,
                          fontWeight: "500",
                        }}
                      >
                        Free
                      </Text>
                    </View>
                  )}
                  {hasActivePlan && (
                    <View
                      style={{
                        backgroundColor: colors.success + "20",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        marginLeft: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color: colors.success,
                          fontWeight: "500",
                        }}
                      >
                        Premium
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ),
          headerRight: () => (
            <Pressable
              onPress={handleProfilePress} // ✅ Using fixed function
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                marginRight: 10,
              })}
            >
              <View>
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: colors.primary,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.primary,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          ),
        }}
      >
        {/* HOME - Always visible */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              if (!handleTabPress("home", false)) {
                e.preventDefault();
              }
            },
          }}
        />

        {/* LEADS - Requires plan */}
        <Tabs.Screen
          name="leads"
          options={{
            title: "Leads",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "trending-up" : "trending-up-outline"}
                size={24}
                color={color}
              />
            ),
            tabBarBadge: !hasActivePlan ? "🔒" : undefined,
            tabBarBadgeStyle: {
              backgroundColor: colors.warning,
              fontSize: 10,
            },
          }}
          listeners={{
            tabPress: (e) => {
              if (!handleTabPress("leads", true)) {
                e.preventDefault();
              }
            },
          }}
        />

        {/* TASKS - Requires plan */}
        <Tabs.Screen
          name="tasks"
          options={{
            title: "Tasks",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "checkmark-circle" : "checkmark-circle-outline"}
                size={24}
                color={color}
              />
            ),
            tabBarBadge: !hasActivePlan ? "🔒" : undefined,
            tabBarBadgeStyle: {
              backgroundColor: colors.warning,
              fontSize: 10,
            },
          }}
          listeners={{
            tabPress: (e) => {
              if (!handleTabPress("tasks", true)) {
                e.preventDefault();
              }
            },
          }}
        />

        {/* CONTACTS - Requires plan */}
        <Tabs.Screen
          name="contacts"
          options={{
            title: "Contacts",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={24}
                color={color}
              />
            ),
            tabBarBadge: !hasActivePlan ? "🔒" : undefined,
            tabBarBadgeStyle: {
              backgroundColor: colors.warning,
              fontSize: 10,
            },
          }}
          listeners={{
            tabPress: (e) => {
              if (!handleTabPress("contacts", true)) {
                e.preventDefault();
              }
            },
          }}
        />

        {/* PROFILE - Always visible */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              if (!handleTabPress("profile", false)) {
                e.preventDefault();
              }
            },
          }}
        />

        {/* HIDDEN SCREENS - No tab bar visible */}
        <Tabs.Screen
          name="(tools)"
          options={{
            href: null,
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name="tasks/[id]"
          options={{
            href: null,
            headerShown: false,
          }}
        />
      </Tabs>

      {/* Plan Requirement Modal */}
      <PlanRequirementModal
        visible={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onPlanSelect={handlePlanSelect}
        requiredPlanLevel="basic"
      />
    </>
  );
}
