// context/AppThemeContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  useColorScheme as useRNColorScheme,
  StatusBar,
  Platform,
  StatusBarStyle,
} from "react-native";

// Theme mode types
export type ThemeMode = "light" | "dark" | "system";

export const THEME_MODES: Record<string, ThemeMode> = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

// Color interface
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  notification: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  statusBar: string;
  statusBarContent: "light" | "dark";
}

// Theme context interface
interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: (mode: ThemeMode) => Promise<void>;
  statusBarStyle: "light" | "dark";
  statusBarBackground: string;
  updateStatusBar: () => void;
}

// Light theme colors
const lightColors: ThemeColors = {
  primary: "#2196F3",
  secondary: "#FF9800",
  background: "#f8f9fa",
  card: "#ffffff",
  text: "#000000",
  textSecondary: "#666666",
  border: "#e0e0e0",
  notification: "#ff3b30",
  success: "#4CAF50",
  error: "#f44336",
  warning: "#FF9800",
  info: "#2196F3",
  statusBar: "#2196F3",
  statusBarContent: "dark",
};

// Dark theme colors
const darkColors: ThemeColors = {
  primary: "#90CAF9",
  secondary: "#FFB74D",
  background: "#121212",
  card: "#1e1e1e",
  text: "#ffffff",
  textSecondary: "#b0b0b0",
  border: "#333333",
  notification: "#cf6679",
  success: "#81C784",
  error: "#e57373",
  warning: "#FFB74D",
  info: "#64B5F6",
  statusBar: "#000000",
  statusBarContent: "light",
};

// Create context
const AppThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Navigation themes
export const getNavigationTheme = (isDark: boolean) => ({
  ...(isDark ? DarkTheme : DefaultTheme),
  colors: {
    ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
    primary: isDark ? darkColors.primary : lightColors.primary,
    background: isDark ? darkColors.background : lightColors.background,
    card: isDark ? darkColors.card : lightColors.card,
    text: isDark ? darkColors.text : lightColors.text,
    border: isDark ? darkColors.border : lightColors.border,
    notification: isDark ? darkColors.notification : lightColors.notification,
  },
});

// Provider props interface
interface AppThemeProviderProps {
  children: ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const systemColorScheme = useRNColorScheme();
  const [theme, setTheme] = useState<ThemeMode>(THEME_MODES.SYSTEM);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    loadTheme();
  }, []);

  // Update status bar when theme changes
  useEffect(() => {
    if (!isLoading) {
      updateStatusBar();
    }
  }, [theme, systemColorScheme, isLoading]);

  const loadTheme = async (): Promise<void> => {
    try {
      const savedTheme = await AsyncStorage.getItem("app-theme");
      if (
        savedTheme &&
        Object.values(THEME_MODES).includes(savedTheme as ThemeMode)
      ) {
        setTheme(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async (mode: ThemeMode): Promise<void> => {
    try {
      setTheme(mode);
      await AsyncStorage.setItem("app-theme", mode);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  // Calculate actual theme based on system preference
  const isDark: boolean =
    theme === THEME_MODES.DARK ||
    (theme === THEME_MODES.SYSTEM && systemColorScheme === "dark");

  // Get current colors based on theme
  const colors: ThemeColors = isDark ? darkColors : lightColors;

  // Get status bar style
  const statusBarStyle: "light" | "dark" = colors.statusBarContent;
  const statusBarBackground: string = colors.statusBar;

  // Update status bar with proper platform handling
  const updateStatusBar = (): void => {
    // For iOS, we just need to set the style
    if (Platform.OS === "ios") {
      StatusBar.setBarStyle(
        statusBarStyle === "dark" ? "dark-content" : "light-content",
        true,
      );
    }
    // For Android, we need to set both background and style
    else if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(statusBarBackground);
      StatusBar.setBarStyle(
        statusBarStyle === "dark" ? "dark-content" : "light-content",
        true,
      );
    }
  };

  // Get navigation theme
  const navigationTheme = getNavigationTheme(isDark);

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <AppThemeContext.Provider
      value={{
        theme,
        colors,
        isDark,
        toggleTheme,
        statusBarStyle,
        statusBarBackground,
        updateStatusBar,
      }}
    >
      <NavigationThemeProvider value={navigationTheme}>
        {children}
      </NavigationThemeProvider>
    </AppThemeContext.Provider>
  );
}

// Custom hook with error handling
export function useAppTheme(): ThemeContextType {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within an AppThemeProvider");
  }
  return context;
}

// Custom hook for status bar management
interface UseStatusBarProps {
  style?: "light" | "dark";
  backgroundColor?: string;
}

export function useStatusBar({
  style,
  backgroundColor,
}: UseStatusBarProps = {}): void {
  const { isDark, colors } = useAppTheme();

  useEffect(() => {
    const barStyle: "light" | "dark" = style || (isDark ? "light" : "dark");
    const bgColor: string = backgroundColor || colors.statusBar;

    if (Platform.OS === "ios") {
      StatusBar.setBarStyle(
        barStyle === "dark" ? "dark-content" : "light-content",
        true,
      );
    } else {
      StatusBar.setBackgroundColor(bgColor);
      StatusBar.setBarStyle(
        barStyle === "dark" ? "dark-content" : "light-content",
        true,
      );
    }
  }, [style, backgroundColor, isDark, colors]);
}
