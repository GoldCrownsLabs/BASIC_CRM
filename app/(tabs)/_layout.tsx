import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/contaxt/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAuthStore } from '@/store/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Text, View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuthStore();
  const navigation = useAppNavigation();

  const openDrawer = () => {
    navigation.openDrawer();
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        headerLeft: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name="menu"
              size={28}
              color={Colors[colorScheme ?? 'light'].tint}
              style={{ marginLeft: 15 }}
              onPress={openDrawer}
            />
            {user && (
              <View style={{ marginLeft: 15 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: Colors[colorScheme ?? 'light'].text,
                  }}>
                  {user.name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors[colorScheme ?? 'light'].tabIconDefault,
                  }}>
                  {user.email}
                </Text>
              </View>
            )}
          </View>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
            {user?.avatar && (
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 36, height: 36, borderRadius: 18 }}
              />
            )}
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{
          title: 'Leads',
          tabBarIcon: ({ color }) => (
            <Ionicons name="trending-up-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => (
            <Ionicons name="checkmark-circle-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}