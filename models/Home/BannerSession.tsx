import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";



const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 200;
const AUTO_SCROLL_INTERVAL = 3500;

const BannerSession: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const bannerData = [
    {
      id: "1",
      title: "Smart Customer Hub",
      description: "AI-powered deep insights",
      badge: "NEW",
      icon: "✨",
      color: "#0f172a",
      image: "https://img.icons8.com/fluency/96/customer-insight.png",
    },
    {
      id: "2",
      title: "Deal Intelligence",
      description: "Close deals 40% faster",
      badge: "HOT",
      icon: "🎯",
      color: "#1e1b4b",
      image: "https://img.icons8.com/fluency/96/sales-performance.png",
    },
    {
      id: "3",
      title: "Growth Metrics",
      description: "Live predictive analytics",
      badge: "LIVE",
      icon: "📊",
      color: "#111827",
      image: "https://img.icons8.com/fluency/96/analytics.png",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex =
        currentIndex === bannerData.length - 1 ? 0 : currentIndex + 1;

      Animated.sequence([
        Animated.timing(flipAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(flipAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        setCurrentIndex(nextIndex);
      }, 300);
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [currentIndex]);
 
  const getFrontRotation = () => {
    switch (currentIndex % 4) {
      case 0: // Right ➝ Left
        return flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        });
      case 1: // Left ➝ Right
        return flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "-180deg"],
        });
      case 2: // Top ➝ Bottom
        return flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        });
      case 3: // Bottom ➝ Top
        return flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "-180deg"],
        });
      default:
        return "0deg";
    }
  };

  const getBackRotation = () => {
    switch (currentIndex % 4) {
      case 0:
        return flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["180deg", "360deg"],
        });
      case 1:
        return flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["-180deg", "-360deg"],
        });
      case 2:
        return flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["180deg", "360deg"],
        });
      case 3:
        return flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["-180deg", "-360deg"],
        });
      default:
        return "0deg";
    }
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const item = bannerData[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.cardWrapper}>
        {/* FRONT */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: item.color,
              transform: [
                { perspective: 1000 },
                currentIndex % 4 < 2
                  ? { rotateY: getFrontRotation() }
                  : { rotateX: getFrontRotation() },
              ],
            },
          ]}
        >
          <View style={styles.row}>
            <Text style={styles.chip}>▣</Text>
            <Text style={styles.badge}>{item.badge}</Text>
          </View>

          <Text style={styles.title}>{item.title}</Text>

          <View style={styles.bottomRow}>
            <Text style={styles.description}>{item.description}</Text>
            <Image source={{ uri: item.image }} style={styles.image} />
          </View>
        </Animated.View>

        {/* BACK */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            {
              backgroundColor: "#000",
              transform: [
                { perspective: 1000 },
                currentIndex % 4 < 2
                  ? { rotateY: getBackRotation() }
                  : { rotateX: getBackRotation() },
              ],
            },
          ]}
        >
          <Text style={styles.backTitle}>CRM Intelligence</Text>
          <Text style={styles.backText}>Secure • Smart • Scalable</Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default BannerSession;

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 20,
    padding: 20,
    backfaceVisibility: "hidden",
    justifyContent: "space-between",
    elevation: 10,
  },
  cardBack: {
    position: "absolute",
    top: 0,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chip: {
    fontSize: 26,
    color: "#facc15",
  },
  badge: {
    color: "#e5e7eb",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  description: {
    fontSize: 13,
    color: "#9ca3af",
    flex: 0.6,
  },
  image: {
    width: 70,
    height: 70,
  },
  backTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  backText: {
    fontSize: 13,
    color: "#9ca3af",
  },
});
