// app/_layout.tsx
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import 'react-native-reanimated';



import CustomDrawerContent from '@/components/CustomDrawerContent';
import { AppThemeProvider, useAppTheme } from '@/contaxt/ThemeContext';

// Inner component जो theme का उपयोग करेगा
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
        <Drawer.Screen 
          name="(tabs)" 
          options={{
            title: 'Home',
            drawerLabel: 'Dashboard',
          }}
        />
        <Drawer.Screen 
          name="(auth)" 
          options={{
            title: 'Auth',
            drawerLabel: 'Authentication',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen 
          name="index" 
          options={{
            title: 'Loading',
            drawerLabel: 'Loading Screen',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen 
          name="modal" 
          options={{
            title: 'Modal',
            drawerLabel: 'Modal',
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