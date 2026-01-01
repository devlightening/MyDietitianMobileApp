import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiError } from '@/lib/api';

export interface LiveClient {
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
  ActiveClients: LiveClient[];
}

async function fetchLiveClients(): Promise<LiveClient[]> {
  const res = await api.get<GetLiveClientsResponse>('/api/dietitian/live-clients');
  return res.data.ActiveClients || [];
}

const CLIENTS_QUERY_KEY = ['clients', 'live'];

export function useClients() {
  const query = useQuery<LiveClient[], ApiError>({
    queryKey: CLIENTS_QUERY_KEY,
    queryFn: fetchLiveClients,
    refetchInterval: 30_000, // Poll every 30 seconds
    refetchIntervalInBackground: true,
    retry: 1,
    staleTime: 10_000, // Consider data fresh for 10 seconds
  });

  return {
    clients: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
  };
}

