import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Lock,
} from 'lucide-react';
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

export function CheckoutPage({
  onBackToCart,
  onOrderSuccess,
  onGoToLogin,
  onToast,
}: CheckoutPageProps) {
  const { items, quote, activeCoupon } = useCart();
  const { user } = useAuth();
  const { wallets } = useWallets();
  const { createOrder, isCreatingOrder } = useOrders();

  // Form fields exactly matching Figma Page 4
  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || 'Nova Sato');
  const [username, setUsername] = useState(user?.username || 'novasato');
  const [network, setNetwork] = useState<BlockchainNetwork>('Ethereum');
  const [profileName, setProfileName] = useState(user?.profileName || 'Nova Sato Collector');
  const [walletAddress, setWalletAddress] = useState(
    wallets[0]?.address || '0xA91F4a82C981249817294819284102948201E82C'
  );
  const [secondaryEns, setSecondaryEns] = useState('');
  const [walletType, setWalletType] = useState('MetaMask');
  const [referralCode, setReferralCode] = useState('');
  const [email, setEmail] = useState(user?.email || 'contato@email.com');
  const [ensName, setEnsName] = useState(user?.ensName || 'nova.kurio.eth');
  const [useOtherWallet, setUseOtherWallet] = useState(false);
  const [observation, setObservation] = useState('');

  // Selected payment provider matching Figma Page 4
  const [selectedProvider, setSelectedProvider] = useState<'MetaMask' | 'Coinbase' | 'WalletConnect'>('MetaMask');
  const [simulateSignatureReject, setSimulateSignatureReject] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Persistent attempt idempotency key
  const [idempotencyKey] = useState<string>(
    () => `figma-order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  );

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (simulateSignatureReject) {
      setErrorBanner('Transação rejeitada na carteira simulada (User rejected signature - code 4001).');
      onToast({
        type: 'error',
        title: 'Assinatura Rejeitada',
        description: 'A transação foi recusada pela carteira.',
      });
      return;
    }

    try {
      const order = await createOrder({
        walletAddress,
        network,
        couponCode: activeCoupon || undefined,
        idempotencyKey,
      });

      onToast({
        type: 'success',
        title: 'Compra Confirmada!',
        description: 'Transação emitida na rede com sucesso.',
      });

      onOrderSuccess(order.id);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Falha ao processar pagamento.';
      setErrorBanner(msg);
      onToast({
        type: 'error',
        title: 'Erro na Compra',
        description: msg,
      });
    }
  };

  return (
    <div className="bg-[#130C0A] text-[#FDF2DA] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb matching Figma Page 4 exact: Início / Mercado / Pagamento */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#A8907E] font-mono">
          <button onClick={onBackToCart} className="hover:text-[#FDF2DA]">Início</button>
          <span>/</span>
          <button onClick={onBackToCart} className="hover:text-[#FDF2DA]">Mercado</button>
          <span>/</span>
          <span className="text-[#FDF2DA] font-semibold">Pagamento</span>
        </nav>

        {errorBanner && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-center gap-2.5 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        <form onSubmit={handleConfirmPurchase} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start text-left">
          
          {/* ========================================================== */}
          {/* LEFT COLUMN: Perfil do colecionador (Figma Page 4 exact)   */}
          {/* ========================================================== */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-base font-bold font-mono text-[#FDF2DA] tracking-wide">
              Perfil do colecionador
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              
              {/* Nome de exibição* */}
              <div className="space-y-1.5">
                <label className="text-[#A8907E] font-medium block">
                  Nome de exibição*
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#231611] border border-[#38210F] rounded-md px-3 py-2.5 text-xs text-[#FDF2DA] outline-none focus:border-[#D1894B]"
                />
              </div>

              {/* Nome de usuário* */}
              <div className="space-y-1.5">
                <label className="text-[#A8907E] font-medium block">
                  Nome de usuário*
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#231611] border border-[#38210F] rounded-md px-3 py-2.5 text-xs text-[#FDF2DA] font-mono outline-none focus:border-[#D1894B]"
                />
              </div>

              {/* Rede * */}
              <div className="space-y-1.5">
                <label className="text-[#A8907E] font-medium block">
                  Rede *
                </label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value as BlockchainNetwork)}
                  className="w-full bg-[#231611] border border-[#38210F] rounded-md px-3 py-2.5 text-xs text-[#FDF2DA] outline-none focus:border-[#D1894B]"
                >
                  <option value="Ethereum">Ethereum</option>
                  <option value="Polygon">Polygon</option>
                  <option value="Solana">Solana</option>
                  <option value="Arbitrum">Arbitrum</option>
                </select>
              </div>

              {/* Nome do perfil* */}
              <div className="space-y-1.5">
                <label className="text-[#A8907E] font-medium block">
                  Nome do perfil*
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-[#231611] border border-[#38210F] rounded-md px-3 py-2.5 text-xs text-[#FDF2DA] outline-none focus:border-[#D1894B]"
                />
              </div>

              {/* Endereço da carteira* */}
              <div className="space-y-1.5">
                <label className="text-[#A8907E] font-medium block">
                  Endereço da carteira*
                </label>
                <input
                  type="text"
                  required
                  placeholder="Endereço 0x da carteira"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full bg-[#231611] border border-[#38210F] rounded-md px-3 py-2.5 text-xs text-[#FDF2DA] font-mono outline-none focus:border-[#D1894B]"
                />
              </div>

              {/* ENS ou carteira secundária (opcional) */}
              <div className="space-y-1.5">
                <label className="text-[#A8907E] font-medium block">
                  ENS ou carteira secundária (opcional)
                </label>
                <input
                  type="text"
                  placeholder="secundaria.eth ou 0x..."
                  value={secondaryEns}
                  onChange={(e) => setSecondaryEns(e.target.value)}
                  className="w-full bg-[#231611] border border-[#38210F] rounded-md px-3 py-2.5 text-xs text-[#FDF2DA] font-mono outline-none focus:border-[#D1894B]"
                />
              </div>

              {/* Tipo de carteira* */}
              <div className="space-y-1.5">
                <label className="text-[#A8907E] font-medium block">
                  Tipo de carteira*
                </label>
                <select
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value)}
                  className="w-full bg-[#231611] border border-[#38210F] rounded-md px-3 py-2.5 text-xs text-[#FDF2DA] outline-none focus:border-[#D1894B]"
                >
                  <option value="MetaMask">MetaMask</option>
                  <option value="WalletConnect">WalletConnect</option>
                  <option value="Coinbase">Coinbase Wallet</option>
                  <option value="Ledger">Ledger Hardware</option>
                </select>
              </div>

              {/* Código de indicação* */}
              <div className="space-y-1.5">
                <label className="text-[#A8907E] font-medium block">
                  Código de indicação*
                </label>
                <input
                  type="text"
                  placeholder="KURIO-VIP-2026"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full bg-[#231611] border border-[#38210F] rounded-md px-3 py-2.5 text-xs text-[#FDF2DA] font-mono outline-none focus:border-[#D1894B]"
                />
              </div>

              {/* E-mail* */}
              <div className="space-y-1.5">
                <label className="text-[#A8907E] font-medium block">
                  E-mail*
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#231611] border border-[#38210F] rounded-md px-3 py-2.5 text-xs text-[#FDF2DA] outline-none focus:border-[#D1894B]"
                />
              </div>

              {/* Nome ENS * */}
              <div className="space-y-1.5">
                <label className="text-[#A8907E] font-medium block">
                  Nome ENS *
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={ensName.replace('.eth', '')}
                    onChange={(e) => setEnsName(e.target.value + '.eth')}
                    className="flex-1 bg-[#231611] border border-r-0 border-[#38210F] rounded-l-md px-3 py-2.5 text-xs text-[#FDF2DA] font-mono outline-none focus:border-[#D1894B]"
                  />
                  <span className="bg-[#38210F]/50 border border-[#38210F] rounded-r-md px-3 py-2.5 text-xs text-[#A8907E] font-mono">
                    .eth
                  </span>
                </div>
              </div>

            </div>

            {/* Checkbox: Usar outra carteira? */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#A8907E] font-mono">
                <input
                  type="checkbox"
                  checked={useOtherWallet}
                  onChange={(e) => setUseOtherWallet(e.target.checked)}
                  className="w-4 h-4 rounded text-[#D1894B] focus:ring-[#D1894B] bg-[#130C0A] border-[#38210F]"
                />
                <span>Usar outra carteira?</span>
              </label>
            </div>

            {/* Observação do colecionador (opcional) */}
            <div className="space-y-1.5 font-mono">
              <label className="text-xs text-[#A8907E] font-medium block">
                Observação do colecionador (opcional)
              </label>
              <textarea
                rows={2}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Instruções para liquidação ou custódia de NFT..."
                className="w-full bg-[#231611] border border-[#38210F] rounded-md p-3 text-xs text-[#FDF2DA] outline-none focus:border-[#D1894B]"
              />
            </div>

            {/* Simulation option */}
            <div className="pt-2 border-t border-[#38210F] flex items-center justify-between text-xs text-[#7A6352] font-mono">
              <span>Simular recusa na carteira (Code 4001):</span>
              <input
                type="checkbox"
                checked={simulateSignatureReject}
                onChange={(e) => setSimulateSignatureReject(e.target.checked)}
                className="w-4 h-4 accent-[#D1894B]"
              />
            </div>

          </div>

          {/* ========================================================== */}
          {/* RIGHT COLUMN: Seus NFTs & Pagamento (Figma Page 4 exact)   */}
          {/* ========================================================== */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#231611] border border-[#38210F] space-y-5 text-left">
              
              <div className="flex items-center justify-between border-b border-[#38210F] pb-3 text-xs font-bold font-mono text-[#A8907E] uppercase tracking-wider">
                <span>Seus NFTs</span>
                <span>Subtotal</span>
              </div>

              {/* Items List matching Figma Page 4 exact */}
              <div className="divide-y divide-[#38210F] max-h-56 overflow-y-auto pr-1 text-xs">
                {items.map((item) => {
                  const lineTotal = (parseFloat(item.nft.priceEth) * item.quantity).toFixed(2);
                  return (
                    <div key={item.nftId} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.nft.image}
                          alt={item.nft.title}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover bg-[#130C0A] border border-[#38210F] shrink-0"
                        />
                        <div className="min-w-0 font-mono">
                          <p className="font-bold text-[#FDF2DA] truncate">
                            {item.nft.title} <span className="text-[#A8907E] font-normal">(x {item.quantity})</span>
                          </p>
                          <p className="text-[10px] text-[#A8907E]">
                            ID do token: #{item.nft.tokenId}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#FDF2DA] tabular-nums shrink-0">
                        {lineTotal} ETH
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] font-mono text-[#D1894B] hover:underline cursor-pointer">
                Tem um código promocional? Aplique aqui
              </p>

              {/* Financials matching Figma exact */}
              <div className="pt-2 border-t border-[#38210F] space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[#A8907E]">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#FDF2DA] font-bold tabular-nums">
                    {formatEthDisplay(quote?.subtotalEth || '26.83')} ETH
                  </span>
                </div>

                <div className="flex justify-between text-[#A8907E]">
                  <span>Desconto do lançamento</span>
                  <span className="font-mono text-[#A8907E] tabular-nums">(-) 00.00</span>
                </div>

                <div className="flex justify-between text-[#A8907E]">
                  <div>
                    <span>Taxa de rede</span>
                    <span className="text-[10px] text-[#7A6352] block">Taxa estimada</span>
                  </div>
                  <span className="font-mono text-[#FDF2DA] font-bold tabular-nums">
                    {quote?.gasFeeEth || '0.016'} ETH
                  </span>
                </div>

                <div className="pt-3 border-t border-[#38210F] flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#FDF2DA]">Total</span>
                  <span className="font-mono font-extrabold text-lg text-[#D1894B] tabular-nums">
                    {quote?.totalEth || '26.846'} ETH
                  </span>
                </div>
              </div>

              {/* Carteira e rede matching Figma Page 4 */}
              <div className="pt-3 border-t border-[#38210F] space-y-2.5">
                <h3 className="text-xs font-bold font-mono text-[#FDF2DA] uppercase tracking-wider">
                  Carteira e rede
                </h3>

                <div className="space-y-2 text-xs font-mono">
                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#130C0A] border border-[#38210F] cursor-pointer">
                    <input
                      type="radio"
                      name="provider"
                      checked={selectedProvider === 'WalletConnect'}
                      onChange={() => setSelectedProvider('WalletConnect')}
                      className="text-[#D1894B] focus:ring-[#D1894B]"
                    />
                    <span className="font-mono text-[11px] text-[#A8907E]">
                      METAMASK • WALLETCONNECT • COINBASE
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#130C0A] border border-[#38210F] cursor-pointer">
                    <input
                      type="radio"
                      name="provider"
                      checked={selectedProvider === 'MetaMask'}
                      onChange={() => setSelectedProvider('MetaMask')}
                      className="text-[#D1894B] focus:ring-[#D1894B]"
                    />
                    <span className="font-semibold text-[#FDF2DA]">MetaMask</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#130C0A] border border-[#38210F] cursor-pointer">
                    <input
                      type="radio"
                      name="provider"
                      checked={selectedProvider === 'Coinbase'}
                      onChange={() => setSelectedProvider('Coinbase')}
                      className="text-[#D1894B] focus:ring-[#D1894B]"
                    />
                    <span className="font-semibold text-[#FDF2DA]">Coinbase Wallet</span>
                  </label>
                </div>
              </div>

              {/* Confirmar compra Button matching Figma Page 4 */}
              <button
                type="submit"
                disabled={isCreatingOrder}
                className="w-full py-3.5 bg-[#D1894B] hover:bg-[#E0985C] disabled:opacity-50 text-[#130C0A] font-bold font-mono text-xs rounded-md transition-colors uppercase tracking-wider shadow-lg shadow-[#D1894B]/20"
              >
                {isCreatingOrder ? 'Processando transação...' : 'Confirmar compra'}
              </button>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
