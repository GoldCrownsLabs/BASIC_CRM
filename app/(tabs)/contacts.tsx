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

// Mock data for contacts
const contactsData = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'john@example.com', 
    phone: '+1234567890', 
    company: 'ABC Corp',
    title: 'CEO',
    status: 'active',
    lastContact: '2024-01-15',
    tags: ['VIP', 'Regular'],
    source: 'Referral'
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    phone: '+0987654321', 
    company: 'XYZ Inc',
    title: 'Marketing Director',
    status: 'active',
    lastContact: '2024-01-14',
    tags: ['Hot Lead'],
    source: 'Website'
  },
  { 
    id: '3', 
    name: 'Bob Johnson', 
    email: 'bob@example.com', 
    phone: '+1122334455', 
    company: 'Tech Solutions',
    title: 'CTO',
    status: 'inactive',
    lastContact: '2024-01-10',
    tags: ['Cold'],
    source: 'Conference'
  },
  { 
    id: '4', 
    name: 'Alice Brown', 
    email: 'alice@example.com', 
    phone: '+5566778899', 
    company: 'Global Ltd',
    title: 'Sales Manager',
    status: 'active',
    lastContact: '2024-01-13',
    tags: ['VIP', 'Decision Maker'],
    source: 'Referral'
  },
  { 
    id: '5', 
    name: 'Charlie Wilson', 
    email: 'charlie@example.com', 
    phone: '+6677889900', 
    company: 'Startup Co',
    title: 'Founder',
    status: 'active',
    lastContact: '2024-01-12',
    tags: ['Hot Lead'],
    source: 'Social Media'
  },
  { 
    id: '6', 
    name: 'Diana Miller', 
    email: 'diana@example.com', 
    phone: '+7788990011', 
    company: 'Innovate LLC',
    title: 'Product Manager',
    status: 'inactive',
    lastContact: '2024-01-05',
    tags: ['Follow-up'],
    source: 'Email Campaign'
  },
  { 
    id: '7', 
    name: 'Edward Davis', 
    email: 'edward@example.com', 
    phone: '+8899001122', 
    company: 'Future Inc',
    title: 'VP Sales',
    status: 'active',
    lastContact: '2024-01-14',
    tags: ['VIP'],
    source: 'Referral'
  },
  { 
    id: '8', 
    name: 'Fiona Garcia', 
    email: 'fiona@example.com', 
    phone: '+9900112233', 
    company: 'Next Gen',
    title: 'CEO',
    status: 'active',
    lastContact: '2024-01-15',
    tags: ['Hot Lead', 'Decision Maker'],
    source: 'Website'
  },
];

const filters = ['All', 'Active', 'Inactive', 'VIP', 'Hot Lead'];
const sortOptions = ['Recent', 'A-Z', 'Last Contact', 'Company'];

