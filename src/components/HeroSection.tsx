import React, { useState } from 'react';
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { NFT } from '../types';
import { IMG_CHAPEU } from '../assets/images';

interface HeroSectionProps {
  featuredNft: NFT;
  onSelectNft: (id: string) => void;
  onNavigateToCatalog: () => void;
  onSearch?: (q: string) => void;
}

export function HeroSection({ featuredNft, onSelectNft, onNavigateToCatalog, onSearch }: HeroSectionProps) {
  const [q, setQ] = useState('');

  return (
    <>
      {/* Desktop (Figma page 1) */}
      <section className="relative mx-auto hidden h-[579px] max-w-[1200px] md:block">
        <div className="absolute left-10 top-[75px] text-[14px] font-bold leading-[18px] tracking-[0.1em]">
          Bem-vindo à Kurio
        </div>
        <h1 className="absolute left-10 top-[102px] text-[43px] font-bold leading-[70px]">
          SEJA DONO DO FUTURO
          <br />
          DA ARTE DIGITAL
        </h1>
        <p className="absolute left-10 top-[244px] w-[560px] text-[14px] leading-[24px] text-sand">
          Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie
          artistas e tenha uma parte da cultura da internet.
        </p>
        <button
          onClick={onNavigateToCatalog}
          className="absolute left-10 top-[348px] h-10 w-[140px] rounded-md bg-brand text-[16px] font-bold text-ink"
        >
          EXPLORAR
        </button>

        <img
          src={featuredNft.image}
          alt={featuredNft.title}
          fetchPriority="high"
          onClick={() => onSelectNft(featuredNft.id)}
          className="absolute right-0 top-[33px] h-[450px] w-[450px] cursor-pointer rounded-[32px] object-cover"
        />

        <div className="absolute left-[600px] top-[433px] flex items-center gap-[14px]" aria-hidden="true">
          <span className="h-[6px] w-[6px] rounded-full bg-brand" />
          <span className="h-[6px] w-[6px] rounded-full bg-brand" />
          <span className="h-[6px] w-[6px] rounded-full bg-brand" />
        </div>
      </section>

      {/* Mobile (Figma page 10) */}
      <section className="px-6 pb-2 pt-10 md:hidden">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearch?.(q.trim());
          }}
          className="flex items-center gap-2"
        >
          <label className="flex h-[45px] flex-1 items-center gap-3 rounded-xl bg-card px-4">
            <Search className="h-5 w-5 shrink-0 text-brand" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Explorar coleções"
              aria-label="Buscar no catálogo"
              className="w-full min-w-0 bg-transparent text-[14px] font-bold text-sand outline-none placeholder:font-bold"
            />
          </label>
          <button
            type="button"
            aria-label="Filtros"
            onClick={onNavigateToCatalog}
            className="bg-brand-grad flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </form>

        <div className="relative mt-4 h-[190px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#3a2316] to-[#241612]">
          <div className="absolute -right-10 -top-10 h-[200px] w-[200px] rounded-full bg-brand/10" />
          <div className="absolute left-4 top-[14px] w-[150px]">
            <div className="text-[12px] font-bold leading-4">Bem-vindo à Kurio</div>
            <h1 className="mt-[6px] text-[18px] font-bold leading-6">
              SEJA DONO DA
              <br />
              CULTURA DIGITAL
            </h1>
            <p className="mt-[6px] text-[12px] leading-[17px] text-sand">
              Descubra NFTs selecionados de criadores do mundo todo.
            </p>
            <button onClick={onNavigateToCatalog} className="mt-[10px] flex items-center gap-1 text-[12px] font-bold text-brand">
              EXPLORAR <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <img
            src={featuredNft.image}
            alt={featuredNft.title}
            fetchPriority="high"
            onClick={() => onSelectNft(featuredNft.id)}
            className="absolute right-4 top-[10px] h-[138px] w-[138px] rounded-2xl object-cover"
          />
          <img
            src={IMG_CHAPEU}
            alt=""
            className="absolute right-[94px] top-[99px] h-[58px] w-[70px] rounded-xl border-[3px] border-card object-cover"
          />
          <div className="absolute bottom-[10px] left-1/2 flex -translate-x-1/2 gap-[6px]" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span className="h-2 w-2 rounded-full bg-brand/40" />
            <span className="h-2 w-2 rounded-full bg-brand/40" />
          </div>
        </div>
      </section>
    </>
  );
}
