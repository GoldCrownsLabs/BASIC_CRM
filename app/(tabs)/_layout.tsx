import { HapticTab } from "@/components/haptic-tab";
import { useAppTheme } from "@/context/ThemeContext";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { user } = useAuthStore();
  const navigation = useAppNavigation();

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
        },
        headerTitleStyle: {
          fontWeight: "600",
          color: colors.text,
        },

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
              size={28}
              color={colors.primary}
              onPress={() => navigation.openDrawer()}
              style={{ marginRight: 12 }}
            />
            <View>
              <Text
                style={{ fontSize: 16, fontWeight: "bold", color: colors.text }}
              >
                Hi, {user?.name?.split(" ")[0] || "User"}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Sales Manager
              </Text>
            </View>
          </View>
        ),

        headerRight: () => (
          <View style={{ marginRight: 15 }}>
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
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {user?.name?.charAt(0) || "U"}
                </Text>
              </View>
            )}
          </View>
        ),
      }}
    >
      {/* ✅ VISIBLE TABS */}

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
      />

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
        }}
      />

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
        }}
      />
      
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
        }}
      />

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
      />

      {/* ✅ HIDE ONLY THE TOOLS GROUP */}
      {/* This will hide all routes inside (tools) group including activities and explore */}
      <Tabs.Screen name="(tools)" options={{ href: null }} />
      
      {/* Task detail screen ko bhi hide karo kyunki yeh tab par nahi aana chahiye */}
      <Tabs.Screen name="tasks/[id]" options={{ href: null }} />
    </Tabs>
  );
}