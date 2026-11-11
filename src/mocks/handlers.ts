import { http, HttpResponse, delay } from 'msw';
import {
  loadDatabase,
  saveDatabase,
  loadSimulationConfig,
  MockDatabaseState,
} from './db';
import { NFT, CartItem, CartQuote, Order, Wallet } from '../types';
import { addEth, formatEth, multiplyEth, parseEth, subtractEth, formatUsd } from '../lib/eth';
import { broadcast } from './socketServer';

// Helper to simulate configured latency and forced errors
async function handleSimulationCheck(endpointName: string): Promise<Response | null> {
  const config = loadSimulationConfig();
  if (config.networkOffline) {
    return HttpResponse.error();
  }

  if (config.latencyMs > 0) {
    await delay(config.latencyMs);
  }

  // Allow bypassing forced errors for simulation config endpoints or reset
  if (config.forcedErrorStatus && !endpointName.includes('simulation')) {
    const status = config.forcedErrorStatus;
    return HttpResponse.json(
      {
        error: `Simulação ativa de falha HTTP ${status}`,
        code: `ERR_SIMULATED_${status}`,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }

  return null;
}

export const handlers = [
  // ----------------------------------------------------
  // AUTH & SESSION
  // ----------------------------------------------------
  http.post('/api/auth/login', async ({ request }) => {
    const sim = await handleSimulationCheck('auth/login');
    if (sim) return sim;

    const body = (await request.json()) as any;
    const { email, password } = body;
    const db = loadDatabase();

    const user = db.users.find(
      (u) => u.email.toLowerCase() === (email || '').toLowerCase()
    );

    if (!user) {
      return HttpResponse.json(
        { error: 'Credenciais inválidas. Verifique o email informado.' },
        { status: 401 }
      );
    }

    // Fictional password check (we accept password with length >= 6)
    if (!password || password.length < 6) {
      return HttpResponse.json(
        { error: 'Senha incorreta. Deve possuir no mínimo 6 caracteres.' },
        { status: 401 }
      );
    }

    db.currentUserId = user.id;

    // Transfer guest cart items to the user if guest had items
    const guestCart = db.cartByUserId['guest'] || [];
    if (guestCart.length > 0) {
      const userCart = db.cartByUserId[user.id] || [];
      guestCart.forEach((guestItem) => {
        const existing = userCart.find((i) => i.nftId === guestItem.nftId);
        if (existing) {
          existing.quantity += guestItem.quantity;
        } else {
          userCart.push(guestItem);
        }
      });
      db.cartByUserId[user.id] = userCart;
      db.cartByUserId['guest'] = [];
    }

    saveDatabase(db);

    return HttpResponse.json({
      user,
      token: `mock-jwt-token-for-${user.id}`,
    });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const sim = await handleSimulationCheck('auth/register');
    if (sim) return sim;

    const body = (await request.json()) as any;
    const { name, username, email, password } = body;

    if (!name || !username || !email || !password) {
      return HttpResponse.json(
        { error: 'Todos os campos são obrigatórios para o cadastro.' },
        { status: 400 }
      );
    }

    const db = loadDatabase();
    const existingEmail = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existingEmail) {
      return HttpResponse.json(
        { error: 'Este endereço de email já está cadastrado em outra conta.' },
        { status: 409 }
      );
    }

    const existingUsername = db.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (existingUsername) {
      return HttpResponse.json(
        { error: 'Este nome de usuário (@handle) já está em uso.' },
        { status: 409 }
      );
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      username: username.replace('@', ''),
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      bio: 'Colecionador de NFTs na Kurio.',
      wallets: [
        {
          id: `w-${Date.now()}`,
          address: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          label: 'Carteira Padrão',
          network: 'Ethereum' as const,
          isPrimary: true,
          isSecondary: false,
          balanceEth: '5.000',
        },
      ],
      favorites: [],
    };

    db.users.push(newUser);
    db.currentUserId = newUser.id;
    db.cartByUserId[newUser.id] = db.cartByUserId['guest'] || [];
    db.cartByUserId['guest'] = [];
    saveDatabase(db);

    return HttpResponse.json({
      user: newUser,
      token: `mock-jwt-token-for-${newUser.id}`,
    }, { status: 201 });
  }),

  http.get('/api/auth/session', async () => {
    const sim = await handleSimulationCheck('auth/session');
    if (sim) return sim;

    const db = loadDatabase();
    if (!db.currentUserId) {
      return HttpResponse.json({ user: null });
    }

    const user = db.users.find((u) => u.id === db.currentUserId);
    if (!user) {
      db.currentUserId = null;
      saveDatabase(db);
      return HttpResponse.json({ user: null });
    }

    return HttpResponse.json({ user });
  }),

  http.post('/api/auth/logout', async () => {
    const sim = await handleSimulationCheck('auth/logout');
    if (sim) return sim;

    const db = loadDatabase();
    db.currentUserId = null;
    saveDatabase(db);

    return HttpResponse.json({ success: true });
  }),

  http.post('/api/auth/switch-user', async ({ request }) => {
    const body = (await request.json()) as any;
    const { userId } = body;
    const db = loadDatabase();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return HttpResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    db.currentUserId = user.id;
    saveDatabase(db);
    return HttpResponse.json({ user });
  }),

  // ----------------------------------------------------
  // NFTS CATALOG & DETAIL
  // ----------------------------------------------------
  http.get('/api/nfts', async ({ request }) => {
    const sim = await handleSimulationCheck('nfts');
    if (sim) return sim;

    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').toLowerCase().trim();
    const category = url.searchParams.get('category') || 'all';
    const status = url.searchParams.get('status') || 'all';
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const sort = url.searchParams.get('sort') || 'recent';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '6', 10);

    const db = loadDatabase();
    const currentUser = db.users.find((u) => u.id === db.currentUserId);
    const userFavorites = new Set(currentUser?.favorites || []);

    let results = db.nfts.map((nft) => ({
      ...nft,
      isFavorited: userFavorites.has(nft.id),
    }));

    // Text search (Title, Creator name/username, Category)
    if (q) {
      results = results.filter(
        (nft) =>
          nft.title.toLowerCase().includes(q) ||
          nft.creator.name.toLowerCase().includes(q) ||
          nft.creator.username.toLowerCase().includes(q) ||
          nft.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category !== 'all') {
      results = results.filter((nft) => nft.category === category);
    }

    // Status filter (buy_now vs auction)
    if (status !== 'all') {
      results = results.filter((nft) => nft.status === status);
    }

    // Min price filter
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      results = results.filter((nft) => parseEth(nft.priceEth) >= parseFloat(minPrice));
    }

    // Max price filter
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      results = results.filter((nft) => parseEth(nft.priceEth) <= parseFloat(maxPrice));
    }

    // Sorting
    results.sort((a, b) => {
      if (sort === 'price_asc') {
        return parseEth(a.priceEth) - parseEth(b.priceEth);
      }
      if (sort === 'price_desc') {
        return parseEth(b.priceEth) - parseEth(a.priceEth);
      }
      if (sort === 'popular') {
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      }
      // 'recent'
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = results.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIdx = (safePage - 1) * limit;
    const paginatedItems = results.slice(startIdx, startIdx + limit);

    return HttpResponse.json({
      items: paginatedItems,
      total,
      page: safePage,
      totalPages,
      limit,
    });
  }),

  http.get('/api/nfts/:id', async ({ params }) => {
    const sim = await handleSimulationCheck(`nfts/${params.id}`);
    if (sim) return sim;

    const { id } = params;
    const db = loadDatabase();
    const nft = db.nfts.find((n) => n.id === id);

    if (!nft) {
      return HttpResponse.json(
        { error: `NFT com identificador "${id}" não foi encontrado no marketplace.` },
        { status: 404 }
      );
    }

    const currentUser = db.users.find((u) => u.id === db.currentUserId);
    const isFavorited = (currentUser?.favorites || []).includes(nft.id);

    return HttpResponse.json({
      ...nft,
      isFavorited,
    });
  }),

  // ----------------------------------------------------
  // FAVORITES
  // ----------------------------------------------------
  http.get('/api/favorites', async () => {
    const sim = await handleSimulationCheck('favorites');
    if (sim) return sim;

    const db = loadDatabase();
    if (!db.currentUserId) {
      return HttpResponse.json({ error: 'Acesso restrito. Faça login para ver seus favoritos.' }, { status: 401 });
    }

    const user = db.users.find((u) => u.id === db.currentUserId);
    return HttpResponse.json({ favorites: user?.favorites || [] });
  }),

  http.post('/api/favorites/:id', async ({ params }) => {
    const sim = await handleSimulationCheck(`favorites/${params.id}`);
    if (sim) return sim;

    const { id } = params as { id: string };
    const db = loadDatabase();
    if (!db.currentUserId) {
      return HttpResponse.json(
        { error: 'Você precisa estar autenticado para favoritar um NFT.' },
        { status: 401 }
      );
    }

    const user = db.users.find((u) => u.id === db.currentUserId);
    if (!user) {
      return HttpResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const exists = user.favorites.includes(id);
    if (exists) {
      user.favorites = user.favorites.filter((favId) => favId !== id);
    } else {
      user.favorites.push(id);
    }

    saveDatabase(db);

    return HttpResponse.json({
      nftId: id,
      favorited: !exists,
      totalFavorites: user.favorites.length,
    });
  }),

  // ----------------------------------------------------
  // CART & QUOTE
  // ----------------------------------------------------
  http.get('/api/cart', async () => {
    const sim = await handleSimulationCheck('cart');
    if (sim) return sim;

    const db = loadDatabase();
    const cartOwnerKey = db.currentUserId || 'guest';
    const items = db.cartByUserId[cartOwnerKey] || [];

    // Re-attach latest fresh NFT details to cart items
    const enrichedItems: CartItem[] = items.map((item) => {
      const freshNft = db.nfts.find((n) => n.id === item.nftId) || item.nft;
      return {
        ...item,
        nft: freshNft,
      };
    });

    return HttpResponse.json({
      items: enrichedItems,
      count: enrichedItems.reduce((acc, item) => acc + item.quantity, 0),
    });
  }),

  http.post('/api/cart/items', async ({ request }) => {
    const sim = await handleSimulationCheck('cart/items');
    if (sim) return sim;

    const body = (await request.json()) as any;
    const { nftId, quantity = 1 } = body;

    const db = loadDatabase();
    const nft = db.nfts.find((n) => n.id === nftId);

    if (!nft) {
      return HttpResponse.json({ error: 'NFT não encontrado para adicionar ao carrinho.' }, { status: 404 });
    }

    if (nft.availableCount <= 0) {
      return HttpResponse.json(
        { error: 'Esta edição do NFT encontra-se esgotada e não pode ser adicionada.' },
        { status: 409 }
      );
    }

    const cartOwnerKey = db.currentUserId || 'guest';
    const cart = db.cartByUserId[cartOwnerKey] || [];
    const existingIndex = cart.findIndex((item) => item.nftId === nftId);

    const currentQtyInCart = existingIndex >= 0 ? cart[existingIndex].quantity : 0;
    const requestedTotal = currentQtyInCart + quantity;

    if (requestedTotal > nft.availableCount) {
      return HttpResponse.json(
        {
          error: `Limite de estoque excedido. Restam apenas ${nft.availableCount} unidade(s) disponíveis desta edição.`,
        },
        { status: 409 }
      );
    }

    if (existingIndex >= 0) {
      cart[existingIndex].quantity = requestedTotal;
      cart[existingIndex].priceSnapshotEth = nft.priceEth;
    } else {
      cart.push({
        nftId: nft.id,
        nft,
        quantity,
        selectedEditionNumber: nft.edition.current + 1,
        priceSnapshotEth: nft.priceEth,
      });
    }

    db.cartByUserId[cartOwnerKey] = cart;
    saveDatabase(db);

    return HttpResponse.json({
      items: cart,
      count: cart.reduce((acc, item) => acc + item.quantity, 0),
    });
  }),

  http.put('/api/cart/items/:nftId', async ({ params, request }) => {
    const sim = await handleSimulationCheck(`cart/items/${params.nftId}`);
    if (sim) return sim;

    const { nftId } = params as { nftId: string };
    const body = (await request.json()) as any;
    const { quantity } = body;

    const db = loadDatabase();
    const cartOwnerKey = db.currentUserId || 'guest';
    let cart = db.cartByUserId[cartOwnerKey] || [];

    if (quantity <= 0) {
      cart = cart.filter((i) => i.nftId !== nftId);
      db.cartByUserId[cartOwnerKey] = cart;
      saveDatabase(db);
      return HttpResponse.json({ items: cart });
    }

    const nft = db.nfts.find((n) => n.id === nftId);
    if (!nft) {
      return HttpResponse.json({ error: 'NFT não encontrado.' }, { status: 404 });
    }

    if (quantity > nft.availableCount) {
      return HttpResponse.json(
        { error: `Quantidade solicitada (${quantity}) excede a disponibilidade restante (${nft.availableCount}).` },
        { status: 409 }
      );
    }

    const item = cart.find((i) => i.nftId === nftId);
    if (item) {
      item.quantity = quantity;
    }

    db.cartByUserId[cartOwnerKey] = cart;
    saveDatabase(db);

    return HttpResponse.json({ items: cart });
  }),

  http.delete('/api/cart/items/:nftId', async ({ params }) => {
    const sim = await handleSimulationCheck(`cart/items/${params.nftId}`);
    if (sim) return sim;

    const { nftId } = params as { nftId: string };
    const db = loadDatabase();
    const cartOwnerKey = db.currentUserId || 'guest';
    let cart = db.cartByUserId[cartOwnerKey] || [];

    cart = cart.filter((i) => i.nftId !== nftId);
    db.cartByUserId[cartOwnerKey] = cart;
    saveDatabase(db);

    return HttpResponse.json({ items: cart });
  }),

  http.post('/api/cart/quote', async ({ request }) => {
    const sim = await handleSimulationCheck('cart/quote');
    if (sim) return sim;

    const body = (await request.json()) as any;
    const { couponCode } = body;

    const db = loadDatabase();
    const cartOwnerKey = db.currentUserId || 'guest';
    const cart = db.cartByUserId[cartOwnerKey] || [];

    // Calculate subtotal with precision decimal strings
    let subtotalEth = '0.000';
    let priceChangesDetected = false;

    const enrichedItems: CartItem[] = cart.map((item) => {
      const fresh = db.nfts.find((n) => n.id === item.nftId) || item.nft;
      if (fresh.priceEth !== item.priceSnapshotEth) {
        priceChangesDetected = true;
      }
      const itemSub = multiplyEth(fresh.priceEth, item.quantity);
      subtotalEth = addEth(subtotalEth, itemSub);

      return {
        ...item,
        nft: fresh,
      };
    });

    // Handle coupon verification
    let discountPercent = 0;
    let couponValid = false;
    let couponError = null;

    if (couponCode) {
      const normalizedCoupon = couponCode.trim().toUpperCase();
      if (normalizedCoupon === 'KURIO10') {
        discountPercent = 10;
        couponValid = true;
      } else if (normalizedCoupon === 'CRYPTO25') {
        discountPercent = 25;
        couponValid = true;
      } else if (normalizedCoupon === 'EXPIRED50') {
        return HttpResponse.json(
          { error: 'Cupom de desconto EXPIRED50 expirou em 01/10/2026.' },
          { status: 400 }
        );
      } else {
        return HttpResponse.json(
          { error: `Cupom "${couponCode}" não é válido ou já atingiu o limite de utilizações.` },
          { status: 400 }
        );
      }
    }

    const discountEth = discountPercent > 0
      ? formatEth((parseEth(subtotalEth) * discountPercent) / 100)
      : '0.000';

    const gasFeeEth = cart.length > 0 ? '0.006' : '0.000';
    const discountedSubtotal = subtractEth(subtotalEth, discountEth);
    const totalEth = addEth(discountedSubtotal, gasFeeEth);
    const totalUsd = Math.round(parseEth(totalEth) * 3200);

    const quote: CartQuote = {
      items: enrichedItems,
      subtotalEth,
      discountEth,
      gasFeeEth,
      totalEth,
      totalUsd,
      couponCode: couponValid ? couponCode : undefined,
      couponValid,
      couponDiscountPercent: discountPercent,
      priceChangesDetected,
      message: priceChangesDetected
        ? 'Aviso: Houve atualização de cotação em tempo real para itens do seu carrinho.'
        : undefined,
    };

    return HttpResponse.json(quote);
  }),

  // ----------------------------------------------------
  // ORDERS (WITH IDEMPOTENCY KEY)
  // ----------------------------------------------------
  http.post('/api/orders', async ({ request }) => {
    const sim = await handleSimulationCheck('orders');
    if (sim) return sim;

    const config = loadSimulationConfig();
    if (config.simulateOrderTimeout) {
      // Simulate timeout
      await delay(4000);
      return HttpResponse.json(
        { error: 'Gateway timeout simulado. Verifique o estado do pedido usando a mesma chave de idempotência.' },
        { status: 504 }
      );
    }

    const idempotencyKey = request.headers.get('Idempotency-Key') || request.headers.get('idempotency-key');
    if (!idempotencyKey) {
      return HttpResponse.json(
        { error: 'Header obrigatório "Idempotency-Key" ausente na criação do pedido.' },
        { status: 400 }
      );
    }

    const body = (await request.json()) as any;
    const { walletAddress, network = 'Ethereum', couponCode } = body;

    const db = loadDatabase();
    if (!db.currentUserId) {
      return HttpResponse.json(
        { error: 'Sessão expirada ou não autenticada. Faça login para concluir a compra.' },
        { status: 401 }
      );
    }

    // Check if idempotency key already processed
    if (db.idempotentOrders[idempotencyKey]) {
      const existingOrder = db.idempotentOrders[idempotencyKey];
      // If client attempts to reuse key with different wallet, return 409 Conflict
      if (existingOrder.walletAddress !== walletAddress) {
        return HttpResponse.json(
          { error: 'Conflito de idempotência: chave já utilizada com payload divergente.' },
          { status: 409 }
        );
      }
      return HttpResponse.json(existingOrder, { status: 200 });
    }

    const cart = db.cartByUserId[db.currentUserId] || [];
    if (cart.length === 0) {
      return HttpResponse.json(
        { error: 'O carrinho está vazio. Adicione itens antes de finalizar o pedido.' },
        { status: 400 }
      );
    }

    // Pre-flight revalidation: verify each NFT availability and price
    for (const item of cart) {
      const liveNft = db.nfts.find((n) => n.id === item.nftId);
      if (!liveNft || liveNft.availableCount < item.quantity) {
        return HttpResponse.json(
          {
            error: `Conflito de disponibilidade: O NFT "${item.nft.title}" não possui mais unidades suficientes para compra.`,
          },
          { status: 409 }
        );
      }
    }

    // Calculate freeze snapshot
    let subtotalEth = '0.000';
    const orderItems = cart.map((item) => {
      const liveNft = db.nfts.find((n) => n.id === item.nftId)!;
      const lineTotal = multiplyEth(liveNft.priceEth, item.quantity);
      subtotalEth = addEth(subtotalEth, lineTotal);
      return {
        nftId: liveNft.id,
        title: liveNft.title,
        image: liveNft.image,
        quantity: item.quantity,
        unitPriceEth: liveNft.priceEth,
        totalEth: lineTotal,
      };
    });

    const discountPercent = couponCode?.trim().toUpperCase() === 'CRYPTO25'
      ? 25
      : couponCode?.trim().toUpperCase() === 'KURIO10'
      ? 10
      : 0;

    const discountEth = discountPercent > 0
      ? formatEth((parseEth(subtotalEth) * discountPercent) / 100)
      : '0.000';

    const gasFeeEth = '0.006';
    const totalEth = addEth(subtractEth(subtotalEth, discountEth), gasFeeEth);
    const totalUsd = Math.round(parseEth(totalEth) * 3200);

    const randomHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-6)}`,
      transactionHash: randomHash,
      createdAt: new Date().toISOString(),
      items: orderItems,
      subtotalEth,
      discountEth,
      gasFeeEth,
      totalEth,
      totalUsd,
      walletAddress,
      network: network as any,
      status: 'confirmed',
      idempotencyKey,
      version: 1,
    };

    // Decrement NFT inventory
    cart.forEach((item) => {
      const liveNft = db.nfts.find((n) => n.id === item.nftId);
      if (liveNft) {
        liveNft.availableCount = Math.max(0, liveNft.availableCount - item.quantity);
        liveNft.version += 1;
        // Emit Socket.IO nft.updated event
        broadcast('nft.updated', {
          nftId: liveNft.id,
          priceEth: liveNft.priceEth,
          priceUsd: liveNft.priceUsd,
          availableCount: liveNft.availableCount,
          version: liveNft.version,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Clear cart for this user
    db.cartByUserId[db.currentUserId] = [];
    db.orders.unshift(newOrder);
    db.idempotentOrders[idempotencyKey] = newOrder;

    saveDatabase(db);

    // Emit order.updated event over Socket.IO
    const ownerId = db.currentUserId ?? undefined;
    setTimeout(() => {
      broadcast('order.updated', {
        orderId: newOrder.id,
        status: newOrder.status,
        transactionHash: newOrder.transactionHash,
        version: newOrder.version,
        timestamp: new Date().toISOString(),
      }, ownerId);
    }, 100);

    return HttpResponse.json(newOrder, { status: 201 });
  }),

  http.get('/api/orders/:id', async ({ params }) => {
    const sim = await handleSimulationCheck(`orders/${params.id}`);
    if (sim) return sim;

    const { id } = params as { id: string };
    const db = loadDatabase();
    const order = db.orders.find((o) => o.id === id);

    if (!order) {
      return HttpResponse.json({ error: 'Pedido não localizado.' }, { status: 404 });
    }

    return HttpResponse.json(order);
  }),

  http.get('/api/orders', async () => {
    const sim = await handleSimulationCheck('orders');
    if (sim) return sim;

    const db = loadDatabase();
    if (!db.currentUserId) {
      return HttpResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    return HttpResponse.json({ orders: db.orders });
  }),

  // ----------------------------------------------------
  // PROFILE & PASSWORDS
  // ----------------------------------------------------
  http.get('/api/profile', async () => {
    const sim = await handleSimulationCheck('profile');
    if (sim) return sim;

    const db = loadDatabase();
    if (!db.currentUserId) {
      return HttpResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = db.users.find((u) => u.id === db.currentUserId);
    if (!user) {
      return HttpResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    return HttpResponse.json(user);
  }),

  http.put('/api/profile', async ({ request }) => {
    const sim = await handleSimulationCheck('profile');
    if (sim) return sim;

    const body = (await request.json()) as any;
    const { name, bio, username, avatar } = body;

    const db = loadDatabase();
    if (!db.currentUserId) {
      return HttpResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = db.users.find((u) => u.id === db.currentUserId);
    if (!user) {
      return HttpResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    if (username && username !== user.username) {
      const clash = db.users.find((u) => u.username === username && u.id !== user.id);
      if (clash) {
        return HttpResponse.json({ error: 'Nome de usuário já está em uso.' }, { status: 409 });
      }
      user.username = username;
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    saveDatabase(db);
    return HttpResponse.json(user);
  }),

  http.post('/api/profile/change-password', async ({ request }) => {
    const sim = await handleSimulationCheck('profile/change-password');
    if (sim) return sim;

    const body = (await request.json()) as any;
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return HttpResponse.json(
        { error: 'Senha atual e nova senha são obrigatórias.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return HttpResponse.json(
        { error: 'A nova senha deve ter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      message: 'Senha alterada com sucesso! Utilize a nova credencial nos próximos logins.',
    });
  }),

  // ----------------------------------------------------
  // WALLETS
  // ----------------------------------------------------
  http.get('/api/wallets', async () => {
    const sim = await handleSimulationCheck('wallets');
    if (sim) return sim;

    const db = loadDatabase();
    if (!db.currentUserId) {
      return HttpResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = db.users.find((u) => u.id === db.currentUserId);
    return HttpResponse.json({ wallets: user?.wallets || [] });
  }),

  http.post('/api/wallets', async ({ request }) => {
    const sim = await handleSimulationCheck('wallets');
    if (sim) return sim;

    const body = (await request.json()) as any;
    const { address, label, network = 'Ethereum', isPrimary = false, isSecondary = false } = body;

    if (!address || !address.startsWith('0x') || address.length < 10) {
      return HttpResponse.json(
        { error: 'Endereço de carteira inválido. Deve iniciar com "0x" e conter formato hexadecimal.' },
        { status: 400 }
      );
    }

    const db = loadDatabase();
    if (!db.currentUserId) {
      return HttpResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = db.users.find((u) => u.id === db.currentUserId);
    if (!user) return HttpResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    if (isPrimary) {
      user.wallets.forEach((w) => (w.isPrimary = false));
    }
    if (isSecondary) {
      user.wallets.forEach((w) => (w.isSecondary = false));
    }

    const newWallet: Wallet = {
      id: `w-${Date.now()}`,
      address,
      label: label || 'Nova Carteira Web3',
      network,
      isPrimary: isPrimary || user.wallets.length === 0,
      isSecondary: isSecondary,
      balanceEth: '3.500',
    };

    user.wallets.push(newWallet);
    saveDatabase(db);

    return HttpResponse.json(newWallet, { status: 201 });
  }),

  http.put('/api/wallets/:id', async ({ params, request }) => {
    const sim = await handleSimulationCheck(`wallets/${params.id}`);
    if (sim) return sim;

    const { id } = params as { id: string };
    const body = (await request.json()) as any;
    const { label, network, isPrimary, isSecondary } = body;

    const db = loadDatabase();
    if (!db.currentUserId) {
      return HttpResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = db.users.find((u) => u.id === db.currentUserId);
    if (!user) return HttpResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const wallet = user.wallets.find((w) => w.id === id);
    if (!wallet) return HttpResponse.json({ error: 'Carteira não localizada' }, { status: 404 });

    if (isPrimary) {
      user.wallets.forEach((w) => (w.isPrimary = false));
      wallet.isPrimary = true;
    }
    if (isSecondary) {
      user.wallets.forEach((w) => (w.isSecondary = false));
      wallet.isSecondary = true;
    }
    if (label) wallet.label = label;
    if (network) wallet.network = network;

    saveDatabase(db);
    return HttpResponse.json(wallet);
  }),

  http.delete('/api/wallets/:id', async ({ params }) => {
    const sim = await handleSimulationCheck(`wallets/${params.id}`);
    if (sim) return sim;

    const { id } = params as { id: string };
    const db = loadDatabase();
    if (!db.currentUserId) {
      return HttpResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = db.users.find((u) => u.id === db.currentUserId);
    if (!user) return HttpResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    user.wallets = user.wallets.filter((w) => w.id !== id);
    saveDatabase(db);

    return HttpResponse.json({ success: true, remaining: user.wallets.length });
  }),
];
