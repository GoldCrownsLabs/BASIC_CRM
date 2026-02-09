import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { Feather,  } from "@expo/vector-icons";
import { Activity , formatActivityTime } from "@/lib/api/activities.api";

import { useRouter } from "expo-router";

interface MeetingReminderProps {
  upcomingMeetings: Activity[];
  colors: any;
  isDark: boolean;
  onMeetingPress?: (meeting: Activity) => void;
}

export const MeetingReminder: React.FC<MeetingReminderProps> = ({
  upcomingMeetings,
  colors,
  isDark,
  onMeetingPress,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const router = useRouter();

  if (!upcomingMeetings || upcomingMeetings.length === 0) {
    return null;
  }

  // Get next meeting (nearest to current time)
  const getNextMeeting = () => {
    const now = new Date();

    // Filter future meetings
    const futureMeetings = upcomingMeetings.filter((meeting) => {
      try {
        const meetingTime = new Date(meeting.date);
        if (meeting.time) {
          const [hours, minutes] = meeting.time.split(":");
          meetingTime.setHours(parseInt(hours), parseInt(minutes));
        }
        return meetingTime > now;
      } catch {
        return false;
      }
    });

    // Sort by time
    futureMeetings.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return futureMeetings[0];
  };

  const nextMeeting = getNextMeeting();

  if (!nextMeeting) {
    return null;
  }

  const currentMeeting = upcomingMeetings[currentIndex];

  // Calculate time until meeting
  const calculateTimeUntilMeeting = (meeting: Activity) => {
    try {
      const now = new Date();
      const meetingTime = new Date(meeting.date);

      if (meeting.time) {
        const [hours, minutes] = meeting.time.split(":");
        meetingTime.setHours(parseInt(hours), parseInt(minutes));
      }

      const diffMs = meetingTime.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 0) return "Time passed";
      if (diffMins < 60) return `${diffMins} min`;
      if (diffHours < 24) return `${diffHours} hr`;

      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
    } catch {
      return "Soon";
    }
  };

  const timeUntilMeeting = calculateTimeUntilMeeting(currentMeeting);

  // Format date and time properly
  const formatMeetingDateTime = (meeting: Activity) => {
    try {
      const date = new Date(meeting.date);

      // Format date
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "short",
        day: "numeric",
        month: "short",
      };
      const formattedDate = date.toLocaleDateString("en-US", dateOptions);

      // Format time
      const formattedTime = formatActivityTime(
        meeting.time || "",
        meeting.date,
      );

      return `${formattedDate} • ${formattedTime}`;
    } catch {
      return meeting.date || "Date not set";
    }
  };

  // Handle meeting press
  const handleMeetingPress = () => {
    if (onMeetingPress) {
      onMeetingPress(currentMeeting);
    } else {
      // Navigate to activities page with meeting filter
      router.push("/(tabs)/(tools)/activities");
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.1 : 0.05,
        shadowRadius: 8,
        elevation: isDark ? 4 : 2,
      }}
    >
      {/* Header - ActivitiesChart की तरह */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#3B82F6" + "20",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="calendar" size={20} color="#3B82F6" />
          </View>
          <View>
            <Text
              style={{ fontSize: 18, fontWeight: "600", color: colors.text }}
            >
              Upcoming Meetings
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              {upcomingMeetings.length} meeting
              {upcomingMeetings.length !== 1 ? "s" : ""} scheduled
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleMeetingPress}>
          <Feather
            name="more-vertical"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Meeting Card - ActivitiesChart के tiles की तरह */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          onPress={handleMeetingPress}
          activeOpacity={0.7}
          style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1 }}>
              {/* Meeting Title */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                {currentMeeting.title}
              </Text>

              {/* Date & Time - ActivitiesChart के format में */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Feather
                  name="calendar"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    marginLeft: 6,
                  }}
                >
                  {formatMeetingDateTime(currentMeeting)}
                </Text>
              </View>

              {/* Contact */}
              {currentMeeting.contactName && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Feather name="user" size={14} color={colors.textSecondary} />
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      marginLeft: 6,
                    }}
                  >
                    With: {currentMeeting.contactName}
                  </Text>
                </View>
              )}

              {/* Location */}
              {currentMeeting.location && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Feather
                    name="map-pin"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      marginLeft: 6,
                    }}
                  >
                    {currentMeeting.location}
                  </Text>
                </View>
              )}
            </View>

            {/* Right side - Time badge */}
            <View style={{ alignItems: "flex-end" }}>
              <View
                style={[
                  styles.timeBadge,
                  {
                    backgroundColor: timeUntilMeeting.includes("min")
                      ? "#FEF2F2"
                      : timeUntilMeeting.includes("hr")
                        ? "#FFFBEB"
                        : "#F0F9FF",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.timeBadgeText,
                    {
                      color: timeUntilMeeting.includes("min")
                        ? "#DC2626"
                        : timeUntilMeeting.includes("hr")
                          ? "#D97706"
                          : "#0EA5E9",
                    },
                  ]}
                >
                  {timeUntilMeeting}
                </Text>
              </View>

              {/* Meeting counter */}
              {upcomingMeetings.length > 1 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.textSecondary,
                      marginRight: 4,
                    }}
                  >
                    {currentIndex + 1} of {upcomingMeetings.length}
                  </Text>
                  <Feather
                    name="chevron-right"
                    size={12}
                    color={colors.textSecondary}
                  />
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* View All Button - ActivitiesChart के total activities की तरह */}
      <TouchableOpacity
        style={{
          marginTop: 16,
          paddingVertical: 12,
          backgroundColor: isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.02)",
          borderRadius: 12,
          alignItems: "center",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
        }}
        onPress={handleMeetingPress}
      >
        <Feather name="calendar" size={16} color={colors.primary} />
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.primary,
          }}
        >
          View All Meetings ({upcomingMeetings.length})
        </Text>
      </TouchableOpacity>

      {/* Auto-cycle dots (if multiple meetings) */}
      {upcomingMeetings.length > 1 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 12,
            gap: 6,
          }}
        >
          {upcomingMeetings.map((_, index) => (
            <View
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  index === currentIndex ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  timeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 70,
    alignItems: "center",
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
