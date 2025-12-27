import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true,
});

// Attach JWT from localStorage if present
api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('jwt')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api;
