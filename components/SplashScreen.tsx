// components/SplashScreen.tsx
import { useAppTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const { colors, isDark } = useAppTheme();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const crownScale = useRef(new Animated.Value(0.5)).current;
  const crownRotateY = useRef(new Animated.Value(0)).current;
  const crownShine = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const goldParticlesAnim = useRef(new Animated.Value(0)).current;

  // Gold particles
  const goldParticles = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      scale: new Animated.Value(0),
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    // Main animation sequence
    const animationSequence = Animated.sequence([
      // Initial fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // Crown appears with shine
      Animated.parallel([
        Animated.spring(crownScale, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(crownRotateY, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(crownShine, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // Glow effect around crown
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),

      // Gold particles explosion
      Animated.timing(goldParticlesAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false, // ✅
      }),

      // Text animation
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      // Hold for a moment
      Animated.delay(800),

      // Final fade out with scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Animate gold particles
    goldParticles.forEach((particle, index) => {
      const angle = index * (360 / goldParticles.length) * (Math.PI / 180);
      const radius = 120;

      Animated.sequence([
        Animated.delay(800 + index * 30),
        Animated.parallel([
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateX, {
            toValue: Math.cos(angle) * radius,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateY, {
            toValue: Math.sin(angle) * radius,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 400,
            delay: 200,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 0.5,
            duration: 400,
            delay: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });

    // Start main animation
    animationSequence.start(() => {
      onAnimationComplete();
    });

    return () => {
      animationSequence.stop();
    };
  }, []);

  // Interpolations
  const crownRotation = crownRotateY.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const shineOpacity = crownShine.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0.3],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.4],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.6, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          backgroundColor: isDark ? "#000000" : "#F8F8F8",
        },
      ]}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={
          isDark
            ? ["#0C0C0C", "#1A1A1A", "#0C0C0C"]
            : ["#FFFFFF", "#F5F5F5", "#FFFFFF"]
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Glow Effect Around Crown */}
      <Animated.View
        style={[
          styles.glowEffect,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
            backgroundColor: "#FFD700",
          },
        ]}
      />

      {/* Crown Container */}
      <View style={styles.crownContainer}>
        {/* Crown Shadow */}
        <View
          style={[
            styles.crownShadow,
            {
              backgroundColor: isDark
                ? "rgba(255,215,0,0.1)"
                : "rgba(0,0,0,0.1)",
            },
          ]}
        />

        {/* Animated Crown */}
        <Animated.View
          style={[
            styles.crownWrapper,
            {
              transform: [{ scale: crownScale }, { rotateY: crownRotation }],
            },
          ]}
        >
          {/* Crown Main */}
          <View style={styles.crownMain}>
            {/* Crown Base */}
            <View style={[styles.crownBase, { backgroundColor: "#FFD700" }]} />

            {/* Crown Jewels */}
            <View style={styles.crownJewels}>
              <View
                style={[
                  styles.jewel,
                  styles.jewelCenter,
                  { backgroundColor: "#FF6B6B" },
                ]}
              />
              <View
                style={[
                  styles.jewel,
                  styles.jewelLeft,
                  { backgroundColor: "#4ECDC4" },
                ]}
              />
              <View
                style={[
                  styles.jewel,
                  styles.jewelRight,
                  { backgroundColor: "#45B7D1" },
                ]}
              />
            </View>

            {/* Crown Points */}
            <View style={styles.crownPoints}>
              {[1, 2, 3, 4, 5].map((point) => (
                <View
                  key={point}
                  style={[styles.crownPoint, { backgroundColor: "#FFD700" }]}
                />
              ))}
            </View>

            {/* Crown Shine Effect */}
            <Animated.View
              style={[
                styles.crownShine,
                {
                  opacity: shineOpacity,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  transform: [{ rotate: "45deg" }],
                },
              ]}
            />
          </View>
        </Animated.View>

        {/* Gold Particles */}
        <View style={styles.particlesContainer}>
          {goldParticles.map((particle) => (
            <Animated.View
              key={particle.id}
              style={[
                styles.goldParticle,
                {
                  backgroundColor: "#FFD700",
                  transform: [
                    { scale: particle.scale },
                    { translateY: particle.translateY },
                    { translateX: particle.translateX },
                  ],
                  opacity: particle.opacity,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Company Name */}
      <Animated.View style={[styles.textContainer, { opacity: textAnim }]}>
        <View style={styles.nameContainer}>
          <Text style={[styles.goldText, { color: "#FFD700" }]}>Gold</Text>
          <Text
            style={[
              styles.crownText,
              { color: isDark ? "#FFFFFF" : "#333333" },
            ]}
          >
            Crown
          </Text>
          <Text
            style={[styles.labText, { color: isDark ? "#CCCCCC" : "#666666" }]}
          >
            Lab
          </Text>
        </View>

        <Text
          style={[styles.tagline, { color: isDark ? "#AAAAAA" : "#777777" }]}
        >
          Excellence in Innovation
        </Text>
      </Animated.View>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <View
          style={[
            styles.loadingBar,
            { backgroundColor: isDark ? "#333333" : "#E0E0E0" },
          ]}
        >
          <Animated.View
            style={[
              styles.loadingFill,
              {
                backgroundColor: "#FFD700",
                width: goldParticlesAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  glowEffect: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  crownContainer: {
    position: "relative",
    marginBottom: 40,
  },
  crownShadow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    top: 10,
    alignSelf: "center",
    zIndex: -1,
  },
  crownWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "visible",
  },
  crownMain: {
    width: 100,
    height: 80,
    position: "relative",
  },
  crownBase: {
    width: 100,
    height: 30,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    position: "absolute",
    bottom: 0,
  },
  crownJewels: {
    position: "absolute",
    top: 10,
    width: "100%",
    height: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  jewel: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: "absolute",
  },
  jewelCenter: {
    top: 0,
    alignSelf: "center",
  },
  jewelLeft: {
    left: 15,
    top: 5,
  },
  jewelRight: {
    right: 15,
    top: 5,
  },
  crownPoints: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    top: -25,
    width: "100%",
    paddingHorizontal: 8,
  },
  crownPoint: {
    width: 16,
    height: 25,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  crownShine: {
    position: "absolute",
    width: 30,
    height: 120,
    top: -20,
    left: 35,
  },
  particlesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  goldParticle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  goldText: {
    fontSize: 42,
    fontWeight: "900",
    textShadowColor: "rgba(255, 215, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  crownText: {
    fontSize: 38,
    fontWeight: "800",
    marginHorizontal: 4,
    letterSpacing: 1,
  },
  labText: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 2,
    marginTop: 4,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 100,
    width: "70%",
    alignItems: "center",
  },
  loadingBar: {
    width: "100%",
    height: 3,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  loadingFill: {
    height: "100%",
    borderRadius: 1.5,
  },
});

export default SplashScreen;
