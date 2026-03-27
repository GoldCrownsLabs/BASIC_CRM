// app/_layout.tsx
import "react-native-gesture-handler";
import "react-native-reanimated";

import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, View } from "react-native";

import CustomDrawerContent from "@/components/CustomDrawerContent";
import SplashScreen from "@/components/SplashScreen";
import { AppThemeProvider, useAppTheme } from "@/context/ThemeContext";
import { useAppLoading } from "@/hooks/useAppLoading";
import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";
import { LeadsProvider } from "@/context/LeadsContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NotificationProvider } from "@/context/NotificationContext";
import { SupportProvider } from "@/context/SupportContext";

// Separate component that uses the theme
function AppContent() {
  const { colors, isDark } = useAppTheme();
  const systemColorScheme = useColorScheme();
  const { isLoading, showSplash, handleSplashComplete } = useAppLoading();

  // ✅ Determine status bar style
  const statusBarStyle = isDark ? "light" : "dark";

  // Create custom navigation theme with required fonts
  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.notification || colors.error,
    },
    fonts: {
      regular: {
        fontFamily: "System",
        fontWeight: "400" as const,
      },
      medium: {
        fontFamily: "System",
        fontWeight: "500" as const,
      },
      bold: {
        fontFamily: "System",
        fontWeight: "700" as const,
      },
      heavy: {
        fontFamily: "System",
        fontWeight: "900" as const,
      },
    },
  };

  // Show splash screen if loading
  if (isLoading || showSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SplashScreen onAnimationComplete={handleSplashComplete} />
        <StatusBar
          style={statusBarStyle}
          backgroundColor={colors.background}
          hidden={showSplash}
        />
      </View>
    );
  }

 return (
   <NavigationThemeProvider value={navigationTheme}>
     <View style={{ flex: 1, backgroundColor: colors.background }}>
       <Drawer
         drawerContent={(props) => <CustomDrawerContent {...props} />}
         screenOptions={{
           headerShown: false,
           drawerPosition: "left",
           swipeEnabled: true,
           drawerStyle: {
             backgroundColor: "transparent",
           },
         }}
       >
         {/* MAIN APP */}
         <Drawer.Screen
           name="(tabs)"
           options={{ title: "Home", drawerLabel: "Dashboard" }}
         />

         {/* ✅ ADD THIS - Auth Callback (Hidden) */}
         <Drawer.Screen
           name="auth-callback"
           options={{
             drawerItemStyle: { display: "none" },
             title: "Authenticating...",
           }}
         />

         {/* Payment Screens */}
         <Drawer.Screen
           name="checkout"
           options={{ drawerItemStyle: { display: "none" } }}
         />
         <Drawer.Screen
           name="subscription"
           options={{ title: "My Subscriptions", drawerLabel: "Subscriptions" }}
         />

         {/* Auth Screens */}
         <Drawer.Screen
           name="(auth)/login"
           options={{ drawerItemStyle: { display: "none" } }}
         />
         <Drawer.Screen
           name="(auth)/register"
           options={{ drawerItemStyle: { display: "none" } }}
         />

         {/* Other Routes */}
         <Drawer.Screen
           name="index"
           options={{ drawerItemStyle: { display: "none" } }}
         />
         <Drawer.Screen
           name="modal"
           options={{ drawerLabel: "Modal", title: "Modal" }}
         />
       </Drawer>

       <StatusBar style={statusBarStyle} backgroundColor={colors.background} />
     </View>
   </NavigationThemeProvider>
 );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <SafeAreaProvider>
        <LeadsProvider>
          <SupportProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </SupportProvider>
        </LeadsProvider>
      </SafeAreaProvider>
    </AppThemeProvider>
  );
}
