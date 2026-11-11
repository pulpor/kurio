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
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useOrders } from '../hooks/useOrders';

interface ProfilePageProps {
  onNavigateToWallets: () => void;
  onGoToOrderReceipt: (orderId: string) => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function ProfilePage({
  onNavigateToWallets,
  onGoToOrderReceipt,
  onToast,
}: ProfilePageProps) {
  const { user, logout } = useAuth();
  const { updateProfile, isUpdating, changePassword, isChangingPassword } = useProfile();
  const { orders } = useOrders();

  // Active subtab in profile sidebar
  const [activeMenu, setActiveMenu] = useState<'dados' | 'carteiras' | 'atividade' | 'favoritos'>('dados');

  // Form fields matching Figma Page 8 exact
  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || 'Nova Sato');
  const [username, setUsername] = useState(user?.username || 'novasato');
  const [email, setEmail] = useState(user?.email || 'contato@email.com');
  const [ensName, setEnsName] = useState(user?.ensName || 'nova.kurio.eth');
  const [walletNickname, setWalletNickname] = useState('Principal Vault');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: displayName,
        username,
        email,
      });

      if (newPassword) {
        if (newPassword !== confirmNewPassword) {
          setPasswordError('A confirmação da nova senha não coincide.');
          return;
        }
        await changePassword({ currentPassword, newPassword });
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }

      onToast({
        type: 'success',
        title: 'Perfil Salvo!',
        description: 'Informações do colecionador atualizadas com sucesso.',
      });
    } catch (err: any) {
      onToast({
        type: 'error',
        title: 'Erro ao salvar',
        description: err?.response?.data?.error || 'Tente novamente.',
      });
    }
  };

  const menuItems = [
    { id: 'dados', label: 'Dados do perfil', icon: User },
    { id: 'carteiras', label: 'Carteiras', icon: Wallet, action: onNavigateToWallets },
    { id: 'atividade', label: 'Atividade', icon: Activity },
    { id: 'favoritos', label: 'Lista de interesse', icon: Heart },
    { id: 'ofertas', label: 'Ofertas', icon: Tag },
    { id: 'baixados', label: 'Arquivos baixados', icon: Download },
    { id: 'suporte', label: 'Suporte', icon: HelpCircle },
  ];

  return (
    <div className="bg-[#130C0A] text-[#FDF2DA] py-8 lg:py-12 min-h-[85vh] font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================== */}
          {/* LEFT SIDEBAR: Meu perfil matching Figma Page 8 exact       */}
          {/* ========================================================== */}
          <aside className="lg:col-span-3 space-y-4 bg-[#231611] border border-[#38210F] rounded-2xl p-5 text-xs text-left">
            <h2 className="text-sm font-bold font-mono text-[#FDF2DA] tracking-wide mb-3">
              Meu perfil
            </h2>

            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else {
                        setActiveMenu(item.id as any);
                      }
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors font-mono ${
                      isActive
                        ? 'text-[#D1894B] bg-[#D1894B]/10 font-bold'
                        : 'text-[#A8907E] hover:bg-[#38210F]/40 hover:text-[#FDF2DA]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="border-t border-[#38210F] my-2" />

              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/20 transition-colors font-mono"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sair</span>
              </button>
            </div>
          </aside>

          {/* ========================================================== */}
          {/* RIGHT CONTENT: Perfil do colecionador matching Figma       */}
          {/* ========================================================== */}
          <main className="lg:col-span-9 bg-[#231611] border border-[#38210F] rounded-2xl p-6 sm:p-8 space-y-8 text-left">
            
            <h1 className="text-base font-bold font-mono text-[#FDF2DA] tracking-wide">
              Perfil do colecionador
            </h1>

            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Senha atualizada com sucesso!
              </div>
            )}

            {passwordError && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                {passwordError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs font-mono">
              
              {/* Form Grid matching Figma Page 8 exact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
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
                    className="w-full bg-[#130C0A] border border-[#38210F] rounded-md px-3 py-2.5 text-xs text-[#FDF2DA] outline-none focus:border-[#D1894B]"
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
                    className="w-full bg-[#130C0A] border border-[#38210F] rounded-md px-3 py-2.5 text-xs text-[#FDF2DA] font-mono outline-none focus:border-[#D1894B]"
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
                    className="w-full bg-[#130C0A] border border-[#38210F] rounded-md px-3 py-2.5 text-xs text-[#FDF2DA] outline-none focus:border-[#D1894B]"
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
                      className="flex-1 bg-[#130C0A] border border-r-0 border-[#38210F] rounded-l-md px-3 py-2.5 text-xs text-[#FDF2DA] font-mono outline-none focus:border-[#D1894B]"
                    />
                    <span className="bg-[#38210F]/50 border border-[#38210F] rounded-r-md px-3 py-2.5 text-xs text-[#A8907E] font-mono">
                      .eth
                    </span>
                  </div>
                </div>

                {/* Apelido da carteira* */}
                <div className="space-y-1.5">
                  <label className="text-[#A8907E] font-medium block">
                    Apelido da carteira*
                  </label>
                  <input
                    type="text"
                    value={walletNickname}
                    onChange={(e) => setWalletNickname(e.target.value)}
                    className="w-full bg-[#130C0A] border border-[#38210F] rounded-md px-3 py-2.5 text-xs text-[#FDF2DA] outline-none focus:border-[#D1894B]"
                  />
                </div>

                {/* Avatar matching Figma: circle + Alterar & Remover */}
                <div className="space-y-1.5">
                  <label className="text-[#A8907E] font-medium block">
                    Avatar
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-[#D1894B]"
                    />
                    <button
                      type="button"
                      onClick={() => onToast({ type: 'info', title: 'Avatar', description: 'Seletor de foto aberto.' })}
                      className="px-3.5 py-1.5 bg-[#D1894B] hover:bg-[#E0985C] text-[#130C0A] font-bold font-mono text-xs rounded-md"
                    >
                      Alterar
                    </button>
                    <button
                      type="button"
                      onClick={() => onToast({ type: 'info', title: 'Avatar', description: 'Avatar restaurado para o padrão.' })}
                      className="px-3.5 py-1.5 border border-[#38210F] hover:bg-[#38210F]/40 text-[#A8907E] font-mono text-xs rounded-md"
                    >
                      Remover
                    </button>
                  </div>
                </div>

              </div>

              {/* Section: Alterar senha matching Figma Page 8 exact */}
              <div className="pt-6 border-t border-[#38210F] space-y-4">
                <h2 className="text-xs font-bold font-mono text-[#FDF2DA] uppercase tracking-wider">
                  Alterar senha
                </h2>

                <div className="space-y-3 max-w-md">
                  <div className="space-y-1">
                    <label className="text-[#A8907E] font-medium block">Senha atual</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#130C0A] border border-[#38210F] rounded-md px-3 py-2 text-xs text-[#FDF2DA] outline-none focus:border-[#D1894B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#A8907E] font-medium block">Nova senha</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#130C0A] border border-[#38210F] rounded-md px-3 py-2 text-xs text-[#FDF2DA] outline-none focus:border-[#D1894B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#A8907E] font-medium block">Confirmar nova senha</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full bg-[#130C0A] border border-[#38210F] rounded-md px-3 py-2 text-xs text-[#FDF2DA] outline-none focus:border-[#D1894B]"
                    />
                  </div>
                </div>
              </div>

              {/* Salvar Button matching Figma Page 8 */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating || isChangingPassword}
                  className="px-8 py-2.5 bg-[#D1894B] hover:bg-[#E0985C] text-[#130C0A] font-bold font-mono text-xs uppercase tracking-wider rounded-md transition-colors shadow-lg shadow-[#D1894B]/20"
                >
                  {isUpdating ? 'Salvando...' : 'Salvar'}
                </button>
              </div>

            </form>

            {/* Past orders list */}
            {orders.length > 0 && (
              <div className="pt-8 border-t border-[#38210F] space-y-4">
                <h3 className="text-xs font-bold font-mono text-[#FDF2DA] uppercase tracking-wider">
                  Histórico de Compras Confirmadas
                </h3>
                <div className="space-y-2">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => onGoToOrderReceipt(ord.id)}
                      className="p-3 rounded-lg bg-[#130C0A] border border-[#38210F] hover:border-[#D1894B] cursor-pointer flex items-center justify-between text-xs font-mono"
                    >
                      <span className="font-mono text-[#D1894B] font-bold">#{ord.id}</span>
                      <span className="text-[#A8907E]">{(ord.items || []).length} obra(s)</span>
                      <span className="font-mono font-bold text-[#FDF2DA]">{ord.totalEth} ETH</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}
