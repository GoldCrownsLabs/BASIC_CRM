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
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const SettingsPage = () => {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(isDark);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Profile data
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Solutions Inc.',
    position: 'Sales Manager'
  });

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    language: 'English',
    currency: 'USD',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY'
  });

  // Notification settings
  const notificationSettings = [
    { id: 'email', label: 'Email Notifications', enabled: true },
    { id: 'push', label: 'Push Notifications', enabled: true },
    { id: 'sms', label: 'SMS Alerts', enabled: false },
    { id: 'task', label: 'Task Reminders', enabled: true },
    { id: 'meeting', label: 'Meeting Alerts', enabled: true },
    { id: 'lead', label: 'Lead Updates', enabled: true },
  ];

  // Data export options
  const exportOptions = [
    { id: 'contacts', label: 'Contacts', format: 'CSV, Excel' },
    { id: 'leads', label: 'Leads', format: 'CSV, Excel' },
    { id: 'activities', label: 'Activities', format: 'CSV' },
    { id: 'reports', label: 'Reports', format: 'PDF, Excel' },
    { id: 'analytics', label: 'Analytics Data', format: 'JSON, CSV' },
  ];

  // App version info
  const appInfo = {
    version: '2.1.0',
    build: '2024.03.15',
    lastUpdated: '2 days ago'
  };

  // Handle profile update
  const handleProfileUpdate = () => {
    Alert.alert(
      'Profile Updated',
      'Your profile has been updated successfully.',
      [{ text: 'OK', onPress: () => setShowProfileModal(false) }]
    );
  };

  // Handle account settings update
  const handleAccountUpdate = () => {
    Alert.alert(
      'Settings Saved',
      'Your account settings have been updated.',
      [{ text: 'OK', onPress: () => setShowAccountModal(false) }]
    );
  };

  // Handle export data
  const handleExport = (type: string) => {
    Alert.alert(
      'Export Started',
      `Your ${type} data export has started. You will be notified when it's ready to download.`,
      [{ text: 'OK', onPress: () => setShowExportModal(false) }]
    );
  };

  // Handle theme toggle
  const handleThemeToggle = (value: boolean) => {
    setDarkModeEnabled(value);
    toggleTheme(value ? 'dark' : 'light');
  };

  // Profile Modal
  const ProfileModal = () => (
    <Modal visible={showProfileModal} transparent animationType="slide">
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
              Edit Profile
            </Text>
            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 24 }} showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: `${colors.primary}20`,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16
              }}>
                <Feather name="user" size={48} color={colors.primary} />
              </View>
              <TouchableOpacity>
                <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '600' }}>
                  Change Photo
                </Text>
              </TouchableOpacity>
            </View>

            {Object.entries(profile).map(([key, value]) => (
              <View key={key} style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8, textTransform: 'capitalize' }}>
                  {key}
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
                  value={value}
                  onChangeText={(text) => setProfile({ ...profile, [key]: text })}
                  placeholder={`Enter ${key}`}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            ))}

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
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
                onPress={() => setShowProfileModal(false)}
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
                onPress={handleProfileUpdate}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Account Settings Modal
  const AccountSettingsModal = () => (
    <Modal visible={showAccountModal} transparent animationType="slide">
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
              Account Settings
            </Text>
            <TouchableOpacity onPress={() => setShowAccountModal(false)}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 24 }} showsVerticalScrollIndicator={false}>
            {Object.entries(accountSettings).map(([key, value]) => (
              <View key={key} style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8, textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1')}
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
                  value={value}
                  onChangeText={(text) => setAccountSettings({ ...accountSettings, [key]: text })}
                  placeholder={`Select ${key}`}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            ))}

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
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
                onPress={() => setShowAccountModal(false)}
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
                onPress={handleAccountUpdate}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                  Save Settings
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Export Data Modal
  const ExportDataModal = () => (
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
              Export Data
            </Text>
            <TouchableOpacity onPress={() => setShowExportModal(false)}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 24 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24 }}>
              Select the data you want to export. You can choose multiple formats.
            </Text>

            {exportOptions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border
                }}
                onPress={() => handleExport(item.label)}
              >
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    {item.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    Available formats: {item.format}
                  </Text>
                </View>
                <Feather name="download" size={20} color={colors.primary} />
              </TouchableOpacity>
            ))}

            <View style={{ marginTop: 24 }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: 'center'
                }}
                onPress={() => handleExport('All Data')}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                  Export All Data
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Render Setting Item
  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange,
    color = colors.primary
  }: any) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${color}20`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
      }}>
        <Feather name={icon} size={20} color={color} />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <Feather name="chevron-right" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
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
            Settings
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
            Manage your preferences
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginRight: 8 }}>
            v{appInfo.version}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Section */}
        <View style={{ 
          paddingHorizontal: 20, 
          paddingTop: 20,
          backgroundColor: colors.card,
          marginBottom: 16
        }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16
            }}
            onPress={() => setShowProfileModal(true)}
          >
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: `${colors.primary}20`,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16
            }}>
              <Feather name="user" size={30} color={colors.primary} />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
                {profile.name}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
                {profile.email}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                {profile.company} • {profile.position}
              </Text>
            </View>
            
            <Feather name="edit-2" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ 
            fontSize: 12, 
            fontWeight: '600', 
            color: colors.textSecondary, 
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: 1
          }}>
            Account
          </Text>
          
          <View style={{ 
            backgroundColor: colors.card, 
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden'
          }}>
            <SettingItem
              icon="user"
              title="Account Settings"
              subtitle="Language, currency, timezone"
              onPress={() => setShowAccountModal(true)}
            />
            
            <SettingItem
              icon="shield"
              title="Privacy & Security"
              subtitle="Data protection and permissions"
              onPress={() => {}}
            />
            
            <SettingItem
              icon="lock"
              title="Change Password"
              subtitle="Update your login password"
              onPress={() => {}}
            />
            
            <SettingItem
              icon="users"
              title="Team Members"
              subtitle="Manage team access and roles"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ 
            fontSize: 12, 
            fontWeight: '600', 
            color: colors.textSecondary, 
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: 1
          }}>
            Preferences
          </Text>
          
          <View style={{ 
            backgroundColor: colors.card, 
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden'
          }}>
            <SettingItem
              icon="moon"
              title="Dark Mode"
              subtitle="Switch between light and dark theme"
              showSwitch={true}
              switchValue={darkModeEnabled}
              onSwitchChange={handleThemeToggle}
              color={colors.warning}
            />
            
            <SettingItem
              icon="bell"
              title="Notifications"
              subtitle="Manage alerts and reminders"
              showSwitch={true}
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
            />
            
            <SettingItem
              icon="refresh-cw"
              title="Auto Sync"
              subtitle="Automatically sync data"
              showSwitch={true}
              switchValue={autoSyncEnabled}
              onSwitchChange={setAutoSyncEnabled}
              color={colors.success}
            />
            
            <SettingItem
              icon="fingerprint"
              title="Biometric Login"
              subtitle="Use fingerprint or face ID"
              showSwitch={true}
              switchValue={biometricEnabled}
              onSwitchChange={setBiometricEnabled}
              color={colors.info}
            />
          </View>
        </View>

        {/* Notification Settings */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ 
            fontSize: 12, 
            fontWeight: '600', 
            color: colors.textSecondary, 
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: 1
          }}>
            Notification Settings
          </Text>
          
          <View style={{ 
            backgroundColor: colors.card, 
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden'
          }}>
            {notificationSettings.map((setting, index) => (
              <View key={setting.id}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderBottomWidth: index < notificationSettings.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border
                }}>
                  <Text style={{ fontSize: 16, color: colors.text }}>
                    {setting.label}
                  </Text>
                  <Switch
                    value={setting.enabled}
                    onValueChange={() => {}}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Data Management */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ 
            fontSize: 12, 
            fontWeight: '600', 
            color: colors.textSecondary, 
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: 1
          }}>
            Data Management
          </Text>
          
          <View style={{ 
            backgroundColor: colors.card, 
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden'
          }}>
            <SettingItem
              icon="download"
              title="Export Data"
              subtitle="Download your data in multiple formats"
              onPress={() => setShowExportModal(true)}
              color={colors.success}
            />
            
            <SettingItem
              icon="trash-2"
              title="Clear Cache"
              subtitle="Free up storage space"
              onPress={() => {
                Alert.alert(
                  'Clear Cache',
                  'Are you sure you want to clear cache?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Clear', 
                      style: 'destructive',
                      onPress: () => Alert.alert('Success', 'Cache cleared successfully')
                    }
                  ]
                );
              }}
              color={colors.error}
            />
            
            <SettingItem
              icon="database"
              title="Backup Data"
              subtitle="Create backup of your data"
              onPress={() => {}}
              color={colors.info}
            />
          </View>
        </View>

        {/* Support & About */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ 
            fontSize: 12, 
            fontWeight: '600', 
            color: colors.textSecondary, 
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: 1
          }}>
            Support & About
          </Text>
          
          <View style={{ 
            backgroundColor: colors.card, 
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden'
          }}>
            <SettingItem
              icon="help-circle"
              title="Help & Support"
              subtitle="FAQs and contact support"
              onPress={() => {}}
            />
            
            <SettingItem
              icon="file-text"
              title="Terms & Conditions"
              subtitle="Legal agreements"
              onPress={() => Linking.openURL('https://example.com/terms')}
            />
            
            <SettingItem
              icon="shield"
              title="Privacy Policy"
              subtitle="Data usage and privacy"
              onPress={() => Linking.openURL('https://example.com/privacy')}
            />
            
            <SettingItem
              icon="info"
              title="About App"
              subtitle={`Version ${appInfo.version} • Build ${appInfo.build}`}
              onPress={() => {
                Alert.alert(
                  'About CRM App',
                  `Version: ${appInfo.version}\nBuild: ${appInfo.build}\nLast Updated: ${appInfo.lastUpdated}\n\n© 2024 CRM Solutions Inc.`,
                  [{ text: 'OK' }]
                );
              }}
            />
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            style={{
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor: `${colors.error}15`,
              borderWidth: 1,
              borderColor: colors.error,
              alignItems: 'center'
            }}
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Sign Out', 
                    style: 'destructive',
                    onPress: () => Alert.alert('Signed Out', 'You have been signed out successfully')
                  }
                ]
              );
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.error }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <ProfileModal />
      <AccountSettingsModal />
      <ExportDataModal />
    </SafeAreaView>
  );
};

export default SettingsPage;