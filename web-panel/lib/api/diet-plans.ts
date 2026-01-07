import axios from 'axios';
import type {
  CreateDietPlanRequest,
  CreateDietPlanResult,
  DietPlan,
} from '../types/diet-plan';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create a new diet plan
 */
export async function createDietPlan(
  data: Omit<CreateDietPlanRequest, 'dietitianId'>
): Promise<CreateDietPlanResult> {
  const response = await apiClient.post<CreateDietPlanResult>('/api/diet-plans', data);
  return response.data;
}

/**
 * Get diet plan for a specific client
 */
export async function getDietPlanByClient(clientId: string): Promise<DietPlan | null> {
  try {
    const response = await apiClient.get<DietPlan>(`/api/diet-plans/${clientId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Get all clients with their diet plan status (for list view)
 * Note: This might require a new backend endpoint or we fetch clients and check plans individually
 * For now, we'll use the clients endpoint and fetch plans as needed
 */
export interface ClientWithPlanStatus {
  clientId: string;
  clientName: string;
  hasPlan: boolean;
  planStatus?: 'Active' | 'Draft' | 'Expired' | 'Completed';
  planStartDate?: string;
  planEndDate?: string;
}

// We'll implement this using existing endpoints
export async function getClientsWithPlanStatus(): Promise<ClientWithPlanStatus[]> {
  // This is a placeholder - we'll need to fetch clients and check their plans
  // For MVP, we can make individual requests or add a new backend endpoint
  const response = await apiClient.get<any[]>('/api/clients');
  return response.data.map(client => ({
    clientId: client.id,
    clientName: client.fullName,
    hasPlan: false, // Will be populated by separate queries
  }));
}
