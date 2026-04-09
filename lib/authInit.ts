// lib/authInit.ts
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";

// This ensures WebBrowser is initialized only once
let isInitialized = false;

export const initializeAuthModules = () => {
  if (isInitialized) return;

  if (Platform.OS !== "web") {
    WebBrowser.maybeCompleteAuthSession();
  }

  isInitialized = true;
  console.log("✅ Auth modules initialized once");
};

// Get redirect URI once and cache it
let cachedRedirectUri: string | null = null;

export const getRedirectUri = (): string => {
  if (cachedRedirectUri) return cachedRedirectUri;

  // Your app's redirect URI scheme
  const scheme = "yourapp"; // Change this to your app's scheme
  cachedRedirectUri = `${scheme}://auth-callback`;

  return cachedRedirectUri;
};
