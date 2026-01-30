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
  lastLogin?: string;
  isActive?: boolean;
  role?: string;
  createdAt?: string;
  emailVerified?: boolean;
  newsletterSubscription?: boolean;
  theme?: string;
  addresses?: any[];
  lastSync?: string;
  updatedAt?: string;
  phone?: string;
  company?: string;
  position?: string;
  department?: string;
  location?: string;
  bio?: string;
  _id?: string;
  status?: string;
  joinDate?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  refreshToken: () => Promise<boolean>;
  // ✅ ADDED: Missing functions
  setToken: (token: string) => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          console.log("🔐 AuthStore: Attempting login...");

          // Use apiService.login() for login
          const response = await apiService.login(email, password);

          console.log("AuthStore Login response:", response);

          if (response.success && response.data) {
            const { user, token } = response.data;

            // Update state
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Ensure token is saved in apiService too
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

          // Use apiService.post() with _skipAuth config
          const response = await apiService.post(
            "/auth/register",
            { name, email, password },
            { _skipAuth: true },
          );

          console.log("Register response:", response);

          if (response.success && response.data) {
            const { user, token } = response.data;

            // Store token using apiService
            await apiService.setAuthToken(token);

            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            console.log("Registration successful");
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

          // Clear auth tokens
          await apiService.clearAuthToken();

          // Clear state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          // Navigate to login
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

            set({
              token: newToken,
              user: response.data.user || get().user,
            });

            return true;
          }
          return false;
        } catch (error) {
          console.error("Token refresh failed:", error);
          return false;
        }
      },

      // ✅ ADDED: setToken function
      setToken: (token: string) => {
        set({ token });
        // Also update the apiService token
        apiService.setAuthToken(token);
      },

      // ✅ ADDED: setUser function
      setUser: (user: User | null) => {
        set({ user });
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!(state.user && state.token);
        }
      },
    },
  ),
);
// Initialize auth
export const initializeAuth = async () => {
  const { checkAuth } = useAuthStore.getState();
  return await checkAuth();
};