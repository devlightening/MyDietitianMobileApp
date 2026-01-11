import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

interface ComplianceButtonsProps {
  mealId: string;
  onMark: (status: 'done' | 'alternative' | 'skipped') => void;
  currentStatus?: 'done' | 'alternative' | 'skipped';
  disabled?: boolean;
}

export default function ComplianceButtons({
  mealId,
  onMark,
  currentStatus,
  disabled = false
}: ComplianceButtonsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bu öğünü tamamladın mı?</Text>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.doneButton,
            currentStatus === 'done' && styles.activeButton,
            disabled && styles.disabledButton
          ]}
          onPress={() => onMark('done')}
          disabled={disabled}
        >
          <Text style={styles.buttonEmoji}>✅</Text>
          <Text style={styles.buttonText}>Yaptım</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.alternativeButton,
            currentStatus === 'alternative' && styles.activeButton,
            disabled && styles.disabledButton
          ]}
          onPress={() => onMark('alternative')}
          disabled={disabled}
        >
          <Text style={styles.buttonEmoji}>🔁</Text>
          <Text style={styles.buttonText}>Alternatif</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.skippedButton,
            currentStatus === 'skipped' && styles.activeButton,
            disabled && styles.disabledButton
          ]}
          onPress={() => onMark('skipped')}
          disabled={disabled}
        >
          <Text style={styles.buttonEmoji}>⏭️</Text>
          <Text style={styles.buttonText}>Yapamadım</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  doneButton: {
    backgroundColor: '#f0fdf4',
  },
  alternativeButton: {
    backgroundColor: '#fffbeb',
  },
  skippedButton: {
    backgroundColor: '#f8fafc',
  },
  activeButton: {
    borderColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
});
