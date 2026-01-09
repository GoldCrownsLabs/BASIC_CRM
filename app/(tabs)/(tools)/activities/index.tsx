// ActivitiesPage.tsx
import { useAppTheme } from "@/context/ThemeContext";
import { activitiesData, Activity, activityTypes } from "@/data/activities";
import {
    AntDesign,
    Feather,
    FontAwesome,
    MaterialIcons,
} from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type ActivityConfig = {
  icon: keyof typeof Feather.glyphMap;
  color: string;
  bg: string;
  label: string;
};
type FilterType = "all" | Activity["type"];

const ActivitiesPage = () => {
  const { colors, isDark } = useAppTheme();
  const [activities, setActivities] = useState(activitiesData);
  const [search, setSearch] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "",
    contactName: "",
    company: "",
    description: "",
    type: "call" as Activity["type"],
    priority: "medium" as Activity["priority"],
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    duration: "",
  });
  const [filter, setFilter] = useState<FilterType>("all");

  // Theme-aware configurations
  const activityConfig: Record<Activity["type"], ActivityConfig> = {
    call: {
      icon: "phone",
      color: isDark ? "#34D399" : "#10B981",
      bg: isDark ? "#064E3B" : "#D1FAE5",
      label: "Call",
    },
    meeting: {
      icon: "calendar",
      color: isDark ? "#60A5FA" : "#3B82F6",
      bg: isDark ? "#1E3A8A" : "#DBEAFE",
      label: "Meeting",
    },
    note: {
      icon: "file-text",
      color: isDark ? "#A78BFA" : "#8B5CF6",
      bg: isDark ? "#5B21B6" : "#EDE9FE",
      label: "Note",
    },
    task: {
      icon: "check-square",
      color: isDark ? "#FBBF24" : "#F59E0B",
      bg: isDark ? "#92400E" : "#FEF3C7",
      label: "Task",
    },
    email: {
      icon: "mail",
      color: isDark ? "#F87171" : "#EF4444",
      bg: isDark ? "#7F1D1D" : "#FEE2E2",
      label: "Email",
    },
  };

  const priorityColors = {
    high: isDark ? "#F87171" : "#DC2626",
    medium: isDark ? "#FBBF24" : "#D97706",
    low: isDark ? "#34D399" : "#059669",
  };

  const statusColors = {
    completed: isDark ? "#34D399" : "#10B981",
    scheduled: isDark ? "#60A5FA" : "#3B82F6",
    pending: isDark ? "#9CA3AF" : "#6B7280",
  };

  // Styles with theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.card,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      color: colors.text,
    },
    headerSubtitle: {
      color: colors.textSecondary,
    },
    activityCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: isDark ? "#000" : "#000",
      shadowOpacity: isDark ? 0.2 : 0.05,
      elevation: isDark ? 8 : 2,
    },
    activityTitle: {
      color: colors.text,
    },
    activityText: {
      color: colors.textSecondary,
    },
    modalBackground: {
      backgroundColor: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: colors.card,
    },
    input: {
      backgroundColor: isDark ? colors.card : "#F9FAFB",
      borderColor: colors.border,
      color: colors.text,
    },
    filterChip: {
      backgroundColor: isDark ? colors.border : "#F3F4F6",
      borderColor: colors.border,
    },
    filterText: {
      color: colors.textSecondary,
    },
    emptyStateText: {
      color: colors.text,
    },
  });

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(search.toLowerCase()) ||
      activity.contactName.toLowerCase().includes(search.toLowerCase()) ||
      activity.company?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || activity.type === filter;
    return matchesSearch && matchesFilter;
  });

  // Handle add new activity
  const handleAddActivity = () => {
    const newAct: Activity = {
      id: Date.now().toString(),
      title: newActivity.title,
      contactName: newActivity.contactName,
      company: newActivity.company,
      description: newActivity.description,
      type: newActivity.type,
      priority: newActivity.priority,
      date: newActivity.date,
      time: newActivity.time,
      duration: newActivity.duration || null,
      status: "pending",
    };

    setActivities([newAct, ...activities]);
    setNewActivity({
      title: "",
      contactName: "",
      company: "",
      description: "",
      type: "call",
      priority: "medium",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      duration: "",
    });
    setShowAddModal(false);
  };

  // Update activity status
  const updateStatus = (id: string, status: Activity["status"]) => {
    setActivities(
      activities.map((act) => (act.id === id ? { ...act, status } : act))
    );
    setSelectedActivity(null);
  };

  // Delete activity
  const deleteActivity = (id: string) => {
    setActivities(activities.filter((act) => act.id !== id));
    setSelectedActivity(null);
  };

  // Render activity item
  const renderItem = ({ item }: { item: Activity }) => {
    const config = activityConfig[item.type];
    const priorityColor = priorityColors[item.priority];
    const statusColor = statusColors[item.status];

    return (
      <TouchableOpacity
        style={styles.activityCard}
        onPress={() => setSelectedActivity(item)}
        activeOpacity={0.7}
      >
        <View
          style={{
            padding: 16,
          }}
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
              <Feather name={config.icon} size={18} color={config.color} />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.activityTitle,
                  { fontSize: 16, fontWeight: "600", marginBottom: 4 },
                ]}
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
                  {item.contactName}
                </Text>
                {item.company && (
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
                      {item.company}
                    </Text>
                  </>
                )}
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
              <Text
                style={{ fontSize: 12, fontWeight: "500", color: statusColor }}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
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
        </View>
      </TouchableOpacity>
    );
  };

  // Activity detail modal
  const renderDetailModal = () => (
    <Modal visible={!!selectedActivity} transparent animationType="slide">
      <View
        style={[
          styles.modalBackground,
          { flex: 1, justifyContent: "flex-end" },
        ]}
      >
        <View
          style={[
            styles.modalContent,
            {
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "90%",
            },
          ]}
        >
          {selectedActivity && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 24,
                  paddingTop: 24,
                  paddingBottom: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  style={[
                    styles.activityTitle,
                    { fontSize: 20, fontWeight: "600" },
                  ]}
                >
                  Activity Details
                </Text>
                <TouchableOpacity onPress={() => setSelectedActivity(null)}>
                  <Feather name="x" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ maxHeight: "80%" }}
                showsVerticalScrollIndicator={false}
              >
                <View style={{ padding: 24 }}>
                  {/* ... rest of your modal content with theme-aware colors ... */}
                  {/* Replace hardcoded colors with theme colors */}
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  // Add activity modal
const renderAddModal = () => (
  <Modal visible={showAddModal} transparent animationType="slide">
    <View
      style={{
        flex: 1,
        backgroundColor: isDark
          ? "rgba(0,0,0,0.8)"
          : "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
      }}
    >
      <View
        style={{
          backgroundColor: colors.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: "90%",
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: colors.text,
            }}
          >
            Add New Activity
          </Text>
          <TouchableOpacity onPress={() => setShowAddModal(false)}>
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Activity Type */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.text,
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            Activity Type
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {activityTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  gap: 8,
                  backgroundColor:
                    newActivity.type === type
                      ? activityConfig[type].bg
                      : "transparent",
                }}
                onPress={() => setNewActivity({ ...newActivity, type })}
              >
                <Feather
                  name={activityConfig[type].icon}
                  size={20}
                  color={
                    newActivity.type === type
                      ? activityConfig[type].color
                      : colors.textSecondary
                  }
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color:
                      newActivity.type === type
                        ? activityConfig[type].color
                        : colors.textSecondary,
                  }}
                >
                  {activityConfig[type].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Common Input Style */}
          {(
            [
              ["Title *", "title", "Enter activity title"],
              ["Contact Name *", "contactName", "Enter contact name"],
              ["Company", "company", "Enter company name (optional)"],
            ] as const
          ).map(([label, key, placeholder]) => (
            <View key={key} style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                {label}
              </Text>
              <TextInput
                style={{
                  backgroundColor: isDark ? colors.card : "#F9FAFB",
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                }}
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}
                value={newActivity[key]}
                onChangeText={(text) =>
                  setNewActivity({ ...newActivity, [key]: text })
                }
              />
            </View>
          ))}

          {/* Date & Time */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
            {(["date", "time"] as const).map((key) => (
              <View key={key} style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  {key === "date" ? "Date" : "Time"}
                </Text>
                <TextInput
                  style={{
                    backgroundColor: isDark ? colors.card : "#F9FAFB",
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: colors.text,
                  }}
                  placeholder={
                    key === "date" ? "YYYY-MM-DD" : "HH:MM AM/PM"
                  }
                  placeholderTextColor={colors.textSecondary}
                  value={newActivity[key]}
                  onChangeText={(text) =>
                    setNewActivity({ ...newActivity, [key]: text })
                  }
                />
              </View>
            ))}
          </View>

          {/* Description */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Description
            </Text>
            <TextInput
              style={{
                backgroundColor: isDark ? colors.card : "#F9FAFB",
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.text,
                height: 100,
                textAlignVertical: "top",
              }}
              placeholder="Enter activity description"
              placeholderTextColor={colors.textSecondary}
              multiline
              value={newActivity.description}
              onChangeText={(text) =>
                setNewActivity({ ...newActivity, description: text })
              }
            />
          </View>

          {/* Priority */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Priority
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["low", "medium", "high"] as const).map((priority) => {
                const color = priorityColors[priority];
                return (
                  <TouchableOpacity
                    key={priority}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: "center",
                      backgroundColor:
                        newActivity.priority === priority
                          ? `${color}20`
                          : "transparent",
                    }}
                    onPress={() =>
                      setNewActivity({ ...newActivity, priority })
                    }
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color:
                          newActivity.priority === priority
                            ? color
                            : colors.textSecondary,
                      }}
                    >
                      {priority.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            gap: 12,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor: isDark ? colors.border : "#F3F4F6",
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
            }}
            onPress={() => setShowAddModal(false)}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor: colors.primary,
              alignItems: "center",
            }}
            onPress={handleAddActivity}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#FFFFFF",
              }}
            >
              Save Activity
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);





  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.card}
      />

      {/* Fixed Header */}
      <View
        style={[
          styles.header,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
          },
        ]}
      >
        <View>
          <Text
            style={[styles.headerTitle, { fontSize: 28, fontWeight: "700" }]}
          >
            Activities
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: 14, marginTop: 2 }]}>
            Manage your interactions
          </Text>
        </View>
        <TouchableOpacity
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
          onPress={() => setShowAddModal(true)}
        >
          <AntDesign name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Fixed Search & Filters */}
      <View>
        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: isDark ? colors.card : "#F9FAFB",
          }}
        >
          <Feather
            name="search"
            size={20}
            color={colors.textSecondary}
            style={{ marginRight: 12 }}
          />
          <TextInput
            style={[
              styles.activityTitle,
              { flex: 1, fontSize: 16, padding: 0 },
            ]}
            placeholder="Search by title, contact, or company..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 20 }}
          >
            {(["all", ...activityTypes] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  {
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    minHeight: 36,
                    borderWidth: 1,
                    backgroundColor:
                      filter === type
                        ? colors.primary
                        : isDark
                        ? colors.border
                        : "#F3F4F6",
                    borderColor:
                      filter === type ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setFilter(type)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      fontSize: 14,
                      fontWeight: "500",
                      color: filter === type ? "#FFFFFF" : colors.textSecondary,
                    },
                  ]}
                >
                  {type === "all"
                    ? "All Activities"
                    : activityConfig[type].label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Scrollable Activities List */}
      <FlatList
        data={filteredActivities}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 60,
            }}
          >
            <Feather name="calendar" size={48} color={colors.textSecondary} />
            <Text
              style={[
                styles.emptyStateText,
                {
                  fontSize: 18,
                  fontWeight: "600",
                  marginTop: 16,
                  marginBottom: 8,
                },
              ]}
            >
              No activities found
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              {search
                ? "Try a different search"
                : "Add your first activity to get started"}
            </Text>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.primary,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 12,
              }}
              onPress={() => setShowAddModal(true)}
            >
              <AntDesign name="plus" size={20} color="#FFFFFF" />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#FFFFFF",
                  marginLeft: 8,
                }}
              >
                Add Activity
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {renderDetailModal()}
      {renderAddModal()}
    </SafeAreaView>
  );
};

export default ActivitiesPage;
