import React, { useState } from 'react';
import {
  Trash2,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  X,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { formatEthDisplay } from '../lib/eth';
import { Skeleton } from './ui/Skeleton';
import { INITIAL_NFTS } from '../mocks/db';
import { NFTCard } from './NFTCard';

interface CartPageProps {
  onGoToCheckout: () => void;
  onContinueShopping: () => void;
  onSelectNft: (id: string) => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function CartPage({
  onGoToCheckout,
  onContinueShopping,
  onSelectNft,
  onToast,
}: CartPageProps) {
  const {
    items,
    isLoading,
    quote,
    updateQuantity,
    removeFromCart,
    activeCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
      onToast({
        type: 'success',
        title: 'Cupom Aplicado!',
        description: 'Desconto calculado com sucesso.',
      });
    } catch (err: any) {
      onToast({
        type: 'error',
        title: 'Cupom Inválido',
        description: err?.response?.data?.error || 'Não foi possível validar este cupom.',
      });
    }
  };

  const moreRecommended = INITIAL_NFTS.slice(3, 8);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6 bg-[#0D0B08]">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="bg-[#0D0B08] text-[#FFF8F0] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Breadcrumb matching Figma Page 3 exact: Início / Mercado / Carrinho */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#A89A8A]">
          <button onClick={onContinueShopping} className="hover:text-[#FFF8F0]">Início</button>
          <span>/</span>
          <button onClick={onContinueShopping} className="hover:text-[#FFF8F0]">Mercado</button>
          <span>/</span>
          <span className="text-[#FFF8F0] font-semibold">Carrinho</span>
        </nav>

        {/* Real-time price change alert banner if Socket.IO changed price */}
        {quote?.priceChangesDetected && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-[#D98A48] flex items-center gap-3 text-xs text-[#FFF8F0]">
            <AlertTriangle className="w-5 h-5 text-[#D98A48] shrink-0" />
            <span>{quote.message || 'Houve uma alteração de preço em tempo real para itens do seu carrinho.'}</span>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-[#161310] border border-[#2C241D] rounded-2xl p-8">
            <ShoppingBag className="w-12 h-12 text-[#6E6255] mx-auto" />
            <h2 className="text-xl font-bold text-[#FFF8F0]">Seu carrinho está vazio</h2>
            <p className="text-xs text-[#A89A8A]">Explore coleções e adicione NFTs para continuar.</p>
            <button
              onClick={onContinueShopping}
              className="px-6 py-2.5 bg-[#D98A48] text-[#0D0B08] font-bold text-xs rounded-md uppercase tracking-wider"
            >
              Explorar Mercado
            </button>
          </div>
        ) : (
          /* Main 2-column: Cart Items Table on Left + Resumo da carteira on Right matching Figma Page 3 */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart Table */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Table Header matching Figma Page 3 exact */}
              <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-[#2C241D] text-xs font-bold text-[#A89A8A] uppercase tracking-wider">
                <span className="col-span-5">NFTs</span>
                <span className="col-span-2 text-center">Preço</span>
                <span className="col-span-2 text-center">Edições</span>
                <span className="col-span-2 text-right">Total</span>
                <span className="col-span-1"></span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-[#2C241D]">
                {items.map((item) => {
                  const lineTotal = (parseFloat(item.nft.priceEth) * item.quantity).toFixed(2);
                  return (
                    <div
                      key={item.nftId}
                      className="py-4 sm:py-5 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-start sm:items-center text-xs"
                    >
                      {/* NFT Info */}
                      <div className="col-span-5 flex items-center gap-3.5 min-w-0">
                        <img
                          src={item.nft.image}
                          alt={item.nft.title}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-xl object-cover bg-[#161310] border border-[#2C241D] shrink-0"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <h3
                            onClick={() => onSelectNft(item.nftId)}
                            className="font-bold text-[#FFF8F0] hover:text-[#D98A48] cursor-pointer truncate"
                          >
                            {item.nft.title}
                          </h3>
                          <p className="font-mono text-[11px] text-[#A89A8A]">
                            ID do token: #{item.nft.tokenId}
                          </p>
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="col-span-2 text-left sm:text-center font-mono text-[#FFF8F0] font-semibold">
                        <span className="sm:hidden text-[#A89A8A]">Preço: </span>
                        {item.nft.priceEth} ETH
                      </div>

                      {/* Edições / Stepper */}
                      <div className="col-span-2 flex items-center sm:justify-center">
                        <div className="flex items-center border border-[#2C241D] bg-[#161310] rounded-md overflow-hidden">
                          <button
                            disabled={item.quantity <= 1}
                            onClick={() => updateQuantity({ nftId: item.nftId, quantity: item.quantity - 1 })}
                            className="px-2.5 py-1 text-[#A89A8A] hover:text-[#FFF8F0] font-mono text-sm"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-1 font-mono text-xs font-bold text-[#FFF8F0] tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity({ nftId: item.nftId, quantity: item.quantity + 1 })}
                            className="px-2.5 py-1 text-[#A89A8A] hover:text-[#FFF8F0] font-mono text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="col-span-2 text-left sm:text-right font-mono font-bold text-[#D98A48] text-sm tabular-nums">
                        <span className="sm:hidden text-[#A89A8A] text-xs font-normal">Total: </span>
                        {lineTotal} ETH
                      </div>

                      {/* Trash action */}
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => removeFromCart(item.nftId)}
                          aria-label={`Remover ${item.nft.title}`}
                          className="p-1.5 text-[#6E6255] hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Right Column: Resumo da carteira matching Figma Page 3 exact */}
            <div className="lg:col-span-4">
              <div className="p-6 rounded-2xl bg-[#161310] border border-[#2C241D] space-y-5 text-left">
                <h2 className="text-base font-bold text-[#FFF8F0] tracking-tight">
                  Resumo da carteira
                </h2>

                {/* Código promocional matching Figma exact */}
                <div className="space-y-1.5">
                  <label className="text-xs text-[#A89A8A] font-medium block">
                    Código promocional
                  </label>
                  {activeCoupon ? (
                    <div className="flex items-center justify-between p-2 rounded-md bg-[#D98A48]/15 border border-[#D98A48] text-xs font-mono text-[#D98A48]">
                      <span>{activeCoupon} (Ativo)</span>
                      <button onClick={removeCoupon} className="hover:text-[#FFF8F0]">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Digite o código promocional..."
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 bg-[#0D0B08] border border-[#2C241D] rounded-md px-3 py-2 text-xs text-[#FFF8F0] placeholder-[#6E6255] outline-none focus:border-[#D98A48]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#D98A48] hover:bg-[#E59550] text-[#0D0B08] font-bold text-xs rounded-md transition-colors"
                      >
                        Aplicar
                      </button>
                    </form>
                  )}
                </div>

                {/* Financial breakdown matching Figma Page 3 exact */}
                <div className="pt-2 border-t border-[#2C241D] space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#A89A8A]">
                    <span>Subtotal</span>
                    <span className="font-mono text-[#FFF8F0] font-bold tabular-nums">
                      {formatEthDisplay(quote?.subtotalEth || '26.83')} ETH
                    </span>
                  </div>

                  <div className="flex justify-between text-[#A89A8A]">
                    <span>Desconto do lançamento</span>
                    <span className="font-mono text-[#A89A8A] tabular-nums">
                      {quote && parseFloat(quote.discountEth) > 0 ? `- ${quote.discountEth} ETH` : '(-) 00.00'}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#A89A8A]">
                    <div>
                      <span>Taxa de rede</span>
                      <span className="text-[10px] text-[#6E6255] block">Taxa estimada</span>
                    </div>
                    <span className="font-mono text-[#FFF8F0] font-bold tabular-nums">
                      {quote?.gasFeeEth || '0.016'} ETH
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#2C241D] flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[#FFF8F0]">Total</span>
                    <span className="font-mono font-extrabold text-lg text-[#D98A48] tabular-nums">
                      {quote?.totalEth || '26.846'} ETH
                    </span>
                  </div>
                </div>

                {/* Conectar e finalizar button matching Figma */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={onGoToCheckout}
                    className="w-full py-3 bg-[#D98A48] hover:bg-[#E59550] text-[#0D0B08] font-bold text-xs rounded-md transition-colors uppercase tracking-wider"
                  >
                    Conectar e finalizar
                  </button>

                  <button
                    onClick={onContinueShopping}
                    className="w-full text-center text-xs text-[#A89A8A] hover:text-[#FFF8F0] transition-colors"
                  >
                    Continuar explorando
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Section: Colecionadores também viram matching Figma Page 3 */}
        <section className="pt-10 border-t border-[#2C241D] space-y-6 text-left">
          <h2 className="text-lg font-bold text-[#FFF8F0] tracking-wide">
            Colecionadores também viram
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {moreRecommended.map((item) => (
              <NFTCard
                key={item.id}
                nft={item}
                onSelect={onSelectNft}
                onToast={onToast}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="w-2 h-2 rounded-full bg-[#D98A48]" />
            <span className="w-2 h-2 rounded-full bg-[#2C241D]" />
            <span className="w-2 h-2 rounded-full bg-[#2C241D]" />
          </div>
        </section>

      </div>
    </div>
  );
}
