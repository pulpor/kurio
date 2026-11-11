import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { CartItem, CartQuote } from '../types';
import { useState } from 'react';

export function useCart() {
  const queryClient = useQueryClient();
  const [activeCoupon, setActiveCoupon] = useState<string>('');

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: async (): Promise<{ items: CartItem[]; count: number }> => {
      const { data } = await api.get('/api/cart');
      return data;
    },
  });

  const quoteQuery = useQuery({
    queryKey: ['cart-quote', activeCoupon],
    queryFn: async (): Promise<CartQuote> => {
      const { data } = await api.post('/api/cart/quote', {
        couponCode: activeCoupon || undefined,
      });
      return data;
    },
    enabled: !!cartQuery.data,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ nftId, quantity = 1 }: { nftId: string; quantity?: number }) => {
      const { data } = await api.post('/api/cart/items', { nftId, quantity });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-quote'] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ nftId, quantity }: { nftId: string; quantity: number }) => {
      const { data } = await api.put(`/api/cart/items/${nftId}`, { quantity });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-quote'] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (nftId: string) => {
      const { data } = await api.delete(`/api/cart/items/${nftId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-quote'] });
    },
  });

  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      // test quote with this coupon
      const { data } = await api.post('/api/cart/quote', { couponCode: code });
      setActiveCoupon(code.toUpperCase());
      return data as CartQuote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-quote'] });
    },
  });

  const removeCoupon = () => {
    setActiveCoupon('');
    queryClient.invalidateQueries({ queryKey: ['cart-quote'] });
  };

  return {
    items: cartQuery.data?.items || [],
    count: cartQuery.data?.count || 0,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    quote: quoteQuery.data,
    isQuoteLoading: quoteQuery.isLoading,
    activeCoupon,
    addToCart: addToCartMutation.mutateAsync,
    isAddingToCart: addToCartMutation.isPending,
    updateQuantity: updateQuantityMutation.mutateAsync,
    isUpdatingQuantity: updateQuantityMutation.isPending,
    removeFromCart: removeFromCartMutation.mutateAsync,
    isRemovingFromCart: removeFromCartMutation.isPending,
    applyCoupon: applyCouponMutation.mutateAsync,
    isApplyingCoupon: applyCouponMutation.isPending,
    removeCoupon,
  };
}