export default function ContactsScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Recent');
  const [filteredContacts, setFilteredContacts] = useState(contactsData);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterAndSortContacts(text, selectedFilter, selectedSort);
  };

  const handleFilter = (filter: string) => {
    setSelectedFilter(filter);
    filterAndSortContacts(searchQuery, filter, selectedSort);
  };

  const handleSort = (sort: string) => {
    setSelectedSort(sort);
    filterAndSortContacts(searchQuery, selectedFilter, sort);
  };

  const filterAndSortContacts = (search: string, filter: string, sort: string) => {
    let filtered = [...contactsData];
    
    // Search filter
    if (search) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(search.toLowerCase()) ||
        contact.email.toLowerCase().includes(search.toLowerCase()) ||
        contact.company.toLowerCase().includes(search.toLowerCase()) ||
        contact.phone.includes(search)
      );
    }
    
    // Status filter
    if (filter === 'Active') {
      filtered = filtered.filter(contact => contact.status === 'active');
    } else if (filter === 'Inactive') {
      filtered = filtered.filter(contact => contact.status === 'inactive');
    } else if (filter === 'VIP') {
      filtered = filtered.filter(contact => contact.tags.includes('VIP'));
    } else if (filter === 'Hot Lead') {
      filtered = filtered.filter(contact => contact.tags.includes('Hot Lead'));
    }
    
    // Sort
    switch (sort) {
      case 'A-Z':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Last Contact':
        filtered.sort((a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime());
        break;
      case 'Company':
        filtered.sort((a, b) => a.company.localeCompare(b.company));
        break;
      default: // Recent
        filtered.sort((a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime());
    }
    
    setFilteredContacts(filtered);
  };

  const renderContact = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.contactCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/(app)/contacts/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.contactHeader}>
        <View style={[styles.avatar, { backgroundColor: item.status === 'active' ? '#4CAF50' : '#FF9800' }]}>
          <ThemedText type="title" style={styles.avatarText}>
            {item.name.charAt(0)}
          </ThemedText>
        </View>
        <View style={styles.contactMainInfo}>
          <View style={styles.nameRow}>
            <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
              {item.name}
            </ThemedText>
            {item.tags.includes('VIP') && (
              <View style={[styles.vipBadge, { backgroundColor: '#FFD700' }]}>
                <Ionicons name="star" size={12} color="#333" />
              </View>
            )}
          </View>
          <ThemedText style={[styles.title, { color: colors.textSecondary }]}>
            {item.title} • {item.company}
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.contactDetails, { borderTopColor: colors.border }]}>
        <View style={styles.detailItem}>
          <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.email}
          </ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.phone}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.contactFooter}>
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 2).map((tag: string, index: number) => (
            <View 
              key={index} 
              style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
            >
              <ThemedText style={[styles.tagText, { color: colors.primary }]}>
                {tag}
              </ThemedText>
            </View>
          ))}
          {item.tags.length > 2 && (
            <View style={[styles.tag, { backgroundColor: colors.border }]}>
              <ThemedText style={[styles.tagText, { color: colors.textSecondary }]}>
                +{item.tags.length - 2}
              </ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={[styles.lastContact, { color: colors.textSecondary }]}>
          Last contact: {new Date(item.lastContact).toLocaleDateString()}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerTop}>
          <ThemedText type="title" style={{ color: colors.text }}>
            Contacts
          </ThemedText>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="filter" size={20} color={colors.primary} />
            </TouchableOpacity>
            <Link href="/contacts/new" asChild>
              <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
                <Ionicons name="add" size={20} color="white" />
                <ThemedText type="defaultSemiBold" style={styles.addButtonText}>
                  Add Contact
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
            placeholder="Search contacts..."
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
        
        {/* Quick Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                { 
                  backgroundColor: selectedFilter === filter ? colors.primary + '20' : colors.background,
                  borderColor: selectedFilter === filter ? colors.primary : colors.border
                }
              ]}
              onPress={() => handleFilter(filter)}
            >
              <ThemedText style={[
                styles.filterText,
                { color: selectedFilter === filter ? colors.primary : colors.textSecondary }
              ]}>
                {filter}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <ThemedText style={[styles.sortLabel, { color: colors.textSecondary }]}>
            Sort by:
          </ThemedText>
          {sortOptions.map((sort) => (
            <TouchableOpacity
              key={sort}
              style={[
                styles.sortButton,
                { 
                  backgroundColor: selectedSort === sort ? colors.primary + '20' : 'transparent'
                }
              ]}
              onPress={() => handleSort(sort)}
            >
              <ThemedText style={[
                styles.sortText,
                { color: selectedSort === sort ? colors.primary : colors.textSecondary }
              ]}>
                {sort}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats Summary */}
      <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
        <View style={styles.statItem}>
          <ThemedText type="title" style={[styles.statNumber, { color: colors.primary }]}>
            {contactsData.length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <ThemedText type="title" style={[styles.statNumber, { color: '#4CAF50' }]}>
            {contactsData.filter(c => c.status === 'active').length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            Active
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <ThemedText type="title" style={[styles.statNumber, { color: '#FF9800' }]}>
            {contactsData.filter(c => c.tags.includes('VIP')).length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            VIP
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <ThemedText type="title" style={[styles.statNumber, { color: '#2196F3' }]}>
            {contactsData.filter(c => c.tags.includes('Hot Lead')).length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            Hot Leads
          </ThemedText>
        </View>
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
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
            <Ionicons name="people-outline" size={60} color={colors.textSecondary} />
            <ThemedText type="default" style={{ color: colors.textSecondary, marginTop: 10 }}>
              No contacts found
            </ThemedText>
            <ThemedText style={{ color: colors.textSecondary, fontSize: 12, marginTop: 5 }}>
              Try changing your search or filter
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
  filtersContainer: {
    marginBottom: 10,
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
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortLabel: {
    fontSize: 13,
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  listContent: {
    padding: 15,
  },
  contactCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactMainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  vipBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
  },
  moreButton: {
    padding: 4,
  },
  contactDetails: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  contactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  lastContact: {
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