import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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

  // Dismiss keyboard when tapping outside
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>
            <Text style={styles.title}>Mobile CRM</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                onFocus={handleEmailFocus}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#999"
                returnKeyType="next"
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                onFocus={handlePasswordFocus}
                secureTextEntry
                placeholderTextColor="#999"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
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

              <View style={styles.demoInfo}>
                <Text style={styles.demoInfoTitle}>Demo Credentials</Text>
                <Text style={styles.demoInfoText}>
                  Email: example@gmail.com
                </Text>
                <Text style={styles.demoInfoText}>
                  Password: 123456
                </Text>
                <Text style={styles.demoInfoNote}>
                  Or use any email/password combination
                </Text>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: '100%',
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
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
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  demoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 30,
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  demoInfo: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    marginBottom: 20,
  },
  demoInfoTitle: {
    textAlign: 'center',
    color: '#856404',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  demoInfoText: {
    textAlign: 'center',
    color: '#856404',
    fontSize: 14,
    marginBottom: 5,
  },
  demoInfoNote: {
    textAlign: 'center',
    color: '#856404',
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
  },
  footer: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
    fontSize: 12,
  },
});