// End-to-end checks on the built site (dist/). Run: npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { server } from '../scripts/serve.mjs';

process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS = '1'; // lets context.route() see service worker requests
let BASE = process.env.BASE_URL; // set BASE_URL to test the live site; otherwise dist/ is served on a free port
const local = !BASE;
const VIEWPORTS = { phone: [375, 812], tablet: [768, 1024], laptop: [1366, 768], hd: [1440, 900], fhd: [1920, 1080], qhd: [2560, 1440] };
const PAGES = ['/', '/carte/', '/offline/'];
const axeSource = fs.readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
let browser;

before(async () => {
  if (local) {
    await new Promise(r => server.listen(0, r));
    BASE = `http://localhost:${server.address().port}`;
  }
  browser = await chromium.launch();
});
after(async () => { await browser.close(); if (local && server.listening) server.close(); });

test('menu data is complete and well formed', () => {
  const menu = JSON.parse(fs.readFileSync('src/menu.json', 'utf8'));
  assert.deepEqual(menu.categories.map(c => c.id), ['restaurant', 'tapas', 'boissons', 'desserts', 'enfants']);
  for (const c of menu.categories) for (const g of c.groups) for (const i of g.items) {
    assert.ok(i.name, `${g.title}: item without name`);
    const prices = i.prices ? i.prices.map(p => p[1]) : i.price != null ? [i.price] : [];
    for (const p of prices) assert.ok(typeof p === 'number' && p > 0 && p < 300, `${i.name}: bad price ${p}`);
    for (const t of i.tags || []) assert.ok(menu.tagLabels[t], `${i.name}: unknown tag ${t}`);
  }
});

for (const [name, [w, h]] of Object.entries(VIEWPORTS)) {
  test(`${name} ${w}x${h}: no errors, no horizontal scroll, images load`, async () => {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => m.type() === 'error' && errors.push(m.text()));
    page.on('response', r => r.status() >= 400 && !r.url().endsWith('/favicon.ico') && errors.push(`${r.status()} ${r.url()}`));
    for (const path of PAGES) {
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 0, `${path}: horizontal overflow of ${overflow}px`);
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } });
      await page.waitForLoadState('networkidle');
      const broken = await page.$$eval('img', imgs => imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.currentSrc || i.src));
      assert.deepEqual(broken, [], `${path}: broken images`);
      const bar = await page.$eval('.action-bar', el => getComputedStyle(el).display);
      assert.equal(bar === 'none', w >= 720, `${path}: mobile action bar visibility`);
    }
    assert.deepEqual(errors, []);
    await page.close();
  });
}

test('links: internal targets exist, phone and maps links are right', async () => {
  const page = await browser.newPage();
  const hrefs = new Set();
  for (const path of PAGES) {
    await page.goto(BASE + path);
    for (const h of await page.$$eval('a[href]', as => as.map(a => a.getAttribute('href')))) hrefs.add(path + '|' + h);
  }
  for (const entry of hrefs) {
    const [from, href] = entry.split('|');
    if (href.startsWith('tel:')) { assert.equal(href, 'tel:+3269817320'); continue; }
    if (href.startsWith('http')) {
      assert.match(href, /^https:\/\/(www\.google\.com\/maps\/(search|dir)\/\?api=1&|www\.instagram\.com\/olivia_boire\.et\.manger\/|www\.facebook\.com\/profile\.php\?id=61550775921543)/, href);
      continue;
    }
    const url = new URL(href, BASE + from);
    const res = await page.request.get(url.origin + url.pathname);
    assert.equal(res.status(), 200, `${href} from ${from}`);
    if (url.hash) {
      await page.goto(url.origin + url.pathname);
      assert.ok(await page.$(url.hash), `missing anchor ${href} from ${from}`);
    }
  }
  await page.close();
});

test('menu page: tabs follow the scroll', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + '/carte/');
  await page.click('.cat-nav a[href="#desserts"]');
  await page.waitForFunction(() => document.querySelector('.cat-nav a[href="#desserts"]').getAttribute('aria-current') === 'true', null, { timeout: 5000 });
  await page.close();
});

test('accessibility: no axe violations', async () => {
  // reduced motion: otherwise axe measures contrast mid fade-in
  const page = await browser.newPage({ reducedMotion: 'reduce', bypassCSP: true }); // the site's CSP blocks injected axe
  for (const path of PAGES) {
    await page.goto(BASE + path);
    await page.addScriptTag({ content: axeSource });
    const { violations } = await page.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] }));
    assert.deepEqual(violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(' ')}`), [], path);
  }
  await page.close();
});

test('SEO: titles, descriptions, canonical, structured data', async () => {
  const page = await browser.newPage();
  for (const path of ['/', '/carte/']) {
    await page.goto(BASE + path);
    assert.ok((await page.title()).length > 10);
    assert.ok((await page.getAttribute('meta[name=description]', 'content')).length > 50);
    assert.ok(await page.getAttribute('link[rel=canonical]', 'href'));
    assert.equal(await page.$$eval('h1', h => h.length), 1);
    const ld = await page.$$eval('script[type="application/ld+json"]', s => s.map(x => JSON.parse(x.textContent)['@type']));
    assert.ok(ld.includes('Restaurant'));
  }
  for (const f of ['/robots.txt', '/sitemap.xml', '/img/og-olivia.jpg']) assert.equal((await page.request.get(BASE + f)).status(), 200, f);
  await page.close();
});

test('PWA: manifest, icons, service worker, offline', async () => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  const manifest = await (await page.request.get(BASE + '/manifest.webmanifest')).json();
  assert.equal(manifest.short_name, 'Olivia');
  assert.equal(manifest.display, 'standalone');
  for (const i of manifest.icons) assert.equal((await page.request.get(BASE + i.src)).status(), 200, i.src);
  assert.ok(manifest.icons.some(i => i.purpose === 'maskable'));

  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  assert.ok(await page.evaluate(() => !!navigator.serviceWorker.controller), 'page not controlled by the service worker');

  // setOffline does not cut the service worker's own fetches; routing does (see env flag at the top).
  await ctx.setOffline(true);
  await ctx.route('**/*', r => r.abort('internetdisconnected'));
  await page.goto(BASE + '/carte/');
  assert.equal(await page.textContent('h1'), 'La carte');
  assert.equal(await page.isVisible('.offline-note'), true, 'offline note on the cached menu');
  await page.goto(BASE + '/page-jamais-visitee/');
  assert.match(await page.textContent('h1'), /Pas de réseau/);
  await ctx.close();
});
