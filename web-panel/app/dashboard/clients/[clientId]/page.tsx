"use client";

import { useQuery, useQueries } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import api from '@/lib/api';
import { ClientHeader } from '@/components/clients/ClientHeader';
import { MealTimeline } from '@/components/clients/MealTimeline';
import { ComplianceSummary } from '@/components/clients/ComplianceSummary';
import { WeeklyTrendChart } from '@/components/clients/WeeklyTrendChart';
import { InsightCard } from '@/components/clients/InsightCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { MealData } from '@/components/clients/MealCard';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface DailyComplianceResponse {
  clientId: string;
  clientName: string;
  date: string;
  dailyCompliancePercentage: number;
  meals: {
    mealId: string;
    mealType: number;
    mealName: string | null;
    compliancePercentage: number;
    items: {
      mealItemId: string;
      ingredientId: string;
      ingredientName: string;
      isMandatory: boolean;
      status: number | null; // 1=Done, 2=Skipped, 3=Alternative
      markedAt: string | null;
      alternativeIngredientId: string | null;
      alternativeIngredientName: string | null;
    }[];
  }[];
}

function mapStatus(status: number | null): 'done' | 'skipped' | 'alternative' | null {
  switch (status) {
    case 1:
      return 'done';
    case 2:
      return 'skipped';
    case 3:
      return 'alternative';
    default:
      return null;
  }
}

async function fetchDailyCompliance(clientId: string, date: Date): Promise<DailyComplianceResponse> {
  const dateStr = date.toISOString().split('T')[0];
  const res = await api.get<DailyComplianceResponse>(
    `/api/compliance/daily?clientId=${clientId}&date=${dateStr}`
  );
  return res.data;
}

function getLast7Days(): Date[] {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    days.push(date);
  }
  return days;
}

