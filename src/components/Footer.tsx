import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-[#38210F] bg-[#130C0A] py-12 text-[#A8907E] text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-[#D1894B]/20 text-[#D1894B] font-mono font-bold flex items-center justify-center text-xs">
              K
            </span>
            <span className="text-sm font-bold font-mono tracking-widest text-[#FDF2DA]">KURIO</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[#A8907E]">
            <button onClick={() => onNavigate('/')} className="hover:text-[#FDF2DA] transition-colors">
              Explorar
            </button>
            <button onClick={() => onNavigate('/cart')} className="hover:text-[#FDF2DA] transition-colors">
              Carrinho
            </button>
            <button onClick={() => onNavigate('/wallets')} className="hover:text-[#FDF2DA] transition-colors">
              Carteiras
            </button>
            <button onClick={() => onNavigate('/profile')} className="hover:text-[#FDF2DA] transition-colors">
              Perfil
            </button>
          </div>

          <p className="text-[#7A6352] font-mono text-[11px]">
            © {new Date().getFullYear()} Kurio NFT Marketplace. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
