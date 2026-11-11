import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { CatalogSection } from './components/CatalogSection';
import { NFTDetailPage } from './components/NFTDetailPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderConfirmationPage } from './components/OrderConfirmationPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { ProfilePage } from './components/ProfilePage';
import { WalletsPage } from './components/WalletsPage';
import { SimulationBar } from './components/SimulationBar';
import { AuthModal } from './components/AuthModal';
import { ToastContainer, ToastMessage } from './components/ui/Toast';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { INITIAL_NFTS } from './mocks/db';
import { Category, SaleStatus, SortOption } from './types';
import { NFTQueryParams } from './hooks/useNFTs';

function MarketplaceApp() {
  // Current URL path and query parser
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    () => new URLSearchParams(window.location.search)
  );

  // Simulation Drawer state
  const [simulationOpen, setSimulationOpen] = useState<boolean>(false);

  // Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Global Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Socket.IO Real-time synchronization
  const { recentAlert, dismissAlert } = useRealtimeSync();

  const addToast = useCallback(
    (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Listen to popstate (browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Listen to 401 session expiration from Axios
  useEffect(() => {
    const handleSessionExpired = () => {
      addToast({
        type: 'error',
        title: 'Sessão Expirada',
        description: 'Sua autenticação expirou. Faça login novamente para continuar.',
      });
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    };

    window.addEventListener('aetheria:session_expired', handleSessionExpired);
    return () => window.removeEventListener('aetheria:session_expired', handleSessionExpired);
  }, [addToast, currentPath]);

  // Show toast when real-time alert fires from Socket.IO
  useEffect(() => {
    if (recentAlert) {
      addToast({
        type: 'info',
        title: 'Alerta em Tempo Real (Socket.IO)',
        description: recentAlert.message,
      });
      dismissAlert();
    }
  }, [recentAlert, addToast, dismissAlert]);

  // Navigation helper
  const navigate = useCallback((pathWithQuery: string) => {
    const [pathPart, queryPart] = pathWithQuery.split('?');
    const newParams = new URLSearchParams(queryPart || '');

    window.history.pushState({}, '', pathWithQuery);
    setCurrentPath(pathPart || '/');
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Catalog search & filter parameters synced to URL search parameters
  const catalogQueryParams: NFTQueryParams = useMemo(() => {
    return {
      q: searchParams.get('q') || undefined,
      category: (searchParams.get('category') as Category) || 'all',
      status: (searchParams.get('status') as SaleStatus) || 'all',
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      sort: (searchParams.get('sort') as SortOption) || 'recent',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: 6,
    };
  }, [searchParams]);

  const updateCatalogParams = useCallback(
    (newParams: Partial<NFTQueryParams>) => {
      const updated = new URLSearchParams(searchParams);

      if (newParams.q !== undefined) {
        if (newParams.q) updated.set('q', newParams.q);
        else updated.delete('q');
      }

      if (newParams.category !== undefined) {
        if (newParams.category && newParams.category !== 'all') {
          updated.set('category', newParams.category);
        } else {
          updated.delete('category');
        }
      }

      if (newParams.status !== undefined) {
        if (newParams.status && newParams.status !== 'all') {
          updated.set('status', newParams.status);
        } else {
          updated.delete('status');
        }
      }

      if (newParams.minPrice !== undefined) {
        if (newParams.minPrice) updated.set('minPrice', newParams.minPrice);
        else updated.delete('minPrice');
      }

      if (newParams.maxPrice !== undefined) {
        if (newParams.maxPrice) updated.set('maxPrice', newParams.maxPrice);
        else updated.delete('maxPrice');
      }

      if (newParams.sort !== undefined) {
        if (newParams.sort && newParams.sort !== 'recent') {
          updated.set('sort', newParams.sort);
        } else {
          updated.delete('sort');
        }
      }

      if (newParams.page !== undefined) {
        if (newParams.page > 1) updated.set('page', newParams.page.toString());
        else updated.delete('page');
      }

      const queryString = updated.toString();
      const newUrl = queryString ? `/?${queryString}` : '/';
      window.history.pushState({}, '', newUrl);
      setCurrentPath('/');
      setSearchParams(updated);
    },
    [searchParams]
  );

  const resetCatalogParams = useCallback(() => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
    setSearchParams(new URLSearchParams());
  }, []);

  // Determine current active view based on path
  const renderView = () => {
    // 1. Home / Catalog
    if (currentPath === '/' || currentPath === '') {
      const featured = INITIAL_NFTS[0];
      return (
        <main>
          <HeroSection
            featuredNft={featured}
            onSelectNft={(id) => navigate(`/nft/${id}`)}
            onNavigateToCatalog={() => {
              const el = document.getElementById('catalog');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
          <CatalogSection
            queryParams={catalogQueryParams}
            onUpdateParams={updateCatalogParams}
            onResetParams={resetCatalogParams}
            onSelectNft={(id) => navigate(`/nft/${id}`)}
            onToast={addToast}
          />
        </main>
      );
    }

    // 2. NFT Detail: /nft/:id
    if (currentPath.startsWith('/nft/')) {
      const nftId = currentPath.replace('/nft/', '');
      return (
        <main>
          <NFTDetailPage
            nftId={nftId}
            onSelectNft={(id) => navigate(`/nft/${id}`)}
            onBack={() => navigate('/')}
            onGoToCheckout={() => navigate('/checkout')}
            onToast={addToast}
          />
        </main>
      );
    }

    // 3. Cart: /cart
    if (currentPath === '/cart') {
      return (
        <main>
          <CartPage
            onSelectNft={(id) => navigate(`/nft/${id}`)}
            onGoToCheckout={() => navigate('/checkout')}
            onContinueShopping={() => navigate('/')}
            onToast={addToast}
          />
        </main>
      );
    }

    // 4. Checkout: /checkout
    if (currentPath === '/checkout') {
      return (
        <main>
          <CheckoutPage
            onBackToCart={() => navigate('/cart')}
            onOrderSuccess={(orderId) => navigate(`/order-confirmation/${orderId}`)}
            onGoToLogin={() => navigate(`/login?redirect=${encodeURIComponent('/checkout')}`)}
            onToast={addToast}
          />
        </main>
      );
    }

    // 5. Order Confirmation: /order-confirmation/:id
    if (currentPath.startsWith('/order-confirmation/')) {
      const orderId = currentPath.replace('/order-confirmation/', '');
      return (
        <main>
          <OrderConfirmationPage
            orderId={orderId}
            onGoToMarketplace={() => navigate('/')}
            onGoToProfile={() => navigate('/profile')}
            onToast={addToast}
          />
        </main>
      );
    }

    // 6. Login: /login
    if (currentPath === '/login') {
      const redirect = searchParams.get('redirect') || '/';
      return (
        <main>
          <LoginPage
            redirectPath={redirect}
            onSuccess={(dest) => navigate(dest || '/')}
            onGoToRegister={() => navigate(`/register?redirect=${encodeURIComponent(redirect)}`)}
            onToast={addToast}
          />
        </main>
      );
    }

    // 7. Register: /register
    if (currentPath === '/register') {
      const redirect = searchParams.get('redirect') || '/';
      return (
        <main>
          <RegisterPage
            redirectPath={redirect}
            onSuccess={(dest) => navigate(dest || '/')}
            onGoToLogin={() => navigate(`/login?redirect=${encodeURIComponent(redirect)}`)}
            onToast={addToast}
          />
        </main>
      );
    }

    // 8. Profile: /profile
    if (currentPath === '/profile') {
      return (
        <main>
          <ProfilePage
            onNavigateToWallets={() => navigate('/wallets')}
            onGoToOrderReceipt={(orderId) => navigate(`/order-confirmation/${orderId}`)}
            onToast={addToast}
          />
        </main>
      );
    }

    // 9. Wallets: /wallets
    if (currentPath === '/wallets') {
      return (
        <main>
          <WalletsPage
            onNavigateToProfile={() => navigate('/profile')}
            onToast={addToast}
          />
        </main>
      );
    }

    // 10. 404 Route
    return (
      <main className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-white font-display">404</h1>
        <p className="text-base text-slate-400">Página não encontrada no marketplace.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold"
        >
          Retornar ao Início
        </button>
      </main>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#130C0A] text-[#FDF2DA] selection:bg-[#D1894B]/30 selection:text-[#FDF2DA] font-mono">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenSimulation={() => setSimulationOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      <div className="flex-1">{renderView()}</div>

      <Footer onNavigate={navigate} />

      {/* Simulator Drawer */}
      <SimulationBar
        isOpen={simulationOpen}
        onClose={() => setSimulationOpen(false)}
        onToast={addToast}
      />

      {/* Auth Modal matching Figma Pages 6 & 7 */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          addToast({
            type: 'success',
            title: 'Autenticado com sucesso!',
            description: 'Você já pode prosseguir com suas operações.',
          });
        }}
        onToast={addToast}
      />

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MarketplaceApp />
    </QueryClientProvider>
  );
}
