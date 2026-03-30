// store/auth.store.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiService } from "@/lib/api";


interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  profileImage?: string;
  lastLogin?: string | Date; // ✅ Allow both string and Date
  isActive?: boolean;
  role?: string;
  createdAt?: string | Date; // ✅ Allow both string and Date
  emailVerified?: boolean;
  newsletterSubscription?: boolean;
  theme?: string;
  addresses?: any[];
  lastSync?: string | Date; // ✅ Allow both string and Date
  updatedAt?: string | Date; // ✅ Allow both string and Date
  phone?: string;
  company?: string;
  position?: string;
  department?: string;
  location?: string;
  bio?: string;
  _id?: string;
  status?: string;
  joinDate?: string | Date; // ✅ Allow both string and Date
}
interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth methods
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  refreshToken: () => Promise<boolean>;

  // Setters
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setAuthenticated: (status: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ==================== AUTH METHODS ====================

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          console.log("🔐 AuthStore: Attempting login...");

          const response = await apiService.login(email, password);

          if (response.success && response.data) {
            const { user, token } = response.data;

            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            await apiService.setAuthToken(token);
            console.log("✅ AuthStore: Login successful");
            return true;
          } else {
            set({
              isLoading: false,
              error: response.message || "Login failed",
            });
            return false;
          }
        } catch (error: any) {
          console.error("❌ AuthStore: Login error:", error);
          set({
            isLoading: false,
            error: error.message || "Login failed",
          });
          return false;
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await apiService.post(
            "/auth/register",
            { name, email, password },
            { _skipAuth: true },
          );

          if (response.success && response.data) {
            const { user, token } = response.data;
            await apiService.setAuthToken(token);
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.message || "Registration failed",
            });
            return false;
          }
        } catch (error: any) {
          console.error("Registration error:", error);
          set({
            isLoading: false,
            error: error.message || "Registration failed. Please try again.",
          });
          return false;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await apiService.clearAuthToken();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          router.replace("/(auth)/login");
          console.log("Logout successful");
        } catch (error) {
          console.error("Logout error:", error);
          set({ isLoading: false });
        }
      },

      checkAuth: async () => {
        try {
          const { user, token } = get();
          const isAuthenticated = !!(
            user &&
            token &&
            (await apiService.isAuthenticated())
          );
          set({ isAuthenticated });
          return isAuthenticated;
        } catch (error) {
          console.error("Auth check error:", error);
          return false;
        }
      },

      refreshToken: async () => {
        try {
          const { token } = get();
          if (!token) return false;

          const response = await apiService.post(
            "/auth/refresh",
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          );

          if (response.success && response.data?.token) {
            const newToken = response.data.token;
            await apiService.setAuthToken(newToken);
            set({ token: newToken, user: response.data.user || get().user });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Token refresh failed:", error);
          return false;
        }
      },

      // ==================== SETTERS ====================

      setToken: (token: string | null) => {
        set({ token });
        if (token) apiService.setAuthToken(token);
      },

      setUser: (user: User | null) => set({ user }),

      setAuthenticated: (status: boolean) => set({ isAuthenticated: status }),

      setError: (error: string | null) => set({ error }),

      clearError: () => set({ error: null }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!(state.user && state.token);
        }
      },
    },
  ),
);

export const initializeAuth = async () => {
  const { checkAuth } = useAuthStore.getState();
  return await checkAuth();
};
