import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Search,
  Star,
  Share2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useNFTDetail, useToggleFavorite } from '../hooks/useNFTs';
import { useCart } from '../hooks/useCart';
import { Skeleton } from './ui/Skeleton';
import { INITIAL_NFTS } from '../mocks/db';
import { NFTCard } from './NFTCard';

interface NFTDetailPageProps {
  nftId: string;
  onBack: () => void;
  onGoToCheckout: () => void;
  onSelectNft: (id: string) => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function NFTDetailPage({
  nftId,
  onBack,
  onGoToCheckout,
  onSelectNft,
  onToast,
}: NFTDetailPageProps) {
  const { data: nft, isLoading, isError, error } = useNFTDetail(nftId);
  const toggleFavorite = useToggleFavorite();
  const { addToCart, isAddingToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedEdition, setSelectedEdition] = useState('1/50');
  const [activeTab, setActiveTab] = useState<'detalhes' | 'avaliacoes'>('detalhes');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0D0B08]">
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6">
            <Skeleton className="w-full aspect-square rounded-2xl" />
          </div>
          <div className="lg:col-span-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !nft) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4 bg-[#0D0B08]">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-[#FFF8F0] font-display">Obra Não Encontrada</h2>
        <p className="text-sm text-[#A89A8A]">
          {(error as any)?.response?.data?.error || `O NFT "${nftId}" não foi localizado na Kurio.`}
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-[#D98A48] hover:bg-[#E59550] text-[#0D0B08] font-bold rounded-md text-xs inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retornar ao Mercado
        </button>
      </div>
    );
  }

