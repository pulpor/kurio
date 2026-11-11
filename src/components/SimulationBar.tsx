import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Zap,
  Wifi,
  WifiOff,
  AlertTriangle,
  UserCheck,
  CheckCircle,
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
    // Emit nft.updated for Valkyrie #089
    const newPrice = nextVer % 2 === 0 ? '1.850' : '1.450';
    const newStock = Math.max(1, 8 - (nextVer % 5));

    // Update in local database
    const db = loadDatabase();
    const nft = db.nfts.find((n) => n.id === 'valkyrie-089');
    if (nft) {
      nft.priceEth = newPrice;
      nft.availableCount = newStock;
      nft.version = nextVer;
      saveDatabase(db);
    }

    emitMockSocketEvent('nft.updated', {
      nftId: 'valkyrie-089',
      priceEth: newPrice,
      priceUsd: Math.round(parseFloat(newPrice) * 3200),
      availableCount: newStock,
      version: nextVer,
      timestamp: new Date().toISOString(),
    });

    onToast({
      type: 'info',
      title: 'Evento Socket.IO: nft.updated emitido',
      description: `Cyber Valkyrie atualizada para ${newPrice} ETH (${newStock} un. disponíveis, v${nextVer})`,
    });
  };

  const handleTriggerStaleEvent = () => {
    // Deliberately emit a lower version (v1) that should be discarded
    emitMockSocketEvent('nft.updated', {
      nftId: 'valkyrie-089',
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
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 id="simulation-panel-title" className="text-sm font-bold text-white tracking-tight">
              Console de Avaliação & Simulação
            </h2>
            <p className="text-[11px] text-slate-400">MSW Mocking, Redes e Socket.IO</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Fechar painel de simulação"
          className="text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6 pt-5">
        {/* User Switcher */}
        <section className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            1. Troca de Usuário (Sessão)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => switchUser('user-alex')}
              className={`p-2.5 rounded-lg border text-left transition-colors text-xs ${
                user?.id === 'user-alex'
                  ? 'border-violet-500 bg-violet-600/15 text-white font-semibold'
                  : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
              }`}
            >
              <p className="truncate">Alex Rivera</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">2 carteiras · 2 favs</p>
            </button>

            <button
              onClick={() => switchUser('user-elena')}
              className={`p-2.5 rounded-lg border text-left transition-colors text-xs ${
                user?.id === 'user-elena'
                  ? 'border-violet-500 bg-violet-600/15 text-white font-semibold'
                  : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
              }`}
            >
              <p className="truncate">Elena Rostova</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">1 carteira · 1 fav</p>
            </button>
          </div>
        </section>

        {/* Latency Selection */}
        <section className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>2. Latência da Rede (MSW)</span>
            <span className="font-mono text-violet-400 text-xs">{config.latencyMs}ms</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Rápida (50ms)', value: 50 },
              { label: 'Normal (180ms)', value: 180 },
              { label: 'Lenta (1500ms)', value: 1500 },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateConfig({ latencyMs: opt.value })}
                className={`py-2 px-1 text-center rounded-lg border text-xs font-mono transition-colors ${
                  config.latencyMs === opt.value
                    ? 'border-violet-500 bg-violet-600/20 text-white font-bold'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Forced HTTP Errors */}
        <section className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            3. Injeção de Falhas HTTP (MSW)
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => updateConfig({ forcedErrorStatus: null })}
              className={`p-2 rounded-lg border text-left ${
                config.forcedErrorStatus === null
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
              }`}
            >
              200 OK (Sem erro)
            </button>

            <button
              onClick={() => updateConfig({ forcedErrorStatus: 401 })}
              className={`p-2 rounded-lg border text-left ${
                config.forcedErrorStatus === 401
                  ? 'border-rose-500 bg-rose-500/15 text-rose-300 font-semibold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
              }`}
            >
              401 Sessão Expirada
            </button>

            <button
              onClick={() => updateConfig({ forcedErrorStatus: 409 })}
              className={`p-2 rounded-lg border text-left ${
                config.forcedErrorStatus === 409
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-semibold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
              }`}
            >
              409 Conflito Estoque
            </button>

            <button
              onClick={() => updateConfig({ forcedErrorStatus: 500 })}
              className={`p-2 rounded-lg border text-left ${
                config.forcedErrorStatus === 500
                  ? 'border-rose-500 bg-rose-500/15 text-rose-300 font-semibold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
              }`}
            >
              500 Falha Servidor
            </button>
          </div>

          {/* Connection Offline Toggle */}
          <div className="pt-2">
            <button
              onClick={() => updateConfig({ networkOffline: !config.networkOffline })}
              className={`w-full p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                config.networkOffline
                  ? 'border-rose-500 bg-rose-600/20 text-rose-200 font-bold'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="flex items-center gap-2">
                {config.networkOffline ? <WifiOff className="w-4 h-4 text-rose-400" /> : <Wifi className="w-4 h-4 text-slate-400" />}
                Modo Offline (Network Error)
              </span>
              <span className="font-mono text-[11px]">{config.networkOffline ? 'ATIVADO' : 'DESATIVADO'}</span>
            </button>
          </div>
        </section>

        {/* Real-time Socket.IO Events */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
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
              className="w-full p-2.5 rounded-lg border border-violet-500/60 bg-violet-950/40 hover:bg-violet-900/40 text-violet-200 text-xs font-medium flex items-center justify-between transition-colors text-left"
            >
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-violet-400" />
                Alterar Preço do Valkyrie #089
              </span>
              <span className="font-mono text-[11px] text-violet-300">nft.updated</span>
            </button>

            <button
              onClick={handleTriggerStaleEvent}
              className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300 text-xs font-medium flex items-center justify-between transition-colors text-left"
            >
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Enviar Evento Obsoleto (v1)
              </span>
              <span className="font-mono text-[10px] text-amber-300">Descarte/Dedupe</span>
            </button>

            <button
              onClick={handleToggleSocket}
              className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300 text-xs font-medium flex items-center justify-between transition-colors text-left"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                {socketConnected ? 'Simular Queda de Socket' : 'Simular Reconexão de Socket'}
              </span>
              <span className="font-mono text-[10px] text-cyan-300">Reconciliação</span>
            </button>
          </div>
        </section>

        {/* Global Reset */}
        <section className="pt-3 border-t border-slate-800">
          <button
            onClick={handleResetDb}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
            Resetar Todos os Dados (Fixtures Iniciais)
          </button>
        </section>
      </div>
    </aside>
  );
}
