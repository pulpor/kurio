import { NFT, User, Order, CartItem, NetworkSimulationConfig } from '../types';

const STORAGE_KEY = 'kurio_mock_db_v2';
const SIMULATION_KEY = 'kurio_sim_config_v2';

export const INITIAL_NFTS: NFT[] = [
  {
    id: 'emerald-ape-042',
    title: 'Emerald Ape #042',
    description: 'Um colecionável digital 1/50 finalizado à mão da coleção Kurio Editions, verificado na Ethereum, com arte desbloqueável e acesso para colecionadores.',
    image: '/src/assets/images/nft_cyber_valkyrie_1794341377253.jpg',
    creator: {
      id: 'creator-nova-sato',
      name: 'Nova Sato',
      username: 'novasato',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      verified: true,
    },
    priceEth: '1.19',
    priceUsd: 3808,
    edition: { current: 1, total: 50 },
    availableEditions: ['1/1', '1/10', '1/50', 'ABERTA'],
    selectedEdition: '1/50',
    availableCount: 49,
    category: 'arte-digital',
    collectionName: 'Kurio Apes',
    status: 'buy_now',
    traits: [
      { trait_type: 'Acessório', value: 'Óculos' },
      { trait_type: 'Material', value: 'Esmeralda' },
      { trait_type: 'Raridade', value: 'Raro' },
    ],
    contractAddress: '0x7A42...19E8',
    tokenId: '0042',
    blockchain: 'Ethereum',
    rating: {
      score: 4.8,
      reviewsCount: 19,
    },
    createdAt: '2026-10-14T10:00:00Z',
    version: 1,
    viewsCount: 3420,
    likesCount: 142,
  },
  {
    id: 'sage-nomad-009',
    title: 'Sage Nomad #009',
    description: 'Nômade digital das dunas etéreas da coleção Kurio Editions, com chapéu de expedicionário e manto índigo.',
    image: '/src/assets/images/nft_ethereal_chronos_1794341378030.jpg',
    creator: {
      id: 'creator-nova-sato',
      name: 'Nova Sato',
      username: 'novasato',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      verified: true,
    },
    priceEth: '1.69',
    priceUsd: 5408,
    edition: { current: 9, total: 50 },
    availableEditions: ['1/1', '1/10', '1/50', 'ABERTA'],
    selectedEdition: '1/50',
    availableCount: 41,
    category: 'arte-digital',
    collectionName: 'Kurio Apes',
    status: 'buy_now',
    traits: [
      { trait_type: 'Chapéu', value: 'Expedição Sage' },
      { trait_type: 'Vestimenta', value: 'Manto Índigo' },
    ],
    contractAddress: '0x7A42...19E8',
    tokenId: '0009',
    blockchain: 'Ethereum',
    rating: {
      score: 4.9,
      reviewsCount: 14,
    },
    createdAt: '2026-10-18T14:30:00Z',
    version: 1,
    viewsCount: 2890,
    likesCount: 118,
  },
  {
    id: 'neon-vessel-552',
    title: 'Neon Vessel #552',
    description: 'Entidade cibernética com jaqueta bomber verde esmeralda e medalhão de jade puro.',
    image: '/src/assets/images/nft_quantum_samurai_1794341379021.jpg',
    creator: {
      id: 'creator-nova-sato',
      name: 'Nova Sato',
      username: 'novasato',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      verified: true,
    },
    priceEth: '1.99',
    originalPriceEth: '2.29 ETH',
    priceUsd: 6368,
    edition: { current: 52, total: 100 },
    availableEditions: ['1/1', '1/10', '1/50', 'ABERTA'],
    selectedEdition: '1/50',
    availableCount: 48,
    category: 'arte-digital',
    collectionName: 'Kurio Apes',
    status: 'buy_now',
    rarityBadge: 'RARO',
    traits: [
      { trait_type: 'Classe', value: 'Vessel Raro' },
      { trait_type: 'Jaqueta', value: 'Bomber Esmeralda' },
    ],
    contractAddress: '0x7A42...19E8',
    tokenId: '0552',
    blockchain: 'Ethereum',
    rating: {
      score: 5.0,
      reviewsCount: 31,
    },
    createdAt: '2026-10-22T08:15:00Z',
    version: 1,
    viewsCount: 4520,
    likesCount: 265,
  },
  {
    id: 'cosmic-bloom-118',
    title: 'Cosmic Bloom #118',
    description: 'Exploração espacial com paleta violeta e capacete de voo interestelar.',
    image: '/src/assets/images/nft_sol_solarium_1794341379684.jpg',
    creator: {
      id: 'creator-nova-sato',
      name: 'Nova Sato',
      username: 'novasato',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      verified: true,
    },
    priceEth: '1.29',
    priceUsd: 4128,
    edition: { current: 18, total: 50 },
    availableEditions: ['1/1', '1/10', '1/50', 'ABERTA'],
    selectedEdition: '1/50',
    availableCount: 32,
    category: 'colecionaveis',
    collectionName: 'Kurio Apes',
    status: 'buy_now',
    traits: [
      { trait_type: 'Capacete', value: 'Bloom Bucket' },
      { trait_type: 'Moletom', value: 'Lavanda' },
    ],
    contractAddress: '0x7A42...19E8',
    tokenId: '0118',
    blockchain: 'Polygon',
    rating: {
      score: 4.7,
      reviewsCount: 22,
    },
    createdAt: '2026-10-25T11:45:00Z',
    version: 1,
    viewsCount: 1980,
    likesCount: 89,
  },
  {
    id: 'violet-nomad-314',
    title: 'Violet Nomad #314',
    description: 'Viajante sônico equipado com fones hi-fi dourados e expressão serena.',
    image: '/src/assets/images/nft_cyber_valkyrie_1794341377253.jpg',
    creator: {
      id: 'creator-nova-sato',
      name: 'Nova Sato',
      username: 'novasato',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      verified: true,
    },
    priceEth: '1.39',
    priceUsd: 4448,
    edition: { current: 14, total: 50 },
    availableEditions: ['1/1', '1/10', '1/50', 'ABERTA'],
    selectedEdition: '1/50',
    availableCount: 36,
    category: 'musica',
    collectionName: 'Kurio Apes',
    status: 'buy_now',
    traits: [
      { trait_type: 'Áudio', value: 'Fones Dourados' },
      { trait_type: 'Tom de Pele', value: 'Âmbar Dourado' },
    ],
    contractAddress: '0x7A42...19E8',
    tokenId: '0314',
    blockchain: 'Ethereum',
    rating: {
      score: 4.8,
      reviewsCount: 17,
    },
    createdAt: '2026-10-28T09:20:00Z',
    version: 1,
    viewsCount: 2450,
    likesCount: 133,
  },
  {
    id: 'ivory-baron-088',
    title: 'Ivory Baron #088',
    description: 'Patriarca de marfim com terno de alfaiataria em linho cru e olhar contemplativo.',
    image: '/src/assets/images/nft_quantum_samurai_1794341379021.jpg',
    creator: {
      id: 'creator-nova-sato',
      name: 'Nova Sato',
      username: 'novasato',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      verified: true,
    },
    priceEth: '1.79',
    priceUsd: 5728,
    edition: { current: 88, total: 100 },
    availableEditions: ['1/1', '1/10', '1/50', 'ABERTA'],
    selectedEdition: '1/50',
    availableCount: 12,
    category: 'arte-digital',
    collectionName: 'Kurio Apes',
    status: 'buy_now',
    traits: [
      { trait_type: 'Vestuário', value: 'Terno Linho Cru' },
      { trait_type: 'Status', value: 'Baron Elite' },
    ],
    contractAddress: '0x7A42...19E8',
    tokenId: '0088',
    blockchain: 'Ethereum',
    rating: {
      score: 4.9,
      reviewsCount: 28,
    },
    createdAt: '2026-10-30T20:10:00Z',
    version: 1,
    viewsCount: 3100,
    likesCount: 185,
  },
  {
    id: 'golden-beat-207',
    title: 'Golden Beat #207',
    description: 'Edição limitada em ouro reluzente com headphones profissionais e sorriso icônico.',
    image: '/src/assets/images/nft_sol_solarium_1794341379684.jpg',
    creator: {
      id: 'creator-nova-sato',
      name: 'Nova Sato',
      username: 'novasato',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      verified: true,
    },
    priceEth: '0.99',
    priceUsd: 3168,
    edition: { current: 7, total: 50 },
    availableEditions: ['1/1', '1/10', '1/50', 'ABERTA'],
    selectedEdition: '1/50',
    availableCount: 43,
    category: 'musica',
    collectionName: 'Kurio Apes',
    status: 'buy_now',
    traits: [
      { trait_type: 'Aparência', value: 'Dourado Radiante' },
      { trait_type: 'Equipamento', value: 'Headphones Pro' },
    ],
    contractAddress: '0x7A42...19E8',
    tokenId: '0207',
    blockchain: 'Solana',
    rating: {
      score: 4.6,
      reviewsCount: 12,
    },
    createdAt: '2026-11-01T12:00:00Z',
    version: 1,
    viewsCount: 1670,
    likesCount: 78,
  },
  {
    id: 'golden-signal-160',
    title: 'Golden Signal #160',
    description: 'Sinal luminoso dourado captado nos limites do metaverso com jaqueta de piloto.',
    image: '/src/assets/images/nft_ethereal_chronos_1794341378030.jpg',
    creator: {
      id: 'creator-nova-sato',
      name: 'Nova Sato',
      username: 'novasato',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      verified: true,
    },
    priceEth: '0.39',
    priceUsd: 1248,
    edition: { current: 60, total: 100 },
    availableEditions: ['1/1', '1/10', '1/50', 'ABERTA'],
    selectedEdition: '1/50',
    availableCount: 40,
    category: 'arte-3d',
    collectionName: 'Kurio Apes',
    status: 'buy_now',
    traits: [
      { trait_type: 'Jaqueta', value: 'Piloto Vintage' },
      { trait_type: 'Frequência', value: 'Signal 160' },
    ],
    contractAddress: '0x7A42...19E8',
    tokenId: '0160',
    blockchain: 'Ethereum',
    rating: {
      score: 4.8,
      reviewsCount: 9,
    },
    createdAt: '2026-11-02T15:00:00Z',
    version: 1,
    viewsCount: 1210,
    likesCount: 65,
  },
  {
    id: 'golden-frequency-071',
    title: 'Golden Frequency #071',
    description: 'Frequência sonora dourada de transição tonal com bucket hat cinza azulado.',
    image: '/src/assets/images/nft_cyber_valkyrie_1794341377253.jpg',
    creator: {
      id: 'creator-nova-sato',
      name: 'Nova Sato',
      username: 'novasato',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      verified: true,
    },
    priceEth: '0.59',
    priceUsd: 1888,
    edition: { current: 21, total: 50 },
    availableEditions: ['1/1', '1/10', '1/50', 'ABERTA'],
    selectedEdition: '1/50',
    availableCount: 29,
    category: 'musica',
    collectionName: 'Kurio Apes',
    status: 'buy_now',
    traits: [
      { trait_type: 'Bucket Hat', value: 'Cinza Azulado' },
      { trait_type: 'Frequência', value: '071 Hz' },
    ],
    contractAddress: '0x7A42...19E8',
    tokenId: '0071',
    blockchain: 'Ethereum',
    rating: {
      score: 4.7,
      reviewsCount: 11,
    },
    createdAt: '2026-11-03T18:00:00Z',
    version: 1,
    viewsCount: 1450,
    likesCount: 82,
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-nova',
    name: 'Nova Sato',
    displayName: 'Nova Sato',
    profileName: 'Nova Sato Collector',
    username: 'novasato',
    email: 'contato@email.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    bio: 'Colecionador e artista residente na Kurio Editions.',
    ensName: 'nova.kurio.eth',
    wallets: [
      {
        id: 'w-1',
        address: '0xA91F4a82C981249817294819284102948201E82C',
        label: 'Principal',
        network: 'Ethereum',
        isPrimary: true,
        isSecondary: false,
        balanceEth: '28.450',
        walletType: 'MetaMask',
      },
      {
        id: 'w-2',
        address: '0x3aB918940C182740261981628192837194819A12',
        label: 'Reserva',
        network: 'Polygon',
        isPrimary: false,
        isSecondary: true,
        balanceEth: '14.200',
        walletType: 'Coinbase',
      },
    ],
    favorites: ['emerald-ape-042', 'sage-nomad-009'],
  },
  {
    id: 'user-alex',
    name: 'Alex Rivera',
    displayName: 'Alex Rivera',
    profileName: 'Alex Crypto',
    username: 'arivera_crypto',
    email: 'alex.collector@crypto.art',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    bio: 'Colecionador de NFTs na Kurio.',
    ensName: 'alex.eth',
    wallets: [
      {
        id: 'w-3',
        address: '0x71C84013233519890f6b3e7123984594A9fA1B90',
        label: 'MetaMask Vault',
        network: 'Ethereum',
        isPrimary: true,
        isSecondary: false,
        balanceEth: '15.800',
        walletType: 'MetaMask',
      },
    ],
    favorites: ['neon-vessel-552'],
  },
];

