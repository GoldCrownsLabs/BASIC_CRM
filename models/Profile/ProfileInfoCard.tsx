import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

interface ProfileInfoCardProps {
  user: any;
  onEditProfile: () => void;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  user,
  onEditProfile,
}) => {
  const { colors } = useAppTheme();

  const formatData = (value: any, fallback: string = "N/A") => {
    if (!value || value === "" || value === undefined || value === null) {
      return fallback;
    }
    return value;
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <View style={{ position: "relative", marginRight: 20 }}>
          <Image
            source={{
              uri:
                user?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || "User",
                )}&background=2196F3&color=fff`,
            }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              borderWidth: 3,
              borderColor: colors.primary,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: user?.isActive ? colors.success : colors.error,
              borderWidth: 2,
              borderColor: colors.card,
            }}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: colors.text,
              marginBottom: 4,
            }}
          >
            {formatData(user?.name || "N/A")}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: 8,
            }}
          >
            {user?.email || "N/A"}
          </Text>
          <View
            style={{
              alignSelf: "flex-start",
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              backgroundColor: user?.isActive
                ? `${colors.success}20`
                : `${colors.error}20`,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: user?.isActive ? colors.success : colors.error,
              }}
            >
              {user?.isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={{
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: colors.primary,
          alignItems: "center",
        }}
        onPress={onEditProfile}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>
          Edit Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};
