import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, Heart, Search, Star, AlertCircle, Linkedin, Mail, Twitter, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useNFTDetail, useToggleFavorite } from '../hooks/useNFTs';
import { useCart } from '../hooks/useCart';
import { Skeleton } from './ui/Skeleton';
import { useNFTs } from '../hooks/useNFTs';
import { NFT } from '../types';

interface NFTDetailPageProps {
  nftId: string;
  onBack: () => void;
  onGoToCheckout: () => void;
  onSelectNft: (id: string) => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

const EDITIONS = ['1/1', '1/10', '1/50', 'ABERTA'];

function RoundBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-brand text-ink disabled:opacity-50 md:h-[48px] disabled:opacity-100 max-md:h-5 max-md:w-5"
    >
      {children}
    </button>
  );
}

function MiniCard({ item, onSelect }: { item: NFT; onSelect: (id: string) => void }) {
  return (
    <button onClick={() => onSelect(item.id)} className="text-left">
      <div className="h-[255px] rounded-lg bg-card p-1 pt-5">
        <img src={item.image} alt={item.title} className="h-[211px] w-full rounded-2xl object-cover" />
      </div>
      <p className="mt-[7px] text-[15px] leading-[18px]">{item.title}</p>
      <p className="text-[16px] font-bold leading-5 text-brand">{item.priceEth} ETH</p>
    </button>
  );
}

