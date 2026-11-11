import React, { useState } from 'react';
import { LogIn, ArrowRight, ShieldCheck, AlertCircle, Key, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LoginPageProps {
  redirectPath?: string;
  onSuccess: (redirect?: string) => void;
  onGoToRegister: () => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function LoginPage({ redirectPath, onSuccess, onGoToRegister, onToast }: LoginPageProps) {
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail] = useState('alex.collector@crypto.art');
  const [password, setPassword] = useState('collector123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Por favor, preencha email e senha.');
      return;
    }

    try {
      await login({ email, password });
      onToast({
        type: 'success',
        title: 'Sessão Iniciada',
        description: 'Bem-vindo de volta à Kurio!',
      });
      onSuccess(redirectPath);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erro ao efetuar login. Verifique suas credenciais.';
      setErrorMessage(msg);
      onToast({
        type: 'error',
        title: 'Falha de Autenticação',
        description: msg,
      });
    }
  };

  const handleQuickFill = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Acessar Conta
          </h1>
          <p className="text-xs text-slate-400">
            Conecte sua conta de colecionador para gerenciar carteiras e pedidos.
          </p>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Email do Colecionador
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@crypto.art"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Senha de Acesso
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            {isLoggingIn ? 'Autenticando...' : 'Entrar no Marketplace'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Fictitious credentials shortcut */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="text-[11px] text-slate-400 block font-semibold">
            Preenchimento Rápido com Contas Fictícias:
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('alex.collector@crypto.art', 'collector123')}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-slate-300 transition-colors"
            >
              <p className="font-semibold text-white">Alex Rivera</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">alex.collector@...</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('elena.eth@web3.io', 'web3pass')}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-slate-300 transition-colors"
            >
              <p className="font-semibold text-white">Elena Rostova</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">elena.eth@...</p>
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Ainda não tem conta?{' '}
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4"
            >
              Cadastre-se gratuitamente
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
