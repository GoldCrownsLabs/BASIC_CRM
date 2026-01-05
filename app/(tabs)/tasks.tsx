import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/contaxt/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data for tasks
const tasksData = [
  {
    id: '1',
    title: 'Follow up with ABC Corp',
    description: 'Call to discuss proposal details',
    dueDate: '2024-01-20',
    priority: 'High',
    status: 'pending',
    type: 'call',
    assignedTo: 'Self',
    relatedTo: 'ABC Corporation',
    createdAt: '2024-01-15',
    reminder: true,
    completedAt: null
  },
  {
    id: '2',
    title: 'Prepare quarterly report',
    description: 'Sales performance analysis for Q4',
    dueDate: '2024-01-25',
    priority: 'Medium',
    status: 'in_progress',
    type: 'report',
    assignedTo: 'Self',
    relatedTo: 'Management',
    createdAt: '2024-01-14',
    reminder: true,
    completedAt: null
  },
  {
    id: '3',
    title: 'Send contract to XYZ Enterprises',
    description: 'Final contract documents',
    dueDate: '2024-01-18',
    priority: 'High',
    status: 'completed',
    type: 'email',
    assignedTo: 'Self',
    relatedTo: 'XYZ Enterprises',
    createdAt: '2024-01-12',
    reminder: false,
    completedAt: '2024-01-16'
  },
  {
    id: '4',
    title: 'Team meeting preparation',
    description: 'Prepare agenda and materials',
    dueDate: '2024-01-22',
    priority: 'Medium',
    status: 'pending',
    type: 'meeting',
    assignedTo: 'Self',
    relatedTo: 'Team',
    createdAt: '2024-01-13',
    reminder: true,
    completedAt: null
  },
  {
    id: '5',
    title: 'Client demo for Tech Solutions',
    description: 'Product demonstration',
    dueDate: '2024-01-19',
    priority: 'High',
    status: 'in_progress',
    type: 'demo',
    assignedTo: 'Self',
    relatedTo: 'Tech Solutions Inc',
    createdAt: '2024-01-10',
    reminder: true,
    completedAt: null
  },
  {
    id: '6',
    title: 'Update contact database',
    description: 'Clean and update contact information',
    dueDate: '2024-01-30',
    priority: 'Low',
    status: 'pending',
    type: 'admin',
    assignedTo: 'Self',
    relatedTo: 'Contacts',
    createdAt: '2024-01-05',
    reminder: false,
    completedAt: null
  },
  {
    id: '7',
    title: 'Sales training session',
    description: 'New product training',
    dueDate: '2024-01-28',
    priority: 'Medium',
    status: 'pending',
    type: 'training',
    assignedTo: 'Self',
    relatedTo: 'Sales Team',
    createdAt: '2024-01-08',
    reminder: true,
    completedAt: null
  },
  {
    id: '8',
    title: 'Review marketing materials',
    description: 'Check new brochure designs',
    dueDate: '2024-01-17',
    priority: 'Low',
    status: 'completed',
    type: 'review',
    assignedTo: 'Self',
    relatedTo: 'Marketing',
    createdAt: '2024-01-09',
    reminder: false,
    completedAt: '2024-01-15'
  },
];

// Task statuses
const taskStatuses = [
  { id: 'all', label: 'All Tasks', color: '#666' },
  { id: 'pending', label: 'Pending', color: '#FF9800' },
  { id: 'in_progress', label: 'In Progress', color: '#2196F3' },
  { id: 'completed', label: 'Completed', color: '#4CAF50' },
  { id: 'overdue', label: 'Overdue', color: '#F44336' },
];

// Task types with icons
const taskTypes = {
  call: { icon: 'call-outline', color: '#4CAF50' },
  email: { icon: 'mail-outline', color: '#2196F3' },
  meeting: { icon: 'people-outline', color: '#9C27B0' },
  report: { icon: 'document-text-outline', color: '#FF9800' },
  demo: { icon: 'desktop-outline', color: '#00BCD4' },
  admin: { icon: 'briefcase-outline', color: '#795548' },
  training: { icon: 'school-outline', color: '#3F51B5' },
  review: { icon: 'checkmark-circle-outline', color: '#009688' },
};

const priorities = ['High', 'Medium', 'Low'];