export default function ClientDetailPage() {
  const t = useTranslations('clients');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch current day's data
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['daily-compliance', clientId, selectedDate.toISOString().split('T')[0]],
    queryFn: () => fetchDailyCompliance(clientId, selectedDate),
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: true,
  });

  // Fetch last 7 days for summary (only when current day is loaded)
  const last7Days = useMemo(() => getLast7Days(), []);
  const weeklyQueries = useQueries({
    queries: last7Days.map((date) => ({
      queryKey: ['daily-compliance', clientId, date.toISOString().split('T')[0]],
      queryFn: () => fetchDailyCompliance(clientId, date),
      enabled: !!data, // Only fetch when current day data is loaded
      staleTime: 60000, // Cache for 1 minute
    })),
  });

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // Get last activity from meals
  const lastActivity = data?.meals
    .flatMap(m => m.items)
    .filter(item => item.markedAt !== null)
    .sort((a, b) => {
      if (!a.markedAt || !b.markedAt) return 0;
      return new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime();
    })[0]?.markedAt || null;

  // Transform data for components
  const mealsData: MealData[] | undefined = data?.meals.map(meal => ({
    mealId: meal.mealId,
    mealType: meal.mealType,
    mealName: meal.mealName,
    compliancePercentage: meal.compliancePercentage,
    items: meal.items.map(item => ({
      mealItemId: item.mealItemId,
      ingredientId: item.ingredientId,
      ingredientName: item.ingredientName,
      isMandatory: item.isMandatory,
      status: mapStatus(item.status),
      markedAt: item.markedAt,
      alternativeIngredientId: item.alternativeIngredientId,
      alternativeIngredientName: item.alternativeIngredientName,
    })),
  }));

  // Calculate summary from weekly data
  const weeklyData = useMemo(() => {
    const dataPoints = weeklyQueries
      .map((query, index) => {
        if (!query.data) return null;
        return {
          date: last7Days[index].toISOString().split('T')[0],
          compliance: query.data.dailyCompliancePercentage,
        };
      })
      .filter((point): point is { date: string; compliance: number } => point !== null);

    if (dataPoints.length === 0) {
      return {
        average: 0,
        bestDay: null,
        worstDay: null,
        trend: null,
        chartData: [],
      };
    }

    const compliances = dataPoints.map(d => d.compliance);
    const average = compliances.reduce((sum, val) => sum + val, 0) / compliances.length;

    const bestDay = dataPoints.reduce((best, current) =>
      current.compliance > best.compliance ? current : best
    );

    const worstDay = dataPoints.reduce((worst, current) =>
      current.compliance < worst.compliance ? current : worst
    );

    // Calculate trend (compare last 3 days avg vs first 3 days avg)
    let trend: 'up' | 'down' | 'stable' | null = null;
    if (dataPoints.length >= 6) {
      const first3Avg = compliances.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
      const last3Avg = compliances.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
      const diff = last3Avg - first3Avg;
      if (Math.abs(diff) < 2) {
        trend = 'stable';
      } else if (diff > 0) {
        trend = 'up';
      } else {
        trend = 'down';
      }
    }

    return {
      average,
      bestDay,
      worstDay,
      trend,
      chartData: dataPoints,
    };
  }, [weeklyQueries, last7Days]);

  // Calculate insights
  const tInsights = useTranslations('insights');
  const insights = useMemo(() => {
    const insightsList: Array<{ type: 'warning' | 'info' | 'positive'; title: string; message: string }> = [];

    if (weeklyData.average < 50) {
      insightsList.push({
        type: 'warning',
        title: tInsights('lowCompliance'),
        message: tInsights('lowComplianceMessage', { percentage: weeklyData.average.toFixed(0) }),
      });
    }

    if (weeklyData.trend === 'down') {
      insightsList.push({
        type: 'warning',
        title: tInsights('decliningTrend'),
        message: tInsights('decliningTrendMessage'),
      });
    } else if (weeklyData.trend === 'up') {
      insightsList.push({
        type: 'positive',
        title: tInsights('improvingTrend'),
        message: tInsights('improvingTrendMessage'),
      });
    }

    // Check for skipped breakfasts
    if (data?.meals) {
      const breakfastMeals = data.meals.filter(m => m.mealType === 1);
      const skippedBreakfasts = breakfastMeals.flatMap(m => m.items)
        .filter(item => item.status === 2 && item.isMandatory).length;
      
      if (skippedBreakfasts > 0) {
        insightsList.push({
          type: 'info',
          title: tInsights('breakfastCompliance'),
          message: tInsights('breakfastComplianceMessage', { count: skippedBreakfasts }),
        });
      }
    }

    return insightsList;
  }, [weeklyData, data, tInsights]);

  const isLoadingWeekly = weeklyQueries.some(q => q.isLoading);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <Card className="p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-32" />
        </Card>

        {/* Timeline Skeleton */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[...Array(2)].map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        {/* Back Button */}
        <Button
          variant="secondary"
          onClick={() => router.push('/dashboard/clients')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToClients')}
        </Button>

        {/* Error State */}
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('failedToLoad')}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {error instanceof Error ? error.message : tCommon('error')}
            </p>
            <Button variant="primary" onClick={() => refetch()} disabled={isRefetching}>
              {tCommon('retry')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button
        variant="secondary"
        onClick={() => router.push('/dashboard/clients')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToClients')}
      </Button>

      {/* Client Header */}
      <ClientHeader
        clientName={data.clientName}
        selectedDate={selectedDate}
        dailyCompliancePercentage={data.dailyCompliancePercentage}
        lastActivity={lastActivity}
        onDateChange={handleDateChange}
      />

      {/* Compliance Insights Section */}
      {!isLoadingWeekly && (
        <div className="space-y-6">
          {/* Summary & Chart Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComplianceSummary
              averageCompliance={weeklyData.average}
              bestDay={weeklyData.bestDay}
              worstDay={weeklyData.worstDay}
              trend={weeklyData.trend}
            />
            <WeeklyTrendChart data={weeklyData.chartData} />
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">{t('insights')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                  <InsightCard
                    key={index}
                    type={insight.type}
                    title={insight.title}
                    message={insight.message}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Meal Timeline */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('dailyTimeline')}</h2>
        {mealsData && mealsData.length > 0 ? (
          <MealTimeline meals={mealsData} />
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">{t('noMealsPlanned')}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

