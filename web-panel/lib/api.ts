import axios, { AxiosError, AxiosResponse } from 'axios';

const api = axios.create({
  withCredentials: true,
});

export interface ApiError {
  status: number;
  code: string;
  message: string;
}

api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    // Removed localStorage token usage
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    // Handle 401 - redirect to login
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      window.location.href = '/auth/login';
      return Promise.reject(error);
    }

    // Extract error information from backend response
    const apiError: ApiError = {
      status: error.response?.status ?? 500,
      code: error.response?.data?.error ?? 'UNKNOWN_ERROR',
      message: error.response?.data?.message ?? error.message ?? 'An unexpected error occurred',
    };

    return Promise.reject(apiError);
  }
);

export default api;
