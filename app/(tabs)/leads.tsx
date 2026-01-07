import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
import { leadsData, leadSources, leadStages, priorities } from '@/data/leads';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LeadsScreen() {
  const { colors } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [filteredLeads, setFilteredLeads] = useState(leadsData);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addLeadModalVisible, setAddLeadModalVisible] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    value: '',
    stage: 'New',
    source: 'Website',
    expectedClose: '',
    priority: 'Medium',
    notes: ''
  });

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
    
    if (search) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.contact.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone.includes(search)
      );
    }
    
    if (stage !== 'All') {
      filtered = filtered.filter(lead => lead.stage === stage);
    }
    
    if (source !== 'All') {
      filtered = filtered.filter(lead => lead.source === source);
    }
    
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleAddLead = () => {
    // Generate a new ID
    const newId = (leadsData.length + 1).toString();
    
    // Create new lead object
    const leadToAdd = {
      id: newId,
      name: newLead.name,
      contact: newLead.contact,
      email: newLead.email,
      phone: newLead.phone,
      value: parseInt(newLead.value) || 0,
      stage: newLead.stage,
      source: newLead.source,
      created: new Date().toISOString().split('T')[0],
      expectedClose: newLead.expectedClose,
      priority: newLead.priority,
      notes: newLead.notes
    };
    
    // Add to leadsData
    leadsData.unshift(leadToAdd);
    
    // Update filtered leads
    filterLeads(searchQuery, selectedStage, selectedSource, selectedPriority);
    
    // Reset form and close modal
    setNewLead({
      name: '',
      contact: '',
      email: '',
      phone: '',
      value: '',
      stage: 'New',
      source: 'Website',
      expectedClose: '',
      priority: 'Medium',
      notes: ''
    });
    
    setAddLeadModalVisible(false);
  };

  const openLeadDetails = (lead: any) => {
    setSelectedLead(lead);
    setModalVisible(true);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const renderLead = (item: any) => {
    const daysToClose = calculateDaysToClose(item.expectedClose);
    const stageColor = getStageColor(item.stage);
    const priorityColor = getPriorityColor(item.priority);
    
    return (
      <TouchableOpacity 
        key={item.id}
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={() => openLeadDetails(item)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <ThemedText type="defaultSemiBold" style={{ color: colors.text, fontSize: 16 }}>
                {item.name}
              </ThemedText>
              <View style={{ 
                width: 24, 
                height: 24, 
                borderRadius: 12, 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundColor: priorityColor + '20' 
              }}>
                <Ionicons name={getPriorityIcon(item.priority) as any} size={14} color={priorityColor} />
              </View>
            </View>
            <ThemedText style={{ color: colors.textSecondary, fontSize: 13 }}>
              {item.contact} • {item.email}
            </ThemedText>
          </View>
          
          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText type="defaultSemiBold" style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold' }}>
              {formatCurrency(item.value)}
            </ThemedText>
          </View>
        </View>
        
        <View style={{ gap: 8 }}>
          <View style={{ 
            alignSelf: 'flex-start', 
            paddingHorizontal: 12, 
            paddingVertical: 4, 
            borderRadius: 12,
            backgroundColor: stageColor + '15' 
          }}>
            <ThemedText style={{ color: stageColor, fontSize: 12, fontWeight: '600' }}>
              {item.stage}
            </ThemedText>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="business-outline" size={14} color={colors.textSecondary} />
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                Source: {item.source}
              </ThemedText>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <ThemedText style={{ 
                color: daysToClose <= 7 ? '#F44336' : daysToClose <= 30 ? '#FF9800' : colors.textSecondary,
                fontSize: 12 
              }}>
                {daysToClose > 0 ? `${daysToClose}d to close` : 'Past due'}
              </ThemedText>
            </View>
          </View>
          
          {item.notes && (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 6, 
              paddingTop: 8, 
              borderTopWidth: 1, 
              borderTopColor: '#f0f0f0' 
            }}>
              <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
              <ThemedText 
                style={{ color: colors.textSecondary, fontSize: 12, flex: 1 }}
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

  const renderLeadDetailsModal = () => {
    if (!selectedLead) return null;

    const stageColor = getStageColor(selectedLead.stage);
    const priorityColor = getPriorityColor(selectedLead.priority);
    const daysToClose = calculateDaysToClose(selectedLead.expectedClose);

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ 
            backgroundColor: colors.card, 
            borderTopLeftRadius: 20, 
            borderTopRightRadius: 20, 
            maxHeight: '90%' 
          }}>
            <ScrollView style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <ThemedText type="title" style={{ color: colors.text, fontSize: 24 }}>
                  Lead Details
                </ThemedText>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={28} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="title" style={{ color: colors.text, fontSize: 20, marginBottom: 4 }}>
                      {selectedLead.name}
                    </ThemedText>
                    <ThemedText type="subtitle" style={{ color: colors.primary, fontSize: 16, marginBottom: 8 }}>
                      {formatCurrency(selectedLead.value)}
                    </ThemedText>
                  </View>
                  <View style={{ 
                    paddingHorizontal: 12, 
                    paddingVertical: 6, 
                    borderRadius: 16,
                    backgroundColor: priorityColor + '20' 
                  }}>
                    <Ionicons name={getPriorityIcon(selectedLead.priority) as any} size={16} color={priorityColor} />
                  </View>
                </View>

                <View style={{ 
                  alignSelf: 'flex-start', 
                  paddingHorizontal: 16, 
                  paddingVertical: 8, 
                  borderRadius: 16,
                  backgroundColor: stageColor + '15',
                  marginBottom: 16 
                }}>
                  <ThemedText style={{ color: stageColor, fontSize: 14, fontWeight: '600' }}>
                    {selectedLead.stage}
                  </ThemedText>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                  <TouchableOpacity 
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      gap: 8, 
                      paddingHorizontal: 16, 
                      paddingVertical: 10, 
                      borderRadius: 12,
                      backgroundColor: colors.primary + '15',
                      flex: 1 
                    }}
                    onPress={() => handleCall(selectedLead.phone)}
                  >
                    <Ionicons name="call" size={20} color={colors.primary} />
                    <ThemedText style={{ color: colors.primary, fontWeight: '500' }}>
                      Call
                    </ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      gap: 8, 
                      paddingHorizontal: 16, 
                      paddingVertical: 10, 
                      borderRadius: 12,
                      backgroundColor: colors.primary + '15',
                      flex: 1 
                    }}
                    onPress={() => handleEmail(selectedLead.email)}
                  >
                    <Ionicons name="mail" size={20} color={colors.primary} />
                    <ThemedText style={{ color: colors.primary, fontWeight: '500' }}>
                      Email
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ marginBottom: 24 }}>
                <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 12, fontSize: 16 }}>
                  Contact Information
                </ThemedText>
                
                <View style={{ 
                  backgroundColor: colors.background, 
                  borderRadius: 12, 
                  padding: 16,
                  gap: 12 
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText style={{ color: colors.textSecondary, flex: 1 }}>Contact Person</ThemedText>
                    <ThemedText style={{ color: colors.text, flex: 1, textAlign: 'right' }}>{selectedLead.contact}</ThemedText>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText style={{ color: colors.textSecondary, flex: 1 }}>Email</ThemedText>
                    <ThemedText style={{ color: colors.text, flex: 1, textAlign: 'right' }}>{selectedLead.email}</ThemedText>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText style={{ color: colors.textSecondary, flex: 1 }}>Phone</ThemedText>
                    <ThemedText style={{ color: colors.text, flex: 1, textAlign: 'right' }}>{selectedLead.phone}</ThemedText>
                  </View>
                </View>
              </View>

              <View style={{ marginBottom: 24 }}>
                <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 12, fontSize: 16 }}>
                  Lead Information
                </ThemedText>
                
                <View style={{ 
                  backgroundColor: colors.background, 
                  borderRadius: 12, 
                  padding: 16,
                  gap: 12 
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText style={{ color: colors.textSecondary, flex: 1 }}>Source</ThemedText>
                    <ThemedText style={{ color: colors.text, flex: 1, textAlign: 'right' }}>{selectedLead.source}</ThemedText>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText style={{ color: colors.textSecondary, flex: 1 }}>Created Date</ThemedText>
                    <ThemedText style={{ color: colors.text, flex: 1, textAlign: 'right' }}>{formatDate(selectedLead.created)}</ThemedText>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText style={{ color: colors.textSecondary, flex: 1 }}>Expected Close</ThemedText>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <ThemedText style={{ 
                        color: daysToClose <= 7 ? '#F44336' : daysToClose <= 30 ? '#FF9800' : colors.text,
                        textAlign: 'right' 
                      }}>
                        {formatDate(selectedLead.expectedClose)} ({daysToClose > 0 ? `${daysToClose} days` : 'Past due'})
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>

              {selectedLead.notes && (
                <View style={{ marginBottom: 24 }}>
                  <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 12, fontSize: 16 }}>
                    Notes
                  </ThemedText>
                  
                  <View style={{ 
                    backgroundColor: colors.background, 
                    borderRadius: 12, 
                    padding: 16 
                  }}>
                    <ThemedText style={{ color: colors.text, lineHeight: 20 }}>
                      {selectedLead.notes}
                    </ThemedText>
                  </View>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    paddingVertical: 14, 
                    borderRadius: 12,
                    backgroundColor: colors.primary,
                    alignItems: 'center'
                  }}
                  onPress={() => {
                    setModalVisible(false);
                    // Here you can navigate to edit page or open edit modal
                  }}
                >
                  <ThemedText style={{ color: 'white', fontWeight: '600' }}>
                    Edit Lead
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={{ 
                    flex: 1, 
                    paddingVertical: 14, 
                    borderRadius: 12,
                    backgroundColor: colors.background,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                  onPress={() => setModalVisible(false)}
                >
                  <ThemedText style={{ color: colors.textSecondary, fontWeight: '600' }}>
                    Close
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderAddLeadModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addLeadModalVisible}
      onRequestClose={() => setAddLeadModalVisible(false)}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ 
          backgroundColor: colors.card, 
          borderTopLeftRadius: 20, 
          borderTopRightRadius: 20, 
          maxHeight: '90%' 
        }}>
          <ScrollView style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <ThemedText type="title" style={{ color: colors.text, fontSize: 24 }}>
                Add New Lead
              </ThemedText>
              <TouchableOpacity onPress={() => {
                setAddLeadModalVisible(false);
                setNewLead({
                  name: '',
                  contact: '',
                  email: '',
                  phone: '',
                  value: '',
                  stage: 'New',
                  source: 'Website',
                  expectedClose: '',
                  priority: 'Medium',
                  notes: ''
                });
              }}>
                <Ionicons name="close" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 16 }}>
              <View>
                <ThemedText style={{ color: colors.text, marginBottom: 6, fontSize: 14, fontWeight: '500' }}>
                  Company Name *
                </ThemedText>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 16,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                  placeholder="Enter company name"
                  placeholderTextColor={colors.textSecondary}
                  value={newLead.name}
                  onChangeText={(text) => setNewLead({...newLead, name: text})}
                />
              </View>

              <View>
                <ThemedText style={{ color: colors.text, marginBottom: 6, fontSize: 14, fontWeight: '500' }}>
                  Contact Person *
                </ThemedText>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 16,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                  placeholder="Enter contact person name"
                  placeholderTextColor={colors.textSecondary}
                  value={newLead.contact}
                  onChangeText={(text) => setNewLead({...newLead, contact: text})}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ color: colors.text, marginBottom: 6, fontSize: 14, fontWeight: '500' }}>
                    Email *
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 16,
                      color: colors.text,
                      borderWidth: 1,
                      borderColor: colors.border
                    }}
                    placeholder="email@company.com"
                    placeholderTextColor={colors.textSecondary}
                    value={newLead.email}
                    onChangeText={(text) => setNewLead({...newLead, email: text})}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ color: colors.text, marginBottom: 6, fontSize: 14, fontWeight: '500' }}>
                    Phone *
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 16,
                      color: colors.text,
                      borderWidth: 1,
                      borderColor: colors.border
                    }}
                    placeholder="+1234567890"
                    placeholderTextColor={colors.textSecondary}
                    value={newLead.phone}
                    onChangeText={(text) => setNewLead({...newLead, phone: text})}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ color: colors.text, marginBottom: 6, fontSize: 14, fontWeight: '500' }}>
                    Deal Value *
                  </ThemedText>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ position: 'absolute', left: 14, zIndex: 1 }}>
                      <ThemedText style={{ color: colors.textSecondary, fontSize: 16 }}>$</ThemedText>
                    </View>
                    <TextInput
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: 12,
                        padding: 14,
                        paddingLeft: 30,
                        fontSize: 16,
                        color: colors.text,
                        borderWidth: 1,
                        borderColor: colors.border,
                        flex: 1
                      }}
                      placeholder="50000"
                      placeholderTextColor={colors.textSecondary}
                      value={newLead.value}
                      onChangeText={(text) => setNewLead({...newLead, value: text})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ color: colors.text, marginBottom: 6, fontSize: 14, fontWeight: '500' }}>
                    Expected Close Date
                  </ThemedText>
                  <TextInput
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 16,
                      color: colors.text,
                      borderWidth: 1,
                      borderColor: colors.border
                    }}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textSecondary}
                    value={newLead.expectedClose}
                    onChangeText={(text) => setNewLead({...newLead, expectedClose: text})}
                  />
                </View>
              </View>

              <View>
                <ThemedText style={{ color: colors.text, marginBottom: 6, fontSize: 14, fontWeight: '500' }}>
                  Stage
                </ThemedText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {leadStages.map((stage) => (
                    <TouchableOpacity
                      key={stage.id}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 16,
                        borderWidth: 1,
                        backgroundColor: newLead.stage === stage.label ? stage.color + '20' : colors.background,
                        borderColor: newLead.stage === stage.label ? stage.color : colors.border
                      }}
                      onPress={() => setNewLead({...newLead, stage: stage.label})}
                    >
                      <ThemedText style={{
                        color: newLead.stage === stage.label ? stage.color : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: '500'
                      }}>
                        {stage.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <ThemedText style={{ color: colors.text, marginBottom: 6, fontSize: 14, fontWeight: '500' }}>
                  Source
                </ThemedText>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={{ maxHeight: 40 }}
                >
                  {leadSources.map((source) => (
                    <TouchableOpacity
                      key={source}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 16,
                        borderWidth: 1,
                        marginRight: 8,
                        backgroundColor: newLead.source === source ? colors.primary + '20' : colors.background,
                        borderColor: newLead.source === source ? colors.primary : colors.border
                      }}
                      onPress={() => setNewLead({...newLead, source})}
                    >
                      <ThemedText style={{
                        color: newLead.source === source ? colors.primary : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: '500'
                      }}>
                        {source}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View>
                <ThemedText style={{ color: colors.text, marginBottom: 6, fontSize: 14, fontWeight: '500' }}>
                  Priority
                </ThemedText>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {priorities.map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 16,
                        borderWidth: 1,
                        gap: 6,
                        backgroundColor: newLead.priority === priority ? getPriorityColor(priority) + '20' : colors.background,
                        borderColor: newLead.priority === priority ? getPriorityColor(priority) : colors.border,
                        flex: 1
                      }}
                      onPress={() => setNewLead({...newLead, priority})}
                    >
                      <Ionicons 
                        name={getPriorityIcon(priority) as any} 
                        size={16} 
                        color={newLead.priority === priority ? getPriorityColor(priority) : colors.textSecondary} 
                      />
                      <ThemedText style={{
                        color: newLead.priority === priority ? getPriorityColor(priority) : colors.textSecondary,
                        fontSize: 14,
                        fontWeight: '500'
                      }}>
                        {priority}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <ThemedText style={{ color: colors.text, marginBottom: 6, fontSize: 14, fontWeight: '500' }}>
                  Notes
                </ThemedText>
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 16,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                    minHeight: 100,
                    textAlignVertical: 'top'
                  }}
                  placeholder="Add any notes about this lead..."
                  placeholderTextColor={colors.textSecondary}
                  value={newLead.notes}
                  onChangeText={(text) => setNewLead({...newLead, notes: text})}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 20 }}>
              <TouchableOpacity 
                style={{ 
                  flex: 1, 
                  paddingVertical: 14, 
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: 'center'
                }}
                onPress={handleAddLead}
              >
                <ThemedText style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                  Save Lead
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ 
                  flex: 1, 
                  paddingVertical: 14, 
                  borderRadius: 12,
                  backgroundColor: colors.background,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border
                }}
                onPress={() => setAddLeadModalVisible(false)}
              >
                <ThemedText style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 16 }}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
        <View style={{ 
          padding: 20, 
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0' 
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <ThemedText type="title" style={{ color: colors.text, fontSize: 24 }}>
              Leads Pipeline
            </ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundColor: colors.primary + '15' 
              }}>
                <Ionicons name="stats-chart" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  paddingHorizontal: 16, 
                  paddingVertical: 10, 
                  borderRadius: 20,
                  backgroundColor: colors.primary,
                  gap: 8 
                }}
                onPress={() => setAddLeadModalVisible(true)}
              >
                <Ionicons name="add" size={20} color="white" />
                <ThemedText type="defaultSemiBold" style={{ color: 'white', fontSize: 14 }}>
                  Add Lead
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            paddingHorizontal: 12, 
            paddingVertical: 10, 
            borderRadius: 12,
            backgroundColor: colors.background,
            marginBottom: 15 
          }}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              style={{ flex: 1, fontSize: 16, color: colors.text }}
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
          
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            marginBottom: 15, 
            padding: 10, 
            borderRadius: 12,
            backgroundColor: colors.background,
            flexWrap: 'wrap',
            gap: 8 
          }}>
            {leadStages.map((stage) => {
              const count = leadsData.filter(lead => lead.stage === stage.label).length;
              const totalValue = leadsData
                .filter(lead => lead.stage === stage.label)
                .reduce((sum, lead) => sum + lead.value, 0);
              
              return (
                <TouchableOpacity
                  key={stage.id}
                  style={{
                    alignItems: 'center',
                    padding: 8,
                    borderRadius: 10,
                    borderWidth: 1,
                    minWidth: 80,
                    backgroundColor: selectedStage === stage.label ? stage.color + '20' : colors.card,
                    borderColor: stage.color
                  }}
                  onPress={() => handleStageFilter(stage.label)}
                >
                  <View style={{ width: 8, height: 8, borderRadius: 4, marginBottom: 6, backgroundColor: stage.color }} />
                  <ThemedText style={{ color: colors.text, fontSize: 10, fontWeight: '500', marginBottom: 4 }}>
                    {stage.label}
                  </ThemedText>
                  <ThemedText style={{ color: stage.color, fontSize: 16, fontWeight: 'bold', marginBottom: 2 }}>
                    {count}
                  </ThemedText>
                  <ThemedText style={{ color: colors.textSecondary, fontSize: 9 }}>
                    {formatCurrency(totalValue)}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
          
          <View style={{ marginBottom: 12 }}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={{ maxHeight: 40 }}
            >
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  marginRight: 8,
                  backgroundColor: selectedSource === 'All' ? colors.primary + '20' : colors.background,
                  borderColor: selectedSource === 'All' ? colors.primary : colors.border
                }}
                onPress={() => handleSourceFilter('All')}
              >
                <ThemedText style={{
                  color: selectedSource === 'All' ? colors.primary : colors.textSecondary,
                  fontSize: 13,
                  fontWeight: '500'
                }}>
                  All Sources
                </ThemedText>
              </TouchableOpacity>
              
              {leadSources.map((source) => (
                <TouchableOpacity
                  key={source}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    marginRight: 8,
                    backgroundColor: selectedSource === source ? colors.primary + '20' : colors.background,
                    borderColor: selectedSource === source ? colors.primary : colors.border
                  }}
                  onPress={() => handleSourceFilter(source)}
                >
                  <ThemedText style={{
                    color: selectedSource === source ? colors.primary : colors.textSecondary,
                    fontSize: 13,
                    fontWeight: '500'
                  }}>
                    {source}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderWidth: 1,
                  gap: 6,
                  backgroundColor: selectedPriority === priority ? getPriorityColor(priority) + '20' : colors.background,
                  borderColor: selectedPriority === priority ? getPriorityColor(priority) : colors.border
                }}
                onPress={() => handlePriorityFilter(priority)}
              >
                <Ionicons 
                  name={getPriorityIcon(priority) as any} 
                  size={16} 
                  color={selectedPriority === priority ? getPriorityColor(priority) : colors.textSecondary} 
                />
                <ThemedText style={{
                  color: selectedPriority === priority ? getPriorityColor(priority) : colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '500'
                }}>
                  {priority}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ 
          marginHorizontal: 15, 
          marginTop: 15, 
          marginBottom: 15, 
          padding: 16, 
          borderRadius: 16,
          backgroundColor: colors.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2 
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="trending-up" size={24} color={colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 2 }}>
                Total Pipeline Value
              </ThemedText>
              <ThemedText type="title" style={{ color: colors.primary, fontSize: 20, fontWeight: 'bold' }}>
                {formatCurrency(leadsData.reduce((sum, lead) => sum + lead.value, 0))}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 11 }}>
            {leadsData.length} Leads • {leadsData.filter(l => l.stage === 'Won').length} Won • {leadsData.filter(l => l.stage === 'Lost').length} Lost
          </ThemedText>
        </View>

        <View style={{ paddingHorizontal: 15 }}>
          <View style={{ marginBottom: 15 }}>
            <ThemedText type="subtitle" style={{ color: colors.text, fontSize: 18 }}>
              Leads ({filteredLeads.length})
            </ThemedText>
          </View>

          {filteredLeads.length > 0 ? (
            <View style={{ gap: 12 }}>
              {filteredLeads.map(renderLead)}
            </View>
          ) : (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 50 }}>
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

        <View style={{ height: 100 }} />
      </ScrollView>

      {renderLeadDetailsModal()}
      {renderAddLeadModal()}
    </SafeAreaView>
  );
}