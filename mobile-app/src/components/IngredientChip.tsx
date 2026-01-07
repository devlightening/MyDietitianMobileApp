import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Ingredient } from '../types/alternative';
import { colors, spacing } from '../theme';

interface IngredientChipProps {
  ingredient: Ingredient;
  onRemove: () => void;
}

export default function IngredientChip({ ingredient, onRemove }: IngredientChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{ingredient.canonicalName}</Text>
      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <Text style={styles.removeText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    marginLeft: spacing.sm,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
