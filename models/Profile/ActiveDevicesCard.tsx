import React from "react";
import { View } from "react-native";
import { Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

interface ActiveDevicesCardProps {
  securitySettings: any;
}

export const ActiveDevicesCard: React.FC<ActiveDevicesCardProps> = ({
  securitySettings,
}) => {
  const { colors } = useAppTheme();

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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: colors.text,
          }}
        >
          Active Devices
        </Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
          {securitySettings.devices.length} devices
        </Text>
      </View>

      {securitySettings.devices.length > 0 ? (
        securitySettings.devices.map((device: any) => (
          <View
            key={device.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
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
              <MaterialIcons
                name={device.os === "iOS" ? "phone-iphone" : "computer"}
                size={20}
                color={colors.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.text,
                }}
              >
                {device.name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                {device.os} • Last active: {device.lastActive}
              </Text>
            </View>

            {device.lastActive === "Now" && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.success,
                }}
              />
            )}
          </View>
        ))
      ) : (
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: "center",
            paddingVertical: 20,
          }}
        >
          No active devices found
        </Text>
      )}
    </View>
  );
};
