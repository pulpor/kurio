import React, { useState } from 'react';
import { AlertTriangle, ChevronLeft, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { formatEthDisplay } from '../lib/eth';
import { Skeleton } from './ui/Skeleton';
import { useNFTs } from '../hooks/useNFTs';

interface CartPageProps {
  onGoToCheckout: () => void;
  onContinueShopping: () => void;
  onSelectNft: (id: string) => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

function Circle({ children, filled = true, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { filled?: boolean }) {
  return (
    <button
      {...rest}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full disabled:cursor-default max-md:h-6 max-md:w-6 ${
        filled ? 'bg-brand text-ink' : 'border border-brand text-brand'
      }`}
    >
      {children}
    </button>
  );
}

export function CartPage({ onGoToCheckout, onContinueShopping, onSelectNft, onToast }: CartPageProps) {
  const { items, isLoading, quote, updateQuantity, removeFromCart, activeCoupon, applyCoupon, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
      onToast({ type: 'success', title: 'Cupom aplicado', description: 'Desconto calculado com sucesso.' });
    } catch (err: any) {
      onToast({ type: 'error', title: 'Cupom inválido', description: err?.response?.data?.error || 'Não foi possível validar este cupom.' });
    }
  };

  const recommended = (useNFTs({ limit: 8 }).data?.items ?? []).slice(3, 8);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-6 px-6 py-12">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const subtotal = formatEthDisplay(quote?.subtotalEth || '0');
  const discount = quote && parseFloat(quote.discountEth) > 0 ? `- ${quote.discountEth}` : '(-) 00.00';
  const fee = quote?.gasFeeEth || '0.016';
  const total = quote?.totalEth || '0';

  const couponBox = (mobile: boolean) =>
    activeCoupon ? (
      <div className="flex h-10 items-center justify-between border border-brand px-3 text-[13px] text-brand max-md:h-[50px] max-md:rounded-full max-md:px-5">
        <span>{activeCoupon} (ativo)</span>
        <button onClick={removeCoupon} aria-label="Remover cupom">
          <X className="h-4 w-4" />
        </button>
      </div>
    ) : (
      <form
        onSubmit={handleApplyCoupon}
        className={mobile ? 'flex h-[50px] items-center rounded-full border border-brand/30 bg-[#1a100c] pl-5' : 'flex h-10'}
      >
        <input
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
          placeholder="Digite o código promocional..."
          aria-label="Código promocional"
          className={`min-w-0 flex-1 bg-transparent text-[12px] outline-none ${
            mobile ? 'text-[13px]' : 'border border-brand/50 px-2'
          }`}
        />
        <button
          type="submit"
          className={
            mobile
              ? 'bg-brand-grad h-[50px] w-[97px] rounded-full text-[15px] font-bold text-ink'
              : 'w-[102px] bg-brand text-[15px] font-bold text-ink'
          }
        >
          Aplicar
        </button>
      </form>
    );

  return (
    <>
      {/* ================= Desktop (Figma page 3) ================= */}
      <div className="mx-auto hidden max-w-[1200px] px-4 md:block xl:px-0">
        <nav aria-label="Breadcrumb" className="mt-[29px] flex h-6 items-center gap-[9px] text-[15px] font-bold">
          <button onClick={onContinueShopping}>Início</button>
          <span>/</span>
          <button onClick={onContinueShopping}>Mercado</button>
          <span>/</span>
          <span>Carrinho</span>
        </nav>

        {quote?.priceChangesDetected && (
          <div className="mt-4 flex items-center gap-3 border border-brand p-3 text-[13px]">
            <AlertTriangle className="h-5 w-5 shrink-0 text-brand" />
            <span>{quote.message || 'Houve uma alteração de preço em tempo real para itens do seu carrinho.'}</span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-8 space-y-4 bg-card p-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-sand" />
            <h2 className="text-[18px] font-bold">Seu carrinho está vazio</h2>
            <p className="text-[14px] text-sand">Explore coleções e adicione NFTs para continuar.</p>
            <button onClick={onContinueShopping} className="h-10 rounded-md bg-brand px-6 text-[14px] font-bold text-ink">
              Explorar mercado
            </button>
          </div>
        ) : (
          <div className="mt-[11px] flex gap-[86px]">
            <div className="w-[782px] shrink-0">
              <div className="relative h-[30px] border-b border-brand/40 text-[16px] font-bold">
                <span className="absolute left-0 top-0">NFTs</span>
                <span className="absolute left-[311px] top-0">Preço</span>
                <span className="absolute left-[450px] top-0">Edições</span>
                <span className="absolute left-[586px] top-0">Total</span>
              </div>
              <div className="mt-[13px] space-y-3">
                {items.map((item) => {
                  const lineTotal = (parseFloat(item.nft.priceEth) * item.quantity).toFixed(2);
                  return (
                    <div key={item.nftId} className="relative h-[70px] bg-card">
                      <img src={item.nft.image} alt={item.nft.title} className="absolute left-0 top-0 h-[70px] w-[70px] rounded-md object-cover" />
                      <div className="absolute left-[86px] top-[11px]">
                        <h3 onClick={() => onSelectNft(item.nftId)} className="cursor-pointer text-[16px] font-bold leading-6">
                          {item.nft.title}
                        </h3>
                        <p className="text-[14px] leading-5 text-sand">ID do token: #{item.nft.tokenId.replace(/^#/, '')}</p>
                      </div>
                      <span className="absolute left-[311px] top-[22px] text-[16px] font-bold leading-6 text-brand">{item.nft.priceEth} ETH</span>
                      <div className="absolute left-[449px] top-[22px] flex items-center gap-[10px]">
                        <Circle
                          aria-label="Diminuir"
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity({ nftId: item.nftId, quantity: item.quantity - 1 })}
                        >
                          <Minus className="h-3 w-3" />
                        </Circle>
                        <span className="w-[10px] text-center text-[17px] leading-6">{item.quantity}</span>
                        <Circle aria-label="Aumentar" onClick={() => updateQuantity({ nftId: item.nftId, quantity: item.quantity + 1 })}>
                          <Plus className="h-3 w-3" />
                        </Circle>
                      </div>
                      <span className="absolute left-[586px] top-[22px] text-[16px] font-bold leading-6 text-brand">{lineTotal} ETH</span>
                      <button
                        onClick={() => removeFromCart(item.nftId)}
                        aria-label={`Remover ${item.nft.title}`}
                        className="absolute left-[737px] top-[23px] text-brand"
                      >
                        <Trash2 className="h-5 w-5" strokeWidth={1.5} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="h-[30px] border-b border-brand/40 text-[18px] font-bold leading-6">Resumo da carteira</h2>
              <p className="mt-[20px] text-[14px] font-bold leading-6">Código promocional</p>
              <div className="mt-[3px]">{couponBox(false)}</div>

              <div className="mt-[22px] flex h-8 items-center justify-between text-[15px]">
                <span>Subtotal</span>
                <span className="text-[18px]">{subtotal} ETH</span>
              </div>
              <div className="flex h-8 items-center justify-between text-[15px]">
                <span>Desconto do lançamento</span>
                <span>{discount}</span>
              </div>
              <div className="flex h-8 items-center justify-between text-[15px]">
                <span>Taxa de rede</span>
                <span className="text-[18px]">{fee} ETH</span>
              </div>
              <p className="text-right text-[12px] leading-4 text-brand-hi">Taxa estimada</p>
              <div className="mt-[10px] flex h-8 items-center justify-between border-t border-brand/40 text-[16px] font-bold">
                <span>Total</span>
                <span className="text-[18px] text-brand">{total} ETH</span>
              </div>

              <button onClick={onGoToCheckout} className="mt-[18px] h-10 w-full rounded bg-brand text-[15px] font-bold text-ink">
                Conectar e finalizar
              </button>
              <button onClick={onContinueShopping} className="mt-[12px] block w-full text-center text-[15px] leading-6 text-brand">
                Continuar explorando
              </button>
            </div>
          </div>
        )}

        <h2 className="mt-[94px] text-[17px] font-bold leading-6 text-brand-hi">Colecionadores também viram</h2>
        <div className="mt-[8px] h-px bg-brand/40" />
        <div className="mt-[32px] grid grid-cols-5 gap-x-[26.5px]">
          {recommended.map((m) => (
            <button key={m.id} onClick={() => onSelectNft(m.id)} className="text-left">
              <div className="h-[255px] rounded-lg bg-card p-1 pt-5">
                <img src={m.image} alt={m.title} className="h-[211px] w-full rounded-2xl object-cover" />
              </div>
              <p className="mt-[7px] text-[15px] leading-[18px]">{m.title}</p>
              <p className="text-[16px] font-bold leading-5 text-brand">{m.priceEth} ETH</p>
            </button>
          ))}
        </div>
      </div>

      {/* ================= Mobile (Figma page 12) ================= */}
      <div className="min-h-screen md:hidden">
        <div className="relative flex h-[88px] items-center justify-center">
          <button
            onClick={onContinueShopping}
            aria-label="Voltar"
            className="absolute left-7 top-[30px] flex h-9 w-9 items-center justify-center rounded-full bg-band text-brand"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[20px] font-bold">Carrinho de NFTs</h1>
        </div>

        <div className="space-y-5 px-7">
          {items.map((item) => (
            <div key={item.nftId} className="relative flex h-[100px] overflow-hidden rounded-2xl bg-card">
              <img src={item.nft.image} alt={item.nft.title} className="h-[100px] w-[100px] shrink-0 object-cover" />
              <div className="min-w-0 flex-1 pl-[10px] pt-[10px]">
                <h3 onClick={() => onSelectNft(item.nftId)} className="truncate text-[15px] font-bold leading-6">
                  {item.nft.title}
                </h3>
                <p className="text-[14px] leading-5 text-sand">Edição: 1/{item.nft.edition.total}</p>
                <p className="mt-[6px] text-[18px] font-bold leading-6 text-brand">
                  {(parseFloat(item.nft.priceEth) * item.quantity).toFixed(2)} ETH
                </p>
              </div>
              <div className="absolute right-3 top-[38px] flex items-center gap-2">
                {item.quantity <= 1 ? (
                  <Circle filled={false} aria-label="Remover" onClick={() => removeFromCart(item.nftId)}>
                    <Trash2 className="h-3 w-3" />
                  </Circle>
                ) : (
                  <Circle aria-label="Diminuir" onClick={() => updateQuantity({ nftId: item.nftId, quantity: item.quantity - 1 })}>
                    <Minus className="h-3 w-3" />
                  </Circle>
                )}
                <span className="w-3 text-center text-[14px]">{item.quantity}</span>
                <Circle aria-label="Aumentar" onClick={() => updateQuantity({ nftId: item.nftId, quantity: item.quantity + 1 })}>
                  <Plus className="h-3 w-3" />
                </Circle>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="py-10 text-center text-[14px] text-sand">Seu carrinho está vazio.</p>}
        </div>

        <div className="mt-4 rounded-t-[32px] bg-[#1e130f] px-6 pb-8 pt-6">
          {couponBox(true)}
          <div className="mt-4 space-y-[10px] text-[16px]">
            <div className="flex justify-between"><span>Subtotal</span><span>{subtotal} ETH</span></div>
            <div className="flex justify-between"><span>Desconto do lançamento</span><span>{discount}</span></div>
            <div className="flex justify-between"><span>Taxa de rede</span><span>{fee} ETH</span></div>
            <p className="text-right text-[11px] text-brand-hi">Taxa estimada</p>
            <div className="flex items-center justify-between font-bold">
              <span>Total</span>
              <span className="text-[22px] text-brand">{total} ETH</span>
            </div>
          </div>
          <button
            onClick={onGoToCheckout}
            disabled={items.length === 0}
            className="bg-brand-grad mt-5 h-[60px] w-full rounded-[30px] text-[16px] font-bold text-ink disabled:opacity-50"
          >
            Conectar e finalizar
          </button>
        </div>
      </div>
    </>
  );
}
