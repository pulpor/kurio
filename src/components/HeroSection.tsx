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
    <section className="relative overflow-hidden pt-8 pb-14 lg:py-20 bg-[#0D0B08]">
      {/* Subtle ambient warm glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 right-1/4 w-[500px] h-[350px] bg-[#D98A48]/5 blur-[120px] rounded-full pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Editorial Headline & Exploration */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#D98A48] uppercase block">
              Bem-vindo à Kurio
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#FFF8F0] font-display uppercase leading-[1.05]">
              SEJA DONO DO FUTURO<br />
              <span className="text-[#D98A48]">DA ARTE DIGITAL</span>
            </h1>

            <p className="text-sm sm:text-base text-[#A89A8A] max-w-xl font-normal leading-relaxed">
              Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.
            </p>

            <div className="pt-2">
              <button
                onClick={onNavigateToCatalog}
                className="px-7 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0D0B08] bg-[#D98A48] hover:bg-[#E59550] rounded-md transition-colors inline-flex items-center gap-2 shadow-lg shadow-[#D98A48]/20"
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
              className="group relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-3xl overflow-hidden bg-[#161310] border border-[#2C241D] shadow-2xl cursor-pointer hover:border-[#D98A48] transition-all duration-300"
            >
              <img
                src={featuredNft.image}
                alt={featuredNft.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />

              {/* Bottom tag preview */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#0D0B08]/85 backdrop-blur-md border border-[#2C241D] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#D98A48] block">Destaque da Coleção</span>
                  <h3 className="text-sm font-bold text-[#FFF8F0]">{featuredNft.title}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#A89A8A] block">Preço</span>
                  <span className="font-mono font-bold text-sm text-[#D98A48]">{featuredNft.priceEth} ETH</span>
                </div>
              </div>
            </div>

            {/* Pagination Dots matching Figma Page 1 & 10 */}
            <div className="flex items-center gap-2 pt-4" aria-hidden="true">
              <span className="w-2 h-2 rounded-full bg-[#D98A48]" />
              <span className="w-2 h-2 rounded-full bg-[#2C241D]" />
              <span className="w-2 h-2 rounded-full bg-[#2C241D]" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
