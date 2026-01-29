import React from "react";
import { View } from "react-native";
import { Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface PersonalInfoCardProps {
  user: any;
}

export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ user }) => {
  const { colors } = useAppTheme();

  const formatData = (value: any, fallback: string = "N/A") => {
    if (!value || value === "" || value === undefined || value === null) {
      return fallback;
    }
    return value;
  };

  const InfoItem = ({ icon, label, value }: any) => (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: `${colors.primary}20`,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
        }}
      >
        <Feather name={icon} size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}
        >
          {label}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
          {formatData(value)}
        </Text>
      </View>
    </View>
  );

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.text,
          marginBottom: 20,
        }}
      >
        Personal Information
      </Text>

      <InfoItem icon="mail" label="Email" value={user?.email} />
      <InfoItem icon="shield" label="Role" value={user?.role} />
      <InfoItem
        icon="check-circle"
        label="Email Verified"
        value={user?.emailVerified ? "Verified" : "Not Verified"}
      />
      <InfoItem
        icon="calendar"
        label="Member Since"
        value={
          user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : "N/A"
        }
      />
      <InfoItem
        icon="clock"
        label="Last Login"
        value={
          user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "N/A"
        }
      />
    </View>
  );
};
