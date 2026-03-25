// components/CustomDrawerContent.tsx - Fixed with Help & Support as free

import { useAppTheme } from "@/context/ThemeContext";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { planService } from "@/lib/api/plan";
import PlanRequirementModal from "@/components/common/PlanRequirementModal";

export default function CustomDrawerContent(
  props: DrawerContentComponentProps,
) {
  const { user, logout } = useAuthStore();
  const { theme, colors, isDark, toggleTheme } = useAppTheme();

  // Plan related states
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [isCheckingPlan, setIsCheckingPlan] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  // Features that require plan
  const featuresRequiringPlan = [
    "Activities",
    "Analytics & Reports",
    "Calendar View",
    "Email Templates",
    "Import / Export",
    "Settings",
  ];

  // Check user's plan
  useEffect(() => {
    checkUserPlan();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const checkUserPlan = async () => {
    try {
      setIsCheckingPlan(true);
      const subscription = await planService.getCurrentSubscription();
      const hasPlan =
        subscription !== null &&
        (subscription.status === "active" || subscription.status === "trial");
      setHasActivePlan(hasPlan);
      console.log(
        "✅ Plan status in drawer:",
        hasPlan ? "Active" : "No active plan",
      );
    } catch (error) {
      console.error("Error checking plan:", error);
      setHasActivePlan(false);
    } finally {
      setIsCheckingPlan(false);
    }
  };

  const handleFeaturePress = (feature: string, onPress: () => void) => {
    // ✅ Check if feature requires plan
    if (featuresRequiringPlan.includes(feature) && !hasActivePlan) {
      setSelectedFeature(feature);
      setShowPlanModal(true);
      return;
    }
    // If feature doesn't require plan OR user has plan, execute onPress
    onPress();
  };

  const handlePlanSelect = (planId: string) => {
    setShowPlanModal(false);
    router.push({
      pathname: "/(tabs)/(tools)/plans",
      params: { selectedPlan: planId, fromFeature: selectedFeature },
    });
  };

  const handleLogout = () => {
    logout();
    props.navigation.closeDrawer();
  };

  // ✅ Features list with requiresPlan flag
  const importantFeatures = [
    {
      label: "Activities",
      icon: "pulse-outline",
      requiresPlan: true,
      onPress: () => {
        router.push("/activities");
        props.navigation.closeDrawer();
      },
    },
    {
      label: "Analytics & Reports",
      icon: "bar-chart-outline",
      requiresPlan: true,
      onPress: () => {
        router.push("/analytics");
        props.navigation.closeDrawer();
      },
    },
    {
      label: "Calendar View",
      icon: "calendar-outline",
      requiresPlan: true,
      onPress: () => {
        router.push("/calendar");
        props.navigation.closeDrawer();
      },
    },
    {
      label: "Email Templates",
      icon: "mail-outline",
      requiresPlan: true,
      onPress: () => {
        router.push("/email-templates");
        props.navigation.closeDrawer();
      },
    },
    {
      label: "Import / Export",
      icon: "download-outline",
      requiresPlan: true,
      onPress: () => {
        router.push("/import-export");
        props.navigation.closeDrawer();
      },
    },
    {
      label: "Settings",
      icon: "settings-outline",
      requiresPlan: true,
      onPress: () => {
        router.push("/settings");
        props.navigation.closeDrawer();
      },
    },
    {
      label: "Help & Support",
      icon: "help-circle-outline",
      requiresPlan: false, // ✅ Free feature - no plan required
      onPress: () => {
        router.push("/help");
        props.navigation.closeDrawer();
      },
    },
  ];

  const getThemeIcon = () => {
    if (theme === "system") return "contrast-outline";
    return isDark ? "moon" : "sunny";
  };

  const getThemeLabel = () => {
    if (theme === "system") return "System Theme";
    return isDark ? "Dark Mode" : "Light Mode";
  };

  const handleThemeToggle = () => {
    toggleTheme(isDark ? "light" : "dark");
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Profile Header */}
        <Animated.View
          style={[
            styles.header,
            {
              backgroundColor: colors.primary,
              paddingTop: 60,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.profileSection}
            onPress={() => {
              router.push("/(tabs)/profile");
              props.navigation.closeDrawer();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <Ionicons name="person" size={36} color={colors.primary} />
                </View>
              )}
              <View
                style={[styles.onlineIndicator, { backgroundColor: "#4CAF50" }]}
              />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || "Guest User"}</Text>
              <Text style={styles.userEmail}>
                {user?.email || "guest@example.com"}
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Text style={{ color: "rgba(255,255,255,0.8)" }}>Role: </Text>
                <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                  {user?.role || "User"}
                </Text>
                {!hasActivePlan && (
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                      marginLeft: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: "white",
                        fontWeight: "500",
                      }}
                    >
                      Free
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>

        <DrawerContentScrollView
          {...props}
          style={[styles.drawerScroll, { backgroundColor: colors.background }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Important Features */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Features
            </Text>
            {importantFeatures.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleFeaturePress(item.label, item.onPress)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: colors.primary + "15" },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={[styles.menuText, { color: colors.text }]}>
                  {item.label}
                </Text>
                {item.requiresPlan && !hasActivePlan && (
                  <View style={styles.lockIcon}>
                    <Ionicons
                      name="lock-closed"
                      size={14}
                      color={colors.warning || "#F59E0B"}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Theme Settings */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Appearance
            </Text>

            <View style={styles.themeToggle}>
              <View style={styles.themeToggleLeft}>
                <View
                  style={[
                    styles.themeIconContainer,
                    { backgroundColor: colors.primary + "15" },
                  ]}
                >
                  <Ionicons
                    name={getThemeIcon() as any}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.themeTextContainer}>
                  <Text style={[styles.themeTitle, { color: colors.text }]}>
                    {getThemeLabel()}
                  </Text>
                  <Text
                    style={[
                      styles.themeSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {theme === "system"
                      ? "Follows device settings"
                      : "Manual selection"}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                trackColor={{
                  false: colors.border,
                  true: colors.primary + "80",
                }}
                thumbColor={isDark ? colors.primary : colors.textSecondary}
                ios_backgroundColor={colors.border}
              />
            </View>

            {/* Theme Quick Options */}
            <View style={styles.themeOptions}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      theme === "light" ? colors.primary + "20" : "transparent",
                    borderColor:
                      theme === "light" ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleTheme("light")}
              >
                <Ionicons
                  name="sunny"
                  size={16}
                  color={
                    theme === "light" ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    {
                      color:
                        theme === "light"
                          ? colors.primary
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      theme === "dark" ? colors.primary + "20" : "transparent",
                    borderColor:
                      theme === "dark" ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleTheme("dark")}
              >
                <Ionicons
                  name="moon"
                  size={16}
                  color={
                    theme === "dark" ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    {
                      color:
                        theme === "dark"
                          ? colors.primary
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Dark
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      theme === "system"
                        ? colors.primary + "20"
                        : "transparent",
                    borderColor:
                      theme === "system" ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleTheme("system")}
              >
                <Ionicons
                  name="contrast-outline"
                  size={16}
                  color={
                    theme === "system" ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    {
                      color:
                        theme === "system"
                          ? colors.primary
                          : colors.textSecondary,
                    },
                  ]}
                >
                  System
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Sync Status */}
          <View style={[styles.syncSection, { backgroundColor: colors.card }]}>
            <View style={styles.syncInfo}>
              <Ionicons name="cloud-done" size={20} color="#4CAF50" />
              <View style={styles.syncTextContainer}>
                <Text style={[styles.syncTitle, { color: colors.text }]}>
                  Sync Status
                </Text>
                <Text
                  style={[styles.syncSubtitle, { color: colors.textSecondary }]}
                >
                  Last synced: Just now
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.syncButton,
                { backgroundColor: colors.primary + "15" },
              ]}
            >
              <Ionicons name="sync" size={18} color={colors.primary} />
              <Text style={[styles.syncButtonText, { color: colors.primary }]}>
                Sync Now
              </Text>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              CRM Pro
            </Text>
            <Text
              style={[styles.infoSubtitle, { color: colors.textSecondary }]}
            >
              Version 1.0.0 • Offline Capable
            </Text>
            <Text
              style={[styles.infoDescription, { color: colors.textSecondary }]}
            >
              Lightweight CRM for sales teams
            </Text>
          </View>
        </DrawerContentScrollView>

        {/* Logout Button */}
        <Animated.View
          style={[
            styles.footer,
            {
              backgroundColor: colors.card,
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.logoutButton,
              { backgroundColor: colors.error + "10" },
            ]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "white",
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  onlineIndicator: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "white",
    bottom: 0,
    right: 0,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  drawerScroll: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  lockIcon: {
    marginLeft: 8,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  themeToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  themeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  themeTextContainer: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  themeSubtitle: {
    fontSize: 11,
  },
  themeOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  themeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 4,
    gap: 6,
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  syncSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  syncInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  syncTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  syncTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  syncSubtitle: {
    fontSize: 11,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  syncButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  infoSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  infoDescription: {
    fontSize: 11,
    textAlign: "center",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
