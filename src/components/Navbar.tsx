import React, { useState } from 'react';
import { Search, ShoppingCart, LogIn, LogOut, Wallet, User as UserIcon, Heart, ScanLine, Home, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSimulation: () => void;
  onOpenAuthModal: () => void;
}

const NAV_LINKS = [
  { label: 'Início', path: '/', hash: '' },
  { label: 'Mercado', path: '/', hash: '#catalog' },
  { label: 'Criadores', path: '/', hash: '#criadores' },
  { label: 'Aprenda', path: '/', hash: '#aprenda' },
];

// Home, profile and wallets show a hairline under the header (Figma pages 1, 6-9).
const LINE_PATHS = ['/', '/profile', '/wallets'];

function activeLabel(path: string): string {
  if (path === '/' || path === '' || path === '/profile' || path === '/wallets' || path === '/login' || path === '/register') {
    return 'Início';
  }
  return 'Mercado';
}

export function Navbar({ currentPath, onNavigate, onOpenSimulation, onOpenAuthModal }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { count: cartCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const active = activeLabel(currentPath);
  const showLine = LINE_PATHS.includes(currentPath);

  const goTo = (link: (typeof NAV_LINKS)[number]) => {
    onNavigate(link.path);
    if (link.hash) {
      setTimeout(() => document.querySelector(link.hash)?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <>
      <header className="hidden md:block relative z-40 bg-ink">
        <div
          className={`relative mx-auto h-[68px] max-w-[1200px] px-4 xl:px-0 ${
            showLine ? 'border-b border-brand/40' : ''
          }`}
        >
          <button
            onClick={() => onNavigate('/')}
            className="absolute left-4 xl:left-0 top-[33px] text-[14px] leading-4 font-bold tracking-[0.13em] text-cream"
          >
            KURIO
          </button>

          <nav className="absolute left-[calc(50%-28px)] -translate-x-1/2 top-0 flex h-[68px] items-center gap-[38px] text-[16px]">
            {NAV_LINKS.map((link) => {
              const isActive = link.label === active;
              return (
                <button
                  key={link.label}
                  onClick={() => goTo(link)}
                  className={`relative flex h-full items-center ${
                    isActive ? 'font-bold text-brand-hi' : 'text-cream hover:text-brand-hi'
                  }`}
                >
                  {link.label}
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-hi" />}
                </button>
              );
            })}
          </nav>

          <div className="absolute right-4 xl:right-0 top-[24px] flex items-center">
            <button
              aria-label="Buscar no catálogo"
              onClick={() => {
                onNavigate('/');
                setTimeout(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
              className="mr-[26px] flex h-[35px] w-6 items-center justify-center text-cream"
            >
              <Search className="h-[22px] w-[22px]" strokeWidth={1.75} />
            </button>

            <button
              aria-label={`Carrinho com ${cartCount} itens`}
              onClick={() => onNavigate('/cart')}
              className="relative mr-[34px] flex h-[35px] w-6 items-center justify-center text-cream"
            >
              <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute -right-[10px] top-[2px] flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-ink">
                  {cartCount}
                </span>
              )}
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-expanded={dropdownOpen}
                  className="flex h-[35px] items-center gap-2 rounded-md bg-brand px-3 text-[16px] font-bold text-ink"
                >
                  <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="h-6 w-6 rounded-full object-cover" />
                  <span className="max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                </button>
                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-[41px] z-50 w-56 border border-line bg-card py-2 text-[14px]"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="border-b border-line px-4 pb-2">
                      <p className="truncate font-bold text-cream">{user.name}</p>
                      <p className="truncate text-[12px] text-sand">@{user.username}</p>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onNavigate('/profile');
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sand hover:text-brand-hi"
                    >
                      <UserIcon className="h-4 w-4" /> Meu perfil
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onNavigate('/wallets');
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sand hover:text-brand-hi"
                    >
                      <Wallet className="h-4 w-4" /> Carteiras ({user.wallets?.length || 0})
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 border-t border-line px-4 py-2 text-left font-bold text-brand-hi"
                    >
                      <LogOut className="h-4 w-4" /> Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex h-[35px] w-[100px] items-center justify-center gap-[4px] rounded-md bg-brand text-[16px] font-bold text-ink"
              >
                <LogIn className="h-5 w-5" strokeWidth={2} />
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tablet-width fallback menu is not part of the design; the bottom bar covers small screens. */}
      <button
        onClick={onOpenSimulation}
        title="Console de simulação (MSW / Socket.IO)"
        aria-label="Abrir console de simulação"
        className="fixed bottom-3 left-3 z-30 hidden h-8 w-8 items-center justify-center rounded-full border border-line bg-card text-[11px] font-bold text-brand opacity-40 transition-opacity hover:opacity-100 md:flex"
      >
        S
      </button>

      <MobileBottomNav
        currentPath={currentPath}
        onNavigate={onNavigate}
        isAuthenticated={isAuthenticated}
        onOpenAuthModal={onOpenAuthModal}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenSimulation={onOpenSimulation}
      />
    </>
  );
}

// Bottom bar is shown only on the mobile home / profile screens (Figma page 10).
const MOBILE_NAV_PATHS = ['/', '/profile', '/wallets'];

function MobileBottomNav({
  currentPath,
  onNavigate,
  isAuthenticated,
  onOpenAuthModal,
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenSimulation,
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
  isAuthenticated: boolean;
  onOpenAuthModal: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  onOpenSimulation: () => void;
}) {
  const { count } = useCart();
  if (!MOBILE_NAV_PATHS.includes(currentPath)) return null;

  const iconBtn = 'relative flex h-12 w-12 items-center justify-center';

  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 bottom-[96px] z-40 mx-6 rounded-3xl border border-line bg-card p-4 text-[14px] md:hidden">
          <button onClick={() => setMobileMenuOpen(false)} className="absolute right-3 top-3 text-brand" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/wallets');
            }}
            className="block w-full py-2 text-left text-sand"
          >
            Carteiras
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSimulation();
            }}
            className="block w-full py-2 text-left text-sand"
          >
            Console de simulação
          </button>
        </div>
      )}

      <nav aria-label="Navegação inferior" className="fixed inset-x-0 bottom-0 z-40 h-24 md:hidden">
        <div className="absolute inset-x-0 bottom-0 h-24 rounded-t-[40px] bg-card" />
        <div className="absolute left-1/2 top-0 h-[88px] w-[88px] -translate-x-1/2 -translate-y-[28px] rounded-full bg-ink" />
        <div className="absolute inset-x-0 bottom-0 flex h-24 items-center justify-between px-[22px]">
          <div className="flex w-[160px] items-center justify-between">
            <button
              aria-label="Início"
              onClick={() => onNavigate('/')}
              className={`${iconBtn} ${currentPath === '/' ? 'text-brand-hi' : 'text-sand'}`}
            >
              <Home className="h-5 w-5" fill={currentPath === '/' ? 'currentColor' : 'none'} />
            </button>
            <button
              aria-label="Favoritos"
              onClick={() => (isAuthenticated ? onNavigate('/profile') : onOpenAuthModal())}
              className={`${iconBtn} text-sand`}
            >
              <Heart className="h-5 w-5" fill="currentColor" />
            </button>
          </div>

          <div className="flex w-[130px] items-center justify-end gap-[24px]">
            <button aria-label="Carrinho" onClick={() => onNavigate('/cart')} className={`${iconBtn} text-sand`}>
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-ink">
                  {count}
                </span>
              )}
            </button>
            <button
              aria-label="Perfil"
              onClick={() => (isAuthenticated ? setMobileMenuOpen(!mobileMenuOpen) : onOpenAuthModal())}
              className={`${iconBtn} ${currentPath === '/profile' ? 'text-brand-hi' : 'text-sand'}`}
            >
              {mobileMenuOpen ? <Menu className="h-5 w-5" /> : <UserIcon className="h-5 w-5" fill="currentColor" />}
            </button>
          </div>
        </div>

        <button
          aria-label="Explorar"
          onClick={() => {
            onNavigate('/');
            setTimeout(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }), 100);
          }}
          className="bg-brand-grad absolute left-1/2 top-0 flex h-16 w-16 -translate-x-1/2 -translate-y-[16px] items-center justify-center rounded-full text-ink shadow-lg"
        >
          <ScanLine className="h-7 w-7" />
        </button>
      </nav>
    </>
  );
}
