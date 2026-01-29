import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
import { priorities, recurrenceOptions, taskTypes, timeEstimates } from '@/data/tasks';
import { TaskFormData, TaskType } from '@/data/types/task';

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (taskData: TaskFormData) => void;
}

export default function AddTaskModal({ visible, onClose, onAddTask }: AddTaskModalProps) {
  const { colors, isDark } = useAppTheme();
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    type: 'call',
    assignedTo: '',
    relatedTo: '',
    relatedToType: 'contact',
    reminder: false,
    reminderTime: '09:00',
    tags: [],
    notes: '',
    timeEstimate: '1h',
    location: '',
    recurrence: 'none',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    if (!formData.dueDate) {
      alert('Please select a due date');
      return;
    }

    onAddTask(formData);
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      type: 'call',
      assignedTo: '',
      relatedTo: '',
      relatedToType: 'contact',
      reminder: false,
      reminderTime: '09:00',
      tags: [],
      notes: '',
      timeEstimate: '1h',
      location: '',
      recurrence: 'none',
    });
  };

  const renderField = (
    label: string,
    value: React.ReactNode,
    icon?: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.card,
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {icon && (
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={colors.textSecondary}
            style={{ marginRight: 12 }}
          />
        )}
        <View style={{ flex: 1 }}>
          <ThemedText 
            style={{ 
              fontSize: 12, 
              color: colors.textSecondary,
              marginBottom: 4 
            }}
          >
            {label}
          </ThemedText>
          {value}
        </View>
      </View>
      {onPress && (
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={colors.textSecondary} 
        />
      )}
    </TouchableOpacity>
  );

  // Helper function for text color on colored backgrounds
  const getContrastColor = (backgroundColor: string) => {
    return isDark ? colors.text : colors.card;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={{ 
        flex: 1, 
        backgroundColor: colors.background 
      }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <TouchableOpacity onPress={onClose}>
            <ThemedText style={{ color: colors.primary }}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
          
          <ThemedText type="defaultSemiBold" style={{ fontSize: 18, color: colors.text }}>
            Add New Task
          </ThemedText>
          
          <TouchableOpacity onPress={handleSubmit}>
            <ThemedText style={{ 
              color: colors.primary,
              fontWeight: '600'
            }}>
              Add
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Task Title */}
          <View style={{ marginBottom: 16 }}>
            <TextInput
              placeholder="Task Title"
              placeholderTextColor={colors.textSecondary}
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: colors.text,
                padding: 0,
                marginBottom: 4,
              }}
            />
            <View style={{ 
              height: 2, 
              backgroundColor: colors.primary,
              width: 40 
            }} />
          </View>

          {/* Description */}
          <TextInput
            placeholder="Description"
            placeholderTextColor={colors.textSecondary}
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            multiline
            numberOfLines={3}
            style={{
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.card,
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
          />

          {/* Grid Layout for Important Fields */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            {/* Priority Selector */}
            <View style={{ flex: 1, minWidth: 100 }}>
              <ThemedText style={{ 
                fontSize: 12, 
                color: colors.textSecondary,
                marginBottom: 8 
              }}>
                Priority
              </ThemedText>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {priorities.slice(1).map((priority) => (
                  <TouchableOpacity
                    key={priority.value}
                    onPress={() => handleInputChange('priority', priority.value)}
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      backgroundColor: formData.priority === priority.value 
                        ? priority.color + '20' 
                        : colors.card,
                      borderWidth: 1,
                      borderColor: formData.priority === priority.value 
                        ? priority.color 
                        : colors.border,
                      alignItems: 'center',
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="flag" 
                      size={16} 
                      color={formData.priority === priority.value 
                        ? priority.color 
                        : colors.textSecondary
                      } 
                    />
                    <ThemedText style={{ 
                      fontSize: 12,
                      color: formData.priority === priority.value 
                        ? priority.color 
                        : colors.textSecondary,
                      marginTop: 4
                    }}>
                      {priority.value}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Task Type Selector */}
            <View style={{ flex: 1, minWidth: 100 }}>
              <ThemedText style={{ 
                fontSize: 12, 
                color: colors.textSecondary,
                marginBottom: 8 
              }}>
                Type
              </ThemedText>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => {
                    const types: TaskType[] = ['call', 'meeting', 'email', 'follow_up'];
                    const currentIndex = types.indexOf(formData.type);
                    const nextIndex = (currentIndex + 1) % types.length;
                    handleInputChange('type', types[nextIndex]);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                    gap: 8,
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={taskTypes[formData.type]?.icon as any} 
                    size={16} 
                    color={taskTypes[formData.type]?.color || colors.primary} 
                  />
                  <ThemedText style={{ fontSize: 12, color: colors.text }}>
                    {taskTypes[formData.type]?.label}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Date and Time */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                flex: 1,
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              activeOpacity={0.7}
            >
              <ThemedText style={{ 
                fontSize: 12, 
                color: colors.textSecondary,
                marginBottom: 4 
              }}>
                Due Date
              </ThemedText>
              <ThemedText style={{ fontSize: 14, color: colors.text }}>
                {new Date(formData.dueDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={{
                flex: 1,
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              activeOpacity={0.7}
            >
              <ThemedText style={{ 
                fontSize: 12, 
                color: colors.textSecondary,
                marginBottom: 4 
              }}>
                Reminder Time
              </ThemedText>
              <ThemedText style={{ fontSize: 14, color: colors.text }}>
                {formData.reminderTime || 'Not set'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Assigned To */}
          {renderField(
            'Assigned To',
            <ThemedText style={{ fontSize: 14, color: colors.text }}>
              {formData.assignedTo}
            </ThemedText>,
            'person-outline',
            () => {
              // Implement member selection modal
            }
          )}

          {/* Related To */}
          {renderField(
            'Related To',
            <TextInput
              placeholder="Company, Contact, etc."
              placeholderTextColor={colors.textSecondary}
              value={formData.relatedTo}
              onChangeText={(text) => handleInputChange('relatedTo', text)}
              style={{ fontSize: 14, color: colors.text }}
            />,
            'link-outline'
          )}

          {/* Time Estimate */}
          {renderField(
            'Time Estimate',
            <ThemedText style={{ fontSize: 14, color: colors.text }}>
              {timeEstimates.find(t => t.value === formData.timeEstimate)?.label || 'Not set'}
            </ThemedText>,
            'time-outline',
            () => {
              // Implement time estimate selection
            }
          )}

          {/* Location */}
          {renderField(
            'Location',
            <TextInput
              placeholder="Add location"
              placeholderTextColor={colors.textSecondary}
              value={formData.location}
              onChangeText={(text) => handleInputChange('location', text)}
              style={{ fontSize: 14, color: colors.text }}
            />,
            'location-outline'
          )}

          {/* Tags */}
          <View style={{ marginBottom: 16 }}>
            <ThemedText style={{ 
              fontSize: 12, 
              color: colors.textSecondary,
              marginBottom: 8 
            }}>
              Tags
            </ThemedText>
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 8 
            }}>
              {formData.tags.map((tag) => (
                <View
                  key={tag}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.primary + '20',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    gap: 6,
                  }}
                >
                  <ThemedText style={{ fontSize: 12, color: colors.primary }}>
                    {tag}
                  </ThemedText>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close" size={14} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                placeholder="Add a tag"
                placeholderTextColor={colors.textSecondary}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: colors.text,
                  backgroundColor: colors.card,
                  padding: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
              <TouchableOpacity
                onPress={handleAddTag}
                style={{
                  padding: 10,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name="add" 
                  size={20} 
                  color={colors.card}  // ✅ Theme color use किया
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Additional Notes */}
          <View style={{ marginBottom: 16 }}>
            <ThemedText style={{ 
              fontSize: 12, 
              color: colors.textSecondary,
              marginBottom: 8 
            }}>
              Additional Notes
            </ThemedText>
            <TextInput
              placeholder="Add any additional notes or comments..."
              placeholderTextColor={colors.textSecondary}
              value={formData.notes}
              onChangeText={(text) => handleInputChange('notes', text)}
              multiline
              numberOfLines={4}
              style={{
                fontSize: 14,
                color: colors.text,
                backgroundColor: colors.card,
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
            />
          </View>

          {/* Reminder Toggle */}
          <TouchableOpacity
            onPress={() => handleInputChange('reminder', !formData.reminder)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              backgroundColor: colors.card,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 16,
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: formData.reminder ? colors.primary : 'transparent',
                borderWidth: 2,
                borderColor: formData.reminder ? colors.primary : colors.textSecondary,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {formData.reminder && (
                  <Ionicons 
                    name="checkmark" 
                    size={16} 
                    color={colors.card}  // ✅ Theme color use किया
                  />
                )}
              </View>
              <View>
                <ThemedText style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>
                  Set Reminder
                </ThemedText>
                <ThemedText style={{ 
                  fontSize: 12, 
                  color: colors.textSecondary 
                }}>
                  Get notified before the task is due
                </ThemedText>
              </View>
            </View>
            <Ionicons 
              name="notifications-outline" 
              size={24} 
              color={formData.reminder ? colors.primary : colors.textSecondary} 
            />
          </TouchableOpacity>

          {/* Recurrence */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              backgroundColor: colors.card,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 20,
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons 
                name="repeat-outline" 
                size={24} 
                color={colors.textSecondary} 
              />
              <View>
                <ThemedText style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>
                  Recurrence
                </ThemedText>
                <ThemedText style={{ 
                  fontSize: 12, 
                  color: colors.textSecondary 
                }}>
                  {recurrenceOptions.find(r => r.value === formData.recurrence)?.label}
                </ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </ScrollView>

        {/* Date and Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={new Date(formData.dueDate)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                handleInputChange('dueDate', selectedDate.toISOString().split('T')[0]);
              }
            }}
            themeVariant={isDark ? 'dark' : 'light'}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={new Date(`1970-01-01T${formData.reminderTime || '09:00'}`)}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                const timeString = selectedTime.toTimeString().split(' ')[0].substring(0, 5);
                handleInputChange('reminderTime', timeString);
                handleInputChange('reminder', true);
              }
            }}
            themeVariant={isDark ? 'dark' : 'light'}
          />
        )}
      </View>
    </Modal>
  );
}