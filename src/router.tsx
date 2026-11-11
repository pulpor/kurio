import { useCallback, useEffect, useMemo, useState, createContext, useContext } from 'react';
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
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
import { NFTQueryParams, useNFTs } from './hooks/useNFTs';
import { Category, SaleStatus, SortOption } from './types';

type ToastInput = { type: 'success' | 'error' | 'info'; title: string; description?: string };
const ToastContext = createContext<(t: ToastInput) => void>(() => {});
const useToast = () => useContext(ToastContext);

function useGo() {
  const navigate = useNavigate();
  return useCallback(
    (to: string) => {
      navigate({ href: to });
      window.scrollTo({ top: 0 });
    },
    [navigate]
  );
}

const hasToken = () => !!localStorage.getItem('kurio_auth_token');

function requireAuth({ location }: { location: { href: string } }) {
  if (!hasToken()) throw redirect({ to: '/login', search: { redirect: location.href } });
}

function Layout() {
  const go = useGo();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { recentAlert, dismissAlert } = useRealtimeSync();

  const addToast = useCallback((toast: ToastInput) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  useEffect(() => {
    const onExpired = () => {
      addToast({ type: 'error', title: 'Sessão expirada', description: 'Faça login novamente para continuar.' });
      localStorage.removeItem('kurio_auth_token');
      go(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    };
    window.addEventListener('kurio:session_expired', onExpired);
    return () => window.removeEventListener('kurio:session_expired', onExpired);
  }, [addToast, go]);

  useEffect(() => {
    if (!recentAlert) return;
    addToast({ type: 'info', title: 'Atualização em tempo real', description: recentAlert.message });
    dismissAlert();
  }, [recentAlert, addToast, dismissAlert]);

  const bare = ['/profile', '/wallets', '/login', '/register'].includes(pathname) || pathname.startsWith('/order-confirmation');

  return (
    <ToastContext.Provider value={addToast}>
      <div className="min-h-screen flex flex-col bg-ink text-cream selection:bg-brand/30 selection:text-cream font-mono">
        <Navbar
          currentPath={pathname}
          onNavigate={go}
          onOpenSimulation={() => setSimulationOpen(true)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />
        <div className={`flex-1 ${['/', '/profile', '/wallets'].includes(pathname) ? 'max-md:pb-28' : ''}`}>
          <main>
            <Outlet />
          </main>
        </div>
        {!bare && <Footer onNavigate={go} />}
        <SimulationBar isOpen={simulationOpen} onClose={() => setSimulationOpen(false)} onToast={addToast} />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            setAuthModalOpen(false);
            addToast({ type: 'success', title: 'Autenticado com sucesso!' });
          }}
          onToast={addToast}
        />
        <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      </div>
    </ToastContext.Provider>
  );
}

type CatalogSearch = {
  q?: string;
  category?: Category;
  status?: SaleStatus;
  minPrice?: string;
  maxPrice?: string;
  sort?: SortOption;
  page?: number;
};

const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);

