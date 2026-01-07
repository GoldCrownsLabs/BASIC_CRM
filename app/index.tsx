// app/index.tsx

import { useAppTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { checkAuth } = useAuthStore();
  const { colors } = useAppTheme(); // Get theme colors

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Check if user is logged in
    const isAuthenticated = await checkAuth();
    
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else { 
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: colors.background // Use theme background
    }}>
      <ActivityIndicator size="large" color={colors.primary} /> {/* Use theme primary color */}
    </View>
  );
}