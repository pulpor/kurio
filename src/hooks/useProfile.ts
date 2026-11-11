import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { User } from '../types';

export function useProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<User> => {
      const { data } = await api.get('/api/profile');
      return data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: Partial<User>) => {
      const { data } = await api.put('/api/profile', payload);
      return data as User;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      queryClient.setQueryData(['session'], updated);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const { data } = await api.post('/api/profile/change-password', payload);
      return data;
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
  };
}
