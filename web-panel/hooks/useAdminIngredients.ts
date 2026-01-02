import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiError } from '@/lib/api';

export interface AdminIngredient {
  id: string;
  canonicalName: string;
  aliases: string[];
  isActive: boolean;
}

interface AdminIngredientsResponse {
  ingredients: AdminIngredient[];
}

async function fetchAdminIngredients(): Promise<AdminIngredient[]> {
  const res = await api.get<AdminIngredientsResponse>('/api/admin/ingredients');
  return res.data.ingredients || [];
}

interface CreateIngredientRequest {
  canonicalName: string;
  aliases: string[];
  isActive: boolean;
}

interface UpdateIngredientRequest {
  canonicalName: string;
  aliases: string[];
  isActive: boolean;
}

interface ToggleActiveRequest {
  isActive: boolean;
}

async function createIngredient(data: CreateIngredientRequest) {
  const res = await api.post('/api/admin/ingredients', data);
  return res.data;
}

async function updateIngredient(id: string, data: UpdateIngredientRequest) {
  const res = await api.put(`/api/admin/ingredients/${id}`, data);
  return res.data;
}

async function toggleIngredientActive(id: string, isActive: boolean) {
  const res = await api.patch(`/api/admin/ingredients/${id}/toggle-active`, { isActive });
  return res.data;
}

const ADMIN_INGREDIENTS_QUERY_KEY = ['admin', 'ingredients'];

export function useAdminIngredients() {
  return useQuery<AdminIngredient[], ApiError>({
    queryKey: ADMIN_INGREDIENTS_QUERY_KEY,
    queryFn: fetchAdminIngredients,
    retry: 1,
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_INGREDIENTS_QUERY_KEY });
    },
  });
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIngredientRequest }) =>
      updateIngredient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_INGREDIENTS_QUERY_KEY });
    },
  });
}

export function useToggleIngredientActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleIngredientActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_INGREDIENTS_QUERY_KEY });
    },
  });
}

