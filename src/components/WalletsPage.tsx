import React, { useState } from 'react';
import {
  User,
  Wallet,
  Activity,
  Heart,
  Tag,
  Download,
  HelpCircle,
  LogOut,
  Plus,
  Trash2,
  CheckCircle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useWallets } from '../hooks/useWallets';
import { BlockchainNetwork } from '../types';

interface WalletsPageProps {
  onNavigateToProfile: () => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function WalletsPage({ onNavigateToProfile, onToast }: WalletsPageProps) {
  const { user, logout } = useAuth();
  const {
    wallets,
    createWallet,
    isCreating,
    updateWallet,
    deleteWallet,
  } = useWallets();

  // Primary wallet form state matching Page 9
  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || 'Nova Sato');
  const [walletNickname, setWalletNickname] = useState('Principal Vault');
  const [network, setNetwork] = useState<BlockchainNetwork>('Ethereum');
  const [profileName, setProfileName] = useState('Colecionador Alpha');
  const [address, setAddress] = useState(wallets[0]?.address || '0x71C84013233519890f6b3e7123984594A9fA1B90');
  const [ensSecondary, setEnsSecondary] = useState('');
  const [walletType, setWalletType] = useState('MetaMask');
  const [referralCode, setReferralCode] = useState('KURIO-VIP-2026');
  const [email, setEmail] = useState(user?.email || 'contato@email.com');
  const [ensName, setEnsName] = useState(user?.ensName?.replace('.eth', '') || 'nova.kurio');

  // Secondary wallet options matching Page 9
  const [sameAsPrimary, setSameAsPrimary] = useState(false);
  const [showSecondaryForm, setShowSecondaryForm] = useState(false);
  const [secondaryAddress, setSecondaryAddress] = useState('');
  const [secondaryLabel, setSecondaryLabel] = useState('Cold Storage Vault');

  const menuItems = [
    { id: 'dados', label: 'Dados do perfil', icon: User, action: onNavigateToProfile },
    { id: 'carteiras', label: 'Carteiras', icon: Wallet, active: true },
    { id: 'atividade', label: 'Atividade', icon: Activity },
    { id: 'favoritos', label: 'Lista de interesse', icon: Heart },
    { id: 'ofertas', label: 'Ofertas', icon: Tag },
    { id: 'baixados', label: 'Arquivos baixados', icon: Download },
    { id: 'suporte', label: 'Suporte', icon: HelpCircle },
  ];

