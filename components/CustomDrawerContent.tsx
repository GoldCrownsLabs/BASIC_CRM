import { useAppTheme } from '@/contaxt/ThemeContext';
import { useAuthStore } from '@/store/auth.store';
import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView
} from '@react-navigation/drawer';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuthStore();
  const { theme, colors, isDark, toggleTheme } = useAppTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Animate drawer content on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    logout();
    props.navigation.closeDrawer();
  };

  const menuItems = [
    {
      label: 'Home',
      icon: 'home-outline',
      onPress: () => {
        router.push('/(tabs)');
        props.navigation.closeDrawer();
      },
    },
    {
      label: 'Contacts',
      icon: 'people-outline',
      onPress: () => {
        router.push('/(tabs)/contacts');
        props.navigation.closeDrawer();
      },
    },
    {
      label: 'Leads',
      icon: 'trending-up-outline',
      onPress: () => {
        router.push('/(tabs)/leads');
        props.navigation.closeDrawer();
      },
    },
    {
      label: 'Tasks',
      icon: 'checkmark-circle-outline',
      onPress: () => {
        router.push('/(tabs)/tasks');
        props.navigation.closeDrawer();
      },
    },
 
  ];

  const handleThemeToggle = () => {
    toggleTheme(isDark ? 'light' : 'dark');
  };

  const getNextTheme = () => {
    if (theme === 'light') return 'dark';
    if (theme === 'dark') return 'system';
    return 'light';
  };

  const getThemeIcon = () => {
    if (theme === 'system') return 'contrast-outline';
    return isDark ? 'moon' : 'sunny';
  };

  const getThemeLabel = () => {
    if (theme === 'system') return 'System Theme';
    return isDark ? 'Dark Mode' : 'Light Mode';
  };

  return (
    <Animated.View style={[
      styles.container, 
      { 
        backgroundColor: colors.background,
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }, { scale: scaleAnim }]
      }
    ]}>
      {/* Header with Gradient Background */}
      <Animated.View style={[
        styles.header,
        { 
          backgroundColor: colors.primary,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          paddingTop: 50, // Added padding from top
        }
      ]}>
        <View style={styles.profileSection}>
          <Animated.View style={[
            styles.avatarContainer,
            {
              shadowColor: colors.text,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }
          ]}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card }]}>
                <Ionicons name="person" size={36} color={colors.primary} />
              </View>
            )}
            <View style={[styles.onlineIndicator, { backgroundColor: '#4CAF50' }]} />
          </Animated.View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {user?.name || 'Guest User'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || 'guest@example.com'}
            </Text>
            <View style={styles.roleContainer}>
              <Text style={[styles.userRole, { color: colors.primary }]}>
                Sales Manager
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </View>
          </View>
        </View>

        {/* Stats with Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card + 'CC' }]}>
            <Ionicons name="people" size={20} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>156</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Contacts</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card + 'CC' }]}>
            <Ionicons name="trending-up" size={20} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>42</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Leads</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card + 'CC' }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>18</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tasks</Text>
          </View>
        </View>
      </Animated.View>

      <DrawerContentScrollView 
        {...props} 
        style={[styles.drawerScroll, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <Animated.View
            key={index}
            style={{
              opacity: fadeAnim,
              transform: [
                { 
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0]
                  }) 
                },
              ]
            }}
          >
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: colors.card }]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[
                styles.menuIconContainer,
                { backgroundColor: colors.primary + '20' }
              ]}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>
                {item.label}
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Theme Section */}
        <Animated.View 
          style={[
            styles.themeSection,
            { backgroundColor: colors.card },
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>
          
          <View style={styles.themeToggle}>
            <View style={styles.themeToggleLeft}>
              <View style={[
                styles.themeIconContainer,
                { backgroundColor: colors.primary + '20' }
              ]}>
                <Ionicons
                  name={getThemeIcon() as any}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.themeTextContainer}>
                <Text style={[styles.themeTitle, { color: colors.text }]}>
                  {getThemeLabel()}
                </Text>
                <Text style={[styles.themeSubtitle, { color: colors.textSecondary }]}>
                  {theme === 'system' ? 'Follows device settings' : 'Manual selection'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              trackColor={{ 
                false: colors.border, 
                true: colors.primary + '80'
              }}
              thumbColor={isDark ? colors.primary : colors.textSecondary}
              ios_backgroundColor={colors.border}
            />
          </View>

          {/* Theme Quick Options */}
          <View style={styles.themeOptions}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                { 
                  backgroundColor: theme === 'light' ? colors.primary + '20' : colors.background,
                  borderColor: theme === 'light' ? colors.primary : colors.border
                }
              ]}
              onPress={() => toggleTheme('light')}
            >
              <View style={[
                styles.themeOptionIcon,
                { backgroundColor: theme === 'light' ? colors.primary : colors.textSecondary + '20' }
              ]}>
                <Ionicons
                  name="sunny"
                  size={16}
                  color={theme === 'light' ? colors.card : colors.textSecondary}
                />
              </View>
              <Text style={[
                styles.themeOptionText,
                { color: theme === 'light' ? colors.primary : colors.textSecondary }
              ]}>
                Light
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                { 
                  backgroundColor: theme === 'dark' ? colors.primary + '20' : colors.background,
                  borderColor: theme === 'dark' ? colors.primary : colors.border
                }
              ]}
              onPress={() => toggleTheme('dark')}
            >
              <View style={[
                styles.themeOptionIcon,
                { backgroundColor: theme === 'dark' ? colors.primary : colors.textSecondary + '20' }
              ]}>
                <Ionicons
                  name="moon"
                  size={16}
                  color={theme === 'dark' ? colors.card : colors.textSecondary}
                />
              </View>
              <Text style={[
                styles.themeOptionText,
                { color: theme === 'dark' ? colors.primary : colors.textSecondary }
              ]}>
                Dark
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                { 
                  backgroundColor: theme === 'system' ? colors.primary + '20' : colors.background,
                  borderColor: theme === 'system' ? colors.primary : colors.border
                }
              ]}
              onPress={() => toggleTheme('system')}
            >
              <View style={[
                styles.themeOptionIcon,
                { backgroundColor: theme === 'system' ? colors.primary : colors.textSecondary + '20' }
              ]}>
                <Ionicons
                  name="contrast-outline"
                  size={16}
                  color={theme === 'system' ? colors.card : colors.textSecondary}
                />
              </View>
              <Text style={[
                styles.themeOptionText,
                { color: theme === 'system' ? colors.primary : colors.textSecondary }
              ]}>
                System
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Quick Actions */}
        <View style={[styles.quickActions, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="add-circle" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                Add New
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="notifications" size={20} color={colors.secondary} />
              <Text style={[styles.actionButtonText, { color: colors.secondary }]}>
                Notifications
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <Animated.View style={[
        styles.footer,
        { 
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          opacity: fadeAnim,
        }
      ]}>
        <View style={styles.footerContent}>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: colors.error + '15' }]} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={[styles.logoutIcon, { backgroundColor: colors.error + '30' }]}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
            </View>
            <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity>
          
          <Text style={[styles.version, { color: colors.textSecondary }]}>
            v1.0.0 • CRM Pro
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    marginBottom: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  onlineIndicator: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
    bottom: 0,
    right: 0,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  drawerScroll: {
    flex: 1,
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 20,
    marginHorizontal: 16,
  },
  themeSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  themeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  themeTextContainer: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  themeSubtitle: {
    fontSize: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  themeOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  quickActions: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footerContent: {
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  logoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
});