export function NFTDetailPage({ nftId, onBack, onGoToCheckout, onSelectNft, onToast }: NFTDetailPageProps) {
  const { data: nft, isLoading, isError, error } = useNFTDetail(nftId);
  const allNfts = useNFTs({ limit: 8 }).data?.items ?? [];
  const toggleFavorite = useToggleFavorite();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedEdition, setSelectedEdition] = useState('1/50');
  const [activeTab, setActiveTab] = useState<'detalhes' | 'avaliacoes'>('detalhes');
  const [thumb, setThumb] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-6 px-6 py-10 md:px-4 xl:px-0">
        <Skeleton className="h-4 w-40" />
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !nft) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-brand" />
        <h2 className="text-2xl font-bold">Obra não encontrada</h2>
        <p className="text-[14px] text-sand">
          {(error as any)?.response?.data?.error || `O NFT "${nftId}" não foi localizado na Kurio.`}
        </p>
        <button onClick={onBack} className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-5 text-[14px] font-bold text-ink">
          <ArrowLeft className="h-4 w-4" /> Voltar ao mercado
        </button>
      </div>
    );
  }

  const reviews = nft.rating?.reviewsCount ?? 19;
  const score = nft.rating?.score ?? 4.8;
  const more = allNfts.filter((i) => i.id !== nft.id).slice(0, 5);
  const gallery = [nft.image, nft.image, nft.image, nft.image];

  const handleFavorite = async () => {
    try {
      await toggleFavorite.mutateAsync(nft.id);
    } catch (err: any) {
      onToast({ type: 'error', title: 'Favoritar', description: err?.response?.data?.error || 'Você precisa estar logado para favoritar.' });
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart({ nftId: nft.id, quantity });
      onGoToCheckout();
    } catch {
      onToast({ type: 'error', title: 'Erro', description: 'Não foi possível prosseguir com a compra.' });
    }
  };

  const handleAddOnly = async () => {
    try {
      await addToCart({ nftId: nft.id, quantity });
      onToast({ type: 'success', title: 'Adicionado ao carrinho', description: `${nft.title} foi adicionado.` });
    } catch {
      onToast({ type: 'error', title: 'Erro', description: 'Não foi possível adicionar ao carrinho.' });
    }
  };

  const pills = (
    <div className="flex items-center gap-2">
      {EDITIONS.map((ed) => (
        <button
          key={ed}
          onClick={() => setSelectedEdition(ed)}
          className={`h-[26px] rounded-full border px-[6px] text-[14px] max-md:px-[10px] max-md:text-[12px] ${
            selectedEdition === ed ? 'border-brand text-brand' : 'border-line text-sand'
          }`}
        >
          {ed}
        </button>
      ))}
    </div>
  );

  const metaLines = (
    <div className="text-[15px] leading-8 text-sand max-md:text-[14px]">
      <p>ID do token: #{nft.tokenId.replace(/^#/, '')}</p>
      <p>Coleção: {nft.collectionName || 'Kurio Apes'}</p>
      <p>Atributos: Óculos, Esmeralda, Raro</p>
    </div>
  );

  return (
    <>
      {/* ================= Desktop (Figma page 2) ================= */}
      <div className="mx-auto hidden max-w-[1200px] px-4 md:block xl:px-0">
        <nav aria-label="Breadcrumb" className="mt-[29px] flex h-6 items-center gap-[9px] text-[15px] font-bold">
          <button onClick={onBack}>Início</button>
          <span>/</span>
          <button onClick={onBack}>Mercado</button>
        </nav>

        <div className="mt-[8px] flex gap-[33px]">
          <div className="flex gap-[28px]">
            <div className="flex w-[100px] shrink-0 flex-col gap-4 pt-0">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setThumb(i)}
                  className={`h-[100px] w-[100px] overflow-hidden rounded-lg ${thumb === i ? 'border border-brand' : ''}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div
              onClick={() => setLightboxOpen(true)}
              className="relative mt-[2px] h-[444px] w-[444px] shrink-0 cursor-zoom-in rounded-lg bg-card p-5"
            >
              <img src={gallery[thumb]} alt={nft.title} className="h-[404px] w-[404px] rounded-3xl object-cover" />
              <button
                aria-label="Ampliar imagem"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink/60 text-cream"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="mt-[5px] text-[28px] font-bold leading-7">{nft.title}</h1>
            <div className="relative mt-[11px] h-8">
              <span className="text-[22px] font-bold leading-8 text-brand">{nft.priceEth} ETH</span>
              <div className="absolute right-0 top-[3px] flex items-center gap-2 text-[15px]">
                <div className="flex text-brand">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-[14px] w-[14px] ${i < 4 ? 'text-brand' : 'text-cream'}`} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <span>{reviews} avaliações de colecionadores</span>
              </div>
            </div>
            <div className="mr-[22px] mt-1 h-px bg-brand/40" />

            <h3 className="mt-[11px] text-[15px] font-bold leading-6">Sobre este NFT:</h3>
            <p className="text-[14px] leading-6 text-sand">{nft.description}</p>

            <h3 className="mt-3 text-[15px] font-bold leading-6">Edição:</h3>
            <div className="mt-1">{pills}</div>

            <div className="mt-[14px] flex h-10 items-center">
              <div className="flex items-center">
                <RoundBtn disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Diminuir">
                  <Minus className="h-4 w-4" />
                </RoundBtn>
                <span className="w-[36px] text-center text-[20px]">{quantity}</span>
                <RoundBtn onClick={() => setQuantity((q) => q + 1)} aria-label="Aumentar">
                  <Plus className="h-4 w-4" />
                </RoundBtn>
              </div>
              <div className="ml-auto flex gap-2">
                <button onClick={handleBuyNow} className="h-10 w-[130px] rounded-md bg-brand text-[14px] font-bold text-ink">
                  COMPRAR
                </button>
                <button
                  onClick={handleFavorite}
                  className="flex h-10 w-[130px] items-center justify-center gap-2 rounded-md border border-brand text-[14px] font-bold text-brand"
                >
                  <Heart className="h-4 w-4" fill={nft.isFavorited ? 'currentColor' : 'none'} />
                  Favoritar
                </button>
              </div>
            </div>

            <div className="mt-[17px]">{metaLines}</div>
            <div className="flex h-8 items-center gap-3 text-[15px] font-bold">
              Compartilhar este NFT:
              <button aria-label="LinkedIn" onClick={() => onToast({ type: 'info', title: 'Compartilhar', description: 'Link copiado!' })}>
                <Linkedin className="h-4 w-4" />
              </button>
              <button aria-label="E-mail" onClick={() => onToast({ type: 'info', title: 'Compartilhar', description: 'Link copiado!' })}>
                <Mail className="h-4 w-4" />
              </button>
              <button aria-label="Twitter" onClick={() => onToast({ type: 'info', title: 'Compartilhar', description: 'Link copiado!' })}>
                <Twitter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-[81px] flex h-[31px] gap-[38px] border-b border-brand/40 text-[17px]">
          {(
            [
              ['detalhes', 'Detalhes do NFT'],
              ['avaliacoes', `Avaliações de colecionadores (${reviews})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative h-full items-start leading-6 ${activeTab === id ? 'font-bold text-brand-hi' : ''}`}
            >
              {label}
              {activeTab === id && <span className="absolute -bottom-px inset-x-0 h-[2px] bg-brand" />}
            </button>
          ))}
        </div>

        {activeTab === 'detalhes' ? (
          <div className="mt-[11px] text-[14px] leading-6 text-sand">
            <p>
              {nft.title} é uma obra digital {selectedEdition === 'ABERTA' ? '' : `${selectedEdition} `}finalizada à mão da coleção Kurio
              Editions. Cada atributo fica armazenado nos metadados do token e verificado na Ethereum. A obra explora
              identidade, movimento e luz em um mundo digital sem fronteiras.
            </p>
            <p className="mt-6">
              A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro
              permanente de procedência registrada na rede. {nft.creator.name} recebe 5% de direitos autorais nas vendas
              secundárias, apoiando novos trabalhos e lançamentos da comunidade.
            </p>
            <p className="mt-3 font-bold text-cream">Rede:</p>
            <p>Cunhado na Ethereum com procedência imutável e metadados armazenados no IPFS.</p>
            <p className="mt-3 font-bold text-cream">Contrato:</p>
            <p>Direitos autorais do criador: 5% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.</p>
            <p className="mt-3 font-bold text-cream">Direitos autorais:</p>
            <p>{nft.contractAddress} • Contrato inteligente ERC-721 verificado.</p>
          </div>
        ) : (
          <div className="mt-[11px] bg-card p-4 text-[14px] leading-6 text-sand">
            <p className="font-bold text-cream">Elena Rostova</p>
            <p>Paleta de cores e acabamento impecáveis. Uma das peças centrais da minha coleção!</p>
          </div>
        )}

        <h2 className="mt-[93px] text-[17px] font-bold leading-6 text-brand-hi">Mais desta coleção</h2>
        <div className="mt-[8px] h-px bg-brand/40" />
        <div className="mt-[39px] grid grid-cols-5 gap-x-[26.5px]">
          {more.map((m) => (
            <MiniCard key={m.id} item={m} onSelect={onSelectNft} />
          ))}
        </div>
        <div className="mt-[29px] flex justify-center gap-[10px]" aria-hidden="true">
          <span className="h-3 w-3 rounded-full border border-brand" />
          <span className="h-3 w-3 rounded-full bg-brand" />
          <span className="h-3 w-3 rounded-full border border-brand" />
        </div>
      </div>

      {/* ================= Mobile (Figma page 11) ================= */}
      <div className="pb-[190px] md:hidden">
        <div className="relative px-[28px] pt-[66px]">
          <button
            onClick={onBack}
            aria-label="Voltar"
            className="absolute left-7 top-[22px] flex h-9 w-9 items-center justify-center rounded-full border border-brand/40 text-brand"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleFavorite}
            aria-label="Favoritar"
            className="absolute right-6 top-[22px] flex h-9 w-9 items-center justify-center rounded-full border border-brand/40 text-brand"
          >
            <Heart className="h-5 w-5" fill={nft.isFavorited ? 'currentColor' : 'none'} />
          </button>
          <img src={nft.image} alt={nft.title} className="h-[326px] w-full rounded-3xl object-cover" />
        </div>

        <div className="-mt-6 rounded-t-[32px] bg-card px-6 pb-6 pt-[28px]">
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-bold leading-7">{nft.title}</h1>
            <span className="flex h-[26px] items-center gap-1 rounded-full border border-brand/40 px-[10px] text-[13px]">
              <Star className="h-3 w-3 text-brand" fill="currentColor" />
              {score.toFixed(1)} ({reviews})
            </span>
          </div>
          <p className="mt-3 text-[14px] leading-6 text-sand">{nft.description}</p>
          <h3 className="mt-3 text-[14px] font-bold leading-6">Edição:</h3>
          <div className="mt-1">{pills}</div>
          <div className="mt-3">{metaLines}</div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 h-[163px] rounded-t-[32px] bg-card px-6 pt-[22px]">
          <div className="flex h-8 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[14px] font-bold text-sand">Qtd.</span>
              <RoundBtn disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Diminuir">
                <Minus className="h-3 w-3" />
              </RoundBtn>
              <span className="w-3 text-center text-[16px]">{quantity}</span>
              <RoundBtn onClick={() => setQuantity((q) => q + 1)} aria-label="Aumentar">
                <Plus className="h-3 w-3" />
              </RoundBtn>
            </div>
            <span className="text-[22px] font-bold text-brand">{nft.priceEth} ETH</span>
          </div>
          <div className="mt-[22px] flex items-center gap-3">
            <button onClick={handleBuyNow} className="bg-brand-grad h-[60px] flex-1 rounded-[30px] text-[16px] font-bold text-ink">
              Comprar NFT
            </button>
            <button
              onClick={handleAddOnly}
              aria-label="Adicionar ao carrinho"
              className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-line bg-band text-brand"
            >
              <ShoppingCart className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <div
          role="dialog"
          aria-label="Imagem ampliada"
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-ink/90 p-6"
        >
          <img src={nft.image} alt={nft.title} className="max-h-full max-w-full rounded-3xl object-contain" />
        </div>
      )}
    </>
  );
}