function HomePage() {
  const go = useGo();
  const toast = useToast();
  const navigate = useNavigate({ from: '/' });
  const search = indexRoute.useSearch();
  const featured = useNFTs({ limit: 1 }).data?.items[0];

  const queryParams: NFTQueryParams = useMemo(
    () => ({
      q: search.q,
      category: search.category ?? 'all',
      status: search.status ?? 'all',
      minPrice: search.minPrice,
      maxPrice: search.maxPrice,
      sort: search.sort ?? 'recent',
      page: search.page ?? 1,
      limit: 9,
    }),
    [search]
  );

  const update = useCallback(
    (next: Partial<NFTQueryParams>) => {
      const filtersChanged = Object.keys(next).some((k) => k !== 'page');
      navigate({
        search: (prev: CatalogSearch) => {
          const merged: Record<string, unknown> = { ...prev, ...next };
          if (filtersChanged && next.page === undefined) merged.page = undefined;
          for (const k of Object.keys(merged)) {
            const v = merged[k];
            if (v === '' || v === 'all' || v === undefined || (k === 'sort' && v === 'recent') || (k === 'page' && v === 1)) {
              delete merged[k];
            }
          }
          return merged as CatalogSearch;
        },
      });
    },
    [navigate]
  );

  return (
    <>
      {featured && (
        <HeroSection
          featuredNft={featured}
          onSelectNft={(id) => go(`/nft/${id}`)}
          onSearch={(q) => update({ q })}
          onNavigateToCatalog={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
        />
      )}
      <CatalogSection
        queryParams={queryParams}
        onUpdateParams={update}
        onResetParams={() => navigate({ search: {} })}
        onSelectNft={(id) => go(`/nft/${id}`)}
        onToast={toast}
      />
    </>
  );
}

function NFTPage() {
  const go = useGo();
  const { nftId } = detailRoute.useParams();
  return (
    <NFTDetailPage
      nftId={nftId}
      onSelectNft={(id) => go(`/nft/${id}`)}
      onBack={() => go('/')}
      onGoToCheckout={() => go('/checkout')}
      onToast={useToast()}
    />
  );
}

function Cart() {
  const go = useGo();
  return (
    <CartPage
      onSelectNft={(id) => go(`/nft/${id}`)}
      onGoToCheckout={() => go('/checkout')}
      onContinueShopping={() => go('/')}
      onToast={useToast()}
    />
  );
}

function Checkout() {
  const go = useGo();
  return (
    <CheckoutPage
      onBackToCart={() => go('/cart')}
      onOrderSuccess={(id) => go(`/order-confirmation/${id}`)}
      onGoToLogin={() => go(`/login?redirect=${encodeURIComponent('/checkout')}`)}
      onToast={useToast()}
    />
  );
}

function Confirmation() {
  const go = useGo();
  const { orderId } = confirmationRoute.useParams();
  return (
    <OrderConfirmationPage
      orderId={orderId}
      onGoToMarketplace={() => go('/')}
      onGoToProfile={() => go('/profile')}
      onToast={useToast()}
    />
  );
}

function Login() {
  const go = useGo();
  const { redirect: dest = '/' } = loginRoute.useSearch();
  return (
    <LoginPage
      redirectPath={dest}
      onSuccess={(to) => go(to || '/')}
      onGoToRegister={() => go(`/register?redirect=${encodeURIComponent(dest)}`)}
      onToast={useToast()}
    />
  );
}

function Register() {
  const go = useGo();
  const { redirect: dest = '/' } = registerRoute.useSearch();
  return (
    <RegisterPage
      redirectPath={dest}
      onSuccess={(to) => go(to || '/')}
      onGoToLogin={() => go(`/login?redirect=${encodeURIComponent(dest)}`)}
      onToast={useToast()}
    />
  );
}

function Profile() {
  const go = useGo();
  return (
    <ProfilePage
      onNavigateToWallets={() => go('/wallets')}
      onGoToOrderReceipt={(id) => go(`/order-confirmation/${id}`)}
      onToast={useToast()}
    />
  );
}

function Wallets() {
  const go = useGo();
  return <WalletsPage onNavigateToProfile={() => go('/profile')} onToast={useToast()} />;
}

function NotFound() {
  const go = useGo();
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
      <h1 className="text-4xl font-extrabold text-white font-display">404</h1>
      <p className="text-base text-slate-400">Página não encontrada no marketplace.</p>
      <button onClick={() => go('/')} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold">
        Retornar ao Início
      </button>
    </div>
  );
}

const authSearch = (s: Record<string, unknown>) => ({ redirect: str(s.redirect) });

const rootRoute = createRootRoute({ component: Layout, notFoundComponent: NotFound });
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
  validateSearch: (s: Record<string, unknown>): CatalogSearch => ({
    q: str(s.q),
    category: str(s.category) as Category | undefined,
    status: str(s.status) as SaleStatus | undefined,
    minPrice: str(s.minPrice) ?? (typeof s.minPrice === 'number' ? String(s.minPrice) : undefined),
    maxPrice: str(s.maxPrice) ?? (typeof s.maxPrice === 'number' ? String(s.maxPrice) : undefined),
    sort: str(s.sort) as SortOption | undefined,
    page: Number(s.page) > 1 ? Math.floor(Number(s.page)) : undefined,
  }),
});
const detailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/nft/$nftId', component: NFTPage });
const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: '/cart', component: Cart });
const checkoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/checkout', component: Checkout, beforeLoad: requireAuth });
const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-confirmation/$orderId',
  component: Confirmation,
  beforeLoad: requireAuth,
});
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: Login, validateSearch: authSearch });
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register', component: Register, validateSearch: authSearch });
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile', component: Profile, beforeLoad: requireAuth });
const walletsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/wallets', component: Wallets, beforeLoad: requireAuth });

const routeTree = rootRoute.addChildren([
  indexRoute,
  detailRoute,
  cartRoute,
  checkoutRoute,
  confirmationRoute,
  loginRoute,
  registerRoute,
  profileRoute,
  walletsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
