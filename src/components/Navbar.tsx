import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  User as UserIcon,
  Sliders,
  LogIn,
  LogOut,
  Wallet,
  Menu,
  X,
  Heart,
  Compass,
  Home,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSimulation: () => void;
  onOpenAuthModal: () => void;
}

export function Navbar({
  currentPath,
  onNavigate,
  onOpenSimulation,
  onOpenAuthModal,
}: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { count: cartCount } = useCart();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Início', path: '/' },
    { label: 'Mercado', path: '/#catalog' },
    { label: 'Criadores', path: '/#criadores' },
    { label: 'Aprenda', path: '/#aprenda' },
  ];

  return (
    <>
      {/* Desktop / Tablet Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#2C241D] bg-[#0D0B08]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
          
          {/* Brand Wordmark (Figma exact: KURIO tracking-widest) */}
          <button
            onClick={() => onNavigate('/')}
            className="text-xl font-mono font-extrabold tracking-[0.25em] text-[#FFF8F0] hover:text-[#D98A48] transition-colors shrink-0 uppercase"
          >
            KURIO
          </button>

          {/* Desktop Nav Links matching Figma: Início, Mercado, Criadores, Aprenda */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A89A8A]">
            {navLinks.map((link) => {
              const isActive =
                (link.path === '/' && (currentPath === '/' || currentPath === '')) ||
                currentPath.startsWith(link.path);
              return (
                <button
                  key={link.label}
                  onClick={() => {
                    if (link.path.startsWith('/#')) {
                      onNavigate('/');
                      setTimeout(() => {
                        const target = document.querySelector(link.path.replace('/', ''));
                        target?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    } else {
                      onNavigate(link.path);
                    }
                  }}
                  className={`transition-colors py-1 relative ${
                    isActive
                      ? 'text-[#FFF8F0] font-semibold after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-[#D98A48]'
                      : 'hover:text-[#FFF8F0]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3.5 shrink-0">
            {/* Search Icon */}
            <button
              onClick={() => {
                onNavigate('/');
                setTimeout(() => {
                  const input = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
                  input?.focus();
                }, 100);
              }}
              aria-label="Buscar no catálogo"
              className="p-2 text-[#A89A8A] hover:text-[#FFF8F0] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Icon with badge count matching Figma */}
            <button
              onClick={() => onNavigate('/cart')}
              aria-label={`Carrinho com ${cartCount} itens`}
              className="relative p-2 text-[#A89A8A] hover:text-[#FFF8F0] transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute 1 top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[#D98A48] text-[#0D0B08] text-[10px] font-mono font-black">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Evaluator Simulator Trigger */}
            <button
              onClick={onOpenSimulation}
              title="Abrir Console MSW & Socket.IO"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-medium rounded border border-[#3A2F24] bg-[#161310] text-[#D98A48] hover:border-[#D98A48] transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulador</span>
            </button>

            {/* Entrar Button matching Figma */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#3A2F24] bg-[#161310] hover:border-[#D98A48] transition-colors"
                  aria-expanded={userDropdownOpen}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-[#D98A48]"
                  />
                  <span className="text-xs font-semibold text-[#FFF8F0] hidden lg:inline max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl bg-[#161310] border border-[#2C241D] shadow-2xl py-2 z-50 text-xs text-[#A89A8A]"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#2C241D]">
                      <p className="font-bold text-[#FFF8F0] truncate">{user.name}</p>
                      <p className="font-mono text-[10px] text-[#A89A8A] truncate">@{user.username}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('/profile');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#1F1A15] hover:text-[#FFF8F0] flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#D98A48]" />
                      Meu Perfil
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('/wallets');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#1F1A15] hover:text-[#FFF8F0] flex items-center gap-2"
                    >
                      <Wallet className="w-3.5 h-3.5 text-[#D98A48]" />
                      Carteiras ({user.wallets?.length || 0})
                    </button>

                    <div className="border-t border-[#2C241D] my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#1F1A15] text-rose-400 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Encerrar Sessão
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0D0B08] bg-[#D98A48] hover:bg-[#E59550] rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-[#D98A48]/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#A89A8A] hover:text-[#FFF8F0]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#2C241D] bg-[#161310] px-4 pt-3 pb-5 space-y-2 text-sm">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(link.path);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-[#A89A8A] hover:bg-[#1F1A15] hover:text-[#FFF8F0]"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSimulation();
              }}
              className="block w-full text-left px-3 py-2 rounded-lg text-[#D98A48] font-mono text-xs"
            >
              Console de Simulação MSW
            </button>
          </div>
        )}
      </header>

      {/* Mobile Fixed Bottom Navigation Bar matching Figma Page 10 */}
      <nav
        aria-label="Navegação inferior mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#161310] border-t border-[#2C241D] px-6 py-3 flex items-center justify-between text-[#A89A8A]"
      >
        <button
          onClick={() => onNavigate('/')}
          className={`flex flex-col items-center gap-0.5 ${currentPath === '/' ? 'text-[#D98A48]' : 'hover:text-[#FFF8F0]'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Início</span>
        </button>

        <button
          onClick={() => onNavigate('/#catalog')}
          className="flex flex-col items-center gap-0.5 hover:text-[#FFF8F0]"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Explorar</span>
        </button>

        <button
          onClick={() => onNavigate('/cart')}
          className={`flex flex-col items-center gap-0.5 relative ${currentPath === '/cart' ? 'text-[#D98A48]' : 'hover:text-[#FFF8F0]'}`}
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-[#D98A48] text-[#0D0B08] text-[9px] font-mono font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-[10px]">Carrinho</span>
        </button>

        <button
          onClick={() => (isAuthenticated ? onNavigate('/profile') : onOpenAuthModal())}
          className={`flex flex-col items-center gap-0.5 ${currentPath === '/profile' ? 'text-[#D98A48]' : 'hover:text-[#FFF8F0]'}`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px]">{isAuthenticated ? 'Perfil' : 'Conta'}</span>
        </button>
      </nav>
    </>
  );
}
