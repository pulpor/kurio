import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Wallet, BlockchainNetwork } from '../types';

export function useWallets() {
  const queryClient = useQueryClient();

  const walletsQuery = useQuery({
    queryKey: ['wallets'],
    queryFn: async (): Promise<Wallet[]> => {
      const { data } = await api.get('/api/wallets');
      return data.wallets || [];
    },
  });

  const createWalletMutation = useMutation({
    mutationFn: async (payload: {
      address: string;
      label: string;
      network: BlockchainNetwork;
      isPrimary?: boolean;
      isSecondary?: boolean;
    }) => {
      const { data } = await api.post('/api/wallets', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });

  const updateWalletMutation = useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      label?: string;
      network?: BlockchainNetwork;
      isPrimary?: boolean;
      isSecondary?: boolean;
    }) => {
      const { data } = await api.put(`/api/wallets/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });

  const deleteWalletMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/api/wallets/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });

  return {
    wallets: walletsQuery.data || [],
    isLoading: walletsQuery.isLoading,
    isError: walletsQuery.isError,
    createWallet: createWalletMutation.mutateAsync,
    isCreating: createWalletMutation.isPending,
    updateWallet: updateWalletMutation.mutateAsync,
    isUpdating: updateWalletMutation.isPending,
    deleteWallet: deleteWalletMutation.mutateAsync,
    isDeleting: deleteWalletMutation.isPending,
  };
}
