import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true,
});

api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('jwt');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      window.localStorage.removeItem('jwt');
      window.location.href = '/auth/login';
    }
    return Promise.reject(
      error.response?.data?.message || error.message || 'Bir hata oluştu.'
    );
  }
);

export default api;
