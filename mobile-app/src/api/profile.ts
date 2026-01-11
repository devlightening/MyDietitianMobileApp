import { apiClient } from './client';

export async function getMyProfile() {
  const response = await apiClient.get('/api/profile/me');
  return response.data;
}
