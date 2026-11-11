import React, { useState } from 'react';
import { UserPlus, ArrowRight, AlertCircle, User, AtSign, Mail, Key } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface RegisterPageProps {
  redirectPath?: string;
  onSuccess: (redirect?: string) => void;
  onGoToLogin: () => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function RegisterPage({
  redirectPath,
  onSuccess,
  onGoToLogin,
  onToast,
}: RegisterPageProps) {
  const { register, isRegistering } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || !username || !email || !password) {
      setErrorMessage('Todos os campos são obrigatórios.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    try {
      await register({ name, username, email, password });
      onToast({
        type: 'success',
        title: 'Conta Criada!',
        description: 'Seu perfil foi registrado com sucesso.',
      });
      onSuccess(redirectPath);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erro ao criar conta. Verifique os dados informados.';
      setErrorMessage(msg);
      onToast({
        type: 'error',
        title: 'Conflito no Cadastro',
        description: msg,
      });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Criar Nova Conta
          </h1>
          <p className="text-xs text-slate-400">
            Junte-se à maior comunidade de colecionadores de arte criptográfica.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">Nome Completo</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Mendes"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">Nome de Usuário (@handle)</label>
            <div className="relative">
              <AtSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="carlos_crypto"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">Endereço de Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="carlos@exemplo.com"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">Senha</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full py-3.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 uppercase tracking-wider mt-2"
          >
            {isRegistering ? 'Criando Conta...' : 'Cadastrar e Conectar'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Já possui uma conta?{' '}
            <button
              type="button"
              onClick={onGoToLogin}
              className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4"
            >
              Fazer login
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
