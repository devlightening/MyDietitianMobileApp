import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../theme';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🥗</Text>
        <Text style={styles.title}>MyDietitian</Text>
        <Text style={styles.subtitle}>
          Sağlıklı yaşam yolculuğunuza başlayın
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Register' as never)}
          >
            <Text style={styles.primaryButtonText}>Email ile Kayıt Ol</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.secondaryButtonText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Kayıt olarak{' '}
            <Text style={styles.link}>Kullanım Koşulları</Text> ve{' '}
            <Text style={styles.link}>Gizlilik Politikası</Text>'nı kabul edersiniz
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  logo: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl * 2,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: colors.primary,
    fontWeight: '500',
  },
});
