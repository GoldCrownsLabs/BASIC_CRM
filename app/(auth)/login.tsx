import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  const passwordRef = useRef<TextInput>(null);

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

  const useDemoCredentials = () => {
    setEmail('example@gmail.com');
    setPassword('123456');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingHorizontal: 20,
              paddingBottom: Platform.OS === 'ios' ? 40 : 20,
            }}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Logo/Title Section */}
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <Text style={{
                fontSize: 36,
                fontWeight: 'bold',
                color: '#2196F3',
                marginBottom: 10,
              }}>
                Mobile CRM
              </Text>
              <Text style={{
                fontSize: 16,
                color: '#666',
              }}>
                Sign in to continue
              </Text>
            </View>

            {/* Form Section */}
            <View>
              <TextInput
                style={{
                  backgroundColor: 'white',
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 15,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  fontSize: 16,
                }}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#999"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />

              <TextInput
                ref={passwordRef}
                style={{
                  backgroundColor: 'white',
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 25,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  fontSize: 16,
                }}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#999"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <TouchableOpacity
                style={{
                  backgroundColor: '#2196F3',
                  padding: 16,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
                onPress={handleLogin}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#4CAF50',
                  padding: 14,
                  borderRadius: 10,
                  alignItems: 'center',
                  marginTop: 12,
                }}
                onPress={useDemoCredentials}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  Use Demo Credentials
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  padding: 16,
                  alignItems: 'center',
                  marginTop: 12,
                }}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={{
                  color: '#2196F3',
                  fontSize: 16,
                  fontWeight: '500',
                }}>
                  Create New Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Demo Info */}
            <View style={{
              marginTop: 40,
              padding: 15,
              backgroundColor: '#FFF3CD',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#FFEAA7',
            }}>
              <Text style={{
                textAlign: 'center',
                color: '#856404',
                fontSize: 14,
                fontWeight: '600',
                marginBottom: 8,
              }}>
                Demo Credentials
              </Text>
              <Text style={{
                textAlign: 'center',
                color: '#856404',
                fontSize: 13,
              }}>
                Email: example@gmail.com
              </Text>
              <Text style={{
                textAlign: 'center',
                color: '#856404',
                fontSize: 13,
                marginTop: 4,
              }}>
                Password: 123456
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}