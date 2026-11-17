// Dev helper: page heights per viewport, to keep an eye on scroll length. Usage: node scripts/heights.mjs [base]
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:4173';
const b = await chromium.launch();
for (const [w, h] of [[375, 812], [1440, 900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  for (const path of ['/', '/carte/', '/carte/#boissons']) {
    await p.goto(base + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(300);
    const r = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, over: document.querySelector('.cat-nav-row') ? document.querySelector('.cat-nav-row').scrollWidth - document.querySelector('.cat-nav-row').clientWidth : 0 }));
    console.log(`${w}px ${path}: ${r.h}px tall (${(r.h / h).toFixed(1)} screens)${r.over > 0 ? `, tabs overflow ${r.over}px` : ''}`);
  }
  await p.close();
}
await b.close();
