import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to inject mock auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aetheria_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors cleanly
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
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
