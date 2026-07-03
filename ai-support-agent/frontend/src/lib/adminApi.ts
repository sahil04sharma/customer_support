import axios from 'axios';
import { useAdminAuthStore } from '../hooks/useAdminAuth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export const adminApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = useAdminAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAdminAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
