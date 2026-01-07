import { useAppTheme } from '@/context/ThemeContext';
import { exportOptions, fileRequirements, importOptions, recentActivities } from '@/data/importData';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Linking,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const ImportExportPage = () => {
  const { colors, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [selectedImportType, setSelectedImportType] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedExportType, setSelectedExportType] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('CSV');

  // Handle file pick for import
  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: true
      });

      // Check if user didn't cancel (result.assets exists)
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('Selected file:', file);
        
        // Simulate file processing
        setIsImporting(true);
        setImportProgress(0);
        
        // Simulate progress
        const interval = setInterval(() => {
          setImportProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsImporting(false);
              setShowImportModal(false);
              Alert.alert(
                'Import Successful',
                `Your ${selectedImportType} have been imported successfully.`,
                [{ text: 'OK' }]
              );
              return 100;
            }
            return prev + 10;
          });
        }, 200);
      } else {
        // User cancelled the picker
        console.log('File selection was cancelled');
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  // Handle export
  const handleExport = async (type: string) => {
    setSelectedExportType(type);
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      setShowExportModal(false);
      Alert.alert(
        'Export Started',
        `Your ${type} export has been queued. You will be notified when it's ready to download.`,
        [{ text: 'OK' }]
      );
    }, 1500);
  };

  // Import Modal
  const ImportModal = () => {
    const selectedOption = importOptions.find(opt => opt.id === selectedImportType);
    
    return (
      <Modal visible={showImportModal} transparent animationType="slide">
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
                {selectedOption?.title}
              </Text>
              <TouchableOpacity onPress={() => setShowImportModal(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 24 }} showsVerticalScrollIndicator={false}>
              {selectedOption && (
                <>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24 }}>
                    {selectedOption.description}
                  </Text>

                  {/* Supported Formats */}
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                      Supported Formats
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {selectedOption.supportedFormats.map(format => (
                        <View
                          key={format}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 6,
                            backgroundColor: `${colors.primary}15`,
                            borderWidth: 1,
                            borderColor: colors.primary
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>
                            {format}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 8 }}>
                      Max file size: {selectedOption.maxFileSize}
                    </Text>
                  </View>

                  {/* Import Steps */}
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                      How to Import
                    </Text>
                    {selectedOption.steps.map((step, index) => (
                      <View key={index} style={{ flexDirection: 'row', marginBottom: 8 }}>
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: colors.primary,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12
                        }}>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>
                            {index + 1}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 14, color: colors.text, flex: 1 }}>
                          {step}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* File Requirements */}
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                      File Requirements
                    </Text>
                    <View style={{
                      backgroundColor: `${colors.info}10`,
                      borderRadius: 8,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: `${colors.info}30`
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                        <Feather name="info" size={16} color={colors.info} style={{ marginRight: 8, marginTop: 2 }} />
                        <Text style={{ fontSize: 12, color: colors.text, flex: 1 }}>
                          CSV files must use UTF-8 encoding
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <Feather name="info" size={16} color={colors.info} style={{ marginRight: 8, marginTop: 2 }} />
                        <Text style={{ fontSize: 12, color: colors.text, flex: 1 }}>
                          Date format: YYYY-MM-DD (e.g., 2024-03-15)
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
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
                      onPress={() => Linking.openURL(selectedOption.templateUrl)}
                    >
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                        Download Template
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
                      onPress={handleFilePick}
                      disabled={isImporting}
                    >
                      {isImporting ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                          Choose File
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Progress Bar */}
                  {isImporting && (
                    <View style={{ marginTop: 24 }}>
                      <Text style={{ fontSize: 14, color: colors.text, marginBottom: 8 }}>
                        Importing... {importProgress}%
                      </Text>
                      <View style={{
                        height: 8,
                        backgroundColor: colors.border,
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <View style={{
                          width: `${importProgress}%`,
                          height: '100%',
                          backgroundColor: colors.success,
                          borderRadius: 4
                        }} />
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Export Modal
  const ExportModal = () => {
    const selectedOption = exportOptions.find(opt => opt.id === selectedExportType);
    
    return (
      <Modal visible={showExportModal} transparent animationType="slide">
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
                {selectedOption?.title}
              </Text>
              <TouchableOpacity onPress={() => setShowExportModal(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 24 }} showsVerticalScrollIndicator={false}>
              {selectedOption && (
                <>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24 }}>
                    {selectedOption.description}
                  </Text>

                  {/* Format Selection */}
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                      Select Format
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {selectedOption.formats.map(format => (
                        <TouchableOpacity
                          key={format}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderRadius: 8,
                            backgroundColor: selectedFormat === format ? colors.primary : colors.background,
                            borderWidth: 1,
                            borderColor: selectedFormat === format ? colors.primary : colors.border
                          }}
                          onPress={() => setSelectedFormat(format)}
                        >
                          <Text style={{ 
                            fontSize: 14, 
                            fontWeight: '600', 
                            color: selectedFormat === format ? '#FFFFFF' : colors.text 
                          }}>
                            {format}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Includes */}
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                      Includes
                    </Text>
                    <View style={{
                      backgroundColor: colors.background,
                      borderRadius: 8,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: colors.border
                    }}>
                      <Text style={{ fontSize: 12, color: colors.text }}>
                        {selectedOption.includes.join(', ')}
                      </Text>
                    </View>
                  </View>

                  {/* Export Info */}
                  <View style={{ marginBottom: 24 }}>
                    <View style={{
                      backgroundColor: `${colors.info}10`,
                      borderRadius: 8,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: `${colors.info}30`
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Feather name="clock" size={16} color={colors.info} style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
                          Estimated Time: {selectedOption.estimatedTime}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Feather name="info" size={16} color={colors.info} style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: 12, color: colors.text }}>
                          Files will be available for download for 7 days
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Export Button */}
                  <TouchableOpacity
                    style={{
                      paddingVertical: 16,
                      borderRadius: 12,
                      backgroundColor: colors.primary,
                      alignItems: 'center',
                      opacity: isExporting ? 0.7 : 1
                    }}
                    onPress={() => handleExport(selectedOption.title)}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                          Preparing Export...
                        </Text>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                        Start Export
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

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
            Import & Export
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
            Manage your data transfers
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 16,
            alignItems: 'center',
            borderBottomWidth: 3,
            borderBottomColor: activeTab === 'import' ? colors.primary : 'transparent'
          }}
          onPress={() => setActiveTab('import')}
        >
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: activeTab === 'import' ? colors.primary : colors.textSecondary 
          }}>
            Import Data
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 16,
            alignItems: 'center',
            borderBottomWidth: 3,
            borderBottomColor: activeTab === 'export' ? colors.primary : 'transparent'
          }}
          onPress={() => setActiveTab('export')}
        >
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: activeTab === 'export' ? colors.primary : colors.textSecondary 
          }}>
            Export Data
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Import Section */}
        {activeTab === 'import' ? (
          <View style={{ padding: 20 }}>
            {/* Import Info */}
            <View style={{
              backgroundColor: `${colors.info}10`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: `${colors.info}30`
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                <Feather name="info" size={20} color={colors.info} style={{ marginRight: 12, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                    Before You Import
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.text }}>
                    Download our template files to ensure proper formatting. Large files may take several minutes to process.
                  </Text>
                </View>
              </View>
            </View>

            {/* Import Options */}
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16 }}>
              What would you like to import?
            </Text>
            
            <View style={{ marginBottom: 24 }}>
              {importOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                  onPress={() => {
                    setSelectedImportType(option.id);
                    setShowImportModal(true);
                  }}
                >
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: `${colors.primary}20`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16
                  }}>
                    <Feather name={option.icon as any} size={24} color={colors.primary} />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                      {option.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}>
                      {option.description}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                      {option.supportedFormats.map(format => (
                        <View
                          key={format}
                          style={{
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 4,
                            backgroundColor: colors.background
                          }}
                        >
                          <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                            {format}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  <Feather name="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>

            {/* File Requirements */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16 }}>
                File Requirements
              </Text>
              
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                  CSV Files
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                  • Max size: {fileRequirements.csv.maxSize}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                  • UTF-8 encoding required
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  • Use exact column headers from template
                </Text>
              </View>
              
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                  Excel Files
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                  • Max size: {fileRequirements.excel.maxSize}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                  • Max rows: {fileRequirements.excel.maxRows}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  • First sheet will be processed
                </Text>
              </View>
            </View>
          </View>
        ) : (
          /* Export Section */
          <View style={{ padding: 20 }}>
            {/* Export Info */}
            <View style={{
              backgroundColor: `${colors.success}10`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: `${colors.success}30`
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                <Feather name="shield" size={20} color={colors.success} style={{ marginRight: 12, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                    Secure Export
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.text }}>
                    Your data is encrypted during export. Download links expire after 7 days for security.
                  </Text>
                </View>
              </View>
            </View>

            {/* Export Options */}
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16 }}>
              What would you like to export?
            </Text>
            
            <View style={{ marginBottom: 24 }}>
              {exportOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                  onPress={() => {
                    setSelectedExportType(option.id);
                    setShowExportModal(true);
                  }}
                >
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: `${colors.primary}20`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16
                  }}>
                    <Feather name={option.icon as any} size={24} color={colors.primary} />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                      {option.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}>
                      {option.description}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Feather name="clock" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                        {option.estimatedTime}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, maxWidth: 100 }}>
                      {option.formats.map(format => (
                        <View
                          key={format}
                          style={{
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 4,
                            backgroundColor: colors.background
                          }}
                        >
                          <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                            {format}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Activity */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16 }}>
                Recent Activity
              </Text>
              
              {recentActivities.map((activity) => (
                <View
                  key={activity.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: activity.type === 'import' ? `${colors.info}20` : `${colors.success}20`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Feather 
                      name={activity.type === 'import' ? 'upload' : 'download'} 
                      size={20} 
                      color={activity.type === 'import' ? colors.info : colors.success} 
                    />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                      {activity.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      {activity.description}
                    </Text>
                  </View>
                  
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                      {activity.date}
                    </Text>
                    <View style={{
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 4,
                      backgroundColor: activity.status === 'completed' ? `${colors.success}20` : `${colors.error}20`
                    }}>
                      <Text style={{ 
                        fontSize: 10, 
                        fontWeight: '600',
                        color: activity.status === 'completed' ? colors.success : colors.error
                      }}>
                        {activity.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <ImportModal />
      <ExportModal />
    </SafeAreaView>
  );
};

export default ImportExportPage;