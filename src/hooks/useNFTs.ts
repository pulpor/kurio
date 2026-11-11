import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { NFT, Category, SaleStatus, SortOption } from '../types';

export interface NFTQueryParams {
  q?: string;
  category?: Category;
  status?: SaleStatus;
  minPrice?: string;
  maxPrice?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface NFTListResponse {
  items: NFT[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export function useNFTs(params: NFTQueryParams = {}) {
  const query = useQuery({
    queryKey: ['nfts', params],
    queryFn: async (): Promise<NFTListResponse> => {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.set('q', params.q);
      if (params.category && params.category !== 'all') searchParams.set('category', params.category);
      if (params.status && params.status !== 'all') searchParams.set('status', params.status);
      if (params.minPrice) searchParams.set('minPrice', params.minPrice);
      if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice);
      if (params.sort) searchParams.set('sort', params.sort);
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());

      const { data } = await api.get(`/api/nfts?${searchParams.toString()}`);
      if (!data || typeof data !== 'object' || !Array.isArray(data.items)) {
        return {
          items: [],
          total: 0,
          page: params.page || 1,
          totalPages: 1,
          limit: params.limit || 6,
        };
      }
      return data;
    },
    staleTime: 1000 * 30, // 30s
  });

  return query;
}

export function useNFTDetail(id: string) {
  const query = useQuery({
    queryKey: ['nft', id],
    queryFn: async (): Promise<NFT> => {
      const { data } = await api.get(`/api/nfts/${id}`);
      return data;
    },
    enabled: !!id,
    retry: (failureCount, error: any) => {
      // Don't retry 404
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  return query;
}

/**
 * Optimistic Favorite Mutation with Rollback on Failure
 * Satisfies the requirement: "Aplique atualização otimista em pelo menos uma interação, com rollback em caso de falha."
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nftId: string) => {
      const { data } = await api.post(`/api/favorites/${nftId}`);
      return data;
    },
    onMutate: async (nftId: string) => {
      // 1. Cancel ongoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['nft', nftId] });
      await queryClient.cancelQueries({ queryKey: ['nfts'] });
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      // 2. Snapshot the previous values
      const previousNft = queryClient.getQueryData<NFT>(['nft', nftId]);
      const previousFavorites = queryClient.getQueryData<string[]>(['favorites']) || [];

      // 3. Optimistically update single NFT detail cache
      if (previousNft) {
        queryClient.setQueryData<NFT>(['nft', nftId], {
          ...previousNft,
          isFavorited: !previousNft.isFavorited,
          likesCount: (previousNft.likesCount || 0) + (previousNft.isFavorited ? -1 : 1),
        });
      }

      // 4. Optimistically update NFT list caches
      queryClient.setQueriesData({ queryKey: ['nfts'] }, (oldData: any) => {
        if (!oldData || !oldData.items) return oldData;
        return {
          ...oldData,
          items: oldData.items.map((item: NFT) =>
            item.id === nftId
              ? {
                  ...item,
                  isFavorited: !item.isFavorited,
                  likesCount: (item.likesCount || 0) + (item.isFavorited ? -1 : 1),
                }
              : item
          ),
        };
      });

      return { previousNft, previousFavorites, nftId };
    },
    onError: (err, nftId, context) => {
      // ROLLBACK on error
      if (context?.previousNft) {
        queryClient.setQueryData(['nft', nftId], context.previousNft);
      }
      queryClient.invalidateQueries({ queryKey: ['nfts'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onSettled: (data, error, nftId) => {
      // Re-sync with server state
      queryClient.invalidateQueries({ queryKey: ['nft', nftId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
