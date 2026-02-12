import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



interface CommonHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightIcon?: React.ReactNode;
  onBackPress?: () => void;
  onRightPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  showSafeArea?: boolean;
}

export default function CommonHeader({
  title,
  showBackButton = true,
  rightIcon,
  onBackPress,
  onRightPress,
  backgroundColor,
  textColor,
  showSafeArea = true,
}: CommonHeaderProps) {
  const { colors } = useAppTheme();
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const bgColor = backgroundColor || colors.background;
  const txtColor = textColor || colors.text;

  const HeaderContent = () => (
    <View style={styles.headerContainer}>
      {/* Left Section */}
      <View style={styles.sideContainer}>
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBack}
            style={[
              styles.backButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={txtColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center Section - Title */}
      <View style={styles.centerContainer}>
        <ThemedText
          type="subtitle"
          style={[styles.title, { color: txtColor }]}
          numberOfLines={1}
        >
          {title}
        </ThemedText>
      </View>

      {/* Right Section */}
      <View style={styles.sideContainer}>
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            style={styles.rightButton}
            activeOpacity={0.7}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {showSafeArea ? (
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <HeaderContent />
        </SafeAreaView>
      ) : (
        <HeaderContent />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  safeArea: {
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 60, // Fixed height
  },
  sideContainer: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  rightButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});