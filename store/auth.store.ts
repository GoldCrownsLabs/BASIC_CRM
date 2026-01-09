import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { create } from 'zustand';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      // ✅ DIRECT LOGIN - Accepts any email/password
      console.log('Logging in with:', { email, password });
      
      const mockUser = {
        id: '1',
        name: email.split('@')[0] || 'Demo User',
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0] || 'User')}&background=2196F3&color=fff`,
      };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('token', 'demo-token-' + Date.now());
      await AsyncStorage.setItem('email', email);
      
      set({ user: mockUser, isAuthenticated: true });
      console.log('Login successful for:', email);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('email');
      set({ user: null, isAuthenticated: false });
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  checkAuth: async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      if (user && token) {
        set({ user: JSON.parse(user), isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },
}));