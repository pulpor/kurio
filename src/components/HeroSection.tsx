import React from 'react';
import { ArrowRight } from 'lucide-react';
import { NFT } from '../types';

interface HeroSectionProps {
  featuredNft: NFT;
  onSelectNft: (id: string) => void;
  onNavigateToCatalog: () => void;
}

export function HeroSection({
  featuredNft,
  onSelectNft,
  onNavigateToCatalog,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 lg:py-20 bg-[#130C0A]">
      {/* Subtle ambient warm glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 right-1/4 w-[500px] h-[350px] bg-[#D1894B]/5 blur-[120px] rounded-full pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Editorial Headline & Exploration */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#D1894B] uppercase block">
              Bem-vindo à Kurio
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#FDF2DA] font-mono uppercase leading-[1.05]">
              SEJA DONO DO FUTURO<br />
              <span className="text-[#D1894B]">DA ARTE DIGITAL</span>
            </h1>

            <p className="text-sm sm:text-base text-[#A8907E] max-w-xl font-normal leading-relaxed">
              Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.
            </p>

            <div className="pt-2">
              <button
                onClick={onNavigateToCatalog}
                className="px-7 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#130C0A] bg-[#D1894B] hover:bg-[#E0985C] rounded-md transition-colors inline-flex items-center gap-2 shadow-lg shadow-[#D1894B]/20 font-mono"
              >
                EXPLORAR
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Featured Ape Image Card from Figma */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div
              onClick={() => onSelectNft(featuredNft.id)}
              className="group relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-3xl overflow-hidden bg-[#231611] border border-[#38210F] shadow-2xl cursor-pointer hover:border-[#D1894B] transition-all duration-300"
            >
              <img
                src={featuredNft.image}
                alt={featuredNft.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />

              {/* Bottom tag preview */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#130C0A]/90 backdrop-blur-md border border-[#38210F] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#D1894B] block">Destaque da Coleção</span>
                  <h3 className="text-sm font-bold text-[#FDF2DA]">{featuredNft.title}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#A8907E] block">Preço</span>
                  <span className="font-mono font-bold text-sm text-[#D1894B]">{featuredNft.priceEth} ETH</span>
                </div>
              </div>
            </div>

            {/* Pagination Dots matching Figma Page 1 & 10 */}
            <div className="flex items-center gap-2 pt-4" aria-hidden="true">
              <span className="w-6 h-1.5 rounded-full bg-[#D1894B]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#38210F]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#38210F]" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
