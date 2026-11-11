# Kurio — NFT Marketplace

Frontend challenge implementation in React + TypeScript. Backend, auth, wallets and payments are simulated with MSW.

**Stack:** React 19, TanStack Router, TanStack Query, Axios, Socket.IO client, Tailwind CSS v4, MSW (+ `@mswjs/socket.io-binding`), Playwright, Lighthouse CI.

## Setup

```bash
npm install --legacy-peer-deps
npm run dev          # dev server with mocks, http://localhost:3000
npm run build        # production build (mocks are bundled for the demo)
npm run preview      # serve the build on :3000
npm run typecheck    # tsc --noEmit (also used as lint)
npm run test:e2e     # Playwright (builds and serves the app itself)
npm run audit:lighthouse   # needs `npm run build && npm run preview` running
```

Playwright uses the installed Google Chrome (`channel: 'chrome'`); run `npx playwright install chrome` if missing. No environment variables are required.

## Fictitious credentials

| User | E-mail | Password |
| --- | --- | --- |
| 1 | `contato@email.com` | any string with 6+ characters |
| 2 | `alex.collector@crypto.art` | any string with 6+ characters |

Coupon: `KURIO10`.

## Scenarios and reset

Open the simulation console (gear icon in the navbar). It controls latency, forced HTTP errors, offline mode, the `nft.updated` price change, a stale event, the socket drop/reconnect, user switching and a full database reset. State is persisted in `localStorage`; reset restores the seed fixtures.

## Docs

Architecture, contracts, cache policy, realtime reconciliation and known limitations: [ARCHITECTURE.md](ARCHITECTURE.md).

## Deploy

`vercel.json` rewrites every route to `index.html` so direct access and refresh work.
