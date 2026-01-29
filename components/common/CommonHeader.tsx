import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CommonHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightIcon?: React.ReactNode;
  onBackPress?: () => void;
  onRightPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
}

export default function CommonHeader({
  title,
  showBackButton = true,
  rightIcon,
  onBackPress,
  onRightPress,
  backgroundColor,
  textColor,
  showSafeArea = true, // Add this prop
}: CommonHeaderProps & { showSafeArea?: boolean }) {
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
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        height: 60,
      }}
    >
      {/* Left Section */}
      <View style={{ width: 40 }}>
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBack}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.card,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={txtColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center Section - Title */}
      <View style={{ flex: 1, alignItems: "center" }}>
        <ThemedText
          type="subtitle"
          style={{
            color: txtColor,
            fontSize: 17,
            fontWeight: "600",
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {title}
        </ThemedText>
      </View>

      {/* Right Section */}
      <View style={{ width: 40 }}>
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
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
      style={{
        backgroundColor: bgColor,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {showSafeArea ? (
        <SafeAreaView edges={["top"]}>
          <HeaderContent />
        </SafeAreaView>
      ) : (
        <HeaderContent />
      )}
    </View>
  );
}
