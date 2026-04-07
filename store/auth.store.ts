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
  lastLogin?: string | Date;
  isActive?: boolean;
  role?: string;
  createdAt?: string | Date;
  emailVerified?: boolean;
  newsletterSubscription?: boolean;
  theme?: string;
  addresses?: any[];
  lastSync?: string | Date;
  updatedAt?: string | Date;
  phone?: string;
  company?: string;
  position?: string;
  department?: string;
  location?: string;
  bio?: string;
  _id?: string;
  status?: string;
  joinDate?: string | Date;
  provider?: "email" | "google" | "facebook";
  facebookId?: string;
  googleId?: string;
}

interface SocialLoginData {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  provider: "google" | "facebook";
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
  socialLogin: (
    userData: SocialLoginData,
    provider: "google" | "facebook",
  ) => Promise<boolean>;
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
          console.error("❌ Registration error:", error);
          set({
            isLoading: false,
            error: error.message || "Registration failed. Please try again.",
          });
          return false;
        }
      },

      socialLogin: async (
        userData: SocialLoginData,
        provider: "google" | "facebook",
      ) => {
        try {
          set({ isLoading: true, error: null });
          console.log(`🔐 AuthStore: Attempting ${provider} login...`);

          // Prepare data for backend
          const backendData = {
            provider,
            providerId: userData.id,
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
            accessToken: userData.accessToken,
          };

          // First attempt: Try to login existing user
          const response = await apiService.post(
            "/auth/social-login",
            backendData,
            {
              _skipAuth: true,
            },
          );

          if (response.success && response.data) {
            const { user, token } = response.data;

            // Add provider info to user object
            const userWithProvider = {
              ...user,
              provider,
              [`${provider}Id`]: userData.id,
            };

            set({
              user: userWithProvider,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            await apiService.setAuthToken(token);
            console.log(`✅ AuthStore: ${provider} login successful`);
            return true;
          } else {
            throw new Error(response.message || `${provider} login failed`);
          }
        } catch (error: any) {
          console.error(`❌ AuthStore: ${provider} login error:`, error);

          // If user doesn't exist, try to create a new account
          if (
            error.message?.includes("User not found") ||
            error.status === 404 ||
            error.message?.includes("User doesn't exist") ||
            error.message?.includes("Couldn't find your account")
          ) {
            console.log(
              `📝 User not found, creating new ${provider} account...`,
            );

            try {
              // Attempt to register the user
              const registerResponse = await apiService.post(
                "/auth/social-register",
                {
                  provider,
                  providerId: userData.id,
                  email: userData.email,
                  name: userData.name,
                  picture: userData.picture,
                  accessToken: userData.accessToken,
                },
                {
                  _skipAuth: true,
                },
              );

              if (registerResponse.success && registerResponse.data) {
                const { user, token } = registerResponse.data;

                const userWithProvider = {
                  ...user,
                  provider,
                  [`${provider}Id`]: userData.id,
                };

                set({
                  user: userWithProvider,
                  token,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                });

                await apiService.setAuthToken(token);
                console.log(
                  `✅ AuthStore: ${provider} account created and logged in`,
                );
                return true;
              } else {
                throw new Error(
                  registerResponse.message ||
                    `Failed to create ${provider} account`,
                );
              }
            } catch (registerError: any) {
              console.error(
                `❌ AuthStore: ${provider} account creation error:`,
                registerError,
              );
              set({
                isLoading: false,
                error:
                  registerError.message ||
                  `Failed to create ${provider} account. Please try again.`,
              });
              return false;
            }
          }

          // Handle other errors
          set({
            isLoading: false,
            error:
              error.message || `${provider} login failed. Please try again.`,
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
          console.log("✅ Logout successful");
        } catch (error) {
          console.error("❌ Logout error:", error);
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
          console.error("❌ Auth check error:", error);
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
          console.error("❌ Token refresh failed:", error);
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
