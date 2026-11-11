import {
  loadDatabase,
  saveDatabase,
  loadSimulationConfig,
} from './db';
import { NFT, CartItem, CartQuote, Order, Wallet } from '../types';
import { addEth, multiplyEth, parseEth, subtractEth } from '../lib/eth';

export async function handleFallbackApi(
  method: string,
  urlStr: string,
  bodyData?: any
): Promise<{ status: number; data: any }> {
  const url = new URL(urlStr, 'http://localhost:3000');
  const pathname = url.pathname;
  const methodUpper = method.toUpperCase();
  const db = loadDatabase();
  const userKey = db.currentUserId || 'guest';

  // 1. GET /api/nfts
  if (methodUpper === 'GET' && pathname === '/api/nfts') {
    const q = url.searchParams.get('q')?.toLowerCase();
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const sort = url.searchParams.get('sort') || 'recent';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '6', 10);

    let filtered = [...db.nfts];

    if (q) {
      filtered = filtered.filter(
        (nft) =>
          nft.title.toLowerCase().includes(q) ||
          nft.description.toLowerCase().includes(q) ||
          nft.creator.name.toLowerCase().includes(q) ||
          nft.creator.username.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'all') {
      filtered = filtered.filter((nft) => nft.category === category);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((nft) => nft.status === status);
    }

    if (minPrice) {
      filtered = filtered.filter((nft) => parseEth(nft.priceEth) >= parseEth(minPrice));
    }

    if (maxPrice) {
      filtered = filtered.filter((nft) => parseEth(nft.priceEth) <= parseEth(maxPrice));
    }

    if (sort === 'price_asc') {
      filtered.sort((a, b) => (parseEth(a.priceEth) < parseEth(b.priceEth) ? -1 : 1));
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => (parseEth(a.priceEth) > parseEth(b.priceEth) ? -1 : 1));
    } else if (sort === 'rating') {
      filtered.sort((a, b) => (b.rating?.score || 0) - (a.rating?.score || 0));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIdx = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIdx, startIdx + limit);

    return {
      status: 200,
      data: {
        items: paginatedItems,
        total,
        page,
        totalPages,
        limit,
      },
    };
  }

  // 2. GET /api/nfts/:id
  if (methodUpper === 'GET' && pathname.startsWith('/api/nfts/')) {
    const nftId = pathname.replace('/api/nfts/', '');
    const nft = db.nfts.find((n) => n.id === nftId);
    if (!nft) return { status: 404, data: { error: 'NFT não encontrado' } };
    return { status: 200, data: nft };
  }

  // 3. POST /api/favorites/:id
  if (methodUpper === 'POST' && pathname.startsWith('/api/favorites/')) {
    const nftId = pathname.replace('/api/favorites/', '');
    const user = db.users.find((u) => u.id === (db.currentUserId || 'user-alex'));
    let isFavorited = false;

    if (user) {
      user.favorites = user.favorites || [];
      const index = user.favorites.indexOf(nftId);
      if (index > -1) {
        user.favorites.splice(index, 1);
        isFavorited = false;
      } else {
        user.favorites.push(nftId);
        isFavorited = true;
      }
    }

    const nft = db.nfts.find((n) => n.id === nftId);
    if (nft) {
      nft.isFavorited = isFavorited;
      nft.likesCount = Math.max(0, (nft.likesCount || 0) + (isFavorited ? 1 : -1));
    }
    saveDatabase(db);
    return { status: 200, data: { nftId, isFavorited, favorites: user?.favorites || [] } };
  }

  // 4. GET /api/cart
  if (methodUpper === 'GET' && pathname === '/api/cart') {
    const userCart = db.cartByUserId[userKey] || [];
    let subtotalEth = '0.00';
    let subtotalUsd = 0;

    userCart.forEach((item: CartItem) => {
      const lineTotal = multiplyEth(item.nft.priceEth, item.quantity);
      subtotalEth = addEth(subtotalEth, lineTotal);
      subtotalUsd += item.nft.priceUsd * item.quantity;
    });

    const activeCoupon = db.appliedCouponByUserId[userKey] || null;
    let discountEth = '0.00';
    let discountUsd = 0;

    if (activeCoupon) {
      const disc = multiplyEth(subtotalEth, 0.1);
      discountEth = disc;
      discountUsd = Math.round(subtotalUsd * 0.1);
    }

    const gasFeeEth = userCart.length > 0 ? '0.016' : '0.00';
    const gasFeeUsd = userCart.length > 0 ? 51 : 0;
    const discountedSubtotal = subtractEth(subtotalEth, discountEth);
    const totalEth = userCart.length > 0 ? addEth(discountedSubtotal, gasFeeEth) : '0.00';
    const totalUsd = userCart.length > 0 ? subtotalUsd - discountUsd + gasFeeUsd : 0;

    const quote: CartQuote = {
      items: userCart,
      subtotalEth,
      discountEth,
      gasFeeEth,
      totalEth,
      totalUsd,
      couponCode: activeCoupon || undefined,
      couponValid: !!activeCoupon,
      couponDiscountPercent: activeCoupon ? 10 : 0,
    };

    return {
      status: 200,
      data: {
        items: userCart,
        count: userCart.reduce((acc: number, item: CartItem) => acc + item.quantity, 0),
        quote,
      },
    };
  }

  // 5. POST /api/cart
  if (methodUpper === 'POST' && pathname === '/api/cart') {
    const { nftId, quantity = 1 } = bodyData || {};
    const nft = db.nfts.find((n) => n.id === nftId);
    if (!nft) return { status: 404, data: { error: 'NFT não encontrado.' } };

    const userCart = db.cartByUserId[userKey] || [];
    const existing = userCart.find((i: CartItem) => i.nftId === nftId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      userCart.push({
        nftId,
        nft,
        quantity,
        selectedEditionNumber: 1,
        priceSnapshotEth: nft.priceEth,
      });
    }
    db.cartByUserId[userKey] = userCart;
    saveDatabase(db);
    return {
      status: 200,
      data: {
        success: true,
        count: userCart.reduce((a: number, b: CartItem) => a + b.quantity, 0),
      },
    };
  }

  // 6. PATCH /api/cart/:nftId
  if (methodUpper === 'PATCH' && pathname.startsWith('/api/cart/')) {
    const nftId = pathname.replace('/api/cart/', '');
    const { quantity } = bodyData || {};
    const userCart = db.cartByUserId[userKey] || [];
    const item = userCart.find((i: CartItem) => i.nftId === nftId);
    if (item && quantity !== undefined) {
      if (quantity <= 0) {
        db.cartByUserId[userKey] = userCart.filter((i: CartItem) => i.nftId !== nftId);
      } else {
        item.quantity = quantity;
      }
      saveDatabase(db);
    }
    return { status: 200, data: { success: true } };
  }

  // 7. DELETE /api/cart/:nftId
  if (methodUpper === 'DELETE' && pathname.startsWith('/api/cart/')) {
    const nftId = pathname.replace('/api/cart/', '');
    if (nftId === 'coupon') {
      delete db.appliedCouponByUserId[userKey];
      saveDatabase(db);
      return { status: 200, data: { success: true } };
    }
    const userCart = db.cartByUserId[userKey] || [];
    db.cartByUserId[userKey] = userCart.filter((i: CartItem) => i.nftId !== nftId);
    saveDatabase(db);
    return { status: 200, data: { success: true } };
  }

  // 8. POST /api/cart/coupon
  if (methodUpper === 'POST' && pathname === '/api/cart/coupon') {
    const code = (bodyData?.code || '').toUpperCase().trim();
    if (code === 'KURIO10' || code === 'VIP10') {
      db.appliedCouponByUserId[userKey] = code;
      saveDatabase(db);
      return { status: 200, data: { success: true, coupon: { code, percentage: 10 } } };
    }
    return { status: 400, data: { error: 'Cupom inválido ou expirado.' } };
  }

  // 9. GET /api/auth/me
  if (methodUpper === 'GET' && pathname === '/api/auth/me') {
    const user = db.users.find((u) => u.id === (db.currentUserId || 'user-alex')) || db.users[0];
    return { status: 200, data: { user, authenticated: db.currentUserId !== null } };
  }

  // 10. POST /api/auth/login
  if (methodUpper === 'POST' && pathname === '/api/auth/login') {
    const { email } = bodyData || {};
    const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase()) || db.users[0];
    db.currentUserId = user.id;
    saveDatabase(db);
    return { status: 200, data: { user, token: `mock-token-${user.id}` } };
  }

  // 11. POST /api/auth/logout
  if (methodUpper === 'POST' && pathname === '/api/auth/logout') {
    db.currentUserId = null;
    saveDatabase(db);
    return { status: 200, data: { success: true } };
  }

  // 12. GET /api/wallets
  if (methodUpper === 'GET' && pathname === '/api/wallets') {
    const user = db.users.find((u) => u.id === (db.currentUserId || 'user-alex')) || db.users[0];
    return { status: 200, data: user.wallets || [] };
  }

  // 13. POST /api/wallets
  if (methodUpper === 'POST' && pathname === '/api/wallets') {
    const user = db.users.find((u) => u.id === (db.currentUserId || 'user-alex')) || db.users[0];
    const newWallet: Wallet = {
      id: `w-${Date.now()}`,
      address: bodyData?.address || '0x71C84013233519890f6b3e7123984594A9fA1B90',
      network: bodyData?.network || 'Ethereum',
      label: bodyData?.label || 'Nova Carteira',
      isPrimary: !!bodyData?.isPrimary,
      isSecondary: !!bodyData?.isSecondary,
      balanceEth: '18.450',
    };
    user.wallets = [...(user.wallets || []), newWallet];
    saveDatabase(db);
    return { status: 200, data: newWallet };
  }

  // 14. GET /api/orders
  if (methodUpper === 'GET' && pathname === '/api/orders') {
    return { status: 200, data: db.orders };
  }

  // 15. GET /api/orders/:id
  if (methodUpper === 'GET' && pathname.startsWith('/api/orders/')) {
    const orderId = pathname.replace('/api/orders/', '');
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) return { status: 404, data: { error: 'Pedido não encontrado.' } };
    return { status: 200, data: order };
  }

  // 16. POST /api/orders
  if (methodUpper === 'POST' && pathname === '/api/orders') {
    const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: orderId,
      transactionHash: `0xA91F${Math.random().toString(16).substring(2, 8).toUpperCase()}E82C`,
      items: (db.cartByUserId[userKey] || []).map((c) => ({
        nftId: c.nftId,
        title: c.nft.title,
        image: c.nft.image,
        quantity: c.quantity,
        unitPriceEth: c.nft.priceEth,
        totalEth: multiplyEth(c.nft.priceEth, c.quantity),
        tokenId: c.nft.tokenId,
      })),
      subtotalEth: bodyData?.subtotalEth || '26.83',
      discountEth: bodyData?.discountEth || '0.00',
      gasFeeEth: '0.016',
      totalEth: bodyData?.totalEth || '26.846',
      totalUsd: 85900,
      walletAddress: bodyData?.walletAddress || '0x71C84013233519890f6b3e7123984594A9fA1B90',
      network: bodyData?.network || 'Ethereum',
      status: 'confirmed',
      idempotencyKey: bodyData?.idempotencyKey || `key-${Date.now()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      collectorName: bodyData?.collectorName || 'Nova Sato',
      walletProvider: 'MetaMask',
    };
    db.orders.unshift(newOrder);
    db.cartByUserId[userKey] = [];
    saveDatabase(db);
    return { status: 201, data: newOrder };
  }

  // 17. GET /api/simulation
  if (methodUpper === 'GET' && pathname === '/api/simulation') {
    return { status: 200, data: loadSimulationConfig() };
  }

  return { status: 404, data: { error: 'Rota mock não encontrada' } };
}
