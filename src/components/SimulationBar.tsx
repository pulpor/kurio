import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Zap,
  Wifi,
  WifiOff,
  Radio,
  Sliders,
  DollarSign,
  Clock,
} from 'lucide-react';
import {
  loadSimulationConfig,
  saveSimulationConfig,
  resetDatabase,
  loadDatabase,
  saveDatabase,
} from '../mocks/db';
import { NetworkSimulationConfig } from '../types';
import { emitMockSocketEvent, socket } from '../lib/socket';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

interface SimulationBarProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function SimulationBar({ isOpen, onClose, onToast }: SimulationBarProps) {
  const queryClient = useQueryClient();
  const { user, switchUser } = useAuth();
  const [config, setConfig] = useState<NetworkSimulationConfig>(loadSimulationConfig());
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [currentVersion, setCurrentVersion] = useState<number>(2);

  useEffect(() => {
    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const updateConfig = (newCfg: Partial<NetworkSimulationConfig>) => {
    const merged = { ...config, ...newCfg };
    setConfig(merged);
    saveSimulationConfig(merged);
  };

  const handleResetDb = () => {
    resetDatabase();
    queryClient.invalidateQueries();
    onToast({
      type: 'success',
      title: 'Banco Restaurado com Sucesso',
      description: 'Todas as fixtures, usuários, favoritos e estoques voltaram ao estado padrão.',
    });
  };

  const handleTriggerPriceChange = () => {
    const nextVer = currentVersion + 1;
    setCurrentVersion(nextVer);
    const newPrice = nextVer % 2 === 0 ? '1.850' : '1.450';
    const newStock = Math.max(1, 8 - (nextVer % 5));

    const db = loadDatabase();
    const nft = db.nfts.find((n) => n.id === 'emerald-ape-042');
    if (nft) {
      nft.priceEth = newPrice;
      nft.availableCount = newStock;
      nft.version = nextVer;
      saveDatabase(db);
    }

    emitMockSocketEvent('nft.updated', {
      nftId: 'emerald-ape-042',
      priceEth: newPrice,
      priceUsd: Math.round(parseFloat(newPrice) * 3200),
      availableCount: newStock,
      version: nextVer,
      timestamp: new Date().toISOString(),
    });

    onToast({
      type: 'info',
      title: 'Evento Socket.IO: nft.updated emitido',
      description: `Emerald Ape #042 atualizado para ${newPrice} ETH (${newStock} un. disponíveis, v${nextVer})`,
    });
  };

  const handleTriggerStaleEvent = () => {
    emitMockSocketEvent('nft.updated', {
      nftId: 'emerald-ape-042',
      priceEth: '0.100',
      priceUsd: 320,
      availableCount: 99,
      version: 1, // Stale version!
      timestamp: new Date().toISOString(),
    });

    onToast({
      type: 'error',
      title: 'Evento Obsoleto Emitido (v1)',
      description: 'O cliente Socket.IO descartou o evento por ser anterior ou duplicado à versão atual.',
    });
  };

  const handleToggleSocket = () => {
    if (socket.connected) {
      socket.disconnect();
      setSocketConnected(false);
      onToast({
        type: 'info',
        title: 'Socket.IO Desconectado',
        description: 'Conexão em tempo real pausada para simulação.',
      });
    } else {
      socket.connect();
      setSocketConnected(true);
      queryClient.invalidateQueries();
      onToast({
        type: 'success',
        title: 'Socket.IO Reconectado',
        description: 'Recursos ativos reconciliados com a API REST.',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      role="dialog"
      aria-labelledby="simulation-panel-title"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#231611] border-l border-[#38210F] shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200 font-mono text-[#FDF2DA]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#38210F]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#D1894B]/20 text-[#D1894B] flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 id="simulation-panel-title" className="text-xs font-bold uppercase tracking-wider text-[#FDF2DA]">
              Console de Avaliação & Simulação
            </h2>
            <p className="text-[10px] text-[#A8907E]">MSW Mocking, Redes e Socket.IO</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Fechar painel de simulação"
          className="text-[#A8907E] hover:text-[#FDF2DA] p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6 pt-5">
        {/* User Switcher */}
        <section className="space-y-2">
          <label className="text-[11px] font-bold text-[#A8907E] uppercase tracking-wider block">
            1. Troca de Usuário (Sessão)
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => switchUser('user-alex')}
              className={`p-2.5 rounded-lg border text-left transition-colors ${
                user?.id === 'user-alex'
                  ? 'border-[#D1894B] bg-[#D1894B]/15 text-[#FDF2DA] font-semibold'
                  : 'border-[#38210F] bg-[#130C0A] text-[#A8907E] hover:border-[#D1894B]'
              }`}
            >
              <p className="truncate font-bold text-[#FDF2DA]">Alex Rivera</p>
              <p className="text-[10px] text-[#A8907E] truncate">2 carteiras · 2 favs</p>
            </button>

            <button
              onClick={() => switchUser('user-elena')}
              className={`p-2.5 rounded-lg border text-left transition-colors ${
                user?.id === 'user-elena'
                  ? 'border-[#D1894B] bg-[#D1894B]/15 text-[#FDF2DA] font-semibold'
                  : 'border-[#38210F] bg-[#130C0A] text-[#A8907E] hover:border-[#D1894B]'
              }`}
            >
              <p className="truncate font-bold text-[#FDF2DA]">Elena Rostova</p>
              <p className="text-[10px] text-[#A8907E] truncate">1 carteira · 1 fav</p>
            </button>
          </div>
        </section>

        {/* Latency Selection */}
        <section className="space-y-2">
          <label className="text-[11px] font-bold text-[#A8907E] uppercase tracking-wider flex items-center justify-between">
            <span>2. Latência da Rede (MSW)</span>
            <span className="font-mono text-[#D1894B]">{config.latencyMs}ms</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '50ms', value: 50 },
              { label: '180ms', value: 180 },
              { label: '1500ms', value: 1500 },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateConfig({ latencyMs: opt.value })}
                className={`py-2 px-1 text-center rounded-lg border text-xs font-mono transition-colors ${
                  config.latencyMs === opt.value
                    ? 'border-[#D1894B] bg-[#D1894B]/20 text-[#D1894B] font-bold'
                    : 'border-[#38210F] bg-[#130C0A] text-[#A8907E] hover:border-[#D1894B]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Forced HTTP Errors */}
        <section className="space-y-2">
          <label className="text-[11px] font-bold text-[#A8907E] uppercase tracking-wider block">
            3. Injeção de Falhas HTTP (MSW)
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => updateConfig({ forcedErrorStatus: null })}
              className={`p-2 rounded-lg border text-left ${
                config.forcedErrorStatus === null
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold'
                  : 'border-[#38210F] bg-[#130C0A] text-[#A8907E] hover:border-[#D1894B]'
              }`}
            >
              200 OK
            </button>

            <button
              onClick={() => updateConfig({ forcedErrorStatus: 401 })}
              className={`p-2 rounded-lg border text-left ${
                config.forcedErrorStatus === 401
                  ? 'border-rose-500 bg-rose-500/15 text-rose-300 font-semibold'
                  : 'border-[#38210F] bg-[#130C0A] text-[#A8907E] hover:border-[#D1894B]'
              }`}
            >
              401 Sessão
            </button>

            <button
              onClick={() => updateConfig({ forcedErrorStatus: 409 })}
              className={`p-2 rounded-lg border text-left ${
                config.forcedErrorStatus === 409
                  ? 'border-[#D1894B] bg-[#D1894B]/20 text-[#D1894B] font-semibold'
                  : 'border-[#38210F] bg-[#130C0A] text-[#A8907E] hover:border-[#D1894B]'
              }`}
            >
              409 Conflito
            </button>

            <button
              onClick={() => updateConfig({ forcedErrorStatus: 500 })}
              className={`p-2 rounded-lg border text-left ${
                config.forcedErrorStatus === 500
                  ? 'border-rose-500 bg-rose-500/15 text-rose-300 font-semibold'
                  : 'border-[#38210F] bg-[#130C0A] text-[#A8907E] hover:border-[#D1894B]'
              }`}
            >
              500 Falha
            </button>
          </div>

          {/* Connection Offline Toggle */}
          <div className="pt-2">
            <button
              onClick={() => updateConfig({ networkOffline: !config.networkOffline })}
              className={`w-full p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                config.networkOffline
                  ? 'border-rose-500 bg-rose-600/20 text-rose-200 font-bold'
                  : 'border-[#38210F] bg-[#130C0A] text-[#A8907E] hover:border-[#D1894B]'
              }`}
            >
              <span className="flex items-center gap-2">
                {config.networkOffline ? <WifiOff className="w-4 h-4 text-rose-400" /> : <Wifi className="w-4 h-4 text-[#A8907E]" />}
                Modo Offline
              </span>
              <span className="font-mono text-[11px]">{config.networkOffline ? 'ATIVADO' : 'DESATIVADO'}</span>
            </button>
          </div>
        </section>

        {/* Real-time Socket.IO Events */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[#A8907E] uppercase tracking-wider block">
              4. Eventos Tempo Real (Socket.IO)
            </label>
            <span className={`text-[11px] font-mono flex items-center gap-1 ${socketConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
              <Radio className="w-3 h-3" />
              {socketConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleTriggerPriceChange}
              className="w-full p-2.5 rounded-lg border border-[#D1894B]/60 bg-[#D1894B]/10 hover:bg-[#D1894B]/20 text-[#D1894B] text-xs font-medium flex items-center justify-between transition-colors text-left"
            >
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#D1894B]" />
                Alterar Preço Emerald Ape #042
              </span>
              <span className="font-mono text-[11px]">nft.updated</span>
            </button>

            <button
              onClick={handleTriggerStaleEvent}
              className="w-full p-2.5 rounded-lg border border-[#38210F] bg-[#130C0A] hover:bg-[#38210F]/30 text-[#A8907E] text-xs font-medium flex items-center justify-between transition-colors text-left"
            >
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D1894B]" />
                Enviar Evento Obsoleto (v1)
              </span>
              <span className="font-mono text-[10px]">Descarte/Dedupe</span>
            </button>

            <button
              onClick={handleToggleSocket}
              className="w-full p-2.5 rounded-lg border border-[#38210F] bg-[#130C0A] hover:bg-[#38210F]/30 text-[#A8907E] text-xs font-medium flex items-center justify-between transition-colors text-left"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D1894B]" />
                {socketConnected ? 'Simular Queda de Socket' : 'Simular Reconexão de Socket'}
              </span>
              <span className="font-mono text-[10px]">Reconciliação</span>
            </button>
          </div>
        </section>

        {/* Global Reset */}
        <section className="pt-3 border-t border-[#38210F]">
          <button
            onClick={handleResetDb}
            className="w-full py-2.5 px-4 rounded-lg bg-[#38210F]/50 hover:bg-[#38210F] text-[#FDF2DA] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-[#38210F]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#D1894B]" />
            Resetar Todos os Dados (Fixtures)
          </button>
        </section>
      </div>
    </aside>
  );
}
