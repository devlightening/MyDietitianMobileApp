"use client";

import { MealCard, MealData } from './MealCard';
import { useTranslations } from 'next-intl';

interface MealTimelineProps {
  meals: MealData[];
}

export function MealTimeline({ meals }: MealTimelineProps) {
  const t = useTranslations('clients');
  
  if (meals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('noMealsPlanned')}</p>
      </div>
    );
  }

  // Meals are already ordered by MealType from backend
  return (
    <div className="space-y-6">
      {meals.map((meal) => (
        <MealCard key={meal.mealId} meal={meal} />
      ))}
    </div>
  );
}

