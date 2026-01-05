import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    const success = await login(email, password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  // Auto-fill demo credentials on focus
  const handleEmailFocus = () => {
    if (!email) {
      setEmail('example@gmail.com');
    }
  };

  const handlePasswordFocus = () => {
    if (!password) {
      setPassword('123456');
    }
  };

  const useDemoCredentials = () => {
    setEmail('example@gmail.com');
    setPassword('123456');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Mobile CRM</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          onFocus={handleEmailFocus}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          onFocus={handlePasswordFocus}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.demoButton}
          onPress={useDemoCredentials}
        >
          <Text style={styles.demoButtonText}>Use Demo Credentials</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Demo: Use any email/password
        </Text>
        
        <View style={styles.demoInfo}>
          <Text style={styles.demoInfoText}>
            Try: example@gmail.com / 123456
          </Text>
          <Text style={styles.demoInfoText}>
            Or any email/password combination
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  demoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
  },
  footer: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
    fontSize: 12,
  },
  demoInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  demoInfoText: {
    textAlign: 'center',
    color: '#856404',
    fontSize: 13,
    marginBottom: 5,
  },
});