import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

interface TopContactData {
  id: string;
  name: string;
  company: string;
  status: string;
  activities: number;
  value: string;
}

interface TopContactsProps {
  topContacts: TopContactData[];
}

const TopContacts: React.FC<TopContactsProps> = ({ topContacts }) => {
  const { colors, isDark } = useAppTheme();

  if (!topContacts?.length) return null;

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.1 : 0.05,
        shadowRadius: 8,
        elevation: isDark ? 4 : 2,
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
        <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text }}>
          Top Contacts
        </Text>
        <TouchableOpacity>
          <Feather
            name="more-vertical"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: width - 72, gap: 12 }}>
          {topContacts.map((contact) => {
            const statusBgColor = isDark
              ? contact.status === "hot"
                ? "rgba(248, 113, 113, 0.2)"
                : contact.status === "warm"
                  ? "rgba(251, 191, 36, 0.2)"
                  : colors.border
              : contact.status === "hot"
                ? "#FEE2E2"
                : contact.status === "warm"
                  ? "#FEF3C7"
                  : "#E5E7EB";

            const statusColor = isDark
              ? contact.status === "hot"
                ? "#F87171"
                : contact.status === "warm"
                  ? "#FBBF24"
                  : colors.textSecondary
              : contact.status === "hot"
                ? "#DC2626"
                : contact.status === "warm"
                  ? "#D97706"
                  : "#6B7280";

            return (
              <View
                key={contact.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 12,
                  backgroundColor: isDark ? colors.border : "#F9FAFB",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.primary,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#FFFFFF",
                    }}
                  >
                    {contact.name.charAt(0)}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.text,
                    }}
                  >
                    {contact.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {contact.company}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: statusBgColor,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      marginBottom: 4,
                    }}
                  >
                    <Feather name="activity" size={12} color={statusColor} />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        marginLeft: 4,
                        color: statusColor,
                      }}
                    >
                      {contact.activities}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: isDark ? "#34D399" : "#059669",
                    }}
                  >
                    {contact.value}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default TopContacts;
