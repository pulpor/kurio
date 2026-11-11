import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowRight,
  Shield,
  Users,
  Bell,
  Sparkles,
  Layers,
  ChevronRight,
  Check,
} from 'lucide-react';
import { NFTCard } from './NFTCard';
import { NFTSkeletonCard } from './ui/Skeleton';
import { useNFTs, NFTQueryParams } from '../hooks/useNFTs';
import { Category, SortOption, CatalogTab } from '../types';

interface CatalogSectionProps {
  queryParams: NFTQueryParams;
  onUpdateParams: (newParams: Partial<NFTQueryParams>) => void;
  onResetParams: () => void;
  onSelectNft: (id: string) => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function CatalogSection({
  queryParams,
  onUpdateParams,
  onResetParams,
  onSelectNft,
  onToast,
}: CatalogSectionProps) {
  const { data, isLoading, isError, error, refetch } = useNFTs(queryParams);
  const nftItems = Array.isArray(data?.items) ? data.items : [];

  const [activeTab, setActiveTab] = useState<CatalogTab>('todos');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  // Price range slider local state
  const [minPriceInput, setMinPriceInput] = useState(queryParams.minPrice || '0.02');
  const [maxPriceInput, setMaxPriceInput] = useState(queryParams.maxPrice || '12.30');

  // Sidebar collections exactly matching Figma Page 1
  const collectionsList: { label: string; value: Category; count: number }[] = [
    { label: 'Arte digital', value: 'arte-digital', count: 33 },
    { label: 'Fotografia', value: 'fotografia', count: 12 },
    { label: 'Música', value: 'musica', count: 65 },
    { label: 'Arte 3D', value: 'arte-3d', count: 39 },
    { label: 'Colecionáveis', value: 'colecionaveis', count: 23 },
    { label: 'Generativa', value: 'generativa', count: 17 },
    { label: 'Jogos', value: 'jogos', count: 19 },
    { label: 'Assinaturas', value: 'assinaturas', count: 13 },
    { label: 'Utilidade', value: 'utilidade', count: 18 },
  ];

  // Networks matching Figma Page 1
  const networksList = [
    { label: 'Ethereum', count: 119 },
    { label: 'Polygon', count: 78 },
    { label: 'Solana', count: 86 },
  ];

  const handleApplyPrice = () => {
    onUpdateParams({
      minPrice: minPriceInput || undefined,
      maxPrice: maxPriceInput || undefined,
      page: 1,
    });
    onToast({
      type: 'info',
      title: 'Filtro Aplicado',
      description: `Filtrando obras entre ${minPriceInput} e ${maxPriceInput} ETH`,
    });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSent(true);
    onToast({
      type: 'success',
      title: 'Inscrição Confirmada!',
      description: 'Você receberá os alertas dos próximos lançamentos.',
    });
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSent(false), 3000);
  };

