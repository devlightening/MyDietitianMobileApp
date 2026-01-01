"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ClientGrid } from '@/components/clients/ClientGrid';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { RefreshCw, Users, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LiveClientDto {
  clientId: string; // GUID as string from backend
  clientName: string;
  lastActivity: string | null;
  todayCompliancePercentage: number;
  currentMeal: string | null;
  lastMealItem: string | null;
}

// Backend returns GetLiveClientsResult which has ActiveClients property
// Default .NET JSON serialization uses PascalCase
interface GetLiveClientsResponse {
  ActiveClients: LiveClientDto[];
}

async function fetchLiveClients(): Promise<LiveClientDto[]> {
  const res = await api.get<GetLiveClientsResponse>('/api/dietitian/live-clients');
  return res.data.ActiveClients || [];
}

export default function ClientsPage() {
  const [manualRefetchKey, setManualRefetchKey] = useState(0);

  const { data: clients, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['live-clients', manualRefetchKey],
    queryFn: fetchLiveClients,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: true,
  });

  const handleManualRefresh = () => {
    setManualRefetchKey(prev => prev + 1);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-12 w-20 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Clients</h2>
            <p className="text-muted-foreground mt-1">Today's compliance overview</p>
          </div>
          <Button
            variant="secondary"
            onClick={handleManualRefresh}
            disabled={isRefetching}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefetching && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load clients</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
            </p>
            <Button variant="primary" onClick={handleManualRefresh} disabled={isRefetching}>
              <RefreshCw className={cn("w-4 h-4 mr-2", isRefetching && "animate-spin")} />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const hasClients = clients && clients.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Clients</h2>
          <p className="text-muted-foreground mt-1">Today's compliance overview</p>
        </div>
        <Button
          variant="secondary"
          onClick={handleManualRefresh}
          disabled={isRefetching}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isRefetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Content */}
      {!hasClients ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No clients yet</h3>
            <p className="text-sm text-muted-foreground">
              Start by generating access keys for your clients.
            </p>
          </div>
        </Card>
      ) : (
        <ClientGrid clients={clients.map(c => ({
          clientId: c.clientId,
          clientName: c.clientName,
          todayCompliancePercentage: c.todayCompliancePercentage,
          lastActivity: c.lastActivity,
          currentMeal: c.currentMeal,
          lastMealItem: c.lastMealItem,
        }))} />
      )}
    </div>
  );
}