  const handleFavorite = async () => {
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

  const handleBuyNow = async () => {
    try {
      await addToCart({ nftId: nft.id, quantity });
      onGoToCheckout();
    } catch (err: any) {
      onToast({
        type: 'error',
        title: 'Erro',
        description: 'Não foi possível prosseguir com a compra.',
      });
    }
  };

  // Carousel "Mais desta coleção" matching Figma Page 2
  const moreFromCollection = INITIAL_NFTS.filter((item) => item.id !== nft.id).slice(0, 5);

  return (
    <div className="bg-[#0D0B08] text-[#FFF8F0] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Breadcrumb matching Figma Page 2 exact: Início / Mercado */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#A89A8A]">
          <button onClick={onBack} className="hover:text-[#FFF8F0] transition-colors">
            Início
          </button>
          <span>/</span>
          <button onClick={onBack} className="hover:text-[#FFF8F0] transition-colors">
            Mercado
          </button>
        </nav>

        {/* Main Product Split View (Left: Large Image, Right: Details) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left: Image with Zoom Icon */}
          <div className="lg:col-span-6 space-y-4">
            <div
              onClick={() => setLightboxOpen(true)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-[#161310] border border-[#2C241D] group cursor-zoom-in"
            >
              <img
                src={nft.image}
                alt={nft.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />

              {/* Magnifier / Search Icon on top right per Figma Page 2 */}
              <button
                aria-label="Ampliar imagem"
                className="absolute top-4 right-4 p-2.5 rounded-full bg-[#0D0B08]/70 backdrop-blur-md text-[#FFF8F0] border border-[#2C241D]"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Specifications, Edição, Stepper & Buttons */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFF8F0] tracking-tight">
                {nft.title}
              </h1>

              {/* Price & Rating matching Figma Page 2: 1.19 ETH ★★★★☆ 19 avaliações de colecionadores */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <span className="font-mono font-bold text-xl sm:text-2xl text-[#D98A48] tabular-nums">
                  {nft.priceEth} ETH
                </span>
                <span className="text-[#2C241D]">|</span>
                <div className="flex items-center gap-1.5 text-xs text-[#A89A8A]">
                  <div className="flex text-[#D98A48]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#D98A48]" />
                    ))}
                  </div>
                  <span>19 avaliações de colecionadores</span>
                </div>
              </div>
            </div>

            {/* Sobre este NFT */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-[#FFF8F0] uppercase tracking-wider">
                Sobre este NFT:
              </h3>
              <p className="text-xs sm:text-sm text-[#A89A8A] leading-relaxed">
                {nft.description}
              </p>
            </div>

            {/* Edição selection matching Figma Page 2 exact: 1/1, 1/10, 1/50, ABERTA */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#FFF8F0] uppercase tracking-wider">
                Edição:
              </h3>
              <div className="flex items-center gap-2">
                {['1/1', '1/10', '1/50', 'ABERTA'].map((ed) => {
                  const isSelected = selectedEdition === ed;
                  return (
                    <button
                      key={ed}
                      onClick={() => setSelectedEdition(ed)}
                      className={`px-3 py-1 text-xs font-mono rounded-full border transition-colors ${
                        isSelected
                          ? 'border-[#D98A48] text-[#D98A48] bg-[#D98A48]/10 font-bold'
                          : 'border-[#2C241D] text-[#A89A8A] hover:text-[#FFF8F0]'
                      }`}
                    >
                      {ed}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & Buttons Row matching Figma */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Stepper */}
              <div className="flex items-center border border-[#2C241D] bg-[#161310] rounded-md overflow-hidden">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-[#A89A8A] hover:text-[#FFF8F0] font-mono text-sm"
                >
                  -
                </button>
                <span className="px-3 py-2 font-mono text-xs font-bold text-[#FFF8F0] min-w-8 text-center tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-[#A89A8A] hover:text-[#FFF8F0] font-mono text-sm"
                >
                  +
                </button>
              </div>

              {/* COMPRAR Button (solid amber) */}
              <button
                onClick={handleBuyNow}
                className="px-8 py-2.5 bg-[#D98A48] hover:bg-[#E59550] text-[#0D0B08] font-bold text-xs uppercase tracking-wider rounded-md transition-colors shadow-lg shadow-[#D98A48]/20"
              >
                COMPRAR
              </button>

              {/* Favoritar Button (outline) */}
              <button
                onClick={handleFavorite}
                className="px-4 py-2.5 border border-[#2C241D] bg-[#161310] hover:border-[#D98A48] text-[#FFF8F0] text-xs font-semibold rounded-md inline-flex items-center gap-2 transition-colors"
              >
                <Heart className={`w-3.5 h-3.5 ${nft.isFavorited ? 'fill-[#D98A48] text-[#D98A48]' : ''}`} />
                Favoritar
              </button>
            </div>

            {/* Metadata list matching Figma Page 2 exact */}
            <div className="pt-4 border-t border-[#2C241D] space-y-2 text-xs text-[#A89A8A]">
              <p>
                <strong className="text-[#FFF8F0]">ID do token:</strong> #{nft.tokenId}
              </p>
              <p>
                <strong className="text-[#FFF8F0]">Coleção:</strong> Kurio Apes
              </p>
              <p>
                <strong className="text-[#FFF8F0]">Atributos:</strong> Óculos, Esmeralda, Raro
              </p>
              <div className="flex items-center gap-2 pt-1">
                <strong className="text-[#FFF8F0]">Compartilhar este NFT:</strong>
                <button
                  onClick={() => onToast({ type: 'info', title: 'Compartilhar', description: 'Link copiado!' })}
                  className="text-[#A89A8A] hover:text-[#FFF8F0]"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Lower Tabs: Detalhes do NFT | Avaliações de colecionadores (19) */}
        <div className="pt-10 border-t border-[#2C241D] space-y-6 text-left">
          <div className="flex items-center gap-8 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('detalhes')}
              className={`py-1 relative transition-colors ${
                activeTab === 'detalhes'
                  ? 'text-[#FFF8F0] after:absolute after:bottom-[-10px] after:left-0 after:right-0 after:h-0.5 after:bg-[#D98A48]'
                  : 'text-[#A89A8A] hover:text-[#FFF8F0]'
              }`}
            >
              Detalhes do NFT
            </button>
            <button
              onClick={() => setActiveTab('avaliacoes')}
              className={`py-1 relative transition-colors ${
                activeTab === 'avaliacoes'
                  ? 'text-[#FFF8F0] after:absolute after:bottom-[-10px] after:left-0 after:right-0 after:h-0.5 after:bg-[#D98A48]'
                  : 'text-[#A89A8A] hover:text-[#FFF8F0]'
              }`}
            >
              Avaliações de colecionadores (19)
            </button>
          </div>

          {activeTab === 'detalhes' ? (
            <div className="space-y-4 text-xs sm:text-sm text-[#A89A8A] leading-relaxed max-w-4xl">
              <p>
                Emerald Ape #042 é uma obra digital 1/50 finalizada à mão da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token e verificado na Ethereum. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.
              </p>
              <p>
                A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede. Nova Sato recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.
              </p>
              <div className="space-y-1.5 pt-2 text-xs">
                <p><strong className="text-[#FFF8F0]">Rede:</strong> Cunhado na Ethereum com procedência imutável e metadados armazenados no IPFS.</p>
                <p><strong className="text-[#FFF8F0]">Contrato:</strong> Direitos autorais do criador: 5% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.</p>
                <p><strong className="text-[#FFF8F0]">Direitos autorais:</strong> 0x7A42...19E8 • Contrato inteligente ERC-721 verificado.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-[#A89A8A]">
              <div className="p-4 rounded-xl bg-[#161310] border border-[#2C241D] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#FFF8F0]">Elena Rostova</span>
                  <span className="text-[#D98A48]">★★★★★</span>
                </div>
                <p>Paleta de cores e acabamento impecáveis. Uma das peças centrais da minha coleção!</p>
              </div>
            </div>
          )}
        </div>

        {/* Carousel "Mais desta coleção" matching Figma Page 2 exact */}
        <section className="pt-10 border-t border-[#2C241D] space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#FFF8F0] tracking-wide">
              Mais desta coleção
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {moreFromCollection.map((item) => (
              <NFTCard
                key={item.id}
                nft={item}
                onSelect={onSelectNft}
                onToast={onToast}
              />
            ))}
          </div>

          {/* Dots Indicator below */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="w-2 h-2 rounded-full bg-[#D98A48]" />
            <span className="w-2 h-2 rounded-full bg-[#2C241D]" />
            <span className="w-2 h-2 rounded-full bg-[#2C241D]" />
          </div>
        </section>

      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-[#0D0B08]/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={nft.image}
            alt={nft.title}
            referrerPolicy="no-referrer"
            className="max-h-[85vh] w-auto rounded-xl object-contain mx-auto shadow-2xl border border-[#2C241D]"
          />
        </div>
      )}
    </div>
  );
}
