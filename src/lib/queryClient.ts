import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query Client Configuration:
 * - staleTime: 20 seconds for standard queries (NFTs catalog, details)
 * - gcTime: 10 minutes cache garbage collection
 * - retry: 1 retry on non-4xx failures
 * - refetchOnReconnect: true (triggers automatic synchronization with REST after reconnection)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 20,
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, error: any) => {
        // Do not retry 4xx client errors (400, 401, 404, 409)
        if (error?.response?.status && error.response.status >= 400 && error.response.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0, // Never auto-retry mutations to prevent unintentional duplication
    },
  },
});
