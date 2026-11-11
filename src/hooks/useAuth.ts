import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { User } from '../types';

export function useAuth() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ['session'],
    queryFn: async (): Promise<User | null> => {
      try {
        const { data } = await api.get('/api/auth/session');
        return data.user || null;
      } catch (err) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data } = await api.post('/api/auth/login', { email, password });
      if (data.token) {
        localStorage.setItem('aetheria_auth_token', data.token);
      }
      return data.user as User;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['session'], user);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: { name: string; username: string; email: string; password: string }) => {
      const { data } = await api.post('/api/auth/register', payload);
      if (data.token) {
        localStorage.setItem('aetheria_auth_token', data.token);
      }
      return data.user as User;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['session'], user);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/api/auth/logout');
      localStorage.removeItem('aetheria_auth_token');
    },
    onSuccess: () => {
      queryClient.setQueryData(['session'], null);
      queryClient.removeQueries({ queryKey: ['favorites'] });
      queryClient.removeQueries({ queryKey: ['wallets'] });
      queryClient.removeQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const switchUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.post('/api/auth/switch-user', { userId });
      return data.user as User;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['session'], user);
      queryClient.invalidateQueries();
    },
  });

  return {
    user: sessionQuery.data ?? null,
    isLoading: sessionQuery.isLoading,
    isAuthenticated: !!sessionQuery.data,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    switchUser: switchUserMutation.mutateAsync,
  };
}
