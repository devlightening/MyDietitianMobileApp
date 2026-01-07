import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { getTodayPlan } from '../api/diet-plans';
import { colors, spacing } from '../theme';
import { getMealTypeName } from '../types/diet-plan';
import { useAuth } from '../auth/AuthContext';

export default function TodayScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['today-plan'],
    queryFn: getTodayPlan,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Plan yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Plan yüklenemedi</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bugün</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.date}>{new Date(data!.date).toLocaleDateString('tr-TR')}</Text>

      {data!.dailyTargetCalories && (
        <Text style={styles.calories}>Hedef: {data!.dailyTargetCalories} kcal</Text>
      )}

      {data!.meals.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Bugün için plan yok</Text>
        </View>
      ) : (
        <FlatList
          data={data!.meals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealType}>{getMealTypeName(item.type)}</Text>
                {item.isMandatory && (
                  <View style={styles.mandatoryBadge}>
                    <Text style={styles.mandatoryText}>Zorunlu</Text>
                  </View>
                )}
              </View>
              <Text style={styles.recipeName}>
                {item.plannedRecipeName || item.customName || 'Tarif atanmamış'}
              </Text>
              <Text style={styles.infoText}>Bu öğün diyet planının bir parçasıdır</Text>

              {item.plannedRecipeName && (
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={() => navigation.navigate('CheckIngredients' as never, {
                    mealId: item.id,
                    plannedRecipeId: item.plannedRecipeId,
                    mealType: item.type,
                    recipeName: item.plannedRecipeName,
                  } as never)}
                >
                  <Text style={styles.checkButtonText}>Malzemelerimi Kontrol Et →</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
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
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl + 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  logoutText: {
    color: colors.error,
    fontSize: 14,
  },
  date: {
    fontSize: 16,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  calories: {
    fontSize: 14,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  mealCard: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mealType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  mandatoryBadge: {
    backgroundColor: colors.mandatory,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mandatoryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  checkButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
  },
});
