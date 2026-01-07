import apiClient from './client';
import type { TodayPlan } from '../types/diet-plan';

export async function getTodayPlan(): Promise<TodayPlan> {
  const response = await apiClient.get<TodayPlan>('/api/diet-plans/today');
  return response.data;
}
