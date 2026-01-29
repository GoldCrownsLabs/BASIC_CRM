import React from "react";
import { View, Switch } from "react-native";
import { Text } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

interface SecuritySettingsCardProps {
  securitySettings: any;
  onSecuritySettingChange: (key: string, value: boolean) => void;
}

export const SecuritySettingsCard: React.FC<SecuritySettingsCardProps> = ({
  securitySettings,
  onSecuritySettingChange,
}) => {
  const { colors } = useAppTheme();

  const settings = [
    { key: "twoFactorAuth", label: "Two-Factor Authentication" },
    { key: "emailNotifications", label: "Email Notifications" },
    { key: "pushNotifications", label: "Push Notifications" },
    { key: "smsAlerts", label: "SMS Alerts" },
    { key: "biometricLogin", label: "Biometric Login" },
  ];

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
        Security Settings
      </Text>

      {settings.map((setting) => (
        <View
          key={setting.key}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 16,
            borderBottomWidth: setting.key !== "biometricLogin" ? 1 : 0,
            borderBottomColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 16, color: colors.text }}>
            {setting.label}
          </Text>
          <Switch
            value={securitySettings[setting.key]}
            onValueChange={(value) =>
              onSecuritySettingChange(setting.key, value)
            }
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      ))}
    </View>
  );
};
