import { useAuthStore } from '@/store/auth.store';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function LogoutButton() {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleLogout}>
      <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
      <Text style={styles.text}>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFE5E5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  text: {
    marginLeft: 6,
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 14,
  },
});