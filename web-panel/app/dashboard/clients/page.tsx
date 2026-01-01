"use client";

import { useClients } from '@/hooks/useClients';
import { ClientGrid } from '@/components/clients/ClientGrid';
import { Button } from '@/components/ui/Button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { getErrorTranslationKey } from '@/lib/error-utils';
import { ApiError } from '@/lib/api';
import EmptyState from '@/components/states/EmptyState';
import ErrorState from '@/components/states/ErrorState';
import ClientCardSkeleton from '@/components/skeletons/ClientCardSkeleton';

export default function ClientsPage() {
  const t = useTranslations('clients');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');

  const {
    clients,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    lastUpdated,
  } = useClients();

  // 1️⃣ Loading
  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{t('title')}</h2>
            <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <ClientCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // 2️⃣ Error
  if (isError) {
    const errorMessage = error && typeof error === 'object' && 'code' in error
      ? tErrors(getErrorTranslationKey((error as ApiError).code) as any)
      : error && typeof error === 'object' && 'message' in error
        ? (error as ApiError).message
        : tCommon('error');

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{t('title')}</h2>
            <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
          </div>
        </div>

        {/* Error State */}
        <ErrorState
          title={t('failedToLoad')}
          message={errorMessage}
          onRetry={() => refetch()}
          retryLabel={tCommon('retry')}
          isRetrying={isRefetching}
        />
      </div>
    );
  }

  // 3️⃣ Empty
  if (clients.length === 0) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{t('title')}</h2>
            <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefetching && "animate-spin")} />
            {tCommon('refresh')}
          </Button>
        </div>

        {/* Empty State */}
        <EmptyState
          title={t('noClients')}
          description={t('noClientsDescription')}
        />
      </div>
    );
  }

  // 4️⃣ Success
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t('title')}</h2>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              {tCommon('lastUpdated', { time: lastUpdated.toLocaleTimeString() })}
            </p>
          )}
          <Button
            variant="secondary"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefetching && "animate-spin")} />
            {isRefetching ? tCommon('refreshing') : tCommon('refresh')}
          </Button>
        </div>
      </div>

      {/* Client Grid */}
      <ClientGrid clients={clients.map(c => ({
        clientId: c.clientId,
        clientName: c.clientName,
        todayCompliancePercentage: c.todayCompliancePercentage,
        lastActivity: c.lastActivity,
        currentMeal: c.currentMeal,
        lastMealItem: c.lastMealItem,
      }))} />
    </div>
  );
}

