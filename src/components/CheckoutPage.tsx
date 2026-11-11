import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronLeft, MoreVertical, Wallet as WalletIcon } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useWallets } from '../hooks/useWallets';
import { useOrders } from '../hooks/useOrders';
import { BlockchainNetwork } from '../types';
import { formatEthDisplay } from '../lib/eth';

interface CheckoutPageProps {
  onBackToCart: () => void;
  onOrderSuccess: (orderId: string) => void;
  onGoToLogin: () => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

type Provider = 'MetaMask' | 'Coinbase' | 'WalletConnect';

const inputCls =
  'h-10 w-full border border-line bg-transparent px-3 text-[14px] text-cream outline-none focus:border-brand';

function Field({ label, required, children }: { label?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="h-6 text-[15px] leading-6">
        {label}
        {required && <span className="ml-[1px] text-[22px] leading-none text-star">*</span>}
      </div>
      <div className="mt-[3px]">{children}</div>
    </div>
  );
}

function Select({ children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...rest} className={`${inputCls} cursor-pointer pr-9`}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-[11px] h-[18px] w-[18px] text-brand" />
    </div>
  );
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${
        checked ? 'border-brand' : 'border-brand/60'
      }`}
    >
      {checked && <span className="h-[10px] w-[10px] rounded-full bg-brand" />}
    </span>
  );
}

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export function CheckoutPage({ onBackToCart, onOrderSuccess, onToast }: CheckoutPageProps) {
  const { items, quote, activeCoupon } = useCart();
  const { user } = useAuth();
  const { wallets } = useWallets();
  const { createOrder, isCreatingOrder } = useOrders();

  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || 'Nova Sato');
  const [username, setUsername] = useState(user?.username || 'novasato');
  const [network, setNetwork] = useState<BlockchainNetwork>('Ethereum');
  const [profileName, setProfileName] = useState(user?.profileName || 'Nova Sato Collector');
  const [walletAddress, setWalletAddress] = useState(wallets[0]?.address || '0xA91F4a82C981249817294819284102948201E82C');
  const [secondaryEns, setSecondaryEns] = useState('');
  const [walletType, setWalletType] = useState('MetaMask');
  const [referralCode, setReferralCode] = useState('');
  const [email, setEmail] = useState(user?.email || 'contato@email.com');
  const [ensName, setEnsName] = useState(user?.ensName || 'nova.kurio.eth');
  const [useOtherWallet, setUseOtherWallet] = useState(false);
  const [observation, setObservation] = useState('');
  const [provider, setProvider] = useState<Provider>('Coinbase');
  const [simulateReject, setSimulateReject] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => `figma-order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrorBanner(null);

    if (simulateReject) {
      const msg = 'Transação rejeitada na carteira simulada (User rejected signature - code 4001).';
      setErrorBanner(msg);
      onToast({ type: 'error', title: 'Assinatura rejeitada', description: 'A transação foi recusada pela carteira.' });
      return;
    }

