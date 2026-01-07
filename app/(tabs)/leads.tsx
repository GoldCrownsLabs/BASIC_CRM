import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data for leads
const leadsData = [
  {
    id: '1',
    name: 'ABC Corporation',
    contact: 'John Smith',
    email: 'john@abccorp.com',
    phone: '+1234567890',
    value: 50000,
    stage: 'New',
    source: 'Website',
    created: '2024-01-15',
    expectedClose: '2024-02-28',
    priority: 'High',
    notes: 'Interested in enterprise solution'
  },
  {
    id: '2',
    name: 'XYZ Enterprises',
    contact: 'Sarah Johnson',
    email: 'sarah@xyz.com',
    phone: '+0987654321',
    value: 35000,
    stage: 'Contacted',
    source: 'Referral',
    created: '2024-01-14',
    expectedClose: '2024-03-15',
    priority: 'Medium',
    notes: 'Scheduled demo next week'
  },
  {
    id: '3',
    name: 'Tech Solutions Inc',
    contact: 'Mike Brown',
    email: 'mike@techsolutions.com',
    phone: '+1122334455',
    value: 25000,
    stage: 'Qualified',
    source: 'Conference',
    created: '2024-01-10',
    expectedClose: '2024-02-20',
    priority: 'High',
    notes: 'Decision maker identified'
  },
  {
    id: '4',
    name: 'Global Trading Co',
    contact: 'Emma Wilson',
    email: 'emma@globaltrading.com',
    phone: '+5566778899',
    value: 75000,
    stage: 'Proposal',
    source: 'LinkedIn',
    created: '2024-01-13',
    expectedClose: '2024-03-10',
    priority: 'High',
    notes: 'Proposal sent, waiting for feedback'
  },
  {
    id: '5',
    name: 'Innovate Labs',
    contact: 'David Lee',
    email: 'david@innovatelabs.com',
    phone: '+6677889900',
    value: 42000,
    stage: 'Negotiation',
    source: 'Email Campaign',
    created: '2024-01-12',
    expectedClose: '2024-02-15',
    priority: 'Medium',
    notes: 'Finalizing contract terms'
  },
  {
    id: '6',
    name: 'Digital Minds',
    contact: 'Lisa Chen',
    email: 'lisa@digitalminds.com',
    phone: '+7788990011',
    value: 18000,
    stage: 'Won',
    source: 'Website',
    created: '2024-01-05',
    expectedClose: '2024-01-31',
    priority: 'Low',
    notes: 'Deal closed successfully'
  },
  {
    id: '7',
    name: 'NextGen Systems',
    contact: 'Robert Taylor',
    email: 'robert@nextgen.com',
    phone: '+8899001122',
    value: 92000,
    stage: 'Lost',
    source: 'Referral',
    created: '2024-01-08',
    expectedClose: '2024-02-10',
    priority: 'Medium',
    notes: 'Went with competitor'
  },
  {
    id: '8',
    name: 'Future Enterprises',
    contact: 'Sophia Martinez',
    email: 'sophia@future.com',
    phone: '+9900112233',
    value: 31000,
    stage: 'Qualified',
    source: 'Trade Show',
    created: '2024-01-15',
    expectedClose: '2024-03-05',
    priority: 'High',
    notes: 'Strong interest shown'
  },
  // Add more leads for testing scroll
  {
    id: '9',
    name: 'Tech Giants Inc',
    contact: 'Alex Turner',
    email: 'alex@techgiants.com',
    phone: '+1122334466',
    value: 68000,
    stage: 'Contacted',
    source: 'LinkedIn',
    created: '2024-01-16',
    expectedClose: '2024-03-20',
    priority: 'High',
    notes: 'Initial meeting scheduled'
  },
  {
    id: '10',
    name: 'Cloud Solutions',
    contact: 'Maria Garcia',
    email: 'maria@cloud.com',
    phone: '+2233445566',
    value: 45000,
    stage: 'Proposal',
    source: 'Website',
    created: '2024-01-14',
    expectedClose: '2024-02-25',
    priority: 'Medium',
    notes: 'Waiting for budget approval'
  },
];

// Lead stages with colors and order
const leadStages = [
  { id: 'new', label: 'New', color: '#4CAF50' },
  { id: 'contacted', label: 'Contacted', color: '#2196F3' },
  { id: 'qualified', label: 'Qualified', color: '#FF9800' },
  { id: 'proposal', label: 'Proposal', color: '#9C27B0' },
  { id: 'negotiation', label: 'Negotiation', color: '#FF5722' },
  { id: 'won', label: 'Won', color: '#4CAF50' },
  { id: 'lost', label: 'Lost', color: '#F44336' },
];

const leadSources = ['Website', 'Referral', 'Conference', 'LinkedIn', 'Email Campaign', 'Trade Show', 'Social Media'];
const priorities = ['High', 'Medium', 'Low'];

