# Architecture

## Layout

- `src/router.tsx` — TanStack Router (code-based). The catalog search params (`q`, `category`, `status`, `minPrice`, `maxPrice`, `sort`, `page`) are validated in the `/` route, so filters survive refresh and history navigation. Changing any filter drops `page`. Private routes (`/checkout`, `/order-confirmation/$orderId`, `/profile`, `/wallets`) redirect to `/login?redirect=...` through `beforeLoad`; unknown paths render the 404 component.
- `src/hooks/*` — TanStack Query hooks per resource; `src/lib/api.ts` is the single Axios instance (bearer token, 401 → `kurio:session_expired` event → redirect to login).
- `src/mocks/*` — MSW handlers (`handlers.ts`), seed and persistence (`db.ts`), Socket.IO server (`socketServer.ts`). UI code only talks to `/api/*`.
- `src/components/*` — screens (desktop and mobile variants share one component).

## REST contracts (all under `/api`)

Auth (`/auth/register|login|logout|session`), NFTs (`GET /nfts` with `q, category, status, minPrice, maxPrice, sort, page, limit`; `GET /nfts/:id`), favorites, cart, quote (coupon, fees, totals), orders (`POST /orders` with an idempotency key; same key + same body returns the same order, different body returns 409), profile (data, avatar, password), wallets. Errors: 400/422 validation, 401 invalid session, 403, 404, 409 availability conflict, 5xx transient. ETH amounts are decimal strings.

## Cache policy

`staleTime` 20 s, `gcTime` 10 min, queries retry up to 2 times except on 4xx, mutations never retry. Logout removes private caches. The favorite toggle is optimistic with rollback on failure.

## Realtime

The browser runs the real `socket.io-client` (WebSocket transport). MSW intercepts the WebSocket and `@mswjs/socket.io-binding` speaks the Socket.IO protocol on the mock server side; REST handlers broadcast through it, so REST and events always reflect the same database.

- Events: `nft.updated {nftId, priceEth, priceUsd, availableCount, version}` and `order.updated {orderId, status, version}`.
- The client keeps the last version per resource and drops duplicates and older events; a fresh event invalidates the related queries (catalog, detail, cart, quote, orders) and shows a toast.
- On every (re)connect the client re-subscribes with the current user id and invalidates all queries, reconciling with REST. Order events are delivered only to the subscribed owner.

## Known limitations

- The mock Socket.IO binding does not implement rooms, namespaces or acknowledgements, and sends no ping packets.
- `socket.io-client` captures `WebSocket` at import time, so the app is loaded only after MSW starts (`src/main.tsx`), and a small transport subclass in `src/lib/socket.ts` reads `globalThis.WebSocket` at connect time.
- The mock session lives in a single mock database (one active user per browser profile).
- Components are styled with Tailwind directly; shadcn/ui is not used.
- Google/Facebook buttons are placeholders (toast only).
- Out-of-scope pages (support, editorial) are not implemented.
- Lighthouse reports are not versioned; run `npm run audit:lighthouse` against the preview build to generate them.
