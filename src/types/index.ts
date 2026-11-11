export type Category =
  | 'all'
  | 'arte-digital'
  | 'fotografia'
  | 'musica'
  | 'arte-3d'
  | 'colecionaveis'
  | 'generativa'
  | 'jogos'
  | 'assinaturas'
  | 'utilidade';

export type CatalogTab = 'todos' | 'novos' | 'em-alta';
export type SaleStatus = 'all' | 'buy_now' | 'auction';
export type SortOption = 'recent' | 'price_asc' | 'price_desc' | 'popular';
export type BlockchainNetwork = 'Ethereum' | 'Polygon' | 'Solana' | 'Arbitrum' | 'Optimism';

export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
}

export interface NFTTrait {
  trait_type: string;
  value: string;
  rarity_percentage?: number;
}

export interface NFT {
  id: string;
  title: string;
  description: string;
  image: string;
  creator: Creator;
  priceEth: string; // Decimal string e.g. "1.19"
  originalPriceEth?: string; // For discounts (e.g. "2.29 ETH" strike-through)
  priceUsd: number;
  edition: {
    current: number;
    total: number;
  };
  availableEditions?: string[]; // e.g. ['1/1', '1/10', '1/50', 'ABERTA']
  selectedEdition?: string;
  availableCount: number;
  category: Category;
  collectionName?: string;
  status: 'buy_now' | 'auction';
  traits: NFTTrait[];
  contractAddress: string;
  tokenId: string;
  blockchain: BlockchainNetwork;
  rarityBadge?: string; // e.g. "RARO"
  rating?: {
    score: number;
    reviewsCount: number;
  };
  isFavorited?: boolean;
  createdAt: string;
  version: number;
  viewsCount?: number;
  likesCount?: number;
}

export interface CartItem {
  nftId: string;
  nft: NFT;
  quantity: number;
  selectedEditionNumber: number;
  priceSnapshotEth: string;
}

export interface CartQuote {
  items: CartItem[];
  subtotalEth: string;
  discountEth: string;
  gasFeeEth: string;
  totalEth: string;
  totalUsd: number;
  couponCode?: string;
  couponValid?: boolean;
  couponDiscountPercent?: number;
  priceChangesDetected?: boolean;
  message?: string;
}

export interface Wallet {
  id: string;
  address: string;
  label: string;
  network: BlockchainNetwork;
  isPrimary: boolean;
  isSecondary: boolean;
  balanceEth: string;
  walletType?: 'MetaMask' | 'WalletConnect' | 'Coinbase' | string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  wallets: Wallet[];
  favorites: string[];
  displayName?: string;
  profileName?: string;
  ensName?: string;
  referralCode?: string;
}

export interface OrderItem {
  nftId: string;
  title: string;
  image: string;
  quantity: number;
  unitPriceEth: string;
  totalEth: string;
  tokenId?: string;
}

export interface Order {
  id: string;
  transactionHash: string;
  createdAt: string;
  items: OrderItem[];
  subtotalEth: string;
  discountEth: string;
  gasFeeEth: string;
  totalEth: string;
  totalUsd: number;
  walletAddress: string;
  network: BlockchainNetwork;
  status: 'pending' | 'confirmed' | 'failed';
  idempotencyKey: string;
  version: number;
  failureReason?: string;
  collectorName?: string;
  walletProvider?: string;
}

export interface NFTUpdatedEvent {
  nftId: string;
  priceEth: string;
  priceUsd: number;
  availableCount: number;
  version: number;
  timestamp: string;
}

export interface OrderUpdatedEvent {
  orderId: string;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
  version: number;
  timestamp: string;
}

export interface NetworkSimulationConfig {
  latencyMs: number;
  forcedErrorStatus: number | null;
  networkOffline: boolean;
  simulateOrderTimeout: boolean;
}
