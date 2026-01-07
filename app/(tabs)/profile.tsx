import { useAppTheme } from '@/context/ThemeContext';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
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

const ProfilePage = () => {
  const { colors, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // User profile data
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Solutions Inc.',
    position: 'Sales Manager',
    department: 'Sales',
    location: 'New York, USA',
    bio: 'Experienced sales professional with 8+ years in B2B software sales. Passionate about building strong client relationships.',
    joinDate: 'March 15, 2022',
    status: 'Active',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    biometricLogin: false,
    lastPasswordChange: '3 months ago',
    lastLogin: '2 hours ago',
    devices: [
      { id: '1', name: 'iPhone 14 Pro', os: 'iOS', lastActive: 'Now' },
      { id: '2', name: 'MacBook Pro', os: 'macOS', lastActive: 'Yesterday' },
      { id: '3', name: 'iPad Air', os: 'iOS', lastActive: '1 week ago' }
    ]
  });

  // Activity logs
  const [activityLogs, setActivityLogs] = useState([
    { id: '1', type: 'login', title: 'Logged in', description: 'From iPhone 14 Pro', time: '2 hours ago', icon: 'log-in' },
    { id: '2', type: 'contact', title: 'Added new contact', description: 'Sarah Johnson from ABC Corp', time: '5 hours ago', icon: 'user-plus' },
    { id: '3', type: 'task', title: 'Completed task', description: 'Follow up with potential client', time: 'Yesterday', icon: 'check-circle' },
    { id: '4', type: 'meeting', title: 'Scheduled meeting', description: 'Quarterly review with team', time: '2 days ago', icon: 'calendar' },
    { id: '5', type: 'export', title: 'Exported data', description: 'Monthly report as PDF', time: '3 days ago', icon: 'download' },
    { id: '6', type: 'password', title: 'Changed password', description: 'Password updated successfully', time: '1 week ago', icon: 'lock' },
    { id: '7', type: 'profile', title: 'Updated profile', description: 'Changed phone number', time: '2 weeks ago', icon: 'edit-2' }
  ]);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Handle profile update
  const handleProfileUpdate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowEditProfile(false);
      Alert.alert('Success', 'Profile updated successfully!');
    }, 1500);
  };

  // Handle password change
  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowChangePassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Success', 'Password changed successfully!');
    }, 1500);
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowDeleteAccount(false);
      Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
    }, 2000);
  };

  // Simulate image upload
  const handleImageUpload = () => {
    setIsUploadingImage(true);
    setTimeout(() => {
      setIsUploadingImage(false);
      Alert.alert('Success', 'Profile picture updated!');
    }, 1500);
  };

  // Edit Profile Modal
  const EditProfileModal = () => (
    <Modal visible={showEditProfile} transparent animationType="slide">
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
            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 24 }} showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ position: 'relative' }}>
                <Image
                  source={{ uri: profile.avatar }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    borderWidth: 3,
                    borderColor: colors.primary
                  }}
                />
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 3,
                    borderColor: colors.card
                  }}
                  onPress={handleImageUpload}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Feather name="camera" size={18} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                  First Name
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
                  value={profile.firstName}
                  onChangeText={(text) => setProfile({ ...profile, firstName: text })}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                  Last Name
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
                  value={profile.lastName}
                  onChangeText={(text) => setProfile({ ...profile, lastName: text })}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Email
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
                value={profile.email}
                onChangeText={(text) => setProfile({ ...profile, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Phone Number
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
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                keyboardType="phone-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Company
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
                value={profile.company}
                onChangeText={(text) => setProfile({ ...profile, company: text })}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Bio
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
                value={profile.bio}
                onChangeText={(text) => setProfile({ ...profile, bio: text })}
                multiline
                numberOfLines={4}
                placeholderTextColor={colors.textSecondary}
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
                onPress={() => setShowEditProfile(false)}
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
                  alignItems: 'center',
                  opacity: isLoading ? 0.7 : 1
                }}
                onPress={handleProfileUpdate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Change Password Modal
  const ChangePasswordModal = () => (
    <Modal visible={showChangePassword} transparent animationType="slide">
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
              Change Password
            </Text>
            <TouchableOpacity onPress={() => setShowChangePassword(false)}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 24 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24 }}>
              Enter your current password and choose a new one.
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Current Password
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
                value={passwordForm.currentPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, currentPassword: text })}
                secureTextEntry
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                New Password
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
                value={passwordForm.newPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, newPassword: text })}
                secureTextEntry
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Confirm New Password
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
                value={passwordForm.confirmPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, confirmPassword: text })}
                secureTextEntry
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={{
              backgroundColor: `${colors.info}10`,
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: `${colors.info}30`
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                <Feather name="shield" size={16} color={colors.info} style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={{ fontSize: 12, color: colors.text, flex: 1 }}>
                  Password must be at least 6 characters with one uppercase letter and one number.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={{
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: 'center',
                opacity: isLoading ? 0.7 : 1
              }}
              onPress={handlePasswordChange}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                  Change Password
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Delete Account Modal
  const DeleteAccountModal = () => (
    <Modal visible={showDeleteAccount} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          width: width * 0.9,
          maxHeight: '80%',
          borderWidth: 1,
          borderColor: colors.border
        }}>
          <View style={{
            padding: 24,
            borderBottomWidth: 1,
            borderBottomColor: colors.border
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: `${colors.error}20`,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16
              }}>
                <Feather name="alert-triangle" size={24} color={colors.error} />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, flex: 1 }}>
                Delete Account
              </Text>
            </View>
            
            <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
              This action cannot be undone. All your data will be permanently deleted, including contacts, leads, and activities. You will lose access to your account immediately.
            </Text>
          </View>

          <View style={{ padding: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
              Type "DELETE" to confirm
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
                marginBottom: 24
              }}
              placeholder="Type DELETE here"
              placeholderTextColor={colors.textSecondary}
            />

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
                onPress={() => setShowDeleteAccount(false)}
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
                  backgroundColor: colors.error,
                  alignItems: 'center',
                  opacity: isLoading ? 0.7 : 1
                }}
                onPress={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                    Delete Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render Info Item
  const InfoItem = ({ icon, label, value }: any) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${colors.primary}20`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
      }}>
        <Feather name={icon} size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
          {value}
        </Text>
      </View>
    </View>
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
            Profile
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
            Manage your account settings
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
            borderBottomColor: activeTab === 'profile' ? colors.primary : 'transparent'
          }}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={{ 
            fontSize: 14, 
            fontWeight: '600', 
            color: activeTab === 'profile' ? colors.primary : colors.textSecondary 
          }}>
            Profile
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 16,
            alignItems: 'center',
            borderBottomWidth: 3,
            borderBottomColor: activeTab === 'security' ? colors.primary : 'transparent'
          }}
          onPress={() => setActiveTab('security')}
        >
          <Text style={{ 
            fontSize: 14, 
            fontWeight: '600', 
            color: activeTab === 'security' ? colors.primary : colors.textSecondary 
          }}>
            Security
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 16,
            alignItems: 'center',
            borderBottomWidth: 3,
            borderBottomColor: activeTab === 'activity' ? colors.primary : 'transparent'
          }}
          onPress={() => setActiveTab('activity')}
        >
          <Text style={{ 
            fontSize: 14, 
            fontWeight: '600', 
            color: activeTab === 'activity' ? colors.primary : colors.textSecondary 
          }}>
            Activity
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <View style={{ padding: 20 }}>
            {/* Profile Header */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <View style={{ position: 'relative', marginRight: 20 }}>
                  <Image
                    source={{ uri: profile.avatar }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      borderWidth: 3,
                      borderColor: colors.primary
                    }}
                  />
                  <View style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: colors.success,
                    borderWidth: 2,
                    borderColor: colors.card
                  }} />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                    {profile.firstName} {profile.lastName}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                    {profile.position} • {profile.company}
                  </Text>
                  <View style={{
                    alignSelf: 'flex-start',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: `${colors.success}20`
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.success }}>
                      {profile.status}
                    </Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity
                style={{
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  alignItems: 'center'
                }}
                onPress={() => setShowEditProfile(true)}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                  Edit Profile
                </Text>
              </TouchableOpacity>
            </View>

            {/* Personal Information */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 20 }}>
                Personal Information
              </Text>
              
              <InfoItem icon="mail" label="Email" value={profile.email} />
              <InfoItem icon="phone" label="Phone" value={profile.phone} />
              <InfoItem icon="briefcase" label="Company" value={profile.company} />
              <InfoItem icon="map-pin" label="Location" value={profile.location} />
              <InfoItem icon="calendar" label="Member Since" value={profile.joinDate} />
            </View>

            {/* Bio Section */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                About
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>
                {profile.bio}
              </Text>
            </View>

            {/* Stats */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 20 }}>
                Stats
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary, marginBottom: 4 }}>
                    245
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    Contacts
                  </Text>
                </View>
                
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: colors.success, marginBottom: 4 }}>
                    48
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    Active Leads
                  </Text>
                </View>
                
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: colors.warning, marginBottom: 4 }}>
                    156
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    Activities
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <View style={{ padding: 20 }}>
            {/* Security Settings */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 20 }}>
                Security Settings
              </Text>
              
              {Object.entries({
                twoFactorAuth: 'Two-Factor Authentication',
                emailNotifications: 'Email Notifications',
                pushNotifications: 'Push Notifications',
                smsAlerts: 'SMS Alerts',
                biometricLogin: 'Biometric Login'
              }).map(([key, label]) => (
                <View key={key} style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border
                }}>
                  <Text style={{ fontSize: 16, color: colors.text }}>
                    {label}
                  </Text>
                  <Switch
                    value={securitySettings[key as keyof typeof securitySettings] as boolean}
                    onValueChange={(value) => setSecuritySettings({ ...securitySettings, [key]: value })}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ))}
            </View>

            {/* Password Section */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
                Password
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 20 }}>
                Last changed: {securitySettings.lastPasswordChange}
              </Text>
              
              <TouchableOpacity
                style={{
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center'
                }}
                onPress={() => setShowChangePassword(true)}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.primary }}>
                  Change Password
                </Text>
              </TouchableOpacity>
            </View>

            {/* Active Devices */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
                  Active Devices
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  {securitySettings.devices.length} devices
                </Text>
              </View>
              
              {securitySettings.devices.map((device) => (
                <View
                  key={device.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${colors.primary}20`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 16
                  }}>
                    <MaterialIcons 
                      name={device.os === 'iOS' ? 'phone-iphone' : 'computer'} 
                      size={20} 
                      color={colors.primary} 
                    />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                      {device.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                      {device.os} • Last active: {device.lastActive}
                    </Text>
                  </View>
                  
                  {device.lastActive === 'Now' && (
                    <View style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.success
                    }} />
                  )}
                </View>
              ))}
            </View>

            {/* Danger Zone */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.error, marginBottom: 16 }}>
                Danger Zone
              </Text>
              
              <TouchableOpacity
                style={{
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: `${colors.error}10`,
                  borderWidth: 1,
                  borderColor: colors.error,
                  alignItems: 'center'
                }}
                onPress={() => setShowDeleteAccount(true)}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.error }}>
                  Delete Account
                </Text>
              </TouchableOpacity>
              
              <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 12 }}>
                Once deleted, your account cannot be recovered.
              </Text>
            </View>
          </View>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <View style={{ padding: 20 }}>
            {/* Activity Header */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
                  Recent Activity
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  Last 30 days
                </Text>
              </View>
              
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 32, fontWeight: '700', color: colors.primary }}>
                  {activityLogs.length}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  activities this month
                </Text>
              </View>
              
              <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
                Last login: {securitySettings.lastLogin}
              </Text>
            </View>

            {/* Activity Timeline */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 20 }}>
                Activity Timeline
              </Text>
              
              {activityLogs.map((activity, index) => (
                <View
                  key={activity.id}
                  style={{
                    flexDirection: 'row',
                    paddingVertical: 16,
                    borderBottomWidth: index < activityLogs.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border
                  }}
                >
                  <View style={{ marginRight: 16 }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: 
                        activity.type === 'login' ? `${colors.info}20` :
                        activity.type === 'contact' ? `${colors.success}20` :
                        activity.type === 'task' ? `${colors.warning}20` :
                        activity.type === 'meeting' ? `${colors.primary}20` :
                        activity.type === 'export' ? `${colors.info}20` :
                        activity.type === 'password' ? `${colors.error}20` :
                        `${colors.primary}20`,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Feather 
                        name={activity.icon as any} 
                        size={20} 
                        color={
                          activity.type === 'login' ? colors.info :
                          activity.type === 'contact' ? colors.success :
                          activity.type === 'task' ? colors.warning :
                          activity.type === 'meeting' ? colors.primary :
                          activity.type === 'export' ? colors.info :
                          activity.type === 'password' ? colors.error :
                          colors.primary
                        } 
                      />
                    </View>
                    
                    {index < activityLogs.length - 1 && (
                      <View style={{
                        flex: 1,
                        width: 2,
                        backgroundColor: colors.border,
                        alignSelf: 'center',
                        marginTop: 4
                      }} />
                    )}
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                      {activity.title}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                      {activity.description}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      {activity.time}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <EditProfileModal />
      <ChangePasswordModal />
      <DeleteAccountModal />
    </SafeAreaView>
  );
};

export default ProfilePage;