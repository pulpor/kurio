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
      <header className="sticky top-0 z-40 w-full border-b border-[#38210F] bg-[#130C0A]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
          
          {/* Brand Wordmark (Figma exact: KURIO tracking-widest) */}
          <button
            onClick={() => onNavigate('/')}
            className="text-xl font-mono font-extrabold tracking-[0.25em] text-[#FDF2DA] hover:text-[#D1894B] transition-colors shrink-0 uppercase"
          >
            KURIO
          </button>

          {/* Desktop Nav Links matching Figma: Início, Mercado, Criadores, Aprenda */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A8907E]">
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
                      ? 'text-[#FDF2DA] font-semibold after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-[#D1894B]'
                      : 'hover:text-[#FDF2DA]'
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
              className="p-2 text-[#A8907E] hover:text-[#FDF2DA] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Icon with badge count matching Figma */}
            <button
              onClick={() => onNavigate('/cart')}
              aria-label={`Carrinho com ${cartCount} itens`}
              className="relative p-2 text-[#A8907E] hover:text-[#FDF2DA] transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[#D1894B] text-[#130C0A] text-[10px] font-mono font-black">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Evaluator Simulator Trigger */}
            <button
              onClick={onOpenSimulation}
              title="Abrir Console MSW & Socket.IO"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-medium rounded border border-[#38210F] bg-[#231611] text-[#D1894B] hover:border-[#D1894B] transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulador</span>
            </button>

            {/* Entrar Button matching Figma */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#38210F] bg-[#231611] hover:border-[#D1894B] transition-colors"
                  aria-expanded={userDropdownOpen}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-[#D1894B]"
                  />
                  <span className="text-xs font-semibold text-[#FDF2DA] hidden lg:inline max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl bg-[#231611] border border-[#38210F] shadow-2xl py-2 z-50 text-xs text-[#A8907E]"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#38210F]">
                      <p className="font-bold text-[#FDF2DA] truncate">{user.name}</p>
                      <p className="font-mono text-[10px] text-[#A8907E] truncate">@{user.username}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('/profile');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#38210F]/40 hover:text-[#FDF2DA] flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#D1894B]" />
                      Meu Perfil
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('/wallets');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#38210F]/40 hover:text-[#FDF2DA] flex items-center gap-2"
                    >
                      <Wallet className="w-3.5 h-3.5 text-[#D1894B]" />
                      Carteiras ({user.wallets?.length || 0})
                    </button>

                    <div className="border-t border-[#38210F] my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#38210F]/40 text-rose-400 flex items-center gap-2"
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
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#130C0A] bg-[#D1894B] hover:bg-[#E0985C] rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-[#D1894B]/20 uppercase tracking-wider"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#A8907E] hover:text-[#FDF2DA]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#38210F] bg-[#231611] px-4 pt-3 pb-5 space-y-2 text-sm">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(link.path);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-[#A8907E] hover:bg-[#38210F]/40 hover:text-[#FDF2DA]"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSimulation();
              }}
              className="block w-full text-left px-3 py-2 rounded-lg text-[#D1894B] font-mono text-xs"
            >
              Console de Simulação MSW
            </button>
          </div>
        )}
      </header>

      {/* Mobile Fixed Bottom Navigation Bar matching Figma Page 10 */}
      <nav
        aria-label="Navegação inferior mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#231611] border-t border-[#38210F] px-6 py-3 flex items-center justify-between text-[#A8907E]"
      >
        <button
          onClick={() => onNavigate('/')}
          className={`flex flex-col items-center gap-0.5 ${currentPath === '/' ? 'text-[#D1894B]' : 'hover:text-[#FDF2DA]'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Início</span>
        </button>

        <button
          onClick={() => onNavigate('/#catalog')}
          className="flex flex-col items-center gap-0.5 hover:text-[#FDF2DA]"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Explorar</span>
        </button>

        <button
          onClick={() => onNavigate('/cart')}
          className={`flex flex-col items-center gap-0.5 relative ${currentPath === '/cart' ? 'text-[#D1894B]' : 'hover:text-[#FDF2DA]'}`}
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-[#D1894B] text-[#130C0A] text-[9px] font-mono font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-[10px]">Carrinho</span>
        </button>

        <button
          onClick={() => (isAuthenticated ? onNavigate('/profile') : onOpenAuthModal())}
          className={`flex flex-col items-center gap-0.5 ${currentPath === '/profile' ? 'text-[#D1894B]' : 'hover:text-[#FDF2DA]'}`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px]">{isAuthenticated ? 'Perfil' : 'Conta'}</span>
        </button>
      </nav>
    </>
  );
}
