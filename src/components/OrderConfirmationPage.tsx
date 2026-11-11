import React from 'react';
import {
  X,
  Mail,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useOrderDetail } from '../hooks/useOrders';
import { Skeleton } from './ui/Skeleton';

interface OrderConfirmationPageProps {
  orderId: string;
  onGoToMarketplace: () => void;
  onGoToProfile: () => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function OrderConfirmationPage({
  orderId,
  onGoToMarketplace,
  onGoToProfile,
  onToast,
}: OrderConfirmationPageProps) {
  const { data: order, isLoading } = useOrderDetail(orderId);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 space-y-6 bg-[#0D0B08]">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const items = order?.items || [
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
  ];

  return (
    <div className="bg-[#0D0B08] text-[#FFF8F0] min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      
      {/* Modal Card matching Figma Page 5 exact */}
      <div className="relative w-full max-w-xl bg-[#161310] border border-[#2C241D] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
        
        {/* Close Button top right */}
        <button
          onClick={onGoToMarketplace}
          aria-label="Fechar"
          className="absolute top-5 right-5 text-[#A89A8A] hover:text-[#FFF8F0] p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Envelope Icon with THANK YOU seal matching Figma */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-14 h-14 mx-auto rounded-xl bg-[#D98A48]/15 border border-[#D98A48] flex flex-col items-center justify-center text-[#D98A48] shadow-lg shadow-[#D98A48]/10">
            <Mail className="w-6 h-6 mb-0.5" />
            <span className="text-[7px] font-mono font-black tracking-widest leading-none">THANK YOU</span>
          </div>

          <h1 className="text-lg sm:text-xl font-bold text-[#FFF8F0] tracking-tight">
            Seus NFTs agora estão na sua carteira
          </h1>
        </div>

        {/* Meta Bar Strip matching Figma Page 5 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#0D0B08] border border-[#2C241D] text-[11px]">
          <div>
            <span className="text-[#A89A8A] block">ID da transação</span>
            <span className="font-mono font-bold text-[#FFF8F0] truncate block">
              {order?.transactionHash ? `${order.transactionHash.slice(0, 6)}…${order.transactionHash.slice(-4)}` : '0xA91F…E82C'}
            </span>
          </div>
          <div>
            <span className="text-[#A89A8A] block">Data</span>
            <span className="font-mono text-[#FFF8F0]">
              {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '29 Jul, 2026'}
            </span>
          </div>
          <div>
            <span className="text-[#A89A8A] block">Total</span>
            <span className="font-mono font-bold text-[#D98A48]">
              {order?.totalEth || '26.846'} ETH
            </span>
          </div>
          <div>
            <span className="text-[#A89A8A] block">Carteira</span>
            <span className="font-semibold text-[#FFF8F0]">
              {order?.walletProvider || 'MetaMask'}
            </span>
          </div>
        </div>

        {/* Detalhes da transação matching Figma */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-bold text-[#A89A8A] uppercase tracking-wider">
            Detalhes da transação
          </h2>

          <div className="flex items-center justify-between text-[11px] font-bold text-[#6E6255] uppercase border-b border-[#2C241D] pb-1.5">
            <span>NFTs</span>
            <span>Edições</span>
            <span>Subtotal</span>
          </div>

          <div className="divide-y divide-[#2C241D] text-xs">
            {items.map((it, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={it.image}
                    alt={it.title}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-md object-cover bg-[#0D0B08] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-[#FFF8F0] truncate">{it.title}</p>
                    <p className="text-[10px] text-[#A89A8A] font-mono">
                      ID do token: #{it.tokenId?.replace('#', '') || '0042'}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-[#A89A8A]">(x {it.quantity})</span>

                <span className="font-mono font-bold text-[#FFF8F0] tabular-nums">
                  {it.totalEth} ETH
                </span>
              </div>
            ))}
          </div>

          {/* Taxa de rede & Total */}
          <div className="pt-3 border-t border-[#2C241D] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#A89A8A]">
              <span>Taxa de rede</span>
              <span className="font-mono tabular-nums">{order?.gasFeeEth || '0.016'} ETH</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#FFF8F0] pt-1">
              <span>Total</span>
              <span className="font-mono text-[#D98A48] tabular-nums">{order?.totalEth || '26.846'} ETH</span>
            </div>
          </div>
        </div>

        {/* Confirmation note text */}
        <p className="text-[11px] text-[#A89A8A] leading-relaxed pt-2">
          Transação confirmada na Ethereum. A propriedade foi transferida para sua carteira conectada e registrada na rede.
        </p>

        {/* Ver no Etherscan Button matching Figma Page 5 */}
        <div className="pt-2">
          <button
            onClick={() => {
              window.open(`https://etherscan.io/tx/${order?.transactionHash || '0xA91F4a82C981249817294819284102948201E82C'}`, '_blank');
              onToast({ type: 'info', title: 'Explorador', description: 'Abrindo visualização na Etherscan.' });
            }}
            className="w-full py-3 bg-[#D98A48] hover:bg-[#E59550] text-[#0D0B08] font-bold text-xs uppercase tracking-wider rounded-md transition-colors shadow-lg shadow-[#D98A48]/20"
          >
            Ver no Etherscan
          </button>
        </div>

      </div>

    </div>
  );
}
