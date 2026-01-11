import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { colors, spacing } from '../theme';
import * as Clipboard from 'expo-clipboard';

export default function FreeHomeScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  async function copyUserId() {
    if (user?.publicUserId) {
      await Clipboard.setStringAsync(user.publicUserId);
      Alert.alert('✅ Kopyalandı!', `Kullanıcı ID'niz panoya kopyalandı:\n${user.publicUserId}`);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>MyDietitian</Text>
          {user?.publicUserId && (
            <View style={styles.idCard}>
              <Text style={styles.idLabel}>KULLANICI ID</Text>
              <View style={styles.idRow}>
                <Text style={styles.userId}>{user.publicUserId}</Text>
                <TouchableOpacity onPress={copyUserId} style={styles.copyButton}>
                  <Text style={styles.copyIcon}>📋</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.userIdHint}>
                Bu ID'yi diyetisyeninizle paylaşın
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeTitle}>🌟 Hoş Geldiniz!</Text>
        <Text style={styles.welcomeText}>
          MyDietitian hesabınız oluşturuldu. Premium özelliklerden faydalanmak için diyetisyeninizden aldığınız access key ile aktivasyon yapabilirsiniz.
        </Text>

        <View style={styles.featureBox}>
          <Text style={styles.featureTitle}>✨ Premium Özellikleri</Text>
          <Text style={styles.featureItem}>🥗 Kişisel diyet planları</Text>
          <Text style={styles.featureItem}>📊 Öğün takibi ve uyum skorları</Text>
          <Text style={styles.featureItem}>🔄 Alternatif öğün önerileri</Text>
          <Text style={styles.featureItem}>📈 İlerleme ve streak takibi</Text>
        </View>

        <TouchableOpacity
          style={styles.activateButton}
          onPress={() => navigation.navigate('ActivatePremium' as never)}
        >
          <Text style={styles.activateButtonText}>Premium'a Geç →</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Diyetisyen ile çalışmıyorsanız, size uygun bir diyetisyen bulmak için iletişime geçebilirsiniz.
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingTop: spacing.xl + 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  idCard: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: spacing.xs,
  },
  idLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  copyButton: {
    padding: spacing.xs,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
  },
  copyIcon: {
    fontSize: 20,
  },
  userIdHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  logoutText: {
    color: colors.error,
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  featureBox: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  featureItem: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  activateButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  activateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  infoText: {
    fontSize: 14,
    color: '#0c4a6e',
    lineHeight: 20,
  },
});
