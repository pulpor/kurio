import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export type AuthTab = 'login' | 'register';

interface AuthPanelProps {
  tab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  onSuccess: () => void;
  onClose?: () => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function GoogleLogo({ className = 'h-[18px] w-[18px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function FacebookLogo({ className = 'h-[18px] w-[18px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path fill="#fff" d="M13.3 19v-6.2h2.1l.4-2.5h-2.5V8.7c0-.7.3-1.3 1.4-1.3h1.2V5.2c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3v1.9H8.7v2.5h2.1V19h2.5z" />
    </svg>
  );
}

const fieldDesktop = 'h-10 w-full border border-brand/30 bg-transparent px-4 text-[14px] text-cream outline-none focus:border-brand';
const fieldMobile = 'max-md:h-[50px] max-md:rounded-[14px] max-md:text-center md:text-left';

function PasswordField({
  value,
  onChange,
  placeholder,
  show,
  onToggle,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${fieldDesktop} ${fieldMobile} pr-11 max-md:px-11`}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-brand"
      >
        {show ? <Eye className="h-5 w-5" strokeWidth={1.5} /> : <EyeOff className="h-5 w-5" strokeWidth={1.5} />}
      </button>
    </div>
  );
}

export function AuthPanel({ tab, onTabChange, onSuccess, onClose, onToast }: AuthPanelProps) {
  const { login, register, isLoggingIn, isRegistering } = useAuth();

  const [loginEmail, setLoginEmail] = useState('contato@email.com');
  const [loginPassword, setLoginPassword] = useState('collector123');
  const [showPassword, setShowPassword] = useState(false);

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showReg, setShowReg] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const switchTab = (t: AuthTab) => {
    setError(null);
    onTabChange(t);
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email: loginEmail, password: loginPassword });
      onToast({ type: 'success', title: 'Sessão iniciada', description: 'Bem-vindo de volta à Kurio!' });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Credenciais inválidas.');
    }
  };

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (regPassword !== regConfirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (regPassword.length < 6) {
      setError('A senha deve possuir no mínimo 6 caracteres.');
      return;
    }
    try {
      await register({ name: regUsername || 'Colecionador Kurio', username: regUsername, email: regEmail, password: regPassword });
      onToast({ type: 'success', title: 'Conta criada', description: 'Seu perfil de colecionador foi criado com sucesso.' });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao criar conta.');
    }
  };

  const social = (provider: 'Google' | 'Facebook') => () =>
    onToast({
      type: 'info',
      title: `Continuar com ${provider}`,
      description: `O login com ${provider} ainda não está conectado a um provedor OAuth.`,
    });

  const socialBtn =
    'flex h-10 w-full items-center justify-center gap-3 rounded border border-brand/30 text-[13px] font-medium text-sand hover:border-brand';

  const isLogin = tab === 'login';
  const submitBtn =
    'h-[45px] w-full bg-brand text-[16px] font-bold text-ink disabled:opacity-60 max-md:h-[60px] max-md:rounded-2xl';

  const errorBox = error && (
    <div className="mt-3 flex items-center gap-2 border border-brand p-2 text-[12px]">
      <AlertCircle className="h-4 w-4 shrink-0 text-brand" />
      <span>{error}</span>
    </div>
  );

  const divider = (
    <div className="relative mt-[31px] flex h-4 items-center justify-center max-md:mt-9">
      <div className="absolute inset-x-0 top-1/2 h-px bg-brand/30 max-md:inset-x-0" />
      <span className="relative bg-card px-3 text-[13px] max-md:bg-ink">Ou continue com</span>
    </div>
  );

  const socials = (
    <div className="mt-[13px] space-y-3 max-md:mt-4 max-md:space-y-4">
      <button type="button" onClick={social('Google')} className={socialBtn}>
        <GoogleLogo />
        Continuar com Google
      </button>
      <button type="button" onClick={social('Facebook')} className={socialBtn}>
        <FacebookLogo />
        Continuar com Facebook
      </button>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-ink md:min-h-[600px] md:w-[500px] md:bg-card">
      <div className="absolute inset-x-0 bottom-0 hidden h-[10px] bg-brand md:block" />
      {onClose && (
        <button onClick={onClose} aria-label="Fechar" className="absolute right-[11px] top-[10px] hidden text-brand md:block">
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>
      )}

      <div className="px-7 pb-10 pt-[128px] md:px-[80px] md:pb-[31px] md:pt-[43px]">
        {/* Mobile heading */}
        <div className="text-center md:hidden">
          <div className="text-[32px] font-bold leading-10 tracking-[0.15em]">KURIO</div>
          <h1 className={`mt-[77px] font-bold ${isLogin ? 'text-[20px]' : 'text-[18px]'}`}>
            {isLogin ? 'Entrar' : 'Criar perfil de colecionador'}
          </h1>
        </div>

        {/* Desktop heading */}
        <div className="hidden items-center justify-center gap-4 text-[24px] font-bold leading-8 md:flex">
          <button onClick={() => switchTab('login')} className={isLogin ? 'text-brand-hi' : 'text-cream'}>
            Entrar
          </button>
          <span className="h-6 w-px bg-brand" />
          <button onClick={() => switchTab('register')} className={!isLogin ? 'text-brand-hi' : 'text-cream'}>
            Criar conta
          </button>
        </div>
        <p className="mx-auto mt-8 hidden max-w-[380px] text-center text-[13px] leading-[17px] md:block">
          {isLogin
            ? 'Entre para gerenciar sua carteira, coleção e perfil de criador.'
            : 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.'}
        </p>

        {errorBox}

        {isLogin ? (
          <form onSubmit={submitLogin} className="mt-[23px] max-md:mt-9">
            <div className="space-y-3">
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="contato@email.com"
                aria-label="E-mail"
                className={`${fieldDesktop} ${fieldMobile}`}
              />
              <PasswordField
                value={loginPassword}
                onChange={setLoginPassword}
                placeholder="***********"
                show={showPassword}
                onToggle={() => setShowPassword((s) => !s)}
              />
            </div>
            <div className="mt-[10px] text-right">
              <button
                type="button"
                onClick={() => onToast({ type: 'info', title: 'Recuperação de senha', description: 'Instruções enviadas para seu e-mail.' })}
                className="text-[14px] leading-5 text-brand"
              >
                Esqueceu a senha?
              </button>
            </div>
            <button type="submit" disabled={isLoggingIn} className={`${submitBtn} mt-[22px] max-md:mt-7`}>
              {isLoggingIn ? 'Autenticando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitRegister} className="mt-[23px] max-md:mt-9">
            <div className="space-y-3">
              <input
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="Nome de usuário"
                aria-label="Nome de usuário"
                className={`${fieldDesktop} ${fieldMobile}`}
              />
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                aria-label="E-mail"
                className={`${fieldDesktop} ${fieldMobile}`}
              />
              <PasswordField value={regPassword} onChange={setRegPassword} placeholder="Senha" show={showReg} onToggle={() => setShowReg((s) => !s)} />
              <PasswordField
                value={regConfirm}
                onChange={setRegConfirm}
                placeholder="Confirmar senha"
                show={showRegConfirm}
                onToggle={() => setShowRegConfirm((s) => !s)}
              />
            </div>
            <button type="submit" disabled={isRegistering} className={`${submitBtn} mt-[26px] max-md:mt-10`}>
              {isRegistering ? 'Criando conta...' : 'Criar perfil'}
            </button>
          </form>
        )}

        {divider}
        {socials}

        <p className="mt-9 text-center text-[14px] text-sand md:hidden">
          {isLogin ? (
            <>
              Novo na Kurio?{' '}
              <button onClick={() => switchTab('register')} className="font-bold text-brand">
                Crie uma conta
              </button>
            </>
          ) : (
            <>
              Já tem uma conta?{' '}
              <button onClick={() => switchTab('login')} className="font-bold text-brand">
                Entre
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
