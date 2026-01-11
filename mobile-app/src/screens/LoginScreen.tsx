import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { colors, spacing } from '../theme';
import axios from 'axios';

const API_BASE_URL = 'http://172.20.10.4:5000';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation();

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Hata', 'Email ve şifre gereklidir');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      // DETAILED ERROR LOGGING
      console.log('=== LOGIN ERROR ===');
      console.log('Error:', error);
      console.log('Response:', error?.response);
      console.log('Status:', error?.response?.status);
      console.log('Data:', error?.response?.data);
      console.log('Message:', error?.message);
      console.log('==================');

      if (error.response?.status === 401) {
        Alert.alert('Giriş Başarısız', 'Email veya şifre hatalı');
      } else if (error.message?.includes('Network')) {
        Alert.alert('Bağlantı Hatası', `Backend'e ulaşılamıyor: ${API_BASE_URL}`);
      } else {
        Alert.alert(
          'Sunucu Hatası',
          error.response?.data?.message || error.message || 'Teknik bir hata oluştu'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>MyDietitian</Text>
        <Text style={styles.subtitle}>Diyet planınıza giriş yapın</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Register' as never)}
          disabled={loading}
        >
          <Text style={styles.linkText}>
            Hesabınız yok mu? <Text style={styles.linkTextBold}>Kayıt Ol</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  linkTextBold: {
    color: colors.primary,
    fontWeight: '600',
  },
});
