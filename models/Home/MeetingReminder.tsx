import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Activity } from "@/lib/api/activities.api";
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
  const [timeRemaining, setTimeRemaining] = useState("");
  const [countdownActive, setCountdownActive] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const currentMeeting = upcomingMeetings[currentIndex];

  // Calculate time remaining for countdown
  const calculateTimeRemaining = () => {
    if (!currentMeeting)
      return { hours: 0, minutes: 0, seconds: 0, isPast: true };

    try {
      const now = new Date();
      const meetingTime = new Date(currentMeeting.date);

      if (currentMeeting.time) {
        const [hours, minutes] = currentMeeting.time.split(":");
        meetingTime.setHours(parseInt(hours), parseInt(minutes));
      }

      const diffMs = meetingTime.getTime() - now.getTime();

      if (diffMs <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, isPast: true };
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return { hours, minutes, seconds, isPast: false };
    } catch {
      return { hours: 0, minutes: 0, seconds: 0, isPast: true };
    }
  };

  // Format time remaining for display
  const formatTimeRemaining = () => {
    const { hours, minutes, seconds, isPast } = calculateTimeRemaining();

    if (isPast) {
      return "Meeting time passed";
    }

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
  };

  // Countdown timer effect
  useEffect(() => {
    if (!currentMeeting) return;

    const { isPast } = calculateTimeRemaining();

    if (isPast) {
      setCountdownActive(false);
      return;
    }

    setCountdownActive(true);

    const timer = setInterval(() => {
      const formattedTime = formatTimeRemaining();
      setTimeRemaining(formattedTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentMeeting]);

  // Auto-cycle through meetings effect
  useEffect(() => {
    if (upcomingMeetings.length <= 1) return;

    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          delay: 100,
        }),
      ]).start();

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % upcomingMeetings.length);
      }, 300);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [upcomingMeetings.length, fadeAnim]);

  if (!upcomingMeetings || upcomingMeetings.length === 0) {
    return null;
  }

  // Format date properly
  const formatMeetingDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        day: "numeric",
        month: "short",
      };
      return date.toLocaleDateString("en-US", options);
    } catch {
      return dateString || "Date not set";
    }
  };

  // Format time properly
  const formatMeetingTime = (timeString: string, dateString: string) => {
    try {
      if (timeString) {
        // If time is in 24-hour format (e.g., "14:30")
        if (timeString.includes(":")) {
          const [hours, minutes] = timeString.split(":");
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? "PM" : "AM";
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes.padStart(2, "0")} ${ampm}`;
        }
        return timeString;
      }

      // If no time string, check if date has time component
      if (dateString) {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();

        if (hours === 0 && minutes === 0) {
          return "All day";
        }

        const ampm = hours >= 12 ? "PM" : "AM";
        const hour12 = hours % 12 || 12;
        return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
      }

      return "Time not set";
    } catch {
      return "Time not set";
    }
  };

  // Handle meeting press
  const handleMeetingPress = () => {
    if (onMeetingPress) {
      onMeetingPress(currentMeeting);
    } else {
      router.push("/(tabs)/(tools)/activities");
    }
  };

  const { hours, minutes, seconds, isPast } = calculateTimeRemaining();

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
      {/* Header */}
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

      {/* Meeting Card */}
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

              {/* Date & Time */}
              <View style={{ marginBottom: 6 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
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
                    {formatMeetingDate(currentMeeting.date)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Feather
                    name="clock"
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
                    {formatMeetingTime(
                      currentMeeting.time || "",
                      currentMeeting.date,
                    )}
                  </Text>
                </View>
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

            {/* Right side - Countdown Timer */}
            <View style={{ alignItems: "flex-end" }}>
              <View
                style={[
                  styles.countdownContainer,
                  {
                    backgroundColor: isPast
                      ? "#F3F4F6"
                      : hours > 24
                        ? "#F0F9FF"
                        : hours > 0
                          ? "#FFFBEB"
                          : "#FEF2F2",
                    borderColor: isPast
                      ? colors.border
                      : hours > 24
                        ? "#0EA5E9"
                        : hours > 0
                          ? "#F59E0B"
                          : "#DC2626",
                  },
                ]}
              >
                {!isPast && countdownActive ? (
                  <>
                    {/* Digital Countdown */}
                    <Text
                      style={[
                        styles.countdownText,
                        {
                          color:
                            hours > 24
                              ? "#0EA5E9"
                              : hours > 0
                                ? "#D97706"
                                : "#DC2626",
                        },
                      ]}
                    >
                      {timeRemaining}
                    </Text>

                    {/* Time units */}
                    <View style={styles.timeUnits}>
                      <Text
                        style={[
                          styles.timeUnit,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {hours > 24
                          ? "Days"
                          : hours > 0
                            ? "Hrs Min Sec"
                            : "Min Sec"}
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text
                    style={[
                      styles.countdownText,
                      { color: isPast ? colors.textSecondary : "#DC2626" },
                    ]}
                  >
                    {isPast ? "Time Passed" : "Starts Soon"}
                  </Text>
                )}
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

      {/* View All Button */}
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

      {/* Auto-cycle dots */}
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
  countdownContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 90,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "solid",
  },
  countdownText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  timeUnits: {
    marginTop: 2,
  },
  timeUnit: {
    fontSize: 9,
    fontWeight: "500",
    opacity: 0.8,
  },
});
