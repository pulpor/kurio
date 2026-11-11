import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-violet-600/30 text-violet-300 font-mono font-bold flex items-center justify-center text-xs">
              K
            </span>
            <span className="text-sm font-bold text-white font-display">Kurio NFT Marketplace</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-400">
            <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">
              Explorar
            </button>
            <button onClick={() => onNavigate('/cart')} className="hover:text-white transition-colors">
              Carrinho
            </button>
            <button onClick={() => onNavigate('/wallets')} className="hover:text-white transition-colors">
              Carteiras
            </button>
            <button onClick={() => onNavigate('/profile')} className="hover:text-white transition-colors">
              Perfil
            </button>
          </div>

          <p className="text-slate-500 font-mono text-[11px]">
            © {new Date().getFullYear()} Kurio NFT Marketplace. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
