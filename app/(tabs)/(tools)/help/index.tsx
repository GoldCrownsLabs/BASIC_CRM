import { useAppTheme } from '@/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Linking,
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

const HelpPage = () => {
  const { colors, isDark } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFAQ, setSelectedFAQ] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: ''
  });

  // FAQ Data
  const faqs = [
    {
      id: 1,
      question: 'How do I add a new contact?',
      answer: 'Go to the Contacts tab and tap the + button. Fill in the contact details and save.',
      category: 'Contacts'
    },
    {
      id: 2,
      question: 'How to schedule a meeting?',
      answer: 'Open the Calendar tab, select a date, tap Add Event, choose Meeting type, and fill in the details.',
      category: 'Calendar'
    },
    {
      id: 3,
      question: 'Can I use the app offline?',
      answer: 'Yes! All basic features work offline. Your data will sync when you reconnect to the internet.',
      category: 'General'
    },
    {
      id: 4,
      question: 'How to export my data?',
      answer: 'Go to Settings > Export Data. You can export as CSV or PDF.',
      category: 'Data'
    },
    {
      id: 5,
      question: 'How to set reminders for tasks?',
      answer: 'When creating a task, enable notifications and set your preferred reminder time.',
      category: 'Tasks'
    },
    {
      id: 6,
      question: 'Is my data secure?',
      answer: 'Yes, all data is encrypted and stored securely. We use industry-standard security practices.',
      category: 'Security'
    },
    {
      id: 7,
      question: 'How to filter activities?',
      answer: 'Use the filter chips on the Activities page or the search bar to find specific activities.',
      category: 'Activities'
    },
    {
      id: 8,
      question: 'Can I customize the dashboard?',
      answer: 'Currently, the dashboard shows key metrics. More customization options are coming soon.',
      category: 'Dashboard'
    },
  ];

  // Help Categories
  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: 'play-circle', count: 5 },
    { id: 'contacts', name: 'Contacts & Leads', icon: 'users', count: 8 },
    { id: 'calendar', name: 'Calendar & Events', icon: 'calendar', count: 6 },
    { id: 'activities', name: 'Activities', icon: 'activity', count: 4 },
    { id: 'tasks', name: 'Tasks & Reminders', icon: 'check-square', count: 5 },
    { id: 'analytics', name: 'Analytics', icon: 'bar-chart-2', count: 3 },
    { id: 'settings', name: 'Settings', icon: 'settings', count: 7 },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: 'tool', count: 4 },
  ];

  // Quick Actions
  const quickActions = [
    {
      id: 1,
      title: 'Watch Tutorial',
      description: 'Step-by-step video guides',
      icon: 'video',
      action: () => Linking.openURL('https://example.com/tutorials')
    },
    {
      id: 2,
      title: 'User Guide',
      description: 'Detailed documentation',
      icon: 'book',
      action: () => Linking.openURL('https://example.com/docs')
    },
    {
      id: 3,
      title: 'Contact Support',
      description: 'Get help from our team',
      icon: 'headphones',
      action: () => setShowContactModal(true)
    },
    {
      id: 4,
      title: 'Give Feedback',
      description: 'Help us improve',
      icon: 'message-square',
      action: () => setShowFeedbackModal(true)
    },
  ];

  // Filter FAQs based on search
  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle contact form submission
  const handleContactSubmit = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    Alert.alert(
      'Message Sent',
      'Our support team will get back to you within 24 hours.',
      [{ text: 'OK', onPress: () => setShowContactModal(false) }]
    );
    
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  // Handle feedback submission
  const handleFeedbackSubmit = () => {
    if (feedback.rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    
    Alert.alert(
      'Thank You!',
      'Your feedback has been submitted.',
      [{ text: 'OK', onPress: () => setShowFeedbackModal(false) }]
    );
    
    setFeedback({ rating: 0, comment: '' });
  };

  // Contact Modal
  const ContactModal = () => (
    <Modal visible={showContactModal} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: colors.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '90%'
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border
          }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>
              Contact Support
            </Text>
            <TouchableOpacity onPress={() => setShowContactModal(false)}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 24 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24 }}>
              Our team typically responds within 24 hours.
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Your Name
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text
                }}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
                value={contactForm.name}
                onChangeText={text => setContactForm({ ...contactForm, name: text })}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Email Address
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text
                }}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                value={contactForm.email}
                onChangeText={text => setContactForm({ ...contactForm, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Subject
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text
                }}
                placeholder="What do you need help with?"
                placeholderTextColor={colors.textSecondary}
                value={contactForm.subject}
                onChangeText={text => setContactForm({ ...contactForm, subject: text })}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Message
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  height: 120,
                  textAlignVertical: 'top'
                }}
                placeholder="Describe your issue in detail..."
                placeholderTextColor={colors.textSecondary}
                value={contactForm.message}
                onChangeText={text => setContactForm({ ...contactForm, message: text })}
                multiline
                numberOfLines={5}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center'
                }}
                onPress={() => setShowContactModal(false)}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: 'center'
                }}
                onPress={handleContactSubmit}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                  Send Message
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Feedback Modal
  const FeedbackModal = () => (
    <Modal visible={showFeedbackModal} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: colors.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '80%'
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border
          }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>
              Give Feedback
            </Text>
            <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 24 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 16 }}>
              How would you rate your experience?
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  style={{ marginHorizontal: 8 }}
                  onPress={() => setFeedback({ ...feedback, rating: star })}
                >
                  <Feather
                    name={star <= feedback.rating ? 'star' : 'star'}
                    size={40}
                    color={star <= feedback.rating ? colors.warning : colors.border}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Additional Comments (Optional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  height: 100,
                  textAlignVertical: 'top'
                }}
                placeholder="Tell us what you think..."
                placeholderTextColor={colors.textSecondary}
                value={feedback.comment}
                onChangeText={text => setFeedback({ ...feedback, comment: text })}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity
              style={{
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: 'center'
              }}
              onPress={handleFeedbackSubmit}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                Submit Feedback
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>
            Help Center
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
            Find answers and get support
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.background,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <Feather name="search" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
          <TextInput
            style={{ flex: 1, fontSize: 16, color: colors.text, padding: 0 }}
            placeholder="Search for help..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Quick Actions */}
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16 }}>
            Quick Help
          </Text>
          
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            marginHorizontal: -6 
          }}>
            {quickActions.map((action) => (
              <View key={action.id} style={{ width: '50%', padding: 6 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                  onPress={action.action}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${colors.primary}20`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 12
                  }}>
                    <Feather name={action.icon as any} size={20} color={colors.primary} />
                  </View>
                  
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                    {action.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 16 }}>
                    {action.description}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Help Categories */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16 }}>
            Browse by Category
          </Text>
          
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            marginHorizontal: -6 
          }}>
            {categories.map((category) => (
              <View key={category.id} style={{ width: '50%', padding: 6 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                    minHeight: 100
                  }}
                  onPress={() => setSearchQuery(category.name.toLowerCase())}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: `${colors.primary}20`,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12
                    }}>
                      <Feather name={category.icon as any} size={20} color={colors.primary} />
                    </View>
                    <Text style={{ 
                      fontSize: 14, 
                      fontWeight: '600', 
                      color: colors.text,
                      flexShrink: 1 
                    }}>
                      {category.name}
                    </Text>
                  </View>
                  
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {category.count} articles
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 16 
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
              Frequently Asked Questions
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              {filteredFAQs.length} questions
            </Text>
          </View>
          
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                onPress={() => setSelectedFAQ(selectedFAQ === faq.id ? null : faq.id)}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  marginBottom: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: `${colors.info}20`,
                        marginRight: 8
                      }}>
                        <Text style={{ fontSize: 10, color: colors.info, fontWeight: '600' }}>
                          {faq.category}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                      {faq.question}
                    </Text>
                  </View>
                  <Feather
                    name={selectedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                
                {selectedFAQ === faq.id && (
                  <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 40,
              backgroundColor: colors.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <Feather name="search" size={48} color={colors.textSecondary} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 8 }}>
                No results found
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
                Try a different search term
              </Text>
            </View>
          )}
        </View>

        {/* Contact Section */}
        <View style={{
          margin: 20,
          padding: 20,
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
            Still need help?
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20, lineHeight: 20 }}>
            Our support team is here to assist you
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center'
              }}
              onPress={() => Linking.openURL('mailto:support@crmapp.com')}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                Email Us
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.primary,
                alignItems: 'center'
              }}
              onPress={() => setShowContactModal(true)}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>
                Contact Form
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <ContactModal />
      <FeedbackModal />
    </SafeAreaView>
  );
};

export default HelpPage;