    try {
      const order = await createOrder({ walletAddress, network, couponCode: activeCoupon || undefined, idempotencyKey });
      onToast({ type: 'success', title: 'Compra confirmada', description: 'Transação emitida na rede com sucesso.' });
      onOrderSuccess(order.id);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Falha ao processar pagamento.';
      setErrorBanner(msg);
      onToast({ type: 'error', title: 'Erro na compra', description: msg });
    }
  };

  const subtotal = formatEthDisplay(quote?.subtotalEth || '0');
  const fee = quote?.gasFeeEth || '0.016';
  const total = quote?.totalEth || '0';
  const discount = quote && parseFloat(quote.discountEth) > 0 ? `- ${quote.discountEth}` : '(-) 00.00';

  const providerRows: { id: Provider; label: string; letter?: string }[] = [
    { id: 'WalletConnect', label: 'WalletConnect', letter: 'W' },
    { id: 'MetaMask', label: 'MetaMask', letter: 'M' },
    { id: 'Coinbase', label: 'Coinbase Wallet' },
  ];

  const banner = errorBanner && (
    <div className="mt-4 flex items-center gap-2 border border-brand p-3 text-[13px]">
      <AlertCircle className="h-4 w-4 shrink-0 text-brand" />
      <span>{errorBanner}</span>
    </div>
  );

  return (
    <>
      {/* ================= Desktop (Figma page 4) ================= */}
      <div className="mx-auto hidden max-w-[1200px] px-4 md:block xl:px-0">
        <nav aria-label="Breadcrumb" className="mt-[29px] flex h-6 items-center gap-[9px] text-[15px] font-bold">
          <button onClick={onBackToCart}>Início</button>
          <span>/</span>
          <button onClick={onBackToCart}>Mercado</button>
          <span>/</span>
          <span>Pagamento</span>
        </nav>
        {banner}

        <form onSubmit={submit} className="mt-[16px] flex gap-[32px]">
          <div className="w-[763px] shrink-0">
            <h2 className="h-6 text-[17px] font-bold leading-6">Perfil do colecionador</h2>

            <div className="mt-[10px] grid grid-cols-2 gap-x-[23px] gap-y-[9px]">
              <Field label="Nome de exibição" required>
                <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Nome de usuário" required>
                <input required value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} />
              </Field>

              <Field label="Rede" required>
                <Select value={network} onChange={(e) => setNetwork(e.target.value as BlockchainNetwork)} aria-label="Rede">
                  <option value="Ethereum" className="bg-card">Ethereum</option>
                  <option value="Polygon" className="bg-card">Polygon</option>
                  <option value="Solana" className="bg-card">Solana</option>
                  <option value="Arbitrum" className="bg-card">Arbitrum</option>
                </Select>
              </Field>
              <Field label="Nome do perfil" required>
                <input required value={profileName} onChange={(e) => setProfileName(e.target.value)} className={inputCls} />
              </Field>

              <Field label="Endereço da carteira" required>
                <input
                  required
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Endereço 0x da carteira"
                  className={`${inputCls} pl-[22px]`}
                />
              </Field>
              <Field>
                <input
                  value={secondaryEns}
                  onChange={(e) => setSecondaryEns(e.target.value)}
                  placeholder="ENS ou carteira secundária (opcional)"
                  aria-label="ENS ou carteira secundária (opcional)"
                  className={`${inputCls} pl-[22px]`}
                />
              </Field>

              <Field label="Tipo de carteira" required>
                <Select value={walletType} onChange={(e) => setWalletType(e.target.value)} aria-label="Tipo de carteira">
                  <option value="MetaMask" className="bg-card">MetaMask</option>
                  <option value="WalletConnect" className="bg-card">WalletConnect</option>
                  <option value="Coinbase" className="bg-card">Coinbase Wallet</option>
                  <option value="Ledger" className="bg-card">Ledger</option>
                </Select>
              </Field>
              <Field label="Código de indicação" required>
                <input value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className={inputCls} />
              </Field>

              <Field label="E-mail" required>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Nome ENS" required>
                <div className="flex">
                  <div className="relative w-[78px] shrink-0">
                    <div className={`${inputCls} flex items-center`}>.eth</div>
                    <ChevronDown className="pointer-events-none absolute right-2 top-[11px] h-[18px] w-[18px] text-brand" />
                  </div>
                  <input
                    value={ensName.replace('.eth', '')}
                    onChange={(e) => setEnsName(e.target.value + '.eth')}
                    aria-label="Nome ENS"
                    className={`${inputCls} border-l-0`}
                  />
                </div>
              </Field>
            </div>

            <label className="mt-[28px] flex h-6 cursor-pointer items-center gap-[7px] text-[15px]">
              <input type="checkbox" checked={useOtherWallet} onChange={(e) => setUseOtherWallet(e.target.checked)} className="sr-only" />
              <Radio checked={useOtherWallet} />
              Usar outra carteira?
            </label>

            <p className="mt-[19px] text-[15px] leading-6">Observação do colecionador (opcional)</p>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              aria-label="Observação do colecionador"
              className="mt-[2px] h-[232px] w-[350px] resize-none border border-line bg-transparent p-3 text-[14px] outline-none focus:border-brand"
            />
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-[12px] text-sand">
              <input type="checkbox" checked={simulateReject} onChange={(e) => setSimulateReject(e.target.checked)} className="accent-[#d28a4c]" />
              Simular recusa na carteira (código 4001)
            </label>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="h-6 text-[17px] font-bold leading-6">Seus NFTs</h2>
            <div className="mt-[3px] flex h-[30px] items-center justify-between border-b border-brand/40 text-[16px] font-bold">
              <span>NFTs</span>
              <span>Subtotal</span>
            </div>
            <div className="mt-[10px] space-y-4">
              {items.map((item) => (
                <div key={item.nftId} className="relative h-[66px] bg-card">
                  <img src={item.nft.image} alt={item.nft.title} className="absolute left-0 top-0 h-[66px] w-[70px] rounded-md object-cover" />
                  <div className="absolute left-[82px] top-[10px]">
                    <p className="text-[16px] font-bold leading-6">{item.nft.title}</p>
                    <p className="text-[14px] leading-5 text-sand">ID do token: #{item.nft.tokenId.replace(/^#/, '')}</p>
                  </div>
                  <span className="absolute left-[245px] top-[18px] text-[14px] text-sand">(x {item.quantity})</span>
                  <span className="absolute right-[11px] top-[16px] text-[18px] font-bold leading-6 text-brand">
                    {(parseFloat(item.nft.priceEth) * item.quantity).toFixed(2)} ETH
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-[19px] text-center text-[14px] leading-6">
              Tem um código promocional? <button type="button" onClick={onBackToCart} className="text-brand-hi">Aplique aqui</button>
            </p>
            <div className="mt-[11px] flex h-8 items-center justify-between text-[15px]">
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
            <p className="text-center text-[12px] leading-4 text-brand-hi">Taxa estimada</p>
            <div className="mt-[8px] border-t border-brand/40" />
            <div className="mx-[42px] mt-[8px] flex h-8 items-center justify-between text-[16px] font-bold">
              <span>Total</span>
              <span className="text-[18px] text-brand">{total} ETH</span>
            </div>

            <h3 className="mt-[14px] text-center text-[17px] font-bold leading-6">Carteira e rede</h3>
            <div className="mt-[10px] space-y-[15px]">
              {providerRows.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={`flex h-[46px] w-full items-center gap-[12px] border px-[14px] text-left ${
                    provider === p.id ? 'border-cream/60' : 'border-line'
                  }`}
                >
                  <Radio checked={provider === p.id} />
                  {i === 0 && <span className="text-[9px] font-bold text-brand-hi">METAMASK • WALLETCONNECT • COINBASE</span>}
                  {i === 1 && <span className="text-[15px]">MetaMask</span>}
                  {i === 2 && (
                    <>
                      <WalletIcon className="h-5 w-5 text-brand" />
                      <span className="text-[15px]">Coinbase Wallet</span>
                    </>
                  )}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isCreatingOrder || items.length === 0}
              className="mt-[24px] h-[44px] w-full rounded-md bg-brand text-[15px] font-bold text-ink disabled:opacity-60"
            >
              {isCreatingOrder ? 'Processando...' : 'Confirmar compra'}
            </button>
          </div>
        </form>
      </div>

      {/* ================= Mobile (Figma page 13) ================= */}
      <div className="min-h-screen px-7 pb-10 md:hidden">
        <div className="relative flex h-[88px] items-center justify-center">
          <button
            onClick={onBackToCart}
            aria-label="Voltar"
            className="absolute left-0 top-[30px] flex h-9 w-9 items-center justify-center rounded-full bg-band text-brand"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[20px] font-bold">Pagamento com carteira</h1>
        </div>
        {banner}

        <div className="mt-2 flex items-center justify-between">
          <h2 className="text-[16px] font-bold">Carteira conectada</h2>
          <button className="text-[14px] font-bold text-brand">Trocar carteira</button>
        </div>
        <div className="mt-3 space-y-[19px]">
          {wallets.map((w) => {
            const selected = walletAddress.toLowerCase() === w.address.toLowerCase();
            return (
              <button
                key={w.id}
                onClick={() => {
                  setWalletAddress(w.address);
                  setNetwork(w.network);
                }}
                className="relative flex h-[94px] w-full items-start gap-3 rounded-2xl bg-card px-[27px] pt-[14px] text-left"
              >
                <span className="mt-1"><Radio checked={selected} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-bold leading-6">{w.label}</span>
                  <span className="block text-[14px] leading-5 text-sand">
                    {w.isSecondary && user?.ensName ? user.ensName : short(w.address)}
                  </span>
                  <span className="block text-[14px] leading-5 text-sand">
                    {w.isPrimary ? `Rede principal ${w.network}` : `Rede ${w.network}`}
                  </span>
                </span>
                <MoreVertical className="absolute right-[18px] top-[34px] h-5 w-5 text-brand" />
              </button>
            );
          })}
        </div>

        <h2 className="mt-6 text-[16px] font-bold">Carteira e rede</h2>
        <div className="mt-3 space-y-[17px]">
          {providerRows.map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className="flex h-16 w-full items-center gap-4 rounded-2xl bg-card px-[22px] text-left"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-band text-[12px] font-bold text-brand">
                {p.letter ?? <WalletIcon className="h-5 w-5" />}
              </span>
              <span className="flex-1 text-[15px]">{p.label}</span>
              <Radio checked={provider === p.id} />
            </button>
          ))}
        </div>

        <p className="mt-5 text-right text-[15px]">
          <span className="font-bold text-sand">Total:</span>{' '}
          <span className="text-[18px] font-bold text-brand">{total} ETH</span>
        </p>
        <button
          onClick={() => submit()}
          disabled={isCreatingOrder || items.length === 0}
          className="bg-brand-grad mt-6 h-[60px] w-full rounded-[30px] text-[16px] font-bold text-ink disabled:opacity-60"
        >
          {isCreatingOrder ? 'Processando...' : 'Confirmar compra'}
        </button>
      </div>
    </>
  );
}
