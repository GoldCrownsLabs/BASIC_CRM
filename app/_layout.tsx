// app/_layout.tsx
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';

import CustomDrawerContent from '@/components/CustomDrawerContent';
import { AppThemeProvider, useAppTheme } from '@/contaxt/ThemeContext';

function AppContent() {
  const { isDark } = useAppTheme();

  return (
    <>
      <Drawer
        drawerContent={CustomDrawerContent}
        screenOptions={{
          headerShown: false,
          drawerPosition: 'left',
          swipeEnabled: true,
          drawerStyle: {
            backgroundColor: 'transparent',
          },
        }}
      >
        {/* MAIN APP (Bottom Tabs live here) */}
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: 'Home',
            drawerLabel: 'Dashboard',
          }}
        />

        {/* TOOLS (NO TAB, BUT TABS STILL VISIBLE) */}
        <Drawer.Screen
          name="tools"
          options={{
            title: 'Tools',
            drawerLabel: 'Tools',
          }}
        />

        {/* AUTH (HIDDEN FROM DRAWER) */}
        <Drawer.Screen
          name="(auth)"
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />

        {/* OPTIONAL */}
        <Drawer.Screen
          name="index"
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
      </Drawer>

      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AppContent />
    </AppThemeProvider>
  );
}
