import React, { useState } from 'react';
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function AuthModal({
  isOpen,
  initialTab = 'login',
  onClose,
  onSuccess,
  onToast,
}: AuthModalProps) {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('contato@email.com');
  const [loginPassword, setLoginPassword] = useState('collector123');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await login({ email: loginEmail, password: loginPassword });
      onToast({
        type: 'success',
        title: 'Sessão Iniciada',
        description: 'Bem-vindo de volta à Kurio!',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Credenciais inválidas.';
      setErrorMessage(msg);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    try {
      await register({
        name: regUsername || 'Colecionador Kurio',
        username: regUsername,
        email: regEmail,
        password: regPassword,
      });
      onToast({
        type: 'success',
        title: 'Conta Criada!',
        description: 'Seu perfil de colecionador foi criado com sucesso.',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erro ao criar conta.';
      setErrorMessage(msg);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#130C0A]/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in font-mono"
    >
      <div className="relative w-full max-w-md bg-[#231611] border border-[#38210F] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
        
        {/* Close Button top right */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-5 right-5 text-[#A8907E] hover:text-[#FDF2DA] p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tabs: Entrar | Criar conta matching Figma Pages 6 & 7 exact */}
        <div className="flex items-center justify-center gap-4 text-base font-bold pb-2 font-mono">
          <button
            onClick={() => {
              setTab('login');
              setErrorMessage(null);
            }}
            className={`py-1 relative transition-colors ${
              tab === 'login'
                ? 'text-[#FDF2DA] after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-0.5 after:bg-[#D1894B]'
                : 'text-[#A8907E] hover:text-[#FDF2DA]'
            }`}
          >
            Entrar
          </button>
          <span className="text-[#38210F]">|</span>
          <button
            onClick={() => {
              setTab('register');
              setErrorMessage(null);
            }}
            className={`py-1 relative transition-colors ${
              tab === 'register'
                ? 'text-[#FDF2DA] after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-0.5 after:bg-[#D1894B]'
                : 'text-[#A8907E] hover:text-[#FDF2DA]'
            }`}
          >
            Criar conta
          </button>
        </div>

        {/* Subtitle matching Figma */}
        <p className="text-xs text-[#A8907E] text-center leading-relaxed">
          {tab === 'login'
            ? 'Entre para gerenciar sua carteira, coleção e perfil de criador.'
            : 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.'}
        </p>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: Entrar Form matching Figma Page 6 */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="contato@email.com"
                className="w-full bg-[#130C0A] border border-[#38210F] rounded-md px-3.5 py-2.5 text-xs text-[#FDF2DA] placeholder-[#7A6352] outline-none focus:border-[#D1894B]"
              />
            </div>

            <div className="space-y-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="***********"
                className="w-full bg-[#130C0A] border border-[#38210F] rounded-md px-3.5 py-2.5 text-xs text-[#FDF2DA] placeholder-[#7A6352] outline-none focus:border-[#D1894B] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6352] hover:text-[#FDF2DA]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onToast({ type: 'info', title: 'Recuperação de Senha', description: 'Instruções enviadas para seu email.' })}
                className="text-[11px] text-[#A8907E] hover:text-[#FDF2DA]"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#D1894B] hover:bg-[#E0985C] disabled:opacity-50 text-[#130C0A] font-bold font-mono text-xs rounded-md uppercase tracking-wider transition-colors shadow-lg shadow-[#D1894B]/20"
            >
              {isLoggingIn ? 'Autenticando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          /* Tab 2: Criar conta Form matching Figma Page 7 */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs font-mono">
            <div>
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="Nome de usuário"
                className="w-full bg-[#130C0A] border border-[#38210F] rounded-md px-3.5 py-2.5 text-xs text-[#FDF2DA] placeholder-[#7A6352] font-mono outline-none focus:border-[#D1894B]"
              />
            </div>

            <div>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                className="w-full bg-[#130C0A] border border-[#38210F] rounded-md px-3.5 py-2.5 text-xs text-[#FDF2DA] placeholder-[#7A6352] outline-none focus:border-[#D1894B]"
              />
            </div>

            <div>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Senha"
                className="w-full bg-[#130C0A] border border-[#38210F] rounded-md px-3.5 py-2.5 text-xs text-[#FDF2DA] placeholder-[#7A6352] outline-none focus:border-[#D1894B]"
              />
            </div>

            <div>
              <input
                type="password"
                required
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="Confirmar senha"
                className="w-full bg-[#130C0A] border border-[#38210F] rounded-md px-3.5 py-2.5 text-xs text-[#FDF2DA] placeholder-[#7A6352] outline-none focus:border-[#D1894B]"
              />
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-3 bg-[#D1894B] hover:bg-[#E0985C] disabled:opacity-50 text-[#130C0A] font-bold font-mono text-xs rounded-md uppercase tracking-wider transition-colors shadow-lg shadow-[#D1894B]/20"
            >
              {isRegistering ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
        )}

        {/* Divider: Ou continue com matching Figma */}
        <div className="relative text-center py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#38210F]" />
          </div>
          <span className="relative px-3 bg-[#231611] text-[11px] text-[#A8907E] font-mono">
            Ou continue com
          </span>
        </div>

        {/* Social Buttons matching Figma Pages 6 & 7 exact */}
        <div className="space-y-2 font-mono">
          <button
            type="button"
            onClick={() => onToast({ type: 'info', title: 'OAuth Google', description: 'Simulando login com Google.' })}
            className="w-full py-2.5 px-4 rounded-md border border-[#38210F] bg-[#130C0A] hover:bg-[#38210F]/40 text-xs font-semibold text-[#FDF2DA] flex items-center justify-center gap-2.5 transition-colors"
          >
            <span className="font-bold text-sm text-[#D1894B]">G</span>
            Continuar com Google
          </button>

          <button
            type="button"
            onClick={() => onToast({ type: 'info', title: 'OAuth Facebook', description: 'Simulando login com Facebook.' })}
            className="w-full py-2.5 px-4 rounded-md border border-[#38210F] bg-[#130C0A] hover:bg-[#38210F]/40 text-xs font-semibold text-[#FDF2DA] flex items-center justify-center gap-2.5 transition-colors"
          >
            <span className="font-bold text-sm text-blue-400">f</span>
            Continuar com Facebook
          </button>
        </div>

      </div>
    </div>
  );
}
