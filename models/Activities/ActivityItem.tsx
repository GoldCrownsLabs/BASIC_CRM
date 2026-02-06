import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Activity, ActivityConfig } from "@/data/types/activities";


interface ActivityItemProps {
  item: Activity;
  config: ActivityConfig;
  priorityColor: string;
  statusColor: string;
  status: string;
  contactName: string;
  company: string;
  colors: any;
  isDark: boolean;
  onPress: () => void;
  onMarkComplete: (id: string) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  item,
  config,
  priorityColor,
  statusColor,
  status,
  contactName,
  company,
  colors,
  isDark,
  onPress,
  onMarkComplete,
}) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        marginBottom: 12,
        padding: 16,
        shadowColor: isDark ? "#000" : "#000",
        shadowOpacity: isDark ? 0.2 : 0.05,
        elevation: isDark ? 8 : 2,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: config.bg,
            marginRight: 12,
          }}
        >
          <Feather name={config.icon as any} size={18} color={config.color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 4,
              color: colors.text,
            }}
          >
            {item.title}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {contactName ? (
              <>
                <FontAwesome
                  name="user"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    marginLeft: 4,
                    marginRight: 8,
                  }}
                >
                  {contactName}
                </Text>
              </>
            ) : null}

            {company ? (
              <>
                <Text style={{ color: colors.border, marginHorizontal: 6 }}>
                  •
                </Text>
                <MaterialIcons
                  name="business"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    marginLeft: 4,
                  }}
                >
                  {company}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            backgroundColor: `${statusColor}20`,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "500", color: statusColor }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
            marginBottom: 12,
          }}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Feather name="clock" size={12} color={colors.textSecondary} />
          <Text
            style={{
              fontSize: 12,
              color: colors.textSecondary,
              marginLeft: 4,
            }}
          >
            {item.date} • {item.time}
            {item.duration && ` • ${item.duration}`}
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            backgroundColor: `${priorityColor}20`,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "500",
              color: priorityColor,
            }}
          >
            {item.priority.toUpperCase()}
          </Text>
        </View>
      </View>

      {!item.isCompleted && (
        <TouchableOpacity
          style={{
            marginTop: 12,
            padding: 8,
            backgroundColor: `${statusColor}20`,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={() => onMarkComplete(item._id)}
        >
          <Text style={{ color: statusColor, fontWeight: "600" }}>
            Mark as Completed
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default ActivityItem;
