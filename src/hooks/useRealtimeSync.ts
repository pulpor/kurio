import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket, isFreshEvent, clearSeenEvents } from '../lib/socket';
import { useAuth } from './useAuth';
import { NFTUpdatedEvent, OrderUpdatedEvent } from '../types';

export interface PriceAlert {
  nftId: string;
  message: string;
}

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [recentAlert, setRecentAlert] = useState<PriceAlert | null>(null);

  useEffect(() => {
    clearSeenEvents();
    const subscribe = () => socket.emit('subscribe', userId);
    const reconcile = () => {
      subscribe();
      queryClient.invalidateQueries();
    };

    const onNft = (e: NFTUpdatedEvent) => {
      if (!isFreshEvent(`nft:${e.nftId}`, e.version)) return;
      queryClient.invalidateQueries({ queryKey: ['nft', e.nftId] });
      queryClient.invalidateQueries({ queryKey: ['nfts'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-quote'] });
      setRecentAlert({
        nftId: e.nftId,
        message: `Cotação atualizada: ${e.priceEth} ETH (${e.availableCount} restantes)`,
      });
    };

    const onOrder = (e: OrderUpdatedEvent) => {
      if (!isFreshEvent(`order:${e.orderId}`, e.version)) return;
      queryClient.invalidateQueries({ queryKey: ['order', e.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    };

    socket.on('connect', reconcile);
    socket.on('nft.updated', onNft);
    socket.on('order.updated', onOrder);
    if (socket.connected) subscribe();
    else socket.connect();

    return () => {
      socket.off('connect', reconcile);
      socket.off('nft.updated', onNft);
      socket.off('order.updated', onOrder);
    };
  }, [queryClient, userId]);

  return { recentAlert, dismissAlert: () => setRecentAlert(null) };
}