  return (
    <div id="catalog" className="bg-[#130C0A] text-[#FDF2DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Main 2-column layout: Left Sidebar + Right Products Grid matching Figma Page 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================== */}
          {/* LEFT SIDEBAR (Figma exact: Coleções, Preço, Rede, Destaque) */}
          {/* ========================================================== */}
          <aside className="lg:col-span-3 space-y-8 bg-[#231611] border border-[#38210F] rounded-2xl p-5 text-xs text-[#A8907E]">
            
            {/* 1. Coleções */}
            <div className="space-y-3">
              <h3 className="font-bold text-[#FDF2DA] text-sm tracking-wide font-mono">
                Coleções
              </h3>
              <div className="space-y-1.5">
                {collectionsList.map((col) => {
                  const isSelected = queryParams.category === col.value;
                  return (
                    <button
                      key={col.value}
                      onClick={() =>
                        onUpdateParams({
                          category: isSelected ? 'all' : col.value,
                          page: 1,
                        })
                      }
                      className={`w-full flex items-center justify-between py-1 text-left transition-colors font-mono ${
                        isSelected
                          ? 'text-[#D1894B] font-bold'
                          : 'hover:text-[#FDF2DA] text-[#A8907E]'
                      }`}
                    >
                      <span className="truncate">{col.label}</span>
                      <span className="font-mono text-[11px] text-[#7A6352]">
                        ({col.count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-[#38210F]" />

            {/* 2. Faixa de preço */}
            <div className="space-y-3">
              <h3 className="font-bold text-[#FDF2DA] text-sm tracking-wide font-mono">
                Faixa de preço
              </h3>
              <p className="font-mono text-[11px] text-[#A8907E]">
                Preço: {minPriceInput} - {maxPriceInput} ETH
              </p>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="w-full bg-[#130C0A] border border-[#38210F] rounded-md px-2.5 py-1.5 text-xs text-[#FDF2DA] font-mono focus:border-[#D1894B] outline-none"
                  placeholder="0.02"
                />
                <span className="text-[#7A6352]">-</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full bg-[#130C0A] border border-[#38210F] rounded-md px-2.5 py-1.5 text-xs text-[#FDF2DA] font-mono focus:border-[#D1894B] outline-none"
                  placeholder="12.30"
                />
              </div>

              <button
                onClick={handleApplyPrice}
                className="w-full py-2 bg-[#D1894B] hover:bg-[#E0985C] text-[#130C0A] font-bold font-mono rounded-md text-xs transition-colors uppercase tracking-wider"
              >
                Aplicar
              </button>
            </div>

            <div className="border-t border-[#38210F]" />

            {/* 3. Rede */}
            <div className="space-y-3">
              <h3 className="font-bold text-[#FDF2DA] text-sm tracking-wide font-mono">
                Rede
              </h3>
              <div className="space-y-1.5">
                {networksList.map((net) => (
                  <div
                    key={net.label}
                    className="flex items-center justify-between py-1 text-[#A8907E] hover:text-[#FDF2DA] cursor-pointer font-mono"
                  >
                    <span>{net.label}</span>
                    <span className="font-mono text-[11px] text-[#7A6352]">
                      ({net.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#38210F]" />

            {/* 4. NFT EM DESTAQUE / OFERTA LIMITADA matching Figma Page 1 */}
            <div className="space-y-2.5 pt-1">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#D1894B] uppercase block">
                  NFT EM DESTAQUE
                </span>
                <h4 className="text-xs font-bold text-[#FDF2DA] tracking-wide uppercase font-mono">
                  OFERTA LIMITADA
                </h4>
              </div>

              <div
                onClick={() => onSelectNft('sage-nomad-009')}
                className="relative aspect-square rounded-xl overflow-hidden bg-[#130C0A] border border-[#38210F] hover:border-[#D1894B] cursor-pointer transition-colors"
              >
                <img
                  src="/src/assets/images/nft_ethereal_chronos_1794341378030.jpg"
                  alt="Sage Nomad #009"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-[#130C0A]/90 text-[11px] flex justify-between items-center">
                  <span className="font-bold text-[#FDF2DA] truncate font-mono">Sage Nomad #009</span>
                  <span className="font-mono text-[#D1894B] font-bold">1.69 ETH</span>
                </div>
              </div>
            </div>

          </aside>

          {/* ========================================================== */}
          {/* RIGHT MAIN CATALOG (Figma exact: Tabs, Sort, Grid, Pagination) */}
          {/* ========================================================== */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Top Toolbar: Tabs on Left, Sort Dropdown on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#38210F]">
              
              {/* Tabs: Todos os NFTs | Novos lançamentos | Em alta */}
              <div className="flex items-center gap-6 text-sm font-semibold font-mono">
                <button
                  onClick={() => setActiveTab('todos')}
                  className={`py-1 relative transition-colors ${
                    activeTab === 'todos'
                      ? 'text-[#FDF2DA] after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-[#D1894B]'
                      : 'text-[#A8907E] hover:text-[#FDF2DA]'
                  }`}
                >
                  Todos os NFTs
                </button>

                <button
                  onClick={() => setActiveTab('novos')}
                  className={`py-1 relative transition-colors ${
                    activeTab === 'novos'
                      ? 'text-[#FDF2DA] after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-[#D1894B]'
                      : 'text-[#A8907E] hover:text-[#FDF2DA]'
                  }`}
                >
                  Novos lançamentos
                </button>

                <button
                  onClick={() => setActiveTab('em-alta')}
                  className={`py-1 relative transition-colors ${
                    activeTab === 'em-alta'
                      ? 'text-[#FDF2DA] after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-[#D1894B]'
                      : 'text-[#A8907E] hover:text-[#FDF2DA]'
                  }`}
                >
                  Em alta
                </button>
              </div>

              {/* Sort Dropdown matching Figma exact: Ordenar por: Listados recentemente */}
              <div className="flex items-center gap-2 text-xs text-[#A8907E] font-mono">
                <span className="whitespace-nowrap">Ordenar por:</span>
                <select
                  value={queryParams.sort || 'recent'}
                  onChange={(e) => onUpdateParams({ sort: e.target.value as SortOption, page: 1 })}
                  aria-label="Ordenar listagem"
                  className="bg-[#231611] border border-[#38210F] rounded-md px-3 py-1.5 text-xs text-[#FDF2DA] focus:border-[#D1894B] outline-none font-mono"
                >
                  <option value="recent">Listados recentemente</option>
                  <option value="price_asc">Menor preço</option>
                  <option value="price_desc">Maior preço</option>
                  <option value="popular">Mais populares</option>
                </select>
              </div>
            </div>

            {/* Grid of Cards */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <NFTSkeletonCard key={i} />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-16 p-6 rounded-2xl bg-[#231611] border border-[#38210F] space-y-3">
                <p className="text-rose-400 font-bold font-mono">Falha ao carregar obras</p>
                <p className="text-xs text-[#A8907E]">
                  {(error as any)?.response?.data?.error || 'Não foi possível carregar os dados simulados.'}
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-[#D1894B] text-[#130C0A] font-bold text-xs rounded-md font-mono uppercase"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : nftItems.length === 0 ? (
              <div className="text-center py-16 p-6 rounded-2xl bg-[#231611] border border-[#38210F] space-y-3">
                <p className="text-[#FDF2DA] font-bold text-base font-mono">Nenhum NFT encontrado</p>
                <p className="text-xs text-[#A8907E]">
                  Nenhuma obra corresponde aos filtros ativos no momento.
                </p>
                <button
                  onClick={onResetParams}
                  className="px-4 py-2 bg-[#D1894B] text-[#130C0A] font-bold text-xs rounded-md font-mono uppercase"
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {nftItems.map((nft) => (
                    <NFTCard
                      key={nft.id}
                      nft={nft}
                      onSelect={onSelectNft}
                      onToast={onToast}
                    />
                  ))}
                </div>

                {/* Pagination Controls matching Figma Page 1: 1 2 3 4 > */}
                <div className="flex items-center justify-center gap-2 pt-6">
                  {[1, 2, 3, 4].map((p) => {
                    const isCurrent = (queryParams.page || 1) === p;
                    return (
                      <button
                        key={p}
                        onClick={() => onUpdateParams({ page: p })}
                        className={`w-8 h-8 rounded-md font-mono text-xs font-bold transition-colors ${
                          isCurrent
                            ? 'bg-[#D1894B] text-[#130C0A]'
                            : 'bg-[#231611] border border-[#38210F] text-[#A8907E] hover:text-[#FDF2DA]'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => onUpdateParams({ page: ((queryParams.page || 1) % 4) + 1 })}
                    className="w-8 h-8 rounded-md bg-[#231611] border border-[#38210F] text-[#A8907E] hover:text-[#FDF2DA] flex items-center justify-center text-xs font-mono"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}

          </main>

        </div>

        {/* ========================================================== */}
        {/* MID-PAGE PROMOTIONAL SPLIT BANNERS (Figma exact Page 1) */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-16">
          {/* Banner 1 */}
          <div className="p-6 rounded-2xl bg-[#231611] border border-[#38210F] flex items-center gap-6">
            <img
              src="/src/assets/images/nft_cyber_valkyrie_1794341377253.jpg"
              alt="Lançamentos gênesis"
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0"
            />
            <div className="space-y-2 text-left">
              <h3 className="text-base sm:text-lg font-bold font-mono text-[#FDF2DA] leading-snug">
                Lançamentos gênesis<br />de edição limitada
              </h3>
              <p className="text-xs text-[#A8907E] leading-relaxed">
                Colecione edições escassas diretamente dos criadores antes da revelação pública.
              </p>
              <button
                onClick={() => onSelectNft('emerald-ape-042')}
                className="text-xs font-bold font-mono text-[#D1894B] hover:text-[#E0985C] inline-flex items-center gap-1.5 transition-colors pt-1"
              >
                Explorar →
              </button>
            </div>
          </div>

          {/* Banner 2 */}
          <div className="p-6 rounded-2xl bg-[#231611] border border-[#38210F] flex items-center gap-6">
            <img
              src="/src/assets/images/nft_quantum_samurai_1794341379021.jpg"
              alt="Arte digital selecionada"
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0"
            />
            <div className="space-y-2 text-left">
              <h3 className="text-base sm:text-lg font-bold font-mono text-[#FDF2DA] leading-snug">
                Arte digital selecionada<br />e muito mais
              </h3>
              <p className="text-xs text-[#A8907E] leading-relaxed">
                Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.
              </p>
              <button
                onClick={() => onSelectNft('neon-vessel-552')}
                className="text-xs font-bold font-mono text-[#D1894B] hover:text-[#E0985C] inline-flex items-center gap-1.5 transition-colors pt-1"
              >
                Explorar →
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* EDITORIAL SECTION: DIÁRIO DA CUNHAGEM (Figma exact Page 1) */}
        {/* ========================================================== */}
        <section id="aprenda" className="pt-20 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FDF2DA] font-mono">
              Diário da Cunhagem
            </h2>
            <p className="text-xs sm:text-sm text-[#A8907E]">
              Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Article 1 */}
            <article className="p-4 rounded-xl bg-[#231611] border border-[#38210F] space-y-3 flex flex-col justify-between text-left">
              <div className="space-y-2">
                <img
                  src="/src/assets/images/nft_cyber_valkyrie_1794341377253.jpg"
                  alt="Artigo 1"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[4/3] rounded-lg object-cover"
                />
                <span className="text-[10px] text-[#A8907E] block font-mono">
                  12 de setembro | Leitura de 6 min
                </span>
                <h3 className="text-sm font-bold font-mono text-[#FDF2DA] leading-snug">
                  Como funciona a propriedade de NFTs
                </h3>
                <p className="text-xs text-[#A8907E] leading-relaxed">
                  Aprenda a colecionar, negociar e verificar ativos digitais.
                </p>
              </div>
              <button
                onClick={() => onToast({ type: 'info', title: 'Artigo Educativo', description: 'Abrindo guia de propriedade de NFTs.' })}
                className="text-xs font-bold font-mono text-[#D1894B] hover:text-[#E0985C] inline-flex items-center gap-1 pt-2"
              >
                Ler mais →
              </button>
            </article>

            {/* Article 2 */}
            <article className="p-4 rounded-xl bg-[#231611] border border-[#38210F] space-y-3 flex flex-col justify-between text-left">
              <div className="space-y-2">
                <img
                  src="/src/assets/images/nft_ethereal_chronos_1794341378030.jpg"
                  alt="Artigo 2"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[4/3] rounded-lg object-cover"
                />
                <span className="text-[10px] text-[#A8907E] block font-mono">
                  13 de setembro | Leitura de 2 min
                </span>
                <h3 className="text-sm font-bold font-mono text-[#FDF2DA] leading-snug">
                  10 artistas digitais para acompanhar
                </h3>
                <p className="text-xs text-[#A8907E] leading-relaxed">
                  Conheça criadores que moldam a cultura digital.
                </p>
              </div>
              <button
                onClick={() => onToast({ type: 'info', title: 'Artigo Educativo', description: 'Abrindo lista de criadores em destaque.' })}
                className="text-xs font-bold font-mono text-[#D1894B] hover:text-[#E0985C] inline-flex items-center gap-1 pt-2"
              >
                Ler mais →
              </button>
            </article>

            {/* Article 3 */}
            <article className="p-4 rounded-xl bg-[#231611] border border-[#38210F] space-y-3 flex flex-col justify-between text-left">
              <div className="space-y-2">
                <img
                  src="/src/assets/images/nft_quantum_samurai_1794341379021.jpg"
                  alt="Artigo 3"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[4/3] rounded-lg object-cover"
                />
                <span className="text-[10px] text-[#A8907E] block font-mono">
                  15 de setembro | Leitura de 3 min
                </span>
                <h3 className="text-sm font-bold font-mono text-[#FDF2DA] leading-snug">
                  Raridade, atributos e procedência
                </h3>
                <p className="text-xs text-[#A8907E] leading-relaxed">
                  Entenda raridade, procedência, direitos autorais e utilidade.
                </p>
              </div>
              <button
                onClick={() => onToast({ type: 'info', title: 'Artigo Educativo', description: 'Abrindo guia de raridade de NFTs.' })}
                className="text-xs font-bold font-mono text-[#D1894B] hover:text-[#E0985C] inline-flex items-center gap-1 pt-2"
              >
                Ler mais →
              </button>
            </article>

            {/* Article 4 */}
            <article className="p-4 rounded-xl bg-[#231611] border border-[#38210F] space-y-3 flex flex-col justify-between text-left">
              <div className="space-y-2">
                <img
                  src="/src/assets/images/nft_sol_solarium_1794341379684.jpg"
                  alt="Artigo 4"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[4/3] rounded-lg object-cover"
                />
                <span className="text-[10px] text-[#A8907E] block font-mono">
                  15 de setembro | Leitura de 2 min
                </span>
                <h3 className="text-sm font-bold font-mono text-[#FDF2DA] leading-snug">
                  Como proteger sua carteira
                </h3>
                <p className="text-xs text-[#A8907E] leading-relaxed">
                  Proteja sua carteira, seus ativos e sua identidade.
                </p>
              </div>
              <button
                onClick={() => onToast({ type: 'info', title: 'Artigo Educativo', description: 'Abrindo guia de segurança de carteiras.' })}
                className="text-xs font-bold font-mono text-[#D1894B] hover:text-[#E0985C] inline-flex items-center gap-1 pt-2"
              >
                Ler mais →
              </button>
            </article>
          </div>
        </section>

        {/* ========================================================== */}
        {/* VALUE PROPOSITIONS & NEWSLETTER STRIP (Figma exact Page 1) */}
        {/* ========================================================== */}
        <section id="criadores" className="pt-20 pb-10 border-t border-[#38210F] mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
            
            {/* Feature W */}
            <div className="space-y-3 text-left">
              <div className="w-10 h-10 rounded-full bg-[#D1894B]/15 border border-[#D1894B]/30 text-[#D1894B] font-mono font-bold flex items-center justify-center text-sm">
                W
              </div>
              <h3 className="text-sm font-bold font-mono text-[#FDF2DA]">
                Segurança da carteira
              </h3>
              <p className="text-xs text-[#A8907E] leading-relaxed">
                Proteja sua carteira e colecione arte digital verificada com confiança.
              </p>
            </div>

            {/* Feature C */}
            <div className="space-y-3 text-left">
              <div className="w-10 h-10 rounded-full bg-[#D1894B]/15 border border-[#D1894B]/30 text-[#D1894B] font-mono font-bold flex items-center justify-center text-sm">
                C
              </div>
              <h3 className="text-sm font-bold font-mono text-[#FDF2DA]">
                Criadores em destaque
              </h3>
              <p className="text-xs text-[#A8907E] leading-relaxed">
                Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.
              </p>
            </div>

            {/* Feature D */}
            <div className="space-y-3 text-left">
              <div className="w-10 h-10 rounded-full bg-[#D1894B]/15 border border-[#D1894B]/30 text-[#D1894B] font-mono font-bold flex items-center justify-center text-sm">
                D
              </div>
              <h3 className="text-sm font-bold font-mono text-[#FDF2DA]">
                Alertas de lançamentos
              </h3>
              <p className="text-xs text-[#A8907E] leading-relaxed">
                Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.
              </p>
            </div>

            {/* Newsletter Box */}
            <div className="p-5 rounded-2xl bg-[#231611] border border-[#38210F] space-y-3 text-left">
              <h3 className="text-xs font-bold font-mono text-[#FDF2DA] uppercase tracking-wider">
                Antecipe-se ao próximo lançamento
              </h3>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="digite seu e-mail..."
                  className="flex-1 bg-[#130C0A] border border-[#38210F] rounded-md px-3 py-2 text-xs text-[#FDF2DA] placeholder-[#7A6352] outline-none focus:border-[#D1894B] font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D1894B] hover:bg-[#E0985C] text-[#130C0A] font-bold font-mono text-xs rounded-md transition-colors uppercase tracking-wider"
                >
                  {newsletterSent ? 'Pronto!' : 'Enviar'}
                </button>
              </form>
              <p className="text-[11px] text-[#A8907E] leading-relaxed">
                Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
              </p>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
