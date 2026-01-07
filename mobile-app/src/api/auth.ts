import apiClient from './client';
import type { LoginRequest, LoginResponse } from '../types/auth';

export async function login(premiumKey: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/api/auth/client/login', {
    premiumKey,
  });
  return response.data;
}
