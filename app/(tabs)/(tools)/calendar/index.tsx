import { useAppTheme } from '@/context/ThemeContext';
import {
    CalendarEvent,
    calendarEvents,
    eventConfig,
    eventTypes,
    formatDate,
    generateMonthDays,
    months,
    statusConfig,
    updateEventStatus,
    weekDays
} from '@/data/calendar';
import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const CalendarPage = () => {
  const { colors, isDark } = useAppTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('agenda');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showMonthCalendar, setShowMonthCalendar] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentMonthName = months[currentMonth];
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Initialize calendar
  useEffect(() => {
    const days = generateMonthDays(currentYear, currentMonth);
    setCalendarDays(days);
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, [currentDate]);

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // Get events for selected date
  const getEventsForDate = (date: string) => {
    return calendarEvents.filter(event => {
      const matchesDate = event.date === date;
      const matchesType = filterType === 'all' || event.type === filterType;
      const matchesSearch = searchQuery === '' || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.contactName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesDate && matchesType && matchesSearch;
    });
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  // Get all events for agenda view
  const getAllEventsForAgenda = () => {
    const allEvents = [...calendarEvents];
    return allEvents.sort((a, b) => {
      // Sort by date then by time
      if (a.date === b.date) {
        return a.time.localeCompare(b.time);
      }
      return a.date.localeCompare(b.date);
    });
  };

  const agendaEvents = getAllEventsForAgenda();

  // Calendar Day Component - Enhanced Design
  const CalendarDayCell = ({ day }: { day: any }) => {
    const isSelected = day.date === selectedDate;
    const hasEvents = day.events.length > 0;
    
    return (
      <TouchableOpacity
        onPress={() => setSelectedDate(day.date)}
        activeOpacity={0.8}
        style={{
          width: (width - 40) / 7,
          height: 65,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isSelected ? colors.primary : 'transparent',
          borderRadius: 16,
          marginVertical: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background gradient for today */}
        {day.isToday && !isSelected && (
          <View style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
            borderRadius: 16,
          }} />
        )}
        
        {/* Decorative border for selected */}
        {isSelected && (
          <View style={{
            position: 'absolute',
            top: 2,
            left: 2,
            right: 2,
            bottom: 2,
            borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 14,
          }} />
        )}
        
        <Text style={{
          fontSize: 16,
          fontWeight: isSelected ? '800' : (day.isToday ? '700' : '600'),
          color: isSelected ? '#FFFFFF' : 
                 !day.isCurrentMonth ? colors.textSecondary + '70' : 
                 day.isToday ? colors.primary : colors.text,
          marginBottom: 4
        }}>
          {day.day}
        </Text>
        
        {/* Event indicators - More attractive */}
        {hasEvents && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 3,
            marginTop: 2
          }}>
            {day.events.slice(0, 4).map((event: CalendarEvent, index: number) => (
              <View key={index} style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: eventConfig[event.type].color,
                opacity: isSelected ? 0.8 : 1
              }} />
            ))}
            {day.events.length > 4 && (
              <Text style={{
                fontSize: 9,
                fontWeight: '700',
                color: isSelected ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary
              }}>
                +{day.events.length - 4}
              </Text>
            )}
          </View>
        )}
        
        {/* Weekends indicator */}
        {(day.weekDay === 0 || day.weekDay === 6) && !isSelected && (
          <View style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: isDark ? '#F87171' : '#EF4444',
          }} />
        )}
      </TouchableOpacity>
    );
  };

  // Event Card - More Attractive Design
  const EventCard = ({ event }: { event: CalendarEvent }) => {
    const config = eventConfig[event.type];
    const status = statusConfig[event.status];
    
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedEvent(event);
          setShowEventModal(true);
        }}
        activeOpacity={0.8}
        style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 18,
          marginBottom: 14,
          borderLeftWidth: 6,
          borderLeftColor: config.color,
          shadowColor: config.color,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.25 : 0.15,
          shadowRadius: 12,
          elevation: isDark ? 6 : 4,
          transform: [{ scale: 1 }]
        }}
      >
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 14}}>
          <View style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor: isDark ? `${config.color}25` : `${config.color}15`,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 14,
            borderWidth: 2,
            borderColor: config.color + '30'
          }}>
            <Feather name={config.icon} size={22} color={config.color} />
          </View>
          
          <View style={{flex: 1}}>
            <Text style={{fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 4}}>
              {event.title}
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Feather name="clock" size={13} color={colors.textSecondary} style={{marginRight: 6}} />
              <Text style={{fontSize: 13, color: colors.textSecondary}}>
                {event.time}
              </Text>
              <View style={{width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textSecondary, marginHorizontal: 8}} />
              <Feather name="user" size={13} color={colors.textSecondary} style={{marginRight: 4}} />
              <Text style={{fontSize: 13, color: colors.textSecondary}}>
                {event.contactName.split(' ')[0]}
              </Text>
            </View>
          </View>
          
          <View style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
            backgroundColor: isDark ? `${status.color}25` : `${status.color}12`,
            borderWidth: 1,
            borderColor: status.color + '30'
          }}>
            <Text style={{
              fontSize: 11,
              fontWeight: '800',
              color: status.color,
              letterSpacing: 0.5
            }}>
              {status.label.toUpperCase()}
            </Text>
          </View>
        </View>
        
        {event.description && (
          <Text style={{
            fontSize: 14.5,
            color: colors.textSecondary,
            lineHeight: 22,
            marginBottom: 14,
            fontStyle: 'italic'
          }} numberOfLines={2}>
            "{event.description}"
          </Text>
        )}
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: isDark ? colors.border + '50' : colors.border + '30'
        }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {event.priority === 'high' ? (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDark ? 'rgba(220, 38, 38, 0.25)' : 'rgba(220, 38, 38, 0.1)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(220, 38, 38, 0.4)' : 'rgba(220, 38, 38, 0.2)'
              }}>
                <Feather name="alert-circle" size={12} color={isDark ? '#F87171' : '#DC2626'} />
                <Text style={{
                  fontSize: 11,
                  fontWeight: '800',
                  color: isDark ? '#F87171' : '#DC2626',
                  marginLeft: 4
                }}>
                  HIGH PRIORITY
                </Text>
              </View>
            ) : (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: isDark ? colors.border + '40' : colors.border + '20'
              }}>
                <Feather name="briefcase" size={12} color={colors.textSecondary} />
                <Text style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: colors.textSecondary,
                  marginLeft: 4
                }}>
                  {event.company || 'No Company'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? colors.border + '40' : colors.border + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8
          }}>
            <Feather name="calendar" size={12} color={colors.textSecondary} />
            <Text style={{
              fontSize: 11,
              fontWeight: '600',
              color: colors.textSecondary,
              marginLeft: 4
            }}>
              {event.date.split('-')[2]}/{event.date.split('-')[1]}/{event.date.split('-')[0].slice(2)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Calendar Modal - For Date Selection
  const CalendarModal = () => (
    <Modal visible={showCalendarModal} transparent animationType="fade">
      <TouchableOpacity 
        style={{
          flex: 1, 
          backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)',
          justifyContent: 'center', 
          alignItems: 'center'
        }}
        activeOpacity={1}
        onPress={() => setShowCalendarModal(false)}
      >
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 24,
          padding: 24,
          width: width - 40,
          maxHeight: '80%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 20
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}>
            <Text style={{fontSize: 22, fontWeight: '800', color: colors.text}}>
              Select Date
            </Text>
            <TouchableOpacity 
              onPress={() => setShowCalendarModal(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isDark ? colors.border : '#F3F4F6',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Feather name="x" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {/* Year & Month Selection */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            backgroundColor: isDark ? colors.border : '#F9FAFB',
            padding: 12,
            borderRadius: 16
          }}>
            <TouchableOpacity onPress={goToPreviousMonth}>
              <Feather name="chevron-left" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <View style={{alignItems: 'center'}}>
              <Text style={{fontSize: 18, fontWeight: '800', color: colors.text}}>
                {currentMonthName}
              </Text>
              <Text style={{fontSize: 14, color: colors.textSecondary, marginTop: 2}}>
                {currentYear}
              </Text>
            </View>
            
            <TouchableOpacity onPress={goToNextMonth}>
              <Feather name="chevron-right" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Week Days Header */}
          <View style={{
            flexDirection: 'row',
            marginBottom: 12,
            paddingHorizontal: 4
          }}>
            {weekDays.map(day => (
              <View key={day} style={{flex: 1, alignItems: 'center'}}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '800',
                  color: day === 'Sun' || day === 'Sat' ? (isDark ? '#F87171' : '#EF4444') : colors.textSecondary,
                  textTransform: 'uppercase'
                }}>
                  {day.charAt(0)}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: 4
          }}>
            {calendarDays.map((day, index) => {
              const isSelected = day.date === selectedDate;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedDate(day.date);
                    setShowCalendarModal(false);
                  }}
                  style={{
                    width: (width - 80) / 7,
                    height: 45,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                    borderRadius: 12,
                    marginVertical: 2
                  }}
                >
                  <Text style={{
                    fontSize: 15,
                    fontWeight: isSelected ? '800' : '600',
                    color: isSelected ? '#FFFFFF' : 
                           !day.isCurrentMonth ? colors.textSecondary + '50' : 
                           (day.weekDay === 0 || day.weekDay === 6) ? (isDark ? '#F87171' : '#EF4444') : colors.text
                  }}>
                    {day.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Actions */}
          <TouchableOpacity 
            style={{
              marginTop: 20,
              paddingVertical: 14,
              backgroundColor: colors.primary,
              borderRadius: 14,
              alignItems: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6
            }}
            onPress={() => {
              goToToday();
              setShowCalendarModal(false);
            }}
          >
            <Text style={{fontSize: 16, fontWeight: '700', color: '#FFFFFF'}}>
              Go to Today
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Event Detail Modal
  const EventDetailModal = () => {
    if (!selectedEvent) return null;
    
    const config = eventConfig[selectedEvent.type];
    const status = statusConfig[selectedEvent.status];
    
    return (
      <Modal visible={showEventModal} transparent animationType="slide">
        <View style={{flex: 1, backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'}}>
          <View style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            maxHeight: '85%'
          }}>
            {/* Header with color accent */}
            <View style={{
              backgroundColor: config.bg,
              paddingTop: 24,
              paddingHorizontal: 24,
              paddingBottom: 20,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24
            }}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Feather name={config.icon} size={24} color={config.color} />
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: config.color,
                    marginLeft: 12
                  }}>
                    {config.label}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowEventModal(false)}>
                  <Feather name="x" size={24} color={config.color} />
                </TouchableOpacity>
              </View>
              
              <Text style={{
                fontSize: 28,
                fontWeight: '700',
                color: colors.text,
                marginTop: 16
              }}>
                {selectedEvent.title}
              </Text>
            </View>

            {/* Event Details */}
            <ScrollView style={{padding: 24}} showsVerticalScrollIndicator={false}>
              {/* Time & Date */}
              <View style={{
                backgroundColor: isDark ? colors.border : '#F9FAFB',
                borderRadius: 16,
                padding: 16,
                marginBottom: 20
              }}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: isDark ? colors.card : '#FFFFFF',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Feather name="clock" size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                  </View>
                  <View>
                    <Text style={{fontSize: 16, fontWeight: '600', color: colors.text}}>
                      {selectedEvent.time}
                      {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                    </Text>
                    <Text style={{fontSize: 14, color: colors.textSecondary, marginTop: 2}}>
                      {formatDate(selectedEvent.date)}
                    </Text>
                  </View>
                </View>
                
                {selectedEvent.location && (
                  <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 12}}>
                    <Feather name="map-pin" size={16} color={colors.textSecondary} style={{marginRight: 8}} />
                    <Text style={{fontSize: 14, color: colors.text}}>
                      {selectedEvent.location}
                    </Text>
                  </View>
                )}
              </View>

              {/* Contact Info */}
              <View style={{
                backgroundColor: isDark ? colors.border : '#F9FAFB',
                borderRadius: 16,
                padding: 16,
                marginBottom: 20
              }}>
                <Text style={{fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12}}>
                  Contact Details
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                  <FontAwesome name="user" size={16} color={colors.textSecondary} style={{marginRight: 12}} />
                  <Text style={{fontSize: 16, color: colors.text}}>
                    {selectedEvent.contactName}
                  </Text>
                </View>
                {selectedEvent.company && (
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <MaterialIcons name="business" size={16} color={colors.textSecondary} style={{marginRight: 12}} />
                    <Text style={{fontSize: 16, color: colors.text}}>
                      {selectedEvent.company}
                    </Text>
                  </View>
                )}
              </View>

              {/* Description */}
              <View style={{marginBottom: 24}}>
                <Text style={{fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12}}>
                  Description
                </Text>
                <Text style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  lineHeight: 24
                }}>
                  {selectedEvent.description}
                </Text>
              </View>

              {/* Quick Actions */}
              <View style={{flexDirection: 'row', gap: 12}}>
                <TouchableOpacity 
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: isDark ? '#34D399' : '#10B981',
                    alignItems: 'center'
                  }}
                  onPress={() => updateEventStatus(selectedEvent.id, 'completed')}
                >
                  <Text style={{fontSize: 16, fontWeight: '600', color: '#FFFFFF'}}>
                    Mark Complete
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    borderRadius: 12,
                    backgroundColor: isDark ? colors.border : '#F3F4F6',
                    alignItems: 'center'
                  }}
                  onPress={() => {
                    // Edit event logic
                    setShowEventModal(false);
                    setShowAddModal(true);
                  }}
                >
                  <Feather name="edit-2" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Add Event Modal - With Clear Labels
  const AddEventModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      type: 'meeting' as CalendarEvent['type'],
      date: selectedDate,
      time: '10:00',
      duration: '1',
      contactName: '',
      company: '',
      description: '',
      priority: 'medium' as CalendarEvent['priority']
    });

    const handleAddEvent = () => {
      if (!formData.title.trim() || !formData.contactName.trim()) {
        alert('Please fill in all required fields');
        return;
      }
      
      alert('Event added successfully!');
      setShowAddModal(false);
    };

    return (
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={{flex: 1, backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'}}>
          <View style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            maxHeight: '90%'
          }}>
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20,
              borderBottomWidth: 1, borderBottomColor: colors.border
            }}>
              <Text style={{fontSize: 20, fontWeight: '600', color: colors.text}}>New Event</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{paddingHorizontal: 24}} showsVerticalScrollIndicator={false}>
              {/* Event Type Selection */}
              <View style={{marginBottom: 20}}>
                <Text style={{fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12}}>
                  Event Type
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{flexDirection: 'row', gap: 12}}>
                    {eventTypes.map(type => {
                      const config = eventConfig[type];
                      return (
                        <TouchableOpacity
                          key={type}
                          style={{
                            alignItems: 'center',
                            padding: 12,
                            borderRadius: 16,
                            backgroundColor: formData.type === type ? config.bg : (isDark ? colors.border : '#F9FAFB'),
                            borderWidth: 2,
                            borderColor: formData.type === type ? config.color : colors.border,
                            minWidth: 80
                          }}
                          onPress={() => setFormData({...formData, type})}
                        >
                          <Feather 
                            name={config.icon} 
                            size={24} 
                            color={formData.type === type ? config.color : colors.textSecondary} 
                          />
                          <Text style={{
                            fontSize: 12,
                            fontWeight: '600',
                            color: formData.type === type ? config.color : colors.textSecondary,
                            marginTop: 8
                          }}>
                            {config.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              {/* Event Title */}
              <View style={{marginBottom: 16}}>
                <Text style={{fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8}}>
                  Event Title *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: isDark ? colors.border : '#F9FAFB',
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: colors.text
                  }}
                  placeholder="Enter event title"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.title}
                  onChangeText={text => setFormData({...formData, title: text})}
                />
              </View>

              {/* Date & Time */}
              <View style={{flexDirection: 'row', gap: 12, marginBottom: 16}}>
                <View style={{flex: 1}}>
                  <Text style={{fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8}}>
                    Date *
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: isDark ? colors.border : '#F9FAFB',
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onPress={() => {
                      setShowAddModal(false);
                      setTimeout(() => setShowCalendarModal(true), 300);
                    }}
                  >
                    <Text style={{fontSize: 16, color: colors.text}}>
                      {formatDate(formData.date)}
                    </Text>
                    <Feather name="calendar" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <View style={{flex: 1}}>
                  <Text style={{fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8}}>
                    Time *
                  </Text>
                  <View style={{
                    backgroundColor: isDark ? colors.border : '#F9FAFB',
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <Feather name="clock" size={20} color={colors.textSecondary} style={{marginRight: 8}} />
                    <TextInput
                      style={{flex: 1, fontSize: 16, color: colors.text}}
                      placeholder="10:00"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.time}
                      onChangeText={text => setFormData({...formData, time: text})}
                    />
                    <Text style={{fontSize: 14, color: colors.textSecondary, marginLeft: 4}}>AM</Text>
                  </View>
                </View>
              </View>

              {/* Contact Details */}
              <View style={{marginBottom: 16}}>
                <Text style={{fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8}}>
                  Contact Name *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: isDark ? colors.border : '#F9FAFB',
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: colors.text
                  }}
                  placeholder="Enter contact name"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.contactName}
                  onChangeText={text => setFormData({...formData, contactName: text})}
                />
              </View>

              {/* Company */}
              <View style={{marginBottom: 16}}>
                <Text style={{fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8}}>
                  Company
                </Text>
                <TextInput
                  style={{
                    backgroundColor: isDark ? colors.border : '#F9FAFB',
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: colors.text
                  }}
                  placeholder="Enter company (optional)"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.company}
                  onChangeText={text => setFormData({...formData, company: text})}
                />
              </View>

              {/* Priority */}
              <View style={{marginBottom: 20}}>
                <Text style={{fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12}}>
                  Priority Level
                </Text>
                <View style={{flexDirection: 'row', gap: 12}}>
                  {[
                    { value: 'low', label: 'Low', color: isDark ? '#34D399' : '#10B981', bg: isDark ? 'rgba(52, 211, 153, 0.2)' : '#D1FAE5' },
                    { value: 'medium', label: 'Medium', color: isDark ? '#FBBF24' : '#F59E0B', bg: isDark ? 'rgba(251, 191, 36, 0.2)' : '#FEF3C7' },
                    { value: 'high', label: 'High', color: isDark ? '#F87171' : '#EF4444', bg: isDark ? 'rgba(248, 113, 113, 0.2)' : '#FEE2E2' }
                  ].map((priority) => (
                    <TouchableOpacity
                      key={priority.value}
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        borderRadius: 12,
                        backgroundColor: formData.priority === priority.value ? priority.bg : (isDark ? colors.border : '#F9FAFB'),
                        borderWidth: 2,
                        borderColor: formData.priority === priority.value ? priority.color : colors.border,
                        alignItems: 'center'
                      }}
                      onPress={() => setFormData({...formData, priority: priority.value as any})}
                    >
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: formData.priority === priority.value ? priority.color : colors.textSecondary
                      }}>
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Description */}
              <View style={{marginBottom: 24}}>
                <Text style={{fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8}}>
                  Description
                </Text>
                <TextInput
                  style={{
                    backgroundColor: isDark ? colors.border : '#F9FAFB',
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: colors.text,
                    height: 100,
                    textAlignVertical: 'top'
                  }}
                  placeholder="Add event details (optional)..."
                  placeholderTextColor={colors.textSecondary}
                  value={formData.description}
                  onChangeText={text => setFormData({...formData, description: text})}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={{
              flexDirection: 'row',
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              gap: 12
            }}>
              <TouchableOpacity 
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: isDark ? colors.border : '#F3F4F6',
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center'
                }}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={{fontSize: 16, fontWeight: '600', color: colors.text}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: 'center'
                }}
                onPress={handleAddEvent}
              >
                <Text style={{fontSize: 16, fontWeight: '600', color: '#FFFFFF'}}>Create Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Enhanced Header with Horizontal Scroll
  const HeaderSection = () => (
    <Animated.View 
      style={{
        backgroundColor: colors.card,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }}
    >
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
        <View>
          <Text style={{fontSize: 32, fontWeight: '900', color: colors.text, letterSpacing: -0.5}}>
            Calendar
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 4,
            fontStyle: 'italic'
          }}>
            {viewMode === 'month' ? 'Month View' : 'Agenda View'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8
          }}
          onPress={() => setShowAddModal(true)}
        >
          <Feather name="plus" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Horizontal Scrollable Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 8, gap: 12}}
      >
        {/* View Mode Toggle */}
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 18,
            paddingVertical: 10,
            backgroundColor: viewMode === 'agenda' ? colors.primary : (isDark ? colors.border : '#F3F4F6'),
            borderRadius: 20,
            borderWidth: 2,
            borderColor: viewMode === 'agenda' ? colors.primary : colors.border,
            minWidth: 120
          }}
          onPress={() => setViewMode(viewMode === 'month' ? 'agenda' : 'month')}
        >
          <Feather 
            name={viewMode === 'month' ? 'list' : 'grid'} 
            size={18} 
            color={viewMode === 'agenda' ? '#FFFFFF' : colors.text} 
            style={{marginRight: 8}}
          />
          <Text style={{
            fontSize: 15,
            fontWeight: '700',
            color: viewMode === 'agenda' ? '#FFFFFF' : colors.text
          }}>
            {viewMode === 'month' ? 'Agenda View' : 'Month View'}
          </Text>
        </TouchableOpacity>

        {/* Today Button */}
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 18,
            paddingVertical: 10,
            backgroundColor: isDark ? colors.border : '#F3F4F6',
            borderRadius: 20,
            borderWidth: 2,
            borderColor: colors.border,
            minWidth: 100
          }}
          onPress={goToToday}
        >
          <Feather name="calendar" size={18} color={colors.text} style={{marginRight: 8}} />
          <Text style={{fontSize: 15, fontWeight: '700', color: colors.text}}>Today</Text>
        </TouchableOpacity>

        {/* Calendar Toggle Button - For Both Views */}
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 18,
            paddingVertical: 10,
            backgroundColor: viewMode === 'month' && showMonthCalendar ? colors.primary + '20' : (isDark ? colors.border : '#F3F4F6'),
            borderRadius: 20,
            borderWidth: 2,
            borderColor: viewMode === 'month' && showMonthCalendar ? colors.primary + '50' : colors.border,
            minWidth: 140
          }}
          onPress={() => {
            if (viewMode === 'month') {
              setShowMonthCalendar(!showMonthCalendar);
            } else {
              setShowCalendarModal(true);
            }
          }}
        >
          <Feather name="calendar" size={18} color={viewMode === 'month' && showMonthCalendar ? colors.primary : colors.text} style={{marginRight: 10}} />
          <View>
            <Text style={{fontSize: 15, fontWeight: '800', color: viewMode === 'month' && showMonthCalendar ? colors.primary : colors.text}}>
              {viewMode === 'month' ? (showMonthCalendar ? 'Hide Calendar' : 'Show Calendar') : 'Pick Date'}
            </Text>
            <Text style={{fontSize: 11, color: colors.textSecondary, marginTop: 2}}>
              {viewMode === 'month' ? 'Toggle calendar visibility' : 'Open calendar picker'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Month Navigation */}
        <View style={{flexDirection: 'row', gap: 8}}>
          <TouchableOpacity 
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? colors.border : '#F3F4F6',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={goToPreviousMonth}
          >
            <Feather name="chevron-left" size={22} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 18,
              paddingVertical: 10,
              backgroundColor: isDark ? colors.primary + '20' : colors.primary + '10',
              borderRadius: 20,
              borderWidth: 2,
              borderColor: colors.primary + '30',
              minWidth: 120
            }}
            onPress={() => setShowCalendarModal(true)}
          >
            <Text style={{fontSize: 15, fontWeight: '800', color: colors.text}}>
              {currentMonthName} {currentYear}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? colors.border : '#F3F4F6',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={goToNextMonth}
          >
            <Feather name="chevron-right" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );

  // Week Days Header - For Month View
  const WeekDaysHeader = () => (
    <View style={{
      flexDirection: 'row',
      backgroundColor: isDark ? colors.border + '80' : '#F8FAFC',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginTop: 4
    }}>
      {weekDays.map(day => (
        <View key={day} style={{flex: 1, alignItems: 'center'}}>
          <Text style={{
            fontSize: 13,
            fontWeight: '900',
            color: day === 'Sun' || day === 'Sat' ? (isDark ? '#F87171' : '#EF4444') : colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 1
          }}>
            {day}
          </Text>
        </View>
      ))}
    </View>
  );

  // Render Month View
  const renderMonthView = () => (
    <ScrollView 
      style={{flex: 1}}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 100}}
    >
      {showMonthCalendar && (
        <>
          <WeekDaysHeader />
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            backgroundColor: colors.card,
            paddingHorizontal: 4,
            paddingTop: 8,
            paddingBottom: 20
          }}>
            {calendarDays.map((day, index) => (
              <CalendarDayCell key={index} day={day} />
            ))}
          </View>
        </>
      )}
      
      {/* Events for Selected Date in Month View */}
      <View style={{
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingTop: showMonthCalendar ? 20 : 0,
        paddingBottom: 20
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          paddingHorizontal: 4
        }}>
          <View>
            <Text style={{fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: -0.5}}>
              Events for {selectedDate}
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 6}}>
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colors.primary,
                marginRight: 8
              }} />
              <Text style={{fontSize: 14, color: colors.textSecondary}}>
                {selectedDateEvents.length} scheduled events
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: colors.primary,
              borderRadius: 12,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6
            }}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={{fontSize: 13, fontWeight: '700', color: '#FFFFFF'}}>
              + Add Event
            </Text>
          </TouchableOpacity>
        </View>

        {selectedDateEvents.length > 0 ? (
          selectedDateEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
            backgroundColor: colors.card,
            borderRadius: 28,
            paddingHorizontal: 20,
            marginTop: 20,
            borderWidth: 2,
            borderColor: isDark ? colors.border + '50' : colors.border,
            borderStyle: 'dashed'
          }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: isDark ? colors.primary + '20' : colors.primary + '10',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
              borderWidth: 3,
              borderColor: colors.primary + '30'
            }}>
              <Feather name="calendar" size={48} color={colors.primary} />
            </View>
            <Text style={{
              fontSize: 22,
              fontWeight: '900',
              color: colors.text,
              marginBottom: 12,
              textAlign: 'center'
            }}>
              No Events for This Date
            </Text>
            <Text style={{
              fontSize: 15,
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: 32,
              lineHeight: 22,
              paddingHorizontal: 20
            }}>
              Select a different date or add events for {selectedDate}
            </Text>
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.primary,
                paddingHorizontal: 28,
                paddingVertical: 16,
                borderRadius: 16,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8
              }}
              onPress={() => setShowAddModal(true)}
            >
              <Feather name="plus-circle" size={22} color="#FFFFFF" />
              <Text style={{
                fontSize: 17,
                fontWeight: '800',
                color: '#FFFFFF',
                marginLeft: 12
              }}>
                Add New Event
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );

  // Render Agenda View
  const renderAgendaView = () => (
    <ScrollView 
      style={{flex: 1}}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 100}}
    >
      <View style={{
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          paddingHorizontal: 4
        }}>
          <View>
            <Text style={{fontSize: 24, fontWeight: '900', color: colors.text, letterSpacing: -0.5}}>
              All Events (Agenda)
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 6}}>
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colors.primary,
                marginRight: 8
              }} />
              <Text style={{fontSize: 14, color: colors.textSecondary}}>
                {agendaEvents.length} total events
              </Text>
            </View>
          </View>
          
          <View style={{flexDirection: 'row', gap: 8}}>
            <TouchableOpacity 
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: isDark ? colors.border : '#F3F4F6',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border
              }}
              onPress={() => setShowCalendarModal(true)}
            >
              <Text style={{fontSize: 13, fontWeight: '700', color: colors.text}}>
                Filter by Date
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: colors.primary,
                borderRadius: 12,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6
              }}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={{fontSize: 13, fontWeight: '700', color: '#FFFFFF'}}>
                + Add Event
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {agendaEvents.length > 0 ? (
          agendaEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
            backgroundColor: colors.card,
            borderRadius: 28,
            paddingHorizontal: 20,
            marginTop: 20,
            borderWidth: 2,
            borderColor: isDark ? colors.border + '50' : colors.border,
            borderStyle: 'dashed'
          }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: isDark ? colors.primary + '20' : colors.primary + '10',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
              borderWidth: 3,
              borderColor: colors.primary + '30'
            }}>
              <Feather name="calendar" size={48} color={colors.primary} />
            </View>
            <Text style={{
              fontSize: 22,
              fontWeight: '900',
              color: colors.text,
              marginBottom: 12,
              textAlign: 'center'
            }}>
              No Events Scheduled
            </Text>
            <Text style={{
              fontSize: 15,
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: 32,
              lineHeight: 22,
              paddingHorizontal: 20
            }}>
              Add some events to see them in your agenda
            </Text>
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.primary,
                paddingHorizontal: 28,
                paddingVertical: 16,
                borderRadius: 16,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8
              }}
              onPress={() => setShowAddModal(true)}
            >
              <Feather name="plus-circle" size={22} color="#FFFFFF" />
              <Text style={{
                fontSize: 17,
                fontWeight: '800',
                color: '#FFFFFF',
                marginLeft: 12
              }}>
                Schedule New Event
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.card} />
      
      {/* Enhanced Header Section */}
      <HeaderSection />

      {/* Main Content */}
      {viewMode === 'month' ? renderMonthView() : renderAgendaView()}

      {/* Modals */}
      <CalendarModal />
      <AddEventModal />
      <EventDetailModal />
    </SafeAreaView>
  );
};

export default CalendarPage;