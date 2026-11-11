import React, { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import { NFTCard } from './NFTCard';
import { NFTSkeletonCard } from './ui/Skeleton';
import { useNFTs, NFTQueryParams } from '../hooks/useNFTs';
import { Category, SortOption, CatalogTab } from '../types';
import { IMG_OCULOS, IMG_CHAPEU, IMG_TERNO, IMG_FONE } from '../assets/images';

interface CatalogSectionProps {
  queryParams: NFTQueryParams;
  onUpdateParams: (newParams: Partial<NFTQueryParams>) => void;
  onResetParams: () => void;
  onSelectNft: (id: string) => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

const COLLECTIONS: { label: string; value: Category; count: number }[] = [
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

const NETWORKS = [
  { label: 'Ethereum', count: 119 },
  { label: 'Polygon', count: 78 },
  { label: 'Solana', count: 86 },
];

const ARTICLES = [
  { img: IMG_OCULOS, meta: '12 de setembro | Leitura de 6 min', title: 'Como funciona a propriedade de NFTs', text: 'Aprenda a colecionar, negociar e verificar ativos digitais.' },
  { img: IMG_CHAPEU, meta: '13 de setembro | Leitura de 2 min', title: '10 artistas digitais para acompanhar', text: 'Conheça criadores que moldam a cultura digital.' },
  { img: IMG_TERNO, meta: '15 de setembro | Leitura de 3 min', title: 'Raridade, atributos e procedência', text: 'Entenda raridade, procedência, direitos autorais e utilidade.' },
  { img: IMG_FONE, meta: '15 de setembro | Leitura de 2 min', title: 'Como proteger sua carteira', text: 'Proteja sua carteira, seus ativos e sua identidade.' },
];

const SLIDER_MAX = 16;

export function CatalogSection({ queryParams, onUpdateParams, onResetParams, onSelectNft, onToast }: CatalogSectionProps) {
  const { data, isLoading, isError, error, refetch } = useNFTs(queryParams);
  const nftItems = Array.isArray(data?.items) ? data.items : [];

  const [activeTab, setActiveTab] = useState<CatalogTab>('todos');
  const [minPrice, setMinPrice] = useState(queryParams.minPrice || '0.02');
  const [maxPrice, setMaxPrice] = useState(queryParams.maxPrice || '12.30');

  const fmt = (v: string) => Number(v).toFixed(2).replace('.', ',');
  const page = queryParams.page || 1;

  const applyPrice = () => {
    onUpdateParams({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, page: 1 });
    onToast({ type: 'info', title: 'Filtro aplicado', description: `Filtrando obras entre ${minPrice} e ${maxPrice} ETH` });
  };

  const pickTab = (tab: CatalogTab) => {
    setActiveTab(tab);
    onUpdateParams({ sort: tab === 'em-alta' ? 'popular' : 'recent', page: 1 });
  };

  const tabs: { id: CatalogTab; label: string }[] = [
    { id: 'todos', label: 'Todos os NFTs' },
    { id: 'novos', label: 'Novos lançamentos' },
    { id: 'em-alta', label: 'Em alta' },
  ];

  const sidebarTitle = 'text-[18px] font-bold leading-6';

  return (
    <div id="catalog" className="mx-auto max-w-[1200px] px-6 md:px-4 xl:px-0">
      <div className="md:flex md:items-start md:gap-12">
        {/* Sidebar */}
        <aside className="hidden w-[310px] shrink-0 md:block">
          <div className="h-[786px] bg-card px-5 pt-[17px]">
            <h3 className={sidebarTitle}>Coleções</h3>
            <ul className="mt-2 pl-3">
              {COLLECTIONS.map((c) => {
                const selected = queryParams.category === c.value;
                return (
                  <li key={c.value}>
                    <button
                      onClick={() => onUpdateParams({ category: selected ? 'all' : c.value, page: 1 })}
                      className={`flex h-10 w-full items-center justify-between pr-3 text-left text-[15px] ${
                        selected ? 'text-brand-hi' : 'text-sand hover:text-brand-hi'
                      }`}
                    >
                      <span>{c.label}</span>
                      <span>({c.count})</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <h3 className={`${sidebarTitle} mt-[35px]`}>Faixa de preço</h3>
            <div className="relative ml-3 mt-[10px] h-4 w-[258px]">
              <div className="absolute inset-x-2 top-[6px] h-1 rounded bg-ink" />
              <div
                className="absolute top-[6px] h-1 bg-brand"
                style={{
                  left: `${8 + (Math.min(Number(minPrice), SLIDER_MAX) / SLIDER_MAX) * 242}px`,
                  width: `${Math.max(0, ((Math.min(Number(maxPrice), SLIDER_MAX) - Math.min(Number(minPrice), SLIDER_MAX)) / SLIDER_MAX) * 242)}px`,
                }}
              />
              <input
                type="range"
                min={0}
                max={SLIDER_MAX}
                step={0.01}
                value={minPrice}
                aria-label="Preço mínimo"
                onChange={(e) => setMinPrice(String(Math.min(Number(e.target.value), Number(maxPrice))))}
                className="kurio-range"
              />
              <input
                type="range"
                min={0}
                max={SLIDER_MAX}
                step={0.01}
                value={maxPrice}
                aria-label="Preço máximo"
                onChange={(e) => setMaxPrice(String(Math.max(Number(e.target.value), Number(minPrice))))}
                className="kurio-range"
              />
            </div>
            <p className="ml-3 mt-[14px] text-[15px] leading-6">
              Preço: {fmt(minPrice)} - {fmt(maxPrice)} ETH
            </p>
            <button
              onClick={applyPrice}
              className="ml-3 mt-[9px] h-9 w-[92px] rounded-md bg-brand text-[16px] font-bold text-ink"
            >
              Aplicar
            </button>

            <h3 className={`${sidebarTitle} mt-[36px]`}>Rede</h3>
            <ul className="mt-2 pl-3">
              {NETWORKS.map((n) => (
                <li key={n.label} className="flex h-10 items-center justify-between pr-3 text-[15px] text-sand">
                  <span>{n.label}</span>
                  <span>({n.count})</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-[23px] h-[470px] bg-[#261910] pt-[36px]">
            <h3 className="pl-5 text-[24px] font-bold leading-8 text-brand-hi">NFT EM DESTAQUE</h3>
            <p className="mt-[6px] text-center text-[22px] font-bold leading-8">OFERTA LIMITADA</p>
            <button onClick={() => onSelectNft('sage-nomad-009')} className="relative mt-[14px] block">
              <img src={IMG_CHAPEU} alt="Sage Nomad #009" className="h-[366px] w-[310px] rounded-3xl object-cover" />
              <span className="absolute left-[130px] top-[170px] h-[14px] w-[14px] rounded-full bg-sand/70" />
            </button>
          </div>
        </aside>

        {/* Main column */}
        <main className="min-w-0 flex-1">
          <div className="flex items-start justify-between md:h-10">
            <div className="flex gap-[21px] overflow-x-auto text-[15px] leading-6 md:overflow-visible">
              {tabs.map((t) => {
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => pickTab(t.id)}
                    className={`relative h-[26px] whitespace-nowrap md:-mt-[3px] ${
                      active ? 'text-brand-hi' : 'text-cream hover:text-brand-hi'
                    }`}
                  >
                    {t.label}
                    {active && <span className="absolute inset-x-0 -bottom-[3px] h-[2px] bg-brand" />}
                  </button>
                );
              })}
            </div>
            <label className="relative -mt-[3px] hidden items-center whitespace-nowrap text-[15px] md:flex">
              Ordenar por:
              <select
                value={queryParams.sort || 'recent'}
                onChange={(e) => onUpdateParams({ sort: e.target.value as SortOption, page: 1 })}
                aria-label="Ordenar listagem"
                className="ml-[9px] w-[189px] cursor-pointer bg-transparent text-[15px] text-cream outline-none"
              >
                <option value="recent" className="bg-card">Listados recentemente</option>
                <option value="price_asc" className="bg-card">Menor preço</option>
                <option value="price_desc" className="bg-card">Maior preço</option>
                <option value="popular" className="bg-card">Mais populares</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 top-[6px] h-4 w-4" />
            </label>
          </div>

          <div className="mt-6 md:mt-[10px]">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-[34px]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <NFTSkeletonCard key={i} />
                ))}
              </div>
            ) : isError ? (
              <div className="space-y-3 bg-card p-8 text-center">
                <p className="font-bold">Falha ao carregar obras</p>
                <p className="text-[14px] text-sand">
                  {(error as any)?.response?.data?.error || 'Não foi possível carregar os dados simulados.'}
                </p>
                <button onClick={() => refetch()} className="h-10 rounded-md bg-brand px-4 text-[14px] font-bold text-ink">
                  Tentar novamente
                </button>
              </div>
            ) : nftItems.length === 0 ? (
              <div className="space-y-3 bg-card p-8 text-center">
                <p className="font-bold">Nenhum NFT encontrado</p>
                <p className="text-[14px] text-sand">Nenhuma obra corresponde aos filtros ativos.</p>
                <button onClick={onResetParams} className="h-10 rounded-md bg-brand px-4 text-[14px] font-bold text-ink">
                  Limpar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 max-md:pb-8 md:grid-cols-3 md:gap-x-[34px] md:gap-y-[66px]">
                  {nftItems.map((nft) => (
                    <div key={nft.id} className="max-md:[&:nth-child(even)]:translate-y-[30px]">
                      <NFTCard nft={nft} onSelect={onSelectNft} onToast={onToast} />
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex justify-end gap-2 md:mt-[70px]">
                  {[1, 2, 3, 4].map((p) => (
                    <button
                      key={p}
                      onClick={() => onUpdateParams({ page: p })}
                      className={`h-[35px] w-[35px] rounded text-[18px] ${
                        page === p ? 'bg-brand font-bold text-ink' : 'border border-[#3f2319] text-cream'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    aria-label="Próxima página"
                    onClick={() => onUpdateParams({ page: (page % 4) + 1 })}
                    className="flex h-[35px] w-[35px] items-center justify-center rounded bg-[#3f2319] text-cream"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Promo banners */}
      <div className="mt-24 hidden grid-cols-2 gap-7 md:grid">
        {[
          { img: IMG_FONE, title: ['Lançamentos gênesis', 'de edição limitada'], text: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.', id: 'emerald-ape-042' },
          { img: IMG_TERNO, title: ['Arte digital selecionada', 'e muito mais'], text: 'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.', id: 'neon-vessel-552' },
        ].map((b) => (
          <div key={b.id} className="relative flex h-[250px] overflow-hidden rounded-lg bg-card">
            <img src={b.img} alt={b.title.join(' ')} className="h-[250px] w-[287px] shrink-0 rounded-2xl object-cover" />
            <div className="flex-1 pl-2 pr-[30px] pt-[44px] text-right">
              <h3 className="text-[18px] font-bold leading-6">
                {b.title[0]}
                <br />
                {b.title[1]}
              </h3>
              <p className="mt-[16px] text-[14px] leading-6 text-sand">{b.text}</p>
            </div>
            <button
              onClick={() => onSelectNft(b.id)}
              className="absolute bottom-[46px] right-[30px] flex h-10 w-[140px] items-center justify-center gap-2 rounded-md bg-brand text-[14px] font-bold text-ink"
            >
              Explorar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Diário da Cunhagem */}
      <section id="aprenda" className="hidden md:block">
        <h2 className="mt-[97px] text-center text-[28px] font-bold leading-9">Diário da Cunhagem</h2>
        <p className="mx-auto mt-[11px] text-center text-[14px] leading-6 text-sand">
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
        <div className="mt-[37px] grid grid-cols-4 gap-6 xl:grid-cols-[repeat(4,268px)]">
          {ARTICLES.map((a) => (
            <article key={a.title} className="h-[369px] overflow-hidden rounded-lg bg-card">
              <img src={a.img} alt="" className="h-[195px] w-full object-cover" />
              <div className="px-4 pt-[13px]">
                <p className="text-[12px] leading-4 text-sand">{a.meta}</p>
                <h3 className="mt-[10px] text-[16px] font-bold leading-[21px]">{a.title}</h3>
                <p className="mt-[9px] text-[12px] leading-4 text-sand">{a.text}</p>
                <button
                  onClick={() => onToast({ type: 'info', title: 'Artigo', description: a.title })}
                  className="mt-[10px] text-[12px] font-bold text-brand"
                >
                  Ler mais →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