export default function TasksScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [filteredTasks, setFilteredTasks] = useState(tasksData);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterTasks(text, selectedStatus, selectedPriority, selectedType);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    filterTasks(searchQuery, status, selectedPriority, selectedType);
  };

  const handlePriorityFilter = (priority: string) => {
    setSelectedPriority(priority);
    filterTasks(searchQuery, selectedStatus, priority, selectedType);
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    filterTasks(searchQuery, selectedStatus, selectedPriority, type);
  };

  const filterTasks = (search: string, status: string, priority: string, type: string) => {
    let filtered = [...tasksData];
    
    // Search filter
    if (search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase()) ||
        task.relatedTo.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Status filter
    if (status !== 'all') {
      if (status === 'overdue') {
        filtered = filtered.filter(task => {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          return task.status !== 'completed' && dueDate < today;
        });
      } else {
        filtered = filtered.filter(task => task.status === status);
      }
    }
    
    // Priority filter
    if (priority !== 'All') {
      filtered = filtered.filter(task => task.priority === priority);
    }
    
    // Type filter
    if (type !== 'All') {
      filtered = filtered.filter(task => task.type === type.toLowerCase());
    }
    
    setFilteredTasks(filtered);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string, dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    
    if (status === 'completed') return '#4CAF50';
    if (status === 'in_progress') return '#2196F3';
    if (status === 'pending') {
      if (daysUntilDue < 0) return '#F44336'; // Overdue
      if (daysUntilDue <= 2) return '#FF9800'; // Due soon
      return '#FF9800'; // Pending
    }
    return colors.textSecondary;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return colors.textSecondary;
    }
  };

  const getTaskTypeIcon = (type: string) => {
    return taskTypes[type as keyof typeof taskTypes] || { icon: 'help-outline', color: colors.textSecondary };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const renderTask = ({ item }: { item: any }) => {
    const daysUntilDue = getDaysUntilDue(item.dueDate);
    const statusColor = getStatusColor(item.status, item.dueDate);
    const priorityColor = getPriorityColor(item.priority);
    const taskType = getTaskTypeIcon(item.type);
    const isOverdue = daysUntilDue < 0 && item.status !== 'completed';
    
    return (
      <TouchableOpacity 
        style={[styles.taskCard, { backgroundColor: colors.card }]}
        onPress={() => router.push(`/(app)/tasks/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskTypeIcon}>
            <Ionicons name={taskType.icon as any} size={20} color={taskType.color} />
          </View>
          
          <View style={styles.taskMainInfo}>
            <View style={styles.titleRow}>
              <ThemedText 
                type="defaultSemiBold" 
                style={[
                  styles.taskTitle, 
                  { 
                    color: colors.text,
                    textDecorationLine: item.status === 'completed' ? 'line-through' : 'none',
                    opacity: item.status === 'completed' ? 0.7 : 1
                  }
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.title}
              </ThemedText>
              
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
                <ThemedText style={[styles.priorityText, { color: priorityColor }]}>
                  {item.priority.charAt(0)}
                </ThemedText>
              </View>
            </View>
            
            <ThemedText 
              style={[styles.taskDescription, { color: colors.textSecondary }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.description}
            </ThemedText>
          </View>
          
          {item.reminder && (
            <Ionicons name="notifications" size={18} color="#FF9800" />
          )}
        </View>
        
        <View style={[styles.taskDetails, { borderTopColor: colors.border }]}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <ThemedText style={[
                styles.dueDateText, 
                { 
                  color: isOverdue ? '#F44336' : 
                         daysUntilDue <= 2 ? '#FF9800' : 
                         colors.textSecondary,
                  fontWeight: isOverdue ? '600' : '400'
                }
              ]}>
                {formatDate(item.dueDate)} {isOverdue && '(Overdue)'}
              </ThemedText>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
              <ThemedText style={[styles.assignedText, { color: colors.textSecondary }]}>
                {item.assignedTo}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <ThemedText style={[styles.statusText, { color: statusColor }]}>
                {item.status === 'in_progress' ? 'In Progress' : 
                 item.status === 'completed' ? 'Completed' : 'Pending'}
              </ThemedText>
            </View>
            
            {item.relatedTo && (
              <View style={styles.relatedToContainer}>
                <Ionicons name="link-outline" size={12} color={colors.textSecondary} />
                <ThemedText style={[styles.relatedToText, { color: colors.textSecondary }]}>
                  {item.relatedTo}
                </ThemedText>
              </View>
            )}
          </View>
          
          {item.completedAt && (
            <View style={styles.completedContainer}>
              <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
              <ThemedText style={[styles.completedText, { color: colors.textSecondary }]}>
                Completed: {formatDate(item.completedAt)}
              </ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Calculate statistics
  const totalTasks = tasksData.length;
  const completedTasks = tasksData.filter(t => t.status === 'completed').length;
  const pendingTasks = tasksData.filter(t => t.status === 'pending').length;
  const overdueTasks = tasksData.filter(t => {
    const daysUntilDue = getDaysUntilDue(t.dueDate);
    return t.status !== 'completed' && daysUntilDue < 0;
  }).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerTop}>
          <ThemedText type="title" style={{ color: colors.text }}>
            Tasks & Reminders
          </ThemedText>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.viewModeButton, { backgroundColor: colors.primary + '15' }]}
              onPress={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            >
              <Ionicons 
                name={viewMode === 'list' ? 'calendar-outline' : 'list-outline'} 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
            <Link href="/tasks/new" asChild>
              <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
                <Ionicons name="add" size={20} color="white" />
                <ThemedText type="defaultSemiBold" style={styles.addButtonText}>
                  Add Task
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search tasks..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Task Stats */}
        <View style={[styles.statsContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[
              styles.statItem, 
              { 
                backgroundColor: selectedStatus === 'all' ? colors.primary + '20' : colors.card,
                borderColor: selectedStatus === 'all' ? colors.primary : colors.border
              }
            ]}
            onPress={() => handleStatusFilter('all')}
          >
            <ThemedText type="title" style={[styles.statNumber, { color: colors.primary }]}>
              {totalTasks}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              All Tasks
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.statItem, 
              { 
                backgroundColor: selectedStatus === 'pending' ? '#FF980020' : colors.card,
                borderColor: selectedStatus === 'pending' ? '#FF9800' : colors.border
              }
            ]}
            onPress={() => handleStatusFilter('pending')}
          >
            <ThemedText type="title" style={[styles.statNumber, { color: '#FF9800' }]}>
              {pendingTasks}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Pending
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.statItem, 
              { 
                backgroundColor: selectedStatus === 'completed' ? '#4CAF5020' : colors.card,
                borderColor: selectedStatus === 'completed' ? '#4CAF50' : colors.border
              }
            ]}
            onPress={() => handleStatusFilter('completed')}
          >
            <ThemedText type="title" style={[styles.statNumber, { color: '#4CAF50' }]}>
              {completedTasks}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Completed
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.statItem, 
              { 
                backgroundColor: selectedStatus === 'overdue' ? '#F4433620' : colors.card,
                borderColor: selectedStatus === 'overdue' ? '#F44336' : colors.border
              }
            ]}
            onPress={() => handleStatusFilter('overdue')}
          >
            <ThemedText type="title" style={[styles.statNumber, { color: '#F44336' }]}>
              {overdueTasks}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Overdue
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        {/* Quick Filters */}
        <View style={styles.filtersRow}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.filterButton,
                  { 
                    backgroundColor: selectedPriority === priority ? getPriorityColor(priority) + '20' : colors.background,
                    borderColor: selectedPriority === priority ? getPriorityColor(priority) : colors.border
                  }
                ]}
                onPress={() => handlePriorityFilter(priority)}
              >
                <Ionicons 
                  name="flag-outline" 
                  size={14} 
                  color={selectedPriority === priority ? getPriorityColor(priority) : colors.textSecondary} 
                />
                <ThemedText style={[
                  styles.filterText,
                  { color: selectedPriority === priority ? getPriorityColor(priority) : colors.textSecondary }
                ]}>
                  {priority}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Task Type Filters */}
        <View style={styles.typeFilters}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.typeScroll}
          >
            <TouchableOpacity
              style={[
                styles.typeButton,
                { 
                  backgroundColor: selectedType === 'All' ? colors.primary + '20' : colors.background,
                  borderColor: selectedType === 'All' ? colors.primary : colors.border
                }
              ]}
              onPress={() => handleTypeFilter('All')}
            >
              <Ionicons name="apps" size={16} color={selectedType === 'All' ? colors.primary : colors.textSecondary} />
              <ThemedText style={[
                styles.typeText,
                { color: selectedType === 'All' ? colors.primary : colors.textSecondary }
              ]}>
                All Types
              </ThemedText>
            </TouchableOpacity>
            
            {Object.entries(taskTypes).map(([type, info]) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  { 
                    backgroundColor: selectedType === type ? info.color + '20' : colors.background,
                    borderColor: selectedType === type ? info.color : colors.border
                  }
                ]}
                onPress={() => handleTypeFilter(type.charAt(0).toUpperCase() + type.slice(1))}
              >
                <Ionicons name={info.icon as any} size={16} color={selectedType === type ? info.color : colors.textSecondary} />
                <ThemedText style={[
                  styles.typeText,
                  { color: selectedType === type ? info.color : colors.textSecondary }
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Upcoming Tasks Summary */}
      {viewMode === 'list' && (
        <View style={[styles.upcomingContainer, { backgroundColor: colors.card }]}>
          <View style={styles.upcomingHeader}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <ThemedText type="defaultSemiBold" style={{ color: colors.text, marginLeft: 8 }}>
              Today & Upcoming
            </ThemedText>
          </View>
          
          <View style={styles.upcomingStats}>
            <View style={styles.upcomingStat}>
              <ThemedText style={[styles.upcomingCount, { color: '#F44336' }]}>
                {tasksData.filter(t => {
                  const daysUntilDue = getDaysUntilDue(t.dueDate);
                  return t.status !== 'completed' && daysUntilDue < 0;
                }).length}
              </ThemedText>
              <ThemedText style={[styles.upcomingLabel, { color: colors.textSecondary }]}>
                Overdue
              </ThemedText>
            </View>
            
            <View style={[styles.upcomingDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.upcomingStat}>
              <ThemedText style={[styles.upcomingCount, { color: '#FF9800' }]}>
                {tasksData.filter(t => {
                  const daysUntilDue = getDaysUntilDue(t.dueDate);
                  return t.status !== 'completed' && daysUntilDue >= 0 && daysUntilDue <= 2;
                }).length}
              </ThemedText>
              <ThemedText style={[styles.upcomingLabel, { color: colors.textSecondary }]}>
                Due Soon
              </ThemedText>
            </View>
            
            <View style={[styles.upcomingDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.upcomingStat}>
              <ThemedText style={[styles.upcomingCount, { color: '#4CAF50' }]}>
                {tasksData.filter(t => {
                  const daysUntilDue = getDaysUntilDue(t.dueDate);
                  return t.status === 'completed';
                }).length}
              </ThemedText>
              <ThemedText style={[styles.upcomingLabel, { color: colors.textSecondary }]}>
                Completed
              </ThemedText>
            </View>
          </View>
        </View>
      )}

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={60} color={colors.textSecondary} />
            <ThemedText type="default" style={{ color: colors.textSecondary, marginTop: 10 }}>
              No tasks found
            </ThemedText>
            <ThemedText style={{ color: colors.textSecondary, fontSize: 12, marginTop: 5 }}>
              {selectedStatus === 'completed' ? 'All caught up!' : 'Try changing your filters'}
            </ThemedText>
          </View>
        }
        ListFooterComponent={<View style={styles.footerSpacer} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
  },
  filtersRow: {
    marginBottom: 12,
  },
  filterScroll: {
    maxHeight: 40,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  typeFilters: {
    marginBottom: 12,
  },
  typeScroll: {
    maxHeight: 40,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  upcomingContainer: {
    marginHorizontal: 15,
    marginTop: 15,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  upcomingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  upcomingStat: {
    flex: 1,
    alignItems: 'center',
  },
  upcomingCount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  upcomingLabel: {
    fontSize: 11,
  },
  upcomingDivider: {
    width: 1,
    height: 30,
  },
  listContent: {
    padding: 15,
  },
  taskCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTypeIcon: {
    marginRight: 12,
  },
  taskMainInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
  },
  priorityBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  taskDetails: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueDateText: {
    fontSize: 12,
  },
  assignedText: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  relatedToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  relatedToText: {
    fontSize: 11,
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  completedText: {
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  footerSpacer: {
    height: 100,
  },
});