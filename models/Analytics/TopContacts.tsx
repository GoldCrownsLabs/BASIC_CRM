import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { getStageLabel } from "@/utils/leads.utils";

const { width } = Dimensions.get("window");

interface TopContactData {
  id: string;
  name: string;
  company: string;
  status: string; // lead status like "new", "contacted", etc.
  activities: number;
  value: string;
}

interface TopContactsProps {
  topContacts: TopContactData[];
}

const TopContacts: React.FC<TopContactsProps> = ({ topContacts }) => {
  const { colors, isDark } = useAppTheme();

  // Stage colors mapping
  const stageColors: Record<string, string> = {
    New: isDark ? "#60A5FA" : "#3B82F6",
    Contacted: isDark ? "#34D399" : "#10B981",
    Qualified: isDark ? "#FBBF24" : "#F59E0B",
    Proposal: isDark ? "#A78BFA" : "#8B5CF6",
    Negotiation: isDark ? "#F87171" : "#EF4444",
    Won: isDark ? "#10B981" : "#059669",
    Lost: isDark ? "#9CA3AF" : "#6B7280",
  };

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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {topContacts.map((contact) => {
          // Get proper stage label from status
          const stageLabel = getStageLabel(contact.status) || "New";
          const stageColor = stageColors[stageLabel] || colors.primary;

          // Use contact name initials
          const initials = contact.name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <View
              key={contact.id}
              style={{
                width: width * 0.7,
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.02)",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: stageColor + "20",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: stageColor,
                  }}
                >
                  {initials}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                  numberOfLines={1}
                >
                  {contact.name}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <Feather
                    name="briefcase"
                    size={12}
                    color={colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                    }}
                    numberOfLines={1}
                  >
                    {contact.company}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: stageColor + "20",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: stageColor,
                      }}
                    >
                      {stageLabel}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: isDark
                        ? "rgba(139, 92, 246, 0.2)"
                        : "rgba(168, 85, 247, 0.1)",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Feather name="activity" size={12} color="#8B5CF6" />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        marginLeft: 4,
                        color: "#8B5CF6",
                      }}
                    >
                      {contact.activities} activities
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: isDark ? "#34D399" : "#059669",
                  }}
                >
                  {contact.value}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <Feather
                    name="calendar"
                    size={12}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      color: colors.textSecondary,
                      marginLeft: 4,
                    }}
                  >
                    Recent
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Indicators for horizontal scroll */}
      {topContacts.length > 1 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 16,
          }}
        >
          {topContacts.map((_, index) => (
            <View
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: index === 0 ? colors.primary : colors.border,
                marginHorizontal: 3,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default TopContacts;
