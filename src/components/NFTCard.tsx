import React, { useState } from 'react';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { NFT } from '../types';
import { useToggleFavorite } from '../hooks/useNFTs';
import { useCart } from '../hooks/useCart';

interface NFTCardProps {
  nft: NFT;
  onSelect: (id: string) => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function NFTCard({ nft, onSelect, onToast }: NFTCardProps) {
  const toggleFavorite = useToggleFavorite();
  const { addToCart, isAddingToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart({ nftId: nft.id, quantity: 1 });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
      onToast({
        type: 'success',
        title: 'Adicionado ao Carrinho',
        description: `${nft.title} foi adicionado com sucesso.`,
      });
    } catch (err: any) {
      onToast({
        type: 'error',
        title: 'Erro ao adicionar',
        description: err?.response?.data?.error || 'Não foi possível adicionar ao carrinho.',
      });
    }
  };

  return (
    <article
      onClick={() => onSelect(nft.id)}
      className="group relative flex flex-col bg-[#161310] border border-[#2C241D] rounded-2xl overflow-hidden hover:border-[#D98A48] hover:-translate-y-1 transition-all duration-200 cursor-pointer text-left"
    >
      {/* Visual Image Asset */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#0D0B08]">
        <img
          src={nft.image}
          alt={nft.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
        />

        {/* Optional RARO Badge from Figma Page 1 & 6 */}
        {nft.rarityBadge && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#D98A48] text-[#0D0B08] text-[10px] font-mono font-extrabold uppercase tracking-wider">
            {nft.rarityBadge}
          </span>
        )}

        {/* Favorite Icon */}
        <button
          onClick={handleFavoriteClick}
          aria-label={nft.isFavorited ? 'Remover dos favoritos' : 'Favoritar'}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-colors ${
            nft.isFavorited
              ? 'bg-[#D98A48]/30 text-[#D98A48]'
              : 'bg-[#0D0B08]/60 text-[#A89A8A] hover:text-[#FFF8F0]'
          }`}
        >
          <Heart className={`w-4 h-4 ${nft.isFavorited ? 'fill-[#D98A48]' : ''}`} />
        </button>
      </div>

      {/* Card Content matching Figma */}
      <div className="p-4 space-y-1.5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#FFF8F0] group-hover:text-[#D98A48] transition-colors truncate">
            {nft.title}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-sm text-[#D98A48] tabular-nums">
              {nft.priceEth} ETH
            </span>
            {nft.originalPriceEth && (
              <span className="font-mono text-xs text-[#6E6255] line-through tabular-nums">
                {nft.originalPriceEth}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            title="Adicionar ao carrinho"
            className="p-1.5 rounded-lg border border-[#3A2F24] bg-[#0D0B08] text-[#A89A8A] hover:text-[#FFF8F0] hover:border-[#D98A48] transition-colors"
          >
            {justAdded ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
