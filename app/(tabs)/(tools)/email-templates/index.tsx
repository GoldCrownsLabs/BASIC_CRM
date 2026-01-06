import { useAppTheme } from '@/contaxt/ThemeContext';
import {
  EmailTemplate,
  emailTemplates,
  templateCategories,
  templateVariables
} from '@/data/emailTemplates';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const EmailTemplatesPage = () => {
  const [templates, setTemplates] = useState(emailTemplates);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  
  const { colors, isDark } = useAppTheme();

  // Theme-based styles
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    createButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    searchContainer: {
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.card : '#f5f5f5',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      padding: 0,
      marginLeft: 8,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    favoriteFilterButton: {
      padding: 8,
      borderRadius: 12,
      borderWidth: 1,
      marginLeft: 8,
    },
    contentContainer: {
      flex: 1,
      padding: 16,
    },
    templateCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    categoryIconContainer: {
      width: 24,
      height: 24,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    templateName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    templateDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
      lineHeight: 20,
    },
    templateSubject: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    useCountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    useCountText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 2,
    },
    tagsContainer: {
      flexDirection: 'row',
      gap: 4,
    },
    tag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: isDark ? colors.border : '#f0f0f0',
      borderRadius: 6,
    },
    tagText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    infoCard: {
      backgroundColor: isDark ? colors.border : '#f5f5f5',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 16,
      color: colors.text,
    },
    variableContainer: {
      marginBottom: 16,
    },
    variableTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    variableTag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: colors.primary + '20',
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    variableTagText: {
      fontSize: 12,
      color: colors.primary,
      fontFamily: 'monospace',
    },
    contentContainerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    contentPreview: {
      backgroundColor: isDark ? colors.background : '#ffffff',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 200,
    },
    contentText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
    },
    contentTextMonospace: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
      fontFamily: 'monospace',
    },
    modalActions: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 8,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    secondaryAction: {
      backgroundColor: isDark ? colors.border : '#f0f0f0',
      borderWidth: 1,
      borderColor: colors.border,
    },
    primaryAction: {
      backgroundColor: colors.primary,
    },
    actionText: {
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryActionText: {
      color: colors.text,
    },
    primaryActionText: {
      color: '#ffffff',
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyStateIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
      maxWidth: '80%',
    },
    resetButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: colors.primary,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    resetButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
      marginLeft: 8,
    },
    statsContainer: {
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: 16,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: 12,
    },
    input: {
      backgroundColor: isDark ? colors.border : '#f5f5f5',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      color: colors.text,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    categorySelector: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 2,
      alignItems: 'center',
      minWidth: 100,
    },
    variablesHelper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isDark ? colors.border : '#f5f5f5',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    variablesHelperTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    variablesHelperText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    contentInput: {
      backgroundColor: isDark ? colors.border : '#f5f5f5',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      color: colors.text,
      height: 200,
      textAlignVertical: 'top',
    },
    modalScrollContent: {
      paddingHorizontal: 20,
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    filterButtonText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 4,
      marginRight: 4,
    },
    templateCount: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
  });

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFavorite = !favoritesOnly || template.isFavorite;
    
    return matchesCategory && matchesSearch && matchesFavorite;
  });

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setTemplates(templates.map(template => 
      template.id === id ? { ...template, isFavorite: !template.isFavorite } : template
    ));
  };

  // Use template
  const useTemplate = (template: EmailTemplate) => {
    Alert.alert(
      'Use Template',
      `Would you like to use "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Use Template', 
          onPress: () => {
            // In real app, navigate to email composer
            Alert.alert('Success', 'Template loaded in email composer');
            setShowTemplateModal(false);
          }
        }
      ]
    );
  };

  // Create new template
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    category: 'welcome' as EmailTemplate['category'],
    description: '',
    content: '',
    tags: [] as string[]
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.subject.trim() || !newTemplate.content.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const newTemp: EmailTemplate = {
      id: Date.now().toString(),
      ...newTemplate,
      isFavorite: false,
      lastUsed: new Date().toISOString().split('T')[0],
      useCount: 0,
      variables: templateVariables.filter(variable => 
        newTemplate.content.includes(variable.replace(/[{}]/g, ''))
      )
    };

    setTemplates([newTemp, ...templates]);
    setNewTemplate({
      name: '',
      subject: '',
      category: 'welcome',
      description: '',
      content: '',
      tags: []
    });
    setShowCreateModal(false);
    Alert.alert('Success', 'Template created successfully!');
  };

  // Template Card Component
  const TemplateCard = ({ template }: { template: EmailTemplate }) => {
    const category = templateCategories.find(c => c.id === template.category);
    const categoryColor = category?.color || colors.primary;
    
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedTemplate(template);
          setShowTemplateModal(true);
        }}
        activeOpacity={0.7}
        style={styles.templateCard}
      >
        <View style={styles.cardHeader}>
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
              {category && (
                <View style={[styles.categoryIconContainer, { backgroundColor: categoryColor + '20' }]}>
                  <Feather name={category.icon as any} size={14} color={categoryColor} />
                </View>
              )}
              <Text style={styles.templateName}>
                {template.name}
              </Text>
            </View>
            
            <Text style={styles.templateDescription} numberOfLines={2}>
              {template.description}
            </Text>
            
            <Text style={styles.templateSubject} numberOfLines={1}>
              Subject: {template.subject}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => toggleFavorite(template.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather 
              name={template.isFavorite ? 'star' : 'star'} 
              size={20} 
              color={template.isFavorite ? colors.warning : colors.textSecondary} 
              fill={template.isFavorite ? colors.warning : 'transparent'}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.useCountContainer}>
            <Feather name="hash" size={12} color={colors.textSecondary} />
            <Text style={styles.useCountText}>
              Used {template.useCount} times
            </Text>
          </View>
          
          <View style={styles.tagsContainer}>
            {template.tags.slice(0, 2).map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>
                  {tag}
                </Text>
              </View>
            ))}
            {template.tags.length > 2 && (
              <Text style={styles.tagText}>
                +{template.tags.length - 2}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Template Detail Modal
  const TemplateDetailModal = () => {
    if (!selectedTemplate) return null;
    
    const category = templateCategories.find(c => c.id === selectedTemplate.category);
    const categoryColor = category?.color || colors.primary;
    
    return (
      <Modal visible={showTemplateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                  {category && (
                    <View style={[styles.categoryIconContainer, 
                      { 
                        width: 32, 
                        height: 32, 
                        backgroundColor: categoryColor + '20',
                        marginRight: 8 
                      }
                    ]}>
                      <Feather name={category.icon as any} size={16} color={categoryColor} />
                    </View>
                  )}
                  <Text style={styles.modalTitle}>
                    {selectedTemplate.name}
                  </Text>
                </View>
                <Text style={{fontSize: 14, color: colors.textSecondary}}>
                  {selectedTemplate.description}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{padding: 20}} showsVerticalScrollIndicator={false}>
              {/* Template Info */}
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <View>
                    <Text style={styles.infoLabel}>Subject</Text>
                    <Text style={styles.infoValue}>{selectedTemplate.subject}</Text>
                  </View>
                  <View style={{alignItems: 'flex-end'}}>
                    <Text style={styles.infoLabel}>Used</Text>
                    <Text style={[styles.infoValue, {color: colors.primary}]}>
                      {selectedTemplate.useCount} times
                    </Text>
                  </View>
                </View>
                
                <View>
                  <Text style={styles.infoLabel}>Last Used</Text>
                  <Text style={{fontSize: 14, color: colors.text}}>
                    {selectedTemplate.lastUsed}
                  </Text>
                </View>
              </View>

              {/* Variables */}
              {selectedTemplate.variables.length > 0 && (
                <View style={styles.variableContainer}>
                  <Text style={styles.variableTitle}>Available Variables</Text>
                  <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 4}}>
                    {selectedTemplate.variables.map(variable => (
                      <TouchableOpacity
                        key={variable}
                        style={styles.variableTag}
                        onPress={() => {
                          // Copy to clipboard
                          Alert.alert('Copied', `${variable} copied to clipboard`);
                        }}
                      >
                        <Text style={styles.variableTagText}>
                          {variable}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Template Content */}
              <View style={{marginBottom: 20}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                  <Text style={styles.contentContainerTitle}>Template Content</Text>
                  <TouchableOpacity onPress={() => setShowPreview(!showPreview)}>
                    <Text style={{fontSize: 12, color: colors.primary, fontWeight: '600'}}>
                      {showPreview ? 'Show Raw' : 'Show Preview'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.contentPreview}>
                  <ScrollView>
                    {showPreview ? (
                      <Text style={styles.contentText}>
                        {selectedTemplate.content}
                      </Text>
                    ) : (
                      <Text style={styles.contentTextMonospace}>
                        {selectedTemplate.content}
                      </Text>
                    )}
                  </ScrollView>
                </View>
              </View>

              {/* Tags */}
              {selectedTemplate.tags.length > 0 && (
                <View style={{marginBottom: 20}}>
                  <Text style={styles.contentContainerTitle}>Tags</Text>
                  <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 4}}>
                    {selectedTemplate.tags.map(tag => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryAction]}
                onPress={() => toggleFavorite(selectedTemplate.id)}
              >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Feather 
                    name={selectedTemplate.isFavorite ? 'star' : 'star'} 
                    size={20} 
                    color={selectedTemplate.isFavorite ? colors.warning : colors.text} 
                    style={{marginRight: 4}}
                  />
                  <Text style={[styles.actionText, styles.secondaryActionText]}>
                    {selectedTemplate.isFavorite ? 'Unfavorite' : 'Favorite'}
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryAction]}
                onPress={() => useTemplate(selectedTemplate)}
              >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Feather name="mail" size={20} color="#ffffff" style={{marginRight: 4}} />
                  <Text style={[styles.actionText, styles.primaryActionText]}>
                    Use Template
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Create Template Modal
  const CreateTemplateModal = () => (
    <Modal visible={showCreateModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Template</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            {/* Template Name */}
            <View style={{marginBottom: 12}}>
              <Text style={styles.inputLabel}>Template Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter template name"
                placeholderTextColor={colors.textSecondary}
                value={newTemplate.name}
                onChangeText={text => setNewTemplate({...newTemplate, name: text})}
              />
            </View>

            {/* Category */}
            <View style={{marginBottom: 12}}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{flexDirection: 'row', gap: 8}}>
                  {templateCategories.filter(c => c.id !== 'all').map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[styles.categorySelector, {
                        borderColor: newTemplate.category === category.id ? category.color : colors.border,
                        backgroundColor: newTemplate.category === category.id ? category.color + '20' : 'transparent',
                      }]}
                      onPress={() => setNewTemplate({...newTemplate, category: category.id as any})}
                    >
                      <Feather name={category.icon as any} size={16} 
                        color={newTemplate.category === category.id ? category.color : colors.textSecondary} />
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: newTemplate.category === category.id ? category.color : colors.textSecondary,
                        marginTop: 4
                      }}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Subject */}
            <View style={{marginBottom: 12}}>
              <Text style={styles.inputLabel}>Subject *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email subject"
                placeholderTextColor={colors.textSecondary}
                value={newTemplate.subject}
                onChangeText={text => setNewTemplate({...newTemplate, subject: text})}
              />
            </View>

            {/* Description */}
            <View style={{marginBottom: 12}}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Brief description of template"
                placeholderTextColor={colors.textSecondary}
                value={newTemplate.description}
                onChangeText={text => setNewTemplate({...newTemplate, description: text})}
              />
            </View>

            {/* Variables Helper */}
            <TouchableOpacity 
              style={styles.variablesHelper}
              onPress={() => setShowVariables(!showVariables)}
            >
              <View>
                <Text style={styles.variablesHelperTitle}>Available Variables</Text>
                <Text style={styles.variablesHelperText}>
                  Click to insert variables like 
                </Text>
              </View>
              <Feather name={showVariables ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {showVariables && (
              <View style={{marginBottom: 12}}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 4}}>
                    {templateVariables.map(variable => (
                      <TouchableOpacity
                        key={variable}
                        style={styles.variableTag}
                        onPress={() => {
                          setNewTemplate({
                            ...newTemplate,
                            content: newTemplate.content + variable
                          });
                        }}
                      >
                        <Text style={styles.variableTagText}>
                          {variable}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Content */}
            <View style={{marginBottom: 20}}>
              <Text style={styles.inputLabel}>Template Content *</Text>
              <TextInput
                style={styles.contentInput}
                placeholder="Enter email content..."
                placeholderTextColor={colors.textSecondary}
                value={newTemplate.content}
                onChangeText={text => setNewTemplate({...newTemplate, content: text})}
                multiline
                numberOfLines={10}
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={[styles.actionText, styles.secondaryActionText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryAction]}
              onPress={handleCreateTemplate}
            >
              <Text style={[styles.actionText, styles.primaryActionText]}>
                Create Template
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Email Templates</Text>
          <Text style={styles.headerSubtitle}>
            Reusable email templates for your contacts
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Feather name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search templates..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flex: 1}}>
            <View style={{flexDirection: 'row', gap: 8}}>
              {templateCategories.map(category => {
                const categoryColor = category.id === 'all' ? colors.primary : category.color;
                const isSelected = selectedCategory === category.id;
                const backgroundColor = isSelected ? categoryColor : 
                  (isDark ? colors.border : '#f0f0f0');
                
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryButton, {
                      backgroundColor,
                      borderWidth: isSelected ? 0 : 1,
                    }]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    {category.id !== 'all' && (
                      <Feather 
                        name={category.icon as any} 
                        size={14} 
                        color={isSelected ? '#ffffff' : categoryColor} 
                        style={{marginRight: 4}}
                      />
                    )}
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: isSelected ? '#ffffff' : colors.textSecondary
                    }}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.favoriteFilterButton, {
              backgroundColor: favoritesOnly ? colors.warning + '20' : (isDark ? colors.border : '#f0f0f0'),
              borderColor: favoritesOnly ? colors.warning : colors.border
            }]}
            onPress={() => setFavoritesOnly(!favoritesOnly)}
          >
            <Feather 
              name="star" 
              size={18} 
              color={favoritesOnly ? colors.warning : colors.textSecondary} 
              fill={favoritesOnly ? colors.warning : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Templates List */}
      <View style={styles.contentContainer}>
        {filteredTemplates.length > 0 ? (
          <FlatList
            data={filteredTemplates}
            keyExtractor={item => item.id}
            renderItem={({item}) => <TemplateCard template={item} />}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.templateCount}>
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
                </Text>
                <TouchableOpacity 
                  style={styles.filterButton}
                  onPress={() => {
                    // Sort by most used
                    const sorted = [...templates].sort((a, b) => b.useCount - a.useCount);
                    setTemplates(sorted);
                  }}
                >
                  <Feather name="filter" size={16} color={colors.textSecondary} />
                  <Text style={styles.filterButtonText}>Most Used</Text>
                  <Feather name="chevron-down" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            }
            ListEmptyComponent={
              <View style={{paddingVertical: 20, alignItems: 'center'}}>
                <Feather name="inbox" size={48} color={colors.textSecondary} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: colors.textSecondary,
                  marginTop: 12
                }}>
                  No templates found
                </Text>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <Feather name="mail" size={36} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyStateTitle}>No templates found</Text>
            <Text style={styles.emptyStateText}>
              Try changing your search or filter criteria
            </Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFavoritesOnly(false);
              }}
            >
              <Feather name="refresh-cw" size={18} color="#ffffff" />
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: colors.primary}]}>
              {templates.length}
            </Text>
            <Text style={styles.statLabel}>Total Templates</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: colors.success}]}>
              {templates.filter(t => t.isFavorite).length}
            </Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: colors.warning}]}>
              {templates.reduce((sum, t) => sum + t.useCount, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Uses</Text>
          </View>
        </View>
      </View>

      {/* Modals */}
      <TemplateDetailModal />
      <CreateTemplateModal />
    </SafeAreaView>
  );
};

export default EmailTemplatesPage;