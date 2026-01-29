import React, { useState } from "react";
import { ScrollView, RefreshControl, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/context/ThemeContext";
import { useTasks } from "@/hooks/useTasks";
import AddTaskModal from "@/components/Modal/AddTaskModal";
import { TasksHeader } from "@/models/Tasks/TasksHeader";
import { TaskStatsCards } from "@/models/Tasks/TaskStatsCards";
import { StatusFilter } from "@/models/Tasks/StatusFilter";
import { PriorityFilter } from "@/models/Tasks/PriorityFilter";
import { QuickActions } from "@/models/Tasks/QuickActions";
import { TasksList } from "@/models/Tasks/TasksList";
import { FloatingAddButton } from "@/models/Tasks/FloatingAddButton";
import { formatDate, getPriorityColor } from "@/utils/leads.utils";
import { getDaysUntilDue, getStatusColor } from "@/utils/task.utils";


export default function TasksScreen() {
  const { colors } = useAppTheme();
  const [showAddModal, setShowAddModal] = useState(false);

  const {
    refreshing,
    loading,
    searchQuery,
    selectedStatus,
    selectedPriority,
    viewMode,
    tasks,
    stats,
    setViewMode,
    onRefresh,
    handleAddTask,
    handleTaskPress,
    handleCompleteTask,
    handleDeleteTask,
    handleBulkUpdate,
    handleSearch,
    handleStatusFilter,
    handlePriorityFilter,
    handleTodayTasks,
    handleUpcomingTasks,
  } = useTasks();

  const handleBulkActions = () => {
    if (tasks.length > 0) {
      Alert.alert("Bulk Actions", "Select action for selected tasks", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark as Completed",
          onPress: () => {
            const taskIds = tasks.map((t) => t.id);
            handleBulkUpdate(taskIds, "completed");
          },
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            Alert.alert("Confirm Delete", `Delete ${tasks.length} tasks?`, [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  console.log("Bulk delete not implemented");
                },
              },
            ]);
          },
        },
      ]);
    }
  };

  const handleAllTasks = () => {
    handleStatusFilter("all");
  };

  const handleHighPriority = () => {
    handlePriorityFilter("High");
  };

  const handleOverdueTasks = () => {
    handleStatusFilter("overdue");
  };

  const handleAddTaskSubmit = async (taskData: any) => {
    const success = await handleAddTask(taskData);
    if (success) {
      setShowAddModal(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Main Content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header Section */}
        <View
          style={{
            backgroundColor: colors.card,
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TasksHeader
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            viewMode={viewMode}
            onToggleView={() =>
              setViewMode(viewMode === "list" ? "calendar" : "list")
            }
            onAddTask={() => setShowAddModal(true)}
            loading={loading}
            taskCount={tasks.length}
          />

          {/* Stats Cards */}
          <TaskStatsCards
            stats={{
              totalTasks: stats.totalTasks,
              todayTasks: stats.todayTasks,
              highPriorityTasks: stats.highPriorityTasks,
              overdueTasks: stats.overdueTasks,
            }}
            selectedStatus={selectedStatus}
            selectedPriority={selectedPriority}
            onAllTasks={handleAllTasks}
            onTodayTasks={handleTodayTasks}
            onHighPriority={handleHighPriority}
            onOverdueTasks={handleOverdueTasks}
            onUpcomingTasks={handleUpcomingTasks}
          />

          {/* Status Filters */}
          <StatusFilter
            selectedStatus={selectedStatus}
            onStatusFilter={handleStatusFilter}
          />

          {/* Priority Filters */}
          <PriorityFilter
            selectedPriority={selectedPriority}
            onPriorityFilter={handlePriorityFilter}
          />

          {/* Quick Actions */}
          <QuickActions
            onBulkActions={handleBulkActions}
            onRefresh={onRefresh}
          />
        </View>

        {/* Tasks List */}
        <View style={{ padding: 20 }}>
          <TasksList
            tasks={tasks}
            loading={loading}
            viewMode={viewMode}
            onTaskPress={handleTaskPress}
            onCompleteTask={handleCompleteTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={() => setShowAddModal(true)}
            onRefresh={onRefresh}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            formatDate={formatDate}
            getDaysUntilDue={getDaysUntilDue}
            colors={colors}
          />
        </View>

        {/* Bottom Spacer for floating buttons */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingAddButton onPress={() => setShowAddModal(true)} />

      {/* Add Task Modal */}
      <AddTaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddTask={handleAddTaskSubmit}
      />
    </SafeAreaView>
  );
}
