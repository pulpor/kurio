import React from 'react';
import { X, Mail } from 'lucide-react';
import { useOrderDetail } from '../hooks/useOrders';
import { Skeleton } from './ui/Skeleton';
import { IMG_OCULOS, IMG_CHAPEU, IMG_TERNO } from '../assets/images';

interface OrderConfirmationPageProps {
  orderId: string;
  onGoToMarketplace: () => void;
  onGoToProfile: () => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

const FALLBACK_ITEMS = [
  { nftId: 'emerald-ape-042', title: 'Emerald Ape #042', image: IMG_OCULOS, quantity: 2, unitPriceEth: '1.19', totalEth: '2.38', tokenId: '#0042' },
  { nftId: 'violet-nomad-314', title: 'Violet Nomad #314', image: IMG_CHAPEU, quantity: 6, unitPriceEth: '1.39', totalEth: '8.34', tokenId: '#0314' },
  { nftId: 'ivory-baron-088', title: 'Ivory Baron #088', image: IMG_TERNO, quantity: 9, unitPriceEth: '1.79', totalEth: '16.11', tokenId: '#0088' },
];

export function OrderConfirmationPage({ orderId, onGoToMarketplace, onGoToProfile }: OrderConfirmationPageProps) {
  const { data: order, isLoading } = useOrderDetail(orderId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[578px] px-4 py-24">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const items = order?.items || FALLBACK_ITEMS;
  const hash = order?.transactionHash ? `${order.transactionHash.slice(0, 6)}…${order.transactionHash.slice(-4)}` : '0xA91F…E82C';
  const date = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')
    : '29 Jul, 2026';
  const total = order?.totalEth || '26.846';

  const cells = [
    ['ID da transação', hash],
    ['Data', date],
    ['Total', `${total} ETH`],
    ['Carteira', order?.walletProvider || 'MetaMask'],
  ];

  return (
    <div className="px-4 pb-16 pt-6 md:pt-[98px]">
      <div className="relative mx-auto w-full max-w-[578px] bg-card pb-[58px] pt-[22px] md:mx-auto">
        <div className="absolute inset-x-0 bottom-0 h-[10px] bg-brand" />
        <button
          onClick={onGoToMarketplace}
          aria-label="Fechar"
          className="absolute right-[23px] top-[25px] text-brand"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <div className="mx-auto flex h-20 w-[66px] flex-col items-center justify-center text-brand">
          <Mail className="h-14 w-14" strokeWidth={1} />
        </div>
        <h1 className="mt-[15px] text-center text-[16px] font-bold leading-5 text-sand">Seus NFTs agora estão na sua carteira</h1>

        <div className="mt-[19px] grid h-[66px] grid-cols-4 divide-x divide-brand/50 border-y border-brand/50 text-[14px] leading-5 text-sand">
          {cells.map(([label, value], i) => (
            <div key={label} className="flex min-w-0 flex-col items-center justify-center px-1 text-center">
              <span className={i === 0 || i === 3 ? 'font-bold' : ''}>{label}</span>
              <span className="max-w-full truncate">{value}</span>
            </div>
          ))}
        </div>

        <div className="px-4 md:px-[44px]">
          <h2 className="mt-[18px] text-[14px] font-bold leading-[22px]">Detalhes da transação</h2>
          <div className="relative mt-[1px] flex h-[35px] items-center border-b border-brand/40 text-[16px] font-bold">
            <span>NFTs</span>
            <span className="absolute left-1/2 -translate-x-1/2">Edições</span>
            <span className="ml-auto">Subtotal</span>
          </div>

          <div className="mt-[13px] space-y-[14px]">
            {items.map((it, idx) => (
              <div key={idx} className="relative flex h-[70px] items-center">
                <img src={it.image} alt={it.title} className="h-[70px] w-[70px] rounded-md object-cover" />
                <div className="ml-[16px] min-w-0">
                  <p className="truncate text-[16px] font-bold leading-6">{it.title}</p>
                  <p className="text-[13px] leading-5 text-sand">ID do token: #{it.tokenId?.replace('#', '') || '0042'}</p>
                </div>
                <span className="absolute left-1/2 -translate-x-1/2 text-[14px] text-sand">(x {it.quantity})</span>
                <span className="ml-auto pr-3 text-[18px] font-bold text-brand">{it.totalEth} ETH</span>
              </div>
            ))}
          </div>

          <div className="mt-[2px] flex justify-between pl-[40%] text-[14px] leading-[22px] text-sand">
            <span>Taxa de rede</span>
            <span>{order?.gasFeeEth || '0.016'} ETH</span>
          </div>
          <div className="mt-[8px] flex h-[35px] justify-between border-b border-brand/40 pl-[40%] text-[16px] font-bold leading-[22px]">
            <span>Total</span>
            <span>{total} ETH</span>
          </div>

          <p className="mx-auto mt-3 max-w-[460px] text-center text-[14px] leading-[22px] text-sand">
            Transação confirmada na Ethereum. A propriedade foi transferida para sua carteira conectada e registrada na rede.
          </p>
          <button
            onClick={onGoToProfile}
            className="mx-auto mt-5 block h-12 w-[186px] rounded-md bg-brand text-[16px] font-bold text-ink"
          >
            Ver no Etherscan
          </button>
        </div>
      </div>
    </div>
  );
}