export interface MockDatabaseState {
  nfts: NFT[];
  users: User[];
  currentUserId: string | null;
  cartByUserId: Record<string, CartItem[]>;
  appliedCouponByUserId: Record<string, string | null>;
  orders: Order[];
  idempotentOrders: Record<string, Order>;
}

export function loadDatabase(): MockDatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse localStorage db:', e);
  }

  // Pre-seed cart matching the Figma Page 3 & 4:
  // Emerald Ape #042 (qty 2) @ 1.19 = 2.38 ETH
  // Violet Nomad #314 (qty 6) @ 1.39 = 8.34 ETH
  // Ivory Baron #088 (qty 9) @ 1.79 = 16.11 ETH
  // Subtotal = 26.83 ETH, Gas Fee = 0.016 ETH, Total = 26.846 ETH
  const initialCart: CartItem[] = [
    {
      nftId: 'emerald-ape-042',
      nft: INITIAL_NFTS[0],
      quantity: 2,
      selectedEditionNumber: 2,
      priceSnapshotEth: '1.19',
    },
    {
      nftId: 'violet-nomad-314',
      nft: INITIAL_NFTS[4],
      quantity: 6,
      selectedEditionNumber: 6,
      priceSnapshotEth: '1.39',
    },
    {
      nftId: 'ivory-baron-088',
      nft: INITIAL_NFTS[5],
      quantity: 9,
      selectedEditionNumber: 9,
      priceSnapshotEth: '1.79',
    },
  ];

  const initial: MockDatabaseState = {
    nfts: INITIAL_NFTS,
    users: INITIAL_USERS,
    currentUserId: 'user-nova', // Default logged-in user from Figma
    cartByUserId: {
      'user-nova': initialCart,
      'user-alex': [],
      guest: [],
    },
    appliedCouponByUserId: {
      'user-nova': null,
      'user-alex': null,
      guest: null,
    },
    orders: [
      {
        id: 'ord-290726',
        transactionHash: '0xA91F384B91240182C981249817294819284102948201E82C',
        createdAt: '2026-07-29T14:32:00Z',
        items: [
          {
            nftId: 'emerald-ape-042',
            title: 'Emerald Ape #042',
            image: '/src/assets/images/nft_cyber_valkyrie_1794341377253.jpg',
            quantity: 2,
            unitPriceEth: '1.19',
            totalEth: '2.38',
            tokenId: '#0042',
          },
          {
            nftId: 'violet-nomad-314',
            title: 'Violet Nomad #314',
            image: '/src/assets/images/nft_cyber_valkyrie_1794341377253.jpg',
            quantity: 6,
            unitPriceEth: '1.39',
            totalEth: '8.34',
            tokenId: '#0314',
          },
          {
            nftId: 'ivory-baron-088',
            title: 'Ivory Baron #088',
            image: '/src/assets/images/nft_quantum_samurai_1794341379021.jpg',
            quantity: 9,
            unitPriceEth: '1.79',
            totalEth: '16.11',
            tokenId: '#0088',
          },
        ],
        subtotalEth: '26.830',
        discountEth: '0.000',
        gasFeeEth: '0.016',
        totalEth: '26.846',
        totalUsd: 85907,
        walletAddress: '0xA91F…E82C',
        network: 'Ethereum',
        status: 'confirmed',
        idempotencyKey: 'figma-seed-order-26846',
        version: 1,
        walletProvider: 'MetaMask',
      },
    ],
    idempotentOrders: {},
  };

  saveDatabase(initial);
  return initial;
}

export function saveDatabase(db: MockDatabaseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function resetDatabase(): MockDatabaseState {
  localStorage.removeItem(STORAGE_KEY);
  return loadDatabase();
}

export function loadSimulationConfig(): NetworkSimulationConfig {
  try {
    const raw = localStorage.getItem(SIMULATION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return {
    latencyMs: 100,
    forcedErrorStatus: null,
    networkOffline: false,
    simulateOrderTimeout: false,
  };
}

export function saveSimulationConfig(cfg: NetworkSimulationConfig): void {
  localStorage.setItem(SIMULATION_KEY, JSON.stringify(cfg));
}