  const handleSavePrimaryWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.startsWith('0x') || address.length < 10) {
      onToast({
        type: 'error',
        title: 'Endereço Inválido',
        description: 'O endereço deve começar com "0x" em formato hexadecimal.',
      });
      return;
    }

    try {
      // If we already have a primary wallet, update it or create new
      const primary = wallets.find((w) => w.isPrimary);
      if (primary) {
        await updateWallet({
          id: primary.id,
          label: walletNickname,
          network,
        });
      } else {
        await createWallet({
          address,
          label: walletNickname,
          network,
          isPrimary: true,
          isSecondary: false,
        });
      }

      onToast({
        type: 'success',
        title: 'Carteira Principal Salva',
        description: 'Configurações de custódia e recebimento atualizadas.',
      });
    } catch (err: any) {
      onToast({
        type: 'error',
        title: 'Erro ao salvar',
        description: err?.response?.data?.error || 'Tente novamente.',
      });
    }
  };

  const handleAddSecondary = async () => {
    if (sameAsPrimary) {
      onToast({
        type: 'info',
        title: 'Carteira Secundária',
        description: 'Configurada como espelho da carteira principal.',
      });
      return;
    }

    if (!secondaryAddress || !secondaryAddress.startsWith('0x')) {
      setShowSecondaryForm(true);
      return;
    }

    try {
      await createWallet({
        address: secondaryAddress,
        label: secondaryLabel,
        network: 'Ethereum',
        isPrimary: false,
        isSecondary: true,
      });

      onToast({
        type: 'success',
        title: 'Carteira Secundária Adicionada',
        description: `"${secondaryLabel}" foi vinculada com sucesso.`,
      });
      setShowSecondaryForm(false);
      setSecondaryAddress('');
    } catch (err: any) {
      onToast({
        type: 'error',
        title: 'Erro ao adicionar',
        description: err?.response?.data?.error || 'Tente novamente.',
      });
    }
  };

  const handleDeleteWallet = async (walletId: string, label: string) => {
    if (wallets.length <= 1) {
      onToast({
        type: 'error',
        title: 'Não permitido',
        description: 'Você precisa manter pelo menos uma carteira cadastrada.',
      });
      return;
    }
    try {
      await deleteWallet(walletId);
      onToast({
        type: 'info',
        title: 'Carteira Removida',
        description: `"${label}" foi desvinculada da sua conta.`,
      });
    } catch (err: any) {
      onToast({
        type: 'error',
        title: 'Erro ao remover',
        description: 'Não foi possível excluir a carteira.',
      });
    }
  };

  return (
    <div className="bg-[#0D0B08] text-[#FFF8F0] py-8 lg:py-12 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ========================================================== */}
          {/* LEFT SIDEBAR: Meu perfil matching Figma Page 9 exact       */}
          {/* ========================================================== */}
          <aside className="lg:col-span-3 space-y-4 bg-[#161310] border border-[#2C241D] rounded-2xl p-5 text-xs text-left">
            <h2 className="text-sm font-bold text-[#FFF8F0] tracking-wide mb-3">
              Meu perfil
            </h2>

            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.active;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.action) item.action();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'text-[#D98A48] bg-[#D98A48]/10 font-bold'
                        : 'text-[#A89A8A] hover:bg-[#1F1A15] hover:text-[#FFF8F0]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="border-t border-[#2C241D] my-2" />

              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/20 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sair</span>
              </button>
            </div>
          </aside>

          {/* ========================================================== */}
          {/* RIGHT CONTENT: Carteiras matching Figma Page 9 exact       */}
          {/* ========================================================== */}
          <main className="lg:col-span-9 space-y-8 text-left">
            
            {/* CARTEIRA PRINCIPAL CARD */}
            <div className="bg-[#161310] border border-[#2C241D] rounded-2xl p-6 sm:p-8 space-y-6">
              
              {/* Header with Title + "Adicionar" button on top right */}
              <div className="flex items-center justify-between pb-3 border-b border-[#2C241D]">
                <div>
                  <h1 className="text-base font-bold text-[#FFF8F0] tracking-wide">
                    Carteira principal
                  </h1>
                  <p className="text-xs text-[#A89A8A] mt-1">
                    Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSecondaryForm(true)}
                  className="px-3.5 py-1.5 bg-[#D98A48] hover:bg-[#E59550] text-[#0D0B08] font-bold text-xs rounded-md flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>

              {/* Form matching Page 9 2-column layout */}
              <form onSubmit={handleSavePrimaryWallet} className="space-y-5 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Nome de exibição* */}
                  <div className="space-y-1.5">
                    <label className="text-[#A89A8A] font-medium block">
                      Nome de exibição*
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#0D0B08] border border-[#2C241D] rounded-md px-3 py-2.5 text-xs text-[#FFF8F0] outline-none focus:border-[#D98A48]"
                    />
                  </div>

                  {/* Apelido da carteira* */}
                  <div className="space-y-1.5">
                    <label className="text-[#A89A8A] font-medium block">
                      Apelido da carteira*
                    </label>
                    <input
                      type="text"
                      required
                      value={walletNickname}
                      onChange={(e) => setWalletNickname(e.target.value)}
                      className="w-full bg-[#0D0B08] border border-[#2C241D] rounded-md px-3 py-2.5 text-xs text-[#FFF8F0] outline-none focus:border-[#D98A48]"
                    />
                  </div>

                  {/* Rede * */}
                  <div className="space-y-1.5">
                    <label className="text-[#A89A8A] font-medium block">
                      Rede *
                    </label>
                    <select
                      value={network}
                      onChange={(e) => setNetwork(e.target.value as BlockchainNetwork)}
                      className="w-full bg-[#0D0B08] border border-[#2C241D] rounded-md px-3 py-2.5 text-xs text-[#FFF8F0] outline-none focus:border-[#D98A48]"
                    >
                      <option value="Ethereum">Ethereum</option>
                      <option value="Polygon">Polygon</option>
                      <option value="Arbitrum">Arbitrum</option>
                      <option value="Optimism">Optimism</option>
                    </select>
                  </div>

                  {/* Nome do perfil* */}
                  <div className="space-y-1.5">
                    <label className="text-[#A89A8A] font-medium block">
                      Nome do perfil*
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-[#0D0B08] border border-[#2C241D] rounded-md px-3 py-2.5 text-xs text-[#FFF8F0] outline-none focus:border-[#D98A48]"
                    />
                  </div>

                  {/* Endereço da carteira* */}
                  <div className="space-y-1.5">
                    <label className="text-[#A89A8A] font-medium block">
                      Endereço da carteira*
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Endereço 0x da carteira"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#0D0B08] border border-[#2C241D] rounded-md px-3 py-2.5 text-xs text-[#FFF8F0] font-mono outline-none focus:border-[#D98A48]"
                    />
                  </div>

                  {/* ENS ou carteira secundária (opcional) */}
                  <div className="space-y-1.5">
                    <label className="text-[#A89A8A] font-medium block">
                      ENS ou carteira secundária (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="backup.eth ou 0x..."
                      value={ensSecondary}
                      onChange={(e) => setEnsSecondary(e.target.value)}
                      className="w-full bg-[#0D0B08] border border-[#2C241D] rounded-md px-3 py-2.5 text-xs text-[#FFF8F0] font-mono outline-none focus:border-[#D98A48]"
                    />
                  </div>

                  {/* Tipo de carteira* */}
                  <div className="space-y-1.5">
                    <label className="text-[#A89A8A] font-medium block">
                      Tipo de carteira*
                    </label>
                    <select
                      value={walletType}
                      onChange={(e) => setWalletType(e.target.value)}
                      className="w-full bg-[#0D0B08] border border-[#2C241D] rounded-md px-3 py-2.5 text-xs text-[#FFF8F0] outline-none focus:border-[#D98A48]"
                    >
                      <option value="MetaMask">MetaMask</option>
                      <option value="Coinbase Wallet">Coinbase Wallet</option>
                      <option value="WalletConnect">WalletConnect</option>
                      <option value="Phantom">Phantom</option>
                    </select>
                  </div>

                  {/* Código de indicação* */}
                  <div className="space-y-1.5">
                    <label className="text-[#A89A8A] font-medium block">
                      Código de indicação*
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="w-full bg-[#0D0B08] border border-[#2C241D] rounded-md px-3 py-2.5 text-xs text-[#FFF8F0] font-mono outline-none focus:border-[#D98A48]"
                    />
                  </div>

                  {/* E-mail* */}
                  <div className="space-y-1.5">
                    <label className="text-[#A89A8A] font-medium block">
                      E-mail*
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0D0B08] border border-[#2C241D] rounded-md px-3 py-2.5 text-xs text-[#FFF8F0] outline-none focus:border-[#D98A48]"
                    />
                  </div>

                  {/* Nome ENS * */}
                  <div className="space-y-1.5">
                    <label className="text-[#A89A8A] font-medium block">
                      Nome ENS *
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={ensName}
                        onChange={(e) => setEnsName(e.target.value)}
                        className="flex-1 bg-[#0D0B08] border border-r-0 border-[#2C241D] rounded-l-md px-3 py-2.5 text-xs text-[#FFF8F0] font-mono outline-none focus:border-[#D98A48]"
                      />
                      <span className="bg-[#1F1A15] border border-[#2C241D] rounded-r-md px-3 py-2.5 text-xs text-[#A89A8A] font-mono">
                        .eth
                      </span>
                    </div>
                  </div>

                </div>

                {/* Salvar carteira Button matching Figma Page 9 */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-6 py-2.5 bg-[#D98A48] hover:bg-[#E59550] text-[#0D0B08] font-bold text-xs uppercase tracking-wider rounded-md transition-colors shadow-lg shadow-[#D98A48]/20"
                  >
                    {isCreating ? 'Salvando...' : 'Salvar carteira'}
                  </button>
                </div>
              </form>

            </div>

            {/* CARTEIRA SECUNDÁRIA SECTION matching Figma Page 9 exact */}
            <div className="bg-[#161310] border border-[#2C241D] rounded-2xl p-6 sm:p-8 space-y-5">
              
              <h2 className="text-sm font-bold text-[#FFF8F0] tracking-wide">
                Carteira secundária
              </h2>

              <p className="text-xs text-[#A89A8A]">
                Você ainda não adicionou uma carteira secundária.
              </p>

              {/* Radio option matching Page 9: Igual à carteira principal */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#FFF8F0]">
                  <input
                    type="checkbox"
                    checked={sameAsPrimary}
                    onChange={(e) => setSameAsPrimary(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#D98A48] bg-[#0D0B08] border-[#2C241D]"
                  />
                  <span>Igual à carteira principal</span>
                </label>
              </div>

              {/* Collapsible secondary form if user chooses to add a distinct secondary wallet */}
              {showSecondaryForm && !sameAsPrimary && (
                <div className="p-4 rounded-xl bg-[#0D0B08] border border-[#2C241D] space-y-3 animate-in fade-in">
                  <h3 className="text-xs font-bold text-[#FFF8F0]">Cadastrar Nova Carteira Secundária</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[#A89A8A] block mb-1">Rótulo / Nome</label>
                      <input
                        type="text"
                        value={secondaryLabel}
                        onChange={(e) => setSecondaryLabel(e.target.value)}
                        className="w-full bg-[#161310] border border-[#2C241D] rounded px-3 py-2 text-[#FFF8F0]"
                      />
                    </div>
                    <div>
                      <label className="text-[#A89A8A] block mb-1">Endereço Público (0x...)</label>
                      <input
                        type="text"
                        placeholder="0x..."
                        value={secondaryAddress}
                        onChange={(e) => setSecondaryAddress(e.target.value)}
                        className="w-full bg-[#161310] border border-[#2C241D] rounded px-3 py-2 text-[#FFF8F0] font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Adicionar Button matching Page 9 */}
              <div>
                <button
                  type="button"
                  onClick={handleAddSecondary}
                  className="px-6 py-2 bg-[#D98A48] hover:bg-[#E59550] text-[#0D0B08] font-bold text-xs uppercase tracking-wider rounded-md transition-colors"
                >
                  Adicionar
                </button>
              </div>

            </div>

            {/* LIST OF CURRENT WALLETS */}
            <div className="bg-[#161310] border border-[#2C241D] rounded-2xl p-6 sm:p-8 space-y-4">
              <h2 className="text-xs font-bold text-[#FFF8F0] uppercase tracking-wider">
                Carteiras Vinculadas na Sessão ({wallets.length})
              </h2>

              <div className="space-y-3">
                {wallets.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl bg-[#0D0B08] border border-[#2C241D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#FFF8F0]">{w.label}</span>
                        {w.isPrimary && (
                          <span className="px-2 py-0.5 rounded bg-[#D98A48]/20 border border-[#D98A48]/40 text-[#D98A48] text-[10px] font-bold uppercase">
                            Principal
                          </span>
                        )}
                        {w.isSecondary && (
                          <span className="px-2 py-0.5 rounded bg-cyan-900/30 border border-cyan-700/50 text-cyan-300 text-[10px] font-bold uppercase">
                            Secundária
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[#A89A8A] text-[11px] truncate max-w-sm sm:max-w-md">
                        {w.address}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-[#A89A8A]">
                        <span>Rede: <strong className="text-[#FFF8F0]">{w.network}</strong></span>
                        <span>·</span>
                        <span>Saldo: <strong className="font-mono text-[#D98A48]">{w.balanceEth} ETH</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!w.isPrimary && (
                        <button
                          type="button"
                          onClick={() => updateWallet({ id: w.id, isPrimary: true })}
                          className="px-3 py-1 rounded border border-[#2C241D] hover:border-[#D98A48] text-[11px] text-[#A89A8A] hover:text-[#FFF8F0]"
                        >
                          Definir Principal
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteWallet(w.id, w.label)}
                        className="p-1.5 rounded text-[#A89A8A] hover:text-rose-400 hover:bg-rose-950/20"
                        title="Remover carteira"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </main>

        </div>
      </div>
    </div>
  );
}
