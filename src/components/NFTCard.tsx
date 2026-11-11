import React from 'react';
import { Heart } from 'lucide-react';
import { NFT } from '../types';
import { useToggleFavorite } from '../hooks/useNFTs';

interface NFTCardProps {
  nft: NFT;
  onSelect: (id: string) => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function NFTCard({ nft, onSelect, onToast }: NFTCardProps) {
  const toggleFavorite = useToggleFavorite();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite.mutateAsync(nft.id);
    } catch (err: any) {
      onToast({
        type: 'error',
        title: 'Favoritar',
        description: err?.response?.data?.error || 'Você precisa estar logado para favoritar.',
      });
    }
  };

  return (
    <article onClick={() => onSelect(nft.id)} className="cursor-pointer text-left">
      <div className="relative h-[200px] rounded-3xl bg-card p-[5px] md:h-[300px] md:rounded-lg md:p-1 md:pt-[31px]">
        <img
          src={nft.image}
          alt={nft.title}
          className="h-[164px] w-full rounded-2xl object-cover md:h-[250px]"
        />
        {nft.rarityBadge && (
          <span className="absolute left-[5px] top-[5px] bg-brand px-3 py-[3px] text-[12px] font-bold leading-4 text-ink md:left-1 md:top-[31px] md:text-[15px] md:leading-5">
            {nft.rarityBadge}
          </span>
        )}
        <button
          onClick={handleFavorite}
          aria-label={nft.isFavorited ? 'Remover dos favoritos' : 'Favoritar'}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-ink/60 text-brand md:hidden"
        >
          <Heart className="h-4 w-4" fill={nft.isFavorited ? 'currentColor' : 'none'} />
        </button>
      </div>
      <h3 className="mt-2 text-[14px] leading-5 md:mt-[10px] md:text-[16px] md:leading-6">{nft.title}</h3>
      <p className="text-[15px] font-bold leading-6 text-brand md:text-[18px] md:leading-7">
        {nft.priceEth} ETH
        {nft.originalPriceEth && (
          <span className="ml-3 font-normal text-sand line-through decoration-1">{nft.originalPriceEth}</span>
        )}
      </p>
    </article>
  );
}
