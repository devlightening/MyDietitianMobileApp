import axios from 'axios';

const api = axios.create({
  withCredentials: true,
});

api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    // Removed localStorage token usage
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      window.location.href = '/auth/login';
    }
    return Promise.reject(
      error.response?.data?.message || error.message || 'Bir hata oluştu.'
    );
  }
);

export default api;
