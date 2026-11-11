import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { handleFallbackApi } from '../mocks/fallbackRouter';

export const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to inject mock auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('aetheria_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle HTML fallback or errors cleanly
api.interceptors.response.use(
  async (response) => {
    // If Vite returned HTML (SPA fallback) instead of JSON for an API endpoint
    if (
      typeof response.data === 'string' &&
      (response.data.includes('<!doctype') || response.data.includes('<html'))
    ) {
      const url = response.config.url || '';
      const method = response.config.method || 'get';
      const body = response.config.data ? JSON.parse(response.config.data) : undefined;
      const fallbackRes = await handleFallbackApi(method, url, body);
      return {
        ...response,
        status: fallbackRes.status,
        data: fallbackRes.data,
      };
    }
    return response;
  },
  async (error: AxiosError) => {
    // If network error or 404 from Vite on an /api/ endpoint, use local mock fallback
    if (error.config && error.config.url?.startsWith('/api/')) {
      try {
        const url = error.config.url;
        const method = error.config.method || 'get';
        const body = error.config.data ? JSON.parse(error.config.data) : undefined;
        const fallbackRes = await handleFallbackApi(method, url, body);
        return {
          data: fallbackRes.data,
          status: fallbackRes.status,
          statusText: 'OK',
          headers: {},
          config: error.config,
        };
      } catch (fbErr) {
        // Continue with original error
      }
    }

    // If 401 Unauthorized, dispatch auth error event for reactive handling
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aetheria:session_expired'));
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message || 'Erro na requisição';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ocorreu um erro inesperado';
}
