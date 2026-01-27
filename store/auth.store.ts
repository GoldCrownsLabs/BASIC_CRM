import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiService } from "@/lib/api";

// Updated User interface with all properties
interface User {
  id: string;

  email: string;
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
  name?: string;
  // Add other properties that might come from API
  [key: string]: any; // Optional: for any additional properties
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
          console.log("Attempting login with:", { email });

          // API call to your backend
          const response = await apiService.post<{
            user: User;
            token: string;
            message?: string;
          }>("/auth/login", { email, password });

          console.log("Login response:", response);

          if (response.success && response.data) {
            const { user, token } = response.data;

            // Store in state
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            console.log("Login successful for:", user.email);
            return true;
          } else {
            // Handle API error
            const errorMessage = response.message || "Login failed";
            set({
              isLoading: false,
              error: errorMessage,
            });

            console.error("Login failed:", errorMessage);
            return false;
          }
        } catch (error: any) {
          console.error("Login error:", error);

          // Fallback to mock login if API fails (for development)
          console.log("Falling back to mock login...");

          const mockUser: User = {
            id: "1",
            name: email.split("@")[0] || "Demo User",
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split("@")[0] || "User")}&background=2196F3&color=fff`,
            profileImage: "",
            lastLogin: new Date().toISOString(),
            isActive: true,
            role: "user",
            createdAt: new Date().toISOString(),
            emailVerified: false,
            newsletterSubscription: false,
            theme: "light",
            addresses: [],
            lastSync: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockToken = "demo-token-" + Date.now();

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log("Mock login successful");
          return true;
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          console.log("Attempting registration:", { name, email });

          // API call to register endpoint
          const response = await apiService.post<{
            user: User;
            token: string;
            message?: string;
          }>("/auth/register", { name, email, password });

          console.log("Register response:", response);

          if (response.success && response.data) {
            const { user, token } = response.data;

            // Store in state
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            console.log("Registration successful for:", user.email);
            return true;
          } else {
            // Handle API error
            const errorMessage = response.message || "Registration failed";
            set({
              isLoading: false,
              error: errorMessage,
            });

            console.error("Registration failed:", errorMessage);
            return false;
          }
        } catch (error: any) {
          console.error("Registration error:", error);

          // Fallback to mock registration if API fails (for development)
          console.log("Falling back to mock registration...");

          const mockUser: User = {
            id: Date.now().toString(),
            name: name,
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4CAF50&color=fff`,
            profileImage: "",
            lastLogin: new Date().toISOString(),
            isActive: true,
            role: "user",
            createdAt: new Date().toISOString(),
            emailVerified: false,
            newsletterSubscription: false,
            theme: "light",
            addresses: [],
            lastSync: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockToken = "demo-token-" + Date.now();

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log("Mock registration successful");
          return true;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          // Clear state first
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          // Clear persisted storage
          await AsyncStorage.removeItem("auth-storage");

          // Navigate to login
          router.replace("/(auth)/login");
        } catch (error) {
          console.error("Logout error:", error);
          set({ isLoading: false });
        }
      },

      checkAuth: async () => {
        try {
          const state = get();
          const isAuthenticated = !!(state.user && state.token);

          // Sync isAuthenticated with user/token state
          if (isAuthenticated !== state.isAuthenticated) {
            set({ isAuthenticated });
          }

          return isAuthenticated;
        } catch (error) {
          console.error("Auth check error:", error);
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      // On rehydrate, set isAuthenticated based on user/token
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!(state.user && state.token);
        }
      },
    },
  ),
);

// Check auth on app start
export const initializeAuth = async () => {
  const { checkAuth } = useAuthStore.getState();
  return await checkAuth();
};
