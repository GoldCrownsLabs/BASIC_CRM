// models/Profile/SecuritySettingsCard.tsx
import React from "react";
import { View, Switch, Alert } from "react-native";
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
    {
      key: "twoFactorAuth",
      label: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
      warningMessage:
        "Two-factor authentication helps protect your account from unauthorized access.",
    },
    {
      key: "emailNotifications",
      label: "Email Notifications",
      description: "Receive security alerts via email",
      warningMessage:
        "You'll receive email notifications for important account activities.",
    },
    {
      key: "pushNotifications",
      label: "Push Notifications",
      description: "Get real-time security alerts on your device",
      warningMessage:
        "Push notifications will be sent for login attempts and security changes.",
    },
    {
      key: "smsAlerts",
      label: "SMS Alerts",
      description: "Receive text messages for critical alerts",
      warningMessage: "Standard message rates may apply for SMS alerts.",
    },
  ];

  const handleToggle = (
    key: string,
    newValue: boolean,
    label: string,
    warningMessage: string,
  ) => {
    // If turning ON, show confirmation
    if (newValue === true) {
      Alert.alert(
        "Enable " + label,
        warningMessage + "\n\nAre you sure you want to enable this?",
        [
          { text: "Cancel", style: "cancel", onPress: () => {} },
          {
            text: "Enable",
            style: "default",
            onPress: () => onSecuritySettingChange(key, newValue),
          },
        ],
      );
    }
    // If turning OFF, show warning
    else {
      Alert.alert(
        "Disable " + label,
        "Are you sure you want to disable " + label.toLowerCase() + "?",
        [
          { text: "Cancel", style: "cancel", onPress: () => {} },
          {
            text: "Disable",
            style: "destructive",
            onPress: () => onSecuritySettingChange(key, newValue),
          },
        ],
      );
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: `${colors.primary}20`,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 20, color: colors.primary }}>🔒</Text>
        </View>
        <View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
            }}
          >
            Security Settings
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginTop: 2,
            }}
          >
            Manage your account security preferences
          </Text>
        </View>
      </View>

      {settings.map((setting, index) => {
        const isLast = index === settings.length - 1;

        return (
          <View
            key={setting.key}
            style={{
              paddingVertical: 16,
              borderBottomWidth: isLast ? 0 : 1,
              borderBottomColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: colors.text,
                  }}
                >
                  {setting.label}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  {setting.description}
                </Text>
              </View>
              <Switch
                value={securitySettings?.[setting.key] || false}
                onValueChange={(value) =>
                  handleToggle(
                    setting.key,
                    value,
                    setting.label,
                    setting.warningMessage,
                  )
                }
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};
