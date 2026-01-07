import apiClient from './client';
import type {
  AlternativeDecisionRequest,
  AlternativeDecisionResponse,
  Ingredient
} from '../types/alternative';

export async function decideAlternative(
  data: Omit<AlternativeDecisionRequest, 'dietitianId'>
): Promise<AlternativeDecisionResponse> {
  const response = await apiClient.post<AlternativeDecisionResponse>(
    '/api/diet-plans/decide-alternative',
    data
  );
  return response.data;
}

export async function searchIngredients(query: string): Promise<Ingredient[]> {
  if (!query || query.length < 2) return [];

  const response = await apiClient.get<Ingredient[]>(
    `/api/ingredients/search?q=${encodeURIComponent(query)}`
  );
  return response.data;
}
