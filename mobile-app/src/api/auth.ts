import apiClient from './client';
import type { RegisterRequest, LoginRequest, AuthResponse, ActivatePremiumRequest, ActivatePremiumResponse } from '../types/auth';

export async function registerClient(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/client/register', data);
  return response.data;
}

export async function loginClient(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/client/login', data);
  return response.data;
}

export async function activatePremium(data: ActivatePremiumRequest): Promise<ActivatePremiumResponse> {
  const response = await apiClient.post<ActivatePremiumResponse>('/api/client/activate-premium', data);
  return response.data;
}
