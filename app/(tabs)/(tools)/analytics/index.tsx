import { useAppTheme } from '@/context/ThemeContext';
import { analyticsData, metrics, timeRanges } from '@/data/analytics';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';


const { width } = Dimensions.get('window');

const AnalyticsPage = () => {
  const { colors, isDark } = useAppTheme();
  const [selectedRange, setSelectedRange] = useState('month');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Refresh function
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  // Export function
  const handleExport = (type: 'pdf' | 'csv' | 'excel') => {
    setShowExport(false);
    alert(`Exporting data as ${type.toUpperCase()}`);
  };

  // Metric Card Component
  const MetricCard = ({ metric }: any) => (
    <TouchableOpacity 
      onPress={() => setSelectedMetric(metric.key)}
      activeOpacity={0.7}
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        flex: 1,
        minWidth: (width - 52) / 2,
        borderWidth: 1,
        borderColor: selectedMetric === metric.key ? metric.color : colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.1 : 0.05,
        shadowRadius: 8,
        elevation: isDark ? 4 : 2
      }}
    >
      <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
        <View style={{
          width: 40, height: 40, borderRadius: 12,
          backgroundColor: isDark ? `${metric.color}30` : `${metric.color}15`,
          justifyContent: 'center', alignItems: 'center',
          marginRight: 12
        }}>
          <Feather name={metric.icon} size={20} color={metric.color} />
        </View>
        <Text style={{fontSize: 14, fontWeight: '500', color: colors.textSecondary}}>
          {metric.label}
        </Text>
      </View>
      
      <Text style={{fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 8}}>
        {metric.value}
      </Text>
      
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Feather 
            name={metric.trend === 'up' ? 'arrow-up-right' : 'arrow-down-right'} 
            size={14} 
            color={metric.trend === 'up' ? (isDark ? '#34D399' : '#10B981') : (isDark ? '#F87171' : '#EF4444')} 
          />
          <Text style={{
            fontSize: 12, fontWeight: '600', marginLeft: 4,
            color: metric.trend === 'up' ? (isDark ? '#34D399' : '#10B981') : (isDark ? '#F87171' : '#EF4444')
          }}>
            {metric.change}
          </Text>
        </View>
        <Text style={{fontSize: 11, color: colors.textSecondary}}>vs last month</Text>
      </View>
    </TouchableOpacity>
  );

  // Funnel Component
  const LeadsFunnel = () => (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 16,
      marginTop: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.1 : 0.05,
      shadowRadius: 8,
      elevation: isDark ? 4 : 2
    }}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <Text style={{fontSize: 18, fontWeight: '600', color: colors.text}}>Leads Funnel</Text>
        <TouchableOpacity>
          <Feather name="more-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={{gap: 12}}>
        {analyticsData.leadsByStatus.map((stage) => {
          const stageColor = isDark 
            ? stage.status === 'New' ? '#60A5FA'
              : stage.status === 'Contacted' ? '#34D399'
              : stage.status === 'Qualified' ? '#FBBF24'
              : stage.status === 'Proposal' ? '#A78BFA'
              : stage.status === 'Negotiation' ? '#F87171'
              : '#9CA3AF'
            : stage.color;
          
          return (
            <View key={stage.status} style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
              <View style={{width: 40, alignItems: 'center'}}>
                <View style={{
                  width: 20, height: 32,
                  backgroundColor: stageColor,
                  borderTopLeftRadius: 4, borderTopRightRadius: 4,
                  opacity: isDark ? 0.9 : 0.8
                }} />
                <Text style={{fontSize: 12, fontWeight: '600', color: colors.text, marginTop: 4}}>
                  {stage.count}
                </Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={{fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 2}}>
                  {stage.status}
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                  <View style={{
                    height: 6, borderRadius: 3, backgroundColor: colors.border,
                    flex: 1, marginRight: 8
                  }}>
                    <View style={{
                      height: 6, borderRadius: 3, backgroundColor: stageColor,
                      width: `${stage.percentage}%`
                    }} />
                  </View>
                  <Text style={{fontSize: 12, color: colors.textSecondary}}>{stage.percentage}%</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  // Activities Chart
  const ActivitiesChart = () => (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 16,
      marginTop: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.1 : 0.05,
      shadowRadius: 8,
      elevation: isDark ? 4 : 2
    }}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <Text style={{fontSize: 18, fontWeight: '600', color: colors.text}}>Activities</Text>
        <TouchableOpacity>
          <Feather name="more-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        {analyticsData.activitiesByType.map((activity) => {
          const activityColor = isDark
            ? activity.type === 'call' ? '#34D399'
              : activity.type === 'meeting' ? '#60A5FA'
              : activity.type === 'email' ? '#F87171'
              : activity.type === 'task' ? '#FBBF24'
              : '#A78BFA'
            : activity.color;
          
          return (
            <View key={activity.type} style={{alignItems: 'center', flex: 1}}>
              <View style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: isDark ? `${activityColor}30` : `${activityColor}15`,
                justifyContent: 'center', alignItems: 'center',
                marginBottom: 8
              }}>
                <Feather name={activity.icon as any} size={20} color={activityColor} />
              </View>
              <Text style={{fontSize: 16, fontWeight: '700', color: colors.text}}>
                {activity.count}
              </Text>
              <Text style={{fontSize: 12, color: colors.textSecondary, marginTop: 4}}>
                {activity.type}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  // Weekly Trends
  const WeeklyTrends = () => {
    const leadsColor = isDark ? '#60A5FA' : '#3B82F6';
    const activitiesColor = isDark ? '#34D399' : '#10B981';
    
    return (
      <View style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.1 : 0.05,
        shadowRadius: 8,
        elevation: isDark ? 4 : 2
      }}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
          <Text style={{fontSize: 18, fontWeight: '600', color: colors.text}}>Weekly Trends</Text>
          <TouchableOpacity>
            <Feather name="more-vertical" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120}}>
          {analyticsData.weeklyTrends.map((day) => {
            const maxActivities = 40;
            const barHeight = (day.activities / maxActivities) * 80;
            
            return (
              <View key={day.day} style={{alignItems: 'center'}}>
                <View style={{flexDirection: 'row', alignItems: 'flex-end', gap: 2}}>
                  <View style={{
                    width: 6, height: barHeight * 0.7,
                    backgroundColor: leadsColor, borderRadius: 3
                  }} />
                  <View style={{
                    width: 6, height: barHeight,
                    backgroundColor: activitiesColor, borderRadius: 3
                  }} />
                </View>
                <Text style={{fontSize: 12, color: colors.textSecondary, marginTop: 8}}>
                  {day.day}
                </Text>
                <Text style={{fontSize: 10, color: colors.textSecondary, marginTop: 2}}>
                  {day.activities}
                </Text>
              </View>
            );
          })}
        </View>
        
        <View style={{flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20}}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
            <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: leadsColor}} />
            <Text style={{fontSize: 12, color: colors.textSecondary}}>Leads</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
            <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: activitiesColor}} />
            <Text style={{fontSize: 12, color: colors.textSecondary}}>Activities</Text>
          </View>
        </View>
      </View>
    );
  };

  // Top Contacts
  const TopContacts = () => (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.1 : 0.05,
      shadowRadius: 8,
      elevation: isDark ? 4 : 2
    }}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <Text style={{fontSize: 18, fontWeight: '600', color: colors.text}}>Top Contacts</Text>
        <TouchableOpacity>
          <Feather name="more-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{minWidth: width - 72, gap: 12}}>
          {analyticsData.topContacts.map((contact) => {
            const statusBgColor = isDark
              ? contact.status === 'hot' ? 'rgba(248, 113, 113, 0.2)'
                : contact.status === 'warm' ? 'rgba(251, 191, 36, 0.2)'
                : colors.border
              : contact.status === 'hot' ? '#FEE2E2'
                : contact.status === 'warm' ? '#FEF3C7'
                : '#E5E7EB';
            
            const statusColor = isDark
              ? contact.status === 'hot' ? '#F87171'
                : contact.status === 'warm' ? '#FBBF24'
                : colors.textSecondary
              : contact.status === 'hot' ? '#DC2626'
                : contact.status === 'warm' ? '#D97706'
                : '#6B7280';
            
            return (
              <View key={contact.id} style={{
                flexDirection: 'row', alignItems: 'center',
                padding: 12, backgroundColor: isDark ? colors.border : '#F9FAFB',
                borderRadius: 12, borderWidth: 1, borderColor: colors.border
              }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: colors.primary,
                  justifyContent: 'center', alignItems: 'center',
                  marginRight: 12
                }}>
                  <Text style={{fontSize: 16, fontWeight: '600', color: '#FFFFFF'}}>
                    {contact.name.charAt(0)}
                  </Text>
                </View>
                
                <View style={{flex: 1}}>
                  <Text style={{fontSize: 14, fontWeight: '600', color: colors.text}}>
                    {contact.name}
                  </Text>
                  <Text style={{fontSize: 12, color: colors.textSecondary, marginTop: 2}}>
                    {contact.company}
                  </Text>
                </View>
                
                <View style={{alignItems: 'flex-end'}}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: statusBgColor,
                    paddingHorizontal: 8, paddingVertical: 4,
                    borderRadius: 12, marginBottom: 4
                  }}>
                    <Feather name="activity" size={12} color={statusColor} />
                    <Text style={{
                      fontSize: 12, fontWeight: '600', marginLeft: 4,
                      color: statusColor
                    }}>
                      {contact.activities}
                    </Text>
                  </View>
                  
                  <Text style={{fontSize: 14, fontWeight: '700', color: isDark ? '#34D399' : '#059669'}}>
                    {contact.value}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  // Filter Modal
  const FilterModal = () => (
    <Modal visible={showFilter} transparent animationType="fade">
      <TouchableOpacity 
        style={{flex: 1, backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}
        activeOpacity={1}
        onPress={() => setShowFilter(false)}
      >
        <View style={{
          backgroundColor: colors.card, borderRadius: 20, padding: 24,
          width: width - 40, maxHeight: '80%'
        }}>
          <Text style={{fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 20}}>
            Filter Analytics
          </Text>
          
          <View style={{gap: 16,}}>
            <View>
              <Text style={{fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8}}>
                Date Range
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{flexDirection: 'row', gap: 8}}>
                  {timeRanges.map((range) => (
                    <TouchableOpacity
                      key={range.id}
                      style={{
                        paddingHorizontal: 16, paddingVertical: 8,
                        borderRadius: 20, borderWidth: 1,
                        borderColor: selectedRange === range.id ? colors.primary : colors.border,
                        backgroundColor: selectedRange === range.id ? colors.primary : 'transparent'
                      }}
                      onPress={() => setSelectedRange(range.id)}
                    >
                      <Text style={{
                        fontSize: 14, fontWeight: '500',
                        color: selectedRange === range.id ? '#FFFFFF' : colors.textSecondary
                      }}>
                        {range.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            
            <View>
              <Text style={{fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8}}>
                Lead Status
              </Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                {analyticsData.leadsByStatus.map((status) => (
                  <TouchableOpacity
                    key={status.status}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 6,
                      borderRadius: 16, borderWidth: 1,
                      borderColor: colors.border, backgroundColor: isDark ? colors.border : '#F9FAFB'
                    }}
                  >
                    <Text style={{fontSize: 12, color: colors.textSecondary}}>
                      {status.status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={{flexDirection: 'row', gap: 12, marginTop: 20}}>
              <TouchableOpacity 
                style={{flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: isDark ? colors.border : '#F3F4F6', alignItems: 'center'}}
                onPress={() => setShowFilter(false)}
              >
                <Text style={{fontSize: 16, fontWeight: '600', color: colors.text}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center'}}
                onPress={() => {
                  setShowFilter(false);
                  handleRefresh();
                }}
              >
                <Text style={{fontSize: 16, fontWeight: '600', color: '#FFFFFF'}}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Export Modal
  const ExportModal = () => (
    <Modal visible={showExport} transparent animationType="fade">
      <TouchableOpacity 
        style={{flex: 1, backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}
        activeOpacity={1}
        onPress={() => setShowExport(false)}
      >
        <View style={{
          backgroundColor: colors.card, borderRadius: 20, padding: 24,
          width: width - 40
        }}>
          <Text style={{fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 20}}>
            Export Data
          </Text>
          
          <View style={{gap: 12}}>
            <TouchableOpacity 
              style={{
                flexDirection: 'row', alignItems: 'center',
                padding: 16, borderRadius: 12,
                backgroundColor: isDark ? colors.border : '#F9FAFB', borderWidth: 1, borderColor: colors.border
              }}
              onPress={() => handleExport('pdf')}
            >
              <Feather name="file-text" size={20} color={isDark ? '#F87171' : '#EF4444'} style={{marginRight: 12}} />
              <View style={{flex: 1}}>
                <Text style={{fontSize: 16, fontWeight: '600', color: colors.text}}>PDF Report</Text>
                <Text style={{fontSize: 12, color: colors.textSecondary, marginTop: 2}}>Best for printing</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{
                flexDirection: 'row', alignItems: 'center',
                padding: 16, borderRadius: 12,
                backgroundColor: isDark ? colors.border : '#F9FAFB', borderWidth: 1, borderColor: colors.border
              }}
              onPress={() => handleExport('csv')}
            >
              <Feather name="file" size={20} color={isDark ? '#34D399' : '#10B981'} style={{marginRight: 12}} />
              <View style={{flex: 1}}>
                <Text style={{fontSize: 16, fontWeight: '600', color: colors.text}}>CSV Export</Text>
                <Text style={{fontSize: 12, color: colors.textSecondary, marginTop: 2}}>Spreadsheet compatible</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{
                flexDirection: 'row', alignItems: 'center',
                padding: 16, borderRadius: 12,
                backgroundColor: isDark ? colors.border : '#F9FAFB', borderWidth: 1, borderColor: colors.border
              }}
              onPress={() => handleExport('excel')}
            >
              <Feather name="file" size={20} color={isDark ? '#60A5FA' : '#3B82F6'} style={{marginRight: 12}} />
              <View style={{flex: 1}}>
                <Text style={{fontSize: 16, fontWeight: '600', color: colors.text}}>Excel Export</Text>
                <Text style={{fontSize: 12, color: colors.textSecondary, marginTop: 2}}>Full data with formatting</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={colors.card} 
      />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16,
        backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border
      }}>
        <View>
          <Text style={{fontSize: 28, fontWeight: '700', color: colors.text}}>Analytics</Text>
          <Text style={{fontSize: 14, color: colors.textSecondary, marginTop: 2}}>Track your performance</Text>
        </View>
        
        <View style={{flexDirection: 'row', gap: 8}}>
          <TouchableOpacity 
            style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: isDark ? colors.border : '#F9FAFB', borderWidth: 1, borderColor: colors.border,
              justifyContent: 'center', alignItems: 'center'
            }}
            onPress={() => setShowFilter(true)}
          >
            <Feather name="filter" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: isDark ? colors.border : '#F9FAFB', borderWidth: 1, borderColor: colors.border,
              justifyContent: 'center', alignItems: 'center'
            }}
            onPress={() => setShowExport(true)}
          >
            <Feather name="download" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Range Tabs - Compact */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{backgroundColor: colors.card, paddingVertical: 12}}
        contentContainerStyle={{paddingHorizontal: 16, gap: 8, marginBottom: 100}}
      >
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range.id}
            style={{
              paddingHorizontal: 16, paddingVertical: 8,
              borderRadius: 20, minHeight: 36, justifyContent: 'center',
              backgroundColor: selectedRange === range.id ? colors.primary : (isDark ? colors.border : '#F3F4F6'),
              borderWidth: 1, borderColor: selectedRange === range.id ? colors.primary : colors.border
            }}
            onPress={() => setSelectedRange(range.id)}
          >
            <Text style={{
              fontSize: 14, fontWeight: '500',
              color: selectedRange === range.id ? '#FFFFFF' : colors.textSecondary
            }}>
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
      
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Metrics Grid */}
        <View style={{
          flexDirection: 'row', flexWrap: 'wrap',
          paddingHorizontal: 16, paddingTop: 16, gap: 12,
        }}>
          {metrics.map((metric) => (
            <MetricCard key={metric.key} metric={metric} />
          ))}
        </View>

        {/* Analytics Sections */}
        <LeadsFunnel />
        <ActivitiesChart />
        <WeeklyTrends />
        <TopContacts />
        
        {/* Bottom Spacing */}
        <View style={{height: 100}} />
      </ScrollView>

      {/* Tab Navigation */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', backgroundColor: colors.card,
        borderTopWidth: 1, borderTopColor: colors.border,
        paddingHorizontal: 16, paddingVertical: 12
      }}>
        {['overview', 'leads', 'activities', 'reports'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={{
              flex: 1, alignItems: 'center', paddingVertical: 8,
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab ? colors.primary : 'transparent'
            }}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={{
              fontSize: 12, fontWeight: '600',
              color: activeTab === tab ? colors.primary : colors.textSecondary,
              textTransform: 'capitalize'
            }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modals */}
      <FilterModal />
      <ExportModal />
    </SafeAreaView>
  );
};

export default AnalyticsPage;