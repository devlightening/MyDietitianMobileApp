import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { login } from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import { colors, spacing } from '../theme';

export default function LoginScreen() {
  const [premiumKey, setPremiumKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();

  async function handleLogin() {
    if (!premiumKey.trim()) {
      Alert.alert('Hata', 'Lütfen premium key giriniz');
      return;
    }

    setLoading(true);
    try {
      const response = await login(premiumKey);
      await authLogin(response.token);
    } catch (error: any) {
      Alert.alert('Giriş Başarısız', error.response?.data?.message || 'Geçersiz premium key');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyDietitian</Text>
      <Text style={styles.subtitle}>Mobil Danışan Uygulaması</Text>

      <TextInput
        style={styles.input}
        placeholder="Premium Key"
        value={premiumKey}
        onChangeText={setPremiumKey}
        autoCapitalize="characters"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
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
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
