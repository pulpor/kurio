import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Order, BlockchainNetwork } from '../types';

export function useOrders() {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: async (): Promise<Order[]> => {
      const { data } = await api.get('/api/orders');
      return data.orders || [];
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async ({
      walletAddress,
      network,
      couponCode,
      idempotencyKey,
    }: {
      walletAddress: string;
      network: BlockchainNetwork;
      couponCode?: string;
      idempotencyKey: string;
    }) => {
      const { data } = await api.post(
        '/api/orders',
        { walletAddress, network, couponCode },
        {
          headers: {
            'Idempotency-Key': idempotencyKey,
          },
        }
      );
      return data as Order;
    },
    onSuccess: (newOrder) => {
      queryClient.setQueryData(['order', newOrder.id], newOrder);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-quote'] });
      queryClient.invalidateQueries({ queryKey: ['nfts'] });
    },
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    createOrder: createOrderMutation.mutateAsync,
    isCreatingOrder: createOrderMutation.isPending,
  };
}

export function useOrderDetail(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async (): Promise<Order> => {
      const { data } = await api.get(`/api/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId,
  });
}
