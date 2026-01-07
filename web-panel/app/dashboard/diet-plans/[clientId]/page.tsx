'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { useDietPlan } from '@/hooks/useDietPlans';
import { getStatusBadgeColor, getStatusDisplay, getMealTypeDisplay } from '@/lib/types/diet-plan';

export default function DietPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  const { data: plan, isLoading, error } = useDietPlan(clientId);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center">
            <p className="text-destructive">No diet plan found for this client</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Plan Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{plan.name}</h1>
              <p className="text-lg text-muted-foreground mt-1">{plan.clientName}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded ${getStatusBadgeColor(plan.status)}`}>
              {getStatusDisplay(plan.status)}
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>{new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span>{plan.days.length} days</span>
            </div>
          </div>
        </div>

        {/* Days Timeline */}
        <div className="space-y-6">
          {plan.days.map((day, index) => (
            <div key={day.id} className="bg-card border border-border rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Day {index + 1}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                {day.dailyTargetCalories && (
                  <p className="text-sm text-muted-foreground">Target: {day.dailyTargetCalories} cal</p>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {day.meals.map((meal) => (
                  <div key={meal.id} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{getMealTypeDisplay(meal.type)}</span>
                      {meal.isMandatory && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 rounded">
                          Mandatory
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground">
                      {meal.plannedRecipeName || meal.customName || 'No recipe assigned'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
