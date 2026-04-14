import { HapticTab } from "@/components/haptic-tab";
import { useAppTheme } from "@/context/ThemeContext";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { router, Tabs, Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View, ActivityIndicator } from "react-native";

// IMPORT FEATURE FLAGS
import {
  TAB_HOME,
  TAB_LEADS,
  TAB_TASKS,
  TAB_CONTACTS,
  TAB_ANALYTICS,
  TAB_CALENDAR,
  TAB_PROFILE,
} from "@/components/constants/FeatureFlags";

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const navigation = useAppNavigation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    verifyAuth();
  }, []);

  if (isLoading || !authChecked) {
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
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                {user?.role || "User"}
              </Text>
            </View>
          </View>
        ),
        headerRight: () => (
          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
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
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          href: TAB_HOME ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Leads Tab - href: null hides the tab */}
      <Tabs.Screen
        name="leads"
        options={{
          title: "Leads",
          href: TAB_LEADS ? undefined : null, // 🔥 KEY FIX
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "trending-up" : "trending-up-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Tasks Tab */}
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          href: TAB_TASKS ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "checkmark-circle" : "checkmark-circle-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Contacts Tab */}
      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          href: TAB_CONTACTS ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Analytics Tab */}
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          href: TAB_ANALYTICS ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Calendar Tab */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          href: TAB_CALENDAR ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          href: TAB_PROFILE ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden Screens */}
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
  );
}
