// hooks/useAppLoading.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const SPLASH_KEY = '@app_splash_shown_v2';

export const useAppLoading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Simulate minimum loading time (2 seconds minimum)
        const minLoadTime = 2000;
        const startTime = Date.now();

        // Check if we should show splash (only once per day)
        const lastShown = await AsyncStorage.getItem(SPLASH_KEY);
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (lastShown) {
          const lastShownTime = parseInt(lastShown);
          if (now - lastShownTime < oneDay) {
            // Don't show splash if shown within 24 hours
            setShowSplash(false);
          }
        } else {
          // First time, show splash and mark as shown
          await AsyncStorage.setItem(SPLASH_KEY, now.toString());
        }

        // Calculate remaining time to reach minimum load time
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadTime - elapsed);

        // Wait for minimum load time
        setTimeout(() => {
          // Only proceed if animation is complete
          if (isAnimationComplete || !showSplash) {
            setIsLoading(false);
          }
        }, remainingTime);

      } catch (error) {
        console.error('Error initializing app:', error);
        setShowSplash(true);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [isAnimationComplete, showSplash]);

  const handleSplashComplete = () => {
    setIsAnimationComplete(true);
    
    // If app is already loaded, hide splash immediately
    if (!isLoading) {
      setShowSplash(false);
    }
  };

  // Check if we should hide everything
  useEffect(() => {
    if (isAnimationComplete && !isLoading) {
      // Small delay before actually hiding to ensure smooth transition
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isAnimationComplete, isLoading]);

  return { 
    isLoading: isLoading || (showSplash && !isAnimationComplete), 
    showSplash, 
    handleSplashComplete 
  };
};