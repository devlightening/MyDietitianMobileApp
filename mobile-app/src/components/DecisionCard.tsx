import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { AlternativeRecipe } from '../types/alternative';
import { colors, spacing } from '../theme';

interface DecisionCardProps {
  canCookOriginal: boolean;
  explanation: string;
  alternativeRecipe?: AlternativeRecipe;
  originalRecipeName: string;
}

export default function DecisionCard({
  canCookOriginal,
  explanation,
  alternativeRecipe,
  originalRecipeName,
}: DecisionCardProps) {
  // State 1: Can cook original (Green)
  if (canCookOriginal) {
    return (
      <View style={[styles.card, styles.greenCard]}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Harika!</Text>
        <Text style={styles.message}>{explanation}</Text>
        <Text style={styles.recipeName}>{originalRecipeName}</Text>
        <Text style={styles.subtitle}>Bu öğünü güvenle yapabilirsin</Text>
      </View>
    );
  }

  // State 2: Alternative recommended (Yellow)
  if (alternativeRecipe) {
    return (
      <View style={[styles.card, styles.yellowCard]}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.title}>Dikkat!</Text>
        <Text style={styles.message}>{explanation}</Text>

        <View style={styles.divider} />

        <Text style={styles.alternativeLabel}>Bunun yerine şunu öneriyoruz:</Text>
        <Text style={styles.alternativeRecipe}>{alternativeRecipe.recipeName}</Text>
        <Text style={styles.matchText}>
          Uygunluk: %{Math.round(alternativeRecipe.matchPercentage)}
        </Text>
      </View>
    );
  }

  // State 3: No suitable option (Red)
  return (
    <View style={[styles.card, styles.redCard]}>
      <Text style={styles.emoji}>😕</Text>
      <Text style={styles.title}>Üzgünüz</Text>
      <Text style={styles.message}>{explanation}</Text>
      <Text style={styles.subtitle}>
        Diyetisyeninle iletişime geçmeni öneririz
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  greenCard: {
    backgroundColor: '#d1fae5',
    borderWidth: 2,
    borderColor: colors.success,
  },
  yellowCard: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: colors.mandatory,
  },
  redCard: {
    backgroundColor: '#fee2e2',
    borderWidth: 2,
    borderColor: colors.error,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  recipeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  alternativeLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  alternativeRecipe: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.mandatory,
    marginBottom: spacing.sm,
  },
  matchText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
