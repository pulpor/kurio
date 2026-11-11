import { chromium } from '@playwright/test';

const routes = ['/', '/nft/emerald-ape-042', '/cart', '/login', '/register', '/checkout', '/profile', '/wallets'];
const sizes = [390, 768, 1440];
const b = await chromium.launch({ channel: 'chrome' });
for (const w of sizes) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    for (const r of routes) {
        await p.goto('http://localhost:3000' + r);
        await p.waitForTimeout(1200);
        const o = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, url: location.pathname }));
        console.log(w, r, '->', o.url, o.sw > o.cw ? `OVERFLOW ${o.sw}>${o.cw}` : 'ok');
    }
    await p.close();
}
await b.close();
