import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useWallets } from '../hooks/useWallets';
import { BlockchainNetwork } from '../types';
import { AccountSidebar, AccountMenu, AField, ASelect, EnsField, accInput } from './AccountUI';

interface WalletsPageProps {
  onNavigateToProfile: () => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function WalletsPage({ onNavigateToProfile, onToast }: WalletsPageProps) {
  const { user, logout } = useAuth();
  const { wallets, createWallet, updateWallet, deleteWallet } = useWallets();

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

  const [sameAsPrimary, setSameAsPrimary] = useState(false);
  const [showSecondaryForm, setShowSecondaryForm] = useState(false);
  const [secondaryAddress, setSecondaryAddress] = useState('');
  const [secondaryLabel, setSecondaryLabel] = useState('Cold Storage Vault');

  const select = (id: AccountMenu) => {
    if (id === 'dados') onNavigateToProfile();
  };

  const handleSavePrimary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.startsWith('0x') || address.length < 10) {
      onToast({ type: 'error', title: 'Endereço inválido', description: 'O endereço deve começar com "0x" em formato hexadecimal.' });
      return;
    }
    try {
      const primary = wallets.find((w) => w.isPrimary);
      if (primary) {
        await updateWallet({ id: primary.id, label: walletNickname, network });
      } else {
        await createWallet({ address, label: walletNickname, network, isPrimary: true, isSecondary: false });
      }
      onToast({ type: 'success', title: 'Carteira principal salva', description: 'Configurações de custódia e recebimento atualizadas.' });
    } catch (err: any) {
      onToast({ type: 'error', title: 'Erro ao salvar', description: err?.response?.data?.error || 'Tente novamente.' });
    }
  };

  const handleAddSecondary = async () => {
    if (sameAsPrimary) {
      onToast({ type: 'info', title: 'Carteira secundária', description: 'Configurada como espelho da carteira principal.' });
      return;
    }
    if (!secondaryAddress || !secondaryAddress.startsWith('0x')) {
      setShowSecondaryForm(true);
      return;
    }
    try {
      await createWallet({ address: secondaryAddress, label: secondaryLabel, network: 'Ethereum', isPrimary: false, isSecondary: true });
      onToast({ type: 'success', title: 'Carteira secundária adicionada', description: `"${secondaryLabel}" foi vinculada com sucesso.` });
      setShowSecondaryForm(false);
      setSecondaryAddress('');
    } catch (err: any) {
      onToast({ type: 'error', title: 'Erro ao adicionar', description: err?.response?.data?.error || 'Tente novamente.' });
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (wallets.length <= 1) {
      onToast({ type: 'error', title: 'Não permitido', description: 'Você precisa manter pelo menos uma carteira cadastrada.' });
      return;
    }
    try {
      await deleteWallet(id);
      onToast({ type: 'info', title: 'Carteira removida', description: `"${label}" foi desvinculada da sua conta.` });
    } catch {
      onToast({ type: 'error', title: 'Erro ao remover', description: 'Não foi possível excluir a carteira.' });
    }
  };

  const gap = 2;

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-6 md:flex md:items-start md:gap-[28px] md:px-4 md:pb-24 md:pt-[33px] xl:px-0">
      <AccountSidebar active="carteiras" onSelect={select} onLogout={() => logout()} />

      <main className="mt-6 min-w-0 flex-1 md:-mt-[3px]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[17px] font-bold leading-6">Carteira principal</h1>
            <p className="mt-[2px] text-[14px] leading-5 text-sand">
              Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
            </p>
          </div>
          <button onClick={() => setShowSecondaryForm(true)} className="text-[16px] font-bold leading-6 text-brand-hi">
            Adicionar
          </button>
        </div>

        <form onSubmit={handleSavePrimary}>
          <div className="mt-[30px] grid gap-x-[28px] gap-y-[31px] md:grid-cols-2">
            <AField label="Nome de exibição" required gap={gap}>
              <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={accInput} />
            </AField>
            <AField label="Apelido da carteira" required gap={gap}>
              <input required value={walletNickname} onChange={(e) => setWalletNickname(e.target.value)} className={accInput} />
            </AField>
            <AField label="Rede" required gap={gap}>
              <ASelect value={network} onChange={(e) => setNetwork(e.target.value as BlockchainNetwork)} aria-label="Rede">
                <option value="Ethereum" className="bg-card">Ethereum</option>
                <option value="Polygon" className="bg-card">Polygon</option>
                <option value="Solana" className="bg-card">Solana</option>
                <option value="Arbitrum" className="bg-card">Arbitrum</option>
              </ASelect>
            </AField>
            <AField label="Nome do perfil" required gap={gap}>
              <input required value={profileName} onChange={(e) => setProfileName(e.target.value)} className={accInput} />
            </AField>
            <AField label="Endereço da carteira" required gap={gap}>
              <input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Endereço 0x da carteira"
                className={`${accInput} pl-[13px]`}
              />
            </AField>
            <AField gap={gap}>
              <input
                value={ensSecondary}
                onChange={(e) => setEnsSecondary(e.target.value)}
                placeholder="ENS ou carteira secundária (opcional)"
                aria-label="ENS ou carteira secundária (opcional)"
                className={`${accInput} pl-[13px]`}
              />
            </AField>
            <AField label="Tipo de carteira" required gap={gap}>
              <ASelect value={walletType} onChange={(e) => setWalletType(e.target.value)} aria-label="Tipo de carteira">
                <option value="MetaMask" className="bg-card">MetaMask</option>
                <option value="WalletConnect" className="bg-card">WalletConnect</option>
                <option value="Coinbase" className="bg-card">Coinbase Wallet</option>
                <option value="Ledger" className="bg-card">Ledger</option>
              </ASelect>
            </AField>
            <AField label="Código de indicação" required gap={gap}>
              <input value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className={accInput} />
            </AField>
            <AField label="E-mail" required gap={gap}>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={accInput} />
            </AField>
            <AField label="Nome ENS" required gap={gap}>
              <EnsField value={ensName.replace('.eth', '')} onChange={setEnsName} />
            </AField>
          </div>

          <button type="submit" className="mt-[27px] h-10 w-[131px] rounded-md bg-brand text-[14px] font-bold text-ink">
            Salvar carteira
          </button>
        </form>

        <div className="mt-[38px] flex items-start justify-between">
          <div>
            <h2 className="text-[17px] font-bold leading-6">Carteira secundária</h2>
            <p className="mt-[2px] text-[14px] leading-5 text-sand">Você ainda não adicionou uma carteira secundária.</p>
          </div>
          <div className="flex items-center gap-[10px] text-[14px]">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={sameAsPrimary} onChange={(e) => setSameAsPrimary(e.target.checked)} className="sr-only" />
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-brand/60">
                {sameAsPrimary && <span className="h-[10px] w-[10px] rounded-full bg-brand" />}
              </span>
              Igual à carteira principal
            </label>
            <button onClick={handleAddSecondary} className="font-bold text-brand-hi">
              Adicionar
            </button>
          </div>
        </div>

        {showSecondaryForm && !sameAsPrimary && (
          <div className="mt-4 grid gap-[28px] md:grid-cols-2">
            <AField label="Apelido da carteira" gap={gap}>
              <input value={secondaryLabel} onChange={(e) => setSecondaryLabel(e.target.value)} className={accInput} />
            </AField>
            <AField label="Endereço da carteira" gap={gap}>
              <input value={secondaryAddress} onChange={(e) => setSecondaryAddress(e.target.value)} placeholder="0x..." className={accInput} />
            </AField>
          </div>
        )}

        <div className="mt-8 space-y-2">
          {wallets.map((w) => (
            <div key={w.id} className="flex items-center justify-between gap-3 bg-card p-3 text-[14px]">
              <div className="min-w-0">
                <p className="font-bold">
                  {w.label}
                  {w.isPrimary && <span className="ml-2 text-[12px] text-brand-hi">Principal</span>}
                  {w.isSecondary && <span className="ml-2 text-[12px] text-brand-hi">Secundária</span>}
                </p>
                <p className="truncate text-sand">
                  {w.address} · {w.network}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {!w.isPrimary && (
                  <button onClick={() => updateWallet({ id: w.id, isPrimary: true })} className="text-[13px] font-bold text-brand-hi">
                    Tornar principal
                  </button>
                )}
                <button onClick={() => handleDelete(w.id, w.label)} aria-label={`Remover ${w.label}`} className="text-brand">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