export default function LeadsScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [filteredLeads, setFilteredLeads] = useState(leadsData);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterLeads(text, selectedStage, selectedSource, selectedPriority);
  };

  const handleStageFilter = (stage: string) => {
    setSelectedStage(stage);
    filterLeads(searchQuery, stage, selectedSource, selectedPriority);
  };

  const handleSourceFilter = (source: string) => {
    setSelectedSource(source);
    filterLeads(searchQuery, selectedStage, source, selectedPriority);
  };

  const handlePriorityFilter = (priority: string) => {
    setSelectedPriority(priority);
    filterLeads(searchQuery, selectedStage, selectedSource, priority);
  };

  const filterLeads = (search: string, stage: string, source: string, priority: string) => {
    let filtered = [...leadsData];
    
    // Search filter
    if (search) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.contact.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone.includes(search)
      );
    }
    
    // Stage filter
    if (stage !== 'All') {
      filtered = filtered.filter(lead => lead.stage === stage);
    }
    
    // Source filter
    if (source !== 'All') {
      filtered = filtered.filter(lead => lead.source === source);
    }
    
    // Priority filter
    if (priority !== 'All') {
      filtered = filtered.filter(lead => lead.priority === priority);
    }
    
    setFilteredLeads(filtered);
  };

  const getStageColor = (stage: string) => {
    const stageObj = leadStages.find(s => s.label === stage);
    return stageObj ? stageObj.color : colors.textSecondary;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return 'flag';
      case 'Medium': return 'flag-outline';
      case 'Low': return 'flag-sharp';
      default: return 'flag';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return colors.textSecondary;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDaysToClose = (expectedClose: string) => {
    const today = new Date();
    const closeDate = new Date(expectedClose);
    const diffTime = closeDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderLead = (item: any) => {
    const daysToClose = calculateDaysToClose(item.expectedClose);
    const stageColor = getStageColor(item.stage);
    const priorityColor = getPriorityColor(item.priority);
    
    return (
      <TouchableOpacity 
        key={item.id}
        style={[styles.leadCard, { backgroundColor: colors.card }]}
        onPress={() => router.push(`/(app)/leads/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.leadHeader}>
          <View style={styles.leadMainInfo}>
            <View style={styles.nameRow}>
              <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
                {item.name}
              </ThemedText>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
                <Ionicons name={getPriorityIcon(item.priority) as any} size={14} color={priorityColor} />
              </View>
            </View>
            <ThemedText style={[styles.contactInfo, { color: colors.textSecondary }]}>
              {item.contact} • {item.email}
            </ThemedText>
          </View>
          
          <View style={styles.valueContainer}>
            <ThemedText type="defaultSemiBold" style={[styles.valueText, { color: colors.primary }]}>
              {formatCurrency(item.value)}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.leadDetails}>
          <View style={[styles.stageContainer, { backgroundColor: stageColor + '15' }]}>
            <ThemedText style={[styles.stageText, { color: stageColor }]}>
              {item.stage}
            </ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="business-outline" size={14} color={colors.textSecondary} />
              <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Source: {item.source}
              </ThemedText>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <ThemedText style={[
                styles.detailLabel, 
                { color: daysToClose <= 7 ? '#F44336' : daysToClose <= 30 ? '#FF9800' : colors.textSecondary }
              ]}>
                {daysToClose > 0 ? `${daysToClose}d to close` : 'Past due'}
              </ThemedText>
            </View>
          </View>
          
          {item.notes && (
            <View style={styles.notesContainer}>
              <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
              <ThemedText 
                style={[styles.notesText, { color: colors.textSecondary }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.notes}
              </ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <View style={styles.headerTop}>
            <ThemedText type="title" style={{ color: colors.text }}>
              Leads Pipeline
            </ThemedText>
            <View style={styles.headerActions}>
              <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="stats-chart" size={20} color={colors.primary} />
              </TouchableOpacity>
              <Link href="/leads/new" asChild>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
                  <Ionicons name="add" size={20} color="white" />
                  <ThemedText type="defaultSemiBold" style={styles.addButtonText}>
                    Add Lead
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
              placeholder="Search leads..."
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
          
          {/* Pipeline Stats */}
          <View style={[styles.pipelineStats, { backgroundColor: colors.background }]}>
            {leadStages.map((stage) => {
              const count = leadsData.filter(lead => lead.stage === stage.label).length;
              const totalValue = leadsData
                .filter(lead => lead.stage === stage.label)
                .reduce((sum, lead) => sum + lead.value, 0);
              
              return (
                <TouchableOpacity
                  key={stage.id}
                  style={[
                    styles.pipelineItem,
                    { 
                      backgroundColor: selectedStage === stage.label ? stage.color + '20' : colors.card,
                      borderColor: stage.color
                    }
                  ]}
                  onPress={() => handleStageFilter(stage.label)}
                >
                  <View style={[styles.stageDot, { backgroundColor: stage.color }]} />
                  <ThemedText style={[styles.stageLabel, { color: colors.text }]}>
                    {stage.label}
                  </ThemedText>
                  <ThemedText style={[styles.stageCount, { color: stage.color }]}>
                    {count}
                  </ThemedText>
                  <ThemedText style={[styles.stageValue, { color: colors.textSecondary }]}>
                    {formatCurrency(totalValue)}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Quick Filters */}
          <View style={styles.filtersRow}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  { 
                    backgroundColor: selectedSource === 'All' ? colors.primary + '20' : colors.background,
                    borderColor: selectedSource === 'All' ? colors.primary : colors.border
                  }
                ]}
                onPress={() => handleSourceFilter('All')}
              >
                <ThemedText style={[
                  styles.filterText,
                  { color: selectedSource === 'All' ? colors.primary : colors.textSecondary }
                ]}>
                  All Sources
                </ThemedText>
              </TouchableOpacity>
              
              {leadSources.map((source) => (
                <TouchableOpacity
                  key={source}
                  style={[
                    styles.filterButton,
                    { 
                      backgroundColor: selectedSource === source ? colors.primary + '20' : colors.background,
                      borderColor: selectedSource === source ? colors.primary : colors.border
                    }
                  ]}
                  onPress={() => handleSourceFilter(source)}
                >
                  <ThemedText style={[
                    styles.filterText,
                    { color: selectedSource === source ? colors.primary : colors.textSecondary }
                  ]}>
                    {source}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Priority Filters */}
          <View style={styles.priorityFilters}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityButton,
                  { 
                    backgroundColor: selectedPriority === priority ? getPriorityColor(priority) + '20' : colors.background,
                    borderColor: selectedPriority === priority ? getPriorityColor(priority) : colors.border
                  }
                ]}
                onPress={() => handlePriorityFilter(priority)}
              >
                <Ionicons 
                  name={getPriorityIcon(priority) as any} 
                  size={16} 
                  color={selectedPriority === priority ? getPriorityColor(priority) : colors.textSecondary} 
                />
                <ThemedText style={[
                  styles.priorityText,
                  { color: selectedPriority === priority ? getPriorityColor(priority) : colors.textSecondary }
                ]}>
                  {priority}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Total Pipeline Value */}
        <View style={[styles.totalValueContainer, { backgroundColor: colors.card }]}>
          <View style={styles.totalValueContent}>
            <Ionicons name="trending-up" size={24} color={colors.primary} />
            <View style={styles.totalValueText}>
              <ThemedText style={[styles.totalLabel, { color: colors.textSecondary }]}>
                Total Pipeline Value
              </ThemedText>
              <ThemedText type="title" style={[styles.totalAmount, { color: colors.primary }]}>
                {formatCurrency(leadsData.reduce((sum, lead) => sum + lead.value, 0))}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.leadCount, { color: colors.textSecondary }]}>
            {leadsData.length} Leads • {leadsData.filter(l => l.stage === 'Won').length} Won • {leadsData.filter(l => l.stage === 'Lost').length} Lost
          </ThemedText>
        </View>

        {/* Leads List */}
        <View style={styles.leadsListContainer}>
          <View style={styles.listHeader}>
            <ThemedText type="subtitle" style={{ color: colors.text }}>
              Leads ({filteredLeads.length})
            </ThemedText>
          </View>

          {filteredLeads.length > 0 ? (
            <View style={styles.leadsGrid}>
              {filteredLeads.map(renderLead)}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="trending-up-outline" size={60} color={colors.textSecondary} />
              <ThemedText type="default" style={{ color: colors.textSecondary, marginTop: 10 }}>
                No leads found
              </ThemedText>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12, marginTop: 5 }}>
                Try changing your filters
              </ThemedText>
            </View>
          )}
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  iconButton: {
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
  pipelineStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 10,
    borderRadius: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  pipelineItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 80,
  },
  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  stageLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  stageCount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  stageValue: {
    fontSize: 9,
  },
  filtersRow: {
    marginBottom: 12,
  },
  filterScroll: {
    maxHeight: 40,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  priorityFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  totalValueContainer: {
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 15,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  totalValueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalValueText: {
    marginLeft: 12,
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  leadCount: {
    fontSize: 11,
  },
  leadsListContainer: {
    paddingHorizontal: 15,
  },
  listHeader: {
    marginBottom: 15,
  },
  leadsGrid: {
    gap: 12,
  },
  leadCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leadMainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  priorityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    fontSize: 13,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  leadDetails: {
    gap: 8,
  },
  stageContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notesText: {
    fontSize: 12,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  bottomSpacer: {
    height: 100,
  },
});