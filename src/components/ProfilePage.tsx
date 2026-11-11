import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useOrders } from '../hooks/useOrders';
import { AccountSidebar, AccountMenu, AField, accInput, EnsField } from './AccountUI';

interface ProfilePageProps {
  onNavigateToWallets: () => void;
  onGoToOrderReceipt: (orderId: string) => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

function PasswordInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={`${accInput} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        className="absolute right-3 top-[10px] text-brand"
      >
        {show ? <Eye className="h-5 w-5" strokeWidth={1.5} /> : <EyeOff className="h-5 w-5" strokeWidth={1.5} />}
      </button>
    </div>
  );
}

export function ProfilePage({ onNavigateToWallets, onGoToOrderReceipt, onToast }: ProfilePageProps) {
  const { user, logout } = useAuth();
  const { updateProfile, isUpdating, changePassword, isChangingPassword } = useProfile();
  const { orders } = useOrders();

  const [activeMenu, setActiveMenu] = useState<AccountMenu>('dados');
  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || 'Nova Sato');
  const [username, setUsername] = useState(user?.username || 'novasato');
  const [email, setEmail] = useState(user?.email || 'contato@email.com');
  const [ensName, setEnsName] = useState(user?.ensName || 'nova.kurio.eth');
  const [walletNickname, setWalletNickname] = useState('Principal Vault');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      await updateProfile({ name: displayName, username, email });

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

      onToast({ type: 'success', title: 'Perfil salvo', description: 'Informações do colecionador atualizadas com sucesso.' });
    } catch (err: any) {
      onToast({ type: 'error', title: 'Erro ao salvar', description: err?.response?.data?.error || 'Tente novamente.' });
    }
  };

  const select = (id: AccountMenu) => {
    if (id === 'carteiras') onNavigateToWallets();
    else setActiveMenu(id);
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-6 md:flex md:items-start md:gap-[28px] md:px-4 md:pb-24 md:pt-[33px] xl:px-0">
      <AccountSidebar active={activeMenu} onSelect={select} onLogout={() => logout()} />

      <main className="mt-6 min-w-0 flex-1 md:-mt-[3px]">
        <h1 className="text-[16px] font-bold leading-6">Perfil do colecionador</h1>

        {passwordSuccess && (
          <div className="mt-3 flex items-center gap-2 border border-brand p-2 text-[13px]">
            <CheckCircle className="h-4 w-4 text-brand" /> Senha atualizada com sucesso!
          </div>
        )}
        {passwordError && (
          <div className="mt-3 flex items-center gap-2 border border-brand p-2 text-[13px]">
            <AlertCircle className="h-4 w-4 text-brand" /> {passwordError}
          </div>
        )}

        <form onSubmit={handleSaveProfile}>
          <div className="mt-[18px] grid gap-x-[28px] gap-y-[30px] md:grid-cols-2">
            <AField label="Nome de exibição" required>
              <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={accInput} />
            </AField>
            <AField label="Nome de usuário" required>
              <input required value={username} onChange={(e) => setUsername(e.target.value)} className={accInput} />
            </AField>
            <AField label="E-mail" required>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={accInput} />
            </AField>
            <AField label="Nome ENS" required>
              <EnsField value={ensName.replace('.eth', '')} onChange={(v) => setEnsName(v + '.eth')} />
            </AField>
            <AField label="Apelido da carteira" required>
              <input value={walletNickname} onChange={(e) => setWalletNickname(e.target.value)} className={accInput} />
            </AField>
            <AField label="Avatar" gap={14}>
              <div className="flex items-center gap-[20px]">
                <img
                  src={user?.avatar}
                  alt="Avatar"
                  className="h-[50px] w-[50px] rounded-full border border-brand object-cover"
                />
                <button
                  type="button"
                  onClick={() => onToast({ type: 'info', title: 'Avatar', description: 'Seletor de foto aberto.' })}
                  className="h-9 w-[95px] rounded-md bg-brand text-[14px] font-bold text-ink"
                >
                  Alterar
                </button>
                <button
                  type="button"
                  onClick={() => onToast({ type: 'info', title: 'Avatar', description: 'Avatar restaurado para o padrão.' })}
                  className="text-[14px] text-brand-hi"
                >
                  Remover
                </button>
              </div>
            </AField>
          </div>

          <h2 className="mt-[34px] text-[16px] font-bold leading-6">Alterar senha</h2>
          <div className="mt-[16px] space-y-[14px] md:max-w-[417px]">
            <AField label="Senha atual">
              <PasswordInput value={currentPassword} onChange={setCurrentPassword} label="Senha atual" />
            </AField>
            <AField label="Nova senha">
              <PasswordInput value={newPassword} onChange={setNewPassword} label="Nova senha" />
            </AField>
            <AField label="Confirmar nova senha">
              <PasswordInput value={confirmNewPassword} onChange={setConfirmNewPassword} label="Confirmar nova senha" />
            </AField>
          </div>

          <button
            type="submit"
            disabled={isUpdating || isChangingPassword}
            className="mt-[40px] h-10 w-[131px] rounded-md bg-brand text-[14px] font-bold text-ink disabled:opacity-60"
          >
            {isUpdating ? 'Salvando...' : 'Salvar'}
          </button>
        </form>

        {orders.length > 0 && (
          <div className="mt-12 border-t border-brand/40 pt-6">
            <h3 className="text-[16px] font-bold">Histórico de compras</h3>
            <div className="mt-3 space-y-2">
              {orders.map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => onGoToOrderReceipt(ord.id)}
                  className="flex w-full items-center justify-between bg-card p-3 text-left text-[14px]"
                >
                  <span className="font-bold text-brand">#{ord.id}</span>
                  <span className="text-sand">{(ord.items || []).length} obra(s)</span>
                  <span className="font-bold">{ord.totalEth} ETH</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
