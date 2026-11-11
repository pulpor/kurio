import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '../lib/socket';
import { NFTUpdatedEvent, OrderUpdatedEvent } from '../types';

export interface PriceAlert {
  nftId: string;
  message: string;
  timestamp: number;
}

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [recentAlert, setRecentAlert] = useState<PriceAlert | null>(null);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      // Reconcile all active queries with REST upon reconnect
      queryClient.invalidateQueries();
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleNftUpdated = (event: NFTUpdatedEvent) => {
      // 1. Invalidate NFT detail and catalog lists
      queryClient.invalidateQueries({ queryKey: ['nft', event.nftId] });
      queryClient.invalidateQueries({ queryKey: ['nfts'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-quote'] });

      // Set user visible alert if this affects user's context
      setRecentAlert({
        nftId: event.nftId,
        message: `Cotação atualizada em tempo real: ${event.priceEth} ETH (${event.availableCount} restantes)`,
        timestamp: Date.now(),
      });
    };

    const handleOrderUpdated = (event: OrderUpdatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ['order', event.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    };

    socket.on('connect', handleConnect);
    socket.on('reconnect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('nft.updated', handleNftUpdated);
    socket.on('order.updated', handleOrderUpdated);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('reconnect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('nft.updated', handleNftUpdated);
      socket.off('order.updated', handleOrderUpdated);
    };
  }, [queryClient]);

  const dismissAlert = () => setRecentAlert(null);

  const simulateReconnect = () => {
    socket.disconnect();
    setTimeout(() => {
      socket.connect();
    }, 400);
  };

  return {
    isConnected,
    recentAlert,
    dismissAlert,
    simulateReconnect,
  };
}
